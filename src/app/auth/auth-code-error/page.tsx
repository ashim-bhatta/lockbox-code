import Link from "next/link";
import { AuthLayout } from "@/components/auth/layouts/AuthLayout";
import { AuthGlassCard } from "@/components/auth/ui/AuthGlassCard";

export default function AuthCodeErrorPage() {
  return (
    <AuthLayout mode="forgot">
      <AuthGlassCard className="border border-outline-variant/30 bg-surface-container/40 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <h1 className="mb-3 font-headline-md text-headline-md text-on-background">
          Authentication Link Error
        </h1>
        <p className="mb-6 font-body-base text-body-base text-on-surface-variant">
          This sign-in or recovery link is invalid or expired.
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-primary-container px-5 py-3 font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container"
        >
          Return to Login
        </Link>
      </AuthGlassCard>
    </AuthLayout>
  );
}
