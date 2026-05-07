"use client";

import { useMemo, useRef, useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { MarkdownLite } from "@/components/storefront/MarkdownLite";

function applyWrap(textarea: HTMLTextAreaElement, wrapLeft: string, wrapRight: string) {
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const value = textarea.value;
  const selected = value.slice(start, end) || "";
  const next = value.slice(0, start) + wrapLeft + selected + wrapRight + value.slice(end);
  textarea.value = next;

  const cursor = start + wrapLeft.length + selected.length + wrapRight.length;
  textarea.selectionStart = cursor;
  textarea.selectionEnd = cursor;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function applyLinePrefix(textarea: HTMLTextAreaElement, prefix: string) {
  const start = textarea.selectionStart ?? 0;
  const end = textarea.selectionEnd ?? 0;
  const value = textarea.value;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const before = value.slice(0, lineStart);
  const selected = value.slice(lineStart, end);
  const lines = selected.split("\n");
  const nextLines = lines.map((line) => (line.trim().length ? `${prefix}${line}` : line));
  const next = before + nextLines.join("\n") + value.slice(end);

  textarea.value = next;
  textarea.selectionStart = lineStart;
  textarea.selectionEnd = lineStart + nextLines.join("\n").length;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
  textarea.focus();
}

function applyLink(textarea: HTMLTextAreaElement) {
  const href = window.prompt("Paste an https:// link");
  if (!href || !href.startsWith("https://")) return;
  applyWrap(textarea, "[", `](${href})`);
}

type Tool =
  | { label: string; icon: string; onClick: (el: HTMLTextAreaElement) => void }
  | { divider: true };

export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const tools: Tool[] = useMemo(
    () => [
      { label: "H2", icon: "title", onClick: (el) => applyLinePrefix(el, "## ") },
      { label: "Bold", icon: "format_bold", onClick: (el) => applyWrap(el, "**", "**") },
      { label: "Italic", icon: "format_italic", onClick: (el) => applyWrap(el, "_", "_") },
      { label: "Code", icon: "code", onClick: (el) => applyWrap(el, "`", "`") },
      { divider: true },
      { label: "Bullets", icon: "format_list_bulleted", onClick: (el) => applyLinePrefix(el, "- ") },
      { label: "Numbers", icon: "format_list_numbered", onClick: (el) => applyLinePrefix(el, "1. ") },
      { divider: true },
      { label: "Link", icon: "link", onClick: (el) => applyLink(el) },
    ],
    []
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
            {label}
          </div>
          {hint ? <div className="mt-1 text-xs text-on-surface-variant">{hint}</div> : null}
        </div>
        <div className="border-razor flex bg-black/40 p-1">
          <button
            type="button"
            className={[
              "px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
              mode === "edit" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
            onClick={() => setMode("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={[
              "px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
              mode === "preview" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
            onClick={() => setMode("preview")}
          >
            Preview
          </button>
        </div>
      </div>

      {mode === "edit" ? (
        <div className="border-razor bg-black/40">
          <div className="flex flex-wrap items-center gap-1 border-b border-white/5 p-2">
            {tools.map((tool, idx) => {
              if ("divider" in tool) {
                return <div key={`div_${idx}`} className="mx-1 h-7 w-px bg-white/10" />;
              }
              return (
                <button
                  key={tool.label}
                  type="button"
                  className="border-razor inline-flex items-center gap-2 bg-black px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-on-surface"
                  onClick={() => {
                    const el = textareaRef.current;
                    if (!el) return;
                    tool.onClick(el);
                  }}
                  title={tool.label}
                >
                  <AppIcon name={tool.icon as never} size={14} className="text-primary" />
                  {tool.label}
                </button>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={10}
            className="w-full resize-y bg-transparent px-4 py-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/60"
          />
        </div>
      ) : (
        <div className="border-razor bg-black/40 p-4">
          {value.trim() ? (
            <MarkdownLite text={value} />
          ) : (
            <div className="text-sm text-on-surface-variant">Nothing to preview yet.</div>
          )}
        </div>
      )}
    </div>
  );
}

