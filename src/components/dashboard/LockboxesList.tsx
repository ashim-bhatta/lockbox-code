"use client";

import { useEffect, useMemo, useState } from "react";
import { LockboxListRow, type LockboxItem } from "@/components/dashboard/LockboxListRow";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { LockboxesHeader } from "@/components/dashboard/LockboxesHeader";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { LockboxFormDialog } from "@/components/lockbox-form/LockboxFormDialog";

export function LockboxesList({ lockboxes }: { lockboxes: LockboxItem[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "price_desc" | "price_asc">("recent");
  const [visibleCount, setVisibleCount] = useState(10);
  const [items, setItems] = useState(lockboxes);
  const [storefrontEnabled, setStorefrontEnabled] = useState(false);
 
  useEffect(() => {
    setItems(lockboxes);
  }, [lockboxes]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as { profile?: { storefront_enabled?: boolean } };
        if (cancelled) return;
        setStorefrontEnabled(Boolean(json.profile?.storefront_enabled));
      } catch {
        if (cancelled) return;
        setStorefrontEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  const [editing, setEditing] = useState<LockboxItem | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "disable" | "enable";
    item: LockboxItem;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    previewText: "",
    previewUrl: "",
    secureLink: "",
    feePercent: "5",
  });

  async function onDelete(id: string) {
    const res = await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(json.error || "Unable to delete lockbox.");
      return false;
    }
    setItems((prev) => prev.filter((row) => row.id !== id));
    return true;
  }

  async function onToggleDisabled(id: string, disabled: boolean) {
    const res = await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disabled }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(json.error || "Unable to update lockbox status.");
      return false;
    }
    setItems((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              status: disabled ? "disabled" : "waiting",
            }
          : row
      )
    );
    return true;
  }

  function requestDelete(item: LockboxItem) {
    setActionError(null);
    setConfirmAction({ type: "delete", item });
  }

  function requestToggleDisabled(item: LockboxItem, disabled: boolean) {
    setActionError(null);
    setConfirmAction({ type: disabled ? "disable" : "enable", item });
  }

  async function confirmCurrentAction() {
    if (!confirmAction) return;
    setConfirmLoading(true);
    let ok = false;
    if (confirmAction.type === "delete") {
      ok = await onDelete(confirmAction.item.id);
    } else if (confirmAction.type === "disable") {
      ok = await onToggleDisabled(confirmAction.item.id, true);
    } else {
      ok = await onToggleDisabled(confirmAction.item.id, false);
    }
    setConfirmLoading(false);
    if (ok) setConfirmAction(null);
  }

  function openEdit(item: LockboxItem) {
    setEditing(item);
    setEditError(null);
    setEditForm({
      name: item.name,
      price: (item.priceCents / 100).toFixed(2),
      previewText: item.previewText,
      previewUrl: item.previewUrl,
      secureLink: item.secureLink,
      feePercent: String(item.platformFeePercent),
    });
  }

  async function saveEdit(payloadOverride?: {
    title: string;
    priceCents: number;
    previewText: string;
    previewUrl: string;
    secureLink: string;
    platformFeePercent: number;
    isListed: boolean;
  }) {
    if (!editing) return;
    setSavingEdit(true);
    setEditError(null);
    const payload = {
      title: payloadOverride?.title ?? editForm.name,
      price_cents: payloadOverride?.priceCents ?? Math.round(Number.parseFloat(editForm.price || "0") * 100),
      preview_text: payloadOverride?.previewText ?? editForm.previewText,
      preview_url: payloadOverride?.previewUrl ?? editForm.previewUrl,
      secure_link: payloadOverride?.secureLink ?? editForm.secureLink,
      platform_fee_percent: payloadOverride?.platformFeePercent ?? Number.parseInt(editForm.feePercent, 10),
      is_listed: payloadOverride?.isListed ?? editing.isListed,
    };
    const res = await fetch(`/api/deliveries/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setEditError(json.error || "Failed to update lockbox.");
      setSavingEdit(false);
      return;
    }
    setItems((prev) =>
      prev.map((row) =>
        row.id === editing.id
          ? {
              ...row,
              name: editForm.name,
              price: `$${(payload.price_cents / 100).toFixed(2)}`,
              priceCents: payload.price_cents,
              previewText: editForm.previewText,
              previewUrl: editForm.previewUrl,
              secureLink: editForm.secureLink,
              platformFeePercent: payload.platform_fee_percent,
              isListed: payload.is_listed,
            }
          : row
      )
    );
    setSavingEdit(false);
    setEditing(null);
  }

  const visible = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const filtered = lower
      ? items.filter((item) => item.name.toLowerCase().includes(lower) || item.details.toLowerCase().includes(lower))
      : items;
    const sorted = [...filtered].sort((a, b) => {
      if (sort === "recent") return b.createdAt.localeCompare(a.createdAt);
      const aPrice = Number.parseFloat(a.price.replace(/[$,]/g, "")) || 0;
      const bPrice = Number.parseFloat(b.price.replace(/[$,]/g, "")) || 0;
      return sort === "price_desc" ? bPrice - aPrice : aPrice - bPrice;
    });
    return sorted.slice(0, visibleCount);
  }, [items, query, sort, visibleCount]);

  const hasMore = visible.length < items.filter((item) => {
    const lower = query.trim().toLowerCase();
    if (!lower) return true;
    return item.name.toLowerCase().includes(lower) || item.details.toLowerCase().includes(lower);
  }).length;

  return (
    <div className="space-y-4">
      <LockboxesHeader query={query} onQueryChange={setQuery} sort={sort} onSortChange={setSort} />
      <div className="overflow-x-auto">
        <div className="min-w-[720px] grid grid-cols-12 gap-gutter border-b border-white/5 px-6 py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
          <div className="col-span-5">Deliverable Name</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-2 text-right">Total Earned</div>
          <div className="col-span-3 pl-8">Status</div>
        </div>
      </div>
      {visible.map((item) => (
        <LockboxListRow
          key={item.id}
          item={item}
          onRequestDelete={requestDelete}
          onRequestToggleDisabled={requestToggleDisabled}
          onRequestToggleListed={async (target, listed) => {
            if (!storefrontEnabled) return;
            setActionError(null);
            const res = await fetch(`/api/deliveries/${target.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ is_listed: listed }),
            });
            const json = (await res.json().catch(() => ({}))) as { error?: string };
            if (!res.ok) {
              setActionError(json.error || "Unable to update storefront listing.");
              return;
            }
            setItems((prev) => prev.map((row) => (row.id === target.id ? { ...row, isListed: listed } : row)));
          }}
          storefrontEnabled={storefrontEnabled}
          onEdit={openEdit}
        />
      ))}
      {actionError ? (
        <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          {actionError}
        </div>
      ) : null}
      {items.length === 0 ? (
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container/40 p-6 text-center font-body-base text-on-surface-variant">
          No lockboxes yet. Create your first secure lockbox from the dashboard.
        </div>
      ) : null}
      {items.length > 0 && hasMore ? (
        <div className="mt-8 flex justify-center">
          <button
            className="glass-panel flex items-center gap-2 rounded-full px-6 py-2 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-white"
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Load More
            <AppIcon name="expand_more" size={16} />
          </button>
        </div>
      ) : null}
      {editing ? (
        <LockboxFormDialog
          key={editing.id}
          open={Boolean(editing)}
          editLockbox={
            editing
              ? {
                  id: editing.id,
                  title: editing.name,
                  priceCents: editing.priceCents,
                  previewText: editing.previewText,
                  previewUrl: editing.previewUrl,
                  secureLink: editing.secureLink,
                  platformFeePercent: editing.platformFeePercent,
                  requiresPassword: editing.requiresPassword,
                  isListed: editing.isListed,
                }
              : null
          }
          saving={savingEdit}
          error={editError}
          onClose={() => setEditing(null)}
          onSave={(payload) => {
            void saveEdit(payload);
          }}
        />
      ) : null}
      <ResponsiveDialog
        open={Boolean(confirmAction)}
        onClose={() => !confirmLoading && setConfirmAction(null)}
        title={
          confirmAction?.type === "delete"
            ? "Delete lockbox"
            : confirmAction?.type === "disable"
              ? "Disable lockbox"
              : "Enable lockbox"
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            {confirmAction?.type === "delete"
              ? `Delete "${confirmAction.item.name}"? This cannot be undone.`
              : confirmAction?.type === "disable"
                ? `Disable "${confirmAction.item.name}"? Buyers will no longer be able to pay.`
                : `Enable "${confirmAction?.item.name}" so buyers can pay again?`}
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="rounded border border-outline-variant px-3 py-1.5 text-sm text-on-surface-variant"
              onClick={() => setConfirmAction(null)}
              disabled={confirmLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1.5 text-sm text-white disabled:opacity-60 ${
                confirmAction?.type === "delete" ? "bg-error" : "bg-primary"
              }`}
              onClick={confirmCurrentAction}
              disabled={confirmLoading}
            >
              {confirmLoading ? "Please wait..." : "Confirm"}
            </button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
