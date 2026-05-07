"use client";

import type { ReactNode } from "react";

export function DashboardPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="font-display-lg text-display-lg text-on-surface">{title}</h2>
        <p className="mt-2 font-body-base text-body-base text-on-surface-variant">{subtitle}</p>
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}
