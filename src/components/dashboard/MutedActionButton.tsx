"use client";

import type { ReactNode } from "react";

export function MutedActionButton({
  children,
  className = "",
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`border-razor flex items-center gap-3 bg-surface-container-high px-6 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface transition-premium hover:border-primary/40 hover:bg-black disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}
