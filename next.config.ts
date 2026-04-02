import type { NextConfig } from "next";

// basePath is only set in CI (GitHub Actions) via NEXT_BASE_PATH env var.
// Locally it's empty so the dev server and `npx serve out` work at root.
const basePath = process.env.NEXT_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.nancydrew.me',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
