import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  PaymentsHeader,
  PaymentsSummaryGrid,
  PaymentsTransactions,
} from "@/components/dashboard/PaymentsSections";
import { getPaymentsSummary, getPaymentTransactions } from "@/server/services/payments-service";
import { getProfileByUserId } from "@/server/services/profile-service";
import { getRequestUser } from "@/server/services/auth-service";
import { getStripe } from "@/lib/stripe";

export default async function PaymentsPage() {
  const user = await getRequestUser();
  if (!user) return null;
  const [summary, txRows, profile] = await Promise.all([
    getPaymentsSummary(user.id),
    getPaymentTransactions(user.id),
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
    <DashboardLayout activeNav="payments">
      <PaymentsHeader txRows={txRows} />
      <PaymentsSummaryGrid
        pendingBalanceLabel={summary.pendingBalanceLabel}
        nextPayoutLabel={summary.nextPayoutLabel}
        nextPayoutDateLabel={summary.nextPayoutDateLabel}
        hasAccountId={Boolean(profile?.stripe_account_id)}
        isFullyConnected={Boolean(profile?.stripe_account_id) && detailsSubmitted}
      />
      <PaymentsTransactions txRows={txRows} />
    </DashboardLayout>
  );
}
