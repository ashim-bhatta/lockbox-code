"use client";

import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { DashboardLockbox } from "@/components/dashboard/types";
import { getDeliveryLink } from "@/lib/links";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function DashboardLockboxRow({
  row,
  onRequestDelete,
  onRequestToggleDisabled,
  onRequestToggleListed,
  storefrontEnabled,
  onEdit,
}: {
  row: DashboardLockbox;
  onRequestDelete: (row: DashboardLockbox) => void;
  onRequestToggleDisabled: (row: DashboardLockbox, disabled: boolean) => void;
  onRequestToggleListed: (row: DashboardLockbox, listed: boolean) => void;
  storefrontEnabled: boolean;
  onEdit: (row: DashboardLockbox) => void;
}) {
  const paid = row.status === "paid";
  const disabled = row.status === "disabled";
  const copyText = getDeliveryLink(row.id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const updateMenuPos = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMenuPos({ top: rect.bottom + 6, left: rect.right - 168 });
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
    <tr className="group transition-premium hover:bg-surface-container">
      <td className="p-6">
        <div className="flex items-center gap-6">
          <div className="border-razor flex h-12 w-12 items-center justify-center bg-black">
            <AppIcon name={row.icon} className="text-primary/60" size={18} />
          </div>
          <div>
            <div className="max-w-[300px] truncate font-display-lg text-lg uppercase tracking-tight text-on-surface">{row.title}</div>
            <div className="font-mono-data mt-1 text-[9px] uppercase tracking-widest text-outline-variant">{row.fileSize}</div>
          </div>
        </div>
      </td>
      <td className="p-6">
        <div className="font-mono-data text-xs text-on-surface">{row.priceLabel}</div>
      </td>
      <td className="p-6">
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">{row.createdLabel}</div>
      </td>
      <td className="p-6">
        <div className="flex items-center gap-3">
          <div className={`h-1.5 w-1.5 ${paid ? "bg-secondary shadow-[0_0_8px_rgba(125,255,162,0.4)]" : disabled ? "bg-error" : "bg-tertiary"}`} />
          <span className={`font-mono-data text-[10px] uppercase tracking-[0.2em] ${paid ? "text-secondary" : disabled ? "text-error" : "text-tertiary"}`}>
            {paid ? "PAID" : disabled ? "OFFLINE" : "AVAILABLE"}
          </span>
        </div>
      </td>
      <td className="p-6 text-right">
        <div className="ml-auto">
          <button
            type="button"
            ref={triggerRef}
            aria-label="Open lockbox actions"
            onClick={() => setMenuOpen((value) => !value)}
            className="border-razor p-3 text-on-surface-variant transition-premium hover:bg-surface-container-highest hover:text-primary"
          >
            <AppIcon name="more_horiz" size={18} />
          </button>
          {menuOpen && typeof document !== "undefined"
            ? createPortal(
            <div
              ref={menuRef}
              style={{ top: menuPos.top, left: menuPos.left }}
              className="border-razor fixed z-[90] min-w-48 bg-surface-container-highest p-1 shadow-2xl"
            >
              <div className="absolute top-0 right-0 h-2 w-2 border-r border-t border-primary/20" />
              <button
                type="button"
                className="block w-full px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-black transition-premium"
                onClick={async () => {
                  await navigator.clipboard.writeText(copyText);
                  setMenuOpen(false);
                }}
              >
                Copy_Link
              </button>
              <a
                href={copyText}
                target="_blank"
                rel="noreferrer"
                className="block w-full px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-black transition-premium"
                onClick={() => setMenuOpen(false)}
              >
                Access_Vault
              </a>
              {storefrontEnabled ? (
                <button
                  type="button"
                  className="block w-full px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-black transition-premium"
                  onClick={() => {
                    onRequestToggleListed(row, !row.isListed);
                    setMenuOpen(false);
                  }}
                >
                  {row.isListed ? "UNLIST_STORE" : "LIST_STORE"}
                </button>
              ) : null}
              {paid ? null : (
                <button
                  type="button"
                  className="block w-full px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-black transition-premium"
                  onClick={() => {
                    onEdit(row);
                    setMenuOpen(false);
                  }}
                >
                  Modify_Node
                </button>
              )}
              {paid ? null : (
                <button
                  type="button"
                  className="block w-full px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-on-surface hover:bg-black transition-premium"
                  onClick={() => {
                    onRequestToggleDisabled(row, !disabled);
                    setMenuOpen(false);
                  }}
                >
                  {disabled ? "ACTIVATE" : "DEACTIVATE"}
                </button>
              )}
              {paid ? null : (
                <button
                  type="button"
                  className="block w-full border-t border-white/5 px-5 py-4 text-left font-mono-data text-[10px] uppercase tracking-widest text-error hover:bg-red-950/20 transition-premium"
                  onClick={() => {
                    onRequestDelete(row);
                    setMenuOpen(false);
                  }}
                >
                  Terminate_Node
                </button>
              )}
            </div>,
            document.body
            ) : null}
        </div>
      </td>
    </tr>
  );
}
