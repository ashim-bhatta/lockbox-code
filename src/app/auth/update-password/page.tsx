"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth/layouts/AuthLayout";
import { AuthGlassCard } from "@/components/auth/ui/AuthGlassCard";
import { useAuthSubmitState } from "@/components/auth/hooks/useAuthSubmitState";
import { getSupabaseBrowserClient, getSupabasePublicEnvError } from "@/lib/supabase-browser";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { error, message, isSubmitting, setMessage, run } = useAuthSubmitState();
  const feedbackId = "update-password-feedback";
  const hasError = Boolean(error);

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await run(async () => {
      const envError = getSupabasePublicEnvError();
      if (envError) throw new Error(envError);
      if (password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (password !== confirmPassword) throw new Error("Passwords do not match.");

      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);

      setMessage("Password updated successfully. Redirecting to login...");
      setTimeout(() => router.push("/login"), 1200);
    });
  }

  return (
    <AuthLayout mode="forgot">
      <AuthGlassCard className="group relative border border-outline-variant/30 bg-surface-container/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors duration-500 hover:border-outline-variant/50">
        <h1 className="mb-3 text-center font-headline-md text-headline-md text-on-background">
          Set New Password
        </h1>
        <p className="mb-8 text-center font-body-base text-body-base text-on-surface-variant">
          Enter your new password to secure your account.
        </p>

        <form className="space-y-4" onSubmit={handleUpdatePassword}>
          <input
            type="password"
            required
            minLength={8}
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError || message ? feedbackId : undefined}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant/50 focus:border-primary focus:bg-surface-container-highest focus:ring-1 focus:ring-primary"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={hasError}
            aria-describedby={hasError || message ? feedbackId : undefined}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 text-on-surface outline-none transition-all duration-300 placeholder:text-outline-variant/50 focus:border-primary focus:bg-surface-container-highest focus:ring-1 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg border border-primary/20 bg-primary-container py-3.5 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container transition-all duration-300 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating..." : "Update Password"}
          </button>
        </form>

        {(error || message) && <p id={feedbackId} role={error ? "alert" : "status"} aria-live="polite" className={`mt-4 text-center text-sm ${error ? "text-error" : "text-secondary-container"}`}>{error || message}</p>}
      </AuthGlassCard>
    </AuthLayout>
  );
}
