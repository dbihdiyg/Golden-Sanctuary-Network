import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { hadarTickets, hadarTicketMessages } from "@workspace/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

const router = Router();
const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

function isAdmin(req: any) {
  return req.headers["x-admin-secret"] === ADMIN_SECRET && ADMIN_SECRET.length > 0;
}

// ─── User: list own tickets ───────────────────────────────────────────────────
router.get("/hadar/tickets", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const tickets = await db
      .select()
      .from(hadarTickets)
      .where(eq(hadarTickets.clerkUserId, userId))
      .orderBy(desc(hadarTickets.updatedAt));
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User: open new ticket ────────────────────────────────────────────────────
router.post("/hadar/tickets", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { subject, message, userEmail, attachmentUrl } = req.body;
    if (!subject || !message) return res.status(400).json({ error: "subject and message required" });

    const [ticket] = await db.insert(hadarTickets).values({
      clerkUserId: userId,
      userEmail: userEmail || "",
      subject,
      status: "open",
      unreadAdmin: 1,
      unreadUser: 0,
    }).returning();

    await db.insert(hadarTicketMessages).values({
      ticketId: ticket.id,
      senderType: "user",
      senderLabel: userEmail || "משתמש",
      message,
      attachmentUrl: attachmentUrl || null,
    });

    res.json(ticket);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User: get ticket + messages ─────────────────────────────────────────────
router.get("/hadar/tickets/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);

    const [ticket] = await db
      .select()
      .from(hadarTickets)
      .where(and(eq(hadarTickets.id, id), eq(hadarTickets.clerkUserId, userId)));
    if (!ticket) return res.status(404).json({ error: "Not found" });

    const messages = await db
      .select()
      .from(hadarTicketMessages)
      .where(eq(hadarTicketMessages.ticketId, id))
      .orderBy(hadarTicketMessages.createdAt);

    // Mark as read by user
    await db.update(hadarTickets)
      .set({ unreadUser: 0 })
      .where(eq(hadarTickets.id, id));

    res.json({ ticket, messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── User: reply to ticket ────────────────────────────────────────────────────
router.post("/hadar/tickets/:id/messages", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);
    const { message, attachmentUrl, userEmail } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const [ticket] = await db
      .select()
      .from(hadarTickets)
      .where(and(eq(hadarTickets.id, id), eq(hadarTickets.clerkUserId, userId)));
    if (!ticket) return res.status(404).json({ error: "Not found" });
    if (ticket.status === "closed") return res.status(400).json({ error: "Ticket is closed" });

    const [msg] = await db.insert(hadarTicketMessages).values({
      ticketId: id,
      senderType: "user",
      senderLabel: userEmail || "משתמש",
      message,
      attachmentUrl: attachmentUrl || null,
    }).returning();

    await db.update(hadarTickets)
      .set({
        updatedAt: new Date(),
        status: "open",
        unreadAdmin: sql`${hadarTickets.unreadAdmin} + 1`,
      })
      .where(eq(hadarTickets.id, id));

    res.json(msg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: list all tickets ──────────────────────────────────────────────────
router.get("/hadar/admin/tickets", async (req: any, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const tickets = await db
      .select()
      .from(hadarTickets)
      .orderBy(desc(hadarTickets.updatedAt));
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: get ticket + messages ────────────────────────────────────────────
router.get("/hadar/admin/tickets/:id", async (req: any, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const id = Number(req.params.id);

    const [ticket] = await db.select().from(hadarTickets).where(eq(hadarTickets.id, id));
    if (!ticket) return res.status(404).json({ error: "Not found" });

    const messages = await db
      .select()
      .from(hadarTicketMessages)
      .where(eq(hadarTicketMessages.ticketId, id))
      .orderBy(hadarTicketMessages.createdAt);

    // Mark as read by admin
    await db.update(hadarTickets)
      .set({ unreadAdmin: 0 })
      .where(eq(hadarTickets.id, id));

    res.json({ ticket, messages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: reply ─────────────────────────────────────────────────────────────
router.post("/hadar/admin/tickets/:id/messages", async (req: any, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const id = Number(req.params.id);
    const { message, attachmentUrl } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const [ticket] = await db.select().from(hadarTickets).where(eq(hadarTickets.id, id));
    if (!ticket) return res.status(404).json({ error: "Not found" });

    const [msg] = await db.insert(hadarTicketMessages).values({
      ticketId: id,
      senderType: "admin",
      senderLabel: "צוות הדר",
      message,
      attachmentUrl: attachmentUrl || null,
    }).returning();

    await db.update(hadarTickets)
      .set({
        updatedAt: new Date(),
        status: "in_progress",
        unreadUser: sql`${hadarTickets.unreadUser} + 1`,
      })
      .where(eq(hadarTickets.id, id));

    res.json(msg);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Admin: update ticket status ─────────────────────────────────────────────
router.patch("/hadar/admin/tickets/:id", async (req: any, res) => {
  try {
    if (!isAdmin(req)) return res.status(403).json({ error: "Forbidden" });
    const id = Number(req.params.id);
    const { status } = req.body;
    if (!["open", "in_progress", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const [updated] = await db.update(hadarTickets)
      .set({ status, updatedAt: new Date() })
      .where(eq(hadarTickets.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
