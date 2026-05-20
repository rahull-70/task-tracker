import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // needed for GIF support
  },
};

export default nextConfig;