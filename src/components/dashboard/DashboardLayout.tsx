"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { DesktopSidebar } from "@/components/dashboard/DesktopSidebar";
import { MobileTopbar } from "@/components/dashboard/MobileTopbar";
import type { DashboardNavKey } from "@/components/dashboard/dashboard-nav";

export function DashboardLayout({
  children,
  activeNav = "overview",
}: {
  children: ReactNode;
  activeNav?: DashboardNavKey;
}) {
  return (
    <div className="h-[100dvh] overflow-hidden bg-background text-on-background">
      <div className="mesh-gradient" aria-hidden="true" />
      <div className="flex h-full flex-col md:flex-row">
        <div className="hidden h-full lg:block">
          <DesktopSidebar activeNav={activeNav} />
        </div>
        <MobileTopbar activeNav={activeNav} />
        <main className="noise-bg relative flex flex-1 flex-col overflow-y-auto">
          <div className="flex w-full flex-col px-12 pb-12 pt-24 lg:px-16 lg:pt-16">
            <div className="stagger-reveal flex flex-col gap-16">
              {children}
            </div>
            <div className="mt-24 border-t border-white/5 pt-12">
              <SiteFooter />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
