"use client";

import type { BuilderValidationItem } from "@/components/storefront-builder/storefront-builder-types";

function toneClasses(severity: BuilderValidationItem["severity"]) {
  if (severity === "error") return "border-error/35 bg-error/10 text-error";
  if (severity === "warning") return "border-tertiary/35 bg-tertiary/10 text-tertiary";
  return "border-primary/30 bg-primary/10 text-primary";
}

export function StorefrontValidationSummary({
  items,
  compact = false,
  maxItems,
  onSelectSection,
}: {
  items: BuilderValidationItem[];
  compact?: boolean;
  maxItems?: number;
  onSelectSection?: (id: string) => void;
}) {
  const errors = items.filter((item) => item.severity === "error").length;
  const warnings = items.filter((item) => item.severity === "warning").length;
  const visibleItems = typeof maxItems === "number" ? items.slice(0, maxItems) : items;
  const blockerLabel = errors === 1 ? "1 blocker" : `${errors} blockers`;
  const warningLabel = warnings === 1 ? "1 improvement" : `${warnings} improvements`;

  if (items.length === 0) {
    return (
      <div className="border-razor bg-secondary/10 px-4 py-3 text-sm text-secondary">
        No blocking issues. The storefront is structurally ready to publish.
      </div>
    );
  }

  if (compact) {
    return (
      <div className="border-razor bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        <span className="text-on-surface">{errors} errors</span>
        <span className="px-2 opacity-50">/</span>
        <span>{warnings} warnings</span>
        <span className="ml-2 opacity-70">before publishing</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          Publish checks
        </div>
        <div className="mt-1 font-headline-md text-headline-md text-on-surface">
          {errors > 0 ? blockerLabel : warnings > 0 ? warningLabel : "Helpful checks"}
        </div>
      </div>
      <div className="space-y-2">
        {visibleItems.map((item) => {
          const actionable = Boolean(item.sectionId && onSelectSection);
          const content = (
            <>
              <div className="font-label-sm text-label-sm uppercase tracking-widest">{item.title}</div>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">{item.body}</p>
            </>
          );

          if (actionable) {
            return (
              <button
                key={item.id}
                type="button"
                className={`w-full border p-4 text-left transition-premium hover:bg-surface-container ${toneClasses(item.severity)}`}
                onClick={() => onSelectSection?.(item.sectionId!)}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={item.id} className={`border p-4 ${toneClasses(item.severity)}`}>
              {content}
            </div>
          );
        })}
      </div>
      {maxItems && items.length > maxItems ? (
        <div className="text-xs text-on-surface-variant">{items.length - maxItems} more checks not shown.</div>
      ) : null}
    </div>
  );
}
