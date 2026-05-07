"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";
import { TechnicalCard } from "@/components/ui/cards/TechnicalCard";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { LockboxAnalyticsPayload } from "@/server/services/lockbox-analytics-service";
import { centsToUsdLabel, toDashboardDateLabel } from "@/server/mappers/format";

function isoNow() {
  return new Date().toISOString().slice(0, 10);
}

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function LockboxAnalyticsClientContent({
  deliveryId,
  initial,
}: {
  deliveryId: string;
  initial: LockboxAnalyticsPayload;
}) {
  const now = isoNow();
  const defaultFrom = isoDaysAgo(29);
  const [payload, setPayload] = useState(initial);
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(now);

  async function fetchRange(from: string, to: string) {
    const res = await fetch(
      `/api/analytics/deliveries/${encodeURIComponent(deliveryId)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return;
    const data = (await res.json()) as LockboxAnalyticsPayload;
    setPayload(data);
  }

  async function handleApplyRange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    await fetchRange(from, to);
  }

  async function handleClearRange() {
    setDateFrom(defaultFrom);
    setDateTo(now);
    await fetchRange(defaultFrom, now);
  }

  const exportLines = useMemo(() => {
    return payload.transactions.map((row) => {
      return [
        row.created_at,
        row.client_email || "",
        row.status,
        String(row.net_amount_cents || 0),
        String(row.tip_amount_cents || 0),
        row.stripe_checkout_session_id || "",
      ]
        .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
        .join(",");
    });
  }, [payload.transactions]);

  function handleExport() {
    const header = ["created_at", "client_email", "status", "net_amount_cents", "tip_amount_cents", "stripe_checkout_session_id"];
    const csv = [header.join(","), ...exportLines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lockbox-${payload.meta.id}-analytics-${dateFrom}-to-${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const series = payload.series;
  const netValues = series.map((p) => p.net_cents);
  const maxNet = Math.max(1, ...netValues);
  const points =
    series.length > 1
      ? series
          .map((item, idx) => {
            const x = (idx / (series.length - 1)) * 100;
            const y = 100 - (item.net_cents / maxNet) * 80;
            return `${x},${y}`;
          })
          .join(" ")
      : "";

  const purchasesValues = series.map((p) => p.purchases_count);
  const maxPurchases = Math.max(1, ...purchasesValues);
  const purchaseHeights = purchasesValues.map((value) => Math.max(8, Math.round((value / maxPurchases) * 100)));

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <Link
          href="/lockboxes"
          className="inline-flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <AppIcon name="arrow_back" size={16} />
          Back to lockboxes
        </Link>
        <div className="hidden text-right font-mono-data text-[10px] uppercase tracking-widest text-outline-variant md:block">
          LOCKBOX_ID: {payload.meta.id}
        </div>
      </div>

      <AnalyticsHeader
        title={payload.meta.title}
        subtitle="LOCKBOX_ANALYTICS_V1"
        dateFrom={dateFrom}
        dateTo={dateTo}
        onApplyRange={handleApplyRange}
        onClearRange={handleClearRange}
        onExport={handleExport}
        canExport={payload.transactions.length > 0}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <TechnicalCard title="Views" subtitle="TOTAL" icon="visibility" value={String(payload.metrics.views)} />
        <TechnicalCard title="Paid Purchases" subtitle="RANGE" icon="payments" value={String(payload.metrics.purchases_paid)} />
        <TechnicalCard title="Unique Buyers" subtitle="RANGE" icon="group" value={String(payload.metrics.unique_buyers)} />
        <TechnicalCard title="Checkouts Started" subtitle="RANGE" icon="credit_card" value={String(payload.metrics.checkouts_started)} />
        <TechnicalCard title="Conversion" subtitle="PAID/VIEWS" icon="trending_up" value={payload.metrics.conversion_rate_label} />
        <TechnicalCard title="Net Revenue" subtitle="RANGE" icon="account_balance_wallet" value={payload.metrics.net_revenue_label} />
        <TechnicalCard title="Tips" subtitle="RANGE" icon="coffee" value={payload.metrics.tips_total_label} />
        <TechnicalCard title="Refunds" subtitle="RANGE" icon="alert_triangle" value={String(payload.metrics.refunds_count)} />
        <TechnicalCard title="Usage" subtitle="PROGRESS" icon="bar_chart" value={payload.metrics.usage_progress_label} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <DashboardPanel className="flex flex-col border border-outline-variant/30 bg-surface/80 backdrop-blur-[20px] transition-colors hover:border-primary/20 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="font-body-base text-body-base font-semibold text-on-surface">Net revenue over time</h3>
            <h4 className="font-headline-md text-headline-md text-on-surface">{payload.metrics.net_revenue_label}</h4>
          </div>
          <div className="relative mt-auto h-64 w-full">
            <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
              {points ? (
                <polyline fill="none" points={points} stroke="#b0c6ff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              ) : (
                <line x1="0" y1="80" x2="100" y2="80" stroke="#4b5563" strokeWidth="1" />
              )}
            </svg>
          </div>
        </DashboardPanel>

        <DashboardPanel className="border border-outline-variant/30 bg-surface/80 backdrop-blur-[20px] transition-colors hover:border-primary/20">
          <h3 className="mb-4 font-body-base text-body-base font-semibold text-on-surface">Purchases per day</h3>
          <div className="flex h-48 items-end justify-around border-b border-outline-variant/30 pb-2">
            {(purchaseHeights.length ? purchaseHeights : [0, 0, 0, 0]).slice(-12).map((height, idx) => (
              <div key={idx} className="w-4 rounded-t-sm bg-surface-container-high" style={{ height: `${height}%` }} />
            ))}
          </div>
        </DashboardPanel>
      </div>

      <DashboardPanel className="overflow-hidden border border-white/5 p-0">
        <div className="flex flex-col items-start justify-between space-y-4 border-b border-white/5 p-6 sm:flex-row sm:items-center sm:space-y-0">
          <h3 className="font-headline-md text-lg text-on-surface">Recent Transactions</h3>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-outline-variant">
            {dateFrom} → {dateTo}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-white/5 bg-surface-container-lowest/50 font-label-sm text-label-sm uppercase tracking-wider text-outline">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Buyer</th>
                <th className="p-4 text-right font-medium">Net</th>
                <th className="p-4 text-right font-medium">Tip</th>
                <th className="p-4 text-center font-medium">Status</th>
                <th className="p-4 font-medium">Session</th>
              </tr>
            </thead>
            <tbody className="font-mono-data text-mono-data text-on-surface-variant">
              {payload.transactions.map((row) => (
                <tr key={row.stripe_checkout_session_id || `${row.created_at}-${row.client_email || "unknown"}`} className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap p-4 text-on-surface">{toDashboardDateLabel(row.created_at)}</td>
                  <td className="p-4 text-on-surface">{row.client_email || "Unknown"}</td>
                  <td className="whitespace-nowrap p-4 text-right">{centsToUsdLabel(row.net_amount_cents)}</td>
                  <td className="whitespace-nowrap p-4 text-right text-outline">{centsToUsdLabel(row.tip_amount_cents)}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex rounded-full border border-outline-variant/40 bg-surface-container-high px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-mono-data text-[10px] text-outline-variant">{row.stripe_checkout_session_id || "-"}</td>
                </tr>
              ))}
              {payload.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-on-surface-variant">
                    No transactions in this range.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    </div>
  );
}

