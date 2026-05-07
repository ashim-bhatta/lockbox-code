"use client";

import type { DragEvent } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { StorefrontSectionDraft } from "@/lib/storefront-api";
import { getSectionLabel } from "@/components/storefront-builder/storefront-builder-utils";
import type { BuilderValidationItem } from "@/components/storefront-builder/storefront-builder-types";

export function StorefrontSectionList({
  sections,
  selectedId,
  dragOverSectionId,
  validationItems,
  paneScrollClassName,
  onOpenAdd,
  onSelect,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
  onReorder,
  onDragOverSection,
}: {
  sections: StorefrontSectionDraft[];
  selectedId: string | null;
  dragOverSectionId: string | null;
  validationItems: BuilderValidationItem[];
  paneScrollClassName: string;
  onOpenAdd: () => void;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDragOverSection: (id: string | null) => void;
}) {
  return (
    <div className="border-razor flex min-h-0 flex-col bg-surface-container-low shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            Sections
          </div>
          <div className="font-headline-md text-headline-md text-on-surface">{sections.length} sections</div>
        </div>
        <button
          type="button"
          className="border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-surface-container-high"
          onClick={onOpenAdd}
        >
          <span className="inline-flex items-center gap-2">
            <AppIcon name="add" size={14} className="text-primary" />
            Add
          </span>
        </button>
      </div>

      <div className={`${paneScrollClassName} p-2`}>
        {sections.length === 0 ? (
          <div className="border-razor bg-black/35 p-5 text-sm leading-6 text-on-surface-variant">
            <div className="mb-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
              Start with a section
            </div>
            Add a hero, products grid, or launch preset to give the storefront a usable shape.
            <button
              type="button"
              className="border-razor mt-5 min-h-11 w-full bg-black px-4 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface transition-premium hover:bg-surface-container-high"
              onClick={onOpenAdd}
            >
              Add first section
            </button>
          </div>
        ) : (
          sections.map((section, index) => (
            <SectionListItem
              key={section.id}
              section={section}
              issueTone={getSectionIssueTone(section.id, validationItems)}
              index={index}
              total={sections.length}
              active={section.id === selectedId}
              dragOver={dragOverSectionId === section.id}
              onSelect={onSelect}
              onToggle={onToggle}
              onMove={onMove}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
              onReorder={onReorder}
              onDragOverSection={onDragOverSection}
            />
          ))
        )}
      </div>
    </div>
  );
}

function getSectionIssueTone(sectionId: string, items: BuilderValidationItem[]) {
  const sectionItems = items.filter((item) => item.sectionId === sectionId);
  if (sectionItems.some((item) => item.severity === "error")) return "error";
  if (sectionItems.some((item) => item.severity === "warning")) return "warning";
  if (sectionItems.some((item) => item.severity === "tip")) return "tip";
  return null;
}

function SectionListItem({
  section,
  issueTone,
  index,
  total,
  active,
  dragOver,
  onSelect,
  onToggle,
  onMove,
  onDuplicate,
  onDelete,
  onReorder,
  onDragOverSection,
}: {
  section: StorefrontSectionDraft;
  issueTone: "error" | "warning" | "tip" | null;
  index: number;
  total: number;
  active: boolean;
  dragOver: boolean;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onMove: (from: number, to: number) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onDragOverSection: (id: string | null) => void;
}) {
  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const activeId = event.dataTransfer.getData("text/plain");
    if (!activeId) return;
    onReorder(activeId, section.id);
    onDragOverSection(null);
  }

  return (
    <div
      className={[
        "w-full border px-4 py-3 text-left transition-premium",
        active
          ? "border-primary/45 bg-primary/10 text-on-surface shadow-[inset_3px_0_0_var(--color-primary)]"
          : "border-transparent bg-black/10 text-on-surface-variant hover:border-outline hover:bg-surface-container",
        !section.enabled ? "opacity-55" : "",
        dragOver ? "outline outline-1 outline-primary/60" : "outline-none",
      ].join(" ")}
      onClick={() => onSelect(section.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(section.id);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        onDragOverSection(section.id);
      }}
      onDragLeave={() => onDragOverSection(null)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="truncate font-mono-data text-[10px] uppercase tracking-widest opacity-70">
              {section.enabled ? section.type : `${section.type} / hidden`}
            </div>
            {issueTone ? <SectionHealthBadge tone={issueTone} /> : null}
          </div>
          <div className="mt-1 line-clamp-2 font-label-sm text-label-sm uppercase tracking-widest">
            {getSectionLabel(section)}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-2">
          <button
            type="button"
            draggable
            className="border-razor flex h-10 w-10 cursor-grab items-center justify-center bg-black text-on-surface-variant hover:text-on-surface active:cursor-grabbing"
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", section.id);
            }}
            onDragEnd={() => onDragOverSection(null)}
            onClick={(event) => event.stopPropagation()}
            title="Drag to reorder"
          >
            <AppIcon name="drag_indicator" size={14} />
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-on-surface"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(section.id);
            }}
            title={section.enabled ? "Disable section" : "Enable section"}
          >
            <AppIcon name={section.enabled ? "visibility" : "close"} size={14} />
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-on-surface disabled:opacity-30"
            onClick={(event) => {
              event.stopPropagation();
              if (index > 0) onMove(index, index - 1);
            }}
            disabled={index === 0}
            title="Move up"
          >
            <AppIcon name="arrow_upward" size={14} />
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-on-surface disabled:opacity-30"
            onClick={(event) => {
              event.stopPropagation();
              if (index < total - 1) onMove(index, index + 1);
            }}
            disabled={index === total - 1}
            title="Move down"
          >
            <AppIcon name="arrow_forward" size={14} className="rotate-90" />
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(section.id);
            }}
            title="Duplicate section"
          >
            <AppIcon name="content_copy" size={14} />
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-error"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(section.id);
            }}
            title="Delete"
          >
            <AppIcon name="close" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionHealthBadge({ tone }: { tone: "error" | "warning" | "tip" }) {
  const label = tone === "error" ? "Fix" : tone === "warning" ? "Check" : "Tip";
  const className =
    tone === "error"
      ? "border-error/40 bg-error/10 text-error"
      : tone === "warning"
        ? "border-tertiary/40 bg-tertiary/10 text-tertiary"
        : "border-primary/35 bg-primary/10 text-primary";
  return (
    <span className={`border px-2 py-1 font-mono-data text-[9px] uppercase tracking-widest ${className}`}>
      {label}
    </span>
  );
}
