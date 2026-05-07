"use client";

import { DashboardPageHeader, MutedActionButton } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { PaymentTxRow } from "@/server/services/payments-service";

export function PaymentsHeader({ txRows }: { txRows: PaymentTxRow[] }) {
  function handleExport() {
    const header = ["date", "client", "lockbox", "gross", "fees", "net", "status"];
    const lines = txRows.map((row) =>
      [row.date, row.client, row.lockbox, row.gross, row.fees, row.net, row.status]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "payments.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardPageHeader
      title="Payments & Payouts"
      subtitle="Manage your earnings, fees, and connected Stripe account."
      actions={
        <MutedActionButton className="hover:bg-surface-container-high" onClick={handleExport} disabled={txRows.length === 0}>
          <AppIcon name="download" size={14} />
          <span>Export CSV</span>
        </MutedActionButton>
      }
    />
  );
}
