type ApiErrorShape = { error?: string; code?: string };

function hasError(payload: unknown): payload is ApiErrorShape {
  return typeof payload === "object" && payload !== null && "error" in payload;
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const payload = (await res.json()) as T | ApiErrorShape;
  if (!res.ok || (hasError(payload) && payload.error)) {
    const message = (hasError(payload) && payload.error) || "Request failed.";
    const error = new Error(message) as Error & { code?: string };
    if (hasError(payload) && payload.code) {
      error.code = payload.code;
    }
    throw error;
  }
  return payload as T;
}

export type StorefrontThemeDraft = {
  preset?: "minimal" | "bold" | "elegant";
  background_style?: "spotlight" | "solid" | "aurora";
  tokens?: {
    primary?: string;
    background?: string;
    surface?: string;
    text?: string;
    radius?: number;
    card_opacity?: number;
  };
};

export type StorefrontSectionDraft =
  | {
      id: string;
      enabled: boolean;
      type: "announcement";
      data: { text: string; href?: string };
    }
  | {
      id: string;
      enabled: boolean;
      type: "hero";
      data: {
        headline: string;
        subhead?: string;
        cta_label?: string;
        cta_href?: string;
        image_url?: string;
      };
    }
  | {
      id: string;
      enabled: boolean;
      type: "products_grid";
      data: { headline?: string; subhead?: string; max_items?: number; selected_ids?: string[] };
    }
  | {
      id: string;
      enabled: boolean;
      type: "featured_product";
      data: { eyebrow?: string; headline?: string; subhead?: string; product_id?: string; cta_label?: string };
    }
  | {
      id: string;
      enabled: boolean;
      type: "value_props";
      data: { headline?: string; items: Array<{ title: string; body?: string }> };
    }
  | {
      id: string;
      enabled: boolean;
      type: "testimonials";
      data: { headline?: string; items: Array<{ quote: string; name: string; role?: string; avatar_url?: string }> };
    }
  | {
      id: string;
      enabled: boolean;
      type: "faq";
      data: { headline?: string; items: Array<{ q: string; a: string }> };
    }
  | { id: string; enabled: boolean; type: "rich_text"; data: { text: string } }
  | { id: string; enabled: boolean; type: "cta"; data: { headline: string; subhead?: string; cta_label?: string; cta_href?: string } }
  | { id: string; enabled: boolean; type: "footer"; data: { copyright?: string; links?: Array<{ label: string; href: string }> } };

export type StorefrontConfigDraft = {
  theme?: StorefrontThemeDraft;
  sections: StorefrontSectionDraft[];
};

export async function fetchStorefrontDraft() {
  const res = await fetch("/api/storefront/draft", { cache: "no-store" });
  return parseApiResponse<{ revision: { id: string; theme: unknown; sections: unknown; created_at: string } }>(res);
}

export async function saveStorefrontDraft(config: StorefrontConfigDraft) {
  const res = await fetch("/api/storefront/draft", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  return parseApiResponse<{ revision: { id: string; theme: unknown; sections: unknown; created_at: string } }>(res);
}

export async function publishStorefront() {
  const res = await fetch("/api/storefront/publish", { method: "POST" });
  return parseApiResponse<{ ok: true; published_revision_id: string }>(res);
}

export async function fetchStorefrontHistory() {
  const res = await fetch("/api/storefront/history", { cache: "no-store" });
  return parseApiResponse<{
    rows: Array<{ id: string; status: "draft" | "published"; created_at: string }>;
    published_revision_id: string | null;
  }>(res);
}

export async function rollbackStorefront(revisionId: string) {
  const res = await fetch("/api/storefront/rollback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ revision_id: revisionId }),
  });
  return parseApiResponse<{ ok: true; published_revision_id: string }>(res);
}
