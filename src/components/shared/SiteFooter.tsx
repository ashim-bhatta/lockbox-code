"use client";

import Link from "next/link";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-6 w-full border-t border-white/5 bg-black/90 py-8 sm:py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:gap-5 sm:px-6 md:flex-row md:text-left">
        <div className="text-base font-bold tracking-tighter text-white sm:text-lg">
          Paywall.zip
        </div>

        <div className="grid w-full max-w-md grid-cols-2 gap-x-3 gap-y-2 text-[11px] text-gray-400 sm:flex sm:w-auto sm:max-w-none sm:flex-wrap sm:justify-center sm:gap-5 sm:text-xs md:justify-start">
          <Link className="opacity-90 transition-colors hover:text-blue-400 hover:opacity-100" href="/privacy">Privacy Policy</Link>
          <Link className="opacity-90 transition-colors hover:text-blue-400 hover:opacity-100" href="/terms">Terms of Service</Link>
          <Link className="opacity-90 transition-colors hover:text-blue-400 hover:opacity-100" href="/security">Security Audit</Link>
          <Link className="opacity-90 transition-colors hover:text-blue-400 hover:opacity-100" href="/support">Support</Link>
        </div>

        <div className="text-[11px] text-gray-500 sm:text-xs">© {currentYear} Paywall.zip. Securely encrypted.</div>
      </div>
    </footer>
  );
}
