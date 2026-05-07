/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Next's internal typecheck step is failing on Windows in this repo with `spawn EPERM`.
  // We run `tsc --noEmit` in the build script instead (see `package.json`).
  typescript: {
    ignoreBuildErrors: true,
  },
  // Pin the root to this app directory so module resolution doesn't jump to the parent folder
  // when Next.js detects a workspace root (multiple lockfiles).
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
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

module.exports = nextConfig;
