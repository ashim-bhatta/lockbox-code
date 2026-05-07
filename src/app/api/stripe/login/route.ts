import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";

export async function POST() {
  try {
    const serverSupabase = await getSupabaseServerClient();
    const {
      data: { user },
    } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceRateLimit({ key: `stripe_login:${user.id}`, limit: 10, windowSeconds: 60 });

    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: "No Stripe account connected." }, { status: 400 });
    }

    const stripe = getStripe();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string;

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    if (account.details_submitted) {
      const loginLink = await stripe.accounts.createLoginLink(profile.stripe_account_id);
      return NextResponse.json({ url: loginLink.url });
    } else {
      const accountLink = await stripe.accountLinks.create({
        account: profile.stripe_account_id,
        refresh_url: `${baseUrl}/dashboard?stripe_retry=true`,
        return_url: `${baseUrl}/dashboard`,
        type: "account_onboarding",
      });
      return NextResponse.json({ url: accountLink.url });
    }
  } catch (err) {
    console.error("Stripe Login Error:", err);
    return NextResponse.json({ error: "Failed to create login link" }, { status: 500 });
  }
}
