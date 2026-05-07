"use client";

import type { ReactNode } from "react";

export function SettingsSectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="border-razor relative bg-surface-container-low p-10">
      <div className="absolute top-0 right-0 h-4 w-4 border-r border-t border-primary/20" />
      <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/20" />
      
      <div className="mb-10">
        <h3 className="font-display-lg text-2xl uppercase tracking-tight text-on-surface">{title}</h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1 w-1 bg-primary" />
          <p className="font-mono-data text-[9px] uppercase tracking-[0.2em] text-on-surface-variant">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
