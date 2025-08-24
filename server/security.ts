import winston from "winston";
import fs from "fs";
import path from "path";
import type { Request, Response, NextFunction } from "express";

// Ensure logs directory exists
const logDir = path.resolve("logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Sensitive fields that must never be logged
const SENSITIVE_KEYS = ["password", "token", "ssn", "secret", "access_token", "refresh_token"];

// Utility: redact sensitive fields in body
function redactSensitive(data: any): any {
  if (!data || typeof data !== "object") return data;
  const copy: any = Array.isArray(data) ? [] : {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      copy[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      copy[key] = redactSensitive(value);
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

// Winston logger instance
export const securityLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "aorta-mesh-security" },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, "security-error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "security-audit.log"),
      level: "info",
    }),
    ...(process.env.NODE_ENV !== "production"
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              winston.format.simple()
            ),
          }),
        ]
      : []),
  ],
});

export function setupSecurityLogger() {
  return securityLogger;
}

// Audit logging middleware
export function auditLogger(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userId = user?.claims?.sub || "anonymous";
    const userEmail = user?.claims?.email || "unknown";

    securityLogger.info("User Action", {
      action,
      userId,
      userEmail,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      sessionId: (req as any).sessionID,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      body: redactSensitive(req.body),
    });

    next();
  };
}

// Authentication attempt logging
export function logAuthAttempt(
  req: Request,
  success: boolean,
  reason?: string
) {
  securityLogger.info("Authentication Attempt", {
    success,
    reason,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    sessionId: (req as any).sessionID,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}

// File upload logging
export function logFileUpload(req: Request, filename: string, size: number) {
  const user = (req as any).user;
  const userId = user?.claims?.sub || "anonymous";

  securityLogger.info("File Upload", {
    userId,
    filename,
    size,
    ip: req.ip,
    sessionId: (req as any).sessionID,
    timestamp: new Date().toISOString(),
  });
}

// PHI access logging - HIPAA compliance
export function logPhiAccess(
  req: Request,
  resourceType: string,
  resourceId: string,
  action: string,
  granted: boolean = true
) {
  const user = (req as any).user;
  const userId = user?.claims?.sub || "anonymous";

  securityLogger.info("PHI Access", {
    userId,
    resourceType,
    resourceId,
    action,
    accessGranted: granted,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    sessionId: (req as any).sessionID,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  });
}

// Data access logging
export function logDataAccess(
  req: Request,
  resource: string,
  operation: "read" | "write" | "delete" | "list"
) {
  const user = (req as any).user;
  const userId = user?.claims?.sub || "anonymous";

  securityLogger.info("Data Access", {
    userId,
    resource,
    operation,
    ip: req.ip,
    sessionId: (req as any).sessionID,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
