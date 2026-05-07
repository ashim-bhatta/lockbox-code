import { ImageResponse } from "next/og";
import { getPublicStorefrontByHandle } from "@/server/services/storefront-public-service";

export const dynamic = "force-dynamic";
export const alt = "Paywall.zip storefront preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ handle: string }>;
};

function compactText(input: string, maxLength: number) {
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength - 1).trim()}…`;
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export default async function StorefrontOpenGraphImage({ params }: ImageProps) {
  const { handle } = await params;
  const storefront = await getPublicStorefrontByHandle(handle);
  const title = storefront?.title || "Paywall.zip Storefront";
  const description = storefront?.description || "Pay to unlock deliverables instantly.";
  const creator = storefront?.storefrontProfile.name || "Creator";
  const primary = storefront?.theme.primary || "#9fb6ff";
  const background = storefront?.theme.background || "#05070d";
  const text = storefront?.theme.text || "#e5e7eb";
  const surface = storefront?.theme.surface || "#0b1220";
  const featuredProducts = storefront?.products.slice(0, 3) || [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 72,
          background,
          color: text,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at 20% 12%, ${primary}66 0, transparent 32%), radial-gradient(circle at 90% 20%, ${primary}26 0, transparent 30%)`,
          }}
        />
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            border: `1px solid ${primary}55`,
            borderRadius: 44,
            overflow: "hidden",
            background: `${surface}dd`,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 58 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: primary,
                  color: background,
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                {creator.charAt(0).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{creator}</div>
                <div style={{ fontSize: 15, letterSpacing: 6, textTransform: "uppercase", opacity: 0.72 }}>
                  Paywall.zip Storefront
                </div>
              </div>
            </div>

            <div style={{ fontSize: 74, lineHeight: 0.94, fontWeight: 900, letterSpacing: -4, maxWidth: 680 }}>
              {compactText(title, 56)}
            </div>
            <div style={{ marginTop: 28, fontSize: 28, lineHeight: 1.35, maxWidth: 620, opacity: 0.82 }}>
              {compactText(description, 116)}
            </div>
            <div style={{ marginTop: "auto", display: "flex", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: 999,
                  background: primary,
                  color: background,
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                Instant checkout
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "14px 20px",
                  borderRadius: 999,
                  border: `1px solid ${primary}66`,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {storefront?.products.length || 0} lockboxes
              </div>
            </div>
          </div>

          <div
            style={{
              width: 360,
              padding: 42,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 18,
              borderLeft: `1px solid ${primary}33`,
              background: `${background}8f`,
            }}
          >
            {featuredProducts.length ? (
              featuredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 22,
                    borderRadius: 26,
                    border: `1px solid ${primary}40`,
                    background: `${surface}ee`,
                  }}
                >
                  <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1.12 }}>
                    {compactText(product.title, 38)}
                  </div>
                  <div style={{ fontSize: 20, color: primary, fontWeight: 900 }}>
                    {formatPrice(product.price_cents)}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ fontSize: 28, lineHeight: 1.25, fontWeight: 800 }}>
                Secure digital delivery, built for paid client handoffs.
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    size
  );
}
