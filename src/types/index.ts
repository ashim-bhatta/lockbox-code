export interface Delivery {
  id: string;
  created_at: string;
  user_id: string | null;
  freelancer_email: string;
  freelancer_stripe_account_id: string | null;
  client_email: string | null;
  title: string;
  preview_text: string | null;
  preview_url: string | null;
  view_count: number;
  price_cents: number;
  tip_amount_cents: number;
  platform_fee_percent: number;
  secure_link: string;
  stripe_session_id: string | null;
  status: "pending" | "paid";
  payment_status?: "pending" | "processing" | "paid" | "failed" | "refunded" | "disputed" | "expired";
  status_reason?: string | null;
  paid_at?: string | null;
  last_payment_id?: string | null;
  access_password_hash?: string | null;
  requires_password?: boolean;
  usage_limit?: number | null;
  purchase_count?: number;
  is_listed?: boolean;
}

export interface PublicDelivery {
  id: string;
  title: string;
  preview_text: string | null;
  preview_url: string | null;
  price_cents: number;
  status: "pending" | "paid";
  payment_status?: "pending" | "processing" | "paid" | "failed" | "refunded" | "disputed" | "expired";
  status_reason?: string | null;
  requires_password?: boolean;
  usage_limit?: number | null;
  purchase_count?: number;
  creator?: {
    name: string;
    avatar_url: string | null;
    stripe_connected: boolean;
  };
}

export interface CreateDeliveryRequest {
  freelancer_email: string;
  title: string;
  preview_text?: string;
  preview_url?: string;
  price_cents: number;
  secure_link: string;
  platform_fee_percent?: number;
  access_password?: string;
  requires_password?: boolean;
  usage_limit?: string | number | null;
  is_listed?: boolean;
}

export interface CheckoutRequest {
  delivery_id: string;
  tip_amount_cents?: number;
  email?: string;
  password?: string;
}

export async function createCheckoutSession(
  deliveryId: string,
  tipAmountCents: number,
  password?: string,
  email?: string
): Promise<{ checkout_url: string }> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      delivery_id: deliveryId,
      tip_amount_cents: tipAmountCents,
      password,
      email,
    }),
  });
  return res.json();
}

export interface PaymentRecord {
  id: string;
  delivery_id: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  gross_amount_cents: number;
  tip_amount_cents: number;
  fee_amount_cents: number;
  net_amount_cents: number;
  status: "pending" | "processing" | "paid" | "failed" | "refunded" | "disputed" | "expired";
  created_at: string;
}
