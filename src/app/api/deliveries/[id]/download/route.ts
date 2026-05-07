import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyRestoreToken } from "@/lib/restore-token";

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

/**
 * GET /api/deliveries/[id]/download
 *
 * Redirects to the underlying `secure_link` only after verifying access:
 * - Owner access (authenticated)
 * - Paid receipt id (`?receipt=cs_...`) for this delivery
 * - Restore cookie (`pwz_restore_<id>`)
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  await enforceRateLimit({ key: `download:${ip}`, limit: 80, windowSeconds: 60 });

  const { id } = await params;
  const receiptId = req.nextUrl.searchParams.get("receipt");

  const supabase = getSupabaseAdmin();
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id,user_id,secure_link,status_reason")
    .eq("id", id)
    .maybeSingle();

  if (!delivery?.id) {
    return NextResponse.json({ error: "Lockbox not found." }, { status: 404 });
  }
  if (delivery.status_reason === "disabled_by_owner") {
    return NextResponse.json({ error: "This lockbox is currently turned off by the creator." }, { status: 403 });
  }

  const isOwner = Boolean(user?.id && delivery.user_id === user.id);

  let hasValidPayment = false;
  if (receiptId) {
    const { data: p } = await supabase
      .from("payments")
      .select("id,status")
      .eq("delivery_id", id)
      .eq("stripe_checkout_session_id", receiptId)
      .eq("status", "paid")
      .maybeSingle();
    if (p) hasValidPayment = true;
  }

  if (!hasValidPayment) {
    const restoreCookie = req.cookies.get(`pwz_restore_${id}`)?.value;
    const restoreToken = typeof restoreCookie === "string" ? verifyRestoreToken(restoreCookie) : null;
    const restoreEmailAttempt =
      restoreToken && restoreToken.deliveryId === id ? normalizeEmail(restoreToken.email) : null;
    if (restoreEmailAttempt) {
      const { data: p } = await supabase
        .from("payments")
        .select("id,status")
        .eq("delivery_id", id)
        .eq("client_email", restoreEmailAttempt)
        .eq("status", "paid")
        .maybeSingle();
      if (p) hasValidPayment = true;
    }
  }

  if (!isOwner && !hasValidPayment) {
    return NextResponse.json({ error: "Payment required." }, { status: 403 });
  }

  if (typeof delivery.secure_link !== "string" || !delivery.secure_link) {
    return NextResponse.json({ error: "Secure link is missing." }, { status: 500 });
  }

  const res = NextResponse.redirect(delivery.secure_link, 302);
  // Best-effort: prevent leaking the current URL via the Referer header on redirect.
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

