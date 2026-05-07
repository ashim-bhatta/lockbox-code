import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function requireAuthenticatedUser() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function redirectIfAuthenticated(target = "/dashboard") {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(target);
  }
}
