import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  resolve: {
    alias: {
      canvas: false,
    },
  },
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: './empty-module.ts',
      },
    },
  }
};

export default nextConfig;
