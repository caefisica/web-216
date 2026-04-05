import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/app/layout.tsx", "src/app/page.tsx", "src/lib/db/sync.ts", "src/lib/db/schema/index.ts"],
  project: ["src/**/*.{ts,tsx}"],
  ignore: ["src/db/migrations/**/*"],
  ignoreDependencies: [
    "postcss-load-config",
    "tailwindcss",
    "autoprefixer",
    "postcss",
    "@cloudflare/next-on-pages",
  ],
  ignoreBinaries: ["wrangler"],
};

export default config;
