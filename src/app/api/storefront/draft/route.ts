import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { storefrontConfigSchema, getDefaultStorefrontConfig } from "@/server/schemas/storefront";

const MAX_BODY_CHARS = 60_000;

async function parseJsonWithLimit(req: NextRequest) {
  const raw = await req.text();
  if (raw.length > MAX_BODY_CHARS) {
    throw new Error("Payload too large.");
  }
  return JSON.parse(raw) as unknown;
}

async function getOrCreateDraft(params: { userId: string }) {
  const supabase = await getSupabaseServerClient();

  const { data: draft } = await supabase
    .from("storefront_revisions")
    .select("*")
    .eq("user_id", params.userId)
    .eq("status", "draft")
    .maybeSingle();

  if (draft?.id) {
    return draft as { id: string; theme: unknown; sections: unknown; created_at: string };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("storefront_title,storefront_description")
    .eq("id", params.userId)
    .maybeSingle();

  const fallbackConfig = getDefaultStorefrontConfig({
    title: (profile as { storefront_title?: string | null } | null)?.storefront_title || null,
    description: (profile as { storefront_description?: string | null } | null)?.storefront_description || null,
  });

  const { data: created, error: insertError } = await supabase
    .from("storefront_revisions")
    .insert({
      user_id: params.userId,
      status: "draft",
      theme: fallbackConfig.theme || {},
      sections: fallbackConfig.sections,
    })
    .select("*")
    .single();

  if (!insertError && created?.id) {
    return created as { id: string; theme: unknown; sections: unknown; created_at: string };
  }

  if (insertError) {
    const message = String(insertError.message || "");
    if (/storefront_revisions/i.test(message) && /does not exist|relation/i.test(message)) {
      throw new Error(
        "Database schema is missing `storefront_revisions`. Run Supabase migrations from the repo root (e.g. `supabase migration up`)."
      );
    }
    throw new Error(insertError.message || "Unable to initialize draft.");
  }

  // Race safety: if another request created the draft, load it.
  const { data: after } = await supabase
    .from("storefront_revisions")
    .select("*")
    .eq("user_id", params.userId)
    .eq("status", "draft")
    .maybeSingle();

  if (after?.id) {
    return after as { id: string; theme: unknown; sections: unknown; created_at: string };
  }

  throw new Error("Unable to initialize draft.");
}

/**
 * GET /api/storefront/draft
 * Returns the authenticated user's current draft config (creates a default draft if missing).
 */
export async function GET() {
  const user = await getRequestUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await enforceRateLimit({ key: `storefront_draft_get:${user.id}`, limit: 30, windowSeconds: 60 });

  const draft = await getOrCreateDraft({ userId: user.id });
  return NextResponse.json({ revision: draft });
}

/**
 * PUT /api/storefront/draft
 * Body: { theme, sections }
 * Saves a validated draft config for the authenticated user.
 */
export async function PUT(req: NextRequest) {
  const user = await getRequestUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await enforceRateLimit({ key: `storefront_draft_put:${user.id}`, limit: 20, windowSeconds: 60 });

  let payload: unknown;
  try {
    payload = await parseJsonWithLimit(req);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const parsed = storefrontConfigSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid storefront config." }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();
  const draft = await getOrCreateDraft({ userId: user.id });

  const { data: updated, error: updateError } = await supabase
    .from("storefront_revisions")
    .update({
      theme: parsed.data.theme || {},
      sections: parsed.data.sections,
    })
    .eq("id", draft.id)
    .eq("user_id", user.id)
    .eq("status", "draft")
    .select("*")
    .single();

  if (updateError || !updated?.id) {
    return NextResponse.json(
      { error: updateError?.message || "Unable to save draft." },
      { status: 500 }
    );
  }

  return NextResponse.json({ revision: updated });
}
