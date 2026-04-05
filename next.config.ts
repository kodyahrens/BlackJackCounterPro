import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  trailingSlash: true,

  // On GitHub Pages the site lives at /BlackJackCounterPro/
  // Locally it lives at /
  basePath: isProd ? '/BlackJackCounterPro' : '',
  assetPrefix: isProd ? '/BlackJackCounterPro/' : '',

  // Required for static image export
  images: { unoptimized: true },

  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  turbopack: {},
};

export default nextConfig;
