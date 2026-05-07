"use client";

import type { ReactNode } from "react";

export function FieldLabel({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`ml-1 block font-label-sm text-label-sm text-on-surface-variant ${className}`} htmlFor={htmlFor}>
      {children}
    </label>
  );
}
