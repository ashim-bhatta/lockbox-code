import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createRestoreToken } from "@/lib/restore-token";

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

function hashOtp(code: string, salt: string) {
  return crypto.scryptSync(code, salt, 32);
}

/**
 * POST /api/deliveries/[id]/restore/verify
 * Body: { email, otp }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ip = getIp(req);

    await enforceRateLimit({ key: `restore_verify:ip:${ip}`, limit: 30, windowSeconds: 60, failOpen: false });

    const body = (await req.json().catch(() => ({}))) as { email?: unknown; otp?: unknown };
    const rawEmail = typeof body.email === "string" ? body.email : "";
    const rawOtp = typeof body.otp === "string" ? body.otp : "";
    const email = normalizeEmail(rawEmail);
    const otp = rawOtp.replace(/\s+/g, "");

    if (!email || email.length > 320 || !looksLikeEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      return NextResponse.json({ error: "Enter the 6-digit code." }, { status: 400 });
    }

    await enforceRateLimit({ key: `restore_verify:delivery:${id}:ip:${ip}`, limit: 18, windowSeconds: 60, failOpen: false });
    await enforceRateLimit({ key: `restore_verify:delivery:${id}:email:${email}`, limit: 10, windowSeconds: 3600, failOpen: false });

    const supabase = getSupabaseAdmin();

    const { data: otpRow, error: otpError } = await supabase
      .from("delivery_restore_otps")
      .select("delivery_id,email,otp_salt,otp_hash,expires_at,attempts,consumed_at")
      .eq("delivery_id", id)
      .eq("email", email)
      .maybeSingle();

    if (otpError) {
      console.error("OTP read error:", otpError);
      return NextResponse.json({ error: "Could not verify the code. Please try again." }, { status: 500 });
    }
    if (!otpRow || otpRow.consumed_at) {
      return NextResponse.json({ error: "Code not found. Send a new one." }, { status: 400 });
    }

    const expiresAtMs = new Date(String(otpRow.expires_at)).getTime();
    if (!expiresAtMs || Date.now() > expiresAtMs) {
      return NextResponse.json({ error: "Code expired. Send a new one." }, { status: 400 });
    }

    const attempts = typeof otpRow.attempts === "number" ? otpRow.attempts : 0;
    if (attempts >= 8) {
      return NextResponse.json({ error: "Too many attempts. Send a new code." }, { status: 429 });
    }

    const expectedHash = hashOtp(otp, String(otpRow.otp_salt));
    const storedHash = Buffer.from(String(otpRow.otp_hash), "base64");
    const ok = storedHash.length === expectedHash.length && crypto.timingSafeEqual(storedHash, expectedHash);

    if (!ok) {
      await supabase
        .from("delivery_restore_otps")
        .update({ attempts: attempts + 1 })
        .eq("delivery_id", id)
        .eq("email", email);
      return NextResponse.json({ error: "Wrong code. Try again." }, { status: 400 });
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

    await supabase
      .from("delivery_restore_otps")
      .update({ consumed_at: new Date().toISOString(), attempts: attempts + 1 })
      .eq("delivery_id", id)
      .eq("email", email);

    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const token = createRestoreToken({ deliveryId: id, email, expiresAt: tokenExpiresAt });

    const res = NextResponse.json({ ok: true });
    res.cookies.set({
      name: `pwz_restore_${id}`,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch (err) {
    if (err instanceof Error && err.message === "Too many requests.") {
      return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
    }
    console.error("POST /api/deliveries/[id]/restore/verify error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
