/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      // External image domains
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
      },
      {
        protocol: 'https',
        hostname: '*.mangadex.network',
      },
      {
        protocol: 'https',
        hostname: 'mangadex.org',
      },
    ],
    // Use unoptimized for external images from CDNs
    unoptimized: true,
  },
  // Compress output
  compress: true,
  // Production optimizations
  poweredByHeader: false,
  // Generate standalone output for better Vercel performance
  output: 'standalone',
  // Experimental features
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
