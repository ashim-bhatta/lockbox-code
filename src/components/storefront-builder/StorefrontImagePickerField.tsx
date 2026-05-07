"use client";

import { useRef, useState } from "react";
import { AppIcon } from "@/components/ui/icons/AppIcon";
import { Field } from "@/components/storefront-builder/StorefrontBuilderFields";
import type { LockboxRow } from "@/components/storefront-builder/storefront-builder-types";
import { isValidHttpsUrl } from "@/components/storefront-builder/storefront-builder-utils";

type StorefrontImagePickerFieldProps = {
  value: string;
  products: LockboxRow[];
  onChange: (value: string) => void;
};

type UploadState = {
  status: "idle" | "uploading" | "error" | "success";
  message: string;
};

async function parseUploadResponse(res: Response) {
  const payload = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !payload.url) {
    throw new Error(payload.error || "Unable to upload image.");
  }
  return payload.url;
}

export function StorefrontImagePickerField({ value, products, onChange }: StorefrontImagePickerFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle", message: "" });
  const imageProducts = products.filter((product) => product.previewUrl);
  const validValue = !value || isValidHttpsUrl(value);

  async function uploadFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setUploadState({ status: "error", message: "Choose an image file." });
      return;
    }

    const formData = new FormData();
    formData.set("file", file);
    setUploadState({ status: "uploading", message: "Uploading image…" });

    try {
      const res = await fetch("/api/storefront/media", { method: "POST", body: formData });
      const url = await parseUploadResponse(res);
      onChange(url);
      setUploadState({ status: "success", message: "Image uploaded and applied." });
    } catch (error) {
      setUploadState({
        status: "error",
        message: error instanceof Error ? error.message : "Unable to upload image.",
      });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <Field
        label="Hero image URL"
        value={value}
        onChange={onChange}
        placeholder="https://..."
        hint="Upload an image, pick from listed lockboxes, or paste https://"
        validate={(v) => !v || isValidHttpsUrl(v)}
      />

      {value && validValue ? (
        <div className="border-razor overflow-hidden bg-black/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Selected hero preview" className="aspect-video w-full object-cover" referrerPolicy="no-referrer" />
        </div>
      ) : null}

      <div
        className="border-razor bg-black/35 p-4 transition-premium hover:border-primary/50"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void uploadFile(event.dataTransfer.files.item(0));
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="font-mono-data text-[10px] uppercase tracking-widest text-on-surface-variant">
              Hero media
            </div>
            <div className="mt-1 text-sm leading-6 text-on-surface-variant">
              Upload a branded hero image or reuse a product preview. JPG, PNG, WebP, or GIF up to 5 MB.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="border-razor min-h-11 bg-primary px-3 py-2 text-xs font-bold text-on-primary hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={() => inputRef.current?.click()}
              disabled={uploadState.status === "uploading"}
            >
              {uploadState.status === "uploading" ? "Uploading…" : "Upload image"}
            </button>
            {value ? (
              <button
                type="button"
                className="border-razor min-h-11 bg-black px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface"
                onClick={() => onChange("")}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) => void uploadFile(event.target.files?.item(0))}
        />

        {uploadState.message ? (
          <div
            className={[
              "mt-3 flex items-center gap-2 text-sm",
              uploadState.status === "error" ? "text-red-300" : "text-on-surface-variant",
            ].join(" ")}
          >
            <AppIcon name={uploadState.status === "error" ? "alert_triangle" : "check_circle"} size={15} />
            <span>{uploadState.message}</span>
          </div>
        ) : null}

        {imageProducts.length === 0 ? (
          <div className="mt-4 text-sm leading-6 text-on-surface-variant">
            No product images yet. Upload one here or add preview images to lockboxes.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {imageProducts.slice(0, 6).map((product) => (
              <button
                key={product.id}
                type="button"
                className="group overflow-hidden border border-white/10 bg-black text-left transition-premium hover:border-primary/60"
                onClick={() => onChange(product.previewUrl)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={product.previewUrl}
                  alt={`${product.title} preview`}
                  className="aspect-[4/3] w-full object-cover opacity-80 transition group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate px-3 py-2 text-xs text-on-surface-variant">{product.title}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
