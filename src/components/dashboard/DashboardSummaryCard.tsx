import { TechnicalCard } from "@/components/ui/cards/TechnicalCard";

export function DashboardSummaryCard({
  label,
  value,
  icon,
  accentText,
  showTrendUp = true,
}: {
  label: string;
  value: string;
  icon: "payments" | "link" | "favorite";
  accentText: string;
  showTrendUp?: boolean;
}) {
  return (
    <TechnicalCard
      title={label}
      subtitle="UPLINK: NODE_01"
      icon={icon}
      value={value}
      badge={showTrendUp ? <span className="badge-matrix">UPLINK_ACTIVE</span> : null}
      footer={
        <span className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant group-hover:text-on-surface-variant transition-premium">
          {accentText.toUpperCase()}
        </span>
      }
    />
  );
}
