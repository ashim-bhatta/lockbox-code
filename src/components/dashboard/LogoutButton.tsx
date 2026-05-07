"use client";

import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function LogoutButton({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (isMobile) {
    return (
      <button
        onClick={handleLogout}
        className="rounded px-2 py-1 text-sm text-zinc-400 hover:text-zinc-100 flex items-center gap-2"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-zinc-500 transition-all duration-200 hover:translate-x-1 hover:bg-white/5 hover:text-zinc-200"
    >
      <AppIcon name="logout" size={20} />
      <span className="font-label-sm text-label-sm">Sign Out</span>
    </button>
  );
}
