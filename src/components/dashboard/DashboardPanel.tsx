"use client";

import type { ReactNode } from "react";

export function DashboardPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-panel rounded-xl p-6 ${className}`}>{children}</div>;
}
