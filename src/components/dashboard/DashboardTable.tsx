"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { DashboardLockboxRow } from "@/components/dashboard/DashboardLockboxRow";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { DashboardLockbox } from "@/components/dashboard/types";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { LockboxFormDialog } from "@/components/lockbox-form/LockboxFormDialog";

export function DashboardTable({ rows }: { rows: DashboardLockbox[] }) {
  const [items, setItems] = useState(rows);
  const [storefrontEnabled, setStorefrontEnabled] = useState(false);
 
  useEffect(() => {
    setItems(rows);
  }, [rows]);

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
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "disable" | "enable";
    row: DashboardLockbox;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DashboardLockbox | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    price: "",
    previewText: "",
    previewUrl: "",
    secureLink: "",
    feePercent: "5",
  });

  function openEdit(row: DashboardLockbox) {
    setEditing(row);
    setEditError(null);
    setEditForm({
      title: row.title,
      price: (row.priceCents / 100).toFixed(2),
      previewText: row.previewText,
      previewUrl: row.previewUrl,
      secureLink: row.secureLink,
      feePercent: String(row.platformFeePercent),
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
      title: payloadOverride?.title ?? editForm.title,
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
              title: editForm.title,
              priceCents: payload.price_cents,
              priceLabel: `$${(payload.price_cents / 100).toFixed(2)}`,
              previewText: editForm.previewText,
              previewUrl: editForm.previewUrl,
              secureLink: editForm.secureLink,
              platformFeePercent: payload.platform_fee_percent,
              isListed: Boolean(payload.is_listed),
            }
          : row
      )
    );
    setSavingEdit(false);
    setEditing(null);
  }

  async function performDelete(id: string) {
    const res = await fetch(`/api/deliveries/${id}`, { method: "DELETE" });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(json.error || "Unable to delete lockbox.");
      return false;
    }
    setItems((prev) => prev.filter((row) => row.id !== id));
    return true;
  }

  async function performToggle(id: string, disabled: boolean) {
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
              status: disabled ? "disabled" : "pending",
            }
          : row
      )
    );
    return true;
  }

  async function performToggleListed(id: string, listed: boolean) {
    if (!storefrontEnabled) return false;
    const res = await fetch(`/api/deliveries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_listed: listed }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setActionError(json.error || "Unable to update storefront listing.");
      return false;
    }
    setItems((prev) => prev.map((row) => (row.id === id ? { ...row, isListed: listed } : row)));
    return true;
  }

  async function confirmCurrentAction() {
    if (!confirmAction) return;
    setConfirmLoading(true);
    let ok = false;
    if (confirmAction.type === "delete") {
      ok = await performDelete(confirmAction.row.id);
    } else if (confirmAction.type === "disable") {
      ok = await performToggle(confirmAction.row.id, true);
    } else {
      ok = await performToggle(confirmAction.row.id, false);
    }
    setConfirmLoading(false);
    if (ok) setConfirmAction(null);
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-headline-md text-on-surface">Recent Lockboxes</h2>
        {items.length > 0 ? (
          <Link href="/lockboxes" className="flex items-center gap-1 font-label-sm text-label-sm text-primary transition-colors hover:text-primary-container">
            View All <AppIcon name="arrow_forward" size={16} />
          </Link>
        ) : null}
      </div>
      <DashboardPanel className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container-low/50">
                <th className="p-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Deliverable</th>
                <th className="p-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Price</th>
                <th className="p-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Created</th>
                <th className="p-4 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Status</th>
                <th className="p-4 text-right font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-mono-data text-mono-data text-on-surface">
              {items.map((row) => (
                <DashboardLockboxRow
                  key={row.id}
                  row={row}
                  onEdit={openEdit}
                  onRequestDelete={(item) => {
                    setActionError(null);
                    setConfirmAction({ type: "delete", row: item });
                  }}
                  onRequestToggleDisabled={(item, disabled) => {
                    setActionError(null);
                    setConfirmAction({ type: disabled ? "disable" : "enable", row: item });
                  }}
                  onRequestToggleListed={(item, listed) => {
                    setActionError(null);
                    void performToggleListed(item.id, listed);
                  }}
                  storefrontEnabled={storefrontEnabled}
                />
              ))}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
      {actionError ? (
        <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-3 text-sm text-on-error-container">
          {actionError}
        </div>
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
              ? `Delete "${confirmAction.row.title}"? This cannot be undone.`
              : confirmAction?.type === "disable"
                ? `Disable "${confirmAction.row.title}"? Buyers will no longer be able to pay.`
                : `Enable "${confirmAction?.row.title}" so buyers can pay again?`}
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
      {editing ? (
        <LockboxFormDialog
          key={editing.id}
          open={Boolean(editing)}
          editLockbox={
            editing
              ? {
                  id: editing.id,
                  title: editing.title,
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
    </div>
  );
}
