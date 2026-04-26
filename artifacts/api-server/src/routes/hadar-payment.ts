import { Router } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { getUncachableStripeClient } from "../stripeClient";
import { db } from "@workspace/db";
import { hadarPaymentMethods } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// ─── Get or create Stripe customer for user ────────────────────────────────
async function getOrCreateStripeCustomer(stripe: any, clerkUserId: string, email?: string): Promise<string> {
  // Check if we have a saved PM which already has a customer ID
  const [existing] = await db
    .select({ stripeCustomerId: hadarPaymentMethods.stripeCustomerId })
    .from(hadarPaymentMethods)
    .where(eq(hadarPaymentMethods.clerkUserId, clerkUserId));

  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  // Create a new Stripe customer
  const customer = await stripe.customers.create({
    metadata: { clerkUserId },
    ...(email ? { email } : {}),
  });
  return customer.id;
}

// ─── Create SetupIntent ─────────────────────────────────────────────────────
router.post("/hadar/setup-intent", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const stripe = await getUncachableStripeClient();
    const customerId = await getOrCreateStripeCustomer(stripe, userId, req.body.email);

    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });

    res.json({
      clientSecret: setupIntent.client_secret,
      customerId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Save payment method after SetupIntent confirms ─────────────────────────
router.post("/hadar/payment-methods", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { paymentMethodId, customerId } = req.body;
    if (!paymentMethodId || !customerId) {
      return res.status(400).json({ error: "paymentMethodId and customerId required" });
    }

    const stripe = await getUncachableStripeClient();
    const pm = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (!pm.card) return res.status(400).json({ error: "Not a card payment method" });

    // Attach to customer if not already
    if (!pm.customer) {
      await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    }

    // Upsert in DB
    const [saved] = await db
      .insert(hadarPaymentMethods)
      .values({
        clerkUserId: userId,
        stripeCustomerId: customerId,
        stripePaymentMethodId: paymentMethodId,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: true,
      })
      .onConflictDoNothing()
      .returning();

    res.json(saved || { ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── List saved payment methods ─────────────────────────────────────────────
router.get("/hadar/payment-methods", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const methods = await db
      .select()
      .from(hadarPaymentMethods)
      .where(eq(hadarPaymentMethods.clerkUserId, userId));

    res.json(methods);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Delete a saved payment method ──────────────────────────────────────────
router.delete("/hadar/payment-methods/:id", requireAuth(), async (req: any, res) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const id = Number(req.params.id);

    const [pm] = await db
      .select()
      .from(hadarPaymentMethods)
      .where(and(eq(hadarPaymentMethods.id, id), eq(hadarPaymentMethods.clerkUserId, userId)));
    if (!pm) return res.status(404).json({ error: "Not found" });

    const stripe = await getUncachableStripeClient();
    try { await stripe.paymentMethods.detach(pm.stripePaymentMethodId); } catch {}

    await db.delete(hadarPaymentMethods)
      .where(and(eq(hadarPaymentMethods.id, id), eq(hadarPaymentMethods.clerkUserId, userId)));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
