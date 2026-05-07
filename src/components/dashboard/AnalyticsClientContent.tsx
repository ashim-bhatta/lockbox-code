"use client";

import { useMemo, useState } from "react";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { AnalyticsHeader } from "@/components/dashboard/AnalyticsHeader";
import { AnalyticsMetrics } from "@/components/dashboard/AnalyticsMetrics";

type AnalyticsPayload = {
  metrics: {
    averageTipPercentLabel: string;
    conversionRateLabel: string;
    topPerformingLabel: string;
    topPerformingValueLabel: string;
  };
  charts: {
    revenueTotalLabel: string;
    revenueSeries: Array<{ x: string; y: number }>;
    lockboxPerformance: number[];
  };
};

export function AnalyticsClientContent({ initial }: { initial: AnalyticsPayload }) {
  const [payload, setPayload] = useState(initial);
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const defaultFrom = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(defaultFrom);
  const [dateTo, setDateTo] = useState(defaultTo);

  async function fetchRange(from: string, to: string) {
    const res = await fetch(`/api/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      cache: "no-store",
    });
    if (!res.ok) return;
    const data = (await res.json()) as AnalyticsPayload;
    setPayload(data);
  }

  async function handleApplyRange(from: string, to: string) {
    setDateFrom(from);
    setDateTo(to);
    await fetchRange(from, to);
  }

  async function handleClearRange() {
    setDateFrom(defaultFrom);
    setDateTo(defaultTo);
    await fetchRange(defaultFrom, defaultTo);
  }

  const exportRows = useMemo(
    () => payload.charts.revenueSeries.map((point) => `${point.x},${point.y}`),
    [payload.charts.revenueSeries]
  );
  const canExport = exportRows.length > 0;

  function handleExport() {
    if (!canExport) return;
    const csv = ["timestamp,revenue_cents", ...exportRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${dateFrom}-to-${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <AnalyticsHeader
        dateFrom={dateFrom}
        dateTo={dateTo}
        onApplyRange={handleApplyRange}
        onClearRange={handleClearRange}
        onExport={handleExport}
        canExport={canExport}
      />
      <AnalyticsMetrics
        averageTipPercentLabel={payload.metrics.averageTipPercentLabel}
        conversionRateLabel={payload.metrics.conversionRateLabel}
        topPerformingLabel={payload.metrics.topPerformingLabel}
        topPerformingValueLabel={payload.metrics.topPerformingValueLabel}
      />
      <AnalyticsCharts
        revenueTotalLabel={payload.charts.revenueTotalLabel}
        revenueSeries={payload.charts.revenueSeries}
        lockboxPerformance={payload.charts.lockboxPerformance}
      />
    </>
  );
}
