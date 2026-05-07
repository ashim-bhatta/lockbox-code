"use client";

import { useRouter } from "next/navigation";

export function FinalCtaSection({ onNavigate }: { onNavigate: (sectionId: string) => void }) {
  const router = useRouter();

  return (
    <section id="pricing" className="glass-panel relative overflow-hidden rounded-2xl py-24 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-container/10 via-transparent to-transparent" />
      <h2 className="font-display-lg relative z-10 mb-4 text-[32px] text-on-surface">Ready to secure your bag?</h2>
      <p className="font-body-base text-body-base relative z-10 mx-auto mb-8 max-w-lg text-on-surface-variant">
        Join thousands of professionals who refuse to work for free. Setup takes
        30 seconds.
      </p>
      <button type="button" onClick={() => router.push("/register")} className="btn-primary font-label-sm text-label-sm relative z-10 rounded-full px-10 py-4 font-bold uppercase tracking-wider shadow-lg transition-transform hover:scale-105 active:scale-95">
        Get Started for Free
      </button>
      <button type="button" onClick={() => onNavigate("features")} className="mt-3 block w-full text-center font-label-sm text-label-sm text-on-surface-variant underline underline-offset-4 md:w-auto md:mx-auto">
        Review features first
      </button>
    </section>
  );
}
