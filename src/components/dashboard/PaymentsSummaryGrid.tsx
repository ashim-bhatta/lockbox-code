"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { PaymentsSummaryCard } from "@/components/dashboard/PaymentsSummaryCard";
import { StripeConnectButton } from "@/components/dashboard/StripeConnectButton";
import { StripeLoginButton } from "@/components/dashboard/StripeLoginButton";

export function PaymentsSummaryGrid({
  pendingBalanceLabel,
  nextPayoutLabel,
  nextPayoutDateLabel,
  hasAccountId,
  isFullyConnected,
}: {
  pendingBalanceLabel: string;
  nextPayoutLabel: string;
  nextPayoutDateLabel: string;
  hasAccountId: boolean;
  isFullyConnected: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <PaymentsSummaryCard title="Pending Balance" value={pendingBalanceLabel} subtitle="Awaiting settlement" />
      <PaymentsSummaryCard title="Next Payout" value={nextPayoutLabel} subtitle={`Estimated for ${nextPayoutDateLabel}`} />
      <DashboardPanel className="border-primary/20">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Payout Settings</h3>
          <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${isFullyConnected ? "border-secondary/20 bg-secondary/10 text-secondary" : "border-tertiary/20 bg-tertiary/10 text-tertiary"}`}>{isFullyConnected ? "CONNECTED" : "ACTION NEEDED"}</span>
        </div>
        {hasAccountId ? (
          <StripeLoginButton
            label={isFullyConnected ? "Manage Stripe Account" : "Complete Stripe Onboarding"}
            className="block w-full rounded border border-outline-variant bg-surface-container-high px-4 py-2 text-center font-label-sm text-label-sm text-on-surface transition-colors hover:border-primary/50"
          />
        ) : (
          <StripeConnectButton
            label="Connect Stripe"
            className="block w-full rounded border border-outline-variant bg-surface-container-high px-4 py-2 text-center font-label-sm text-label-sm text-on-surface transition-colors hover:border-primary/50"
          />
        )}
      </DashboardPanel>
    </div>
  );
}
