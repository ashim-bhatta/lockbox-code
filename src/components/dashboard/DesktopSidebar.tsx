"use client"

import Link from "next/link"
import { AppIcon } from "@/components/ui/icons/AppIcon"
import {
  navItems,
  type DashboardNavKey,
} from "@/components/dashboard/dashboard-nav"
import { LogoutButton } from "@/components/dashboard/LogoutButton"

export function DesktopSidebar({ activeNav }: { activeNav: DashboardNavKey }) {
  return (
    <aside className='border-razor sticky left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r bg-surface-container-lowest lg:flex'>
      <div className='group/logo border-razor border-b p-10 cursor-default'>
        <div className='font-display-lg text-lg uppercase tracking-[0.3em] text-on-surface group-hover/logo:text-primary transition-premium'>
          Paywall
          <span className='text-primary group-hover/logo:text-white transition-premium'>
            .zip
          </span>
        </div>
        <div className='font-mono-data mt-2 text-[8px] uppercase tracking-widest text-outline-variant'>
          Protocol Console v2.0
        </div>
      </div>

      <div className='flex flex-1 flex-col p-6'>
        <div className='font-mono-data mb-6 px-4 text-[9px] uppercase tracking-[0.3em] text-outline-variant opacity-60'>
          NAVIGATION
        </div>
        <nav className='flex flex-col gap-1'>
          {navItems.map((item) =>
            item.key === activeNav ? (
              <Link
                key={item.key}
                href={item.href}
                className='group relative flex items-center gap-5 bg-surface-container-high px-5 py-4 text-primary border-razor'
              >
                <div className='absolute left-0 top-0 h-full w-0.5 bg-primary shadow-[0_0_10px_rgba(176,198,255,0.4)]' />
                <AppIcon name={item.icon} size={18} />
                <span className='font-mono-data text-[11px] uppercase tracking-[0.1em]'>
                  {item.label}
                </span>
              </Link>
            ) : (
              <Link
                key={item.key}
                href={item.href}
                className='group flex items-center gap-5 px-5 py-4 text-on-surface-variant transition-premium hover:bg-surface-container hover:text-on-surface'
              >
                <AppIcon
                  name={item.icon}
                  size={18}
                  className='opacity-30 group-hover:opacity-100'
                />
                <span className='font-mono-data text-[11px] uppercase tracking-[0.1em]'>
                  {item.label}
                </span>
              </Link>
            ),
          )}
        </nav>
      </div>

      <div className='border-razor border-t p-10'>
        <LogoutButton />
      </div>
    </aside>
  )
}
