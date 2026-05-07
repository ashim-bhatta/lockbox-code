"use client";

import { useState } from "react";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export type EditableLockbox = {
  id: string;
  title: string;
  priceCents: number;
  previewText: string;
  previewUrl: string;
  secureLink: string;
  platformFeePercent: number;
};

export function LockboxEditDialog({
  open,
  lockbox,
  saving,
  error,
  onClose,
  onSave,
}: {
  open: boolean;
  lockbox: EditableLockbox | null;
  saving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    priceCents: number;
    previewText: string;
    previewUrl: string;
    secureLink: string;
    platformFeePercent: number;
  }) => void;
}) {
  const [form, setForm] = useState(() => ({
    title: lockbox?.title || "",
    price: lockbox ? (lockbox.priceCents / 100).toFixed(2) : "",
    previewText: lockbox?.previewText || "",
    previewUrl: lockbox?.previewUrl || "",
    secureLink: lockbox?.secureLink || "",
    feePercent: String(lockbox?.platformFeePercent || 5),
  }));

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSave({
      title: form.title,
      priceCents: Math.round(Number.parseFloat(form.price || "0") * 100),
      previewText: form.previewText,
      previewUrl: form.previewUrl,
      secureLink: form.secureLink,
      platformFeePercent: Number.parseInt(form.feePercent, 10),
    });
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title="Edit Lockbox"
      panelClassName="md:max-w-2xl"
      contentClassName="px-5 pb-6 pt-5 md:px-6 md:pb-6"
    >
      <div className="w-full rounded-xl border border-outline-variant/50 bg-surface-container/60 p-4 md:p-5">
        <p className="mb-4 text-sm text-on-surface-variant">Update your lockbox details and pricing.</p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Deliverable Title"
            required
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="Price in USD"
              type="number"
              min="0"
              step="0.01"
              required
            />
            <input
              className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
              value={form.feePercent}
              onChange={(e) => setForm((prev) => ({ ...prev, feePercent: e.target.value }))}
              placeholder="Platform fee %"
              type="number"
              min="5"
              max="20"
            />
          </div>
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            value={form.previewText}
            onChange={(e) => setForm((prev) => ({ ...prev, previewText: e.target.value }))}
            placeholder="Preview text"
          />
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            value={form.previewUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, previewUrl: e.target.value }))}
            placeholder="Preview URL"
          />
          <input
            className="w-full rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 text-on-surface outline-none focus:border-primary-container"
            value={form.secureLink}
            onChange={(e) => setForm((prev) => ({ ...prev, secureLink: e.target.value }))}
            placeholder="Secure file URL"
            required
          />
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-outline-variant px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-on-primary disabled:cursor-not-allowed disabled:opacity-70"
            >
              <AppIcon name="check_circle" size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </ResponsiveDialog>
  );
}
