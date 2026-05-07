import type { StorefrontSectionDraft } from "@/lib/storefront-api";

export type SectionPresetKey = "launch_page" | "proof_page" | "quick_drop";

function makeId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createSectionTemplate(type: StorefrontSectionDraft["type"]): StorefrontSectionDraft {
  if (type === "announcement") {
    return {
      id: makeId("announcement"),
      type,
      enabled: true,
      data: { text: "New drop live - unlock instantly via Stripe." },
    };
  }
  if (type === "hero") {
    return {
      id: makeId("hero"),
      type,
      enabled: true,
      data: {
        headline: "A private checkout for finished work.",
        subhead: "Choose a lockbox, pay securely, and unlock the deliverable without waiting for a manual handoff.",
        cta_label: "Browse lockboxes",
        cta_href: "https://paywall.zip",
      },
    };
  }
  if (type === "products_grid") {
    return {
      id: makeId("products"),
      type,
      enabled: true,
      data: {
        headline: "Available lockboxes",
        subhead: "Each product includes secure checkout and instant access after payment.",
        max_items: 24,
      },
    };
  }
  if (type === "featured_product") {
    return {
      id: makeId("featured_product"),
      type,
      enabled: true,
      data: {
        eyebrow: "Featured lockbox",
        headline: "The best place to start",
        subhead: "Spotlight one high-value product with image, price, delivery expectations, and a direct unlock path.",
        cta_label: "View lockbox",
      },
    };
  }
  if (type === "value_props") {
    return {
      id: makeId("value_props"),
      type,
      enabled: true,
      data: {
        headline: "Built for clean, confident handoff",
        items: [
          { title: "Secure payment first", body: "Stripe Checkout handles the transaction before access opens." },
          { title: "No manual waiting", body: "Buyers get the unlock flow immediately after a successful checkout." },
          { title: "Access can be restored", body: "Customers can return later with the same checkout email." },
        ],
      },
    };
  }
  if (type === "testimonials") {
    return {
      id: makeId("testimonials"),
      type,
      enabled: true,
      data: {
        headline: "What buyers notice",
        items: [
          { quote: "The checkout felt clear, and the files opened right after payment.", name: "Recent buyer" },
          { quote: "No DMs, no follow-up. I knew exactly what I was getting.", name: "Returning customer" },
        ],
      },
    };
  }
  if (type === "faq") {
    return {
      id: makeId("faq"),
      type,
      enabled: true,
      data: {
        headline: "Before you unlock",
        items: [
          { q: "When do I get access?", a: "Right after Stripe confirms payment, the lockbox opens with the delivery details." },
          { q: "Can I come back later?", a: "Yes. Use Restore Access with your checkout email to get back to eligible purchases." },
        ],
      },
    };
  }
  if (type === "rich_text") {
    return {
      id: makeId("rich_text"),
      type,
      enabled: true,
      data: {
        text: "Write a short story about what buyers receive, timelines, or support expectations.",
      },
    };
  }
  if (type === "cta") {
    return {
      id: makeId("cta"),
      type,
      enabled: true,
      data: {
        headline: "Ready to unlock?",
        subhead: "Choose a lockbox and pay to get instant access.",
        cta_label: "Browse lockboxes",
        cta_href: "https://paywall.zip",
      },
    };
  }
  return {
    id: makeId("footer"),
    type: "footer",
    enabled: true,
    data: {
      copyright: `(c) ${new Date().getFullYear()} Your Storefront`,
      links: [{ label: "Support", href: "https://paywall.zip" }],
    },
  };
}

export function getStarterSections(): StorefrontSectionDraft[] {
  return [
    createSectionTemplate("announcement"),
    createSectionTemplate("hero"),
    createSectionTemplate("featured_product"),
    createSectionTemplate("products_grid"),
    createSectionTemplate("footer"),
  ];
}

export function createSectionPreset(preset: SectionPresetKey): StorefrontSectionDraft[] {
  if (preset === "proof_page") {
    return [
      createSectionTemplate("hero"),
      createSectionTemplate("testimonials"),
      createSectionTemplate("value_props"),
      createSectionTemplate("faq"),
      createSectionTemplate("cta"),
    ];
  }

  if (preset === "quick_drop") {
    return [
      createSectionTemplate("announcement"),
      createSectionTemplate("hero"),
      createSectionTemplate("featured_product"),
      createSectionTemplate("products_grid"),
      createSectionTemplate("faq"),
    ];
  }

  return [
    createSectionTemplate("announcement"),
    createSectionTemplate("hero"),
    createSectionTemplate("featured_product"),
    createSectionTemplate("products_grid"),
    createSectionTemplate("value_props"),
    createSectionTemplate("faq"),
    createSectionTemplate("cta"),
    createSectionTemplate("footer"),
  ];
}
