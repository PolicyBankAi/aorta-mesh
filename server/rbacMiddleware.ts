import { Request, Response, NextFunction } from 'express';
import { UserRole, Permission, checkPermission } from '@shared/rbac';
import { securityLogger } from './security';

// Extended request interface with user context
interface AuthenticatedRequest extends Request {
  user?: {
    claims?: {
      sub: string;
      email?: string;
    };
    role?: UserRole;
    permissions?: Permission[];
  };
}

// RBAC Middleware Factory
export function requirePermission(permission: Permission) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user?.claims?.sub) {
        securityLogger.warn('RBAC: Unauthenticated access attempt', {
          path: req.path,
          method: req.method,
          ip: req.ip,
          permission: permission
        });
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        });
      }

      // Get user role (default to patient if not set)
      const userRole = req.user.role || UserRole.PATIENT;
      
      // Check if user has the required permission
      if (!checkPermission(userRole, permission)) {
        securityLogger.warn('RBAC: Insufficient permissions', {
          userId: req.user.claims.sub,
          userEmail: req.user.claims.email,
          userRole,
          requiredPermission: permission,
          path: req.path,
          method: req.method,
          ip: req.ip
        });
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          required: permission,
          userRole 
        });
      }

      // Log successful authorization
      securityLogger.info('RBAC: Permission granted', {
        userId: req.user.claims.sub,
        userRole,
        permission,
        path: req.path,
        method: req.method
      });

      next();
    } catch (error) {
      securityLogger.error('RBAC: Authorization check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path,
        method: req.method,
        ip: req.ip
      });
      
      return res.status(500).json({ 
        error: 'Authorization check failed',
        code: 'INTERNAL_ERROR' 
      });
    }
  };
}

// Multi-role permission check (user needs ANY of the specified roles)
export function requireAnyRole(...roles: UserRole[]) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.claims?.sub) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'UNAUTHORIZED' 
        });
      }

      const userRole = req.user.role || UserRole.PATIENT;
      
      if (!roles.includes(userRole)) {
        securityLogger.warn('RBAC: Role access denied', {
          userId: req.user.claims.sub,
          userRole,
          requiredRoles: roles,
          path: req.path
        });
        
        return res.status(403).json({ 
          error: 'Role access denied',
          code: 'FORBIDDEN',
          requiredRoles: roles,
          userRole 
        });
      }

      next();
    } catch (error) {
      securityLogger.error('RBAC: Role check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path
      });
      
      return res.status(500).json({ 
        error: 'Role check failed',
        code: 'INTERNAL_ERROR' 
      });
    }
  };
}

// Admin-only access
export const requireAdmin = requireAnyRole(UserRole.ADMIN);

// Medical professional access (Admin or Doctor)
export const requireMedicalAccess = requireAnyRole(UserRole.ADMIN, UserRole.DOCTOR);

// Data access logging with RBAC context
export function logDataAccessWithRBAC(operation: 'read' | 'write' | 'delete') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.claims?.sub || 'anonymous';
    const userRole = req.user?.role || 'unknown';
    
    securityLogger.info('Data Access with RBAC', {
      userId,
      userRole,
      operation,
      resource: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    next();
  };
}