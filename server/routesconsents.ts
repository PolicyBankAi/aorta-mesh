import { Router, Request, Response } from "express";
import { db } from "./db";
import { consents } from "../shared/schema/consents";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/consents?user_id=...
 */
router.get("/", async (req: Request, res: Response) => {
  const { user_id } = req.query;

  if (!user_id || typeof user_id !== "string") {
    return res.status(400).json({ error: "user_id query parameter required" });
  }

  try {
    const result = await db
      .select()
      .from(consents)
      .where(eq(consents.user_id, user_id));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching consents:", err);
    res.status(500).json({ error: "Failed to fetch consents" });
  }
});

/**
 * POST /api/consents
 */
router.post("/", async (req: Request, res: Response) => {
  const { user_id, consent_type } = req.body;

  if (!user_id || !consent_type) {
    return res.status(400).json({ error: "user_id and consent_type required" });
  }

  try {
    const [result] = await db
      .insert(consents)
      .values({
        user_id: String(user_id),
        consent_type: String(consent_type),
      })
      .returning();

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error recording consent:", err);
    res.status(500).json({ error: "Failed to record consent" });
  }
});

/**
 * DELETE /api/consents/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "id parameter required" });
  }

  try {
    const [result] = await db
      .update(consents)
      .set({ withdrawn: true })
      .where(eq(consents.id, String(id)))
      .returning();

    if (!result) {
      return res.status(404).json({ error: "Consent not found" });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error withdrawing consent:", err);
    res.status(500).json({ error: "Failed to withdraw consent" });
  }
});

export default router;
