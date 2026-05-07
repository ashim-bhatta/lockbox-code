"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";

type Tx = {
  id: string;
  date: string;
  client: string;
  lockbox: string;
  gross: string;
  fees: string;
  net: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED" | "EXPIRED";
};

export function PaymentsTransactions({ txRows }: { txRows: Tx[] }) {
  return (
    <DashboardPanel className="overflow-hidden border border-white/5 p-0">
      <div className="flex flex-col items-start justify-between space-y-4 border-b border-white/5 p-6 sm:flex-row sm:items-center sm:space-y-0">
        <h3 className="font-headline-md text-lg text-on-surface">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-white/5 bg-surface-container-lowest/50 font-label-sm text-label-sm uppercase tracking-wider text-outline">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Client / Lockbox</th>
              <th className="p-4 text-right font-medium">Gross Amount</th>
              <th className="p-4 text-right font-medium">Fees</th>
              <th className="p-4 text-right font-medium">Net Amount</th>
              <th className="p-4 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono-data text-mono-data text-on-surface-variant">
            {txRows.map((row) => (
              <tr key={row.id} className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                <td className="whitespace-nowrap p-4 text-on-surface">{row.date}</td>
                <td className="p-4">
                  <div className="font-body-base text-on-surface">{row.client}</div>
                  <div className="mt-1 flex items-center text-xs text-outline">
                    <AppIcon name="lock" className="mr-1" size={14} />
                    {row.lockbox}
                  </div>
                </td>
                <td className="whitespace-nowrap p-4 text-right">{row.gross}</td>
                <td className="whitespace-nowrap p-4 text-right text-outline">{row.fees}</td>
                <td className="whitespace-nowrap p-4 text-right text-secondary">{row.net}</td>
                <td className="p-4 text-center">
                  <span
                    className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-bold ${
                      row.status === "SUCCEEDED"
                        ? "border-secondary/20 bg-secondary/10 text-secondary"
                        : row.status === "FAILED" || row.status === "DISPUTED"
                          ? "border-error/20 bg-error/10 text-error"
                          : row.status === "REFUNDED" || row.status === "EXPIRED"
                            ? "border-outline-variant/40 bg-surface-container-high text-on-surface-variant"
                            : "border-tertiary/20 bg-tertiary/10 text-tertiary"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {txRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                  No payment transactions yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}
