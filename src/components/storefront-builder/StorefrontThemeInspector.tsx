"use client";

import type { StorefrontThemeDraft } from "@/lib/storefront-api";

function TokenRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="border-razor flex items-center justify-between gap-4 bg-black/40 p-4">
      <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</div>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-11 cursor-pointer bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-razor w-32 bg-black px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface outline-none focus:border-primary"
        />
      </div>
    </div>
  );
}

export function StorefrontThemeInspector({
  theme,
  onChange,
}: {
  theme: StorefrontThemeDraft;
  onChange: (next: StorefrontThemeDraft) => void;
}) {
  const preset = theme.preset || "minimal";
  const backgroundStyle = theme.background_style || "spotlight";
  const tokens = theme.tokens || {};

  function setToken<K extends keyof NonNullable<StorefrontThemeDraft["tokens"]>>(
    key: K,
    value: NonNullable<StorefrontThemeDraft["tokens"]>[K]
  ) {
    onChange({
      ...theme,
      tokens: {
        ...tokens,
        [key]: value,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="border-razor bg-black/30 p-4 text-sm leading-6 text-on-surface-variant">
        Keep the design restrained: one strong accent, readable type, and enough contrast for buyers to trust the
        checkout.
      </div>

      <div className="space-y-2">
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          Preset
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["minimal", "bold", "elegant"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onChange({ ...theme, preset: p })}
              className={[
                "border-razor min-h-11 px-3 py-3 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
                preset === p ? "bg-primary text-on-primary" : "bg-black text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          Background
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["spotlight", "solid", "aurora"] as const).map((style) => (
            <button
              key={style}
              type="button"
              onClick={() => onChange({ ...theme, background_style: style })}
              className={[
                "border-razor min-h-11 px-3 py-3 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
                backgroundStyle === style
                  ? "bg-primary text-on-primary"
                  : "bg-black text-on-surface-variant hover:text-on-surface",
              ].join(" ")}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          Brand tokens
        </div>
        <TokenRow label="Primary" value={tokens.primary || "#9fb6ff"} onChange={(v) => setToken("primary", v)} />
        <TokenRow label="Background" value={tokens.background || "#05070d"} onChange={(v) => setToken("background", v)} />
        <TokenRow label="Surface" value={tokens.surface || "#0b1220"} onChange={(v) => setToken("surface", v)} />
        <TokenRow label="Text" value={tokens.text || "#e5e7eb"} onChange={(v) => setToken("text", v)} />

        <div className="border-razor bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">Radius</div>
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface">
              {typeof tokens.radius === "number" ? tokens.radius : 14}px
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            value={typeof tokens.radius === "number" ? tokens.radius : 14}
            onChange={(e) => setToken("radius", Number(e.target.value))}
            className="mt-4 w-full"
          />
        </div>

        <div className="border-razor bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              Card opacity
            </div>
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface">
              {Math.round((typeof tokens.card_opacity === "number" ? tokens.card_opacity : 1) * 100)}%
            </div>
          </div>
          <input
            type="range"
            min={55}
            max={100}
            value={Math.round((typeof tokens.card_opacity === "number" ? tokens.card_opacity : 1) * 100)}
            onChange={(e) => setToken("card_opacity", Number(e.target.value) / 100)}
            className="mt-4 w-full"
          />
          <div className="mt-2 text-xs text-on-surface-variant">
            Lower values make cards more transparent; keep contrast high enough for real buyers.
          </div>
        </div>
      </div>
    </div>
  );
}
