"use client";

import { useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { IconButton } from "@/components/ui/buttons/IconButton";

export function CopyButton({
  text,
  className = "",
  feedbackClassName = "",
}: {
  text: string;
  className?: string;
  feedbackClassName?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setError(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
      setError(true);
      window.setTimeout(() => setError(false), 1800);
    }
  }

  return (
    <div className="relative">
      <IconButton className={className} onClick={handleCopy} aria-label="Copy link">
        <AppIcon name="content_copy" size={18} />
      </IconButton>
      {(copied || error) && (
        <div role="status" aria-live="polite" className={`absolute bottom-full right-0 z-50 mb-2 flex whitespace-nowrap rounded bg-inverse-surface px-3 py-1.5 font-label-sm text-label-sm text-inverse-on-surface shadow-lg ${feedbackClassName}`}>
          {copied ? "Link copied to clipboard!" : "Clipboard blocked in this browser."}
        </div>
      )}
    </div>
  );
}
