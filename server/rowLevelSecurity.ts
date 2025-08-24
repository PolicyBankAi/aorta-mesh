/**
 * Row-Level Security (RLS) Implementation
 * PostgreSQL RLS policies for HIPAA-compliant data access control
 */

import { db } from "./db";
import { sql } from "drizzle-orm";
import { securityLogger } from "./security";
import { UserRole } from "@shared/rbac";

/**
 * RLS Policy Definitions
 */
export interface RLSPolicy {
  table: string;
  name: string;
  operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE" | "ALL";
  condition: string;
  description: string;
}

const RLS_POLICIES: RLSPolicy[] = [
  // Users table - users can only see/update their own data unless admin
  {
    table: "users",
    name: "users_own_data_policy",
    operation: "SELECT",
    condition: `id = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin'`,
    description: "Users can only view their own data unless admin",
  },
  {
    table: "users",
    name: "users_update_own_policy",
    operation: "UPDATE",
    condition: `id = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin'`,
    description: "Users can only update their own data unless admin",
  },

  // Case passports - org-based access, plus researchers (completed only)
  {
    table: "case_passports",
    name: "case_passports_org_access_policy",
    operation: "SELECT",
    condition: `
      organization_id = current_setting('app.current_user_org') 
      OR current_setting('app.current_user_role') = 'admin'
      OR (current_setting('app.current_user_role') = 'researcher' AND status = 'completed')
    `,
    description:
      "Case passports accessible by org members, admins, and researchers (completed cases only)",
  },
  {
    table: "case_passports",
    name: "case_passports_create_policy",
    operation: "INSERT",
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor') 
      AND organization_id = current_setting('app.current_user_org')
    `,
    description: "Only admins and doctors can create case passports in their org",
  },
  {
    table: "case_passports",
    name: "case_passports_update_policy",
    operation: "UPDATE",
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND organization_id = current_setting('app.current_user_org')
    `,
    description: "Only admins and doctors can update case passports in their org",
  },

  // Donors - enforced via linked case_passports
  {
    table: "donors",
    name: "donors_access_policy",
    operation: "SELECT",
    condition: `
      EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = donors.case_passport_id 
        AND (cp.organization_id = current_setting('app.current_user_org') 
             OR current_setting('app.current_user_role') = 'admin'
             OR (current_setting('app.current_user_role') = 'researcher' AND cp.status = 'completed'))
      )
    `,
    description: "Donor data accessible through case passport access rules",
  },

  // Documents
  {
    table: "documents",
    name: "documents_access_policy",
    operation: "SELECT",
    condition: `
      uploaded_by_id = current_setting('app.current_user_id')
      OR current_setting('app.current_user_role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = documents.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description:
      "Documents accessible by uploader, admin, or org members of linked case",
  },

  // QA Alerts
  {
    table: "qa_alerts",
    name: "qa_alerts_medical_access_policy",
    operation: "SELECT",
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = qa_alerts.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description: "QA alerts only accessible to medical professionals in same org",
  },

  // Activity Logs (immutable audit)
  {
    table: "activity_logs",
    name: "activity_logs_audit_policy",
    operation: "SELECT",
    condition: `
      current_setting('app.current_user_role') = 'admin'
      OR (user_id = current_setting('app.current_user_id') AND current_setting('app.current_user_role') = 'doctor')
    `,
    description: "Activity logs accessible to admins and doctors for their own actions",
  },
  {
    table: "activity_logs",
    name: "activity_logs_readonly_policy",
    operation: "UPDATE",
    condition: "false",
    description: "Activity logs are immutable - no updates allowed",
  },
  {
    table: "activity_logs",
    name: "activity_logs_nodelete_policy",
    operation: "DELETE",
    condition: "false",
    description: "Activity logs are immutable - no deletions allowed",
  },

  // Chain of Custody
  {
    table: "chain_of_custody",
    name: "chain_custody_access_policy",
    operation: "SELECT",
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = chain_of_custody.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description: "Chain of custody accessible to medical professionals in same org",
  },
];

/**
 * Enable RLS
 */
export async function enableRowLevelSecurity(): Promise<void> {
  const tables = [
    "users",
    "organizations",
    "case_passports",
    "donors",
    "documents",
    "qa_alerts",
    "activity_logs",
    "chain_of_custody",
  ];

  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
    securityLogger.info(`✅ RLS enabled`, { table });
  }
}

/**
 * Create RLS policies safely
 */
export async function createRLSPolicies(): Promise<void> {
  for (const policy of RLS_POLICIES) {
    try {
      await db.execute(sql.raw(`DROP POLICY IF EXISTS ${policy.name} ON ${policy.table}`));

      const op = policy.operation === "ALL" ? "ALL" : policy.operation;

      const policySQL = `
        CREATE POLICY ${policy.name} ON ${policy.table}
        FOR ${op}
        TO PUBLIC
        USING (${policy.condition})
      `;

      await db.execute(sql.raw(policySQL));

      securityLogger.info(`✅ RLS policy created`, {
        table: policy.table,
        name: policy.name,
        operation: op,
      });
    } catch (err) {
      securityLogger.error("❌ Failed to create RLS policy", {
        table: policy.table,
        name: policy.name,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

/**
 * Middleware: Set user context
 */
export function rlsMiddleware() {
  return async (req: any, _res: any, next: any) => {
    try {
      const user = req.user;
      const userId = user?.claims?.sub || "anonymous";
      const userRole = user?.role || UserRole.PATIENT;
      const orgId = user?.organizationId || null;

      await db.execute(sql.raw(`SET app.current_user_id = quote_literal('${userId}')`));
      await db.execute(sql.raw(`SET app.current_user_role = quote_literal('${userRole}')`));

      if (orgId) {
        await db.execute(sql.raw(`SET app.current_user_org = quote_literal('${orgId}')`));
      }

      req.rlsContext = { userId, userRole, organizationId: orgId };
      securityLogger.debug("RLS context set", req.rlsContext);

      next();
    } catch (err) {
      securityLogger.error("❌ Failed to set RLS context", {
        error: err instanceof Error ? err.message : String(err),
        path: req.path,
      });
      next(err);
    }
  };
}

/**
 * Validate RLS
 */
export async function validateRLSPolicies() {
  const issues: string[] = [];

  const tables = await db.execute(sql.raw(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public'
  `));

  for (const row of tables.rows as any[]) {
    if (!row.rowsecurity) {
      issues.push(`RLS not enabled on table: ${row.tablename}`);
    }
  }

  const existing = await db.execute(sql.raw(`
    SELECT policyname FROM pg_policies WHERE schemaname = 'public'
  `));

  const existingNames = (existing.rows as any[]).map((p) => p.policyname);

  for (const policy of RLS_POLICIES) {
    if (!existingNames.includes(policy.name)) {
      issues.push(`Missing RLS policy: ${policy.name}`);
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Initialize RLS system
 */
export async function initializeRLS(): Promise<void> {
  securityLogger.info("🚀 Initializing RLS system...");
  await enableRowLevelSecurity();
  await createRLSPolicies();

  const validation = await validateRLSPolicies();
  if (!validation.valid) {
    securityLogger.warn("⚠️ RLS validation issues", { issues: validation.issues });
  }

  securityLogger.info("✅ RLS initialization completed");
}
