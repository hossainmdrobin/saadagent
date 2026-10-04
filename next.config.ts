import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: [
    // deepagents reaches optional Node-only peers (for example langsmith's `ws`)
    // through dynamic import(), which the server bundler cannot resolve.
    "deepagents",
  ],
};

export default nextConfig;
