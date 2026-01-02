/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'meo.comick.pictures',
      },
      {
        protocol: 'https',
        hostname: 'meo3.comick.pictures',
      },
      {
        protocol: 'https',
        hostname: '*.comick.pictures',
      },
      // MangaPlus image domains
      {
        protocol: 'https',
        hostname: 'jumpg-assets.tokyo-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'mangaplus.shueisha.co.jp',
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
