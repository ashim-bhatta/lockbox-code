"use client";

import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { DashboardPanel } from "@/components/dashboard/DashboardPrimitives";
import { getDeliveryLink } from "@/lib/links";
import { createPortal } from "react-dom";

export type LockboxItem = {
  id: string;
  name: string;
  details: string;
  price: string;
  earned: string;
  status: "active" | "waiting" | "disabled";
  icon: "lock" | "image" | "bar_chart";
  createdAt: string;
  shareUrl: string;
  priceCents: number;
  previewText: string;
  previewUrl: string;
  secureLink: string;
  platformFeePercent: number;
  requiresPassword: boolean;
  isListed: boolean;
};

export function LockboxListRow({
  item,
  onRequestDelete,
  onRequestToggleDisabled,
  onRequestToggleListed,
  storefrontEnabled,
  onEdit,
}: {
  item: LockboxItem;
  onRequestDelete: (item: LockboxItem) => void;
  onRequestToggleDisabled: (item: LockboxItem, disabled: boolean) => void;
  onRequestToggleListed: (item: LockboxItem, listed: boolean) => void;
  storefrontEnabled: boolean;
  onEdit: (item: LockboxItem) => void;
}) {
  const active = item.status === "active";
  const disabled = item.status === "disabled";
  const copyText = getDeliveryLink(item.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const updateMenuPos = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 6, left: rect.right - 164 });
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setMenuOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    updateMenuPos();
    window.addEventListener("resize", updateMenuPos);
    window.addEventListener("scroll", updateMenuPos, true);
    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("resize", updateMenuPos);
      window.removeEventListener("scroll", updateMenuPos, true);
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [menuOpen]);

  return (
    <DashboardPanel className={`grid grid-cols-12 items-center gap-gutter transition-all duration-300 ${active ? "" : "opacity-60"}`}>
      <div className="col-span-5 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container">
          <AppIcon name={item.icon} className={active ? "text-primary-fixed-dim" : "text-tertiary-fixed-dim"} size={24} />
        </div>
        <div>
          <h3 className="mb-1 font-headline-md text-[16px] text-on-surface">{item.name}</h3>
          <p className="font-label-sm text-label-sm text-slate-500">{item.details}</p>
        </div>
      </div>
      <div className="col-span-2 text-right font-mono-data text-mono-data text-on-surface">{item.price}</div>
      <div className={`col-span-2 text-right font-mono-data text-mono-data ${active ? "text-secondary-fixed-dim" : "text-on-surface-variant"}`}>
        {item.earned}
      </div>
      <div className="col-span-3 flex items-center gap-3 pl-8">
        <div className={`h-2 w-2 rounded-full ${active ? "pulse-active bg-secondary-fixed" : disabled ? "bg-error" : "bg-tertiary-fixed"}`} />
        <span className={`font-label-sm text-label-sm ${active ? "text-secondary-fixed" : disabled ? "text-error" : "text-tertiary-fixed"}`}>
          {active ? "Paid" : disabled ? "Disabled" : "Available"}
        </span>
        <div className="relative ml-auto">
          <button
            className="p-1 text-slate-500 hover:bg-transparent hover:text-white"
            aria-label="Open lockbox actions"
            ref={triggerRef}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <AppIcon name="more_vert" size={18} />
          </button>
          {menuOpen && typeof document !== "undefined"
            ? createPortal(
            <div
              ref={menuRef}
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed z-[90] min-w-36 rounded-md border border-outline-variant bg-surface-container p-1 shadow-xl"
            >
              <button
                type="button"
                className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                onClick={async () => {
                  await navigator.clipboard.writeText(copyText);
                  setMenuOpen(false);
                }}
              >
                Copy link
              </button>
              <a
                href={item.shareUrl}
                target="_blank"
                rel="noreferrer"
                className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                onClick={() => setMenuOpen(false)}
              >
                View lockbox
              </a>
              <a
                href={`/lockboxes/${encodeURIComponent(item.id)}/analytics`}
                className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                onClick={() => setMenuOpen(false)}
              >
                Analytics
              </a>
              {storefrontEnabled ? (
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                  onClick={() => {
                    onRequestToggleListed(item, !item.isListed);
                    setMenuOpen(false);
                  }}
                >
                  {item.isListed ? "Unlist from storefront" : "List on storefront"}
                </button>
              ) : null}
              {active ? null : (
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                  onClick={() => {
                    onEdit(item);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
              )}
              {active ? null : (
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left text-xs text-on-surface hover:bg-surface-container-high"
                  onClick={() => {
                    onRequestToggleDisabled(item, !disabled);
                    setMenuOpen(false);
                  }}
                >
                  {disabled ? "Enable" : "Disable"}
                </button>
              )}
              {active ? null : (
                <button
                  type="button"
                  className="block w-full rounded px-3 py-2 text-left text-xs text-error hover:bg-surface-container-high"
                  onClick={() => {
                    onRequestDelete(item);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              )}
            </div>,
            document.body
            ) : null}
        </div>
      </div>
    </DashboardPanel>
  );
}
