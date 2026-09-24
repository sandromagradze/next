import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn3.ipn.ge",
      },
      {
        protocol: "https",
        hostname: "cdn2.ipn.ge",
      },
      {
        protocol: "https",
        hostname: "dev.ipn.ge",
      },
      {
        protocol: "https",
        hostname: "sportall.ge",
      },
      {
        protocol: "https",
        hostname: "www.bpn.ge",
      },
      {
        protocol: "https",
        hostname: "bpn.ge",
      },
    ],
  },
};

export default nextConfig;
