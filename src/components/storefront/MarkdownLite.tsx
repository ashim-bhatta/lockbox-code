import type { ReactNode } from "react";

type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: InlineToken[] }
  | { type: "italic"; value: InlineToken[] }
  | { type: "code"; value: string }
  | { type: "link"; label: InlineToken[]; href: string };

function isSafeHref(href: string) {
  try {
    const url = new URL(href);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function tokenizeInline(input: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let i = 0;

  const pushText = (value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev?.type === "text") {
      prev.value += value;
      return;
    }
    tokens.push({ type: "text", value });
  };

  while (i < input.length) {
    // Code: `code`
    if (input[i] === "`") {
      const end = input.indexOf("`", i + 1);
      if (end > i + 1) {
        tokens.push({ type: "code", value: input.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    // Link: [label](https://...)
    if (input[i] === "[") {
      const closeLabel = input.indexOf("]", i + 1);
      if (closeLabel > i + 1 && input[closeLabel + 1] === "(") {
        const closeHref = input.indexOf(")", closeLabel + 2);
        if (closeHref > closeLabel + 2) {
          const labelRaw = input.slice(i + 1, closeLabel);
          const hrefRaw = input.slice(closeLabel + 2, closeHref);
          if (isSafeHref(hrefRaw)) {
            tokens.push({ type: "link", label: tokenizeInline(labelRaw), href: hrefRaw });
            i = closeHref + 1;
            continue;
          }
        }
      }
    }

    // Bold: **text**
    if (input[i] === "*" && input[i + 1] === "*") {
      const end = input.indexOf("**", i + 2);
      if (end > i + 2) {
        tokens.push({ type: "bold", value: tokenizeInline(input.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // Italic: *text* or _text_
    if (input[i] === "*" || input[i] === "_") {
      const marker = input[i];
      const end = input.indexOf(marker, i + 1);
      if (end > i + 1) {
        tokens.push({ type: "italic", value: tokenizeInline(input.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    pushText(input[i]);
    i += 1;
  }

  return tokens;
}

function renderInline(tokens: InlineToken[], keyPrefix: string): ReactNode[] {
  return tokens.map((token, idx) => {
    const key = `${keyPrefix}_${idx}`;
    if (token.type === "text") return token.value;
    if (token.type === "code") {
      return (
        <code key={key} className="border-razor bg-black/40 px-2 py-1 font-mono-data text-[11px] text-on-surface">
          {token.value}
        </code>
      );
    }
    if (token.type === "bold") return <strong key={key}>{renderInline(token.value, key)}</strong>;
    if (token.type === "italic") return <em key={key}>{renderInline(token.value, key)}</em>;
    if (token.type === "link") {
      return (
        <a
          key={key}
          href={token.href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-outline-variant underline-offset-4 hover:text-on-surface"
        >
          {renderInline(token.label, key)}
        </a>
      );
    }
    return null;
  });
}

function normalizeLines(text: string) {
  return text.replace(/\r\n/g, "\n").split("\n");
}

export function MarkdownLite({ text, className }: { text: string; className?: string }) {
  const lines = normalizeLines(text);
  const blocks: ReactNode[] = [];

  let buffer: string[] = [];
  let listMode: "ul" | "ol" | null = null;
  let listItems: ReactNode[] = [];

  const flushParagraph = () => {
    const joined = buffer.join(" ").trim();
    if (!joined) {
      buffer = [];
      return;
    }
    const inline = renderInline(tokenizeInline(joined), `p_${blocks.length}`);
    blocks.push(
      <p key={`p_${blocks.length}`} className="text-sm text-on-surface-variant">
        {inline}
      </p>
    );
    buffer = [];
  };

  const flushList = () => {
    if (!listMode || listItems.length === 0) {
      listMode = null;
      listItems = [];
      return;
    }
    const key = `list_${blocks.length}`;
    const Tag = listMode === "ol" ? "ol" : "ul";
    blocks.push(
      <Tag
        key={key}
        className={[
          "space-y-2 pl-6 text-sm text-on-surface-variant",
          listMode === "ol" ? "list-decimal" : "list-disc",
        ].join(" ")}
      >
        {listItems}
      </Tag>
    );
    listMode = null;
    listItems = [];
  };

  for (let idx = 0; idx < lines.length; idx += 1) {
    const raw = lines[idx] ?? "";
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1]!.length;
      const content = headingMatch[2]!.trim();
      const inline = renderInline(tokenizeInline(content), `h_${blocks.length}`);
      const headingClass =
        level === 1
          ? "font-headline-md text-headline-md text-on-surface"
          : level === 2
            ? "font-label-sm text-label-sm uppercase tracking-widest text-on-surface"
            : "font-label-sm text-label-sm text-on-surface";
      const Tag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      blocks.push(
        <Tag key={`h_${blocks.length}`} className={headingClass}>
          {inline}
        </Tag>
      );
      continue;
    }

    const ulMatch = /^[-*]\s+(.+)$/.exec(trimmed);
    const olMatch = /^(\d+)\.\s+(.+)$/.exec(trimmed);
    if (ulMatch || olMatch) {
      flushParagraph();
      const mode: "ul" | "ol" = ulMatch ? "ul" : "ol";
      const content = (ulMatch ? ulMatch[1] : olMatch?.[2])!.trim();
      if (listMode && listMode !== mode) flushList();
      listMode = mode;
      const inline = renderInline(tokenizeInline(content), `li_${blocks.length}_${listItems.length}`);
      listItems.push(<li key={`li_${blocks.length}_${listItems.length}`}>{inline}</li>);
      continue;
    }

    buffer.push(trimmed);
  }

  flushParagraph();
  flushList();

  return <div className={className || "space-y-4"}>{blocks}</div>;
}

