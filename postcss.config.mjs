import path from "node:path";
import { fileURLToPath } from "node:url";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const config = {
  // Next.js' PostCSS loader expects plugins to be declared as a map (or string / tuple list),
  // not inline plugin objects/functions.
  plugins: {
    "@tailwindcss/postcss": {
      // Keep Tailwind's base pinned to this app folder to avoid workspace-root CWD issues.
      base: configDir,
    },
  },
};

export default config;
