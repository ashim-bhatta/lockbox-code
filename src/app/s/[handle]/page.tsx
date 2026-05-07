import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAbsoluteUrl } from "@/lib/site-url";
import {
  getPublicStorefrontByHandle,
  type PublicStorefrontData,
} from "@/server/services/storefront-public-service";
import {
  StorefrontSectionContent,
  StorefrontSiteHeader,
} from "@/components/storefront/StorefrontWebsiteSections";

export const dynamic = "force-dynamic";

type StorefrontPageProps = {
  params: Promise<{ handle: string }>;
};

function getStorefrontJsonLd(storefront: PublicStorefrontData) {
  const storefrontUrl = getAbsoluteUrl(`/s/${storefront.handle}`);
  const products = storefront.products.slice(0, 24).map((product, index) => {
    const productUrl = getAbsoluteUrl(`/d/${product.id}`);
    return {
      "@type": "ListItem",
      position: index + 1,
      url: productUrl,
      item: {
        "@type": "Product",
        name: product.title,
        description: product.preview_text || storefront.description,
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (product.price_cents / 100).toFixed(2),
          availability: "https://schema.org/InStock",
          url: productUrl,
        },
      },
    };
  });

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: storefront.title,
      description: storefront.description,
      url: storefrontUrl,
      publisher: {
        "@type": "Organization",
        name: "Paywall.zip",
      },
    },
    ...(products.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `${storefront.title} lockboxes`,
            url: storefrontUrl,
            numberOfItems: products.length,
            itemListElement: products,
          },
        ]
      : []),
  ];
}

export async function generateMetadata({ params }: StorefrontPageProps): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const storefront = await getPublicStorefrontByHandle(rawHandle);

  if (!storefront) {
    return {
      title: "Storefront not found | Paywall.zip",
      robots: { index: false, follow: false },
    };
  }

  const title = `${storefront.title} by ${storefront.storefrontProfile.name}`;
  const canonicalPath = `/s/${storefront.handle}`;

  return {
    title,
    description: storefront.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: "website",
      title,
      description: storefront.description,
      url: canonicalPath,
      siteName: "Paywall.zip",
      images: [
        {
          url: `${canonicalPath}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${storefront.title} storefront preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: storefront.description,
      images: [`${canonicalPath}/twitter-image`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function StorefrontPage({ params }: StorefrontPageProps) {
  const { handle: rawHandle } = await params;
  const storefront = await getPublicStorefrontByHandle(rawHandle);
  if (!storefront) notFound();

  const hasProductsSection = storefront.enabledSections.some((section) => section.type === "products_grid");
  const hasFaqSection = storefront.enabledSections.some((section) => section.type === "faq");

  return (
    <div className="min-h-screen bg-background text-on-background" style={storefront.cssVars as CSSProperties}>
      <JsonLd data={getStorefrontJsonLd(storefront)} />
      <div
        className="noise-bg min-h-screen"
        style={{
          background: storefront.background,
          color: storefront.theme.text,
        }}
      >
        <StorefrontSiteHeader
          profile={storefront.storefrontProfile}
          showProducts={hasProductsSection}
          showFaq={hasFaqSection}
        />
        <main>
          {storefront.enabledSections.map((section) => (
            <StorefrontSectionContent
              key={section.id}
              section={section}
              profile={storefront.storefrontProfile}
              products={storefront.products}
            />
          ))}
        </main>
      </div>
    </div>
  );
}
