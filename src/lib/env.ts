function validate(keys: readonly string[]) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function validateSupabaseEnv() {
  validate([
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);
}

export function validateStripeEnv() {
  validate(["STRIPE_SECRET_KEY"]);
}
