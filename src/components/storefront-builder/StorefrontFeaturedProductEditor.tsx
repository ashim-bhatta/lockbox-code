"use client";

import { AppIcon } from "@/components/ui/icons/AppIcon";
import { Field, Textarea } from "@/components/storefront-builder/StorefrontBuilderFields";
import type { LockboxRow, SectionChangeHandler } from "@/components/storefront-builder/storefront-builder-types";
import type { StorefrontSectionDraft } from "@/lib/storefront-api";
import { formatCents } from "@/lib/utils";

type FeaturedProductSection = Extract<StorefrontSectionDraft, { type: "featured_product" }>;

export function StorefrontFeaturedProductEditor({
  section,
  products,
  onChange,
}: {
  section: FeaturedProductSection;
  products: LockboxRow[];
  onChange: SectionChangeHandler;
}) {
  const listedProducts = products.filter((product) => product.isListed);
  const selectedId = section.data.product_id || "";

  function patch(data: Partial<FeaturedProductSection["data"]>) {
    onChange({ ...section, data: { ...section.data, ...data } });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Eyebrow"
          value={section.data.eyebrow || ""}
          onChange={(value) => patch({ eyebrow: value.trim() ? value : undefined })}
          placeholder="Featured lockbox"
        />
        <Field
          label="CTA Label"
          value={section.data.cta_label || ""}
          onChange={(value) => patch({ cta_label: value.trim() ? value : undefined })}
          placeholder="View lockbox"
        />
      </div>
      <Field
        label="Headline"
        value={section.data.headline || ""}
        onChange={(value) => patch({ headline: value.trim() ? value : undefined })}
        placeholder="The best place to start"
      />
      <Textarea
        label="Subhead"
        value={section.data.subhead || ""}
        onChange={(value) => patch({ subhead: value.trim() ? value : undefined })}
        placeholder="Explain why this product deserves attention."
      />

      <div className="border-razor bg-black/35 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              Product to feature
            </div>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">
              {selectedId ? "Pinned to one listed lockbox." : "Automatic: first listed lockbox."}
            </p>
          </div>
          {selectedId ? (
            <button
              type="button"
              className="border-razor min-h-10 bg-black px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface"
              onClick={() => patch({ product_id: undefined })}
            >
              Auto
            </button>
          ) : null}
        </div>

        {listedProducts.length === 0 ? (
          <div className="mt-4 text-sm leading-6 text-on-surface-variant">
            No listed lockboxes yet. List a product first, then choose which one gets the spotlight.
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {listedProducts.map((product) => {
              const selected = selectedId ? product.id === selectedId : product.id === listedProducts[0]?.id;
              return (
                <button
                  key={product.id}
                  type="button"
                  className={[
                    "flex w-full items-center gap-3 border p-3 text-left transition-premium",
                    selected ? "border-primary/45 bg-primary/10" : "border-white/10 bg-black/30 hover:border-outline",
                  ].join(" ")}
                  onClick={() => patch({ product_id: product.id })}
                >
                  {product.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.previewUrl} alt="" className="h-14 w-14 object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="grid h-14 w-14 place-items-center bg-surface-container-high text-on-surface-variant">
                      <AppIcon name="image" size={16} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-on-surface">{product.title}</div>
                    <div className="text-xs text-on-surface-variant">{formatCents(product.priceCents)}</div>
                  </div>
                  {selected ? <AppIcon name="check_circle" size={16} className="text-primary" /> : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
