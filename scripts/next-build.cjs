const { readdirSync } = require("node:fs");
const path = require("node:path");

process.env.NEXT_PRIVATE_WORKER_THREADS = "false";

// Prevent schema drift: `paywall-zip/supabase/` is deprecated. Keep migrations only in repo-root `supabase/migrations/`.
try {
  const deprecatedMigrationsDir = path.join(__dirname, "..", "supabase", "migrations");
  const entries = readdirSync(deprecatedMigrationsDir, { withFileTypes: true });
  const hasSql = entries.some((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"));
  if (hasSql) {
    throw new Error(
      "Found SQL migrations in `paywall-zip/supabase/migrations/` (deprecated). Move them to repo-root `supabase/migrations/`."
    );
  }
} catch (error) {
  // If the folder doesn't exist, ignore; any other error should fail the build.
  if (error && error.code !== "ENOENT") throw error;
}

// Run `next build` without using `node -e` (avoids invalid execArgv propagation to workers).
process.argv = ["node", "next", "build"];

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("next/dist/bin/next");
