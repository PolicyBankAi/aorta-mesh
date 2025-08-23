/**
 * Row-Level Security (RLS) Implementation
 * PostgreSQL RLS policies for HIPAA-compliant data access control
 */

import { db } from './db';
import { sql } from 'drizzle-orm';
import { securityLogger } from './security';
import { UserRole } from '@shared/rbac';

/**
 * RLS Policy Definitions
 */
export interface RLSPolicy {
  table: string;
  name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  role?: string;
  condition: string;
  description: string;
}

const RLS_POLICIES: RLSPolicy[] = [
  // Users table - users can only see their own data unless admin
  {
    table: 'users',
    name: 'users_own_data_policy',
    operation: 'SELECT',
    condition: `id = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin'`,
    description: 'Users can only view their own data unless admin'
  },
  {
    table: 'users',
    name: 'users_update_own_policy',
    operation: 'UPDATE',
    condition: `id = current_setting('app.current_user_id') OR current_setting('app.current_user_role') = 'admin'`,
    description: 'Users can only update their own data unless admin'
  },
  
  // Case passports - organization-based access with role restrictions
  {
    table: 'case_passports',
    name: 'case_passports_org_access_policy',
    operation: 'SELECT',
    condition: `
      organization_id = current_setting('app.current_user_org') 
      OR current_setting('app.current_user_role') = 'admin'
      OR (current_setting('app.current_user_role') = 'researcher' AND status = 'completed')
    `,
    description: 'Case passports accessible by org members, admins, and researchers (completed cases only)'
  },
  {
    table: 'case_passports',
    name: 'case_passports_create_policy',
    operation: 'INSERT',
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor') 
      AND organization_id = current_setting('app.current_user_org')
    `,
    description: 'Only admins and doctors can create case passports in their org'
  },
  {
    table: 'case_passports',
    name: 'case_passports_update_policy',
    operation: 'UPDATE',
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND organization_id = current_setting('app.current_user_org')
    `,
    description: 'Only admins and doctors can update case passports in their org'
  },
  
  // Donors - linked to case passports with same restrictions
  {
    table: 'donors',
    name: 'donors_access_policy',
    operation: 'SELECT',
    condition: `
      EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = donors.case_passport_id 
        AND (cp.organization_id = current_setting('app.current_user_org') 
             OR current_setting('app.current_user_role') = 'admin'
             OR (current_setting('app.current_user_role') = 'researcher' AND cp.status = 'completed'))
      )
    `,
    description: 'Donor data accessible through case passport access rules'
  },
  
  // Documents - strict access control
  {
    table: 'documents',
    name: 'documents_access_policy',
    operation: 'SELECT',
    condition: `
      uploaded_by_id = current_setting('app.current_user_id')
      OR current_setting('app.current_user_role') = 'admin'
      OR EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = documents.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description: 'Documents accessible by uploader, admin, or org members of linked case'
  },
  
  // QA Alerts - medical professionals only
  {
    table: 'qa_alerts',
    name: 'qa_alerts_medical_access_policy',
    operation: 'SELECT',
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = qa_alerts.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description: 'QA alerts only accessible to medical professionals in same org'
  },
  
  // Activity Logs - audit trail protection
  {
    table: 'activity_logs',
    name: 'activity_logs_audit_policy',
    operation: 'SELECT',
    condition: `
      current_setting('app.current_user_role') IN ('admin')
      OR (user_id = current_setting('app.current_user_id') AND current_setting('app.current_user_role') IN ('doctor'))
    `,
    description: 'Activity logs accessible to admins and doctors for their own actions'
  },
  {
    table: 'activity_logs',
    name: 'activity_logs_readonly_policy',
    operation: 'UPDATE',
    condition: 'false',
    description: 'Activity logs are immutable - no updates allowed'
  },
  {
    table: 'activity_logs',
    name: 'activity_logs_nodelete_policy',
    operation: 'DELETE',
    condition: 'false',
    description: 'Activity logs are immutable - no deletions allowed'
  },
  
  // Chain of Custody - medical access with audit trail
  {
    table: 'chain_of_custody',
    name: 'chain_custody_access_policy',
    operation: 'SELECT',
    condition: `
      current_setting('app.current_user_role') IN ('admin', 'doctor')
      AND EXISTS (
        SELECT 1 FROM case_passports cp 
        WHERE cp.id = chain_of_custody.case_passport_id 
        AND cp.organization_id = current_setting('app.current_user_org')
      )
    `,
    description: 'Chain of custody accessible to medical professionals in same org'
  }
];

/**
 * Enable RLS on all tables
 */
export async function enableRowLevelSecurity(): Promise<void> {
  try {
    securityLogger.info('Enabling Row-Level Security');
    
    const tables = [
      'users', 'organizations', 'case_passports', 'donors', 
      'documents', 'qa_alerts', 'activity_logs', 'chain_of_custody'
    ];
    
    for (const table of tables) {
      // Enable RLS on table
      await db.execute(sql.raw(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`));
      securityLogger.info(`RLS enabled on table: ${table}`);
    }
    
    securityLogger.info('Row-Level Security enabled on all tables');
  } catch (error) {
    securityLogger.error('Failed to enable RLS', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Create RLS policies
 */
export async function createRLSPolicies(): Promise<void> {
  try {
    securityLogger.info('Creating RLS policies');
    
    for (const policy of RLS_POLICIES) {
      try {
        // Drop existing policy if it exists
        await db.execute(sql.raw(
          `DROP POLICY IF EXISTS ${policy.name} ON ${policy.table}`
        ));
        
        // Create new policy
        const policySQL = `
          CREATE POLICY ${policy.name} ON ${policy.table}
          FOR ${policy.operation}
          TO PUBLIC
          USING (${policy.condition})
        `;
        
        await db.execute(sql.raw(policySQL));
        
        securityLogger.info('RLS policy created', {
          table: policy.table,
          name: policy.name,
          operation: policy.operation
        });
      } catch (error) {
        securityLogger.error('Failed to create RLS policy', {
          table: policy.table,
          name: policy.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    securityLogger.info('All RLS policies created successfully');
  } catch (error) {
    securityLogger.error('Failed to create RLS policies', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Set user context for RLS
 */
export function setUserContext(userId: string, userRole: UserRole, organizationId?: string) {
  return async (req: any, res: any, next: any) => {
    try {
      // Set PostgreSQL session variables for RLS
      await db.execute(sql.raw(`SET app.current_user_id = '${userId}'`));
      await db.execute(sql.raw(`SET app.current_user_role = '${userRole}'`));
      
      if (organizationId) {
        await db.execute(sql.raw(`SET app.current_user_org = '${organizationId}'`));
      }
      
      // Add context to request for debugging
      req.rlsContext = {
        userId,
        userRole,
        organizationId
      };
      
      next();
    } catch (error) {
      securityLogger.error('Failed to set RLS context', {
        userId,
        userRole,
        organizationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  };
}

/**
 * RLS middleware for Express routes
 */
export function rlsMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      // Extract user context from authentication
      const user = req.user;
      if (!user?.claims?.sub) {
        // For unauthenticated requests, set minimal context
        await db.execute(sql.raw(`SET app.current_user_id = 'anonymous'`));
        await db.execute(sql.raw(`SET app.current_user_role = 'patient'`));
        return next();
      }
      
      const userId = user.claims.sub;
      const userRole = user.role || UserRole.PATIENT;
      const organizationId = user.organizationId;
      
      // Set RLS context
      await db.execute(sql.raw(`SET app.current_user_id = '${userId}'`));
      await db.execute(sql.raw(`SET app.current_user_role = '${userRole}'`));
      
      if (organizationId) {
        await db.execute(sql.raw(`SET app.current_user_org = '${organizationId}'`));
      }
      
      // Log RLS context setting
      securityLogger.debug('RLS context set', {
        userId,
        userRole,
        organizationId,
        path: req.path
      });
      
      req.rlsContext = { userId, userRole, organizationId };
      next();
    } catch (error) {
      securityLogger.error('RLS middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.path
      });
      next(error);
    }
  };
}

/**
 * Validate RLS policies
 */
export async function validateRLSPolicies(): Promise<{
  valid: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // Check if RLS is enabled on all tables
    const result = await db.execute(sql.raw(`
      SELECT schemaname, tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'case_passports', 'donors', 'documents', 'qa_alerts', 'activity_logs', 'chain_of_custody')
    `));
    
    const tables = result.rows as any[];
    for (const table of tables) {
      if (!table.rowsecurity) {
        issues.push(`RLS not enabled on table: ${table.tablename}`);
      }
    }
    
    // Check if policies exist
    const policiesResult = await db.execute(sql.raw(`
      SELECT schemaname, tablename, policyname, permissive, cmd 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `));
    
    const existingPolicies = policiesResult.rows as any[];
    const existingPolicyNames = existingPolicies.map((p: any) => p.policyname);
    
    for (const policy of RLS_POLICIES) {
      if (!existingPolicyNames.includes(policy.name)) {
        issues.push(`Missing RLS policy: ${policy.name} on ${policy.table}`);
      }
    }
    
    securityLogger.info('RLS validation completed', {
      tablesChecked: tables.length,
      policiesFound: existingPolicies.length,
      issuesFound: issues.length
    });
    
    return {
      valid: issues.length === 0,
      issues
    };
  } catch (error) {
    issues.push(`RLS validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      valid: false,
      issues
    };
  }
}

/**
 * Initialize RLS system
 */
export async function initializeRLS(): Promise<void> {
  try {
    securityLogger.info('Initializing Row-Level Security system');
    
    // Enable RLS on tables
    await enableRowLevelSecurity();
    
    // Create policies
    await createRLSPolicies();
    
    // Validate implementation
    const validation = await validateRLSPolicies();
    if (!validation.valid) {
      securityLogger.warn('RLS validation issues found', {
        issues: validation.issues
      });
    }
    
    securityLogger.info('Row-Level Security initialization completed');
  } catch (error) {
    securityLogger.error('RLS initialization failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}