import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRequestUser } from "@/server/services/auth-service";

const BUCKET = "storefront-media";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
} as const;

function getImageExtension(type: string) {
  return MIME_EXTENSIONS[type as keyof typeof MIME_EXTENSIONS] || null;
}

function hasValidImageSignature(bytes: Buffer, type: string) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (type === "image/gif") return bytes.slice(0, 4).toString("ascii") === "GIF8";
  if (type === "image/webp") {
    return bytes.slice(0, 4).toString("ascii") === "RIFF" && bytes.slice(8, 12).toString("ascii") === "WEBP";
  }
  return false;
}

async function ensureMediaBucket() {
  const supabase = getSupabaseAdmin();
  const { error: bucketError } = await supabase.storage.getBucket(BUCKET);

  if (!bucketError) return supabase;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: Object.keys(MIME_EXTENSIONS),
  });

  if (createError && !/already exists/i.test(createError.message)) {
    throw new Error(createError.message || "Unable to initialize storefront media storage.");
  }

  return supabase;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getRequestUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await enforceRateLimit({ key: `storefront_media:${user.id}`, limit: 20, windowSeconds: 60 });

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    const extension = getImageExtension(file.type);
    if (!extension) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or GIF image." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Image must be smaller than 5 MB." }, { status: 413 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasValidImageSignature(bytes, file.type)) {
      return NextResponse.json({ error: "The selected file does not look like a valid image." }, { status: 400 });
    }

    const supabase = await ensureMediaBucket();
    const objectPath = `${user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message || "Unable to upload image." }, { status: 500 });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    return NextResponse.json({ url: data.publicUrl, path: objectPath });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}
