import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHeader,
  DashboardStatusBanner,
  DashboardSummary,
  DashboardTable,
} from "@/components/dashboard/DashboardSections";
import { getDashboardSummaryForUser, getRecentDashboardLockboxes } from "@/server/services/dashboard-service";
import { getProfileByUserId } from "@/server/services/profile-service";
import { getRequestUser } from "@/server/services/auth-service";
import { getStripe } from "@/lib/stripe";

export default async function Dashboard() {
  const user = await getRequestUser();
  if (!user) return null;
  const [dashboardStats, dashboardLockboxes, profile] = await Promise.all([
    getDashboardSummaryForUser(user.id),
    getRecentDashboardLockboxes(user.id),
    getProfileByUserId(user.id),
  ]);

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
    <DashboardLayout activeNav="overview">
      <DashboardHeader />
      <DashboardStatusBanner
        availableBalanceLabel={dashboardStats.totalRevenueLabel}
        hasAccountId={Boolean(profile?.stripe_account_id)}
        isFullyConnected={Boolean(profile?.stripe_account_id) && detailsSubmitted}
      />
      <DashboardSummary stats={dashboardStats} />
      <DashboardTable rows={dashboardLockboxes} />
    </DashboardLayout>
  );
}
