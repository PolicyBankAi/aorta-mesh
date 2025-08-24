/**
 * Immutable Audit Logging Service
 * Append-only audit logging with cryptographic integrity for healthcare compliance
 * Integration with AWS CloudTrail, Elasticsearch, and WORM storage
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { securityLogger } from "./security";
import { CloudTrailStorage, ElasticsearchWORMStorage } from "./storageBackends";

/**
 * Audit log entry structure
 */
export interface ImmutableAuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  clientIp: string;
  userAgent: string;
  sessionId?: string;

  // Integrity fields
  hash: string;
  previousHash: string;
  signature?: string;

  // Compliance fields
  retentionPeriod: number; // Years
  legalHold: boolean;
  classification: "public" | "internal" | "confidential" | "restricted";
}

/**
 * Chain metadata for verification
 */
interface AuditChain {
  lastHash: string;
  entryCount: number;
  chainStartTime: string;
  lastVerification: string;
}

/**
 * Search query interface
 */
export interface AuditSearchQuery {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  organizationId?: string;
  limit?: number;
}

/**
 * Storage backend contract
 */
export interface AuditStorageBackend {
  append(entry: ImmutableAuditEntry): Promise<void>;
  verify(entries: ImmutableAuditEntry[]): Promise<boolean>;
  search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]>;
  export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]>;
}

/**
 * Scrub sensitive PHI/PII before writing to immutable logs
 */
function scrubSensitiveData(input: any): any {
  if (!input || typeof input !== "object") return input;
  const clone: any = Array.isArray(input) ? [] : { ...input };

  for (const key of Object.keys(input)) {
    const val = input[key];
    if (/ssn|social|mrn|dob|phone|email|address/i.test(key)) {
      clone[key] = "[REDACTED]";
    } else if (typeof val === "object") {
      clone[key] = scrubSensitiveData(val);
    } else {
      clone[key] = val;
    }
  }
  return clone;
}

/**
 * Local file-based WORM storage (development)
 */
class LocalWORMStorage implements AuditStorageBackend {
  private auditDir: string;
  private chainFile: string;

  constructor() {
    this.auditDir = path.join(process.cwd(), "logs", "audit", "immutable");
    this.chainFile = path.join(this.auditDir, "chain.json");
  }

  async ensureAuditDir(): Promise<void> {
    await fs.mkdir(this.auditDir, { recursive: true });
  }

  async append(entry: ImmutableAuditEntry): Promise<void> {
    await this.ensureAuditDir();
    const dateStr = new Date().toISOString().split("T")[0];
    const auditFile = path.join(this.auditDir, `audit-${dateStr}.jsonl`);
    await fs.appendFile(auditFile, JSON.stringify(entry) + "\n");
    await this.updateChain(entry);
  }

  private async updateChain(entry: ImmutableAuditEntry): Promise<void> {
    let chain: AuditChain;
    try {
      const chainData = await fs.readFile(this.chainFile, "utf-8");
      chain = JSON.parse(chainData);
    } catch {
      chain = {
        lastHash: "",
        entryCount: 0,
        chainStartTime: new Date().toISOString(),
        lastVerification: new Date().toISOString(),
      };
    }

    chain.lastHash = entry.hash;
    chain.entryCount++;
    chain.lastVerification = new Date().toISOString();

    await fs.writeFile(this.chainFile, JSON.stringify(chain, null, 2));
  }

  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    if (entries.length === 0) return true;
    let previousHash = "";
    for (const entry of entries) {
      if (entry.previousHash !== previousHash) return false;
      const { hash, signature, ...data } = entry;
      const calc = crypto
        .createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
      if (calc !== entry.hash) return false;
      previousHash = entry.hash;
    }
    return true;
  }

  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    await this.ensureAuditDir();
    const entries: ImmutableAuditEntry[] = [];
    const files = await fs.readdir(this.auditDir);
    const auditFiles = files.filter((f) => f.startsWith("audit-"));

    for (const file of auditFiles) {
      const content = await fs.readFile(path.join(this.auditDir, file), "utf-8");
      for (const line of content.split("\n").filter(Boolean)) {
        const entry: ImmutableAuditEntry = JSON.parse(line);
        if (query.userId && entry.userId !== query.userId) continue;
        if (query.action && entry.action !== query.action) continue;
        if (query.resource && entry.resource !== query.resource) continue;
        if (query.organizationId && entry.organizationId !== query.organizationId) continue;
        if (query.startDate && new Date(entry.timestamp) < query.startDate) continue;
        if (query.endDate && new Date(entry.timestamp) > query.endDate) continue;
        entries.push(entry);
      }
    }

    entries.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return query.limit ? entries.slice(0, query.limit) : entries;
  }

  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return this.search({ startDate, endDate });
  }
}

/**
 * Immutable Audit Logger
 */
export class ImmutableAuditLogger {
  private storage: AuditStorageBackend;
  private signingKey: string;
  private lastHash: string = "";

  constructor(storageType: "local" | "cloudtrail" | "elasticsearch" = "local") {
    switch (storageType) {
      case "cloudtrail":
        this.storage = new CloudTrailStorage();
        break;
      case "elasticsearch":
        this.storage = new ElasticsearchWORMStorage();
        break;
      default:
        this.storage = new LocalWORMStorage();
        break;
    }

    this.signingKey =
      process.env.AUDIT_SIGNING_KEY ||
      crypto.randomBytes(32).toString("hex");
  }

  async log(
    userId: string,
    userRole: string,
    action: string,
    resource: string,
    details: any,
    clientIp: string,
    userAgent: string,
    options: {
      resourceId?: string;
      organizationId?: string;
      sessionId?: string;
      classification?: "public" | "internal" | "confidential" | "restricted";
      retentionPeriod?: number;
      legalHold?: boolean;
    } = {}
  ): Promise<void> {
    const entry: Omit<ImmutableAuditEntry, "hash" | "signature"> = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId,
      userRole,
      organizationId: options.organizationId,
      action,
      resource,
      resourceId: options.resourceId,
      details: scrubSensitiveData(details),
      clientIp,
      userAgent,
      sessionId: options.sessionId,
      previousHash: this.lastHash,
      retentionPeriod: options.retentionPeriod || 7,
      legalHold: options.legalHold || false,
      classification: options.classification || "confidential",
    };

    const entryHash = crypto
      .createHash("sha256")
      .update(JSON.stringify(entry))
      .digest("hex");

    const signature = crypto
      .createHmac("sha256", this.signingKey)
      .update(entryHash)
      .digest("hex");

    const finalEntry: ImmutableAuditEntry = {
      ...entry,
      hash: entryHash,
      signature,
    };

    await this.storage.append(finalEntry);
    this.lastHash = entryHash;
  }

  /**
   * ✅ NEW: search method to support queries
   */
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    return this.storage.search(query);
  }
}

// Global logger
export const immutableAuditLogger = new ImmutableAuditLogger(
  (process.env.AUDIT_STORAGE_BACKEND as any) || "local"
);

/**
 * Express middleware for automatic immutable audit logging
 */
export function immutableAuditMiddleware() {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    res.send = function (this: any, body: any) {
      setImmediate(async () => {
        try {
          const user = req.user;
          const userId = user?.claims?.sub || "anonymous";
          const userRole = user?.role || "unknown";

          await immutableAuditLogger.log(
            userId,
            userRole,
            `${req.method}_${req.path.replace(/\//g, "_")}`.toLowerCase(),
            req.path,
            {
              method: req.method,
              statusCode: res.statusCode,
              requestBody: scrubSensitiveData(req.body),
              queryParams: scrubSensitiveData(req.query),
            },
            req.ip || req.connection?.remoteAddress || "unknown",
            req.get("User-Agent") || "unknown",
            {
              organizationId: user?.organizationId,
              sessionId: req.sessionID,
              classification: req.path.includes("/api/")
                ? "confidential"
                : "internal",
            }
          );
        } catch (error) {
          securityLogger.error("Immutable audit middleware error", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      });
      return originalSend.call(this, body);
    };
    next();
  };
}

/**
 * Special utility for emergency access logging
 */
export function logEmergencyAccess(
  userId: string,
  path: string,
  reason: string
) {
  immutableAuditLogger
    .log(
      userId,
      "emergency",
      "emergency_access",
      path,
      { reason },
      "unknown",
      "unknown",
      {
        classification: "restricted",
        retentionPeriod: 10,
        legalHold: true,
      }
    )
    .catch((err) => {
      securityLogger.error("Failed to log emergency access", {
        userId,
        path,
        reason,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    });
}

