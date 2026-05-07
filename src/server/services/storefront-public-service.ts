import { cache } from "react";
import type { StorefrontConfigDraft, StorefrontSectionDraft } from "@/lib/storefront-api";
import { getSupabaseAdmin } from "@/lib/supabase";
import { coerceStorefrontTheme, createStorefrontBackground, createStorefrontCssVars } from "@/lib/storefront-theme";
import { getDefaultStorefrontConfig, storefrontConfigSchema } from "@/server/schemas/storefront";
import type {
  StorefrontWebsiteProduct,
  StorefrontWebsiteProfile,
} from "@/components/storefront/StorefrontWebsiteSections";

type StorefrontProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  storefront_enabled: boolean | null;
  storefront_handle: string | null;
  storefront_title: string | null;
  storefront_description: string | null;
  storefront_published_revision_id: string | null;
};

type StorefrontRevisionRow = {
  id: string;
  theme: unknown;
  sections: unknown;
  created_at: string;
};

type StorefrontDeliveryRow = {
  id: string;
  title: string;
  preview_text: string | null;
  preview_url: string | null;
  price_cents: number;
  requires_password: boolean | null;
  usage_limit: number | null;
  purchase_count: number | null;
  status_reason: string | null;
};

export type PublicStorefrontProfile = {
  id: string;
  handle: string;
  title: string | null;
  description: string | null;
  name: string;
  avatar_url: string | null;
};

export type PublicStorefrontData = {
  handle: string;
  title: string;
  description: string;
  profile: PublicStorefrontProfile;
  storefrontProfile: StorefrontWebsiteProfile;
  published: StorefrontRevisionRow | null;
  products: StorefrontWebsiteProduct[];
  config: StorefrontConfigDraft;
  enabledSections: StorefrontSectionDraft[];
  theme: ReturnType<typeof coerceStorefrontTheme>;
  cssVars: Record<string, string>;
  background: string;
  updatedAt: string | null;
};

export function normalizeStorefrontHandle(input: string) {
  return input.trim().toLowerCase();
}

export function isValidStorefrontHandle(handle: string) {
  return /^[a-z0-9-]{3,30}$/.test(handle);
}

function getProfileTitle(profile: StorefrontProfileRow) {
  return profile.storefront_title?.trim() || "Storefront";
}

function getProfileDescription(profile: StorefrontProfileRow) {
  return profile.storefront_description?.trim() || "Pay to unlock deliverables instantly.";
}

function mapProducts(rows: StorefrontDeliveryRow[]): StorefrontWebsiteProduct[] {
  return rows
    .filter((row) => row.status_reason !== "disabled_by_owner")
    .map((row) => ({
      id: row.id,
      title: row.title,
      preview_text: row.preview_text ?? null,
      preview_url: row.preview_url ?? null,
      price_cents: row.price_cents,
      requires_password: Boolean(row.requires_password),
      usage_limit: typeof row.usage_limit === "number" ? row.usage_limit : null,
      purchase_count: typeof row.purchase_count === "number" ? row.purchase_count : 0,
    }));
}

function getPublishedConfig(profile: StorefrontProfileRow, revision: StorefrontRevisionRow | null) {
  const fallbackConfig = getDefaultStorefrontConfig({
    title: getProfileTitle(profile),
    description: getProfileDescription(profile),
  });
  const parsedConfig = revision
    ? storefrontConfigSchema.safeParse({
        theme: revision.theme,
        sections: revision.sections,
      })
    : null;

  return parsedConfig?.success ? parsedConfig.data : fallbackConfig;
}

export const getPublicStorefrontByHandle = cache(
  async (rawHandle: string): Promise<PublicStorefrontData | null> => {
    const handle = normalizeStorefrontHandle(rawHandle);
    if (!isValidStorefrontHandle(handle)) return null;

    const supabase = getSupabaseAdmin();
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(
        "id,full_name,avatar_url,storefront_enabled,storefront_handle,storefront_title,storefront_description,storefront_published_revision_id"
      )
      .eq("storefront_handle", handle)
      .maybeSingle();

    if (profileError) throw profileError;

    const profile = profileData as StorefrontProfileRow | null;
    if (!profile?.id || !profile.storefront_enabled) return null;

    const { data: revisionData, error: revisionError } = profile.storefront_published_revision_id
      ? await supabase
          .from("storefront_revisions")
          .select("id,theme,sections,created_at")
          .eq("id", profile.storefront_published_revision_id)
          .eq("user_id", profile.id)
          .eq("status", "published")
          .maybeSingle()
      : { data: null, error: null };

    if (revisionError) throw revisionError;

    const { data: deliveryData, error: deliveryError } = await supabase
      .from("deliveries")
      .select("id,title,preview_text,preview_url,price_cents,requires_password,usage_limit,purchase_count,status_reason")
      .eq("user_id", profile.id)
      .eq("is_listed", true)
      .order("created_at", { ascending: false })
      .limit(60);

    if (deliveryError) throw deliveryError;

    const revision = revisionData as StorefrontRevisionRow | null;
    const products = mapProducts((deliveryData || []) as StorefrontDeliveryRow[]);
    const title = getProfileTitle(profile);
    const description = getProfileDescription(profile);
    const publicHandle = profile.storefront_handle || handle;
    const config = getPublishedConfig(profile, revision);
    const theme = coerceStorefrontTheme(config.theme);
    const enabledSections = config.sections.filter((section) => section.enabled) as StorefrontSectionDraft[];

    return {
      handle: publicHandle,
      title,
      description,
      profile: {
        id: profile.id,
        handle: publicHandle,
        title: profile.storefront_title || null,
        description: profile.storefront_description || null,
        name: profile.full_name || "Creator",
        avatar_url: profile.avatar_url || null,
      },
      storefrontProfile: {
        name: profile.full_name || "Creator",
        avatar_url: profile.avatar_url || null,
        title,
        description,
        handle: publicHandle,
      },
      published: revision,
      products,
      config,
      enabledSections,
      theme,
      cssVars: createStorefrontCssVars(theme),
      background: createStorefrontBackground(theme),
      updatedAt: revision?.created_at ?? null,
    };
  }
);

export async function getPublicStorefrontSitemapRows(limit = 500) {
  const supabase = getSupabaseAdmin();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("storefront_handle,storefront_published_revision_id")
    .eq("storefront_enabled", true)
    .not("storefront_handle", "is", null)
    .limit(limit);

  if (error) throw error;

  const rows = (profiles || []) as Array<{
    storefront_handle: string | null;
    storefront_published_revision_id: string | null;
  }>;
  const revisionIds = Array.from(
    new Set(rows.map((row) => row.storefront_published_revision_id).filter((id): id is string => Boolean(id)))
  );
  const revisionDates = new Map<string, string>();

  if (revisionIds.length) {
    const { data: revisions, error: revisionError } = await supabase
      .from("storefront_revisions")
      .select("id,created_at")
      .eq("status", "published")
      .in("id", revisionIds);

    if (revisionError) throw revisionError;

    for (const revision of (revisions || []) as Array<{ id: string; created_at: string }>) {
      revisionDates.set(revision.id, revision.created_at);
    }
  }

  return rows
    .map((row) => {
      const handle = normalizeStorefrontHandle(row.storefront_handle || "");
      if (!isValidStorefrontHandle(handle)) return null;
      return {
        handle,
        lastModified: row.storefront_published_revision_id
          ? revisionDates.get(row.storefront_published_revision_id) ?? null
          : null,
      };
    })
    .filter((row): row is { handle: string; lastModified: string | null } => Boolean(row));
}
