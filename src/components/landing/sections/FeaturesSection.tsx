"use client";

import Image from "next/image";

export function FeaturesSection() {
  return (
    <section id="features" className="stagger-reveal mb-48 space-y-32">
      <div className="border-razor border-t pt-16">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <h3 className="font-display-lg text-4xl mb-8 text-on-surface uppercase tracking-tight">The_Vault_Protocol</h3>
            <p className="font-body-base text-body-base max-w-md leading-relaxed text-on-surface-variant opacity-80">
              FILES ARE TRANSFORMED INTO AES-256-GCM ENCRYPTED BLOBS. KEYS ARE HELD IN A HARDENED ESCROW NODE UNTIL STRIPE CONFIRMATION.
            </p>
          </div>
          <div className="md:col-span-7">
            <div className="border-razor bg-surface-container-low p-10 font-mono-data">
              <div className="mb-6 flex justify-between border-b border-white/5 pb-6 text-[11px] uppercase tracking-widest text-primary">
                <span>Node_Status</span>
                <span>Active_Escrow</span>
              </div>
              <div className="space-y-4 text-[13px]">
                <div className="flex justify-between border-b border-white/5 pb-4">
                   <span className="text-on-surface-variant">Asset_Name</span>
                   <span className="text-on-surface">final_production_v2.zip</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-4">
                   <span className="text-on-surface-variant">Encryption</span>
                   <span className="text-secondary">AES_256_VERIFIED</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="text-on-surface-variant uppercase tracking-widest text-[10px]">Release_Trigger</span>
                   <span className="text-2xl font-bold text-on-surface">$4,500.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-razor border-t pt-16">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-7 order-2 md:order-1">
             <div className="border-razor relative flex h-80 items-center justify-center overflow-hidden bg-black">
                <div className="absolute inset-0 opacity-20">
                  <Image
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAvkSylHTC6D_V7TNeuAqNkKWpGc9_EgLHYN2k3wtQlQNqEeqDZKJt0VUf5NsKWUf3WXUH5-ekH_HuVfPDjuuaCj6a3o3D-oAUpyo5vbhH_st0vdLLLbwbvCSl74-7o1WHUjeT-nCOL4Y2b9ZtO7kwth48FmpxjfO80cicL01qpkDr8SKuityHZ2wmYhrdDTUeJzA00DfEuSFSH3cOJ4L4BwsXLiPwtyZjvtxvV81eoqkYtAHiz-vKybUlORmw52CLHZw4L4PO9NYU"
                    fill
                    className="object-cover grayscale contrast-150"
                  />
                </div>
                <div className="border-razor relative z-10 bg-black/80 p-8 text-center backdrop-blur-sm">
                   <div className="font-mono-data text-[10px] uppercase tracking-[0.4em] text-primary">Preview_Node_Running</div>
                   <div className="mt-4 font-display-lg text-2xl uppercase text-on-surface">Watermark_Applied</div>
                   <div className="mt-2 font-mono-data text-[8px] uppercase tracking-widest text-outline-variant">Bit-Depth: Reduced_8bit</div>
                </div>
                <div className="absolute top-0 left-0 h-10 w-10 border-l border-t border-primary/40" />
                <div className="absolute bottom-0 right-0 h-10 w-10 border-r border-b border-primary/40" />
             </div>
          </div>
          <div className="md:col-span-5 order-1 md:order-2">
            <h3 className="font-display-lg text-4xl mb-8 text-on-surface uppercase tracking-tight">Proof_of_Work</h3>
            <p className="font-body-base text-body-base max-w-md leading-relaxed text-on-surface-variant opacity-80">
              CLIENTS VERIFY DELIVERABLES THROUGH SECURE, LOW-FIDELITY PREVIEWS. NO SOURCE HANDOVER WITHOUT LIQUIDITY CONFIRMATION.
            </p>
            <ul className="mt-10 space-y-6 font-mono-data text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <li className="flex items-center gap-4">
                <span className="h-1.5 w-1.5 bg-primary" />
                Auto-Watermarking
              </li>
              <li className="flex items-center gap-4">
                <span className="h-1.5 w-1.5 bg-primary" />
                Snippet_Sanitization
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
