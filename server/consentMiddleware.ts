import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { consents } from "../shared/schema/consents";
import { eq, and } from "drizzle-orm";
import { securityLogger } from "./security";

/**
 * Extend Express Request type to include authenticated user
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role?: string;
  };
}

/**
 * Middleware to enforce explicit consent before accessing a route
 * @param consentType - The type of consent required (e.g., "research", "data_sharing")
 */
export const requireConsent = (consentType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const userId: string | undefined =
        req.user?.id || (req.body?.user_id as string) || (req.query?.user_id as string);

      if (!userId) {
        securityLogger.warn("❌ Missing user ID in requireConsent", {
          path: req.path,
          consentType,
        });
        return res.status(401).json({ code: "NO_USER_ID", error: "User ID required" });
      }

      const result = await db
        .select()
        .from(consents)
        .where(
          and(
            eq(consents.user_id, userId),
            eq(consents.consent_type, consentType),
            eq(consents.withdrawn, false)
          )
        )
        .limit(1);

      if (!result || result.length === 0) {
        securityLogger.info("❌ Consent not found or withdrawn", {
          userId,
          path: req.path,
          consentType,
        });
        return res.status(403).json({
          code: "CONSENT_REQUIRED",
          error: `Consent required: ${consentType}`,
        });
      }

      securityLogger.info("✅ Consent validated", {
        userId,
        path: req.path,
        consentType,
      });

      next();
    } catch (err) {
      securityLogger.error("❌ Error in requireConsent middleware", {
        path: req.path,
        consentType,
        error: err instanceof Error ? err.message : String(err),
      });

      return res.status(500).json({
        code: "CONSENT_CHECK_FAILED",
        error: "Internal server error while checking consent",
      });
    }
  };
};
