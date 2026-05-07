"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function PaymentsSummaryCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <DashboardPanel className="group relative overflow-hidden">
      <div className="mb-4 flex items-center gap-2">
        <AppIcon name="payments" className="text-outline" size={14} />
        <h3 className="font-label-sm text-label-sm uppercase tracking-wider text-outline">{title}</h3>
      </div>
      <div className="mb-2 font-display-lg text-display-lg tracking-tight text-on-surface">{value}</div>
      <p className="text-sm text-on-surface-variant">{subtitle}</p>
    </DashboardPanel>
  );
}
