import winston from 'winston';
import type { Request, Response, NextFunction } from 'express';

// Security audit logger
export const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'aorta-mesh-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/security-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security-audit.log' }),
    ...(process.env.NODE_ENV !== 'production' ? [new winston.transports.Console()] : [])
  ],
});

export function setupSecurityLogger() {
  return securityLogger;
}

// Audit logging middleware
export function auditLogger(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const userId = user?.claims?.sub || 'anonymous';
    const userEmail = user?.claims?.email || 'unknown';
    
    securityLogger.info('User Action', {
      action,
      userId,
      userEmail,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      body: action.includes('sensitive') ? '[REDACTED]' : req.body
    });
    
    next();
  };
}

// Authentication attempt logging
export function logAuthAttempt(req: Request, success: boolean, reason?: string) {
  securityLogger.info('Authentication Attempt', {
    success,
    reason,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    path: req.path
  });
}

// File upload logging
export function logFileUpload(req: Request, filename: string, size: number) {
  const user = (req as any).user;
  const userId = user?.claims?.sub || 'anonymous';
  
  securityLogger.info('File Upload', {
    userId,
    filename,
    size,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
}

// PHI access logging - HIPAA compliance
export function logPhiAccess(req: Request, resourceType: string, resourceId: string, action: string, granted: boolean = true) {
  const user = (req as any).user;
  const userId = user?.claims?.sub || 'anonymous';
  
  securityLogger.info('PHI Access', {
    userId,
    resourceType,
    resourceId,
    action,
    accessGranted: granted,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.sessionID,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
}

// Data access logging
export function logDataAccess(req: Request, resource: string, operation: 'read' | 'write' | 'delete' | 'list') {
  const user = (req as any).user;
  const userId = user?.claims?.sub || 'anonymous';
  
  securityLogger.info('Data Access', {
    userId,
    resource,
    operation,
    ip: req.ip,
    timestamp: new Date().toISOString(),
    path: req.path
  });
}