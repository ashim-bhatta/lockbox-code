"use client";

import { useRouter } from "next/navigation";

export function HeroSection({ onNavigate }: { onNavigate: (sectionId: string) => void }) {
  const router = useRouter();

  return (
    <section className="noise-bg relative mb-48 mt-32 grid items-start gap-24 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="stagger-reveal flex flex-col items-start px-8 lg:px-0">
        <div className="border-razor mb-10 flex items-center gap-3 bg-surface-container-low px-4 py-2">
          <span className="pulse-dot pulse-dot-green scale-75" />
          <span className="font-mono-data text-[10px] uppercase tracking-[0.3em] text-on-surface-variant">
            Protocol: ZIP-AES-256-GCM
          </span>
        </div>
        
        <h1 className="mask-reveal font-display-lg text-display-lg mb-8 max-w-4xl text-on-surface uppercase">
          Stop getting ghosted. <br />
          <span className="text-primary">Secured assets.</span>
        </h1>
        
        <p className="font-body-base text-body-base mb-12 max-w-xl text-lg leading-relaxed text-on-surface-variant opacity-80">
          CLOSE THE TRUST GAP BETWEEN FREELANCERS AND CLIENTS. UPLOAD DELIVERABLES TO A HARDENED VAULT. RELEASE KEYS ONLY UPON VERIFIED PAYMENT CAPTURE.
        </p>
        
        <div className="flex flex-wrap gap-0">
          <button 
            type="button" 
            onClick={() => router.push("/register")} 
            className="btn-primary font-label-sm text-label-sm transition-premium px-12 py-5 font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black"
          >
            Deploy Vault
          </button>
          <button 
            type="button" 
            onClick={() => onNavigate("proof")} 
            className="border-razor font-label-sm text-label-sm transition-premium border-l-0 px-12 py-5 uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container"
          >
            Audit Demo
          </button>
        </div>
      </div>

      <div className="relative hidden lg:block">
        <div className="border-razor bg-surface-container-low p-1 shadow-2xl">
          <div className="border-razor flex h-[500px] flex-col bg-black p-6 font-mono-data text-xs text-primary/60">
            <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
              <span className="text-primary font-bold">PROTOCOL_CONSOLE_V1.0</span>
              <span className="opacity-40">UTC: {new Date().toISOString()}</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="animate-scroll-text space-y-2">
                <p className="text-secondary">[SUCCESS] HANDSHAKE_INITIATED</p>
                <p>[INFO] RSA_KEY_PAIR_GENERATED_2048_BIT</p>
                <p>[INFO] ENCRYPTING_BLOB_STORAGE_NODE_7</p>
                <p className="text-primary">[ACTIVE] LISTENING_FOR_STRIPE_WEBHOOK</p>
                <p>[INFO] BYTES_TRANSFERRED: 1.2GB</p>
                <p>[INFO] CLIENT_ID: _PX_882_A</p>
                <p className="text-error">[WARN] ATTEMPTED_UNAUTHORIZED_ACCESS_BLOCKED</p>
                <p>[INFO] HASH_VERIFIED: E3B0C44298FC1C14</p>
                <p>[INFO] PROTOCOL_VERSION: 2.0.4</p>
                <p className="text-secondary">[SUCCESS] ESCROW_LOCK_CONFIRMED</p>
                <p>[INFO] WAITING_FOR_SIG_AUTHORIZATION</p>
                <p>[INFO] HELLO_WORLD_FROM_ANTIGRAVITY</p>
                <p>[INFO] SHARP_EDGES_ONLY_MEMO_01</p>
                <p className="text-primary">[ACTIVE] MONITORING_TRAFFIC_IDLE</p>
                <p>[INFO] ASYMMETRIC_LAYOUT_LOADED</p>
                <p>[INFO] NO_ROUNDED_CORNERS_DETECTED</p>
                <p className="text-secondary">[SUCCESS] BRAND_EVOLUTION_COMPLETE</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-4">
              <span className="h-2 w-2 animate-pulse bg-primary" />
              <span className="animate-pulse">WAITING_FOR_USER_INPUT...</span>
            </div>
          </div>
        </div>
        
        {/* Abstract Architectural Element */}
        <div className="absolute -bottom-12 -right-12 h-64 w-64 border border-primary/10 opacity-20" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 border border-primary/5 opacity-10" />
      </div>
    </section>
  );
}
