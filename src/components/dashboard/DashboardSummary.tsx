"use client";

import { DashboardSummaryCard } from "@/components/dashboard/DashboardSummaryCard";
import type { DashboardStats } from "@/components/dashboard/types";

export function DashboardSummary({ stats }: { stats: DashboardStats }) {
  const revenue = Number.parseFloat(stats.totalRevenueLabel.replace(/[$,]/g, "")) || 0;
  const tips = Number.parseFloat(stats.totalTipsLabel.replace(/[$,]/g, "")) || 0;
  const activeLinks = Number.parseInt(stats.activeLinksLabel, 10) || 0;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <DashboardSummaryCard
        label="Total Revenue"
        value={stats.totalRevenueLabel}
        icon="payments"
        accentText={revenue > 0 ? "Revenue captured from paid lockboxes" : "No revenue yet"}
        showTrendUp={revenue > 0}
      />
      <DashboardSummaryCard
        label="Active Links"
        value={stats.activeLinksLabel}
        icon="link"
        accentText={activeLinks > 0 ? `${activeLinks} lockbox${activeLinks === 1 ? "" : "es"} awaiting payment` : "No active lockboxes"}
        showTrendUp={false}
      />
      <DashboardSummaryCard
        label="Total Tips"
        value={stats.totalTipsLabel}
        icon="favorite"
        accentText={tips > 0 ? "Tips received from clients" : "No tips yet"}
        showTrendUp={tips > 0}
      />
    </div>
  );
}
