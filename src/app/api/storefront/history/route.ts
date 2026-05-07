import { NextResponse } from "next/server";
import { getRequestUser } from "@/server/services/auth-service";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const user = await getRequestUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await enforceRateLimit({ key: `storefront_history:${user.id}`, limit: 30, windowSeconds: 60 });

  const supabase = await getSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("storefront_published_revision_id")
    .eq("id", user.id)
    .maybeSingle();

  const publishedRevisionId = (profile as { storefront_published_revision_id?: string | null } | null)
    ?.storefront_published_revision_id || null;

  const { data } = await supabase
    .from("storefront_revisions")
    .select("id,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const rows = (data || []) as Array<{ id: string; status: "draft" | "published"; created_at: string }>;
  return NextResponse.json({ rows, published_revision_id: publishedRevisionId });
}

