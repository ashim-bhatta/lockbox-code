import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the app root from this config file's location, not from `process.cwd()`,
// because Next.js may change the working directory when it detects a workspace root.
const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Next's internal typecheck step is failing on Windows in this repo with `spawn EPERM`.
  // We run `tsc --noEmit` in the build script instead (see `package.json`).
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // This repo sits inside a parent folder that also contains a lockfile.
    // Explicitly pin Turbopack’s root to this Next.js app to avoid incorrect workspace inference.
    root: configDir,
  },
  // Ensure output tracing uses the same root (Next.js requires these to match).
  outputFileTracingRoot: configDir,
  images: {
    // Security: avoid allowing Next/Image to fetch arbitrary remote URLs (SSRF vector).
    // For user-provided URLs (avatars, previews), use native <img> elements instead.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
