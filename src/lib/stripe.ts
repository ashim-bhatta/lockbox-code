import Stripe from "stripe";
import { validateStripeEnv } from "@/lib/env";

/**
 * Server-side Stripe client.
 * NEVER import this in client components.
 */
export function getStripe() {
  validateStripeEnv();
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable.");
  }

  return new Stripe(key, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
}
