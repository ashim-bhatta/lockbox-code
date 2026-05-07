"use client";

import type { ReactNode } from "react";

export function PrimaryAction({
  children,
  className = "",
  disabled = false,
}: {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container px-4 py-3 font-label-sm text-label-sm font-semibold uppercase tracking-wider text-on-primary-container shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_10px_rgba(85,141,255,0.1)] transition-all duration-300 hover:bg-[#6b9dff] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_20px_rgba(85,141,255,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-primary-container disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_10px_rgba(85,141,255,0.1)] ${className}`}
    >
      {children}
    </button>
  );
}
