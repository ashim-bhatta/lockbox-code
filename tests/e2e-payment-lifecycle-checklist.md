# E2E Payment Lifecycle Checklist

## Success flow
1. Create delivery from lockbox form.
2. Open `/d/[id]`, select tip, start checkout.
3. Complete payment in Stripe test mode.
4. Verify:
   - delivery page transitions `processing` -> `paid`
   - secure link revealed
   - `payments` row is `paid`
   - `audit_events` contains payment success event

## Cancel flow
1. Start checkout and cancel in Stripe.
2. Verify user returns to locked page without secure link.

## Failure flow
1. Trigger payment failure test card.
2. Verify `payment_status=failed` and UI displays retry guidance.

## Refund flow
1. Refund a completed payment in Stripe dashboard.
2. Send/receive webhook.
3. Verify `payment_status=refunded` and secure link is no longer revealed.

## Dispute flow
1. Trigger dispute event in Stripe test environment.
2. Verify `payment_status=disputed` and restricted access messaging.
