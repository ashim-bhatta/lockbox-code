import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function getRequestUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
