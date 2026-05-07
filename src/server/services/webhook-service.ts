import type Stripe from "stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendPaymentNotification, sendUnlockEmail } from "@/lib/email";
import { getStripe } from "@/lib/stripe";

function assertWrite(error: { message?: string } | null, context: string) {
  if (error) {
    throw new Error(`${context}: ${error.message || "write failed"}`);
  }
}

export function backoffMinutes(attempt: number) {
  return Math.min(60, 2 ** Math.max(1, attempt));
}

export async function enqueueStripeWebhookEvent(event: Stripe.Event) {
  const supabase = getSupabaseAdmin();
  const { data: inserted, error } = await supabase
    .from("webhook_events")
    .upsert(
      {
        provider: "stripe",
        event_id: event.id,
        event_type: event.type,
        payload: event,
        processing_status: "pending",
        attempts: 0,
      },
      { onConflict: "event_id", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();
  if (error) throw new Error("Failed to persist webhook event.");

  const { data: existing } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("provider", "stripe")
    .eq("event_id", event.id)
    .single();
  if (!existing?.id) throw new Error("Failed to load webhook event row.");
  return { duplicate: !inserted?.id, id: existing.id as string };
}

export async function processStripeWebhookInbox(limit = 20) {
  const supabase = getSupabaseAdmin();
  const workerId = `worker_${Math.random().toString(36).slice(2, 10)}`;
  const { data: rows, error: claimError } = await supabase.rpc("claim_webhook_events", {
    p_provider: "stripe",
    p_limit: limit,
    p_worker_id: workerId,
    p_lock_seconds: 120,
  });
  if (claimError) {
    throw new Error(`Webhook claim failed: ${claimError.message}`);
  }

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];
  for (const row of rows || []) {
    const rowId = row.id as string;
    const attempts = (row.attempts as number) || 1;
    try {
      await projectStripeEvent(row.payload as Stripe.Event, rowId);
      const { error: markProcessedError } = await supabase
        .from("webhook_events")
        .update({
          processing_status: "processed",
          processed_at: new Date().toISOString(),
          last_error: null,
          locked_by: null,
          locked_at: null,
          lock_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId);
      assertWrite(markProcessedError, "Failed to mark webhook processed");
      results.push({ id: rowId, ok: true });
    } catch (error) {
      const retryCount = attempts + 1;
      const dead = retryCount >= 8;
      const nextRetry = new Date(Date.now() + backoffMinutes(retryCount) * 60_000).toISOString();
      const { error: markFailedError } = await supabase
        .from("webhook_events")
        .update({
          processing_status: dead ? "dead_letter" : "failed",
          last_error: error instanceof Error ? error.message : "Unknown webhook processing error.",
          next_retry_at: dead ? null : nextRetry,
          locked_by: null,
          locked_at: null,
          lock_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", rowId);
      assertWrite(markFailedError, "Failed to mark webhook failed");
      results.push({
        id: rowId,
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
  return results;
}

async function projectStripeEvent(event: Stripe.Event, webhookEventId: string) {
  const supabase = getSupabaseAdmin();
  const stripe = getStripe();
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const deliveryId = session.metadata?.delivery_id;
    const tipCents = parseInt(session.metadata?.tip_amount_cents ?? "0", 10);
    if (!deliveryId) throw new Error("Missing delivery_id metadata.");

    const { data: delivery } = await supabase.from("deliveries").select("*").eq("id", deliveryId).single();
    if (!delivery) throw new Error("Delivery not found for checkout completion.");

    const gross = (session.amount_total || 0) - tipCents;
    const fee = Math.round(((delivery.platform_fee_percent || 5) / 100) * (session.amount_total || 0));
    const net = (session.amount_total || 0) - fee;

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id,status")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    let stripeChargeId: string | null = null;
    if (typeof session.payment_intent === "string") {
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent, {
        expand: ["latest_charge"],
      });
      stripeChargeId =
        typeof paymentIntent.latest_charge === "string"
          ? paymentIntent.latest_charge
          : paymentIntent.latest_charge?.id || null;
    }

    const { data: payment } = await supabase
      .from("payments")
      .upsert(
        {
          delivery_id: deliveryId,
          stripe_checkout_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          client_email: session.customer_details?.email ?? null,
          gross_amount_cents: gross,
          tip_amount_cents: tipCents,
          fee_amount_cents: fee,
          net_amount_cents: net,
          stripe_charge_id: stripeChargeId,
          status: "processing",
        },
        { onConflict: "stripe_checkout_session_id" }
      )
      .select("*")
      .single();

    const { error: deliveryUpdateError } = await supabase.rpc("increment_delivery_purchase_count", {
      p_delivery_id: deliveryId,
      p_stripe_session_id: session.id,
      p_tip_amount_cents: tipCents,
      p_client_email: session.customer_details?.email ?? null,
      p_last_payment_id: payment?.id || null,
    });

    if (deliveryUpdateError) {
      if (/usage_limit_reached/i.test(deliveryUpdateError.message || "")) {
        let refunded = false;
        if (stripeChargeId) {
          try {
            await stripe.refunds.create(
              {
                charge: stripeChargeId,
                reverse_transfer: true,
                refund_application_fee: true,
                reason: "requested_by_customer",
              },
              { idempotencyKey: `refund_usage_limit_${session.id}` }
            );
            refunded = true;
          } catch (refundError) {
            console.error("Failed to refund sold-out checkout:", refundError);
          }
        }

        await supabase
          .from("payments")
          .update({
            status: refunded ? "refunded" : "failed",
            failure_code: "usage_limit_reached",
            failure_message: "Usage limit reached.",
            refunded_at: refunded ? new Date().toISOString() : null,
          })
          .eq("stripe_checkout_session_id", session.id);
        return;
      }
      assertWrite(deliveryUpdateError, "Failed to update delivery metadata and purchase count");
    }

    await supabase
      .from("payments")
      .update({
        status: "paid",
        failure_code: null,
        failure_message: null,
        paid_at: new Date().toISOString(),
      })
      .eq("stripe_checkout_session_id", session.id);

    const firstSuccess = !existingPayment || existingPayment.status !== "paid";
    if (firstSuccess) {
      const { error: auditInsertError } = await supabase.from("audit_events").insert({
        actor_type: "webhook",
        actor_id: "stripe",
        entity_type: "delivery",
        entity_id: deliveryId,
        event_type: "payment_succeeded",
        payload: { event_type: event.type, webhook_event_id: webhookEventId, session_id: session.id },
      });
      assertWrite(auditInsertError, "Failed to insert audit event");

      if (session.customer_details?.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        await sendUnlockEmail({
          clientEmail: session.customer_details.email,
          title: delivery.title,
          downloadUrl: `${baseUrl}/d/${deliveryId}?paid=true&receipt=${encodeURIComponent(session.id)}`,
          freelancerEmail: delivery.freelancer_email,
        });
      }
      await sendPaymentNotification({
        freelancerEmail: delivery.freelancer_email,
        title: delivery.title,
        amountCents: delivery.price_cents,
        tipCents,
      });
    }
    return;
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { data: payment, error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        status: "failed",
        failure_code: paymentIntent.last_payment_error?.code || null,
        failure_message: paymentIntent.last_payment_error?.message || null,
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("delivery_id")
      .maybeSingle();
    assertWrite(paymentUpdateError, "Failed to update payment failure");
    if (payment?.delivery_id) {
      const { error: deliveryFailedError } = await supabase
        .from("deliveries")
        .update({ payment_status: "failed", status_reason: "payment_failed" })
        .eq("id", payment.delivery_id);
      assertWrite(deliveryFailedError, "Failed to update failed delivery");
    }
    return;
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { error: expirePaymentError } = await supabase
      .from("payments")
      .update({ status: "expired" })
      .eq("stripe_checkout_session_id", session.id);
    assertWrite(expirePaymentError, "Failed to mark payment expired");
    const { error: expireDeliveryError } = await supabase
      .from("deliveries")
      .update({ payment_status: "expired", status_reason: "checkout_expired" })
      .eq("stripe_session_id", session.id);
    assertWrite(expireDeliveryError, "Failed to mark delivery expired");
    return;
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as Stripe.Charge;
    const { data: paymentByCharge } = await supabase
      .from("payments")
      .update({ status: "refunded", refunded_at: new Date().toISOString() })
      .eq("stripe_charge_id", charge.id)
      .select("delivery_id")
      .maybeSingle();
    const { data: paymentByIntent } =
      !paymentByCharge
        ? await supabase
            .from("payments")
            .update({ status: "refunded", refunded_at: new Date().toISOString() })
            .eq("stripe_payment_intent_id", typeof charge.payment_intent === "string" ? charge.payment_intent : "")
            .select("delivery_id")
            .maybeSingle()
        : { data: paymentByCharge };
    if (paymentByIntent?.delivery_id) {
      await supabase
        .from("deliveries")
        .update({ payment_status: "refunded", status_reason: "charge_refunded" })
        .eq("id", paymentByIntent.delivery_id);
    }
    return;
  }

  if (event.type === "charge.dispute.created") {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId =
      typeof dispute.payment_intent === "string" ? dispute.payment_intent : null;
    if (paymentIntentId) {
      const { data: payment } = await supabase
        .from("payments")
        .update({ status: "disputed" })
        .eq("stripe_payment_intent_id", paymentIntentId)
        .select("delivery_id")
        .maybeSingle();
      if (payment?.delivery_id) {
        await supabase
          .from("deliveries")
          .update({ payment_status: "disputed", status_reason: "charge_dispute_created" })
          .eq("id", payment.delivery_id);
      }
    }
    return;
  }

  if (event.type.startsWith("transfer.")) {
    const transfer = event.data.object as Stripe.Transfer;
    const eventType = String(event.type);
    const transferStatus =
      eventType === "transfer.failed"
        ? "failed"
        : eventType === "transfer.paid"
          ? "paid"
          : "pending";
    await supabase.from("transfers").upsert(
      {
        stripe_transfer_id: transfer.id,
        destination_account_id: typeof transfer.destination === "string" ? transfer.destination : "",
        amount_cents: transfer.amount || 0,
        status: transferStatus,
      },
      { onConflict: "stripe_transfer_id" }
    );
    return;
  }

  if (event.type.startsWith("payout.")) {
    const payout = event.data.object as Stripe.Payout;
    await supabase.from("payouts").upsert(
      {
        stripe_payout_id: payout.id,
        stripe_account_id: event.account || "",
        amount_cents: payout.amount || 0,
        status: payout.status || "pending",
        arrival_date: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : null,
        failure_code: payout.failure_code || null,
      },
      { onConflict: "stripe_payout_id" }
    );
    return;
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabase
      .from("profiles")
      .update({
        stripe_account_id: account.id,
      })
      .eq("stripe_account_id", account.id);
  }
}
