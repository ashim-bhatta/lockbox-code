"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";

export function RegisterTopBar() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/70 font-inter shadow-[0_0_15px_rgba(41,121,255,0.1)] backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2 bg-clip-text text-xl font-bold tracking-tighter text-white">
          <span>Paywall.zip</span>
        </div>
        <div className="flex items-center gap-6">
          <Link className="font-label-sm text-label-sm text-slate-400 transition-colors hover:text-white" href="/help">
            Help
          </Link>
          <button
            type="button"
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all duration-300 hover:text-white"
          >
            <AppIcon name="dark_mode" size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
