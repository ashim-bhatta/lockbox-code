"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`border-razor border-transparent p-3 text-on-surface-variant transition-premium hover:border-primary/20 hover:bg-surface-container hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
