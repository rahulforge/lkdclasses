import type { NextConfig } from "next";

const nextConfig: NextConfig & {
  eslint?: { ignoreDuringBuilds?: boolean };
  typescript?: { ignoreBuildErrors?: boolean };
} = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
