import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { getUncachableStripeClient, getStripePublishableKey } from "../stripeClient";
import { db } from "@workspace/db";
import { hadarDesigns, hadarOrders } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

const DESIGN_PRICE_AGOROT = 4900; // ₪49
const CURRENCY = "ils";

router.get("/hadar/stripe/publishable-key", async (_req, res) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/hadar/checkout", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    let { templateId, fieldValues, designName, designId } = req.body;
    const parsedDesignId = designId ? Number(designId) : null;

    console.log(`[HADAR] checkout started: user=${userId} designId=${parsedDesignId} templateId=${templateId}`);

    // If templateId not in body, look it up from the existing saved design
    if (!templateId && parsedDesignId) {
      const [existing] = await db
        .select({ templateId: hadarDesigns.templateId })
        .from(hadarDesigns)
        .where(and(eq(hadarDesigns.id, parsedDesignId), eq(hadarDesigns.clerkUserId, userId)));
      templateId = existing?.templateId;
      console.log(`[HADAR] resolved templateId from design: ${templateId}`);
    }

    if (!templateId) {
      console.error("[HADAR] checkout error: templateId missing");
      return res.status(400).json({ error: "templateId is required" });
    }

    const stripe = await getUncachableStripeClient();
    let savedDesign: { id: number } | null = null;

    if (parsedDesignId) {
      // Update design but only overwrite fieldValues if they were actually sent
      const updateData: Record<string, any> = {
        designName: designName || "עיצוב",
        updatedAt: new Date(),
      };
      if (fieldValues && Object.keys(fieldValues).length > 0) {
        updateData.fieldValues = fieldValues;
      }

      const [existing] = await db
        .update(hadarDesigns)
        .set(updateData)
        .where(and(eq(hadarDesigns.id, parsedDesignId), eq(hadarDesigns.clerkUserId, userId)))
        .returning({ id: hadarDesigns.id });
      savedDesign = existing || null;
      console.log(`[HADAR] updated existing design: ${savedDesign?.id}`);
    }

    if (!savedDesign) {
      const [inserted] = await db
        .insert(hadarDesigns)
        .values({
          clerkUserId: userId,
          templateId,
          fieldValues: fieldValues || {},
          designName: designName || "עיצוב",
          status: "draft",
        })
        .returning({ id: hadarDesigns.id });
      savedDesign = inserted;
      console.log(`[HADAR] created new design: ${savedDesign?.id}`);
    }

    // Derive origin robustly: prefer X-Forwarded headers (Replit proxy), then Origin, then Referer, then host
    const forwardedProto = (req.headers["x-forwarded-proto"] as string || "").split(",")[0].trim();
    const forwardedHost = (req.headers["x-forwarded-host"] as string || "").split(",")[0].trim();
    let origin: string;
    if (forwardedProto && forwardedHost) {
      origin = `${forwardedProto}://${forwardedHost}`;
    } else if (req.headers.origin) {
      origin = req.headers.origin as string;
    } else if (req.headers.referer) {
      try { origin = new URL(req.headers.referer as string).origin; } catch { origin = `${req.protocol}://${req.headers.host}`; }
    } else {
      origin = `${req.protocol}://${req.headers.host}`;
    }
    console.log(`[HADAR DEBUG] checkout origin resolved: ${origin}`);
    const successUrl = `${origin}/design-templates/editor/${templateId}?design=${savedDesign.id}&payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/design-templates/editor/${templateId}?design=${savedDesign.id}&payment=cancelled`;
    console.log(`[HADAR DEBUG] successUrl: ${successUrl}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: `עיצוב הזמנה - ${designName || templateId}`,
              description: "קבצי עיצוב סופיים בפורמטים מלאים לבית דפוס ורשתות חברתיות",
              images: [],
            },
            unit_amount: DESIGN_PRICE_AGOROT,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        clerkUserId: userId,
        designId: String(savedDesign.id),
        templateId,
      },
      locale: "auto",
    });

    await db.update(hadarDesigns)
      .set({ stripeSessionId: session.id })
      .where(eq(hadarDesigns.id, savedDesign.id));

    // Create or upsert the order
    const existingOrder = await db
      .select({ id: hadarOrders.id })
      .from(hadarOrders)
      .where(eq(hadarOrders.designId, savedDesign.id))
      .limit(1);

    if (existingOrder.length === 0) {
      await db.insert(hadarOrders).values({
        clerkUserId: userId,
        designId: savedDesign.id,
        templateId,
        stripeSessionId: session.id,
        amount: DESIGN_PRICE_AGOROT,
        currency: CURRENCY,
        status: "pending",
      });
      console.log(`[HADAR] order created: design=${savedDesign.id}`);
    } else {
      await db.update(hadarOrders)
        .set({ stripeSessionId: session.id, status: "pending" })
        .where(eq(hadarOrders.designId, savedDesign.id));
      console.log(`[HADAR] order updated: design=${savedDesign.id}`);
    }

    console.log(`[HADAR] redirecting to Stripe checkout: design=${savedDesign.id} session=${session.id}`);
    res.json({ url: session.url, designId: savedDesign.id });
  } catch (err: any) {
    console.error("[HADAR] checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/hadar/checkout/verify", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { session_id } = req.query as { session_id: string };

    if (!session_id) return res.status(400).json({ error: "session_id required" });

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.metadata?.clerkUserId !== userId) {
      console.warn(`[HADAR] verify: user mismatch user=${userId} session_user=${session.metadata?.clerkUserId}`);
      return res.status(403).json({ error: "Forbidden" });
    }

    console.log(`[HADAR] verify: session=${session_id} payment_status=${session.payment_status}`);

    if (session.payment_status === "paid") {
      const designId = Number(session.metadata?.designId);
      await db.update(hadarDesigns)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(hadarDesigns.id, designId));

      await db.update(hadarOrders)
        .set({ status: "paid", stripePaymentIntent: session.payment_intent as string })
        .where(eq(hadarOrders.stripeSessionId, session_id));

      console.log(`[HADAR] payment success confirmed: design=${designId}`);
    }

    res.json({ status: session.payment_status, designId: session.metadata?.designId });
  } catch (err: any) {
    console.error("[HADAR] verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook handler — raw body is provided by the app-level middleware at /api/hadar/webhook
router.post("/hadar/webhook", async (req, res) => {
  console.log("[HADAR] webhook received");
  const sig = req.headers["stripe-signature"] as string;
  let event: any;

  try {
    const stripe = await getUncachableStripeClient();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[HADAR] STRIPE_WEBHOOK_SECRET not set — cannot verify webhook");
      return res.status(400).send("Webhook secret not configured");
    }
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err: any) {
    console.error("[HADAR] webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[HADAR] webhook event: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const designId = Number(session.metadata?.designId);

    if (designId) {
      await db.update(hadarDesigns)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(hadarDesigns.id, designId));

      await db.update(hadarOrders)
        .set({ status: "paid", stripePaymentIntent: session.payment_intent })
        .where(eq(hadarOrders.stripeSessionId, session.id));

      console.log(`[HADAR] payment success via webhook: design=${designId} session=${session.id}`);
      console.log(`[HADAR] download unlocked for design=${designId}`);
    }
  }

  res.json({ received: true });
});

export default router;
