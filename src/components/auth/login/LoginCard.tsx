"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGlassCard } from "@/components/auth/ui/AuthGlassCard";
import { FieldLabel, IconInput } from "@/components/auth/ui/AuthFields";
import { GhostAction, PrimaryAction } from "@/components/auth/ui/AuthButtons";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { useAuthSubmitState } from "@/components/auth/hooks/useAuthSubmitState";
import {
  getSupabaseBrowserClient,
  getSupabasePublicEnvError,
} from "@/lib/supabase-browser";

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const { error, message, isSubmitting, setError, setMessage, clearFeedback, run } = useAuthSubmitState();
  const feedbackId = "login-feedback";
  const hasError = Boolean(error);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      const envError = getSupabasePublicEnvError();
      if (envError) throw new Error(envError);
      const supabase = getSupabaseBrowserClient();

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw new Error(signInError.message);
      router.push("/dashboard");
    });
  }

  async function handleMagicLink() {
    const envError = getSupabasePublicEnvError();
    if (envError) {
      setError(envError);
      return;
    }

    if (!email) {
      setError("Enter your email first to receive a magic link.");
      return;
    }

    clearFeedback();
    setIsMagicLinkLoading(true);
    const supabase = getSupabaseBrowserClient();

    const origin = window.location.origin;
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
      },
    });

    setIsMagicLinkLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setMessage("Magic link sent. Check your inbox.");
  }

  async function handleOAuth(provider: "google" | "github") {
    const envError = getSupabasePublicEnvError();
    if (envError) {
      setError(envError);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    const origin = window.location.origin;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
    });
    if (oauthError) setError(oauthError.message);
  }

  return (
    <AuthGlassCard className="flex flex-col gap-8 border-white/10 bg-surface-container-high/40 shadow-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="space-y-3 text-center">
        <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 bg-surface-container-highest shadow-inner">
          <AppIcon name="vpn_key" className="text-primary" size={24} />
        </div>
        <h1 className="font-headline-md text-headline-md text-on-surface">Sign in</h1>
        <p className="font-body-base text-sm text-body-base text-on-surface-variant">Secure access to Paywall.zip</p>
      </div>

      <form className="space-y-5" onSubmit={handleLogin}>
        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <IconInput
            id="email"
            type="email"
            placeholder="admin@enterprise.com"
            icon="mail"
            className="pr-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
              aria-invalid={hasError}
              aria-describedby={hasError || message ? feedbackId : undefined}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="ml-1 flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link href="/forgot-password" className="font-label-sm text-label-sm text-primary transition-colors hover:text-primary-fixed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm">
              Forgot password?
            </Link>
          </div>
          <IconInput
            id="password"
            type="password"
            placeholder="••••••••••••"
            icon="lock"
            className="pr-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              aria-invalid={hasError}
              aria-describedby={hasError || message ? feedbackId : undefined}
          />
        </div>

        <PrimaryAction className={isSubmitting ? "cursor-not-allowed opacity-70" : ""} disabled={isSubmitting}>
          {isSubmitting ? "Authenticating..." : "Authenticate"}
          {!isSubmitting && (
            <AppIcon name="arrow_forward" className="transition-transform group-hover:translate-x-1" size={16} />
          )}
        </PrimaryAction>

        {(error || message) && (
          <p id={feedbackId} role={error ? "alert" : "status"} aria-live="polite" className={`text-center text-sm ${error ? "text-error" : "text-secondary-container"}`}>
            {error || message}
          </p>
        )}
      </form>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-outline-variant/40" />
        <span className="font-label-sm text-[10px] text-label-sm uppercase tracking-widest text-on-surface-variant">Or continue with</span>
        <div className="h-px flex-1 bg-outline-variant/40" />
      </div>

      <div className="space-y-3">
        <GhostAction onClick={handleMagicLink} disabled={isMagicLinkLoading}>
          <AppIcon name="auto_awesome" className="text-tertiary" size={18} />
          {isMagicLinkLoading ? "Sending..." : "Send Magic Link"}
        </GhostAction>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleOAuth("google")} className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container/50 px-4 py-2.5 font-label-sm text-label-sm text-on-surface transition-all duration-300 hover:border-primary/40 hover:text-primary" type="button">
            <span className="text-xs">G</span>
            Google
          </button>
          <button onClick={() => handleOAuth("github")} className="flex items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container/50 px-4 py-2.5 font-label-sm text-label-sm text-on-surface transition-all duration-300 hover:border-primary/40 hover:text-primary" type="button">
            <span className="text-xs">GH</span>
            GitHub
          </button>
        </div>
      </div>

      <div className="mt-2 text-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">New to Paywall.zip?</span>
        <Link
          href="/register"
          className="relative ml-1 font-label-sm text-label-sm text-primary transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 after:content-[''] hover:text-primary-fixed hover:after:w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface rounded-sm"
        >
          Create an account
        </Link>
      </div>
    </AuthGlassCard>
  );
}
