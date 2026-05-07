import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { asNonEmptyString } from "@/lib/validation";

/**
 * POST /api/storefront/rollback
 * Body: { revision_id }
 */
export async function POST(req: NextRequest) {
  const user = await getRequestUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await enforceRateLimit({ key: `storefront_rollback:${user.id}`, limit: 10, windowSeconds: 60 });

  const body = (await req.json().catch(() => ({}))) as { revision_id?: unknown };
  let revisionId: string;
  try {
    revisionId = asNonEmptyString(body.revision_id, "revision_id", 128);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid revision id." },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServerClient();
  const { data: revision } = await supabase
    .from("storefront_revisions")
    .select("id,status")
    .eq("id", revisionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!revision?.id || revision.status !== "published") {
    return NextResponse.json({ error: "Published revision not found." }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ storefront_published_revision_id: revision.id })
    .eq("id", user.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || "Rollback failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, published_revision_id: revision.id });
}

