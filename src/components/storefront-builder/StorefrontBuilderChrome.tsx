"use client";

import { useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type {
  AutosaveState,
  BuilderValidationItem,
  MobileWorkspace,
  PreviewDevice,
} from "@/components/storefront-builder/storefront-builder-types";

export function BuilderHeader({
  handle,
  publicPath,
  publishedRevisionId,
  dirty,
  autosaveState,
  lastSavedAt,
  busySave,
  busyPublish,
  canPublish,
  focusMode,
  editHistoryCounts,
  firstBlocker,
  onToggleFocus,
  onSave,
  onPublish,
  onUndo,
  onRedo,
}: {
  handle: string;
  publicPath: string;
  publishedRevisionId: string | null;
  dirty: boolean;
  autosaveState: AutosaveState;
  lastSavedAt: string | null;
  busySave: boolean;
  busyPublish: boolean;
  canPublish: boolean;
  focusMode: boolean;
  editHistoryCounts: { undo: number; redo: number };
  firstBlocker: BuilderValidationItem | null;
  onToggleFocus: () => void;
  onSave: () => void;
  onPublish: () => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="border-razor bg-surface-container-low p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-6">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="border-razor flex h-11 w-11 items-center justify-center bg-primary/[0.12] text-primary">
              <AppIcon name="layers" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display-lg text-2xl uppercase tracking-tight text-on-surface">Storefront Builder</h1>
              <p className="text-sm leading-6 text-on-surface-variant">
                Build the buyer page, preview it, then publish when it is ready.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/settings"
              className="border-razor inline-flex min-h-10 items-center gap-2 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
            >
              <AppIcon name="arrow_back" size={14} />
              Back
            </Link>
            <div className="border-razor bg-black/40 px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              {handle ? `/s/${handle}` : "Add a storefront handle"}
            </div>
            <SaveStateBadge dirty={dirty} autosaveState={autosaveState} lastSavedAt={lastSavedAt} />
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-3 xl:w-auto xl:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <ToolbarButton active={editHistoryCounts.undo > 0} icon="arrow_back" label="Undo" onClick={onUndo} disabled={editHistoryCounts.undo === 0} />
            <ToolbarButton active={editHistoryCounts.redo > 0} icon="arrow_forward" label="Redo" onClick={onRedo} disabled={editHistoryCounts.redo === 0} />
            <ToolbarButton active={focusMode} icon={focusMode ? "close_fullscreen" : "open_in_full"} label={focusMode ? "Exit preview" : "Preview mode"} onClick={onToggleFocus} />
            <ShortcutsPopover />
            {publishedRevisionId ? (
              <Link
                href={publicPath}
                target="_blank"
                rel="noreferrer"
                className="border-razor inline-flex min-h-10 items-center gap-2 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
              >
                <AppIcon name="link" size={14} />
                Open live
              </Link>
            ) : null}
            <button
              type="button"
              className="border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface disabled:opacity-40"
              onClick={onSave}
              disabled={busySave || busyPublish}
            >
              {busySave ? "Saving..." : "Save now"}
            </button>
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center gap-2 px-6 py-3 font-mono-data text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black disabled:opacity-40"
              onClick={onPublish}
              disabled={!canPublish}
            >
              <AppIcon name="bolt" size={16} />
              {busyPublish ? "Publishing..." : "Publish"}
            </button>
          </div>
          <div className="max-w-xl text-sm leading-6 text-on-surface-variant xl:text-right">
            {firstBlocker ? (
              <>
                <span className="text-error">Fix before publishing:</span> {firstBlocker.title}
              </>
            ) : (
              "Autosave keeps drafts safe. Publish is the only step that changes the live page."
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveStateBadge({
  dirty,
  autosaveState,
  lastSavedAt,
}: {
  dirty: boolean;
  autosaveState: AutosaveState;
  lastSavedAt: string | null;
}) {
  const savedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    : null;
  const label =
    autosaveState === "saving"
      ? "Saving..."
      : autosaveState === "pending"
        ? "Saving soon"
        : autosaveState === "error"
          ? "Save failed"
          : dirty
            ? "Unsaved"
            : savedTime
              ? `Saved ${savedTime}`
              : "Draft ready";
  return (
    <div className="border-razor bg-black/40 px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
      {label}
    </div>
  );
}

function ToolbarButton({
  active,
  icon,
  label,
  onClick,
  disabled = false,
}: {
  active: boolean;
  icon: Parameters<typeof AppIcon>[0]["name"];
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        "border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest transition-premium disabled:opacity-30",
        active ? "text-primary" : "text-on-surface-variant hover:text-on-surface",
      ].join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="inline-flex items-center gap-2">
        <AppIcon name={icon} size={14} />
        {label}
      </span>
    </button>
  );
}

function ShortcutsPopover() {
  const [open, setOpen] = useState(false);
  const shortcuts = [
    ["Save", "Ctrl/S"],
    ["Undo", "Ctrl/Z"],
    ["Redo", "Ctrl/Shift/Z"],
    ["Desktop", "1"],
    ["Tablet", "2"],
    ["Mobile", "3"],
    ["Focus", "F"],
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant transition-premium hover:text-on-surface"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="inline-flex items-center gap-2">
          <AppIcon name="code" size={14} />
          Shortcuts
        </span>
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-64 border-razor bg-surface-container p-3 shadow-[0_20px_70px_rgba(0,0,0,0.38)]">
          {shortcuts.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 border-b border-white/5 py-2 last:border-0">
              <span className="text-xs text-on-surface-variant">{label}</span>
              <kbd className="border border-white/10 bg-black px-2 py-1 font-mono-data text-[10px] uppercase tracking-widest text-on-surface">
                {value}
              </kbd>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function MobileWorkspaceTabs({
  value,
  issueCount,
  onChange,
}: {
  value: MobileWorkspace;
  issueCount: number;
  onChange: (value: MobileWorkspace) => void;
}) {
  const tabs: Array<{ value: MobileWorkspace; label: string }> = [
    { value: "preview", label: "Preview" },
    { value: "sections", label: "Sections" },
    { value: "publish", label: issueCount > 0 ? `Publish (${issueCount})` : "Publish" },
  ];

  return (
    <div className="border-razor fixed inset-x-3 bottom-3 z-40 grid grid-cols-3 bg-surface-container-low p-1 shadow-[0_20px_80px_rgba(0,0,0,0.45)] xl:hidden">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          className={[
            "min-h-12 px-2 py-3 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
            value === tab.value ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface",
          ].join(" ")}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function ViewportSwitcher({
  value,
  onChange,
}: {
  value: PreviewDevice;
  onChange: (value: PreviewDevice) => void;
}) {
  return (
    <div className="border-razor flex bg-black/40 p-1">
      {(["desktop", "tablet", "mobile"] as const).map((device) => (
        <button
          key={device}
          type="button"
          className={[
            "min-h-10 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
            value === device ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface",
          ].join(" ")}
          onClick={() => onChange(device)}
        >
          {device}
        </button>
      ))}
    </div>
  );
}

export function InspectorPanelSkeleton() {
  return (
    <div className="border-razor min-h-[420px] bg-surface-container-low p-5 shadow-[0_24px_70px_rgba(0,0,0,0.2)]">
      <div className="h-3 w-28 bg-white/10" />
      <div className="mt-6 space-y-3">
        <div className="h-12 bg-white/[0.06]" />
        <div className="h-28 bg-white/[0.04]" />
        <div className="h-20 bg-white/[0.04]" />
      </div>
    </div>
  );
}
