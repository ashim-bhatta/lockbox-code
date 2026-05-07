"use client";

import Link from "next/link";
import { useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { SettingsSectionCard } from "@/components/dashboard/SettingsSectionCard";
import { StripeConnectButton } from "@/components/dashboard/StripeConnectButton";
import { StripeLoginButton } from "@/components/dashboard/StripeLoginButton";
import { STRIPE_SUPPORTED_COUNTRIES } from "@/lib/constants/countries";
import { CopyButton } from "@/components/ui/feedback/CopyButton";

export function SettingsContent({
  profile,
}: {
  profile: {
    full_name: string;
    email: string;
    country: string;
    stripe_account_id: string | null;
    stripe_details_submitted: boolean;
    payout_currency: string;
    avatar_url: string | null;
    storefront_enabled: boolean;
    storefront_handle: string;
    storefront_title: string;
    storefront_description: string;
  };
}) {
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [country, setCountry] = useState(profile.country || "US");
  const [currency, setCurrency] = useState(profile.payout_currency || "USD");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [storeEnabled, setStoreEnabled] = useState(Boolean(profile.storefront_enabled));
  const [storeHandle, setStoreHandle] = useState(profile.storefront_handle || "");
  const [storeTitle, setStoreTitle] = useState(profile.storefront_title || "");
  const [storeDescription, setStoreDescription] = useState(profile.storefront_description || "");
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const isStripeConnected = Boolean(profile.stripe_account_id);

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          payout_currency: currency,
          country: country,
          avatar_url: avatarUrl.trim() ? avatarUrl.trim() : null,
          storefront_enabled: storeEnabled,
          storefront_handle: storeHandle.trim() ? storeHandle.trim() : null,
          storefront_title: storeTitle.trim() ? storeTitle.trim() : null,
          storefront_description: storeDescription.trim() ? storeDescription.trim() : null,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || "Unable to save profile.");
      }
      setStatus("Profile updated.");
      return true;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to update profile.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setStatus(null);
    try {
      const saved = await handleSave();
      if (!saved) return;

      const res = await fetch("/api/storefront/publish", { method: "POST" });
      const payload = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to publish storefront.");
      }
      setStatus("Storefront published.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to publish storefront.");
    } finally {
      setPublishing(false);
    }
  }

  const storePath = `/s/${storeHandle.trim().toLowerCase() || "your-handle"}`;

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div className="flex flex-col space-y-12 lg:col-span-2">
        <SettingsSectionCard title="Profile" subtitle="ENTITY_IDENTITY_RECORD_V1">
          <div className="mb-12 flex flex-col items-start gap-12 sm:flex-row">
            <div className="relative">
              <div className="h-32 w-32 border-razor overflow-hidden bg-black p-1">
                {/* User-provided URLs can be from arbitrary hosts; keep native img for compatibility. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Profile avatar"
                  className="h-full w-full object-cover grayscale contrast-125"
                  src={
                    avatarUrl.trim()
                      ? avatarUrl.trim()
                      : "https://lh3.googleusercontent.com/aida-public/AB6AXuDsoVRaiJSj_5b_XvjL0IkYL5HVKZdckn_z1N5gK4swkMx7OVN17u8E4CBvlWJPMP1oQArYdw-05cOCkoQaT_zHiBgj0SzB4CPyu8U8ucaevqek48RrQQRp-Jb3zJUV99ajCOcnKSwb1hhk63XBjniT0BAp9q3znchNhrjGsg7WrGpIVbf-bYOZoLnGODM42qkRlsxbETBHGhnjINd36UQb9yozyS8vd4rXSiJZzHsPZXa09zeDCh_-c7kaa282J7G0DfqUh7csCt4"
                  }
                  width={128}
                  height={128}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 h-6 w-6 border-r border-b border-primary" />
            </div>
            
            <div className="w-full space-y-8">
              <div className="relative">
                <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">Full_Name</label>
                <input 
                  className="border-razor w-full bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none transition-premium focus:border-primary" 
                  type="text" 
                  value={fullName} 
                  onChange={(event) => setFullName(event.target.value)} 
                />
              </div>
              <div className="relative">
                <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">Avatar_URL</label>
                <input
                  className="border-razor w-full bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none transition-premium focus:border-primary"
                  type="url"
                  value={avatarUrl}
                  onChange={(event) => setAvatarUrl(event.target.value)}
                  placeholder="https://..."
                />
                <p className="mt-2 px-1 font-mono-data text-[9px] uppercase tracking-widest text-on-surface-variant opacity-60">
                  HTTPS URLs only. Used on public lockboxes.
                </p>
              </div>
              <div className="relative">
                <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">Email_Address_Record</label>
                <input 
                  className="border-razor w-full bg-black/40 px-5 py-4 font-mono-data text-xs text-on-surface-variant outline-none disabled:cursor-not-allowed opacity-60" 
                  type="email" 
                  value={profile.email} 
                  readOnly 
                  disabled 
                />
              </div>
              <div className="relative">
                <div className="mb-2 flex items-center justify-between px-1">
                  <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant">Business_Jurisdiction</label>
                  {isStripeConnected && (
                    <span className="font-mono-data text-[8px] uppercase tracking-widest text-primary/60">Locked_Post_Link</span>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    disabled={isStripeConnected}
                    className="border-razor w-full appearance-none bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none transition-premium focus:border-primary disabled:opacity-40"
                  >
                    {STRIPE_SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-black">
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-primary/40">
                    <AppIcon name="expand_more" size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-end">
            <button 
              className="btn-primary px-10 py-4 font-mono-data text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black transition-premium disabled:opacity-30" 
              onClick={handleSave} 
              disabled={saving}
            >
              {saving ? "EXECUTING_PATCH..." : "SYNC_IDENTITY"}
            </button>
          </div>
          {status ? <p className="mt-6 font-mono-data text-[9px] uppercase tracking-widest text-right text-primary/60">{status}</p> : null}
        </SettingsSectionCard>

        <SettingsSectionCard title="Liquidity" subtitle="PAYOUT_RAIL_CONFIGURATION_V2">
          <div className="mb-10 border-razor bg-surface-container-low p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="border-razor flex h-14 w-14 items-center justify-center bg-black text-primary">
                  <span className="material-symbols-outlined text-3xl">account_balance</span>
                </div>
                <div>
                  <p className="font-display-lg text-lg uppercase tracking-tight text-on-surface">Stripe_Connect_Node</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 ${profile.stripe_details_submitted ? "bg-secondary" : profile.stripe_account_id ? "bg-error" : "bg-tertiary"}`} />
                    <p className={`font-mono-data text-[9px] uppercase tracking-[0.2em] ${profile.stripe_details_submitted ? "text-secondary" : profile.stripe_account_id ? "text-error" : "text-tertiary"}`}>
                      {profile.stripe_details_submitted ? "ACTIVE_UPLINK" : profile.stripe_account_id ? "KYC_DATA_REQUIRED" : "UPLINK_OFFLINE"}
                    </p>
                  </div>
                </div>
              </div>
              {profile.stripe_account_id ? (
                <StripeLoginButton
                  label="MANAGE_RAIL"
                  className="border-razor px-6 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-premium"
                />
              ) : (
                <StripeConnectButton
                  label="INITIALIZE_LINK"
                  className="btn-primary px-8 py-3 font-mono-data text-[10px] uppercase tracking-widest"
                />
              )}
            </div>
          </div>
          
          <div className="relative">
            <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">Settlement_Currency</label>
            <select 
              value={currency} 
              onChange={(event) => setCurrency(event.target.value)} 
              className="border-razor w-full bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none"
            >
              <option value="USD" className="bg-black">USD_UNITED_STATES_DOLLAR</option>
            </select>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="Storefront" subtitle="OPTIONAL_PUBLIC_LISTING_V1">
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-6 rounded-lg border border-outline-variant/20 bg-surface-container-low p-6">
              <div>
                <p className="font-body-base text-body-base text-on-surface">
                  Enable a public storefront page (off by default).
                </p>
                <p className="mt-2 font-mono-data text-[9px] uppercase tracking-widest text-on-surface-variant opacity-70">
                  Only lockboxes you explicitly list will appear.
                </p>
              </div>
              <label className={`relative inline-flex items-center ${saving ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
                <input
                  checked={storeEnabled}
                  onChange={(e) => setStoreEnabled(e.target.checked)}
                  disabled={saving}
                  type="checkbox"
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-surface-container-highest peer-checked:bg-primary-container after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative">
                <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">
                  Store_Handle
                </label>
                <input
                  className="border-razor w-full bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none transition-premium focus:border-primary"
                  type="text"
                  value={storeHandle}
                  onChange={(event) => setStoreHandle(event.target.value)}
                  placeholder="your-name"
                  disabled={saving}
                />
                <p className="mt-2 px-1 font-mono-data text-[9px] uppercase tracking-widest text-on-surface-variant opacity-60">
                  3-30 chars, a-z, 0-9, dash.
                </p>
              </div>

              <div className="border-razor bg-black/40 p-5">
                <div className="flex items-center justify-between">
                  <div className="font-mono-data text-[9px] uppercase tracking-widest text-on-surface-variant opacity-70">
                    Store_URL
                  </div>
                  <CopyButton
                    text={typeof window === "undefined" ? "" : `${window.location.origin}${storePath}`}
                    className="border-razor p-2 text-on-surface-variant hover:text-primary"
                    feedbackClassName="text-xs"
                  />
                </div>
                <div className="mt-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface">
                  {storePath}
                </div>
                <p className="mt-3 text-xs text-on-surface-variant">
                  Turn on the storefront toggle, then list lockboxes from your dashboard.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href="/settings/storefront"
                    className="border-razor inline-flex items-center justify-center gap-2 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface transition-premium hover:bg-surface-container-high"
                  >
                    <AppIcon name="dashboard" size={14} className="text-primary/70" />
                    Open_Builder
                  </Link>
                  <Link
                    href={storePath}
                    className="border-razor inline-flex items-center justify-center gap-2 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant transition-premium hover:bg-surface-container-high hover:text-on-surface"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <AppIcon name="link" size={14} className="text-on-surface-variant" />
                    View_Public
                  </Link>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">
                Store_Title
              </label>
              <input
                className="border-razor w-full bg-black px-5 py-4 font-mono-data text-xs text-on-surface outline-none transition-premium focus:border-primary"
                type="text"
                value={storeTitle}
                onChange={(event) => setStoreTitle(event.target.value)}
                placeholder="Digital goods, templates, deliverables..."
                disabled={saving}
              />
            </div>

            <div className="relative">
              <label className="font-mono-data text-[9px] uppercase tracking-[0.4em] text-on-surface-variant block mb-2 px-1">
                Store_Description
              </label>
              <textarea
                className="border-razor w-full bg-black px-5 py-4 font-body-base text-body-base text-on-surface outline-none transition-premium focus:border-primary"
                value={storeDescription}
                onChange={(event) => setStoreDescription(event.target.value)}
                placeholder="What do you sell? What should buyers expect?"
                rows={4}
                disabled={saving}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-3">
              <button
                className="btn-primary px-10 py-4 font-mono-data text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-white hover:text-black transition-premium disabled:opacity-30"
                onClick={handleSave}
                disabled={saving || publishing}
                type="button"
              >
                {saving ? "EXECUTING_PATCH..." : "SAVE_STOREFRONT"}
              </button>
              <button
                className="border-razor bg-black px-10 py-4 font-mono-data text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface transition-premium hover:bg-surface-container-high disabled:opacity-30"
                onClick={handlePublish}
                disabled={saving || publishing}
                type="button"
              >
                {publishing ? "PUBLISHING..." : "PUBLISH_LIVE"}
              </button>
            </div>
          </div>
        </SettingsSectionCard>
      </div>

      <div className="flex flex-col space-y-12">
        <SettingsSectionCard title="Security" subtitle="AUTHENTICATION_HARDENING_V1">
          <div className="space-y-10">
            <div>
              <p className="mb-4 font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Credentials</p>
              <Link 
                href="/auth/update-password" 
                className="border-razor flex w-full items-center justify-between bg-black px-6 py-4 text-left font-mono-data text-[11px] uppercase tracking-widest text-on-surface transition-premium hover:bg-surface-container-high"
              >
                Update_Password
                <AppIcon name="chevron_right" size={14} className="text-primary/40" />
              </Link>
            </div>
            
            <div className="border-razor border-t border-white/5 pt-10">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">Multi_Factor</p>
                <div className="border-razor h-4 w-10 bg-black p-0.5">
                  <div className="h-full w-4 bg-primary/20" />
                </div>
              </div>
              <p className="font-mono-data text-[9px] leading-relaxed tracking-widest text-on-surface-variant opacity-60">
                ADDITIONAL_ENTROPY_LAYER_REQUIRED_FOR_SENSITIVE_MODS
              </p>
            </div>
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  );
}
