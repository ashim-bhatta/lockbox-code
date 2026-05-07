"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { PreviewDevice } from "@/components/storefront-builder/storefront-builder-types";

const DEVICE_META: Record<PreviewDevice, { label: string; width: number; height: number }> = {
  desktop: { label: "Desktop", width: 1280, height: 860 },
  tablet: { label: "Tablet", width: 820, height: 920 },
  mobile: { label: "Mobile", width: 390, height: 844 },
};

export function getPreviewDeviceMeta(device: PreviewDevice) {
  return DEVICE_META[device];
}

export function StorefrontPreviewFrame({
  device,
  children,
}: {
  device: PreviewDevice;
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const meta = getPreviewDeviceMeta(device);

  const syncIframe = useCallback(() => {
    const parentDocument = document;
    const frameDocument = iframeRef.current?.contentDocument;
    if (!frameDocument) return;
    const frameElement = frameDocument.documentElement;
    const frameHead = frameDocument.head;
    const frameBody = frameDocument.body;
    if (!frameElement || !frameHead || !frameBody) {
      return false;
    }

    frameElement.className = parentDocument.documentElement.className;
    frameBody.className = parentDocument.body.className;
    frameBody.style.margin = "0";
    frameBody.style.minHeight = "100%";
    frameBody.style.overflowX = "hidden";

    frameDocument.head
      .querySelectorAll("[data-storefront-preview-style]")
      .forEach((node) => node.remove());

    parentDocument
      .querySelectorAll('link[rel="stylesheet"], style')
      .forEach((node) => {
        const clone = node.cloneNode(true) as HTMLElement;
        clone.setAttribute("data-storefront-preview-style", "true");
        frameHead.appendChild(clone);
      });

    setMountNode(frameDocument.getElementById("storefront-preview-root"));
    return true;
  }, []);

  useEffect(() => {
    const frame = iframeRef.current;
    if (!frame) return;
    let frameRequest = 0;
    let attempts = 0;

    function syncUntilReady() {
      if (syncIframe()) return;
      if (attempts >= 10) return;
      attempts += 1;
      frameRequest = window.requestAnimationFrame(syncUntilReady);
    }

    frame.addEventListener("load", syncUntilReady);
    const timer = window.setTimeout(syncUntilReady, 0);
    return () => {
      frame.removeEventListener("load", syncUntilReady);
      window.cancelAnimationFrame(frameRequest);
      window.clearTimeout(timer);
    };
  }, [syncIframe]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const available = Math.max(entry.contentRect.width - 2, 1);
      setScale(Math.min(1, Math.max(0.28, available / meta.width)));
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [meta.width]);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden py-2">
      <div className="mx-auto" style={{ height: Math.ceil(meta.height * scale), width: Math.ceil(meta.width * scale) }}>
        <div
          className="origin-top overflow-hidden border border-white/10 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.34)]"
          style={{
            height: meta.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: meta.width,
          }}
        >
          <iframe
            ref={iframeRef}
            title={`${meta.label} storefront preview`}
            className="h-full w-full bg-background"
            srcDoc="<!doctype html><html><head><base target='_parent' /></head><body><div id='storefront-preview-root'></div></body></html>"
          />
        </div>
      </div>
      {scale < 0.99 ? (
        <div className="mt-3 text-center font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
          Scaled to {Math.round(scale * 100)}% / real {meta.width}px viewport
        </div>
      ) : null}
      {mountNode ? createPortal(children, mountNode) : null}
    </div>
  );
}
