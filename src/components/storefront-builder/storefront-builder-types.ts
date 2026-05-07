import type { StorefrontConfigDraft, StorefrontSectionDraft } from "@/lib/storefront-api";

export type ProfilePayload = {
  storefront_enabled?: boolean;
  storefront_handle?: string | null;
  storefront_title?: string | null;
  storefront_description?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

export type LockboxRow = {
  id: string;
  title: string;
  priceCents: number;
  previewText: string;
  previewUrl: string;
  requiresPassword: boolean;
  isListed: boolean;
};

export type InspectorTab = "section" | "theme" | "history";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export type MobileWorkspace = "preview" | "sections" | "publish";

export type SectionInsertionPlacement =
  | { position: "end" }
  | { position: "above" | "below"; sectionId: string };

export type AutosaveState = "idle" | "pending" | "saving" | "saved" | "error";

export type RevisionHistoryRow = {
  id: string;
  status: "draft" | "published";
  created_at: string;
};

export type BuilderValidationItem = {
  id: string;
  severity: "error" | "warning" | "tip";
  title: string;
  body: string;
  sectionId?: string;
};

export type ConfigMutator = (prev: StorefrontConfigDraft) => StorefrontConfigDraft;

export type SectionChangeHandler = (next: StorefrontSectionDraft) => void;
