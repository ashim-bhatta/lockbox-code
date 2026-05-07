"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function ResponsiveDialog({
  open,
  title,
  onClose,
  children,
  showHeader = true,
  panelClassName = "",
  contentClassName = "",
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  showHeader?: boolean;
  panelClassName?: string;
  contentClassName?: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    const focusable = panelRef.current?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusableElements = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
      if (focusableElements.length === 0) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <div 
        className="noise-bg absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={showHeader ? titleId : undefined}
        className={`relative flex max-h-[90vh] w-full max-w-2xl flex-col border-razor bg-surface shadow-[0_0_100px_rgba(0,0,0,0.8)] ${panelClassName}`}
      >
        <div className="absolute top-0 right-0 h-4 w-4 border-r border-t border-primary/40" />
        <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/40" />

        {showHeader ? (
          <header className="flex items-center justify-between border-b border-white/5 bg-surface/95 px-8 py-6">
            <div className="flex flex-col">
              <h2 id={titleId} className="font-display-lg text-xl uppercase tracking-tight text-on-surface">
                {title}
              </h2>
              <span className="font-mono-data mt-1 text-[8px] uppercase tracking-widest text-outline-variant">
                Node_Session: {titleId.replace(/:/g, '')}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="border-razor p-3 text-on-surface-variant transition-premium hover:bg-surface-container hover:text-on-surface"
            >
              <AppIcon name="close" size={16} />
            </button>
          </header>
        ) : null}

        <div className={`overflow-y-auto px-8 pb-10 pt-8 ${contentClassName}`}>
          {children}
        </div>

        <footer className="border-t border-white/5 bg-surface-container-lowest px-8 py-3">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 bg-primary" />
            <span className="font-mono-data text-[8px] uppercase tracking-[0.3em] text-outline-variant">
              System_Safe_Boundary
            </span>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
