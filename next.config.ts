import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Partial Prerendering everywhere: each route ships a static shell (chrome
  // plus skeletons) from the CDN, and the parts that need the backend or the
  // customer's cookie stream into it. `use cache` is what opts data into that
  // shell — see lib/api/server/catalog.ts.
  cacheComponents: true,
  // A <Link> prefetches its destination's shared App Shell rather than a
  // per-link render, so a rail of twenty store cards costs one prefetch.
  partialPrefetching: true,
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
