import { Router, Request, Response } from "express";
import { db } from "./db";
import { consents } from "../shared/schema/consents";
import { eq } from "drizzle-orm";
import { auditLogger, securityLogger } from "./security";

const router = Router();

/**
 * GET /api/consents?user_id=...
 * Retrieve all consent records for a user
 */
router.get(
  "/",
  auditLogger("consents_fetch"),
  async (req: Request, res: Response) => {
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== "string") {
      return res
        .status(400)
        .json({ error: "user_id query parameter required", code: "BAD_REQUEST" });
    }

    try {
      const result = await db
        .select()
        .from(consents)
        .where(eq(consents.user_id, user_id));

      res.json({ success: true, data: result });
    } catch (err) {
      securityLogger.error("Error fetching consents", {
        error: err instanceof Error ? err.message : String(err),
        user_id,
      });
      res.status(500).json({ error: "Failed to fetch consents", code: "SERVER_ERROR" });
    }
  }
);

/**
 * POST /api/consents
 * Record a new consent
 */
router.post(
  "/",
  auditLogger("consent_create"),
  async (req: Request, res: Response) => {
    const { user_id, consent_type } = req.body;

    if (!user_id || !consent_type) {
      return res.status(400).json({
        error: "user_id and consent_type required",
        code: "BAD_REQUEST",
      });
    }

    try {
      const [result] = await db
        .insert(consents)
        .values({
          user_id: String(user_id),
          consent_type: String(consent_type),
        })
        .returning();

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      securityLogger.error("Error recording consent", {
        error: err instanceof Error ? err.message : String(err),
        user_id,
        consent_type,
      });
      res.status(500).json({ error: "Failed to record consent", code: "SERVER_ERROR" });
    }
  }
);

/**
 * DELETE /api/consents/:id
 * Withdraw consent by ID (soft delete: set withdrawn = true)
 */
router.delete(
  "/:id",
  auditLogger("consent_withdraw"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ error: "id parameter required", code: "BAD_REQUEST" });
    }

    try {
      const [result] = await db
        .update(consents)
        .set({ withdrawn: true })
        .where(eq(consents.id, id))
        .returning();

      if (!result) {
        return res.status(404).json({ error: "Consent not found", code: "NOT_FOUND" });
      }

      res.json({ success: true, data: result });
    } catch (err) {
      securityLogger.error("Error withdrawing consent", {
        error: err instanceof Error ? err.message : String(err),
        id,
      });
      res.status(500).json({ error: "Failed to withdraw consent", code: "SERVER_ERROR" });
    }
  }
);

export default router;
