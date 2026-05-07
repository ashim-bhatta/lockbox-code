"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveDialog } from "@/components/ui/overlay/ResponsiveDialog";
import { StorefrontAddSectionPanel } from "@/components/storefront-builder/StorefrontAddSectionPanel";
import {
  BuilderHeader,
  InspectorPanelSkeleton,
  MobileWorkspaceTabs,
  ViewportSwitcher,
} from "@/components/storefront-builder/StorefrontBuilderChrome";
import { StorefrontBuilderLoadError, StorefrontBuilderLoading } from "@/components/storefront-builder/StorefrontBuilderLoading";
import { StorefrontMobileEditSheet } from "@/components/storefront-builder/StorefrontMobileEditSheet";
import { StorefrontPublishPanel } from "@/components/storefront-builder/StorefrontPublishPanel";
import { StorefrontPreview } from "@/components/storefront-builder/StorefrontPreview";
import { StorefrontPreviewFrame } from "@/components/storefront-builder/StorefrontPreviewFrame";
import { StorefrontSectionList } from "@/components/storefront-builder/StorefrontSectionList";
import { createSectionTemplate } from "@/components/storefront-builder/storefront-templates";
import {
  coerceConfig,
  duplicateSection,
  getSectionLabel,
  moveItem,
  moveItemById,
  normalizeHandle,
  safeText,
  validateStorefrontBuilder,
} from "@/components/storefront-builder/storefront-builder-utils";
import type {
  AutosaveState,
  ConfigMutator,
  InspectorTab,
  LockboxRow,
  MobileWorkspace,
  PreviewDevice,
  ProfilePayload,
  RevisionHistoryRow,
  SectionInsertionPlacement,
} from "@/components/storefront-builder/storefront-builder-types";
import {
  fetchStorefrontDraft,
  fetchStorefrontHistory,
  publishStorefront,
  rollbackStorefront,
  saveStorefrontDraft,
  type StorefrontConfigDraft,
  type StorefrontSectionDraft,
} from "@/lib/storefront-api";

const StorefrontInspectorPanel = dynamic(
  () =>
    import("@/components/storefront-builder/StorefrontInspectorPanel").then(
      (mod) => mod.StorefrontInspectorPanel
    ),
  { loading: () => <InspectorPanelSkeleton /> }
);

export function StorefrontBuilder() {
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [config, setConfig] = useState<StorefrontConfigDraft>({ sections: [] });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<InspectorTab>("section");
  const [addOpen, setAddOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [busyPublish, setBusyPublish] = useState(false);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [history, setHistory] = useState<RevisionHistoryRow[]>([]);
  const [publishedRevisionId, setPublishedRevisionId] = useState<string | null>(null);
  const [previewLockboxes, setPreviewLockboxes] = useState<LockboxRow[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>("desktop");
  const [mobileWorkspace, setMobileWorkspace] = useState<MobileWorkspace>("preview");
  const [mobileEditorOpen, setMobileEditorOpen] = useState(false);
  const [insertPlacement, setInsertPlacement] = useState<SectionInsertionPlacement>({ position: "end" });
  const [origin, setOrigin] = useState("");
  const [editHistoryCounts, setEditHistoryCounts] = useState({ undo: 0, redo: 0 });
  const configRef = useRef<StorefrontConfigDraft>({ sections: [] });
  const undoStackRef = useRef<StorefrontConfigDraft[]>([]);
  const redoStackRef = useRef<StorefrontConfigDraft[]>([]);
  const editVersionRef = useRef(0);

  const handle = normalizeHandle(profile?.storefront_handle);
  const storefrontEnabled = Boolean(profile?.storefront_enabled);
  const publicPath = handle ? `/s/${handle}` : "/s/your-handle";
  const displayName = safeText(profile?.full_name || "Creator");
  const storeTitle = safeText(profile?.storefront_title || "Storefront");
  const storeDescription = safeText(profile?.storefront_description || "Pay to unlock deliverables instantly.");

  const selected = useMemo(
    () => config.sections.find((section) => section.id === selectedId) || null,
    [config.sections, selectedId]
  );

  const previewProfile = useMemo(
    () => ({
      name: displayName,
      avatar_url: profile?.avatar_url || null,
      title: storeTitle,
      description: storeDescription,
      handle: handle || null,
    }),
    [displayName, handle, profile?.avatar_url, storeDescription, storeTitle]
  );

  const previewProducts = useMemo(() => {
    return previewLockboxes.map((row) => ({
      id: row.id,
      title: row.title,
      price_cents: row.priceCents,
      preview_text: row.previewText || null,
      preview_url: row.previewUrl || null,
      requires_password: row.requiresPassword,
      is_listed: row.isListed,
    }));
  }, [previewLockboxes]);

  const validationItems = useMemo(
    () => validateStorefrontBuilder({ config, profile, lockboxes: previewLockboxes }),
    [config, profile, previewLockboxes]
  );

  const syncEditHistoryCounts = useCallback(() => {
    setEditHistoryCounts({
      undo: undoStackRef.current.length,
      redo: redoStackRef.current.length,
    });
  }, []);

  const replaceConfig = useCallback(
    (nextConfig: StorefrontConfigDraft, createdAt?: string) => {
      configRef.current = nextConfig;
      undoStackRef.current = [];
      redoStackRef.current = [];
      editVersionRef.current = 0;
      setConfig(nextConfig);
      setDirty(false);
      setAutosaveState("idle");
      setLastSavedAt(createdAt || null);
      syncEditHistoryCounts();
    },
    [syncEditHistoryCounts]
  );

  const commitConfig = useCallback(
    (mutator: ConfigMutator) => {
      const previous = configRef.current;
      const next = mutator(previous);
      if (next === previous) return;
      configRef.current = next;
      undoStackRef.current = [...undoStackRef.current.slice(-49), previous];
      redoStackRef.current = [];
      editVersionRef.current += 1;
      setConfig(next);
      setDirty(true);
      setAutosaveState("pending");
      syncEditHistoryCounts();
    },
    [syncEditHistoryCounts]
  );

  const loadAll = useCallback(async () => {
    setLoadState("loading");
    setStatus(null);
    try {
      const [profileRes, draftRes, historyRes, lockboxesRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetchStorefrontDraft(),
        fetchStorefrontHistory().catch(() => ({ rows: [], published_revision_id: null })),
        fetch("/api/dashboard/lockboxes", { cache: "no-store" }).catch(() => null),
      ]);

      const profileJson = (await profileRes.json().catch(() => ({}))) as {
        profile?: ProfilePayload;
        error?: string;
      };
      if (!profileRes.ok) throw new Error(profileJson.error || "Failed to load profile.");

      const nextProfile = profileJson.profile || null;
      const revision = draftRes.revision;
      const nextConfig = coerceConfig({ theme: revision.theme, sections: revision.sections });

      setProfile(nextProfile);
      replaceConfig(nextConfig, revision.created_at);
      setSelectedId((prev) =>
        prev && nextConfig.sections.some((section) => section.id === prev) ? prev : nextConfig.sections[0]?.id || null
      );
      setHistory(historyRes.rows || []);
      setPublishedRevisionId(historyRes.published_revision_id || null);

      if (lockboxesRes && (lockboxesRes as Response).ok) {
        const lockboxJson = (await (lockboxesRes as Response).json().catch(() => ({}))) as {
          rows?: Array<{
            id: string;
            title: string;
            priceCents: number;
            previewText: string;
            previewUrl: string;
            requiresPassword: boolean;
            isListed?: boolean;
          }>;
        };
        setPreviewLockboxes(
          (lockboxJson.rows || []).map((row) => ({
            id: row.id,
            title: row.title,
            priceCents: row.priceCents,
            previewText: row.previewText || "",
            previewUrl: row.previewUrl || "",
            requiresPassword: Boolean(row.requiresPassword),
            isListed: Boolean(row.isListed),
          }))
        );
      } else {
        setPreviewLockboxes([]);
      }

      setLoadState("ready");
    } catch (error) {
      setLoadState("error");
      setStatus(error instanceof Error ? error.message : "Failed to load builder.");
    }
  }, [replaceConfig]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);

  const persistDraft = useCallback(async (options?: { silent?: boolean }) => {
    const versionAtSave = editVersionRef.current;
    if (!options?.silent) {
      setBusySave(true);
      setStatus(null);
    }
    setAutosaveState("saving");

    try {
      await saveStorefrontDraft(configRef.current);
      const savedAt = new Date().toISOString();
      setLastSavedAt(savedAt);
      if (editVersionRef.current === versionAtSave) {
        setDirty(false);
        setAutosaveState("saved");
      } else {
        setAutosaveState("pending");
      }
      if (!options?.silent) setStatus("Draft saved.");
      return true;
    } catch (error) {
      setAutosaveState("error");
      setStatus(error instanceof Error ? error.message : "Unable to save draft.");
      return false;
    } finally {
      if (!options?.silent) setBusySave(false);
    }
  }, []);

  useEffect(() => {
    if (loadState !== "ready" || !dirty || busySave || busyPublish) return;
    setAutosaveState("pending");
    const timer = window.setTimeout(() => {
      void persistDraft({ silent: true });
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [busyPublish, busySave, config, dirty, loadState, persistDraft]);

  const undoConfig = useCallback(() => {
    const previous = undoStackRef.current.at(-1);
    if (!previous) return;
    const current = configRef.current;
    undoStackRef.current = undoStackRef.current.slice(0, -1);
    redoStackRef.current = [current, ...redoStackRef.current].slice(0, 50);
    configRef.current = previous;
    editVersionRef.current += 1;
    setConfig(previous);
    setDirty(true);
    setAutosaveState("pending");
    setSelectedId((prev) => (prev && previous.sections.some((section) => section.id === prev) ? prev : previous.sections[0]?.id || null));
    syncEditHistoryCounts();
  }, [syncEditHistoryCounts]);

  const redoConfig = useCallback(() => {
    const next = redoStackRef.current[0];
    if (!next) return;
    const current = configRef.current;
    redoStackRef.current = redoStackRef.current.slice(1);
    undoStackRef.current = [...undoStackRef.current.slice(-49), current];
    configRef.current = next;
    editVersionRef.current += 1;
    setConfig(next);
    setDirty(true);
    setAutosaveState("pending");
    setSelectedId((prev) => (prev && next.sections.some((section) => section.id === prev) ? prev : next.sections[0]?.id || null));
    syncEditHistoryCounts();
  }, [syncEditHistoryCounts]);

  const exitFocusMode = useCallback(() => {
    setFocusMode(false);
  }, []);

  const toggleFocusMode = useCallback(() => {
    setFocusMode((prev) => !prev);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTypingTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      return Boolean(target.isContentEditable);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      if ((event.key === "s" || event.key === "S") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        void persistDraft();
        return;
      }

      if ((event.key === "z" || event.key === "Z") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (event.shiftKey) redoConfig();
        else undoConfig();
        return;
      }

      if ((event.key === "y" || event.key === "Y") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        redoConfig();
        return;
      }

      if (event.key === "Escape" && focusMode) {
        exitFocusMode();
        return;
      }

      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        toggleFocusMode();
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        if (event.key === "1") setPreviewDevice("desktop");
        if (event.key === "2") setPreviewDevice("tablet");
        if (event.key === "3") setPreviewDevice("mobile");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [exitFocusMode, focusMode, persistDraft, redoConfig, toggleFocusMode, undoConfig]);

  const selectSection = useCallback((id: string) => {
    setSelectedId(id);
    setTab("section");
    setMobileWorkspace("preview");
    setMobileEditorOpen(true);
  }, []);

  function openAddSections(placement: SectionInsertionPlacement = { position: "end" }) {
    setInsertPlacement(placement);
    setAddOpen(true);
  }

  function toggleSectionById(sectionId: string) {
    commitConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, enabled: !section.enabled } : section
      ),
    }));
  }

  function moveSectionById(sectionId: string, direction: "up" | "down") {
    commitConfig((prev) => {
      const index = prev.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.sections.length) return prev;
      return { ...prev, sections: moveItem(prev.sections, index, nextIndex) };
    });
  }

  function deleteSection(sectionId: string) {
    const remaining = configRef.current.sections.filter((section) => section.id !== sectionId);
    const nextFirstId = remaining[0]?.id || null;
    commitConfig((prev) => ({ ...prev, sections: prev.sections.filter((section) => section.id !== sectionId) }));
    setSelectedId((prevSelected) => (prevSelected === sectionId ? nextFirstId : prevSelected));
    if (selectedId === sectionId) {
      setMobileEditorOpen(false);
    }
  }

  function duplicateSectionById(sectionId: string) {
    let duplicatedId: string | null = null;
    commitConfig((prev) => {
      const index = prev.sections.findIndex((section) => section.id === sectionId);
      if (index < 0) return prev;
      const duplicated = duplicateSection(prev.sections[index]);
      duplicatedId = duplicated.id;
      return {
        ...prev,
        sections: [...prev.sections.slice(0, index + 1), duplicated, ...prev.sections.slice(index + 1)],
      };
    });
    if (duplicatedId) selectSection(duplicatedId);
  }

  function addSections(sections: StorefrontSectionDraft[]) {
    if (sections.length === 0) return;
    commitConfig((prev) => {
      const nextSections = prev.sections.slice();
      const targetIndex =
        insertPlacement.position === "end"
          ? nextSections.length
          : nextSections.findIndex((section) => section.id === insertPlacement.sectionId);
      const insertIndex =
        targetIndex < 0
          ? nextSections.length
          : insertPlacement.position === "below"
            ? targetIndex + 1
            : targetIndex;
      nextSections.splice(insertIndex, 0, ...sections);
      return { ...prev, sections: nextSections };
    });
    selectSection(sections[0].id);
    setAddOpen(false);
    setInsertPlacement({ position: "end" });
  }

  async function onPublish() {
    setBusyPublish(true);
    setStatus(null);
    try {
      if (dirty) {
        const saved = await persistDraft();
        if (!saved) return;
      }
      const published = await publishStorefront();
      setPublishedRevisionId(published.published_revision_id);
      setStatus("Published live.");
      const nextHistory = await fetchStorefrontHistory();
      setHistory(nextHistory.rows || []);
      setPublishedRevisionId(nextHistory.published_revision_id || published.published_revision_id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to publish storefront.");
    } finally {
      setBusyPublish(false);
    }
  }

  async function onRollback(revisionId: string) {
    setStatus(null);
    try {
      const result = await rollbackStorefront(revisionId);
      setPublishedRevisionId(result.published_revision_id);
      setStatus("Rolled back successfully.");
      const nextHistory = await fetchStorefrontHistory();
      setHistory(nextHistory.rows || []);
      setPublishedRevisionId(nextHistory.published_revision_id || result.published_revision_id);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Rollback failed.");
    }
  }

  const gridCols = useMemo(() => {
    return focusMode ? "minmax(0, 1fr)" : "320px minmax(0, 1fr) 380px";
  }, [focusMode]);

  const hasBlockingValidation = validationItems.some((item) => item.severity === "error");
  const firstBlocker = validationItems.find((item) => item.severity === "error") || null;
  const publishIssueCount = validationItems.filter((item) => item.severity !== "tip").length;
  const canPublish = storefrontEnabled && Boolean(handle) && !busyPublish && !busySave && !hasBlockingValidation;
  const chromeClassName = focusMode
    ? "fixed inset-0 z-50 flex h-screen flex-col overflow-hidden bg-surface-container-lowest text-on-surface"
    : "space-y-8 pb-24 xl:pb-0";
  const chromeInnerClassName = focusMode ? "flex h-full flex-col gap-6 p-4 sm:p-6" : "space-y-10";
  const panesWrapperClassName = focusMode ? "flex-1 min-h-0" : "";
  const paneScrollClassName = focusMode ? "flex-1 min-h-0 overflow-auto" : "xl:max-h-[calc(100svh-15rem)] xl:overflow-auto";
  const addDialogTitle = insertPlacement.position === "end" ? "Add Section" : "Add Section Here";

  function setMobileWorkspaceAndCloseEditor(next: MobileWorkspace) {
    setMobileWorkspace(next);
    if (next !== "preview") setMobileEditorOpen(false);
  }

  const inspectorPanel = (paneClassName = paneScrollClassName) => (
    <StorefrontInspectorPanel
      tab={tab}
      selected={selected}
      theme={config.theme || {}}
      products={previewLockboxes}
      historyRows={history}
      publishedRevisionId={publishedRevisionId}
      paneScrollClassName={paneClassName}
      onTabChange={setTab}
      onSectionChange={(next) =>
        commitConfig((prev) => ({
          ...prev,
          sections: prev.sections.map((section) => (section.id === next.id ? next : section)),
        }))
      }
      onThemeChange={(theme) => commitConfig((prev) => ({ ...prev, theme }))}
      onRollback={(id) => void onRollback(id)}
      onDuplicateSection={duplicateSectionById}
      onDeleteSection={deleteSection}
    />
  );

  const publishPanel = (
    <StorefrontPublishPanel
      publicPath={publicPath}
      publicUrl={origin ? `${origin}${publicPath}` : publicPath}
      publishedRevisionId={publishedRevisionId}
      validationItems={validationItems}
      busyPublish={busyPublish}
      canPublish={canPublish}
      onPublish={() => void onPublish()}
      onSelectSection={selectSection}
    />
  );

  if (loadState === "loading") return <StorefrontBuilderLoading />;
  if (loadState === "error") return <StorefrontBuilderLoadError message={status} onRetry={() => void loadAll()} />;

  return (
    <div className={chromeClassName}>
      <div className={chromeInnerClassName}>
        <div className={focusMode ? "shrink-0" : "sticky top-4 z-30"}>
          <BuilderHeader
            handle={handle}
            publicPath={publicPath}
            publishedRevisionId={publishedRevisionId}
            dirty={dirty}
            autosaveState={autosaveState}
            lastSavedAt={lastSavedAt}
            busySave={busySave}
            busyPublish={busyPublish}
            canPublish={canPublish}
            focusMode={focusMode}
            editHistoryCounts={editHistoryCounts}
            firstBlocker={firstBlocker}
            onToggleFocus={toggleFocusMode}
            onSave={() => void persistDraft()}
            onPublish={() => void onPublish()}
            onUndo={undoConfig}
            onRedo={redoConfig}
          />
        </div>

        <MobileWorkspaceTabs value={mobileWorkspace} onChange={setMobileWorkspaceAndCloseEditor} issueCount={publishIssueCount} />

        {status ? (
          <div className="border-razor bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            {status}
          </div>
        ) : null}

        <div className={panesWrapperClassName}>
          <div
            className="grid items-start gap-6 xl:gap-8 xl:[grid-template-columns:var(--builder-cols)]"
            style={{ ["--builder-cols" as never]: gridCols }}
          >
            {!focusMode || mobileWorkspace === "sections" ? (
              <div className={`${mobileWorkspace === "sections" ? "flex" : "hidden"} min-h-0 flex-col ${focusMode ? "xl:hidden" : "xl:sticky xl:top-36 xl:flex xl:max-h-[calc(100svh-10rem)]"}`}>
                <StorefrontSectionList
                  sections={config.sections}
                  selectedId={selectedId}
                  dragOverSectionId={dragOverSectionId}
                  validationItems={validationItems}
                  paneScrollClassName={paneScrollClassName}
                  onOpenAdd={() => openAddSections()}
                  onSelect={selectSection}
                  onToggle={toggleSectionById}
                  onMove={(from, to) => commitConfig((prev) => ({ ...prev, sections: moveItem(prev.sections, from, to) }))}
                  onDuplicate={duplicateSectionById}
                  onDelete={deleteSection}
                  onReorder={(activeId, overId) =>
                    commitConfig((prev) => ({ ...prev, sections: moveItemById(prev.sections, activeId, overId) }))
                  }
                  onDragOverSection={setDragOverSectionId}
                />
              </div>
            ) : null}

            <div className={`${mobileWorkspace === "preview" ? "flex" : "hidden"} min-h-0 flex-col gap-4 xl:flex`}>
              <div className={`${focusMode ? "" : "xl:sticky xl:top-36 xl:z-20"} border-razor flex flex-col justify-between gap-4 bg-surface-container-low px-5 py-4 sm:flex-row sm:items-center`}>
                <div className="space-y-1">
                  <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
                    Buyer preview
                  </div>
                  <div className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface">
                    {selected ? `Editing ${selected.type}` : "Click a section to edit"}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ViewportSwitcher value={previewDevice} onChange={setPreviewDevice} />
                  <button
                    type="button"
                    className="border-razor min-h-10 bg-black px-4 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
                    onClick={() => {
                      setSelectedId(null);
                      setMobileEditorOpen(false);
                      setMobileWorkspace("preview");
                    }}
                  >
                    Clear selection
                  </button>
                </div>
              </div>

              <div className={focusMode ? "min-h-0 flex-1 overflow-auto" : ""}>
                <StorefrontPreviewFrame device={previewDevice}>
                  <StorefrontPreview
                    config={config}
                    profile={previewProfile}
                    products={previewProducts}
                    selectedSectionId={selectedId}
                    onSelectSection={selectSection}
                    onAddSection={openAddSections}
                    onDuplicateSection={duplicateSectionById}
                    onToggleSection={toggleSectionById}
                    onMoveSection={moveSectionById}
                    onReorderSection={(activeId, overId) => {
                      commitConfig((prev) => ({ ...prev, sections: moveItemById(prev.sections, activeId, overId) }));
                      setSelectedId(activeId);
                    }}
                  />
                </StorefrontPreviewFrame>
              </div>
            </div>

            {!focusMode ? (
              <div className="hidden min-h-0 flex-col gap-4 xl:sticky xl:top-36 xl:flex xl:max-h-[calc(100svh-10rem)]">
                {inspectorPanel()}
                <div className="hidden xl:block">
                  {publishPanel}
                </div>
              </div>
            ) : null}
            {mobileWorkspace === "publish" ? (
              <div className="flex min-h-0 flex-col xl:hidden">
                {publishPanel}
              </div>
            ) : null}
          </div>
        </div>

        <StorefrontMobileEditSheet
          open={Boolean(selected) && mobileEditorOpen && mobileWorkspace === "preview"}
          title={selected ? getSectionLabel(selected) : "Section"}
          onClose={() => setMobileEditorOpen(false)}
        >
          {inspectorPanel("max-h-none overflow-visible")}
        </StorefrontMobileEditSheet>

        <ResponsiveDialog
          open={addOpen}
          title={addDialogTitle}
          onClose={() => {
            setAddOpen(false);
            setInsertPlacement({ position: "end" });
          }}
          panelClassName="max-w-4xl"
        >
          <StorefrontAddSectionPanel
            onAdd={(type) => addSections([createSectionTemplate(type)])}
            onAddPreset={addSections}
          />
        </ResponsiveDialog>
      </div>
    </div>
  );
}
