"use client";

import { useState } from "react";
import { DashboardPageHeader, MutedActionButton } from "@/components/dashboard/DashboardPrimitives";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { ModalTriggerButton } from "@/components/ui/buttons/ModalTriggerButton";
import { LockboxFormDialog } from "@/components/lockbox-form/LockboxFormDialog";

export function LockboxesHeader({
  query,
  onQueryChange,
  sort,
  onSortChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  sort: "recent" | "price_desc" | "price_asc";
  onSortChange: (value: "recent" | "price_desc" | "price_asc") => void;
}) {
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const sortLabel = sort === "recent" ? "Recent" : sort === "price_desc" ? "Price high" : "Price low";

  return (
    <>
      <DashboardPageHeader
        title="Digital Assets"
        subtitle="Manage your encrypted deliverables and pricing."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ModalTriggerButton onClick={() => setCreateOpen(true)} className="h-9 px-4 py-2">
              <AppIcon name="add" size={14} />
              Create Lockbox
            </ModalTriggerButton>
            <label className="sr-only" htmlFor="lockbox-search">Search lockboxes</label>
            <input
              id="lockbox-search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="SEARCH_MANIFEST..."
              className="border-razor h-9 bg-surface-container-low px-4 font-mono-data text-[10px] uppercase tracking-widest text-on-surface outline-none transition-premium focus:border-primary focus:bg-black"
            />
            <div className="relative">
              <MutedActionButton
                className="border-outline-variant text-on-surface-variant hover:text-white"
                onClick={() => setOpen((value) => !value)}
              >
                <AppIcon name="filter_list" size={18} />
                {sortLabel}
              </MutedActionButton>
              {open ? (
                <>
                  <button
                    type="button"
                    aria-label="Close sort menu"
                    className="fixed inset-0 z-10"
                    onClick={() => setOpen(false)}
                  />
                  <div className="absolute right-0 top-11 z-20 min-w-48 border-razor bg-surface-container-highest p-1">
                    <div className="absolute top-0 right-0 h-2 w-2 border-r border-t border-primary/20" />
                    {[
                      { key: "recent", label: "RECENT_FIRST" },
                      { key: "price_desc", label: "PRICE_DESCENDING" },
                      { key: "price_asc", label: "PRICE_ASCENDING" },
                    ].map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`block w-full px-4 py-3 text-left font-mono-data text-[10px] uppercase tracking-widest transition-premium ${
                          sort === option.key 
                            ? "bg-primary text-on-primary font-bold" 
                            : "text-on-surface-variant hover:bg-black hover:text-on-surface"
                        }`}
                        onClick={() => {
                          onSortChange(option.key as "recent" | "price_desc" | "price_asc");
                          setOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        }
      />
      <LockboxFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
