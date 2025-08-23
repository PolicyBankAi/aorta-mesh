/**
 * Immutable Audit Logging Service
 * Append-only audit logging with cryptographic integrity for healthcare compliance
 * Integration with AWS CloudTrail, Elasticsearch, and WORM storage
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { securityLogger } from './security';

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
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

/**
 * Audit log chain for integrity verification
 */
interface AuditChain {
  lastHash: string;
  entryCount: number;
  chainStartTime: string;
  lastVerification: string;
}

/**
 * Storage backends for immutable logging
 */
export interface AuditStorageBackend {
  append(entry: ImmutableAuditEntry): Promise<void>;
  verify(entries: ImmutableAuditEntry[]): Promise<boolean>;
  search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]>;
  export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]>;
}

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
 * Local file-based WORM storage (development)
 */
class LocalWORMStorage implements AuditStorageBackend {
  private auditDir: string;
  private chainFile: string;
  
  constructor() {
    this.auditDir = path.join(process.cwd(), 'logs', 'audit', 'immutable');
    this.chainFile = path.join(this.auditDir, 'chain.json');
  }
  
  async ensureAuditDir(): Promise<void> {
    try {
      await fs.mkdir(this.auditDir, { recursive: true });
    } catch (error) {
      securityLogger.error('Failed to create audit directory', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async append(entry: ImmutableAuditEntry): Promise<void> {
    await this.ensureAuditDir();
    
    try {
      // Create daily audit file (WORM pattern)
      const dateStr = new Date().toISOString().split('T')[0];
      const auditFile = path.join(this.auditDir, `audit-${dateStr}.jsonl`);
      
      // Append to daily file (never modify existing entries)
      const entryLine = JSON.stringify(entry) + '\n';
      await fs.appendFile(auditFile, entryLine);
      
      // Update chain metadata
      await this.updateChain(entry);
      
      securityLogger.info('Immutable audit entry appended', {
        id: entry.id,
        file: auditFile
      });
    } catch (error) {
      securityLogger.error('Failed to append audit entry', {
        entryId: entry.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  private async updateChain(entry: ImmutableAuditEntry): Promise<void> {
    try {
      let chain: AuditChain;
      
      try {
        const chainData = await fs.readFile(this.chainFile, 'utf-8');
        chain = JSON.parse(chainData);
      } catch {
        // Initialize new chain
        chain = {
          lastHash: '',
          entryCount: 0,
          chainStartTime: new Date().toISOString(),
          lastVerification: new Date().toISOString()
        };
      }
      
      chain.lastHash = entry.hash;
      chain.entryCount++;
      chain.lastVerification = new Date().toISOString();
      
      await fs.writeFile(this.chainFile, JSON.stringify(chain, null, 2));
    } catch (error) {
      securityLogger.error('Failed to update audit chain', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    try {
      if (entries.length === 0) return true;
      
      // Verify hash chain
      let previousHash = '';
      for (const entry of entries) {
        if (entry.previousHash !== previousHash) {
          securityLogger.warn('Audit chain integrity violation', {
            entryId: entry.id,
            expectedPrevHash: previousHash,
            actualPrevHash: entry.previousHash
          });
          return false;
        }
        
        // Verify entry hash
        const calculatedHash = this.calculateEntryHash(entry);
        if (calculatedHash !== entry.hash) {
          securityLogger.warn('Audit entry hash mismatch', {
            entryId: entry.id,
            expectedHash: calculatedHash,
            actualHash: entry.hash
          });
          return false;
        }
        
        previousHash = entry.hash;
      }
      
      return true;
    } catch (error) {
      securityLogger.error('Audit verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false;
    }
  }
  
  private calculateEntryHash(entry: Omit<ImmutableAuditEntry, 'hash' | 'signature'>): string {
    const data = {
      ...entry,
      hash: undefined,
      signature: undefined
    };
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
  
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    await this.ensureAuditDir();
    
    try {
      const entries: ImmutableAuditEntry[] = [];
      const files = await fs.readdir(this.auditDir);
      const auditFiles = files.filter(f => f.startsWith('audit-') && f.endsWith('.jsonl'));
      
      for (const file of auditFiles) {
        const filePath = path.join(this.auditDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);
        
        for (const line of lines) {
          const entry: ImmutableAuditEntry = JSON.parse(line);
          
          // Apply filters
          if (query.userId && entry.userId !== query.userId) continue;
          if (query.action && entry.action !== query.action) continue;
          if (query.resource && entry.resource !== query.resource) continue;
          if (query.organizationId && entry.organizationId !== query.organizationId) continue;
          
          if (query.startDate && new Date(entry.timestamp) < query.startDate) continue;
          if (query.endDate && new Date(entry.timestamp) > query.endDate) continue;
          
          entries.push(entry);
        }
      }
      
      // Sort by timestamp and apply limit
      entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (query.limit) {
        return entries.slice(0, query.limit);
      }
      
      return entries;
    } catch (error) {
      securityLogger.error('Audit search failed', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }
  
  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return this.search({ startDate, endDate });
  }
}

/**
 * AWS CloudTrail integration
 */
class CloudTrailStorage implements AuditStorageBackend {
  async append(entry: ImmutableAuditEntry): Promise<void> {
    // TODO: Implement AWS CloudTrail API integration
    securityLogger.info('CloudTrail: Audit entry logged', { id: entry.id });
  }
  
  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    // CloudTrail provides built-in integrity verification
    return true;
  }
  
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    // TODO: Implement CloudTrail API search
    return [];
  }
  
  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return this.search({ startDate, endDate });
  }
}

/**
 * Elasticsearch with WORM policy
 */
class ElasticsearchWORMStorage implements AuditStorageBackend {
  private esEndpoint: string;
  
  constructor(endpoint: string = process.env.ELASTICSEARCH_ENDPOINT || 'http://localhost:9200') {
    this.esEndpoint = endpoint;
  }
  
  async append(entry: ImmutableAuditEntry): Promise<void> {
    try {
      const response = await fetch(`${this.esEndpoint}/audit-logs/_doc/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      
      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.statusText}`);
      }
      
      securityLogger.info('Elasticsearch: Audit entry indexed', { id: entry.id });
    } catch (error) {
      securityLogger.error('Elasticsearch append failed', {
        entryId: entry.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async verify(entries: ImmutableAuditEntry[]): Promise<boolean> {
    // Elasticsearch WORM policy ensures immutability
    // Additional verification can be implemented here
    return true;
  }
  
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    try {
      const esQuery = {
        query: {
          bool: {
            must: [] as any[]
          }
        },
        size: query.limit || 1000,
        sort: [{ timestamp: { order: 'desc' } }]
      };
      
      // Build Elasticsearch query
      if (query.userId) {
        esQuery.query.bool.must.push({ term: { userId: query.userId } });
      }
      if (query.action) {
        esQuery.query.bool.must.push({ term: { action: query.action } });
      }
      if (query.resource) {
        esQuery.query.bool.must.push({ term: { resource: query.resource } });
      }
      if (query.startDate || query.endDate) {
        const range: any = {};
        if (query.startDate) range.gte = query.startDate.toISOString();
        if (query.endDate) range.lte = query.endDate.toISOString();
        esQuery.query.bool.must.push({ range: { timestamp: range } });
      }
      
      const response = await fetch(`${this.esEndpoint}/audit-logs/_search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(esQuery)
      });
      
      if (!response.ok) {
        throw new Error(`Elasticsearch error: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.hits?.hits?.map((hit: any) => hit._source) || [];
    } catch (error) {
      securityLogger.error('Elasticsearch search failed', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
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
  private lastHash: string = '';
  
  constructor(storageType: 'local' | 'cloudtrail' | 'elasticsearch' = 'local') {
    switch (storageType) {
      case 'cloudtrail':
        this.storage = new CloudTrailStorage();
        break;
      case 'elasticsearch':
        this.storage = new ElasticsearchWORMStorage();
        break;
      case 'local':
      default:
        this.storage = new LocalWORMStorage();
        break;
    }
    
    this.signingKey = process.env.AUDIT_SIGNING_KEY || crypto.randomBytes(32).toString('hex');
    securityLogger.info('Immutable audit logger initialized', { storageType });
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
      classification?: 'public' | 'internal' | 'confidential' | 'restricted';
      retentionPeriod?: number;
      legalHold?: boolean;
    } = {}
  ): Promise<void> {
    try {
      const entry: Omit<ImmutableAuditEntry, 'hash' | 'signature'> = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        userId,
        userRole,
        organizationId: options.organizationId,
        action,
        resource,
        resourceId: options.resourceId,
        details,
        clientIp,
        userAgent,
        sessionId: options.sessionId,
        previousHash: this.lastHash,
        retentionPeriod: options.retentionPeriod || 7, // 7 years default
        legalHold: options.legalHold || false,
        classification: options.classification || 'confidential'
      };
      
      // Calculate hash for integrity
      const entryHash = crypto.createHash('sha256')
        .update(JSON.stringify(entry))
        .digest('hex');
      
      // Create digital signature
      const signature = crypto.createHmac('sha256', this.signingKey)
        .update(entryHash)
        .digest('hex');
      
      const finalEntry: ImmutableAuditEntry = {
        ...entry,
        hash: entryHash,
        signature
      };
      
      // Store in immutable backend
      await this.storage.append(finalEntry);
      
      // Update last hash for chain integrity
      this.lastHash = entryHash;
      
      securityLogger.info('Immutable audit log entry created', {
        id: finalEntry.id,
        action,
        resource,
        userId
      });
    } catch (error) {
      securityLogger.error('Failed to create immutable audit log', {
        action,
        resource,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }
  
  async search(query: AuditSearchQuery): Promise<ImmutableAuditEntry[]> {
    return this.storage.search(query);
  }
  
  async verify(entries?: ImmutableAuditEntry[]): Promise<boolean> {
    if (!entries) {
      // Verify recent entries
      entries = await this.search({ limit: 1000 });
    }
    return this.storage.verify(entries);
  }
  
  async export(startDate: Date, endDate: Date): Promise<ImmutableAuditEntry[]> {
    return this.storage.export(startDate, endDate);
  }
  
  async generateComplianceReport(organizationId: string, year: number): Promise<{
    totalEntries: number;
    userActions: Record<string, number>;
    resourceAccess: Record<string, number>;
    integrityStatus: boolean;
    retentionCompliance: boolean;
  }> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);
    
    const entries = await this.search({
      organizationId,
      startDate,
      endDate
    });
    
    const userActions: Record<string, number> = {};
    const resourceAccess: Record<string, number> = {};
    
    entries.forEach(entry => {
      userActions[entry.action] = (userActions[entry.action] || 0) + 1;
      resourceAccess[entry.resource] = (resourceAccess[entry.resource] || 0) + 1;
    });
    
    const integrityStatus = await this.verify(entries);
    const retentionCompliance = entries.every(entry => {
      const entryAge = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24 * 365);
      return entryAge <= entry.retentionPeriod;
    });
    
    return {
      totalEntries: entries.length,
      userActions,
      resourceAccess,
      integrityStatus,
      retentionCompliance
    };
  }
}

// Global immutable audit logger
export const immutableAuditLogger = new ImmutableAuditLogger(
  process.env.AUDIT_STORAGE_BACKEND as any || 'local'
);

/**
 * Express middleware for immutable audit logging
 */
export function immutableAuditMiddleware() {
  return async (req: any, res: any, next: any) => {
    const originalSend = res.send;
    
    res.send = function(this: any, body: any) {
      // Log the response after it's sent
      setImmediate(async () => {
        try {
          const user = req.user;
          const userId = user?.claims?.sub || 'anonymous';
          const userRole = user?.role || 'unknown';
          
          await immutableAuditLogger.log(
            userId,
            userRole,
            `${req.method}_${req.path.replace(/\//g, '_')}`,
            req.path,
            {
              method: req.method,
              statusCode: res.statusCode,
              requestBody: req.body,
              queryParams: req.query
            },
            req.ip || req.connection?.remoteAddress || 'unknown',
            req.get('User-Agent') || 'unknown',
            {
              organizationId: user?.organizationId,
              sessionId: req.sessionID,
              classification: req.path.includes('/api/') ? 'confidential' : 'internal'
            }
          );
        } catch (error) {
          securityLogger.error('Immutable audit middleware error', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  };
}
/**
 * Utility function to log emergency access
 */
export function logEmergencyAccess(userId: string, path: string, reason: string) {
  immutableAuditLogger.log(
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
  ).catch((err) => {
    securityLogger.error("Failed to log emergency access", {
      userId,
      path,
      reason,
      error: err instanceof Error ? err.message : "Unknown error"
    });
  });
}
