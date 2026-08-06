import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent folder holds the mobile app and its lockfile; without this,
  // Turbopack walks up and warns about a lockfile outside this repository.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "4071-storage.thepurplebox.io",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
