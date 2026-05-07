import { z } from "zod";

const MAX_PLAINTEXT = 8000;

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("https://"), { message: "URL must use https://" });

const safeText = (max: number) =>
  z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length <= max, { message: `Must be at most ${max} characters.` });

const sectionBase = z.object({
  id: z.string().min(1).max(64),
  enabled: z.boolean(),
});

const themeSchema = z
  .object({
    preset: z.enum(["minimal", "bold", "elegant"]).optional(),
    background_style: z.enum(["spotlight", "solid", "aurora"]).optional(),
    tokens: z
      .object({
        primary: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
        background: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
        surface: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
        text: z.string().regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/).optional(),
        radius: z.number().min(0).max(32).optional(),
        card_opacity: z.number().min(0.55).max(1).optional(),
      })
      .optional(),
  })
  .strict();

const announcementSection = sectionBase
  .extend({
    type: z.literal("announcement"),
    data: z
      .object({
        text: safeText(140),
        href: httpsUrl.optional(),
      })
      .strict(),
  })
  .strict();

const heroSection = sectionBase
  .extend({
    type: z.literal("hero"),
    data: z
      .object({
        headline: safeText(120),
        subhead: safeText(280).optional(),
        cta_label: safeText(40).optional(),
        cta_href: httpsUrl.optional(),
        image_url: httpsUrl.optional(),
      })
      .strict(),
  })
  .strict();

const productsGridSection = sectionBase
  .extend({
    type: z.literal("products_grid"),
    data: z
      .object({
        headline: safeText(80).optional(),
        subhead: safeText(200).optional(),
        max_items: z.number().int().min(1).max(60).optional(),
        selected_ids: z.array(z.string().min(1).max(80)).max(60).optional(),
      })
      .strict(),
  })
  .strict();

const featuredProductSection = sectionBase
  .extend({
    type: z.literal("featured_product"),
    data: z
      .object({
        eyebrow: safeText(40).optional(),
        headline: safeText(90).optional(),
        subhead: safeText(260).optional(),
        product_id: z.string().min(1).max(80).optional(),
        cta_label: safeText(40).optional(),
      })
      .strict(),
  })
  .strict();

const valuePropsSection = sectionBase
  .extend({
    type: z.literal("value_props"),
    data: z
      .object({
        headline: safeText(80).optional(),
        items: z
          .array(
            z
              .object({
                title: safeText(60),
                body: safeText(160).optional(),
              })
              .strict()
          )
          .max(6),
      })
      .strict(),
  })
  .strict();

const testimonialsSection = sectionBase
  .extend({
    type: z.literal("testimonials"),
    data: z
      .object({
        headline: safeText(80).optional(),
        items: z
          .array(
            z
              .object({
                quote: safeText(240),
                name: safeText(60),
                role: safeText(60).optional(),
                avatar_url: httpsUrl.optional(),
              })
              .strict()
          )
          .max(12),
      })
      .strict(),
  })
  .strict();

const faqSection = sectionBase
  .extend({
    type: z.literal("faq"),
    data: z
      .object({
        headline: safeText(80).optional(),
        items: z
          .array(
            z
              .object({
                q: safeText(120),
                a: safeText(400),
              })
              .strict()
          )
          .max(16),
      })
      .strict(),
  })
  .strict();

const richTextSection = sectionBase
  .extend({
    type: z.literal("rich_text"),
    data: z
      .object({
        text: safeText(MAX_PLAINTEXT),
      })
      .strict(),
  })
  .strict();

const ctaSection = sectionBase
  .extend({
    type: z.literal("cta"),
    data: z
      .object({
        headline: safeText(80),
        subhead: safeText(220).optional(),
        cta_label: safeText(40).optional(),
        cta_href: httpsUrl.optional(),
      })
      .strict(),
  })
  .strict();

const footerSection = sectionBase
  .extend({
    type: z.literal("footer"),
    data: z
      .object({
        copyright: safeText(120).optional(),
        links: z
          .array(
            z
              .object({
                label: safeText(30),
                href: httpsUrl,
              })
              .strict()
          )
          .max(10)
          .optional(),
      })
      .strict(),
  })
  .strict();

export const storefrontSectionSchema = z.discriminatedUnion("type", [
  announcementSection,
  heroSection,
  productsGridSection,
  featuredProductSection,
  valuePropsSection,
  testimonialsSection,
  faqSection,
  richTextSection,
  ctaSection,
  footerSection,
]);

export const storefrontConfigSchema = z
  .object({
    theme: themeSchema.optional(),
    sections: z.array(storefrontSectionSchema).max(30),
  })
  .strict();

export type StorefrontConfig = z.infer<typeof storefrontConfigSchema>;
export type StorefrontSection = z.infer<typeof storefrontSectionSchema>;
export type StorefrontTheme = z.infer<typeof themeSchema>;

export function getDefaultStorefrontConfig(input?: {
  title?: string | null;
  description?: string | null;
}) {
  const title = input?.title?.trim() || "Storefront";
  const description = input?.description?.trim() || "Pay to unlock deliverables instantly.";
  const config: StorefrontConfig = {
    theme: { preset: "minimal" },
    sections: [
      {
        id: "hero",
        type: "hero",
        enabled: true,
        data: {
          headline: title,
          subhead: description,
        },
      },
      {
        id: "featured",
        type: "featured_product",
        enabled: true,
        data: {
          eyebrow: "Featured lockbox",
          headline: "Start with the most useful unlock",
          subhead: "A product-focused section gives buyers the price, delivery promise, and next action without hunting.",
        },
      },
      {
        id: "products",
        type: "products_grid",
        enabled: true,
        data: {
          headline: "Available lockboxes",
          max_items: 24,
        },
      },
      {
        id: "footer",
        type: "footer",
        enabled: true,
        data: {},
      },
    ],
  };
  return config;
}
