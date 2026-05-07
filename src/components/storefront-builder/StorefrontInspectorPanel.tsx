"use client";

import { TabButton } from "@/components/storefront-builder/StorefrontBuilderFields";
import { StorefrontHistoryInspector } from "@/components/storefront-builder/StorefrontHistoryInspector";
import { StorefrontSectionInspector } from "@/components/storefront-builder/StorefrontSectionInspector";
import { StorefrontThemeInspector } from "@/components/storefront-builder/StorefrontThemeInspector";
import type {
  InspectorTab,
  LockboxRow,
  RevisionHistoryRow,
} from "@/components/storefront-builder/storefront-builder-types";
import type { StorefrontSectionDraft, StorefrontThemeDraft } from "@/lib/storefront-api";

export function StorefrontInspectorPanel({
  tab,
  selected,
  theme,
  products,
  historyRows,
  publishedRevisionId,
  paneScrollClassName,
  onTabChange,
  onSectionChange,
  onThemeChange,
  onRollback,
  onDuplicateSection,
  onDeleteSection,
}: {
  tab: InspectorTab;
  selected: StorefrontSectionDraft | null;
  theme: StorefrontThemeDraft;
  products: LockboxRow[];
  historyRows: RevisionHistoryRow[];
  publishedRevisionId: string | null;
  paneScrollClassName: string;
  onTabChange: (tab: InspectorTab) => void;
  onSectionChange: (next: StorefrontSectionDraft) => void;
  onThemeChange: (next: StorefrontThemeDraft) => void;
  onRollback: (id: string) => void;
  onDuplicateSection: (id: string) => void;
  onDeleteSection: (id: string) => void;
}) {
  return (
    <div className="border-razor flex min-h-0 flex-col bg-surface-container-low shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
      <div className="flex flex-col gap-3 border-b border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          Edit
        </div>
        <div className="flex flex-wrap gap-2">
          <TabButton label="Content" active={tab === "section"} onClick={() => onTabChange("section")} />
          <TabButton label="Design" active={tab === "theme"} onClick={() => onTabChange("theme")} />
          <TabButton label="History" active={tab === "history"} onClick={() => onTabChange("history")} />
        </div>
      </div>

      <div className={`${paneScrollClassName} p-5`}>
        {tab === "section" ? (
          selected ? (
            <StorefrontSectionInspector
              section={selected}
              products={products}
              onChange={onSectionChange}
              onDuplicate={onDuplicateSection}
              onDelete={onDeleteSection}
            />
          ) : (
            <div className="border-razor bg-black/35 p-6 text-sm leading-6 text-on-surface-variant">
              <div className="mb-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
                Nothing selected
              </div>
              Select a section from the preview or section list to edit copy, products, images, and visibility.
            </div>
          )
        ) : null}

        {tab === "theme" ? <StorefrontThemeInspector theme={theme} onChange={onThemeChange} /> : null}

        {tab === "history" ? (
          <StorefrontHistoryInspector
            rows={historyRows}
            publishedRevisionId={publishedRevisionId}
            onRollback={onRollback}
          />
        ) : null}
      </div>
    </div>
  );
}
