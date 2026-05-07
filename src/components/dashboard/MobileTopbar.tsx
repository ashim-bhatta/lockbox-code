"use client";

import Link from "next/link";
import { useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { navItems, type DashboardNavKey } from "@/components/dashboard/dashboard-nav";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

export function MobileTopbar({ activeNav }: { activeNav: DashboardNavKey }) {
  const active = navItems.find((item) => item.key === activeNav);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-white/10 bg-zinc-950/80 px-6 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden">
      <div className="flex items-center gap-2 text-xl font-bold tracking-tighter text-zinc-100">
        <AppIcon name="lock" className="text-primary" size={20} />
        {active?.label ?? "Dashboard"}
      </div>
      <div className="flex items-center gap-4">
        <Link href="/settings" aria-label="Open settings" className="text-zinc-400 transition-colors hover:text-zinc-100">
          <AppIcon name="notifications" size={18} />
        </Link>
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={() => setMenuOpen((value) => !value)}
          className="text-zinc-400 transition-colors hover:text-zinc-100"
        >
          <AppIcon name="menu" size={18} />
        </button>
      </div>
      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Close mobile menu overlay"
            className="fixed inset-0 z-[55] bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed left-0 right-0 top-16 z-[60] border-b border-white/10 bg-zinc-950/95 px-6 py-3 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`rounded px-2 py-1 text-sm ${item.key === activeNav ? "text-white" : "text-zinc-400 hover:text-zinc-100"}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <LogoutButton isMobile />
            </div>
          </div>
        </>
      ) : null}
    </nav>
  );
}
