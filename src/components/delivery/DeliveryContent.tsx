"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { IconInput } from "@/components/auth/ui/IconInput";
import { CopyButton } from "@/components/ui/feedback/CopyButton";
import { RestoreAccessDialog } from "@/components/delivery/RestoreAccessDialog";
import type { PublicDelivery } from "@/types";
import { createCheckoutSession, fetchPublicDelivery } from "@/lib/delivery-api";

type LoadState = "loading" | "ready" | "error";
type TipPresetPercent = 0 | 10 | 20;
type TipMode = "preset" | "custom";

const TIP_PRESETS: { label: string; percent: TipPresetPercent }[] = [
  { label: "No Tip", percent: 0 },
  { label: "10% Tip", percent: 10 },
  { label: "20% Tip", percent: 20 },
];

function centsToUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.max(0, cents) / 100);
}

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function looksLikeEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function TipOptionButton({
  option,
  selected,
  onClick,
}: {
  option: { label: string; id: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative rounded-xl px-2 py-4 font-label-sm text-label-sm transition-spring focus:outline-none",
        selected
          ? "bg-primary text-on-primary shadow-[0_0_20px_rgba(176,198,255,0.3)] scale-[1.05] z-10"
          : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
      ].join(" ")}
      aria-pressed={selected}
    >
      <span className="relative z-10">{option.label}</span>
      {selected && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
      )}
    </button>
  );
}

function PaymentProcessingView({ embed }: { embed: boolean }) {
  const [step, setStep] = useState(0);
  const steps = [
    "PROTOCOL_INIT: ESTABLISHING_SECURE_TUNNEL",
    "ENCRYPTION_CHECK: VERIFYING_AES_GCM_HASH",
    "VAULT_AUTH: DECRYPTING_ASSET_KEYS",
    "HANDOFF_FINAL: SYNCHRONIZING_PERMISSIONS",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % steps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <main
      className={
        embed
          ? "relative flex items-center justify-center overflow-hidden px-6 py-8"
          : "noise-bg relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12"
      }
    >
      <section className="relative z-10 w-full max-w-lg">
        <div className="border-razor relative overflow-hidden bg-surface-container-low p-16 text-left shadow-[0_0_100px_rgba(0,0,0,0.8)]">
          <div className="mb-12 flex items-center justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 border border-primary/40 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">security</span>
              </div>
              <div>
                <div className="font-display-lg text-lg uppercase tracking-[0.2em] text-on-surface">Vault_Access</div>
                <div className="font-mono-data text-[8px] uppercase tracking-widest text-outline-variant">Status: Decrypting_Active</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant">Sequence_ID</div>
              <div className="font-mono-data text-[11px] text-on-surface">#PX-772-01</div>
            </div>
          </div>

          <div className="mb-12 space-y-6">
            <div className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-outline-variant">Active_Protocol_Stream</div>
            <div className="border-razor bg-black p-6 font-mono-data text-xs text-primary/80">
              <p className="mask-reveal">{steps[step]}</p>
              <div className="mt-4 flex gap-1 opacity-40">
                <span className="h-1 w-1 bg-primary" />
                <span className="h-1 w-1 bg-primary" />
                <span className="h-1 w-1 bg-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between font-mono-data text-[9px] uppercase tracking-widest text-outline-variant">
              <span>Bitstream_Progress</span>
              <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="relative h-1 w-full overflow-hidden bg-surface-container-highest">
              <div 
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-[2800ms] ease-linear"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              >
                <div className="absolute right-0 top-0 h-full w-4 bg-white/20 blur-sm" />
              </div>
            </div>
          </div>

          <div className="mt-16 flex items-center justify-between border-t border-white/5 pt-8">
             <div className="flex items-center gap-3">
               <div className="pulse-dot pulse-dot-green scale-50" />
               <span className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant">Verifiable_Proof_Active</span>
             </div>
             <div className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant opacity-40">
               © 2026 PAYWALL_SYSTEMS
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export function DeliveryContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params?.id;
  const isEmbed = searchParams.get("embed") === "1";
  const stripeReturnedAsPaid = searchParams.get("paid") === "true";
  const receipt = searchParams.get("receipt");

  const [tipMode, setTipMode] = useState<TipMode>("preset");
  const [tipPercent, setTipPercent] = useState<TipPresetPercent>(20);
  const [customTipAmount, setCustomTipAmount] = useState("0");
  const [delivery, setDelivery] = useState<PublicDelivery | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [accessPassword, setAccessPassword] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const isMissingLockbox =
    typeof error === "string" &&
    (/delivery not found/i.test(error) ||
      /lockbox not found/i.test(error) ||
      /no longer available/i.test(error));

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const fetchDelivery = useCallback(async (extraParams?: Record<string, string>) => {
    if (!id) return null;
    const searchParams = new URLSearchParams();
    if (accessPassword) searchParams.set("password", accessPassword);
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => searchParams.set(k, v));
    }
    const query = searchParams.toString();
    const res = await fetch(`/api/deliveries/${id}${query ? `?${query}` : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load lockbox.");
    console.log("📦 Lockbox API Response:", data);
    return data as PublicDelivery;
  }, [id, accessPassword]);

  const isPasswordRequiredError = useCallback((message: string) => /password required to access this lockbox/i.test(message), []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // Try to recover password from session storage if state is empty
      if (!accessPassword && id) {
        const saved = sessionStorage.getItem(`pw_${id}`);
        if (saved) setAccessPassword(saved);
      }

      setLoadState("loading");
      setError(null);

      try {
        const data = await fetchDelivery();
        if (!mounted || !data) return;
        setDelivery(data);
        setPasswordRequired(false);
        setLoadState("ready");
      } catch (err) {
        if (!mounted) return;
        const message = err instanceof Error ? err.message : "Unable to load this lockbox.";
        if (isPasswordRequiredError(message)) {
          setPasswordRequired(true);
          setError(null);
          setLoadState("ready");
          return;
        }
        setError(message);
        setLoadState("error");
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [fetchDelivery, isPasswordRequiredError, accessPassword, id]);

  useEffect(() => {
    if (!stripeReturnedAsPaid || !id) return;
    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const receipt = searchParams.get("receipt");

    const pollUntilPaid = async () => {
      if (cancelled) return;
      attempts += 1;

      try {
        const data = await fetchDelivery(receipt ? { receipt } : undefined);
        if (!data || cancelled) return;
        setDelivery(data);
        setLoadState("ready");

        if (data.status !== "paid" && attempts < 20) {
          timer = setTimeout(() => {
            void pollUntilPaid();
          }, 1500);
        }
      } catch {
        if (attempts < 20) {
          timer = setTimeout(() => {
            void pollUntilPaid();
          }, 1500);
        }
      }
    };

    timer = setTimeout(() => {
      void pollUntilPaid();
    }, 900);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [stripeReturnedAsPaid, id, fetchDelivery, searchParams]);

  const baseCents = delivery?.price_cents ?? 0;
  const customTipCents = Math.max(
    0,
    Math.min(
      250_000,
      Math.round(Number.parseFloat(customTipAmount || "0") * 100) || 0
    )
  );
  const tipCents = tipMode === "custom" ? customTipCents : Math.round(baseCents * (tipPercent / 100));
  const totalCents = baseCents + tipCents;

  const rawStatus = delivery?.payment_status || delivery?.status || "pending";
  // Treat 'processing' as 'pending' unless we are actively returning from Stripe with success
  const paymentStatus = (rawStatus === "processing" && !stripeReturnedAsPaid) ? "pending" : rawStatus;

  const isPaid = paymentStatus === "paid";
  const usageLimit = typeof delivery?.usage_limit === "number" ? delivery.usage_limit : null;
  const purchaseCount = typeof delivery?.purchase_count === "number" ? delivery.purchase_count : 0;
  const isSoldOut = usageLimit !== null && purchaseCount >= usageLimit && !isPaid;
  const checkoutDisabled =
    isCheckingOut ||
    isSoldOut ||
    paymentStatus === "processing" ||
    paymentStatus === "refunded" ||
    paymentStatus === "disputed" ||
    isPaid;

  const previewUrl = delivery?.preview_url?.startsWith("http") ? delivery.preview_url : null;

  async function handleCheckout() {
    if (!delivery || isPaid || isCheckingOut) return;
    setIsCheckingOut(true);
    setError(null);

    try {
      const email = normalizeEmail(clientEmail);
      if (!email || email.length > 320 || !looksLikeEmail(email)) {
        setError("Enter a valid email to continue checkout.");
        setIsCheckingOut(false);
        return;
      }

      const payload = await createCheckoutSession(delivery.id, tipCents, accessPassword || undefined, email);
      window.location.assign(payload.checkout_url);
    } catch (err) {
      const typed = err as Error & { code?: string };
      if (typed.code === "ALREADY_PURCHASED") {
        setRestoreOpen(true);
      }
      setError(typed.message || "Could not start Stripe checkout.");
      setIsCheckingOut(false);
    }
  }

  async function handleUnlockWithPassword() {
    if (!id || !passwordInput.trim()) return;
    setIsUnlocking(true);
    setError(null);
    try {
      const enteredPassword = passwordInput.trim();
      const data = await fetchPublicDelivery(id, enteredPassword);
      if (id) sessionStorage.setItem(`pw_${id}`, enteredPassword);
      setAccessPassword(enteredPassword);
      setDelivery(data);
      setPasswordRequired(false);
      setLoadState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password.");
    } finally {
      setIsUnlocking(false);
    }
  }

  if (loadState === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container/60 px-5 py-3 font-label-sm text-label-sm text-on-surface-variant">
          Loading lockbox...
        </div>
      </main>
    );
  }

  if (loadState === "error" || !delivery) {
    if (passwordRequired) {
      return (
        <main className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container/60 p-6 shadow-xl">
            <h1 className="font-headline-md text-headline-md text-on-surface">Password Required</h1>
            <p className="mt-2 text-body-base text-on-surface-variant">
              This lockbox is protected. Enter the password to view and purchase.
            </p>
            <div className="mt-4 space-y-3">
              <IconInput
                id="lockbox-password"
                type="password"
                icon="lock"
                placeholder="Enter lockbox password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
              />
              {error ? <p className="text-sm text-error">{error}</p> : null}
              <button
                type="button"
                onClick={handleUnlockWithPassword}
                disabled={isUnlocking || !passwordInput.trim()}
                className="w-full rounded-lg bg-primary px-4 py-3 font-label-sm text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUnlocking ? "Validating..." : "Unlock Lockbox"}
              </button>
            </div>
          </div>
        </main>
      );
    }
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-error/40 bg-error-container/20 p-6 text-center">
          <p className="font-headline-md text-headline-md text-on-error-container">
            {isMissingLockbox ? "Lockbox not available" : "Unable to load lockbox"}
          </p>
          <p className="mt-2 text-body-base text-on-surface-variant">
            {isMissingLockbox
              ? "This lockbox may have been deleted by the creator or the link is incorrect."
              : error || "Please try again shortly."}
          </p>
        </div>
      </main>
    );
  }

  if (paymentStatus === "processing" && stripeReturnedAsPaid) {
      return <PaymentProcessingView embed={isEmbed} />;
    }

  if (isPaid && delivery) {
    const downloadUrl = receipt ? `/api/deliveries/${delivery.id}/download?receipt=${encodeURIComponent(receipt)}` : `/api/deliveries/${delivery.id}/download`;
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(5,231,119,0.15)_0%,_transparent_15%),radial-gradient(circle_at_70%_80%,_rgba(176,198,255,0.15)_0%,_transparent_15%),radial-gradient(circle_at_80%_30%,_rgba(250,189,0,0.1)_0%,_transparent_10%),radial-gradient(circle_at_20%_70%,_rgba(176,198,255,0.1)_0%,_transparent_15%)]" />
        </div>

        <section className="relative z-10 w-full max-w-lg">
          <div className="relative overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container/40 p-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur-[20px] md:p-12">
            <div className="absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-secondary/20 bg-secondary-container/10 shadow-[0_0_30px_rgba(5,231,119,0.15)]">
              <AppIcon name="unlock" size={40} className="text-secondary" />
            </div>

            <h1 className="mb-3 font-headline-md text-headline-md text-on-surface">Transaction Complete.</h1>
            <p className="mx-auto mb-10 max-w-sm text-body-base text-on-surface-variant">
              Payment received. Your secure assets are unlocked and ready to download.
            </p>

            <div className="flex flex-col gap-4">
              <a
                href={downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-primary px-6 py-4 font-label-sm text-label-sm uppercase tracking-widest text-on-primary transition-all duration-300 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(176,198,255,0.3)]"
              >
                <div className="absolute left-0 top-0 h-px w-full bg-white/40" />
                <AppIcon name="download" size={18} className="relative z-10" />
                <span className="relative z-10">Download Final Assets</span>
              </a>

              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-lowest/50 p-3 text-left">
                <span className="mb-2 block font-label-sm text-label-sm uppercase text-outline">Download Link</span>
                <div className="flex items-start justify-between gap-3">
                  <p className="break-all font-mono-data text-mono-data text-on-surface-variant">{downloadUrl}</p>
                  <CopyButton text={downloadUrl} />
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-12 flex items-center justify-center gap-2 font-label-sm text-label-sm uppercase tracking-widest text-outline opacity-80">
            <AppIcon name="shield" size={14} />
            Secured by Paywall.zip
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main
      className={[
        isEmbed ? "flex flex-col items-center justify-center p-4 text-on-background antialiased selection:bg-primary/30 selection:text-primary" : "flex min-h-screen flex-col items-center justify-center p-4 text-on-background antialiased selection:bg-primary/30 selection:text-primary md:p-gutter",
      ].join(" ")}
    >
      <div className="mb-8 flex items-center gap-2">
        <AppIcon name="layers" size={24} className="text-primary" />
        <span className="font-headline-md text-headline-md tracking-tight text-on-surface">Paywall.zip</span>
      </div>

      <section className="relative z-10 flex w-full max-w-[600px] flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container/60 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-[20px]">
        <div className="relative h-64 w-full overflow-hidden bg-surface-container-highest md:h-80">
          {previewUrl ? (
            // Dynamic, user-provided URLs can be from arbitrary hosts; keep native img for compatibility.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={delivery.title}
              className="h-full w-full object-cover opacity-80 mix-blend-luminosity transition-all duration-700 hover:opacity-100 hover:mix-blend-normal"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-container-highest text-on-surface-variant">
              <AppIcon name="image" size={28} />
              <span className="font-label-sm text-label-sm uppercase tracking-widest">Preview Locked</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container/90 via-transparent to-transparent" />
        </div>

        <div className="relative flex flex-col px-6 pb-8 pt-0 md:px-8">
          <div className="relative z-20 mx-auto -mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-outline-variant bg-surface-container-highest shadow-[0_0_20px_rgba(176,198,255,0.15)]">
            <AppIcon name="lock" size={28} className="text-primary" />
          </div>

          <div className="mb-8 mt-6 flex flex-col gap-2 text-center">
            <h1 className="font-headline-md text-headline-md text-on-surface">Work is Locked</h1>
            <p className="text-body-base text-on-surface-variant">{delivery.preview_text || "Pay to reveal the download link."}</p>
            {delivery.creator ? (
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <div className="flex items-center gap-3">
                  {delivery.creator.avatar_url ? (
                    // Dynamic, user-provided URLs can be from arbitrary hosts; keep native img for compatibility.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={delivery.creator.avatar_url}
                      alt={delivery.creator.name}
                      className="h-9 w-9 rounded-full border border-outline-variant/30 object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-outline-variant/30 bg-surface-container-highest font-mono-data text-[11px] uppercase tracking-widest text-on-surface">
                      {delivery.creator.name.trim().slice(0, 1) || "F"}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-label-sm text-label-sm text-on-surface">{delivery.creator.name}</div>
                    <div className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant">
                      Creator
                    </div>
                  </div>
                </div>
                <span
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono-data text-[9px] uppercase tracking-widest",
                    delivery.creator.stripe_connected
                      ? "border-secondary/20 bg-secondary/10 text-secondary"
                      : "border-tertiary/20 bg-tertiary/10 text-tertiary",
                  ].join(" ")}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${delivery.creator.stripe_connected ? "bg-secondary" : "bg-tertiary"}`} />
                  {delivery.creator.stripe_connected ? "Stripe connected" : "Stripe pending"}
                </span>
              </div>
            ) : null}
          </div>

          <div className="mb-6 flex flex-col gap-3">
            <label className="pl-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Tip Jar</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIP_PRESETS.map((option) => (
                <TipOptionButton
                  key={option.percent}
                  option={{ id: String(option.percent), label: option.label }}
                  selected={tipMode === "preset" && tipPercent === option.percent}
                  onClick={() => {
                    setTipMode("preset");
                    setTipPercent(option.percent);
                  }}
                />
              ))}
              <TipOptionButton
                option={{ id: "custom", label: "Custom Tip" }}
                selected={tipMode === "custom"}
                onClick={() => {
                  setTipMode("custom");
                }}
              />
            </div>

            {tipMode === "custom" ? (
              <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4">
                <label className="mb-2 block pl-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant" htmlFor="custom-tip">
                  Custom Tip Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono-data text-mono-data text-outline-variant">
                    $
                  </span>
                  <input
                    id="custom-tip"
                    value={customTipAmount}
                    onChange={(event) => setCustomTipAmount(event.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                    className="w-full rounded-lg border border-outline-variant/50 bg-surface-container-highest/60 py-2.5 pl-8 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant focus:border-primary-container focus:bg-surface-container-highest focus:ring-0 focus:shadow-[0_0_15px_rgba(85,141,255,0.25)]"
                    placeholder="0.00"
                  />
                </div>
                <p className="mt-2 pl-1 text-sm text-on-surface-variant">Default is $0.00. Tip max is $2500.00.</p>
              </div>
            ) : null}
          </div>

          <div className="mb-8 flex flex-col gap-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-5">
            <div className="mb-6 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label
                  htmlFor="client-email"
                  className="pl-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
                >
                  Email
                </label>
                <span className="font-mono-data text-[9px] uppercase tracking-widest text-outline-variant">Required</span>
              </div>
              <IconInput
                id="client-email"
                type="email"
                icon="mail"
                placeholder="Email for receipt & restore"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <p className="pl-1 text-sm text-on-surface-variant">
                We&apos;ll send a receipt and use this email to restore access later.
              </p>
            </div>
            
            <div className="flex items-center justify-between font-mono-data text-mono-data text-on-surface-variant">
              <span>Base Amount</span>
              <span>{centsToUsd(baseCents)}</span>
            </div>
            <div className="flex items-center justify-between font-mono-data text-mono-data text-secondary">
              <span>{tipMode === "custom" ? "Tip (Custom)" : `Tip (${tipPercent}%)`}</span>
              <span>+ {centsToUsd(tipCents)}</span>
            </div>
            <div className="my-1 h-px w-full bg-outline-variant/30" />
            <div className="flex items-center justify-between font-mono-data text-lg text-on-surface">
              <span className="font-bold">Total Due</span>
              <span className="font-bold">{centsToUsd(totalCents)}</span>
            </div>
          </div>

          {stripeReturnedAsPaid && (
            <div className="mb-4 rounded-lg border border-secondary/40 bg-secondary-container/10 px-4 py-2 text-center font-label-sm text-label-sm text-secondary">
              Verifying payment confirmation...
            </div>
          )}

          {paymentStatus === "processing" && (
            <div className="mb-4 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-center font-label-sm text-label-sm text-primary">
              Payment is processing. This can take a few moments.
            </div>
          )}
          {(paymentStatus === "failed" || paymentStatus === "expired") && (
            <div className="mb-4 rounded-lg border border-tertiary/40 bg-tertiary/10 px-4 py-2 text-center font-label-sm text-label-sm text-tertiary">
              {delivery.status_reason || "Payment did not complete. Please try checkout again."}
            </div>
          )}
          {(paymentStatus === "refunded" || paymentStatus === "disputed") && (
            <div className="mb-4 rounded-lg border border-error/40 bg-error-container/20 px-4 py-2 text-center font-label-sm text-label-sm text-on-error-container">
              Access is currently restricted for this delivery.
            </div>
          )}
          {isSoldOut && (
            <div className="mb-4 rounded-lg border border-tertiary/40 bg-tertiary/10 px-4 py-2 text-center font-label-sm text-label-sm text-tertiary">
              This lockbox has reached its usage limit.
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-error/40 bg-error-container/20 px-4 py-2 text-center font-label-sm text-label-sm text-on-error-container">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleCheckout}
              disabled={checkoutDisabled}
              className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary py-4 font-headline-md text-headline-md text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_20px_rgba(176,198,255,0.2)] transition-all duration-300 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0_25px_rgba(176,198,255,0.4)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <AppIcon name="credit_card" size={22} />
              {isCheckingOut
                ? "Redirecting..."
                : paymentStatus === "processing"
                  ? "Payment Processing..."
                  : isPaid
                    ? "Payment Confirmed"
                    : isSoldOut
                      ? "Sold Out"
                    : `Pay ${centsToUsd(totalCents)} to Unlock`}
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setRestoreOpen(true);
              }}
              className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4"
            >
              Already paid? Restore Access
            </button>
          </div>
        </div>
      </section>

      {id ? (
        <RestoreAccessDialog
          open={restoreOpen}
          deliveryId={id}
          initialEmail={clientEmail}
          onClose={() => setRestoreOpen(false)}
          onRestored={async (email) => {
            setClientEmail(email);
            setError(null);
            try {
              const data = await fetchDelivery();
              if (data) setDelivery(data);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to restore access.");
            }
          }}
        />
      ) : null}

      {!isEmbed ? (
        <div className="mt-8 flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant/60">
          <AppIcon name="verified_user" size={16} />
          <span>Secured via Stripe</span>
        </div>
      ) : null}
    </main>
  );
}
