import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack for builds due to issues with node_modules test files
  // Turbopack can still be used for dev with --turbopack flag
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
