import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getProfileByUserId, updateProfileByUserId } from "@/server/services/profile-service";
import { asOptionalString } from "@/lib/validation";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isValidExternalLink } from "@/lib/utils";

function normalizeHandle(input: string) {
  return input.trim().toLowerCase();
}

function isReservedHandle(handle: string) {
  const reserved = new Set([
    "api",
    "auth",
    "dashboard",
    "settings",
    "payments",
    "privacy",
    "terms",
    "support",
    "help",
    "login",
    "register",
    "d",
    "s",
    "store",
  ]);
  return reserved.has(handle);
}

export async function GET() {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const profile = await getProfileByUserId(user.id);
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const user = await getRequestUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await enforceRateLimit({ key: `profile:${user.id}`, limit: 20, windowSeconds: 60 });
    const body = (await req.json()) as {
      full_name?: string;
      payout_currency?: string;
      country?: string;
      avatar_url?: string | null;
      storefront_enabled?: boolean;
      storefront_handle?: string | null;
      storefront_title?: string | null;
      storefront_description?: string | null;
    };

    const rawHandle = body.storefront_handle === null ? null : asOptionalString(body.storefront_handle, "storefront_handle", 64);
    const normalizedHandle = rawHandle ? normalizeHandle(rawHandle) : null;
    if (normalizedHandle) {
      if (!/^[a-z0-9-]{3,30}$/.test(normalizedHandle)) {
        return NextResponse.json(
          { error: "storefront_handle must be 3-30 chars and contain only a-z, 0-9, and '-'." },
          { status: 400 }
        );
      }
      if (isReservedHandle(normalizedHandle)) {
        return NextResponse.json({ error: "That storefront handle is reserved." }, { status: 400 });
      }
    }
    const storefrontEnabled = body.storefront_enabled === undefined ? undefined : Boolean(body.storefront_enabled);
    if (storefrontEnabled === true && !normalizedHandle) {
      return NextResponse.json({ error: "Set a storefront handle to enable your storefront." }, { status: 400 });
    }

    const validated = {
      full_name: asOptionalString(body.full_name, "full_name", 120),
      payout_currency: asOptionalString(body.payout_currency, "payout_currency", 8),
      avatar_url: body.avatar_url === null ? null : asOptionalString(body.avatar_url, "avatar_url", 2048),
      storefront_enabled: storefrontEnabled,
      storefront_handle: normalizedHandle,
      storefront_title: body.storefront_title === null ? null : asOptionalString(body.storefront_title, "storefront_title", 80),
      storefront_description: body.storefront_description === null ? null : asOptionalString(body.storefront_description, "storefront_description", 280),
    };

    if (validated.avatar_url && !isValidExternalLink(validated.avatar_url)) {
      return NextResponse.json({ error: "avatar_url must be a valid HTTPS URL." }, { status: 400 });
    }

    if (body.full_name !== undefined || body.country !== undefined) {
      const { getSupabaseServerClient } = await import("@/lib/supabase-server");
      const supabase = await getSupabaseServerClient();
      await supabase.auth.updateUser({
        data: {
          ...(body.full_name !== undefined ? { full_name: body.full_name } : {}),
          ...(body.country !== undefined ? { country: body.country } : {}),
        }
      });
    }

    const result = await updateProfileByUserId(user.id, validated);
    if (!result.data) {
      const message = result.error || "Unable to update profile.";
      if (/duplicate key value violates unique constraint/i.test(message) && /storefront_handle/i.test(message)) {
        return NextResponse.json({ error: "That storefront handle is already taken." }, { status: 400 });
      }
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ profile: result.data });
  } catch (error) {
    if (error instanceof Error && error.message === "Too many requests.") {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json({ error: "Unable to update profile." }, { status: 400 });
  }
}
