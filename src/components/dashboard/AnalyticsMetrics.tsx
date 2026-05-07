"use client";

import { AnalyticsMetricCard } from "@/components/dashboard/AnalyticsMetricCard";

export function AnalyticsMetrics({
  averageTipPercentLabel,
  conversionRateLabel,
  topPerformingLabel,
  topPerformingValueLabel,
}: {
  averageTipPercentLabel: string;
  conversionRateLabel: string;
  topPerformingLabel: string;
  topPerformingValueLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <AnalyticsMetricCard title="Average Tip %" value={averageTipPercentLabel} icon="favorite" delta="Live" />
      <AnalyticsMetricCard title="Conversion Rate" value={conversionRateLabel} icon="filter_list" delta="Live" />
      <AnalyticsMetricCard title={topPerformingLabel} value={topPerformingValueLabel} icon="bar_chart" delta="Top" />
    </div>
  );
}
