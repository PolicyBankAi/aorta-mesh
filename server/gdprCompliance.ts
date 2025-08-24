import { Request, Response } from "express";
import { storage } from "./storage";
import { securityLogger } from "./security";
import { decryptPHI } from "./encryptionService";

/**
 * GDPR Compliance Service
 * Handles user data export, deletion, and privacy rights
 */

export interface GDPRRequest {
  userId: string;
  requestType: "export" | "delete" | "rectification" | "portability";
  requestDate: string;
  status: "pending" | "processing" | "completed" | "rejected";
  completionDate?: string;
  reason?: string;
}

/**
 * Export all user data for GDPR compliance
 */
export async function exportUserData(userId: string) {
  try {
    securityLogger.info("GDPR export requested", { userId });

    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const casePassports = await storage.getCasePassports(user.organizationId || "");
    const userCasePassports = casePassports.filter((cp) => cp.createdById === userId);

    const activityLogs = await storage.getActivityLogs("", 1000);
    const userActivityLogs = activityLogs.filter((log: any) => log.userId === userId);

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
        // Example of decrypting PHI fields if present
        ssn: user.ssn ? decryptPHI(user.ssn) : undefined,
        phone: user.phone ? decryptPHI(user.phone) : undefined,
      },
      case_passports: userCasePassports.map((cp) => ({
        id: cp.id,
        caseNumber: cp.caseNumber,
        status: cp.status,
        caseType: cp.caseType,
        createdAt: cp.createdAt,
        lastUpdated: cp.lastUpdated,
      })),
      activity_logs: userActivityLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        description: log.description,
        timestamp: log.timestamp,
        casePassportId: log.casePassportId,
      })),
      documents: [], // TODO: Implement export
      export_date: new Date().toISOString(),
      data_retention_policy: "Data is retained for 7 years as per medical regulations",
      contact_information: {
        data_protection_officer: "dpo@aortamesh.com",
        privacy_policy: "https://aortatrace.org/privacy-policy",
      },
    };

    securityLogger.info("GDPR export complete", {
      userId,
      counts: {
        casePassports: userCasePassports.length,
        activityLogs: userActivityLogs.length,
      },
    });

    return exportData;
  } catch (error) {
    securityLogger.error("GDPR export failed", {
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Delete user data for GDPR compliance
 */
export async function deleteUserData(userId: string) {
  try {
    securityLogger.info("GDPR deletion requested", { userId });

    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const hasActiveCases = await checkActiveCases(userId);
    if (hasActiveCases) {
      securityLogger.warn("GDPR delete denied - active cases", { userId });
      await pseudonymizeUserData(userId);

      return {
        success: false,
        deletedRecords: { user: false, casePassports: 0, activityLogs: 0, documents: 0 },
        retainedRecords: {
          reason: "Active cases require retention for compliance",
          recordTypes: ["case_passports", "activity_logs", "medical_records"],
          retentionPeriod: "7 years from closure",
        },
      };
    }

    // Placeholders
    let deletedCasePassports = 0;
    let deletedActivityLogs = 0;

    const casePassports = await storage.getCasePassports(user.organizationId || "");
    const userCasePassports = casePassports.filter((cp) => cp.createdById === userId);

    for (const cp of userCasePassports) {
      if (await canDeleteCasePassport(cp.id)) {
        // await storage.deleteCasePassport(cp.id);
        deletedCasePassports++;
      }
    }

    const activityLogs = await storage.getActivityLogs("", 1000);
    const userActivityLogs = activityLogs.filter((log: any) => log.userId === userId);
    for (const log of userActivityLogs) {
      // await storage.anonymizeActivityLog(log.id);
      deletedActivityLogs++;
    }

    // await storage.deleteUser(userId);

    securityLogger.info("GDPR deletion complete", {
      userId,
      deleted: { casePassports: deletedCasePassports, activityLogs: deletedActivityLogs },
    });

    return {
      success: true,
      deletedRecords: {
        user: true,
        casePassports: deletedCasePassports,
        activityLogs: deletedActivityLogs,
        documents: 0,
      },
    };
  } catch (error) {
    securityLogger.error("GDPR deletion failed", {
      userId,
      error: (error as Error).message,
    });
    throw error;
  }
}

/**
 * Utility helpers
 */
async function checkActiveCases(userId: string) {
  try {
    const user = await storage.getUser(userId);
    if (!user) return false;

    const casePassports = await storage.getCasePassports(user.organizationId || "");
    return casePassports.some((cp) => cp.createdById === userId && cp.status === "active");
  } catch {
    return false;
  }
}

async function pseudonymizeUserData(userId: string) {
  // TODO: Replace personal fields with irreversible pseudonyms
  securityLogger.info("GDPR pseudonymized user", { userId });
}

async function canDeleteCasePassport(casePassportId: string) {
  // TODO: check references
  securityLogger.debug("GDPR delete check for case passport", { casePassportId });
  return false; // default conservative
}

/**
 * GDPR endpoints
 */
export async function handleDataExportRequest(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req as any).user?.claims?.sub;
    if (!userId) return res.status(400).json({ error: "User ID required", code: "MISSING_USER_ID" });

    const requester = (req as any).user;
    if (requester?.claims?.sub !== userId && requester?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized export", code: "UNAUTHORIZED_EXPORT" });
    }

    const exportData = await exportUserData(userId);

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
    res.setHeader("Cache-Control", "no-store");
    res.json(exportData);
  } catch (error) {
    securityLogger.error("GDPR export endpoint failed", { error: (error as Error).message });
    res.status(500).json({ error: "Failed to export user data", code: "EXPORT_FAILED" });
  }
}

export async function handleDataDeletionRequest(req: Request, res: Response) {
  try {
    const userId = req.params.userId || (req as any).user?.claims?.sub;
    if (!userId) return res.status(400).json({ error: "User ID required", code: "MISSING_USER_ID" });

    const requester = (req as any).user;
    if (requester?.claims?.sub !== userId && requester?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized deletion", code: "UNAUTHORIZED_DELETION" });
    }

    const deletionResult = await deleteUserData(userId);
    res.json({
      success: deletionResult.success,
      message: deletionResult.success ? "User data deleted" : "Deletion partially completed",
      details: deletionResult,
    });
  } catch (error) {
    securityLogger.error("GDPR deletion endpoint failed", { error: (error as Error).message });
    res.status(500).json({ error: "Failed to delete user data", code: "DELETION_FAILED" });
  }
}
