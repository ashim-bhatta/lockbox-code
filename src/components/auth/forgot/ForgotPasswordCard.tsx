"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthGlassCard } from "@/components/auth/ui/AuthGlassCard";
import { FieldLabel, IconInput } from "@/components/auth/ui/AuthFields";
import { PrimaryAction } from "@/components/auth/ui/AuthButtons";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { useAuthSubmitState } from "@/components/auth/hooks/useAuthSubmitState";
import {
  getSupabaseBrowserClient,
  getSupabasePublicEnvError,
} from "@/lib/supabase-browser";

export function ForgotPasswordCard() {
  const [email, setEmail] = useState("");
  const { error, message, isSubmitting, setMessage, run } = useAuthSubmitState();
  const feedbackId = "forgot-feedback";
  const hasError = Boolean(error);

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      const envError = getSupabasePublicEnvError();
      if (envError) throw new Error(envError);
      const supabase = getSupabaseBrowserClient();

      const origin = window.location.origin;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
      });

      if (resetError) throw new Error(resetError.message);
      setMessage("Password reset link sent. Check your inbox.");
    });
  }

  return (
    <>
      <div className="mb-8 text-center">
        <span className="font-display-lg text-headline-md tracking-tighter text-on-background">Paywall.zip</span>
      </div>

      <AuthGlassCard className="group relative border border-outline-variant/30 bg-surface-container/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-500 hover:border-outline-variant/50">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />

        <div className="relative z-10 mb-8 flex flex-col items-center text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high shadow-[0_0_15px_rgba(41,121,255,0.1)]">
            <AppIcon name="key" className="text-primary" size={24} />
          </div>
          <h1 className="mb-3 font-headline-md text-headline-md text-on-background">Forgot Password</h1>
          <p className="mx-auto max-w-[280px] font-body-base text-body-base text-on-surface-variant">
            Enter your email to receive a password reset link
          </p>
        </div>

        <form className="relative z-10 space-y-6" onSubmit={handleResetPassword}>
          <div className="relative space-y-2">
            <FieldLabel htmlFor="email">Email Address</FieldLabel>
            <IconInput id="email" type="email" placeholder="admin@enterprise.com" icon="mail" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={hasError} aria-describedby={hasError || message ? feedbackId : undefined} className="py-3.5" />
          </div>

          <PrimaryAction
            disabled={isSubmitting}
            className="group/btn relative w-full overflow-hidden rounded-lg border border-primary/20 bg-primary-container py-3.5 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:bg-primary hover:text-on-primary hover:shadow-[0_0_20px_rgba(41,121,255,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <span className="relative z-10">{isSubmitting ? "Sending..." : "Send Reset Link"}</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite]" />
          </PrimaryAction>

          {(error || message) && (
            <p id={feedbackId} role={error ? "alert" : "status"} aria-live="polite" className={`text-center text-sm ${error ? "text-error" : "text-secondary-container"}`}>
              {error || message}
            </p>
          )}
        </form>

        <div className="relative z-10 mt-8 text-center">
          <Link
            href="/login"
            className="group/link inline-flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant transition-colors duration-200 hover:text-primary"
          >
            <AppIcon name="arrow_back" className="transition-transform group-hover/link:-translate-x-1" size={16} />
            Back to Login
          </Link>
        </div>
      </AuthGlassCard>
    </>
  );
}
