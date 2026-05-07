import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sendRestoreCodeEmail } from "@/lib/email";

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function looksLikeEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function getIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  return forwarded.split(",")[0]?.trim() || "unknown";
}

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function hashOtp(code: string, salt: string) {
  const hash = crypto.scryptSync(code, salt, 32);
  return hash.toString("base64");
}

/**
 * POST /api/deliveries/[id]/restore/request
 * Body: { email }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getIp(req);

    await enforceRateLimit({ key: `restore_request:ip:${ip}`, limit: 12, windowSeconds: 60, failOpen: false });

    const body = (await req.json().catch(() => ({}))) as { email?: unknown };
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const email = normalizeEmail(rawEmail);

    if (!email || email.length > 320 || !looksLikeEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    await enforceRateLimit({ key: `restore_request:delivery:${id}:ip:${ip}`, limit: 6, windowSeconds: 60, failOpen: false });
    await enforceRateLimit({ key: `restore_request:delivery:${id}:email:${email}`, limit: 4, windowSeconds: 3600, failOpen: false });

    const supabase = getSupabaseAdmin();

    const { data: delivery } = await supabase
      .from("deliveries")
      .select("id,title,status_reason")
      .eq("id", id)
      .maybeSingle();

    if (!delivery) {
      return NextResponse.json({ error: "Lockbox not found." }, { status: 404 });
    }
    if (delivery.status_reason === "disabled_by_owner") {
      return NextResponse.json({ error: "This lockbox is currently turned off by the creator." }, { status: 403 });
    }

    const { data: payment } = await supabase
      .from("payments")
      .select("id,status")
      .eq("delivery_id", id)
      .eq("client_email", email)
      .eq("status", "paid")
      .maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: "We couldn't find a paid checkout for that email." }, { status: 404 });
    }

    const code = generateCode();
    const salt = crypto.randomBytes(16).toString("base64");
    const hash = hashOtp(code, salt);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from("delivery_restore_otps")
      .upsert(
        {
          delivery_id: id,
          email,
          otp_salt: salt,
          otp_hash: hash,
          expires_at: expiresAt,
          attempts: 0,
          consumed_at: null,
        },
        { onConflict: "delivery_id,email" }
      );

    if (upsertError) {
      console.error("OTP upsert error:", upsertError);
      return NextResponse.json({ error: "Could not send a code. Please try again." }, { status: 500 });
    }

    await sendRestoreCodeEmail({
      clientEmail: email,
      title: delivery.title,
      code,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Too many requests.") {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }
    console.error("POST /api/deliveries/[id]/restore/request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
