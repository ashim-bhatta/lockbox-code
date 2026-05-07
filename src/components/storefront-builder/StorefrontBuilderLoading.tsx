import { AppIcon } from "@/components/ui/icons/AppIcon";

const loadingSteps = ["Profile", "Draft sections", "Preview canvas", "Publish tools"];

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`overflow-hidden bg-white/[0.06] ${className}`} />;
}

export function StorefrontBuilderLoading() {
  return (
    <div
      className="border-razor relative overflow-hidden bg-surface-container-lowest p-5 text-on-surface sm:p-8"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(700px 360px at 12% 0%, color-mix(in oklch, var(--color-primary) 24%, transparent), transparent 62%), radial-gradient(600px 320px at 88% 20%, color-mix(in oklch, var(--color-secondary) 12%, transparent), transparent 58%)",
        }}
      />
      <div className="relative space-y-7">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 border border-primary/25 bg-primary/10 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-primary">
              <span className="pulse-dot pulse-dot-green" />
              Builder studio
            </div>
            <h1 className="font-display-lg text-4xl uppercase tracking-tight text-on-surface sm:text-5xl">
              Assembling your storefront
            </h1>
            <p className="max-w-xl text-sm leading-6 text-on-surface-variant">
              Pulling profile details, lockboxes, draft sections, and revision history into one editable canvas.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-[420px]">
            {loadingSteps.map((step, index) => (
              <div key={step} className="border-razor bg-black/35 p-3">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
                    0{index + 1}
                  </span>
                  <AppIcon name="check_circle" size={14} className={index < 2 ? "text-secondary" : "text-primary/55"} />
                </div>
                <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">{step}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
          <div className="border-razor hidden min-h-[420px] bg-black/30 p-4 sm:block">
            <div className="mb-5 flex items-center justify-between">
              <SkeletonLine className="h-3 w-24" />
              <SkeletonLine className="h-9 w-16" />
            </div>
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="border-razor bg-surface-container-low/65 p-4">
                  <SkeletonLine className="mb-4 h-2 w-16" />
                  <SkeletonLine className="h-3 w-4/5" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-razor min-h-[420px] bg-black/25 p-4 sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <SkeletonLine className="mb-3 h-2 w-20" />
                <SkeletonLine className="h-4 w-56" />
              </div>
              <SkeletonLine className="h-10 w-32" />
            </div>
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                <div className="border-razor bg-surface-container-low/70 p-6">
                  <SkeletonLine className="mb-5 h-2 w-28" />
                  <SkeletonLine className="mb-4 h-9 w-4/5" />
                  <SkeletonLine className="mb-8 h-3 w-2/3" />
                  <SkeletonLine className="h-11 w-40" />
                </div>
                <div className="border-razor bg-surface-container-low/50 p-6">
                  <SkeletonLine className="mb-5 h-40 w-full" />
                  <SkeletonLine className="h-3 w-2/3" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="border-razor bg-surface-container-low/55 p-4">
                    <SkeletonLine className="mb-4 h-28 w-full" />
                    <SkeletonLine className="mb-3 h-4 w-3/4" />
                    <SkeletonLine className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-razor hidden min-h-[420px] bg-black/30 p-4 lg:block">
            <div className="mb-5 flex gap-2">
              <SkeletonLine className="h-9 flex-1" />
              <SkeletonLine className="h-9 flex-1" />
              <SkeletonLine className="h-9 flex-1" />
            </div>
            <div className="space-y-4">
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-24 w-full" />
              <SkeletonLine className="h-10 w-full" />
              <SkeletonLine className="h-28 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StorefrontBuilderLoadError({
  message,
  onRetry,
}: {
  message: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="border-razor bg-error-container/20 p-6 text-on-error-container sm:p-8">
      <div className="flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-start">
        <div className="border-razor flex h-12 w-12 shrink-0 items-center justify-center bg-black/35 text-error">
          <AppIcon name="alert_triangle" size={22} />
        </div>
        <div className="space-y-3">
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-error">Builder failed to load</div>
          <h2 className="font-headline-md text-headline-md text-on-surface">The studio could not finish syncing.</h2>
          <p className="text-sm leading-6 text-on-surface-variant">
            {message || "Failed to load storefront builder."} Retry keeps your existing draft data intact.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="border-razor inline-flex items-center gap-2 bg-black px-5 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface transition-premium hover:bg-surface-container-high"
          >
            <AppIcon name="refresh" size={14} />
            Retry sync
          </button>
        </div>
      </div>
    </div>
  );
}
