"use client";

export function TrustArchitectureSection() {
  return (
    <section id="how-it-works" className="mb-32">
      <h2 className="font-display-lg mb-16 text-center text-[36px] text-on-surface">
        The Architecture of Trust
      </h2>
      <div className="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
        <div className="relative">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-outline-variant/30" />
          <div className="font-label-sm text-label-sm mb-8 pl-12 uppercase tracking-widest text-primary-container">For Creators</div>
          <div className="relative mb-8 pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant bg-surface-container-highest text-xs text-on-surface">1</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Upload &amp; Encrypt</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              Drop your final deliverables into our secure pipeline. We handle
              the AES-256 encryption client-side.
            </p>
          </div>
          <div className="relative mb-8 pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant bg-surface-container-highest text-xs text-on-surface">2</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Generate Proof</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              Select which parts of the project to expose as a low-res or
              redacted preview to prove completion.
            </p>
          </div>
          <div className="relative pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant border-primary-container bg-surface-container-highest text-xs text-on-surface shadow-[0_0_10px_rgba(85,141,255,0.3)]">3</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Share Link</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              Send the secure payment link. You hold the leverage until the
              funds hit your connected account.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute bottom-0 left-[15px] top-0 w-px bg-outline-variant/30" />
          <div className="font-label-sm text-label-sm mb-8 pl-12 uppercase tracking-widest text-secondary-container">For Clients</div>
          <div className="relative mb-8 pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant bg-surface-container-highest text-xs text-on-surface">1</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Verify Preview</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              Review the watermarked assets or execution logs. Ensure the work
              meets expectations before spending a dime.
            </p>
          </div>
          <div className="relative mb-8 pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant bg-surface-container-highest text-xs text-on-surface">2</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Submit Payment</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              Pay securely via credit card, ACH, or crypto. Funds are routed
              instantly, bypassing slow escrow holding periods.
            </p>
          </div>
          <div className="relative pl-12">
            <div className="font-mono-data absolute left-0 top-1 z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-outline-variant border-secondary-container bg-surface-container-highest text-xs text-on-surface shadow-[0_0_10px_rgba(5,231,119,0.3)]">3</div>
            <h4 className="font-headline-md mb-2 text-[18px] text-on-surface">Instant Unlock</h4>
            <p className="font-body-base text-body-base text-sm text-on-surface-variant">
              The moment payment is confirmed, the decryption key is released,
              and full high-res files are downloaded.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
