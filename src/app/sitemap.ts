import type { MetadataRoute } from "next";
import { getAbsoluteUrl } from "@/lib/site-url";
import { getPublicStorefrontSitemapRows } from "@/server/services/storefront-public-service";

export const dynamic = "force-dynamic";

const STATIC_ROUTES = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/security", priority: 0.6, changeFrequency: "monthly" },
  { path: "/support", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const storefrontRows = await getPublicStorefrontSitemapRows();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: getAbsoluteUrl(route.path),
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    })),
    ...storefrontRows.map((row) => ({
      url: getAbsoluteUrl(`/s/${row.handle}`),
      lastModified: row.lastModified ? new Date(row.lastModified) : undefined,
      priority: 0.7,
      changeFrequency: "weekly" as const,
    })),
  ];
}
