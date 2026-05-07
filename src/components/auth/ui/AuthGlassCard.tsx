"use client";

import type { ReactNode } from "react";

export function AuthGlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative border-razor bg-surface-container-low p-12 shadow-2xl ${className}`}>
      <div className="absolute top-0 right-0 h-6 w-6 border-r border-t border-primary/20" />
      <div className="absolute bottom-0 left-0 h-6 w-6 border-b border-l border-primary/20" />
      {children}
    </div>
  );
}
