import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fvtgziymuvywlhytbzon.supabase.co",
      },
    ],
  },
  pageExtensions: ["mdx", "ts", "tsx"],
  experimental: {
    mdxRs: true,
    viewTransition: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

if (process.env.NODE_ENV === "development") {
  setupDevPlatform();
}

const withMDX = createMDX({});

export default withMDX(nextConfig);
