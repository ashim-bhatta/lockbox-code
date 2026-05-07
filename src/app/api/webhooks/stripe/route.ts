import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import Stripe from "stripe";
import { enqueueStripeWebhookEvent } from "@/server/services/webhook-service";

/**
 * POST /api/webhooks/stripe
 * Stripe sends a signed webhook here after a checkout session completes.
 * This is the single source of truth for payment verification.
 *
 * CRITICAL: We must read the raw body for signature verification.
 * Next.js App Router requires explicit raw body handling.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  const queued = await enqueueStripeWebhookEvent(event);
  return NextResponse.json({
    received: true,
    duplicate: queued.duplicate,
  });
}
