import { createClient } from "@supabase/supabase-js";
import { validateSupabaseEnv } from "@/lib/env";

/**
 * Server-side Supabase client using the SERVICE_ROLE key.
 * This bypasses RLS and should ONLY be used in API routes (server-side).
 * NEVER import this in client components.
 */
export function getSupabaseAdmin() {
  validateSupabaseEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
