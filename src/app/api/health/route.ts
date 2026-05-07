import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const REQUIRED_TABLES = [
  "deliveries",
  "payments",
  "webhook_events",
  "profiles",
  "api_rate_limits",
  "delivery_restore_otps",
  "storefront_revisions",
] as const;

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const checks = await Promise.all(
      REQUIRED_TABLES.map(async (table) => {
        const { error } = await supabase.from(table).select("*").limit(1);
        return { table, ok: !error, error: error?.message || null };
      })
    );

    const ok = checks.every((c) => c.ok);
    return NextResponse.json(
      {
        ok,
        checks,
      },
      { status: ok ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Health check failed.",
      },
      { status: 500 }
    );
  }
}
