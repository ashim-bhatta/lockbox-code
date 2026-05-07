import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getPublicStorefrontByHandle } from "@/server/services/storefront-public-service";

/**
 * GET /api/storefront/public/[handle]
 * Public endpoint: returns the currently published storefront config + listed products.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ handle: string }> }) {
  try {
    const ip = _req.headers.get("x-forwarded-for") || "unknown";
    await enforceRateLimit({ key: `storefront_public:${ip}`, limit: 120, windowSeconds: 60 });

    const { handle: rawHandle } = await params;
    const storefront = await getPublicStorefrontByHandle(rawHandle);
    if (!storefront) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({
      profile: storefront.profile,
      published: storefront.published,
      products: storefront.products,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 }
    );
  }
}
