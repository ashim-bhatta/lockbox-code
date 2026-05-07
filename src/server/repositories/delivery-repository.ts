import type { SupabaseClient } from "@supabase/supabase-js";
import type { Delivery } from "@/types";

export async function getDeliveryById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase.from("deliveries").select("*").eq("id", id).single();
  if (error || !data) {
    return null;
  }
  return data as Delivery;
}

export async function getRecentDeliveriesForUser(supabase: SupabaseClient, userId: string, limit = 10) {
  const { data } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Delivery[];
}

export async function getDeliveriesForUser(supabase: SupabaseClient, userId: string, limit = 50) {
  const { data } = await supabase
    .from("deliveries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []) as Delivery[];
}

export async function updateDeliveryViewCount(supabase: SupabaseClient, id: string, current: number) {
  await supabase.from("deliveries").update({ view_count: current + 1 }).eq("id", id);
}
