import { TechnicalCard } from "@/components/ui/cards/TechnicalCard";

export function AnalyticsMetricCard({
  title,
  value,
  icon,
  delta,
}: {
  title: string;
  value: string;
  icon: "favorite" | "filter_list" | "bar_chart";
  delta: string;
}) {
  return (
    <TechnicalCard
      title={title}
      subtitle="TEMPORAL WINDOW: 30D"
      icon={icon}
      value={value}
      badge={
        <>
          <span className="badge-matrix">{delta}</span>
          <span className="mt-1 font-mono-data text-[8px] uppercase tracking-tighter text-outline-variant">
            UPLINK_STABLE
          </span>
        </>
      }
    />
  );
}
