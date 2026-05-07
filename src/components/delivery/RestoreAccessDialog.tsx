"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { IconInput } from "@/components/auth/ui/IconInput";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { requestRestoreCode, verifyRestoreCode } from "@/lib/delivery-api";

type Step = "email" | "otp";

function normalizeEmail(input: string) {
  return input.trim().toLowerCase();
}

function looksLikeEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export function RestoreAccessDialog({
  open,
  deliveryId,
  initialEmail,
  onClose,
  onRestored,
}: {
  open: boolean;
  deliveryId: string;
  initialEmail?: string;
  onClose: () => void;
  onRestored: (email: string) => void | Promise<void>;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(initialEmail || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);
  const canSend = normalizedEmail.length > 0 && looksLikeEmail(normalizedEmail) && !busy;
  const canVerify = /^[0-9]{6}$/.test(otp.replace(/\s+/g, "")) && canSend;

  useEffect(() => {
    if (!open) return;
    setStep("email");
    setEmail(initialEmail || "");
    setOtp("");
    setError(null);
    setNotice(null);
    setBusy(false);
  }, [open, initialEmail]);

  async function handleSendCode() {
    if (!canSend) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await requestRestoreCode(deliveryId, normalizedEmail);
      setStep("otp");
      setNotice(`Code sent to ${normalizedEmail}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleVerifyCode() {
    if (!canVerify) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await verifyRestoreCode(deliveryId, normalizedEmail, otp.replace(/\s+/g, ""));
      await onRestored(normalizedEmail);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ResponsiveDialog open={open} title="Restore Access" onClose={onClose} panelClassName="max-w-xl">
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-body-base text-on-surface-variant">
            Enter the email used at checkout. We&apos;ll send a 6-digit code to restore access to this lockbox.
          </p>
          <div className="flex items-center gap-2 font-mono-data text-[10px] uppercase tracking-widest text-outline-variant">
            <AppIcon name="shield_check" size={14} className="text-primary/80" />
            <span>One-time code • 10 minutes</span>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-outline-variant/20 bg-surface-container-low p-5">
          <label
            htmlFor="restore-email"
            className="pl-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
          >
            Email
          </label>
          <IconInput
            id="restore-email"
            type="email"
            icon="mail"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
            disabled={busy || step === "otp"}
          />

          {step === "otp" ? (
            <>
              <div className="mt-4 space-y-2">
                <label
                  htmlFor="restore-otp"
                  className="pl-1 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant"
                >
                  Code
                </label>
                <IconInput
                  id="restore-otp"
                  type="text"
                  icon="key"
                  placeholder="6-digit code"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  disabled={busy}
                />
                <p className="pl-1 text-sm text-on-surface-variant">
                  Check spam/junk if you don&apos;t see it.
                </p>
              </div>
            </>
          ) : null}

          {notice ? (
            <div className="rounded-lg border border-secondary/40 bg-secondary-container/10 px-4 py-2 text-sm text-secondary">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="rounded-lg border border-error/40 bg-error-container/20 px-4 py-2 text-sm text-on-error-container">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setNotice(null);
              setStep("email");
              setOtp("");
            }}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-4 py-3 font-label-sm text-label-sm text-on-surface-variant transition-colors",
              step === "email" ? "opacity-40" : "hover:bg-surface-container-high hover:text-on-surface",
            ].join(" ")}
            disabled={busy || step === "email"}
          >
            <AppIcon name="arrow_back" size={16} />
            Back
          </button>

          {step === "email" ? (
            <button
              type="button"
              onClick={handleSendCode}
              disabled={!canSend}
              className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-sm text-label-sm text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <AppIcon name="mail" size={16} />
              {busy ? "Sending..." : "Send Code"}
            </button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={!canSend}
                className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-5 py-3 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AppIcon name="mail" size={16} />
                {busy ? "Resending..." : "Resend"}
              </button>
              <button
                type="button"
                onClick={handleVerifyCode}
                disabled={!canVerify}
                className="flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-sm text-label-sm text-on-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <AppIcon name="check_circle" size={16} />
                {busy ? "Verifying..." : "Verify & Unlock"}
              </button>
            </div>
          )}
        </div>
      </div>
    </ResponsiveDialog>
  );
}

