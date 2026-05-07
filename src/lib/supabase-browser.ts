import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabasePublicEnvError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local";
  }

  if (url.includes("your-project.supabase.co") || url.includes("your_project")) {
    return "NEXT_PUBLIC_SUPABASE_URL is still a placeholder. Set your real Supabase project URL.";
  }

  if (!publishableKey.startsWith("sb_publishable_")) {
    return "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY looks invalid. Use the Supabase publishable key.";
  }

  return null;
}

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  browserClient = createBrowserClient(url, publishableKey);
  return browserClient;
}
