// Role-Based Access Control (RBAC) System for AORTA Mesh
// Updated for Organ & Tissue Traceability workflows

// -------------------------
// User Roles
// -------------------------
export enum UserRole {
  ADMIN = "admin",
  OPO_COORDINATOR = "opo_coordinator",
  RECOVERY_COORDINATOR = "recovery_coordinator",
  TRIAGE_COORDINATOR = "triage_coordinator",
  SURGEON = "surgeon",
  QUALITY_STAFF = "quality_staff",
  LAB_STAFF = "lab_staff",
  COURIER = "courier",
}

// -------------------------
// Permissions
// -------------------------
export enum Permission {
  // Case Passport
  VIEW_CASE_PASSPORTS = "view_case_passports",
  CREATE_CASE_PASSPORTS = "create_case_passports",
  EDIT_CASE_PASSPORTS = "edit_case_passports",
  CLOSE_CASE_PASSPORTS = "close_case_passports",

  // Documents & Lab
  VIEW_DOCUMENTS = "view_documents",
  UPLOAD_DOCUMENTS = "upload_documents",
  DELETE_DOCUMENTS = "delete_documents",
  UPLOAD_LAB_RESULTS = "upload_lab_results",
  VIEW_LAB_RESULTS = "view_lab_results",

  // QA / Compliance
  VIEW_QA_ALERTS = "view_qa_alerts",
  CREATE_QA_ALERTS = "create_qa_alerts",
  RESOLVE_QA_ALERTS = "resolve_qa_alerts",
  APPROVE_FOUR_EYES = "approve_four_eyes",

  // Chain of Custody
  VIEW_CHAIN_OF_CUSTODY = "view_chain_of_custody",
  UPDATE_CHAIN_OF_CUSTODY = "update_chain_of_custody",

  // Admin / System
  MANAGE_USERS = "manage_users",
  VIEW_AUDIT_LOGS = "view_audit_logs",
  SYSTEM_CONFIGURATION = "system_configuration",
  MANAGE_CONNECTORS = "manage_connectors",
  TENANT_MANAGEMENT = "tenant_management",
}

// -------------------------
// Role → Permissions Mapping
// -------------------------
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_CASE_PASSPORTS,
    Permission.CREATE_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.CLOSE_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.DELETE_DOCUMENTS,
    Permission.UPLOAD_LAB_RESULTS,
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.RESOLVE_QA_ALERTS,
    Permission.APPROVE_FOUR_EYES,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
    Permission.MANAGE_USERS,
    Permission.VIEW_AUDIT_LOGS,
    Permission.SYSTEM_CONFIGURATION,
    Permission.MANAGE_CONNECTORS,
    Permission.TENANT_MANAGEMENT,
  ],

  [UserRole.OPO_COORDINATOR]: [
    Permission.VIEW_CASE_PASSPORTS,
    Permission.CREATE_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
  ],

  [UserRole.RECOVERY_COORDINATOR]: [
    Permission.VIEW_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
  ],

  [UserRole.TRIAGE_COORDINATOR]: [
    Permission.VIEW_CASE_PASSPORTS,
    Permission.EDIT_CASE_PASSPORTS,
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
  ],

  [UserRole.SURGEON]: [
    Permission.VIEW_CASE_PASSPORTS,
    Permission.CLOSE_CASE_PASSPORTS,
    Permission.VIEW_DOCUMENTS,
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.APPROVE_FOUR_EYES,
  ],

  [UserRole.QUALITY_STAFF]: [
    Permission.VIEW_QA_ALERTS,
    Permission.CREATE_QA_ALERTS,
    Permission.RESOLVE_QA_ALERTS,
    Permission.APPROVE_FOUR_EYES,
    Permission.VIEW_AUDIT_LOGS,
  ],

  [UserRole.LAB_STAFF]: [
    Permission.UPLOAD_LAB_RESULTS,
    Permission.VIEW_LAB_RESULTS,
    Permission.VIEW_DOCUMENTS,
    Permission.UPLOAD_DOCUMENTS,
    Permission.VIEW_CASE_PASSPORTS,
  ],

  [UserRole.COURIER]: [
    Permission.VIEW_CHAIN_OF_CUSTODY,
    Permission.UPDATE_CHAIN_OF_CUSTODY,
  ],
};

// -------------------------
// RBAC Utility Functions
// -------------------------

/** Check if a role has a specific permission */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

/** Middleware type for role checking */
export interface RoleMiddleware {
  (requiredPermission: Permission): (req: any, res: any, next: any) => void;
}

/** Check if user has required permission based on role */
export function checkPermission(
  userRole: UserRole,
  requiredPermission: Permission
): boolean {
  return hasPermission(userRole, requiredPermission);
}

/** Get all permissions for a role */
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] || [];
}

// -------------------------
// MFA Configuration
// -------------------------
export interface MFAConfig {
  enabled: boolean;
  requiredForRoles: UserRole[];
  methods: ("totp" | "sms" | "email")[];
}

export const mfaConfig: MFAConfig = {
  enabled: true,
  requiredForRoles: [UserRole.ADMIN, UserRole.SURGEON, UserRole.OPO_COORDINATOR],
  methods: ["totp", "sms", "email"],
};

