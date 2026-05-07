"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { CustomSelect } from "@/components/ui/forms/CustomSelect";

export type EditableLockbox = {
  id: string;
  title: string;
  priceCents: number;
  previewText: string;
  previewUrl: string;
  secureLink: string;
  platformFeePercent: number;
  requiresPassword: boolean;
  isListed?: boolean;
};

export function LockboxFormDialog({
  open,
  onClose,
  editLockbox,
  onSave,
  saving,
  error,
}: {
  open: boolean;
  onClose: () => void;
  editLockbox?: EditableLockbox | null;
  onSave?: (payload: {
    title: string;
    priceCents: number;
    previewText: string;
    previewUrl: string;
    secureLink: string;
    platformFeePercent: number;
    isListed: boolean;
  }) => void;
  saving?: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const [storefrontEnabled, setStorefrontEnabled] = useState(false);
  const [price, setPrice] = useState(editLockbox ? (editLockbox.priceCents / 100).toFixed(2) : "");
  const [title, setTitle] = useState(editLockbox?.title || "");
  const [secureLink, setSecureLink] = useState(editLockbox?.secureLink || "");
  const [description, setDescription] = useState(editLockbox?.previewText || "");
  const [proofUrl, setProofUrl] = useState(editLockbox?.previewUrl || "");
  const [protectWithPassword, setProtectWithPassword] = useState(editLockbox?.requiresPassword || false);
  const [password, setPassword] = useState("");
  const [usageLimit, setUsageLimit] = useState("unlimited");
  const [feePercent, setFeePercent] = useState(editLockbox?.platformFeePercent || 5);
  const [listOnStorefront, setListOnStorefront] = useState(Boolean(editLockbox?.isListed));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  const displayError = error || submitFeedback;
  const isCurrentlySaving = saving || isSubmitting;

  const usageOptions = [
    { value: "unlimited", label: "Unlimited Downloads" },
    { value: "1", label: "1 Use Only" },
    { value: "5", label: "5 Uses" },
    { value: "10", label: "10 Uses" },
    { value: "25", label: "25 Uses" },
  ];

  const normalizedProofUrl = proofUrl.trim();
  const hasValidProtocol = normalizedProofUrl.startsWith("http://") || normalizedProofUrl.startsWith("https://");
  const hasImageExtension = /\.(jpg|jpeg|png|webp|gif)$/i.test(normalizedProofUrl);
  const isProofUrlValid = normalizedProofUrl.length > 0 && hasValidProtocol && hasImageExtension;

  const receiveLabel = useMemo(() => {
    const parsed = Number.parseFloat(price || "0");
    if (Number.isNaN(parsed) || parsed <= 0) return "$0.00";
    const receive = parsed * (1 - feePercent / 100);
    return `$${receive.toFixed(2)}`;
  }, [price, feePercent]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as { profile?: { storefront_enabled?: boolean } };
        if (cancelled) return;
        setStorefrontEnabled(Boolean(json.profile?.storefront_enabled));
      } catch {
        if (cancelled) return;
        setStorefrontEnabled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function handleCreateLockbox(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editLockbox && onSave) {
      onSave({
        title,
        priceCents: Math.round(Number.parseFloat(price || "0") * 100),
        previewText: description,
        previewUrl: proofUrl,
        secureLink,
        platformFeePercent: feePercent,
        isListed: storefrontEnabled ? listOnStorefront : false,
      });
      return;
    }

    setSubmitFeedback(null);
    setIsSubmitting(true);
    try {
      const priceCents = Math.round(Number.parseFloat(price || "0") * 100);
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          preview_text: description,
          preview_url: proofUrl || undefined,
          price_cents: priceCents,
          secure_link: secureLink,
          platform_fee_percent: feePercent,
          requires_password: protectWithPassword,
          access_password: protectWithPassword ? password : undefined,
          usage_limit: usageLimit,
          is_listed: storefrontEnabled ? listOnStorefront : false,
        }),
      });
      const payload = (await res.json()) as {
        error?: string;
        delivery_id?: string;
        requires_stripe?: boolean;
      };
      if (!res.ok || !payload.delivery_id) {
        throw new Error(payload.error || "Failed to create lockbox.");
      }

      if (payload.requires_stripe) {
        const onboardRes = await fetch("/api/stripe/onboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ delivery_id: payload.delivery_id }),
        });
        const onboardPayload = (await onboardRes.json()) as { url?: string; error?: string };
        if (onboardRes.ok && onboardPayload.url) {
          window.location.assign(onboardPayload.url);
          return;
        }
      }

      setSubmitFeedback("Lockbox created successfully.");
      router.refresh();
      onClose();
    } catch (err) {
      setSubmitFeedback(err instanceof Error ? err.message : "Unable to create lockbox.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditMode = Boolean(editLockbox);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={isEditMode ? "Edit Lockbox" : "Secure Your Work"}
      showHeader={false}
      panelClassName="border-0 bg-transparent shadow-none md:max-w-2xl"
      contentClassName="p-0 md:p-0"
    >
      <div className="relative w-full">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lockbox form"
          className="absolute right-3 top-3 z-20 rounded-md p-2 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <AppIcon name="close" size={18} />
        </button>

        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent bg-surface-container/40 p-8 shadow-2xl backdrop-blur-[20px] transition-colors duration-500 hover:border-white/30">
          <div className="pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-all duration-500 group-hover:border-primary-container/40 group-hover:shadow-[0_0_15px_rgba(41,121,255,0.4)]" />
          <div className="mb-8 text-center">
            <h1 className="mb-2 font-headline-md text-headline-md text-on-background">
              {isEditMode ? "Edit Lockbox" : "Secure Your Work"}
            </h1>
            <p className="font-body-base text-body-base text-on-surface-variant">
              {isEditMode ? "Update your lockbox details and pricing." : "Lock your deliverables behind a frictionless paywall."}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleCreateLockbox}>
        <div>
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="deliverable-title">
            Deliverable Title
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="folder_zip" className="text-outline" size={18} />
            </span>
            <input id="deliverable-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container" placeholder="e.g., Logo Pack Final" type="text" />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 w-full resize-y rounded-lg border border-outline-variant bg-surface-container-high px-4 py-3 font-body-base text-body-base text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container"
            placeholder="Add context for the client (what is included, format, revision notes)."
          />
        </div>

        <div>
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="price">
            Price
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 font-mono-data text-mono-data text-outline">$</span>
            <input id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 pl-8 pr-4 font-mono-data text-mono-data text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container" placeholder="0.00" type="number" min="0" step="0.01" />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="file-url">
            Google Drive/Dropbox URL
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="link" className="text-outline" size={18} />
            </span>
            <input id="file-url" value={secureLink} onChange={(e) => setSecureLink(e.target.value)} required className="w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container" placeholder="https://" type="url" />
          </div>
        </div>

        <div>
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="proof-url">
            Proof of Work (Screenshot URL)
          </label>
          <div className="relative mb-3">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="image" className="text-outline" size={18} />
            </span>
            <input id="proof-url" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container" placeholder="https://" type="url" />
          </div>
          {normalizedProofUrl.length > 0 && !isProofUrlValid ? (
            <p className="mb-3 text-[11px] text-tertiary">Use a valid image URL (http/https and .jpg/.png/.webp/.gif).</p>
          ) : null}
          <div className="relative h-32 w-full overflow-hidden rounded-lg border border-outline-variant/50 bg-surface-container-lowest">
            {/* User-provided URLs can be from arbitrary hosts; keep native img for compatibility. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Proof Thumbnail"
              src={
                isProofUrlValid
                  ? normalizedProofUrl
                  : "https://lh3.googleusercontent.com/aida-public/AB6AXuA3-eTOORNdT3HDTi0qZQVq50jTUgVqmtydM_9FS_7Aka-9vnxJLN2mxJsXBHvprvenXXqx7rw28_dopW8OLlBBBzDnpid6xZkIyemu6IE-ASl_Cpf86PTRJ_GOVdVyx3nY3cs2RZIMl6ay4aZQpsh4FYoNGaSJWmsTSPp9pIaOhrTU-nR_EXn1hnlCaXUs-f5knEIr8XgPDs97rIEaE1APVLj35YpcohaEtmC7s0ap3snrkOWy5LtNxSLOW2jbCtaVV-HtFRyhvG4"
              }
              className="h-full w-full object-cover opacity-80"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-background/80 to-transparent p-2">
              <span className="font-label-sm text-label-sm text-on-surface">{isProofUrlValid ? "Preview Active" : "Preview Inactive"}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/5 py-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="password-toggle">Password Protection</label>
            <p className="text-[11px] text-outline/70">Require a password to access the file</p>
          </div>
          <label className={`relative inline-flex items-center ${isEditMode ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            <input id="password-toggle" checked={protectWithPassword} onChange={(e) => setProtectWithPassword(e.target.checked)} disabled={isEditMode} type="checkbox" className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-surface-container-highest peer-checked:bg-primary-container after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
          </label>
        </div>
        {isEditMode ? (
          <p className="mb-4 text-[11px] text-tertiary">Password protection cannot be changed after creation.</p>
        ) : protectWithPassword ? (
          <div>
            <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="download-password">
              Download Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <AppIcon name="key" className="text-outline" size={18} />
              </span>
              <input id="download-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 pl-10 pr-4 font-body-base text-body-base text-on-surface outline-none transition-all placeholder:text-outline/50 focus:border-primary-container focus:bg-surface-container-highest focus:ring-1 focus:ring-primary-container" placeholder="Set a strong password" type="password" />
            </div>
          </div>
        ) : null}

        <div className="pb-6">
          <label className="mb-2 block font-label-sm text-label-sm text-on-surface-variant" htmlFor="usage-limit">Usage Limit</label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <AppIcon name="group" className="text-outline" size={18} />
            </span>
            <CustomSelect value={usageLimit} onChange={setUsageLimit} options={usageOptions} className="pl-0" />
          </div>
        </div>

        {storefrontEnabled ? (
        <div className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="list-storefront">
                List on storefront (optional)
              </label>
              <p className="mt-1 text-[11px] text-outline">
                Off by default. Enable your storefront in Settings to make a public store page.
              </p>
            </div>
            <label className={`relative inline-flex items-center ${isCurrentlySaving ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
              <input
                id="list-storefront"
                checked={listOnStorefront}
                onChange={(e) => setListOnStorefront(e.target.checked)}
                disabled={isCurrentlySaving}
                type="checkbox"
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-surface-container-highest peer-checked:bg-primary-container after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
        ) : null}

        <div className="border-t border-white/5 pt-4">
          <div className="mb-2 flex items-center justify-between">
            <label className="block font-label-sm text-label-sm text-on-surface-variant" htmlFor="generosity">
              Platform Fee (Generosity)
            </label>
            <span className="font-label-sm text-label-sm font-semibold text-primary-container">Standard fee ({feePercent}%)</span>
          </div>
          <input id="generosity" className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-container-highest accent-primary-container" type="range" min="5" max="20" value={feePercent} onChange={(e) => setFeePercent(Number(e.target.value))} />
          <div className="mt-2 flex justify-between font-mono-data text-label-sm text-outline">
            <span>5%</span>
            <span>20%</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-surface-container-lowest/50 p-4 backdrop-blur-sm">
          <span className="font-body-base text-body-base text-on-surface-variant">You receive:</span>
          <span className="font-headline-md text-headline-md tracking-tight text-secondary-fixed-dim">{receiveLabel}</span>
        </div>

        <button type="submit" disabled={isCurrentlySaving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-4 text-[18px] font-headline-md text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(41,121,255,0.25)] transition-all duration-300 hover:brightness-110 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_0_30px_rgba(41,121,255,0.45)] disabled:cursor-not-allowed disabled:opacity-70">
          <AppIcon name={isEditMode ? "check_circle" : "lock"} size={18} />
          {isCurrentlySaving ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Secure Lockbox Link")}
        </button>
        {displayError ? <p className="text-center text-sm text-error">{displayError}</p> : null}
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-center font-label-sm text-label-sm text-outline">
          <span className="flex items-center gap-1"><AppIcon name="shield" size={14} /> AES-256 Encryption</span>
          <span className="h-1 w-1 rounded-full bg-outline-variant" />
          <span className="flex items-center gap-1"><AppIcon name="bolt" size={14} /> Instant Payouts</span>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
