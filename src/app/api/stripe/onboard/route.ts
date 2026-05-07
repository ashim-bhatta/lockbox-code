import { NextRequest, NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { enforceRateLimit } from "@/lib/rate-limit"
import { asOptionalString } from "@/lib/validation"

/**
 * POST /api/stripe/onboard
 * Initiates Stripe Connect onboarding for the authenticated user.
 */
export async function POST(req: NextRequest) {
  try {
    const serverSupabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await serverSupabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await enforceRateLimit({
      key: `stripe_onboard:${user.id}`,
      limit: 10,
      windowSeconds: 60,
    })
    const body = (await req.json().catch(() => ({}))) as {
      delivery_id?: string
    }
    const deliveryId = asOptionalString(body.delivery_id, "delivery_id", 128)
    const supabase = await getSupabaseServerClient()

    const { data: profileById } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    const { data: profileByEmail } = !profileById
      ? await supabase
          .from("profiles")
          .select("*")
          .eq("email", user.email)
          .maybeSingle()
      : { data: null }

    let profile = profileById || profileByEmail
    if (!profile) {
      const { data: createdProfile } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
          },
          { onConflict: "id" },
        )
        .select("*")
        .maybeSingle()
      profile = createdProfile || null
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile initialization failed" },
        { status: 500 },
      )
    }

    const stripe = getStripe()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string

    let stripeAccountId = profile.stripe_account_id

    // 2. Create Stripe account if it doesn't exist
    if (!stripeAccountId) {
      const country = user.user_metadata?.country || "US";
      const account = await stripe.accounts.create({
        type: "express",
        country: country, // Uses the country selected during registration, defaults to US if not found
        email: profile.email || user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      stripeAccountId = account.id

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({ stripe_account_id: stripeAccountId })
        .eq("id", user.id)
      if (profileUpdateError)
        throw new Error("Failed to update Stripe account on profile.")

      // Also update any deliveries that were created before the account existed
      const { error: deliveriesUpdateError } = await supabase
        .from("deliveries")
        .update({ freelancer_stripe_account_id: stripeAccountId })
        .eq("user_id", user.id)
      if (deliveriesUpdateError)
        throw new Error("Failed to update delivery payout account.")
    }

    // 3. Create the onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/dashboard?stripe_retry=true`,
      return_url: deliveryId
        ? `${baseUrl}/onboarding-complete?delivery_id=${deliveryId}`
        : `${baseUrl}/onboarding-complete`,
      type: "account_onboarding",
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err) {
    console.error("Stripe Onboarding Error:", err)
    return NextResponse.json(
      { error: "Failed to create onboarding link" },
      { status: 500 },
    )
  }
}
