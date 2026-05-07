"use client";

import { formatShortDate } from "@/components/storefront-builder/storefront-builder-utils";
import type { RevisionHistoryRow } from "@/components/storefront-builder/storefront-builder-types";

export function StorefrontHistoryInspector({
  rows,
  publishedRevisionId,
  onRollback,
}: {
  rows: RevisionHistoryRow[];
  publishedRevisionId: string | null;
  onRollback: (id: string) => void;
}) {
  const publishedRows = rows.filter((row) => row.status === "published");
  return (
    <div className="space-y-4">
      <div className="border-razor bg-black/40 p-4 text-sm leading-6 text-on-surface-variant">
        Rollback changes the live storefront to a previous published revision. Draft edits stay separate.
      </div>
      {publishedRows.length === 0 ? (
        <div className="border-razor bg-black/40 p-6 text-sm text-on-surface-variant">
          No published revisions yet.
        </div>
      ) : (
        <div className="space-y-2">
          {publishedRows.map((row) => {
            const active = publishedRevisionId === row.id;
            return (
              <div key={row.id} className="border-razor flex items-center justify-between gap-3 bg-black/40 p-4">
                <div>
                  <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
                    {active ? "Live" : "Published"}
                  </div>
                  <div className="mt-1 text-sm text-on-surface">{formatShortDate(row.created_at)}</div>
                  <div className="mt-1 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-60">
                    {row.id.slice(0, 8)}...
                  </div>
                </div>
                <button
                  type="button"
                  className="border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface disabled:opacity-30"
                  onClick={() => onRollback(row.id)}
                  disabled={active}
                >
                  {active ? "Current" : "Make live"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
