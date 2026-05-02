import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Export static HTML using Next's static export feature.
  // Note: API routes and server-only features will not be included in the exported
  // static files. Host server routes externally or remove them for a full static build.
  output: "export",
};

export default nextConfig;
