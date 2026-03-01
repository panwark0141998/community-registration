import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["ute-proboycott-breann.ngrok-free.dev", "localhost:3000"],
    },
  },
};

export default nextConfig;
