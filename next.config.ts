import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Ensure export writes /route/index.html so GH Pages can serve nested routes
  // trailingSlash: true,
  // Allow next/image usage in static export by disabling the Image Optimization API
  images: {
    // unoptimized: true,
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'example.com',
    //     port: '',
    //     pathname: '/path/to/images/**',
    //   },
    // ],

  },
  // If you deploy to a repo subpath (username.github.io/repo), add assetPrefix/basePath
  // assetPrefix: '/repo',
  // basePath: '/repo',
};

export default nextConfig;
