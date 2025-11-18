import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Set workspace root to parent directory (monorepo root)
    root: path.resolve(__dirname, ".."),
  },
  // Disable turbopack for production builds (use webpack instead)
  // Turbopack can still be used for dev with --turbopack flag
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
