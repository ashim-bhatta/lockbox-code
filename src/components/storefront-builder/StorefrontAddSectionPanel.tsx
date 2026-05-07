"use client";

import { AppIcon } from "@/components/ui/icons/AppIcon";
import type { StorefrontSectionDraft } from "@/lib/storefront-api";
import {
  createSectionPreset,
  type SectionPresetKey,
} from "@/components/storefront-builder/storefront-templates";

type SectionType = StorefrontSectionDraft["type"];

const sectionTypes: Array<{
  type: SectionType;
  title: string;
  desc: string;
  icon:
    | "notifications"
    | "auto_awesome"
    | "layers"
    | "verified_user"
    | "favorite"
    | "shield_check"
    | "link"
    | "bolt"
    | "settings";
}> = [
  { type: "announcement", title: "Announcement", desc: "Short banner for a launch note or timely update.", icon: "notifications" },
  { type: "hero", title: "Hero", desc: "Main promise, CTA, and optional product-led image.", icon: "auto_awesome" },
  { type: "featured_product", title: "Featured Product", desc: "Merchandise one lockbox like a real product page.", icon: "favorite" },
  { type: "products_grid", title: "Products Grid", desc: "Choose listed lockboxes and control display count.", icon: "layers" },
  { type: "value_props", title: "Value Props", desc: "Specific reasons buyers can trust this checkout.", icon: "verified_user" },
  { type: "testimonials", title: "Testimonials", desc: "Proof from buyers, clients, or past customers.", icon: "favorite" },
  { type: "faq", title: "FAQ", desc: "Real answers for payment, access, delivery, and refunds.", icon: "shield_check" },
  { type: "rich_text", title: "Rich Text", desc: "A focused story, terms note, or delivery explanation.", icon: "link" },
  { type: "cta", title: "CTA", desc: "A closing push that sends buyers back to products.", icon: "bolt" },
  { type: "footer", title: "Footer", desc: "Copyright and useful support or policy links.", icon: "settings" },
];

const presets: Array<{
  key: SectionPresetKey;
  title: string;
  desc: string;
}> = [
  {
    key: "launch_page",
    title: "Full launch page",
    desc: "Hero, products, proof, FAQ, CTA, and footer for a complete storefront.",
  },
  {
    key: "quick_drop",
    title: "Quick drop",
    desc: "Announcement, hero, products, and FAQ for fast product launches.",
  },
  {
    key: "proof_page",
    title: "Proof-led page",
    desc: "Hero, testimonials, value props, FAQ, and CTA for higher-consideration sales.",
  },
];

export function StorefrontAddSectionPanel({
  onAdd,
  onAddPreset,
}: {
  onAdd: (type: SectionType) => void;
  onAddPreset: (sections: StorefrontSectionDraft[]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            Section presets
          </div>
          <div className="mt-1 font-headline-md text-headline-md text-on-surface">Start with a real page shape</div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className="border-razor bg-primary/10 p-4 text-left transition-premium hover:bg-primary/15"
              onClick={() => onAddPreset(createSectionPreset(preset.key))}
            >
              <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">{preset.title}</div>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">{preset.desc}</p>
              <div className="mt-4 font-mono-data text-[10px] uppercase tracking-widest text-primary">Add preset</div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            Single sections
          </div>
          <div className="mt-1 text-sm text-on-surface-variant">Add only what the buyer needs next.</div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {sectionTypes.map((sectionType) => (
            <button
              key={sectionType.type}
              type="button"
              onClick={() => onAdd(sectionType.type)}
              className="border-razor group bg-black/40 p-5 text-left transition-premium hover:bg-surface-container-high"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="border-razor flex h-10 w-10 items-center justify-center bg-black text-primary">
                  <AppIcon name={sectionType.icon} size={18} />
                </div>
                <div>
                  <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
                    {sectionType.title}
                  </div>
                  <div className="mt-1 text-sm text-on-surface-variant">{sectionType.desc}</div>
                </div>
              </div>
              <div className="font-mono-data text-[10px] uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Add section {"->"}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
