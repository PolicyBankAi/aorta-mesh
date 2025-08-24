import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { consents } from "../shared/schema/consents";
import { eq, and } from "drizzle-orm";
import { securityLogger } from "./security";

/**
 * Extended request type to safely handle authenticated users
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id?: string;
    role?: string;
    [key: string]: any;
  };
}

/**
 * Middleware factory to enforce explicit consent before accessing a route
 * @param consentType - Type of consent required (e.g., "gdpr_data_processing")
 */
export const requireConsent = (consentType: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Resolve user ID from multiple possible sources (camelCase in schema)
      const userId: string | undefined =
        req.user?.id || (req.body?.userId as string) || (req.query?.userId as string);

      if (!userId) {
        securityLogger.warn("Consent check failed: missing user ID", {
          path: req.path,
          consentType,
        });
        return res.status(401).json({ error: "User ID required" });
      }

      const result = await db
        .select()
        .from(consents)
        .where(
          and(
            eq(consents.userId, userId),
            eq(consents.consentType, consentType),
            eq(consents.withdrawn, false)
          )
        )
        .limit(1);

      if (!result || result.length === 0) {
        securityLogger.warn("Consent check failed: consent not found", {
          userId,
          path: req.path,
          consentType,
        });
        return res.status(403).json({ error: `Consent required: ${consentType}` });
      }

      // ✅ Consent verified, continue
      next();
    } catch (err) {
      securityLogger.error("Error in requireConsent middleware", {
        path: req.path,
        consentType,
        error: err instanceof Error ? err.message : String(err),
      });
      res.status(500).json({ error: "Internal server error" });
    }
  };
};
