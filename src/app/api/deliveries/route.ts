import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { isValidExternalLink, clamp } from "@/lib/utils";
import type { CreateDeliveryRequest } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { asInteger, asOptionalInteger, asOptionalString, asNonEmptyString } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { hashLockboxPassword } from "@/lib/lockbox-password";

/**
 * POST /api/deliveries
 * Step 1 of Lazy Registration: Create the lockbox record.
 * We capture the email and metadata, but don't force Stripe Connect yet.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    await enforceRateLimit({ key: `deliveries:${ip}`, limit: 30, windowSeconds: 60 });
    const body = (await req.json()) as Partial<CreateDeliveryRequest>;
    const authClient = await getSupabaseServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user?.id || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Validation ---
    const title = asNonEmptyString(body.title, "title", 120);
    const secureLink = asNonEmptyString(body.secure_link, "secure_link", 2048);
    const priceCents = asInteger(body.price_cents, "price_cents", 100, 10_000_000);
    const previewText = asOptionalString(body.preview_text, "preview_text", 500);
    const previewUrl = asOptionalString(body.preview_url, "preview_url", 2048);
    if (!isValidExternalLink(secureLink)) {
      return NextResponse.json(
        { error: "secure_link must be a valid HTTPS URL." },
        { status: 400 }
      );
    }
    if (previewUrl && !isValidExternalLink(previewUrl)) {
      return NextResponse.json(
        { error: "preview_url must be a valid URL." },
        { status: 400 }
      );
    }

    const platformFee = clamp(asOptionalInteger(body.platform_fee_percent, "platform_fee_percent", 5, 20, 5), 5, 20);
    const requiresPassword = Boolean(body.requires_password);
    const accessPassword = requiresPassword ? asNonEmptyString(body.access_password, "access_password", 256) : null;
    const usageLimit = body.usage_limit && body.usage_limit !== "unlimited" ? parseInt(String(body.usage_limit), 10) : null;
    if (usageLimit !== null) {
      if (!Number.isInteger(usageLimit) || usageLimit < 1 || usageLimit > 1000) {
        return NextResponse.json({ error: "usage_limit must be between 1 and 1000." }, { status: 400 });
      }
    }

    // --- Insert into Supabase ---
    const supabase = getSupabaseAdmin();
    
    // Load owner profile (self-heal by creating it when missing).
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, stripe_account_id")
      .eq("id", user.id)
      .maybeSingle();
    let profile: { id: string; stripe_account_id: string | null } = {
      id: user.id,
      stripe_account_id: null,
    };
    if (profileFetchError) {
      console.warn("Profile fetch failed, continuing with auth user fallback:", profileFetchError.message);
    } else if (existingProfile?.id) {
      profile = existingProfile;
    } else {
      const { data: upsertedProfile, error: profileUpsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          },
          { onConflict: "id" }
        )
        .select("id, stripe_account_id")
        .single();
      if (profileUpsertError || !upsertedProfile?.id) {
        console.warn("Profile auto-create failed, continuing with auth user fallback:", profileUpsertError?.message);
      } else {
        profile = upsertedProfile;
      }
    }

    // Optional: only allow listing when the user's storefront is enabled.
    let isListed = false;
    if (body.is_listed === true) {
      const { data: storeProfile, error: storeProfileError } = await supabase
        .from("profiles")
        .select("storefront_enabled")
        .eq("id", user.id)
        .maybeSingle();
      const storefrontEnabled =
        !storeProfileError && Boolean((storeProfile as { storefront_enabled?: boolean } | null)?.storefront_enabled);
      isListed = storefrontEnabled;
    }

    const insertPayload = {
      freelancer_email: user.email,
      user_id: profile.id,
      freelancer_stripe_account_id: profile.stripe_account_id || null,
      title,
      preview_text: previewText ?? null,
      preview_url: previewUrl ?? null,
      price_cents: priceCents,
      secure_link: secureLink,
      platform_fee_percent: platformFee,
      requires_password: requiresPassword,
      access_password_hash: accessPassword ? hashLockboxPassword(accessPassword) : null,
      usage_limit: usageLimit,
      is_listed: isListed,
      status: "pending",
      payment_status: "pending",
    };

    let { data, error } = await supabase
      .from("deliveries")
      .insert(insertPayload)
      .select("id")
      .single();

    // Backward compatibility for projects that have not run newer migrations yet.
    if (error && /payment_status|status_reason|last_payment_id|paid_at|requires_password|access_password_hash|is_listed/i.test(error.message || "")) {
      const legacyPayload = {
        freelancer_email: user.email,
        user_id: profile.id,
        freelancer_stripe_account_id: profile.stripe_account_id || null,
        title,
        preview_text: previewText ?? null,
        preview_url: previewUrl ?? null,
        price_cents: priceCents,
        secure_link: secureLink,
        platform_fee_percent: platformFee,
        status: "pending",
      };
      const retry = await supabase
        .from("deliveries")
        .insert(legacyPayload)
        .select("id")
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error("Supabase insert error:", error);
      const message = error?.message || "Failed to create delivery.";
      const hint = error?.hint || "";
      const details = error?.details || "";

      // Helpful diagnostics for common local misconfigurations.
      if (
        /violates foreign key constraint/i.test(message) ||
        /is not present in table "users"/i.test(message)
      ) {
        return NextResponse.json(
          {
            error:
              "Delivery owner could not be linked. Your auth session and service-role key may be pointing to different Supabase projects.",
          },
          { status: 500 }
        );
      }
      if (/invalid api key/i.test(message)) {
        return NextResponse.json(
          { error: "Supabase service role key is invalid. Check SUPABASE_SERVICE_ROLE_KEY." },
          { status: 500 }
        );
      }
      if (/column .* does not exist/i.test(message)) {
        return NextResponse.json(
          {
            error:
              "Database schema is behind code. Run the latest Supabase migrations, then retry.",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: [message, hint, details].filter(Boolean).join(" | ") || "Failed to create delivery." },
        { status: 500 }
      );
    }

    // --- Lazy Registration Logic ---
    // We return the delivery ID. The frontend will now prompt for Magic Link.
    return NextResponse.json({
      delivery_id: data.id,
      requires_auth: false,
      requires_stripe: !profile.stripe_account_id
    });

  } catch (err) {
    if (err instanceof Error && err.message === "Too many requests.") {
      return NextResponse.json({ error: err.message }, { status: 429 });
    }
    console.error("POST /api/deliveries error:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
