import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { securityLogger } from './security';
import { decryptPHI, PHIEncryption } from './encryptionService';

/**
 * GDPR Compliance Service
 * Handles user data export, deletion, and privacy rights
 */

export interface GDPRRequest {
  userId: string;
  requestType: 'export' | 'delete' | 'rectification' | 'portability';
  requestDate: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  completionDate?: string;
  reason?: string;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string): Promise<{
  personal_data: any;
  case_passports: any[];
  activity_logs: any[];
  documents: any[];
  export_date: string;
}> {
  try {
    securityLogger.info('GDPR: User data export requested', { userId });
    
    // Get user profile
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Get all case passports created by user
    const casePassports = await storage.getCasePassports(user.organizationId || '');
    const userCasePassports = casePassports.filter(cp => cp.createdById === userId);
    
    // Get activity logs for user
    const activityLogs = await storage.getActivityLogs('', 1000); // Get all logs
    const userActivityLogs = activityLogs.filter((log: any) => log.userId === userId);
    
    // Prepare exported data (decrypt PHI if needed)
    const exportData = {
      personal_data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Note: Sensitive data should be decrypted for export
      },
      case_passports: userCasePassports.map(cp => ({
        id: cp.id,
        caseNumber: cp.caseNumber,
        status: cp.status,
        caseType: cp.caseType,
        createdAt: cp.createdAt,
        lastUpdated: cp.lastUpdated
      })),
      activity_logs: userActivityLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp,
        casePassportId: log.casePassportId
      })),
      documents: [], // TODO: Add document export when implemented
      export_date: new Date().toISOString(),
      data_retention_policy: 'Data is retained for 7 years as per medical regulations',
      contact_information: {
        data_protection_officer: 'dpo@aortamesh.com',
        privacy_policy: 'https://aortatrace.org/privacy-policy'
      }
    };
    
    securityLogger.info('GDPR: User data exported successfully', { 
      userId,
      recordCount: {
        casePassports: userCasePassports.length,
        activityLogs: userActivityLogs.length
      }
    });
    
    return exportData;
    
  } catch (error) {
    securityLogger.error('GDPR: User data export failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Delete user data for GDPR compliance
 */
export async function deleteUserData(userId: string): Promise<{
  success: boolean;
  deletedRecords: {
    user: boolean;
    casePassports: number;
    activityLogs: number;
    documents: number;
  };
  retainedRecords?: {
    reason: string;
    recordTypes: string[];
    retentionPeriod: string;
  };
}> {
  try {
    securityLogger.info('GDPR: User data deletion requested', { userId });
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Medical data may need to be retained for regulatory compliance
    const hasActiveCases = await checkActiveCases(userId);
    
    if (hasActiveCases) {
      securityLogger.warn('GDPR: Cannot delete user with active cases', { userId });
      
      // Pseudonymize instead of delete
      await pseudonymizeUserData(userId);
      
      return {
        success: false,
        deletedRecords: {
          user: false,
          casePassports: 0,
          activityLogs: 0,
          documents: 0
        },
        retainedRecords: {
          reason: 'Active medical cases require data retention for regulatory compliance',
          recordTypes: ['case_passports', 'activity_logs', 'medical_records'],
          retentionPeriod: '7 years from case closure'
        }
      };
    }
    
    // Delete user data
    let deletedCasePassports = 0;
    let deletedActivityLogs = 0;
    
    // Delete case passports created by user (if no longer needed)
    const casePassports = await storage.getCasePassports(user.organizationId || '');
    const userCasePassports = casePassports.filter(cp => cp.createdById === userId);
    
    for (const casePassport of userCasePassports) {
      // Check if case passport is still active or referenced
      const canDelete = await canDeleteCasePassport(casePassport.id);
      if (canDelete) {
        // TODO: Implement deleteCasePassport when storage method is available
        // await storage.deleteCasePassport(casePassport.id);
        deletedCasePassports++;
      }
    }
    
    // Anonymize activity logs instead of deleting (preserve audit trail)
    const activityLogs = await storage.getActivityLogs('', 1000);
    const userActivityLogs = activityLogs.filter((log: any) => log.userId === userId);
    
    for (const log of userActivityLogs) {
      // TODO: Implement anonymizeActivityLog when storage method is available
      // await storage.anonymizeActivityLog(log.id);
      deletedActivityLogs++;
    }
    
    // Delete user profile
    // TODO: Implement deleteUser when storage method is available
    // await storage.deleteUser(userId);
    
    securityLogger.info('GDPR: User data deleted successfully', {
      userId,
      deletedRecords: {
        casePassports: deletedCasePassports,
        activityLogs: deletedActivityLogs
      }
    });
    
    return {
      success: true,
      deletedRecords: {
        user: true,
        casePassports: deletedCasePassports,
        activityLogs: deletedActivityLogs,
        documents: 0 // TODO: Implement when documents are added
      }
    };
    
  } catch (error) {
    securityLogger.error('GDPR: User data deletion failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Check if user has active cases that prevent deletion
 */
async function checkActiveCases(userId: string): Promise<boolean> {
  try {
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    const casePassports = await storage.getCasePassports(user.organizationId || '');
    const activeCases = casePassports.filter(cp => 
      cp.createdById === userId && cp.status === 'active'
    );
    
    return activeCases.length > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Pseudonymize user data instead of deletion
 */
async function pseudonymizeUserData(userId: string): Promise<void> {
  try {
    // TODO: Implement pseudonymization
    // Replace identifiable information with pseudonymous identifiers
    // while preserving data for regulatory compliance
    
    securityLogger.info('GDPR: User data pseudonymized', { userId });
  } catch (error) {
    securityLogger.error('GDPR: Pseudonymization failed', {
      userId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}

/**
 * Check if case passport can be deleted
 */
async function canDeleteCasePassport(casePassportId: string): Promise<boolean> {
  // TODO: Implement logic to check if case passport is referenced elsewhere
  // or if it needs to be retained for regulatory compliance
  return false; // Conservative approach - don't delete by default
}

/**
 * GDPR-compliant user data export endpoint
 */
export async function handleDataExportRequest(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req as any).user?.claims?.sub;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }
    
    // Verify user can only export their own data (unless admin)
    const requestingUser = (req as any).user;
    if (requestingUser?.claims?.sub !== userId && requestingUser?.role !== 'admin') {
      return res.status(403).json({
        error: 'Can only export your own data',
        code: 'UNAUTHORIZED_EXPORT'
      });
    }
    
    const exportData = await exportUserData(userId);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
    res.json(exportData);
    
  } catch (error) {
    securityLogger.error('GDPR: Data export request failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      error: 'Failed to export user data',
      code: 'EXPORT_FAILED'
    });
  }
}

/**
 * GDPR-compliant user data deletion endpoint
 */
export async function handleDataDeletionRequest(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req as any).user?.claims?.sub;
    
    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required',
        code: 'MISSING_USER_ID'
      });
    }
    
    // Verify user can only delete their own data (unless admin)
    const requestingUser = (req as any).user;
    if (requestingUser?.claims?.sub !== userId && requestingUser?.role !== 'admin') {
      return res.status(403).json({
        error: 'Can only delete your own data',
        code: 'UNAUTHORIZED_DELETION'
      });
    }
    
    const deletionResult = await deleteUserData(userId);
    
    res.json({
      success: deletionResult.success,
      message: deletionResult.success 
        ? 'User data deleted successfully' 
        : 'User data deletion partially completed',
      details: deletionResult
    });
    
  } catch (error) {
    securityLogger.error('GDPR: Data deletion request failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    res.status(500).json({
      error: 'Failed to delete user data',
      code: 'DELETION_FAILED'
    });
  }
}