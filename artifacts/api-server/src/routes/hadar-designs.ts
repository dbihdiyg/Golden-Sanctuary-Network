import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { hadarDesigns } from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();

router.get("/hadar/designs", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const designs = await db
      .select()
      .from(hadarDesigns)
      .where(eq(hadarDesigns.clerkUserId, userId))
      .orderBy(desc(hadarDesigns.updatedAt));
    res.json(designs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/hadar/designs/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    const [design] = await db
      .select()
      .from(hadarDesigns)
      .where(and(eq(hadarDesigns.id, id), eq(hadarDesigns.clerkUserId, userId)));
    if (!design) return res.status(404).json({ error: "Not found" });
    res.json(design);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hadar/designs", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { templateId, fieldValues, designName } = req.body;
    if (!templateId) return res.status(400).json({ error: "templateId required" });

    const [design] = await db
      .insert(hadarDesigns)
      .values({
        clerkUserId: userId,
        templateId,
        fieldValues: fieldValues || {},
        designName: designName || "עיצוב ללא שם",
        status: "draft",
      })
      .returning();
    res.json(design);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch("/hadar/designs/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    const { fieldValues, designName } = req.body;

    const [updated] = await db
      .update(hadarDesigns)
      .set({ fieldValues, designName, updatedAt: new Date() })
      .where(and(eq(hadarDesigns.id, id), eq(hadarDesigns.clerkUserId, userId)))
      .returning();

    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/hadar/designs/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    await db
      .delete(hadarDesigns)
      .where(and(eq(hadarDesigns.id, id), eq(hadarDesigns.clerkUserId, userId)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
