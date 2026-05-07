"use client";

import type { ReactNode } from "react";

export function GhostAction({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container/50 px-4 py-2.5 font-label-sm text-label-sm text-on-surface transition-all duration-300 hover:border-primary-container/60 hover:bg-surface-container hover:shadow-[0_0_15px_rgba(85,141,255,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:border-outline-variant/40 disabled:hover:bg-surface-container/50 disabled:hover:shadow-none"
    >
      {children}
    </button>
  );
}
