import { NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getDefaultStorefrontConfig } from "@/server/schemas/storefront";

async function loadDraft(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("storefront_revisions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "draft")
    .maybeSingle();
  return data as { id: string; theme: unknown; sections: unknown } | null;
}

/**
 * POST /api/storefront/publish
 * Promotes the current draft to a new published revision and updates the profile pointer.
 */
export async function POST() {
  const user = await getRequestUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await enforceRateLimit({ key: `storefront_publish:${user.id}`, limit: 8, windowSeconds: 60 });

  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("storefront_enabled,storefront_handle,storefront_title,storefront_description")
    .eq("id", user.id)
    .maybeSingle();

  const enabled = Boolean((profile as { storefront_enabled?: boolean } | null)?.storefront_enabled);
  const handle = (profile as { storefront_handle?: string | null } | null)?.storefront_handle || null;
  if (!enabled) {
    return NextResponse.json(
      { error: "Enable your storefront in Settings before publishing." },
      { status: 400 }
    );
  }
  if (!handle) {
    return NextResponse.json({ error: "Set a storefront handle before publishing." }, { status: 400 });
  }

  let draft = await loadDraft(user.id);
  if (!draft?.id) {
    const fallbackConfig = getDefaultStorefrontConfig({
      title: (profile as { storefront_title?: string | null } | null)?.storefront_title || null,
      description: (profile as { storefront_description?: string | null } | null)?.storefront_description || null,
    });
    const { data: createdDraft, error: createError } = await supabase
      .from("storefront_revisions")
      .insert({
        user_id: user.id,
        status: "draft",
        theme: fallbackConfig.theme || {},
        sections: fallbackConfig.sections,
      })
      .select("*")
      .single();
    if (createError || !createdDraft?.id) {
      const message = String(createError?.message || "");
      if (/storefront_revisions/i.test(message) && /does not exist|relation/i.test(message)) {
        return NextResponse.json(
          {
            error:
              "Database schema is missing `storefront_revisions`. Run Supabase migrations from the repo root (e.g. `supabase migration up`).",
          },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: createError?.message || "Unable to initialize storefront draft." },
        { status: 500 }
      );
    }
    draft = createdDraft as { id: string; theme: unknown; sections: unknown };
  }

  const { data: published, error: publishError } = await supabase
    .from("storefront_revisions")
    .insert({
      user_id: user.id,
      status: "published",
      theme: draft.theme || {},
      sections: draft.sections || [],
    })
    .select("*")
    .single();

  if (publishError || !published?.id) {
    return NextResponse.json({ error: publishError?.message || "Publish failed." }, { status: 500 });
  }

  const { error: profileUpdateError } = await supabase
    .from("profiles")
    .update({ storefront_published_revision_id: published.id })
    .eq("id", user.id);

  if (profileUpdateError) {
    return NextResponse.json(
      { error: profileUpdateError.message || "Could not set published revision pointer." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, published_revision_id: published.id });
}
