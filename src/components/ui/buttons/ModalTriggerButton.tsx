"use client";

import type { ReactNode } from "react";

export function ModalTriggerButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3 font-label-sm text-label-sm text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-colors hover:bg-primary-container ${className}`}
    >
      {children}
    </button>
  );
}
