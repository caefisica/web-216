import type { NextConfig } from "next";
import createMDX from "@next/mdx";

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

const withMDX = createMDX({});

export default withMDX(nextConfig);
