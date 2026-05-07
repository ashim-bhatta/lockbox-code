"use client";

import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";

export function AnalyticsCharts({
  revenueTotalLabel,
  revenueSeries,
  lockboxPerformance,
}: {
  revenueTotalLabel: string;
  revenueSeries: Array<{ x: string; y: number }>;
  lockboxPerformance: number[];
}) {
  const bars =
    lockboxPerformance.length >= 4
      ? lockboxPerformance.slice(0, 4)
      : [...lockboxPerformance, ...new Array(Math.max(0, 4 - lockboxPerformance.length)).fill(0)];
  const max = Math.max(1, ...bars);
  const heights = bars.map((value) => Math.max(12, Math.round((value / max) * 100)));

  const chartValues = revenueSeries.map((item) => item.y);
  const maxRevenue = Math.max(1, ...chartValues);
  const points = revenueSeries.length > 1
    ? revenueSeries.map((item, idx) => {
        const x = (idx / (revenueSeries.length - 1)) * 100;
        const y = 100 - (item.y / maxRevenue) * 80;
        return `${x},${y}`;
      }).join(" ")
    : "";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <DashboardPanel className="flex flex-col border border-outline-variant/30 bg-surface/80 backdrop-blur-[20px] transition-colors hover:border-primary/20 xl:col-span-2">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-body-base text-body-base font-semibold text-on-surface">Revenue over time</h3>
          <h4 className="font-headline-md text-headline-md text-on-surface">{revenueTotalLabel}</h4>
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
        <h3 className="mb-4 font-body-base text-body-base font-semibold text-on-surface">Link Performance</h3>
        <div className="flex h-48 items-end justify-around border-b border-outline-variant/30 pb-2">
          <div className="w-8 rounded-t-sm bg-surface-container-high" style={{ height: `${heights[0]}%` }} />
          <div className="w-8 rounded-t-sm bg-surface-container-high" style={{ height: `${heights[1]}%` }} />
          <div className="w-8 rounded-t-sm bg-surface-container-high" style={{ height: `${heights[2]}%` }} />
          <div className="w-8 rounded-t-sm bg-surface-container-high" style={{ height: `${heights[3]}%` }} />
        </div>
      </DashboardPanel>
    </div>
  );
}
