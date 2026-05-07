import { NextRequest, NextResponse } from "next/server";
import { processStripeWebhookInbox } from "@/server/services/webhook-service";

function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET || process.env.STRIPE_RECONCILE_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (bearer && bearer === secret) return true;

  const q = req.nextUrl.searchParams.get("secret");
  if (q && q === secret) return true;

  const legacyHeader = req.headers.get("x-reconcile-secret");
  if (legacyHeader && legacyHeader === secret) return true;

  return false;
}

/**
 * POST /api/cron/reconcile-stripe
 * Intended for Vercel Cron. Authorize with either:
 * - `Authorization: Bearer <CRON_SECRET>`
 * - `?secret=<CRON_SECRET>`
 */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await processStripeWebhookInbox(100);
  return NextResponse.json({
    processed: results.filter((row) => row.ok).length,
    failed: results.filter((row) => !row.ok).length,
    results,
  });
}

export async function GET(req: NextRequest) {
  return POST(req);
}
