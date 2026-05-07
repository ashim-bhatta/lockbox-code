import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function getProfileByUserId(userId: string) {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data || null;
}

export async function updateProfileByUserId(
  userId: string,
  input: {
    full_name?: string;
    payout_currency?: string;
    avatar_url?: string | null;
    storefront_enabled?: boolean;
    storefront_handle?: string | null;
    storefront_title?: string | null;
    storefront_description?: string | null;
  }
) {
  const supabase = await getSupabaseServerClient();
  const updates = {
    ...(input.full_name !== undefined ? { full_name: input.full_name } : {}),
    ...(input.payout_currency !== undefined ? { payout_currency: input.payout_currency } : {}),
    ...(input.avatar_url !== undefined ? { avatar_url: input.avatar_url } : {}),
    ...(input.storefront_enabled !== undefined ? { storefront_enabled: input.storefront_enabled } : {}),
    ...(input.storefront_handle !== undefined ? { storefront_handle: input.storefront_handle } : {}),
    ...(input.storefront_title !== undefined ? { storefront_title: input.storefront_title } : {}),
    ...(input.storefront_description !== undefined ? { storefront_description: input.storefront_description } : {}),
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select("*")
    .single();

  if (!error) return { data, error: null as string | null };

  // If profile row doesn't exist yet, create it then return the row.
  if (error.code === "PGRST116") {
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          ...updates,
        },
        { onConflict: "id" }
      )
      .select("*")
      .single();

    if (!insertError) return { data: inserted, error: null as string | null };
    return { data: null, error: insertError.message };
  }

  return { data: null, error: error.message };
}
