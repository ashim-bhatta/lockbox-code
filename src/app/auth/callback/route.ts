import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

function getSafeRedirectPath(rawNext: string | null) {
  if (!rawNext) return "/dashboard";
  if (!rawNext.startsWith("/")) return "/dashboard";
  if (rawNext.startsWith("//")) return "/dashboard";
  return rawNext;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id && user.email) {
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          },
          { onConflict: "id" }
        );
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
