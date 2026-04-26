import { Router } from "express";
import { requireAuth } from "@clerk/express";
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
    const userId = req.auth.userId;
    const { templateId, fieldValues, designName, designId } = req.body;

    if (!templateId) {
      return res.status(400).json({ error: "templateId is required" });
    }

    const stripe = await getUncachableStripeClient();

    let savedDesign: { id: number } | null = null;

    if (designId) {
      const [existing] = await db
        .update(hadarDesigns)
        .set({ fieldValues: fieldValues || {}, designName: designName || "עיצוב", updatedAt: new Date() })
        .where(and(eq(hadarDesigns.id, designId), eq(hadarDesigns.clerkUserId, userId)))
        .returning({ id: hadarDesigns.id });
      savedDesign = existing || null;
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
    }

    const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
    const successUrl = `${origin}/design-templates/editor/${templateId}?design=${savedDesign.id}&payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/design-templates/editor/${templateId}?design=${savedDesign.id}&payment=cancelled`;

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

    await db.insert(hadarOrders).values({
      clerkUserId: userId,
      designId: savedDesign.id,
      templateId,
      stripeSessionId: session.id,
      amount: DESIGN_PRICE_AGOROT,
      currency: CURRENCY,
      status: "pending",
    });

    res.json({ url: session.url, designId: savedDesign.id });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/hadar/checkout/verify", requireAuth(), async (req: any, res) => {
  try {
    const userId = req.auth.userId;
    const { session_id } = req.query as { session_id: string };

    if (!session_id) return res.status(400).json({ error: "session_id required" });

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.metadata?.clerkUserId !== userId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (session.payment_status === "paid") {
      const designId = Number(session.metadata?.designId);
      await db.update(hadarDesigns)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(hadarDesigns.id, designId));

      await db.update(hadarOrders)
        .set({ status: "paid", stripePaymentIntent: session.payment_intent as string })
        .where(eq(hadarOrders.stripeSessionId, session_id));
    }

    res.json({ status: session.payment_status, designId: session.metadata?.designId });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook handler — raw body is provided by the app-level middleware at /api/hadar/webhook
router.post("/hadar/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: any;

  try {
    const stripe = await getUncachableStripeClient();
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

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
    }
  }

  res.json({ received: true });
});

export default router;
