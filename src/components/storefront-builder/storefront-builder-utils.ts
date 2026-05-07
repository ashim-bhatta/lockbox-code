import type { StorefrontConfigDraft, StorefrontSectionDraft, StorefrontThemeDraft } from "@/lib/storefront-api";
import { getStarterSections } from "@/components/storefront-builder/storefront-templates";
import type { BuilderValidationItem, LockboxRow, ProfilePayload } from "@/components/storefront-builder/storefront-builder-types";

export function normalizeHandle(input: string | null | undefined) {
  return String(input || "").trim().toLowerCase();
}

export function isValidHttpsUrl(input: string) {
  try {
    const parsed = new URL(input);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function safeText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

export function createDraftId(prefix: string) {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function moveItem<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  if (!item) return next;
  next.splice(to, 0, item);
  return next;
}

export function moveItemById<T extends { id: string }>(arr: T[], activeId: string, overId: string) {
  if (activeId === overId) return arr;
  const from = arr.findIndex((item) => item.id === activeId);
  const over = arr.findIndex((item) => item.id === overId);
  if (from < 0 || over < 0) return arr;
  const to = from < over ? Math.max(0, over - 1) : over;
  return moveItem(arr, from, to);
}

export function formatShortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function coerceConfig(revision: { theme: unknown; sections: unknown } | null): StorefrontConfigDraft {
  const theme = revision?.theme && typeof revision.theme === "object" ? (revision.theme as StorefrontThemeDraft) : undefined;
  const sections = Array.isArray(revision?.sections) ? (revision!.sections as StorefrontSectionDraft[]) : getStarterSections();
  return { theme, sections };
}

export function getSectionLabel(section: StorefrontSectionDraft) {
  if (section.type === "hero") return section.data.headline || "Hero";
  if (section.type === "announcement") return section.data.text || "Announcement";
  if (section.type === "products_grid") return section.data.headline || "Products grid";
  if (section.type === "featured_product") return section.data.headline || "Featured product";
  if (section.type === "value_props") return section.data.headline || "Value props";
  if (section.type === "testimonials") return section.data.headline || "Testimonials";
  if (section.type === "faq") return section.data.headline || "FAQ";
  if (section.type === "cta") return section.data.headline || "CTA";
  if (section.type === "rich_text") return "Rich text";
  return "Footer";
}

export function duplicateSection(section: StorefrontSectionDraft): StorefrontSectionDraft {
  const copy = JSON.parse(JSON.stringify(section)) as StorefrontSectionDraft;
  return { ...copy, id: createDraftId(`${section.type}_copy`), enabled: true };
}

function pushUrlIssue(
  items: BuilderValidationItem[],
  section: StorefrontSectionDraft,
  key: string,
  value: string | undefined
) {
  if (!value || isValidHttpsUrl(value)) return;
  items.push({
    id: `${section.id}_${key}_url`,
    severity: "error",
    title: "Fix an insecure link",
    body: `${getSectionLabel(section)} has a ${key.replace("_", " ")} that is not a valid https:// URL.`,
    sectionId: section.id,
  });
}

export function validateStorefrontBuilder({
  config,
  profile,
  lockboxes,
}: {
  config: StorefrontConfigDraft;
  profile: ProfilePayload | null;
  lockboxes: LockboxRow[];
}) {
  const items: BuilderValidationItem[] = [];
  const handle = normalizeHandle(profile?.storefront_handle);
  const enabledSections = config.sections.filter((section) => section.enabled);
  const listedProducts = lockboxes.filter((row) => row.isListed);

  if (!profile?.storefront_enabled) {
    items.push({
      id: "storefront_disabled",
      severity: "error",
      title: "Storefront is not enabled",
      body: "Publishing needs storefront access enabled in Settings before buyers can visit the page.",
    });
  }

  if (!handle) {
    items.push({
      id: "storefront_handle",
      severity: "error",
      title: "Handle is missing",
      body: "Add a public handle in Settings so the storefront has a stable /s/ URL.",
    });
  }

  if (enabledSections.length === 0) {
    items.push({
      id: "no_enabled_sections",
      severity: "error",
      title: "No visible sections",
      body: "Enable at least one section before publishing the buyer page.",
    });
  }

  if (!enabledSections.some((section) => section.type === "hero")) {
    items.push({
      id: "missing_hero",
      severity: "warning",
      title: "Add a hero section",
      body: "A storefront without a hero asks buyers to understand the offer too late.",
    });
  }

  const commerceSections = enabledSections.filter((section) => section.type === "products_grid" || section.type === "featured_product");
  if (commerceSections.length === 0) {
    items.push({
      id: "missing_products",
      severity: "warning",
      title: "No product section",
      body: "Add a product grid or featured product if buyers should buy lockboxes from this page.",
    });
  } else if (listedProducts.length === 0) {
    items.push({
      id: "no_listed_products",
      severity: "warning",
      title: "No listed lockboxes",
      body: "The product section will show an empty state until at least one lockbox is listed.",
    });
  }

  for (const section of config.sections) {
    if (section.type === "announcement" && section.enabled) {
      if (!safeText(section.data.text)) {
        items.push({
          id: `${section.id}_empty_announcement`,
          severity: "warning",
          title: "Announcement is empty",
          body: "Either write a short useful update or hide the announcement.",
          sectionId: section.id,
        });
      }
      pushUrlIssue(items, section, "link", section.data.href);
    }

    if (section.type === "hero") {
      if (section.enabled && !safeText(section.data.headline)) {
        items.push({
          id: `${section.id}_empty_headline`,
          severity: "warning",
          title: "Hero headline is empty",
          body: "Use the hero to explain what buyers can unlock and why it is worth paying for.",
          sectionId: section.id,
        });
      }
      pushUrlIssue(items, section, "cta_link", section.data.cta_href);
      pushUrlIssue(items, section, "image_url", section.data.image_url);
    }

    if (section.type === "products_grid") {
      const selectedIds = section.data.selected_ids || [];
      const listedIds = new Set(listedProducts.map((row) => row.id));
      const staleSelections = selectedIds.filter((id) => !listedIds.has(id));
      if (staleSelections.length > 0) {
        items.push({
          id: `${section.id}_stale_products`,
          severity: "warning",
          title: "Selected products changed",
          body: "One or more chosen lockboxes are no longer listed, so buyers will not see them.",
          sectionId: section.id,
        });
      }
    }

    if (section.type === "featured_product" && section.enabled) {
      const listedIds = new Set(listedProducts.map((row) => row.id));
      if (listedProducts.length === 0) {
        items.push({
          id: `${section.id}_no_featured_product`,
          severity: "warning",
          title: "Featured product has nothing to show",
          body: "List at least one lockbox or hide this section until there is a product to feature.",
          sectionId: section.id,
        });
      } else if (section.data.product_id && !listedIds.has(section.data.product_id)) {
        items.push({
          id: `${section.id}_stale_featured_product`,
          severity: "warning",
          title: "Featured product is unavailable",
          body: "Pick a listed lockbox so this section does not fall back unexpectedly.",
          sectionId: section.id,
        });
      }
    }

    if (section.type === "value_props" && section.enabled && section.data.items.length < 2) {
      items.push({
        id: `${section.id}_thin_value_props`,
        severity: "tip",
        title: "Add one more proof point",
        body: "Two or three sharp value props usually explain checkout trust better than one lonely item.",
        sectionId: section.id,
      });
    }

    if (section.type === "faq" && section.enabled && section.data.items.length === 0) {
      items.push({
        id: `${section.id}_empty_faq`,
        severity: "tip",
        title: "FAQ has no questions",
        body: "Hide it or add answers for payment, delivery, refunds, and restore access.",
        sectionId: section.id,
      });
    }

    if (section.type === "cta") {
      pushUrlIssue(items, section, "cta_link", section.data.cta_href);
    }

    if (section.type === "footer") {
      for (const [index, link] of (section.data.links || []).entries()) {
        pushUrlIssue(items, section, `footer_link_${index + 1}`, link.href);
      }
    }
  }

  return items;
}
