"use client";

import { useState } from "react";

export function StripeLoginButton({
  className = "",
  label = "Manage Stripe Account",
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/login", {
        method: "POST",
      });
      const payload = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start Stripe login.");
      }
      window.location.assign(payload.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect Stripe.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogin}
        disabled={loading}
        className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {loading ? "Redirecting..." : label}
      </button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
