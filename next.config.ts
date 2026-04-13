import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shop.dseclab.io",
      },
    ],
  },
};

export default nextConfig;
