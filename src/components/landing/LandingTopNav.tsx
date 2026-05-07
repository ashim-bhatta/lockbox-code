"use client";

import Link from "next/link";

export function LandingTopNav({ onNavigate }: { onNavigate: (sectionId: string) => void }) {
  return (
    <nav className="border-razor fixed top-0 z-50 w-full border-b bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        <div className="text-xl font-bold tracking-tighter text-white dark:text-white">Paywall.zip</div>
        <div className="hidden items-center gap-8 text-sm font-medium tracking-tight md:flex">
          <button type="button" onClick={() => onNavigate("features")} className="rounded-md px-3 py-1 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white">
            Features
          </button>
          <button type="button" onClick={() => onNavigate("proof")} className="rounded-md px-3 py-1 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white">
            Proof of Work
          </button>
          <button type="button" onClick={() => onNavigate("how-it-works")} className="rounded-md px-3 py-1 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white">
            How it Works
          </button>
          <button type="button" onClick={() => onNavigate("pricing")} className="rounded-md px-3 py-1 text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white">
            Pricing
          </button>
        </div>
        <div className="flex items-center gap-4">
          <Link className="text-sm font-medium tracking-tight text-on-surface-variant transition-colors hover:text-on-surface" href="/login">
            Login
          </Link>
          <Link className="transition-premium border-razor bg-primary px-8 py-3 font-mono-data text-[10px] font-bold uppercase tracking-[0.2em] text-on-primary hover:bg-white hover:text-black" href="/register">
            Get_Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
