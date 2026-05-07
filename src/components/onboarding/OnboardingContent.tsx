"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { CopyButton } from "@/components/ui/feedback/CopyButton";
import { getDeliveryLink } from "@/lib/links";

export function OnboardingContent() {
  const searchParams = useSearchParams();
  const [deliveryId, setDeliveryId] = useState<string | null>(searchParams.get("delivery_id"));
  const [connected, setConnected] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch("/api/onboarding/status");
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const data = (await res.json()) as { connected: boolean; email: string | null };
        setConnected(data.connected);
        setEmail(data.email || "");
        if (!deliveryId) {
          const lockboxRes = await fetch("/api/dashboard/lockboxes");
          if (lockboxRes.ok) {
            const lockboxData = (await lockboxRes.json()) as { rows?: Array<{ id: string }> };
            const first = lockboxData.rows?.[0]?.id;
            if (first) setDeliveryId(first);
          }
        }
      } catch {
        setConnected(false);
      }
    }
    void loadStatus();
  }, [deliveryId]);

  const shareUrl = deliveryId ? getDeliveryLink(deliveryId) : "";
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="glass-card border-emerald-500/30 p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">{connected ? "You're all set!" : "Onboarding incomplete"}</h2>
        <p className="mb-8 leading-relaxed text-gray-400">
          {connected
            ? "Your Stripe account is connected. Share the link below with your client."
            : "We could not confirm Stripe activation yet. You can retry onboarding from settings."}
        </p>

        {shareUrl ? (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-950/50 p-4">
            <input type="text" readOnly value={shareUrl} className="flex-1 truncate bg-transparent text-sm text-white focus:outline-none" />
            <CopyButton text={shareUrl} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 hover:text-white" />
          </div>
        ) : (
          <p className="mb-6 text-sm text-gray-400">
            No delivery link was provided. Create a new lockbox from the dashboard to generate a share link.
          </p>
        )}

        {shareUrl ? (
          <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300">
            <ExternalLink className="h-4 w-4" />
            Preview the client page
          </a>
        ) : null}
        {email ? <p className="mt-4 text-xs text-gray-500">Connected account: {email}</p> : null}
      </div>
    </div>
  );
}
