"use client";

import type { ReactNode } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function StorefrontMobileEditSheet({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 xl:hidden">
      <button
        type="button"
        aria-label="Close section editor"
        className="absolute inset-x-0 bottom-full h-screen cursor-default bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <section className="relative max-h-[84svh] overflow-hidden border-t border-white/10 bg-surface-container-low shadow-[0_-24px_90px_rgba(0,0,0,0.45)]">
        <div className="mx-auto mt-3 h-1 w-12 rounded-full bg-white/20" />
        <header className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
          <div className="min-w-0">
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              Section editor
            </div>
            <h2 className="truncate font-headline-md text-xl text-on-surface">{title}</h2>
          </div>
          <button
            type="button"
            className="border-razor grid h-11 w-11 shrink-0 place-items-center bg-black text-on-surface-variant hover:text-on-surface"
            onClick={onClose}
          >
            <AppIcon name="close" size={16} />
          </button>
        </header>
        <div className="max-h-[calc(84svh-92px)] overflow-y-auto p-4">{children}</div>
      </section>
    </div>
  );
}
