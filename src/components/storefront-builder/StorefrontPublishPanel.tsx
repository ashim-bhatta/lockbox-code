"use client";

import Link from "next/link";
import { CopyButton } from "@/components/ui/feedback/CopyButton";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { StorefrontValidationSummary } from "@/components/storefront-builder/StorefrontValidationSummary";
import type { BuilderValidationItem } from "@/components/storefront-builder/storefront-builder-types";

export function StorefrontPublishPanel({
  publicPath,
  publicUrl,
  publishedRevisionId,
  validationItems,
  busyPublish,
  canPublish,
  onPublish,
  onSelectSection,
}: {
  publicPath: string;
  publicUrl: string;
  publishedRevisionId: string | null;
  validationItems: BuilderValidationItem[];
  busyPublish: boolean;
  canPublish: boolean;
  onPublish: () => void;
  onSelectSection: (id: string) => void;
}) {
  const firstBlocker = validationItems.find((item) => item.severity === "error");
  const warnings = validationItems.filter((item) => item.severity === "warning").length;
  const published = Boolean(publishedRevisionId);

  return (
    <div className="border-razor bg-surface-container-low p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            Publish
          </div>
          <h2 className="mt-1 font-headline-md text-headline-md text-on-surface">
            {firstBlocker ? "Fix blockers first" : warnings > 0 ? "Ready with notes" : "Ready to go live"}
          </h2>
        </div>
        <div className={["h-3 w-3 rounded-full", firstBlocker ? "bg-error" : "bg-secondary"].join(" ")} />
      </div>

      <div className="mt-5">
        <StorefrontValidationSummary items={validationItems} maxItems={3} onSelectSection={onSelectSection} />
      </div>

      {firstBlocker ? (
        <div className="mt-4 border border-error/35 bg-error/10 p-4 text-sm leading-6 text-on-surface-variant">
          <span className="text-error">{firstBlocker.title}.</span> {firstBlocker.body}
        </div>
      ) : null}

      <button
        type="button"
        className="btn-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 px-6 py-3 font-mono-data text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-40"
        onClick={onPublish}
        disabled={!canPublish}
      >
        <AppIcon name="bolt" size={16} />
        {busyPublish ? "Publishing..." : "Publish storefront"}
      </button>

      {published ? (
        <div className="mt-5 border-t border-white/10 pt-5">
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
            Live page
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={publicPath}
              target="_blank"
              rel="noreferrer"
              className="border-razor inline-flex min-h-10 items-center gap-2 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
            >
              <AppIcon name="link" size={14} />
              Open live page
            </Link>
            <div className="border-razor bg-black/40 p-1">
              <CopyButton
                text={publicUrl}
                className="rounded-none bg-transparent px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"
                feedbackClassName="text-xs"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
