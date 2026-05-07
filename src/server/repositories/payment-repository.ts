import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentRecord } from "@/types";

export async function createPaymentRecord(
  supabase: SupabaseClient,
  input: {
    delivery_id: string;
    stripe_checkout_session_id: string;
    gross_amount_cents: number;
    tip_amount_cents: number;
    fee_amount_cents: number;
    net_amount_cents: number;
    client_email?: string | null;
    status?: PaymentRecord["status"];
  }
) {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      ...input,
      status: input.status || "pending",
    })
    .select("*")
    .single();
  if (error || !data) {
    console.error("createPaymentRecord failed:", error);
    return null;
  }
  return data as PaymentRecord;
}

export async function updatePaymentBySession(
  supabase: SupabaseClient,
  stripeSessionId: string,
  patch: Partial<PaymentRecord>
) {
  const { data, error } = await supabase
    .from("payments")
    .update(patch)
    .eq("stripe_checkout_session_id", stripeSessionId)
    .select("*")
    .single();
  if (error || !data) return null;
  return data as PaymentRecord;
}

export async function getPaymentsForUserDeliveries(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
) {
  const { data } = await supabase
    .from("payments")
    .select("*, deliveries!inner(user_id,title,client_email)")
    .eq("deliveries.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}
