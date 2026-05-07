export type DashboardNavKey = "overview" | "lockboxes" | "payments" | "analytics" | "settings";

export const navItems: Array<{ key: DashboardNavKey; label: string; icon: "dashboard" | "lock" | "payments" | "bar_chart" | "settings"; href: string }> = [
  { key: "overview", label: "Overview", icon: "dashboard", href: "/dashboard" },
  { key: "lockboxes", label: "Lockboxes", icon: "lock", href: "/lockboxes" },
  { key: "payments", label: "Payments", icon: "payments", href: "/payments" },
  { key: "analytics", label: "Analytics", icon: "bar_chart", href: "/analytics" },
  { key: "settings", label: "Settings", icon: "settings", href: "/settings" },
];
