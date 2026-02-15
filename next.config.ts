import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pirhstdkwhzrrzpczqvt.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.thespacedevs.com",
      },
      {
        protocol: "https",
        hostname: "spacelaunchnow-prod-east.nyc3.digitaloceanspaces.com",
      },
    ],
  },
};

export default nextConfig;
