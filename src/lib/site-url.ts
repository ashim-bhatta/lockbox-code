const LOCAL_ORIGIN = "http://localhost:3000";

const ORIGIN_ENV_KEYS = [
  "NEXT_PUBLIC_BASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

function normalizeOrigin(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

  try {
    return new URL(withProtocol).origin;
  } catch {
    return null;
  }
}

export function getSiteOrigin() {
  for (const key of ORIGIN_ENV_KEYS) {
    const origin = normalizeOrigin(process.env[key] || "");
    if (origin) return origin;
  }

  return LOCAL_ORIGIN;
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, getSiteOrigin()).toString();
}
