import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Force clean build to pick up i18n and map tile changes
  generateBuildId: async () => "build-" + Date.now(),
};

export default nextConfig;
