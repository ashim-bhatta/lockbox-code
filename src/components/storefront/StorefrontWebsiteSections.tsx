import type { ReactNode } from "react";
import Link from "next/link";
import type { StorefrontSectionDraft } from "@/lib/storefront-api";
import { formatCents } from "@/lib/utils";
import { MarkdownLite } from "@/components/storefront/MarkdownLite";

export type StorefrontWebsiteProfile = {
  name: string;
  avatar_url: string | null;
  title: string | null;
  description: string | null;
  handle: string | null;
};

export type StorefrontWebsiteProduct = {
  id: string;
  title: string;
  price_cents: number;
  preview_text: string | null;
  preview_url: string | null;
  requires_password: boolean;
  purchase_count?: number;
  usage_limit?: number | null;
};

type StorefrontRenderMode = "public" | "preview";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SectionKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cx("font-mono-data text-[10px] uppercase tracking-[0.24em] text-primary", className)}>
      {children}
    </div>
  );
}

function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cx(
        "max-w-4xl font-display-lg text-[clamp(2.15rem,8vw,5.4rem)] leading-[0.92] tracking-[-0.075em] text-on-surface",
        className
      )}
    >
      {children}
    </h2>
  );
}

function productCountLabel(count: number) {
  if (count === 0) return "No lockboxes listed";
  if (count === 1) return "1 lockbox";
  return `${count} lockboxes`;
}

function deliveryLabel(product: StorefrontWebsiteProduct) {
  if (product.usage_limit && product.usage_limit > 0) {
    const remaining = Math.max(product.usage_limit - (product.purchase_count || 0), 0);
    if (remaining === 0) return "Sold out";
    if (remaining === 1) return "1 access left";
    return `${remaining} accesses left`;
  }
  if (product.requires_password) return "Protected delivery";
  return "Instant delivery";
}

function cardMetaLabel(product: StorefrontWebsiteProduct) {
  const purchaseCount = product.purchase_count || 0;
  if (purchaseCount > 0) return `${purchaseCount} sold`;
  if (product.requires_password) return "Protected access";
  return "Stripe checkout";
}

function StorefrontAction({
  href,
  mode,
  variant = "primary",
  children,
}: {
  href: string;
  mode: StorefrontRenderMode;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  const className =
    variant === "primary"
      ? "btn-primary inline-flex min-h-12 w-full items-center justify-center px-6 py-3 font-label-sm text-label-sm uppercase tracking-[0.2em] transition-premium hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto"
      : "inline-flex min-h-12 w-full items-center justify-center border-b border-current px-1 py-3 font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface transition-premium hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:w-auto";

  if (mode === "preview") return <span className={className}>{children}</span>;
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

export function StorefrontSiteHeader({
  profile,
  mode = "public",
  showProducts = true,
  showFaq = true,
}: {
  profile: StorefrontWebsiteProfile;
  mode?: StorefrontRenderMode;
  showProducts?: boolean;
  showFaq?: boolean;
}) {
  const brandInitial = profile.name.slice(0, 1).toUpperCase() || "S";
  const navItems: Array<readonly [string, string]> = [];
  if (showProducts) navItems.push(["Shop", "#products"]);
  if (showFaq) navItems.push(["Questions", "#faq"]);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={`${profile.name} avatar`}
              className="h-11 w-11 shrink-0 rounded-full border border-white/15 object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-surface-container-low text-sm text-primary">
              {brandInitial}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-headline-md text-xl leading-tight text-on-surface">{profile.name}</div>
            <div className="truncate text-xs text-on-surface-variant">{profile.title || "Digital storefront"}</div>
          </div>
        </div>

        <nav className="hidden items-center gap-5 sm:flex">
          {navItems.map(([label, href]) =>
            mode === "preview" ? (
              <span key={label} className="text-sm text-on-surface-variant">
                {label}
              </span>
            ) : (
              <a
                key={label}
                href={href}
                className="text-sm text-on-surface-variant transition-premium hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {label}
              </a>
            )
          )}
        </nav>

        {mode === "preview" ? (
          <span className="border-razor hidden bg-surface-container-low px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant sm:inline-flex">
            Paywall.zip
          </span>
        ) : (
          <Link
            href="/"
            className="border-razor hidden bg-surface-container-low px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant transition-premium hover:text-on-surface focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:inline-flex"
          >
            Paywall.zip
          </Link>
        )}
      </div>
    </header>
  );
}

export function StorefrontSectionContent({
  section,
  profile,
  products,
  mode = "public",
}: {
  section: StorefrontSectionDraft;
  profile: StorefrontWebsiteProfile;
  products: StorefrontWebsiteProduct[];
  mode?: StorefrontRenderMode;
}) {
  if (section.type === "announcement") {
    return (
      <section className="border-y border-white/10 bg-primary/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm leading-6 text-on-surface">
            <span className="mr-3 font-mono-data text-[10px] uppercase tracking-[0.22em] text-primary">Update</span>
            {section.data.text}
          </p>
          {section.data.href ? (
            mode === "preview" ? (
              <span className="w-fit text-sm text-on-surface underline underline-offset-4">Read note</span>
            ) : (
              <a
                href={section.data.href}
                className="w-fit text-sm text-on-surface underline underline-offset-4 transition-premium hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Read note
              </a>
            )
          ) : null}
        </div>
      </section>
    );
  }

  if (section.type === "hero") {
    const primaryHref = section.data.cta_href || "#products";
    const featuredProduct = products[0] || null;
    const heroImage = section.data.image_url || featuredProduct?.preview_url || "";
    const heroEyebrow = products.length > 0 ? productCountLabel(products.length) : profile.title || "Digital storefront";

    return (
      <section className="relative overflow-hidden py-12 sm:py-20 lg:py-28">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.86fr)] lg:items-center">
          <div>
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <SectionKicker>{heroEyebrow}</SectionKicker>
              <span className="h-px w-12 bg-white/20" />
              <span className="text-sm text-on-surface-variant">{profile.handle ? `/s/${profile.handle}` : profile.name}</span>
            </div>
            <h1 className="max-w-5xl font-display-lg text-[clamp(3.05rem,13vw,8.7rem)] leading-[0.82] tracking-[-0.095em] text-on-surface">
              {section.data.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-[clamp(1rem,2vw,1.2rem)] leading-8 text-on-surface-variant">
              {section.data.subhead || profile.description || "Browse premium digital lockboxes and unlock access right after checkout."}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <StorefrontAction href={primaryHref} mode={mode}>
                {section.data.cta_label || "Shop lockboxes"}
              </StorefrontAction>
              {primaryHref !== "#products" ? (
                <StorefrontAction href="#products" mode={mode} variant="secondary">
                  View catalog
                </StorefrontAction>
              ) : null}
            </div>
          </div>

          <aside className="relative">
            <div className="absolute -right-8 -top-8 hidden h-28 w-28 border border-white/10 lg:block" />
            <div className="border border-white/10 bg-surface-container-low p-3 shadow-[0_28px_90px_rgba(0,0,0,0.22)]">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt={`${section.data.headline} preview`}
                  className="aspect-[5/4] w-full object-cover sm:aspect-[4/5]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex aspect-[5/4] items-end bg-surface-container-high p-6 text-sm text-on-surface-variant sm:aspect-[4/5]">
                  Add a hero or product image to turn this into a visual storefront.
                </div>
              )}
              {featuredProduct ? (
                <div className="relative mx-2 -mt-14 border border-white/10 bg-background/95 p-4 backdrop-blur sm:mx-5 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="font-mono-data text-[10px] uppercase tracking-[0.22em] text-primary">Featured</div>
                      <div className="mt-2 line-clamp-2 font-headline-md text-[clamp(1.4rem,4vw,2rem)] leading-tight text-on-surface">
                        {featuredProduct.title}
                      </div>
                      <div className="mt-1 text-xs text-on-surface-variant">{deliveryLabel(featuredProduct)}</div>
                    </div>
                    <div className="shrink-0 font-headline-md text-2xl text-on-surface">
                      {formatCents(featuredProduct.price_cents)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  if (section.type === "featured_product") {
    const selectedProduct = section.data.product_id
      ? products.find((product) => product.id === section.data.product_id)
      : null;
    const product = selectedProduct || products[0] || null;

    return (
      <section className="border-t border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          {product ? (
            <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,0.72fr)] lg:items-stretch">
              <div className="relative min-h-full overflow-hidden border border-white/10 bg-surface-container-low">
                {product.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.preview_url}
                    alt={`${product.title} preview`}
                    className="aspect-[4/3] w-full object-cover lg:h-full lg:aspect-auto"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-end bg-surface-container-high p-6 text-sm text-on-surface-variant lg:h-full lg:aspect-auto">
                    Add a product preview image to make this feature section feel complete.
                  </div>
                )}
                <div className="absolute left-4 top-4 bg-background/90 px-3 py-2 font-mono-data text-[10px] uppercase tracking-[0.22em] text-primary backdrop-blur">
                  {deliveryLabel(product)}
                </div>
              </div>

              <div className="flex flex-col justify-between border-y border-white/10 py-8 sm:py-10 lg:py-12">
                <div>
                  <SectionKicker>{section.data.eyebrow || "Featured lockbox"}</SectionKicker>
                  <h2 className="mt-4 max-w-2xl font-display-lg text-[clamp(2.6rem,8vw,6.8rem)] leading-[0.86] tracking-[-0.085em] text-on-surface">
                    {section.data.headline || product.title}
                  </h2>
                  <p className="mt-6 max-w-xl text-[clamp(1rem,2vw,1.15rem)] leading-8 text-on-surface-variant">
                    {section.data.subhead ||
                      product.preview_text ||
                      "A focused product spotlight helps buyers understand the offer before they browse the full catalog."}
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <div className="divide-y divide-white/10 border-y border-white/10">
                    <div className="flex items-center justify-between gap-4 py-4">
                      <span className="text-sm text-on-surface-variant">Product</span>
                      <span className="max-w-[62%] text-right font-headline-md text-xl leading-tight text-on-surface">{product.title}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <span className="text-sm text-on-surface-variant">Price</span>
                      <span className="font-headline-md text-2xl text-on-surface">{formatCents(product.price_cents)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-4">
                      <span className="text-sm text-on-surface-variant">Access</span>
                      <span className="text-sm text-on-surface">{cardMetaLabel(product)}</span>
                    </div>
                  </div>
                  <StorefrontAction href={`/d/${encodeURIComponent(product.id)}`} mode={mode}>
                    {section.data.cta_label || "View lockbox"}
                  </StorefrontAction>
                </div>
              </div>
            </div>
          ) : (
            <div className="border-y border-white/10 py-14 text-center">
              <SectionKicker>Featured lockbox</SectionKicker>
              <h2 className="mt-3 font-headline-md text-3xl text-on-surface">No listed product to feature yet</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
                List a lockbox, then use this section to spotlight the product buyers should consider first.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.type === "products_grid") {
    const maxItems = typeof section.data.max_items === "number" ? Math.max(1, Math.min(60, section.data.max_items)) : 24;
    const selectedIds = Array.isArray(section.data.selected_ids) ? section.data.selected_ids.filter(Boolean) : [];
    const selectedProducts = selectedIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is StorefrontWebsiteProduct => Boolean(product));
    const sourceProducts = selectedIds.length > 0 ? selectedProducts : products;
    const visible = sourceProducts.slice(0, maxItems);

    return (
      <section id="products" className="border-t border-white/10 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="mb-12 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
            <div>
              <SectionKicker>Catalog</SectionKicker>
              <SectionHeading className="mt-3">{section.data.headline || "Available lockboxes"}</SectionHeading>
            </div>
            <div className="max-w-xl lg:justify-self-end">
              {section.data.subhead ? (
                <p className="text-sm leading-7 text-on-surface-variant sm:text-base">{section.data.subhead}</p>
              ) : null}
              <p className="mt-4 font-mono-data text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">
                {productCountLabel(visible.length)}
              </p>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="border-y border-white/10 px-4 py-16 text-center">
              <h3 className="font-headline-md text-3xl text-on-surface">No lockboxes are listed yet</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-on-surface-variant">
                This storefront is live, but nothing is available to buy right now.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((product, index) => (
                <ProductCard key={product.id} product={product} mode={mode} featured={index === 0 && visible.length > 3} />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (section.type === "value_props") {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <SectionKicker>How it works</SectionKicker>
              <SectionHeading className="mt-3">{section.data.headline || "A cleaner way to deliver paid work"}</SectionHeading>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.data.items.map((item, index) => (
                <div key={`${index}_${item.title}`} className="border-t border-white/15 pt-5">
                  <div className="font-mono-data text-[10px] uppercase tracking-[0.24em] text-primary">
                    Step {index + 1}
                  </div>
                  <h3 className="mt-5 font-headline-md text-3xl leading-tight text-on-surface">{item.title}</h3>
                  {item.body ? <p className="mt-3 text-sm leading-7 text-on-surface-variant">{item.body}</p> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "testimonials") {
    const [lead, ...rest] = section.data.items;
    return (
      <section className="border-y border-white/10 bg-surface-container-low/60 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <SectionKicker>Buyer proof</SectionKicker>
          <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {lead ? (
              <figure className={rest.length === 0 ? "lg:col-span-2" : ""}>
                <blockquote className="max-w-4xl font-display-lg text-[clamp(2.4rem,6vw,5rem)] leading-[0.95] tracking-[-0.065em] text-on-surface">
                  &ldquo;{lead.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 text-sm text-on-surface-variant">
                  {lead.name}
                  {lead.role ? ` / ${lead.role}` : ""}
                </figcaption>
              </figure>
            ) : (
              <SectionHeading>{section.data.headline || "Trusted by buyers"}</SectionHeading>
            )}
            <div className="space-y-4">
              {(rest.length > 0 ? rest : section.data.items.slice(1)).map((item, index) => (
                <figure key={`${index}_${item.name}`} className="border-l border-white/15 pl-5">
                  <blockquote className="text-lg leading-8 text-on-surface">&ldquo;{item.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm text-on-surface-variant">
                    {item.name}
                    {item.role ? ` / ${item.role}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "faq") {
    return (
      <section id="faq" className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionKicker>Help before checkout</SectionKicker>
            <SectionHeading className="mt-3">{section.data.headline || "Questions buyers ask"}</SectionHeading>
            <p className="mt-5 max-w-sm text-sm leading-7 text-on-surface-variant">
              Key payment, delivery, and access details stay on the page so buyers do not have to hunt for answers.
            </p>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {section.data.items.map((item, index) => (
              <details key={`${index}_${item.q}`} className="group">
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  <span className="font-headline-md text-xl leading-7 text-on-surface sm:text-2xl">{item.q}</span>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/15 text-xl text-primary transition-premium group-open:rotate-45 group-hover:border-primary/60">
                    +
                  </span>
                </summary>
                <div className="pb-7">
                  <p className="max-w-2xl text-sm leading-7 text-on-surface-variant">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "rich_text") {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 lg:grid-cols-[0.52fr_1fr]">
          <div>
            <SectionKicker>Seller notes</SectionKicker>
            <h2 className="mt-3 font-headline-md text-3xl text-on-surface">Read before buying</h2>
          </div>
          <div className="border-y border-white/10 py-10">
            <MarkdownLite text={section.data.text} className="space-y-5 text-base leading-8" />
          </div>
        </div>
      </section>
    );
  }

  if (section.type === "cta") {
    return (
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="border-y border-white/10 py-12 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <SectionKicker>Ready when you are</SectionKicker>
                <SectionHeading className="mt-3">{section.data.headline}</SectionHeading>
                {section.data.subhead ? (
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">{section.data.subhead}</p>
                ) : null}
              </div>
              <StorefrontAction href={section.data.cta_href || "#products"} mode={mode}>
                {section.data.cta_label || "Shop lockboxes"}
              </StorefrontAction>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="font-headline-md text-2xl text-on-surface">{profile.name}</div>
          <p className="mt-2 text-sm text-on-surface-variant">
            {section.data.copyright || `Copyright ${new Date().getFullYear()} ${profile.name}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          {(section.data.links || []).map((link) => (
            <FooterLink key={link.href} href={link.href} mode={mode}>
              {link.label}
            </FooterLink>
          ))}
        </div>
      </div>
    </footer>
  );
}

function ProductCard({
  product,
  mode,
  featured,
}: {
  product: StorefrontWebsiteProduct;
  mode: StorefrontRenderMode;
  featured?: boolean;
}) {
  const image = product.preview_url ? (
    <div className={cx("overflow-hidden bg-surface-container-high", featured ? "lg:h-full" : "")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={product.preview_url}
        alt={`${product.title} preview`}
        className={cx(
          "w-full object-cover transition duration-700 group-hover:scale-[1.025]",
          featured ? "aspect-[4/3] lg:h-full lg:aspect-auto" : "aspect-[4/3]"
        )}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    </div>
  ) : (
    <div className="flex aspect-[4/3] items-end bg-surface-container-high p-5 text-sm text-on-surface-variant">
      No preview image
    </div>
  );

  const details = (
    <div className={cx("flex flex-1 flex-col", featured ? "p-6 lg:p-8" : "p-5")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono-data text-[10px] uppercase tracking-[0.2em] text-primary">{deliveryLabel(product)}</div>
          <h3 className="mt-3 font-headline-md text-2xl leading-tight text-on-surface">{product.title}</h3>
        </div>
        <div className="shrink-0 font-headline-md text-2xl text-on-surface">{formatCents(product.price_cents)}</div>
      </div>
      {product.preview_text ? (
        <p className={cx("mt-4 text-sm leading-7 text-on-surface-variant", featured ? "max-w-lg" : "line-clamp-3")}>
          {product.preview_text}
        </p>
      ) : null}
      <div className="mt-auto pt-8">
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface">
            View lockbox
          </span>
          <span className="text-xs text-on-surface-variant">
            {cardMetaLabel(product)}
          </span>
        </div>
      </div>
    </div>
  );

  const className = cx(
    "group border border-white/10 bg-surface-container-low transition-premium hover:-translate-y-1 hover:border-primary/45 hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
    featured ? "sm:col-span-2 lg:grid lg:grid-cols-[1.06fr_0.94fr]" : "flex h-full flex-col"
  );

  const content = (
    <>
      {image}
      {details}
    </>
  );

  if (mode === "preview") return <div className={className}>{content}</div>;
  return (
    <Link href={`/d/${encodeURIComponent(product.id)}`} className={className}>
      {content}
    </Link>
  );
}

function FooterLink({ href, mode, children }: { href: string; mode: StorefrontRenderMode; children: ReactNode }) {
  const className =
    "text-sm text-on-surface-variant underline-offset-4 transition-premium hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
  if (mode === "preview") return <span className={className}>{children}</span>;
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
