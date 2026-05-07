import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SettingsContent, SettingsHeader } from "@/components/dashboard/SettingsSections";
import { getProfileByUserId } from "@/server/services/profile-service";
import { getRequestUser } from "@/server/services/auth-service";
import { getStripe } from "@/lib/stripe";

export default async function SettingsPage() {
  const user = await getRequestUser();
  if (!user) return null;
  const profile = await getProfileByUserId(user.id);

  let detailsSubmitted = false;
  if (profile?.stripe_account_id) {
    try {
      const stripe = getStripe();
      const account = await stripe.accounts.retrieve(profile.stripe_account_id);
      detailsSubmitted = account.details_submitted;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <DashboardLayout activeNav="settings">
      <SettingsHeader />
      <SettingsContent
        profile={{
          full_name: profile?.full_name || user.user_metadata?.full_name || "User",
          email: profile?.email || user.email || "",
          country: user.user_metadata?.country || "US",
          stripe_account_id: profile?.stripe_account_id || null,
          stripe_details_submitted: detailsSubmitted,
          payout_currency: profile?.payout_currency || "USD",
          avatar_url: profile?.avatar_url || null,
          storefront_enabled: Boolean((profile as { storefront_enabled?: boolean } | null)?.storefront_enabled),
          storefront_handle: (profile as { storefront_handle?: string | null } | null)?.storefront_handle || "",
          storefront_title: (profile as { storefront_title?: string | null } | null)?.storefront_title || "",
          storefront_description: (profile as { storefront_description?: string | null } | null)?.storefront_description || "",
        }}
      />
    </DashboardLayout>
  );
}
