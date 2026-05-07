import { NextRequest, NextResponse } from "next/server";
import { processStripeWebhookInbox } from "@/server/services/webhook-service";

export async function POST(req: NextRequest) {
  const jobSecret = process.env.STRIPE_RECONCILE_SECRET;
  if (!jobSecret) {
    return NextResponse.json({ error: "Missing STRIPE_RECONCILE_SECRET." }, { status: 500 });
  }
  const provided = req.headers.get("x-reconcile-secret");
  if (!provided || provided !== jobSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const results = await processStripeWebhookInbox(100);
  return NextResponse.json({
    processed: results.filter((row) => row.ok).length,
    failed: results.filter((row) => !row.ok).length,
    results,
  });
}
