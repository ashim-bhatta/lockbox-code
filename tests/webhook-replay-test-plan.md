# Webhook Replay and Reliability Test Plan

## Replay test
- Send the same Stripe `checkout.session.completed` event twice.
- Expected:
  - `webhook_events` has one row per `event_id` (unique constraint).
  - second delivery is treated as duplicate and no duplicate business effects occur.

## Retry/backoff test
- Force a transient DB failure during projection.
- Expected:
  - `webhook_events.processing_status = failed`
  - `attempts` increments
  - `next_retry_at` populated with exponential backoff
- Trigger `POST /api/jobs/reconcile-stripe` and ensure eventual `processed`.

## Dead-letter test
- Force repeated deterministic failures for a specific event.
- Expected:
  - event transitions to `dead_letter` after max retry threshold.

## Payment lifecycle test matrix
- `checkout.session.completed` -> delivery/payment become paid.
- `payment_intent.payment_failed` -> payment status failed.
- `checkout.session.expired` -> payment status expired.
- `charge.refunded` -> payment status refunded.
- `charge.dispute.created` -> payment status disputed.
