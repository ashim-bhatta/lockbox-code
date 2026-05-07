"use client";

import type { ReactNode } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { MarkdownEditor } from "@/components/storefront-builder/MarkdownEditor";
import { Field, Textarea } from "@/components/storefront-builder/StorefrontBuilderFields";
import { StorefrontFeaturedProductEditor } from "@/components/storefront-builder/StorefrontFeaturedProductEditor";
import { StorefrontImagePickerField } from "@/components/storefront-builder/StorefrontImagePickerField";
import { isValidHttpsUrl } from "@/components/storefront-builder/storefront-builder-utils";
import type { LockboxRow, SectionChangeHandler } from "@/components/storefront-builder/storefront-builder-types";
import type { StorefrontSectionDraft } from "@/lib/storefront-api";
import { formatCents } from "@/lib/utils";

export function StorefrontSectionInspector({
  section,
  products,
  onChange,
  onDuplicate,
  onDelete,
}: {
  section: StorefrontSectionDraft;
  products: LockboxRow[];
  onChange: SectionChangeHandler;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            Section
          </div>
          <div className="font-headline-md text-headline-md text-on-surface">{section.type}</div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="border-razor min-h-10 bg-black px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary"
            onClick={() => onDuplicate(section.id)}
          >
            Duplicate
          </button>
          <button
            type="button"
            className="border-razor min-h-10 bg-black px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
            onClick={() => onChange({ ...section, enabled: !section.enabled } as StorefrontSectionDraft)}
          >
            {section.enabled ? "Disable" : "Enable"}
          </button>
          <button
            type="button"
            className="border-razor flex h-10 w-10 items-center justify-center bg-black text-on-surface-variant hover:text-error"
            onClick={() => onDelete(section.id)}
            title="Delete section"
          >
            <AppIcon name="close" size={14} />
          </button>
        </div>
      </div>

      {section.type === "announcement" ? (
        <div className="space-y-4">
          <Field
            label="Text"
            value={section.data.text}
            onChange={(v) => onChange({ ...section, data: { ...section.data, text: v } })}
            placeholder="New drop live..."
          />
          <Field
            label="Link (https)"
            value={section.data.href || ""}
            onChange={(v) =>
              onChange({
                ...section,
                data: { ...section.data, href: v.trim() ? v.trim() : undefined },
              })
            }
            placeholder="https://..."
            hint="Optional"
            validate={(v) => !v || isValidHttpsUrl(v)}
          />
        </div>
      ) : null}

      {section.type === "hero" ? (
        <div className="space-y-4">
          <Field
            label="Headline"
            value={section.data.headline}
            onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v } })}
            placeholder="Your headline"
          />
          <Textarea
            label="Subhead"
            value={section.data.subhead || ""}
            onChange={(v) => onChange({ ...section, data: { ...section.data, subhead: v.trim() ? v : undefined } })}
            placeholder="Short paragraph..."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="CTA Label"
              value={section.data.cta_label || ""}
              onChange={(v) => onChange({ ...section, data: { ...section.data, cta_label: v.trim() ? v : undefined } })}
              placeholder="Browse lockboxes"
            />
            <Field
              label="CTA Link (https)"
              value={section.data.cta_href || ""}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: { ...section.data, cta_href: v.trim() ? v.trim() : undefined },
                })
              }
              placeholder="https://..."
              validate={(v) => !v || isValidHttpsUrl(v)}
            />
          </div>
          <StorefrontImagePickerField
            value={section.data.image_url || ""}
            products={products}
            onChange={(value) =>
              onChange({
                ...section,
                data: { ...section.data, image_url: value.trim() ? value.trim() : undefined },
              })
            }
          />
        </div>
      ) : null}

      {section.type === "products_grid" ? (
        <div className="space-y-4">
          <Field
            label="Headline"
            value={section.data.headline || ""}
            onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v.trim() ? v : undefined } })}
            placeholder="Available lockboxes"
          />
          <Textarea
            label="Subhead"
            value={section.data.subhead || ""}
            onChange={(v) => onChange({ ...section, data: { ...section.data, subhead: v.trim() ? v : undefined } })}
            placeholder="Short description..."
          />
          <Field
            label="Max items"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={String(section.data.max_items ?? 24)}
            onChange={(v) =>
              onChange({
                ...section,
                data: { ...section.data, max_items: Math.max(1, Math.min(60, Number(v) || 24)) },
              })
            }
            placeholder="24"
          />
          <ProductSelectionControl section={section} products={products} onChange={onChange} />
        </div>
      ) : null}

      {section.type === "featured_product" ? <StorefrontFeaturedProductEditor section={section} products={products} onChange={onChange} /> : null}
      {section.type === "value_props" ? <ValuePropsEditor section={section} onChange={onChange} /> : null}
      {section.type === "testimonials" ? <TestimonialsEditor section={section} onChange={onChange} /> : null}
      {section.type === "faq" ? <FaqEditor section={section} onChange={onChange} /> : null}

      {section.type === "rich_text" ? (
        <MarkdownEditor
          label="Rich text (Markdown)"
          value={section.data.text}
          onChange={(v) => onChange({ ...section, data: { ...section.data, text: v } })}
          placeholder="Write something..."
          hint="Safe Markdown subset. Links must be https://"
        />
      ) : null}

      {section.type === "cta" ? (
        <div className="space-y-4">
          <Field
            label="Headline"
            value={section.data.headline}
            onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v } })}
            placeholder="Ready to unlock?"
          />
          <Textarea
            label="Subhead"
            value={section.data.subhead || ""}
            onChange={(v) => onChange({ ...section, data: { ...section.data, subhead: v.trim() ? v : undefined } })}
            placeholder="Short description..."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="CTA Label"
              value={section.data.cta_label || ""}
              onChange={(v) => onChange({ ...section, data: { ...section.data, cta_label: v.trim() ? v : undefined } })}
              placeholder="Browse lockboxes"
            />
            <Field
              label="CTA Link (https)"
              value={section.data.cta_href || ""}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: { ...section.data, cta_href: v.trim() ? v.trim() : undefined },
                })
              }
              placeholder="https://..."
              validate={(v) => !v || isValidHttpsUrl(v)}
            />
          </div>
        </div>
      ) : null}

      {section.type === "footer" ? <FooterEditor section={section} onChange={onChange} /> : null}
    </div>
  );
}

function ProductSelectionControl({
  section,
  products,
  onChange,
}: {
  section: Extract<StorefrontSectionDraft, { type: "products_grid" }>;
  products: LockboxRow[];
  onChange: SectionChangeHandler;
}) {
  const listedProducts = products.filter((product) => product.isListed);
  const selectedIds = section.data.selected_ids || [];
  const selectedSet = new Set(selectedIds);
  const manual = selectedIds.length > 0;
  const visibleCount = manual ? selectedIds.filter((id) => listedProducts.some((product) => product.id === id)).length : listedProducts.length;

  function setSelectedIds(ids: string[] | undefined) {
    onChange({
      ...section,
      data: {
        ...section.data,
        selected_ids: ids && ids.length > 0 ? ids : undefined,
      },
    });
  }

  return (
    <div className="border-razor bg-black/35 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
            Product selection
          </div>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            {manual ? `${visibleCount} selected lockboxes` : "Automatic: all listed lockboxes"}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="border-razor min-h-10 bg-black px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface"
            onClick={() => setSelectedIds(undefined)}
          >
            Auto
          </button>
          <button
            type="button"
            className="border-razor min-h-10 bg-black px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface"
            onClick={() => setSelectedIds(listedProducts.map((product) => product.id))}
            disabled={listedProducts.length === 0}
          >
            Select all
          </button>
        </div>
      </div>

      {listedProducts.length === 0 ? (
        <div className="mt-4 text-sm leading-6 text-on-surface-variant">
          No lockboxes are listed yet. List products from the dashboard to make this section useful.
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {listedProducts.map((product) => {
            const selected = manual ? selectedSet.has(product.id) : true;
            return (
              <button
                key={product.id}
                type="button"
                className={[
                  "flex w-full items-center gap-3 border p-3 text-left transition-premium",
                  selected ? "border-primary/45 bg-primary/10" : "border-white/10 bg-black/30 hover:border-outline",
                ].join(" ")}
                onClick={() => {
                  const next = selectedSet.has(product.id)
                    ? selectedIds.filter((id) => id !== product.id)
                    : [...selectedIds, product.id];
                  setSelectedIds(next);
                }}
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-white/20">
                  {selected ? <AppIcon name="check_circle" size={14} className="text-primary" /> : null}
                </div>
                {product.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.previewUrl} alt="" className="h-12 w-12 object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center bg-surface-container-high text-on-surface-variant">
                    <AppIcon name="image" size={16} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-on-surface">{product.title}</div>
                  <div className="text-xs text-on-surface-variant">{formatCents(product.priceCents)}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ValuePropsEditor({
  section,
  onChange,
}: {
  section: Extract<StorefrontSectionDraft, { type: "value_props" }>;
  onChange: SectionChangeHandler;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Headline"
        value={section.data.headline || ""}
        onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v.trim() ? v : undefined } })}
        placeholder="Why buy here"
      />
      <RepeatableItems
        label="Item"
        items={section.data.items}
        addLabel="Add item"
        onAdd={() => onChange({ ...section, data: { ...section.data, items: [...section.data.items, { title: "New value prop" }] } })}
        onRemove={(idx) => onChange({ ...section, data: { ...section.data, items: section.data.items.filter((_, i) => i !== idx) } })}
        renderItem={(item, idx) => (
          <>
            <Field
              label="Title"
              value={item.title}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: { ...section.data, items: section.data.items.map((it, i) => (i === idx ? { ...it, title: v } : it)) },
                })
              }
              placeholder="Secure payment first"
            />
            <div className="mt-3">
              <Textarea
                label="Body"
                value={item.body || ""}
                onChange={(v) =>
                  onChange({
                    ...section,
                    data: {
                      ...section.data,
                      items: section.data.items.map((it, i) => (i === idx ? { ...it, body: v.trim() ? v : undefined } : it)),
                    },
                  })
                }
                placeholder="Short description..."
              />
            </div>
          </>
        )}
      />
    </div>
  );
}

function TestimonialsEditor({
  section,
  onChange,
}: {
  section: Extract<StorefrontSectionDraft, { type: "testimonials" }>;
  onChange: SectionChangeHandler;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Headline"
        value={section.data.headline || ""}
        onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v.trim() ? v : undefined } })}
        placeholder="What buyers notice"
      />
      <RepeatableItems
        label="Quote"
        items={section.data.items}
        addLabel="Add testimonial"
        onAdd={() =>
          onChange({
            ...section,
            data: { ...section.data, items: [...section.data.items, { quote: "New quote", name: "New name" }] },
          })
        }
        onRemove={(idx) => onChange({ ...section, data: { ...section.data, items: section.data.items.filter((_, i) => i !== idx) } })}
        renderItem={(item, idx) => (
          <>
            <Textarea
              label="Quote"
              value={item.quote}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: { ...section.data, items: section.data.items.map((it, i) => (i === idx ? { ...it, quote: v } : it)) },
                })
              }
              placeholder="The checkout felt clear..."
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field
                label="Name"
                value={item.name}
                onChange={(v) =>
                  onChange({
                    ...section,
                    data: { ...section.data, items: section.data.items.map((it, i) => (i === idx ? { ...it, name: v } : it)) },
                  })
                }
                placeholder="Recent buyer"
              />
              <Field
                label="Role"
                value={item.role || ""}
                onChange={(v) =>
                  onChange({
                    ...section,
                    data: {
                      ...section.data,
                      items: section.data.items.map((it, i) => (i === idx ? { ...it, role: v.trim() ? v : undefined } : it)),
                    },
                  })
                }
                placeholder="Optional"
              />
            </div>
          </>
        )}
      />
    </div>
  );
}

function FaqEditor({
  section,
  onChange,
}: {
  section: Extract<StorefrontSectionDraft, { type: "faq" }>;
  onChange: SectionChangeHandler;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Headline"
        value={section.data.headline || ""}
        onChange={(v) => onChange({ ...section, data: { ...section.data, headline: v.trim() ? v : undefined } })}
        placeholder="Before you unlock"
      />
      <RepeatableItems
        label="Q"
        items={section.data.items}
        addLabel="Add FAQ item"
        onAdd={() => onChange({ ...section, data: { ...section.data, items: [...section.data.items, { q: "New question", a: "New answer" }] } })}
        onRemove={(idx) => onChange({ ...section, data: { ...section.data, items: section.data.items.filter((_, i) => i !== idx) } })}
        renderItem={(item, idx) => (
          <>
            <Field
              label="Question"
              value={item.q}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: { ...section.data, items: section.data.items.map((it, i) => (i === idx ? { ...it, q: v } : it)) },
                })
              }
              placeholder="When do I get access?"
            />
            <div className="mt-3">
              <Textarea
                label="Answer"
                value={item.a}
                onChange={(v) =>
                  onChange({
                    ...section,
                    data: { ...section.data, items: section.data.items.map((it, i) => (i === idx ? { ...it, a: v } : it)) },
                  })
                }
                placeholder="After payment..."
              />
            </div>
          </>
        )}
      />
    </div>
  );
}

function FooterEditor({
  section,
  onChange,
}: {
  section: Extract<StorefrontSectionDraft, { type: "footer" }>;
  onChange: SectionChangeHandler;
}) {
  return (
    <div className="space-y-4">
      <Field
        label="Copyright"
        value={section.data.copyright || ""}
        onChange={(v) => onChange({ ...section, data: { ...section.data, copyright: v.trim() ? v : undefined } })}
        placeholder="Copyright 2026 Your Name"
      />
      <RepeatableItems
        label="Link"
        items={section.data.links || []}
        addLabel="Add footer link"
        onAdd={() =>
          onChange({
            ...section,
            data: { ...section.data, links: [...(section.data.links || []), { label: "New link", href: "https://paywall.zip" }] },
          })
        }
        onRemove={(idx) =>
          onChange({
            ...section,
            data: { ...section.data, links: (section.data.links || []).filter((_, i) => i !== idx) },
          })
        }
        renderItem={(item, idx) => (
          <>
            <Field
              label="Label"
              value={item.label}
              onChange={(v) =>
                onChange({
                  ...section,
                  data: {
                    ...section.data,
                    links: (section.data.links || []).map((it, i) => (i === idx ? { ...it, label: v } : it)),
                  },
                })
              }
              placeholder="Support"
            />
            <div className="mt-3">
              <Field
                label="URL (https)"
                value={item.href}
                onChange={(v) =>
                  onChange({
                    ...section,
                    data: {
                      ...section.data,
                      links: (section.data.links || []).map((it, i) => (i === idx ? { ...it, href: v } : it)),
                    },
                  })
                }
                placeholder="https://..."
                validate={(v) => !v || isValidHttpsUrl(v)}
              />
            </div>
          </>
        )}
      />
    </div>
  );
}

function RepeatableItems<T>({
  label,
  items,
  addLabel,
  renderItem,
  onAdd,
  onRemove,
}: {
  label: string;
  items: T[];
  addLabel: string;
  renderItem: (item: T, idx: number) => ReactNode;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="border-razor bg-black/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              {label} {idx + 1}
            </div>
            <button type="button" className="text-xs text-on-surface-variant hover:text-error" onClick={() => onRemove(idx)}>
              Remove
            </button>
          </div>
          {renderItem(item, idx)}
        </div>
      ))}
      <button
        type="button"
        className="border-razor min-h-11 w-full bg-black px-4 py-3 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
        onClick={onAdd}
      >
        {addLabel}
      </button>
    </div>
  );
}
