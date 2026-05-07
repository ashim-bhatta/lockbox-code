import { getSupabaseAdmin } from "@/lib/supabase";

export async function enforceRateLimit(input: {
  key: string;
  limit: number;
  windowSeconds: number;
  failOpen?: boolean;
}) {
  const supabase = getSupabaseAdmin();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / (input.windowSeconds * 1000)) * input.windowSeconds * 1000).toISOString();

  try {
    const { error } = await supabase.rpc("enforce_api_rate_limit", {
      p_key: input.key,
      p_window_start: windowStart,
      p_limit: input.limit,
    });

    if (error) {
      const message = typeof error.message === "string" ? error.message : "";
      if (message.includes("rate_limit_exceeded")) {
        throw new Error("Too many requests.");
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Too many requests.") {
      throw error;
    }
    if (input.failOpen === false) {
      throw new Error("Rate limit unavailable.");
    }
    // Fail-open so payment/auth flows are not blocked by limiter storage issues.
    console.warn("Rate limit bypassed due to storage issue:", error);
  }
}
