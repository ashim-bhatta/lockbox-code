import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import type { Delivery, PublicDelivery } from "@/types";
import { asInteger, asOptionalString, asOptionalInteger } from "@/lib/validation";
import { verifyLockboxPassword } from "@/lib/lockbox-password";
import { verifyRestoreToken } from "@/lib/restore-token";
import { isValidExternalLink } from "@/lib/utils";

/**
 * GET /api/deliveries/[id]
 * Returns public delivery data. 
 * Increments view_count.
 * Does not expose `secure_link` (access is gated via `/api/deliveries/[id]/download`).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await enforceRateLimit({ key: `public_delivery:${ip}`, limit: 60, windowSeconds: 60 });
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const authClient = await getSupabaseServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    // 1. Fetch the delivery
    const { data, error } = await supabase
      .from("deliveries")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Delivery not found." },
        { status: 404 }
      );
    }

    const delivery = data as Delivery;
    const isOwner = Boolean(user?.id && delivery.user_id === user.id);
    const rawPasswordAttempt = req.nextUrl.searchParams.get("password");
    const passwordAttempt = typeof rawPasswordAttempt === "string" ? rawPasswordAttempt.slice(0, 256) : null;
    const receiptId = req.nextUrl.searchParams.get("receipt");
    const restoreCookie = req.cookies.get(`pwz_restore_${id}`)?.value;
    const restoreToken = typeof restoreCookie === "string" ? verifyRestoreToken(restoreCookie) : null;
    const restoreEmailAttempt =
      restoreToken && restoreToken.deliveryId === id ? restoreToken.email.trim().toLowerCase() : null;

    // 2. CHECK FOR INDIVIDUAL PAYMENT (RECEIPT OR EMAIL)
    let hasValidPayment = false;
    if (receiptId) {
      const { data: p } = await supabase
        .from("payments")
        .select("id, status")
        .eq("delivery_id", id)
        .eq("stripe_checkout_session_id", receiptId)
        .eq("status", "paid")
        .maybeSingle();
      if (p) hasValidPayment = true;
    }

    if (!hasValidPayment && restoreEmailAttempt) {
      const { data: p } = await supabase
        .from("payments")
        .select("id, status")
        .eq("delivery_id", id)
        .eq("client_email", restoreEmailAttempt)
        .eq("status", "paid")
        .maybeSingle();
      if (p) hasValidPayment = true;
    }

    const isPending = !hasValidPayment;
    const isDisabled = delivery.status_reason === "disabled_by_owner";
    const requiresPassword = Boolean(delivery.requires_password === true || (delivery.requires_password && delivery.access_password_hash));

    const creatorStripeConnected = Boolean(delivery.freelancer_stripe_account_id);
    let creatorName = "Freelancer";
    let creatorAvatarUrl: string | null = null;
    if (delivery.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,avatar_url")
        .eq("id", delivery.user_id)
        .maybeSingle();
      if (profile?.full_name) creatorName = String(profile.full_name);
      if (profile?.avatar_url) creatorAvatarUrl = String(profile.avatar_url);
    }

    // Prevent authenticated non-owners from viewing pending lockboxes.
    if (user?.id && !isOwner && isPending) {
      return NextResponse.json({ error: "Lockbox is private until payment." }, { status: 403 });
    }
    // Prevent guests from viewing lockboxes until creator has connected Stripe.
    if (!user?.id && !isOwner && !creatorStripeConnected) {
      return NextResponse.json(
        { error: "This lockbox is not publicly available yet. Creator setup is incomplete." },
        { status: 403 }
      );
    }
    if (!isOwner && isDisabled) {
      return NextResponse.json({ error: "Lockbox is currently disabled by the creator." }, { status: 403 });
    }
    if (!isOwner && requiresPassword) {
      const matches = passwordAttempt ? verifyLockboxPassword(passwordAttempt, delivery.access_password_hash as string) : false;
      if (!matches) {
        return NextResponse.json({ error: "Password required to access this lockbox.", code: "PASSWORD_REQUIRED" }, { status: 401 });
      }
    }

    // 3. Increment view count (async, don't wait to block response)
    supabase
      .from("deliveries")
      .update({ view_count: (delivery.view_count || 0) + 1 })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.error("Failed to increment view count:", error);
      });

    // 4. Build Public Object
    const viewerPaymentStatus = hasValidPayment ? "paid" : "pending";
    const effectivePaymentStatus = isOwner ? (delivery.payment_status || "pending") : viewerPaymentStatus;

    const publicDelivery: PublicDelivery = {
      id: delivery.id,
      title: delivery.title,
      preview_text: delivery.preview_text,
      preview_url: delivery.preview_url,
      price_cents: delivery.price_cents,
      status: effectivePaymentStatus === "paid" ? "paid" : "pending",
      payment_status: effectivePaymentStatus,
      status_reason: delivery.status_reason || null,
      requires_password: requiresPassword,
      usage_limit: typeof delivery.usage_limit === "number" ? delivery.usage_limit : null,
      purchase_count: typeof delivery.purchase_count === "number" ? delivery.purchase_count : 0,
      creator: {
        name: creatorName,
        avatar_url: creatorAvatarUrl,
        stripe_connected: creatorStripeConnected,
      },
    };

    return NextResponse.json(publicDelivery);
  } catch (err) {
    if (err instanceof Error && err.message === "Too many requests.") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("GET /api/deliveries/[id] error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data: delivery } = await supabase
    .from("deliveries")
    .select("id,payment_status,status,user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!delivery) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (delivery.payment_status === "paid" || delivery.status === "paid") {
    return NextResponse.json({ error: "Paid deliveries cannot be deleted." }, { status: 400 });
  }

  const { error } = await supabase.from("deliveries").delete().eq("id", id).eq("user_id", user.id);
  if (error) {
    return NextResponse.json({ error: "Failed to delete delivery." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data: delivery, error: fetchError } = await supabase
    .from("deliveries")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError || !delivery) {
    return NextResponse.json({ error: "Lockbox not found." }, { status: 404 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    preview_text?: string;
    preview_url?: string;
    secure_link?: string;
    price_cents?: number;
    platform_fee_percent?: number;
    disabled?: boolean;
    is_listed?: boolean;
  };

  const isPaid = delivery.payment_status === "paid" || delivery.status === "paid";
  const hasOnlyPaidSafeUpdates =
    body.title === undefined &&
    body.preview_text === undefined &&
    body.preview_url === undefined &&
    body.secure_link === undefined &&
    body.price_cents === undefined &&
    body.platform_fee_percent === undefined &&
    (body.disabled !== undefined || body.is_listed !== undefined);
  if (isPaid && !hasOnlyPaidSafeUpdates) {
    return NextResponse.json({ error: "Paid lockboxes cannot be edited." }, { status: 400 });
  }

  try {
    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = asOptionalString(body.title, "title", 120) || delivery.title;
    if (body.preview_text !== undefined) updates.preview_text = asOptionalString(body.preview_text, "preview_text", 500) || null;
    if (body.preview_url !== undefined) {
      const previewUrl = asOptionalString(body.preview_url, "preview_url", 2048) || null;
      if (previewUrl && !isValidExternalLink(previewUrl)) {
        return NextResponse.json({ error: "preview_url must be a valid HTTPS URL." }, { status: 400 });
      }
      updates.preview_url = previewUrl;
    }
    if (body.secure_link !== undefined) {
      const secureLink = asOptionalString(body.secure_link, "secure_link", 2048) || "";
      if (!secureLink || !isValidExternalLink(secureLink)) {
        return NextResponse.json({ error: "secure_link must be a valid HTTPS URL." }, { status: 400 });
      }
      updates.secure_link = secureLink;
    }
    if (body.price_cents !== undefined) updates.price_cents = asInteger(body.price_cents, "price_cents", 100, 10_000_000);
    if (body.platform_fee_percent !== undefined) {
      updates.platform_fee_percent = asOptionalInteger(body.platform_fee_percent, "platform_fee_percent", 5, 20, delivery.platform_fee_percent || 5);
    }
    if (body.disabled !== undefined) {
      updates.status_reason = body.disabled ? "disabled_by_owner" : null;
    }
    if (body.is_listed !== undefined) {
      if (body.is_listed) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("storefront_enabled")
          .eq("id", user.id)
          .maybeSingle();
        const enabled = !profileError && Boolean((profile as { storefront_enabled?: boolean } | null)?.storefront_enabled);
        if (!enabled) {
          return NextResponse.json({ error: "Enable your storefront in Settings before listing products." }, { status: 400 });
        }
      }
      updates.is_listed = Boolean(body.is_listed);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided." }, { status: 400 });
    }

    const { data: updated, error: updateError } = await supabase
      .from("deliveries")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (updateError || !updated) {
      return NextResponse.json({ error: updateError?.message || "Failed to update lockbox." }, { status: 500 });
    }
    return NextResponse.json({ delivery: updated });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid update payload." },
      { status: 400 }
    );
  }
}
