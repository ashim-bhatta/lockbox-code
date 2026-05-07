"use client";

import { useState, type DragEvent } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { StorefrontConfigDraft, StorefrontSectionDraft, StorefrontThemeDraft } from "@/lib/storefront-api";
import { coerceStorefrontTheme, createStorefrontBackground, createStorefrontCssVars } from "@/lib/storefront-theme";
import type { SectionInsertionPlacement } from "@/components/storefront-builder/storefront-builder-types";
import {
  StorefrontSectionContent,
  StorefrontSiteHeader,
  type StorefrontWebsiteProduct,
} from "@/components/storefront/StorefrontWebsiteSections";

type PreviewProfile = {
  name: string;
  avatar_url: string | null;
  title: string | null;
  description: string | null;
  handle: string | null;
};

type PreviewProduct = StorefrontWebsiteProduct & {
  is_listed: boolean;
};

export function StorefrontPreview({
  config,
  profile,
  products,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onDuplicateSection,
  onToggleSection,
  onMoveSection,
  onReorderSection,
}: {
  config: StorefrontConfigDraft;
  profile: PreviewProfile;
  products: PreviewProduct[];
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
  onAddSection?: (placement: SectionInsertionPlacement) => void;
  onDuplicateSection?: (id: string) => void;
  onToggleSection?: (id: string) => void;
  onMoveSection?: (id: string, direction: "up" | "down") => void;
  onReorderSection?: (activeId: string, overId: string) => void;
}) {
  const theme = coerceStorefrontTheme(config.theme as StorefrontThemeDraft);
  const cssVars = createStorefrontCssVars(theme);
  const background = createStorefrontBackground(theme);
  const sections = (config.sections || []).filter((section) => section.enabled);
  const listedProducts = products.filter((product) => product.is_listed);
  const hasProductsSection = sections.some((section) => section.type === "products_grid");
  const hasFaqSection = sections.some((section) => section.type === "faq");
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  return (
    <div
      className="border-razor overflow-hidden bg-background text-on-background shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
      style={{ ...cssVars, borderRadius: theme.radius }}
    >
      <div
        style={{
          background,
          color: theme.text,
        }}
      >
        <StorefrontSiteHeader
          profile={profile}
          mode="preview"
          showProducts={hasProductsSection}
          showFaq={hasFaqSection}
        />

        <div className="py-2">
          {sections.length === 0 ? (
            <div className="mx-auto my-10 max-w-3xl border-razor bg-surface-container-low p-10 text-center">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.28em] text-on-surface-variant">
                Empty storefront
              </div>
              <div className="mt-3 font-headline-md text-2xl text-on-surface">
                Add a section to start shaping the page.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sections.map((section, index) => (
                <PreviewSection
                  key={section.id}
                  section={section}
                  index={index}
                  total={sections.length}
                  highlight={selectedSectionId === section.id}
                  dragOver={dragOverId === section.id}
                  onClick={() => onSelectSection(section.id)}
                  onAddSection={onAddSection}
                  onDuplicateSection={onDuplicateSection}
                  onToggleSection={onToggleSection}
                  onMoveSection={onMoveSection}
                  onDragEnter={() => setDragOverId(section.id)}
                  onDragLeave={() => setDragOverId((prev) => (prev === section.id ? null : prev))}
                  onDrop={(activeId) => {
                    if (!onReorderSection) return;
                    onReorderSection(activeId, section.id);
                    setDragOverId(null);
                  }}
                  profile={profile}
                  products={listedProducts}
                  accent={theme.primary}
                  allowReorder={Boolean(onReorderSection)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewSection({
  section,
  index,
  total,
  highlight,
  dragOver,
  onClick,
  onAddSection,
  onDuplicateSection,
  onToggleSection,
  onMoveSection,
  onDragEnter,
  onDragLeave,
  onDrop,
  profile,
  products,
  accent,
  allowReorder,
}: {
  section: StorefrontSectionDraft;
  index: number;
  total: number;
  highlight: boolean;
  dragOver: boolean;
  onClick: () => void;
  onAddSection?: (placement: SectionInsertionPlacement) => void;
  onDuplicateSection?: (id: string) => void;
  onToggleSection?: (id: string) => void;
  onMoveSection?: (id: string, direction: "up" | "down") => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (activeId: string) => void;
  profile: PreviewProfile;
  products: StorefrontWebsiteProduct[];
  accent: string;
  allowReorder: boolean;
}) {
  const outline = highlight
    ? `0 0 0 1px ${accent}aa, 0 0 30px ${accent}30`
    : dragOver
      ? `0 0 0 1px ${accent}55, 0 0 50px ${accent}25`
      : "none";

  const dragProps = allowReorder
    ? {
        onDragOver: (event: DragEvent) => {
          event.preventDefault();
        },
        onDragEnter: () => onDragEnter(),
        onDragLeave: () => onDragLeave(),
        onDrop: (event: DragEvent) => {
          event.preventDefault();
          const activeId = event.dataTransfer.getData("text/plain");
          if (!activeId) return;
          onDrop(activeId);
        },
      }
    : {};

  return (
    <div
      onClick={onClick}
      style={{ boxShadow: outline }}
      className="group relative cursor-pointer transition-premium"
      {...dragProps}
    >
      <div
        className={[
          "absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 transition-premium",
          highlight ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
        ].join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="border-razor bg-black/80 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface backdrop-blur">
          {section.type}
        </span>
        <PreviewToolButton label="Edit" icon="tune" onClick={onClick} />
        {onAddSection ? (
          <>
            <PreviewToolButton
              label="Add above"
              icon="arrow_upward"
              onClick={() => onAddSection({ position: "above", sectionId: section.id })}
            />
            <PreviewToolButton
              label="Add below"
              icon="add"
              onClick={() => onAddSection({ position: "below", sectionId: section.id })}
            />
          </>
        ) : null}
        {onDuplicateSection ? <PreviewToolButton label="Duplicate" icon="content_copy" onClick={() => onDuplicateSection(section.id)} /> : null}
        {onToggleSection ? <PreviewToolButton label="Hide" icon="visibility" onClick={() => onToggleSection(section.id)} /> : null}
        {onMoveSection ? (
          <>
            <PreviewToolButton label="Move up" icon="arrow_upward" disabled={index === 0} onClick={() => onMoveSection(section.id, "up")} />
            <PreviewToolButton label="Move down" icon="arrow_forward" disabled={index === total - 1} onClick={() => onMoveSection(section.id, "down")} />
          </>
        ) : null}
      </div>
      {allowReorder ? (
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", section.id);
          }}
          onClick={(event) => event.stopPropagation()}
          title="Drag to reorder"
          className="border-razor absolute right-4 top-4 z-10 inline-flex items-center gap-2 bg-black/70 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-0 backdrop-blur transition-premium hover:text-on-surface group-hover:opacity-100 group-focus-within:opacity-100"
        >
          Drag
        </button>
      ) : null}
      <StorefrontSectionContent section={section} profile={profile} products={products} mode="preview" />
    </div>
  );
}

function PreviewToolButton({
  label,
  icon,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: Parameters<typeof AppIcon>[0]["name"];
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="border-razor inline-flex min-h-10 items-center gap-2 bg-black/80 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant backdrop-blur transition-premium hover:text-on-surface disabled:opacity-35"
      onClick={onClick}
      disabled={disabled}
    >
      <AppIcon name={icon} size={13} className={icon === "arrow_forward" ? "rotate-90" : undefined} />
      {label}
    </button>
  );
}
