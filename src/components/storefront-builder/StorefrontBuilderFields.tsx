"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "border-razor min-h-10 px-3 py-2 font-mono-data text-[10px] uppercase tracking-widest transition-premium",
        active ? "bg-primary text-on-primary" : "bg-black text-on-surface-variant hover:text-on-surface",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  validate,
  right,
  type = "text",
  inputMode,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  validate?: (v: string) => boolean;
  right?: ReactNode;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  min?: number;
  max?: number;
}) {
  const ok = validate ? validate(value.trim()) : true;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          {label}
        </label>
        {right || (hint ? <span className="text-xs text-on-surface-variant opacity-60">{hint}</span> : null)}
      </div>
      <input
        value={value}
        type={type}
        inputMode={inputMode}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "border-razor w-full bg-black px-4 py-3 text-sm text-on-surface outline-none transition-premium focus:border-primary",
          ok ? "" : "border-error/60",
        ].join(" ")}
      />
      {!ok ? <div className="text-xs text-error">Must be a valid https:// URL.</div> : null}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: TextareaHTMLAttributes<HTMLTextAreaElement>["rows"];
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 px-1">
        <label className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant opacity-70">
          {label}
        </label>
        {hint ? <span className="text-xs text-on-surface-variant opacity-60">{hint}</span> : null}
      </div>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-razor w-full bg-black px-4 py-3 text-sm text-on-surface outline-none transition-premium focus:border-primary"
      />
    </div>
  );
}
