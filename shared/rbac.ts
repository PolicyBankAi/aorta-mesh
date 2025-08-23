// Role-Based Access Control (RBAC) System for AORTA Mesh

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor', 
  RESEARCHER = 'researcher',
  PATIENT = 'patient'
}

export enum Permission {
  // Case Passport permissions
  VIEW_CASE_PASSPORTS = 'view_case_passports',
  CREATE_CASE_PASSPORTS = 'create_case_passports',
  EDIT_CASE_PASSPORTS = 'edit_case_passports',
  DELETE_CASE_PASSPORTS = 'delete_case_passports',
  
  // Document permissions
  VIEW_DOCUMENTS = 'view_documents',
  UPLOAD_DOCUMENTS = 'upload_documents',
  DELETE_DOCUMENTS = 'delete_documents',
  
  // QA permissions
  VIEW_QA_ALERTS = 'view_qa_alerts',
  CREATE_QA_ALERTS = 'create_qa_alerts',
  RESOLVE_QA_ALERTS = 'resolve_qa_alerts',
  
  // Chain of Custody permissions
  VIEW_CHAIN_OF_CUSTODY = 'view_chain_of_custody',
  UPDATE_CHAIN_OF_CUSTODY = 'update_chain_of_custody',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  SYSTEM_CONFIGURATION = 'system_configuration',
  
  // Research permissions
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics'
}

// Role-Permission mapping
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access to everything
    Permission.VIEW_CASE_PASSPORTS,
    Permission.CREATE_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.DELETE_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.RESOLVE_QA_ALERTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.SYSTEM_CONFIGURATION,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.DOCTOR]: [
    // Medical professionals - full clinical access
    Permission.VIEW_CASE_PASSPORTS,
    Permission.CREATE_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.RESOLVE_QA_ALERTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.RESEARCHER]: [
    // Researchers - read access + analytics
    Permission.VIEW_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_QA_ALERTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.EXPORT_DATA,
    Permission.VIEW_ANALYTICS
  ],
  
  [UserRole.PATIENT]: [
    // Patients - limited access to their own data
    Permission.VIEW_CASE_PASSPORTS, // Only their own
    Permission.VIEW_DOCUMENTS,      // Only their own
    Permission.VIEW_CHAIN_OF_CUSTODY // Only their own
  ]
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Middleware type for role checking
export interface RoleMiddleware {
  (requiredPermission: Permission): (req: any, res: any, next: any) => void;
}

// Check if user has required permission based on their role
export function checkPermission(userRole: UserRole, requiredPermission: Permission): boolean {
  return hasPermission(userRole, requiredPermission);
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

// Multi-Factor Authentication requirements
export interface MFAConfig {
  enabled: boolean;
  requiredForRoles: UserRole[];
  methods: ('totp' | 'sms' | 'email')[];
}

export const mfaConfig: MFAConfig = {
  enabled: true,
  requiredForRoles: [UserRole.ADMIN, UserRole.DOCTOR],
  methods: ['totp', 'sms', 'email']
};