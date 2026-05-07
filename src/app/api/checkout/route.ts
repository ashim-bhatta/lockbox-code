import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getStripe } from "@/lib/stripe";
import type { Delivery, CheckoutRequest } from "@/types";
import { createPaymentRecord } from "@/server/repositories/payment-repository";
import { asInteger, asNonEmptyString } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyLockboxPassword } from "@/lib/lockbox-password";
import crypto from "node:crypto";

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function looksLikeEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function buildCheckoutIdempotencyKey(input: {
  deliveryId: string;
  clientEmail: string;
  tipCents: number;
  bucketStartMs: number;
}) {
  const hash = crypto
    .createHash("sha256")
    .update(`${input.deliveryId}|${input.clientEmail}|${input.tipCents}|${input.bucketStartMs}`)
    .digest("hex");
  return `checkout_${hash}`;
}

/**
 * POST /api/checkout
 * Generates a Stripe Checkout session with destination charges (Stripe Connect).
 * Handles the "Buy Me a Coffee" tip as a second line item.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await enforceRateLimit({ key: `checkout:${ip}`, limit: 20, windowSeconds: 60 });
    const body = (await req.json()) as Partial<CheckoutRequest & { password?: string }>;
    const deliveryId = asNonEmptyString(body.delivery_id, "delivery_id", 128);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", deliveryId)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Delivery not found." },
        { status: 404 }
      );
    }

    const delivery = data as Delivery;
    if (delivery.status_reason === "disabled_by_owner") {
      return NextResponse.json(
        { error: "This lockbox is currently disabled by the creator." },
        { status: 400 }
      );
    }

    const usageLimit = typeof delivery.usage_limit === "number" ? delivery.usage_limit : null;
    const purchaseCount = typeof delivery.purchase_count === "number" ? delivery.purchase_count : 0;
    if (usageLimit !== null && purchaseCount >= usageLimit) {
      return NextResponse.json(
        { error: "This lockbox has reached its usage limit." },
        { status: 400 }
      );
    }

    if (delivery.requires_password && delivery.access_password_hash) {
      const attemptedPassword = typeof body.password === "string" ? body.password : "";
      if (!attemptedPassword || !verifyLockboxPassword(attemptedPassword, delivery.access_password_hash)) {
        return NextResponse.json(
          { error: "Incorrect or missing lockbox password." },
          { status: 401 }
        );
      }
    }

    if (!delivery.freelancer_stripe_account_id) {
      return NextResponse.json(
        { error: "The freelancer has not yet connected their Stripe account." },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    const connectedAccount = await stripe.accounts.retrieve(delivery.freelancer_stripe_account_id);
    const transfersActive = connectedAccount.capabilities?.transfers === "active";
    const legacyPaymentsActive = connectedAccount.capabilities?.legacy_payments === "active";
    if (!transfersActive && !legacyPaymentsActive) {
      return NextResponse.json(
        {
          error:
            "The creator is not ready to accept payments yet. Please ask them to finish Stripe onboarding.",
        },
        { status: 400 }
      );
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;
    const tipCents = body.tip_amount_cents === undefined ? 0 : asInteger(body.tip_amount_cents, "tip_amount_cents", 0, 250_000);
    const totalCents = delivery.price_cents + tipCents;

    const rawClientEmail = typeof body.email === "string" ? body.email : "";
    const clientEmail = normalizeEmail(rawClientEmail);
    if (!clientEmail || clientEmail.length > 320 || !looksLikeEmail(clientEmail)) {
      return NextResponse.json(
        { error: "Enter a valid email to continue checkout.", code: "EMAIL_REQUIRED" },
        { status: 400 }
      );
    }

    const { data: existingByEmail, error: existingByEmailError } = await supabase
      .from("payments")
      .select("id,status,created_at,stripe_checkout_session_id")
      .eq("delivery_id", delivery.id)
      .eq("client_email", clientEmail)
      .in("status", ["paid", "processing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingByEmailError) {
      console.warn("Existing payment check failed:", existingByEmailError.message);
    } else if (existingByEmail?.id && existingByEmail.status === "paid") {
      return NextResponse.json(
        { error: "Already purchased. Use Restore Access to unlock.", code: "ALREADY_PURCHASED" },
        { status: 409 }
      );
    } else if (existingByEmail?.id && existingByEmail.status === "processing") {
      const createdAtMs = existingByEmail.created_at ? new Date(existingByEmail.created_at).getTime() : 0;
      const ageMs = createdAtMs ? Date.now() - createdAtMs : 0;
      const isFreshAttempt = ageMs > 0 && ageMs < 30 * 60 * 1000;

      if (isFreshAttempt && existingByEmail.stripe_checkout_session_id) {
        try {
          const existingSession = await stripe.checkout.sessions.retrieve(existingByEmail.stripe_checkout_session_id);
          if (existingSession.url) {
            return NextResponse.json({
              checkout_url: existingSession.url,
              code: "CHECKOUT_RESUME",
            });
          }
        } catch (resumeError) {
          console.warn("Failed to resume Stripe Checkout session:", resumeError);
        }
      }

      return NextResponse.json(
        { error: "Checkout is already in progress for this email.", code: "CHECKOUT_IN_PROGRESS" },
        { status: 409 }
      );
    }

    // Calculate platform application fee based on the generosity slider
    const feePercent = delivery.platform_fee_percent ?? 5;
    const applicationFeeCents = Math.round(totalCents * (feePercent / 100));

    // Build line items
    const lineItems: { price_data: { currency: string; product_data: { name: string }; unit_amount: number }; quantity: number }[] = [
      {
        price_data: {
          currency: "usd",
          product_data: { name: delivery.title },
          unit_amount: delivery.price_cents,
        },
        quantity: 1,
      },
    ];

    if (tipCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Tip — Thank you! ☕" },
          unit_amount: tipCents,
        },
        quantity: 1,
      });
    }

    const idempotencyBucketMs = 10 * 60 * 1000;
    const bucketStartMs = Math.floor(Date.now() / idempotencyBucketMs) * idempotencyBucketMs;
    const idempotencyKey = buildCheckoutIdempotencyKey({
      deliveryId: delivery.id,
      clientEmail,
      tipCents,
      bucketStartMs,
    });

    // Create the Checkout Session with a destination charge
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: clientEmail,
        line_items: lineItems,
        payment_intent_data: {
          application_fee_amount: applicationFeeCents,
          transfer_data: {
            destination: delivery.freelancer_stripe_account_id,
          },
        },
        metadata: {
          delivery_id: delivery.id,
          tip_amount_cents: String(tipCents),
        },
        success_url: `${baseUrl}/d/${delivery.id}?paid=true&receipt={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/d/${delivery.id}`,
      },
      { idempotencyKey }
    );

    // Save the session ID for webhook reconciliation
    const { error: updateError } = await supabase
      .from("deliveries")
      .update({
        stripe_session_id: session.id,
        payment_status: "processing",
        status_reason: "checkout_session_created",
      })
      .eq("id", delivery.id);
    if (updateError) {
      throw new Error("Failed to update delivery state.");
    }

    await createPaymentRecord(supabase, {
      delivery_id: delivery.id,
      stripe_checkout_session_id: session.id,
      gross_amount_cents: delivery.price_cents,
      tip_amount_cents: tipCents,
      fee_amount_cents: applicationFeeCents,
      net_amount_cents: totalCents - applicationFeeCents,
      status: "processing",
      client_email: clientEmail,
    });

    return NextResponse.json({ checkout_url: session.url });
  } catch (err) {
    if (err instanceof Error && err.message === "Too many requests.") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("POST /api/checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
