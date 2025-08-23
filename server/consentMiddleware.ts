import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { consents } from "../shared/schema/consents";
import { eq, and } from "drizzle-orm";

/**
 * Middleware to enforce explicit consent before accessing a route
 */
export const requireConsent = (consentType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId: string | undefined =
        (req as any).user?.id || req.body.user_id || req.query.user_id;

      if (!userId) {
        return res.status(401).json({ error: "User ID required" });
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
        return res
          .status(403)
          .json({ error: `Consent required: ${consentType}` });
      }

      next();
    } catch (err) {
      console.error("Error in requireConsent middleware:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};
