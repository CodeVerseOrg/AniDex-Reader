'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useTrendingManga, usePopularManga, useTopRatedManga, useGenres } from '@/hooks/useApi';
import { MangaCarousel, MangaGrid } from '@/components/manga';
import { Skeleton } from '@/components/ui';

const popularGenres = [
  'Action',
  'Romance',
  'Fantasy',
  'Comedy',
  'Drama',
  'Adventure',
  'Slice of Life',
  'Supernatural',
];

export default function HomePage() {
  const { data: trendingData, isLoading: trendingLoading } = useTrendingManga(1, 10);
  const { data: popularData, isLoading: popularLoading } = usePopularManga(1, 15);
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRatedManga(1, 15);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to{' '}
              <span className="text-primary-500">AniDex</span>{' '}
              Reader
            </h1>
            <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Your gateway to thousands of manga titles. Read for free with a clean,
              modern interface powered by MangaDex.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/search"
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Explore Manga
              </Link>
              <Link
                href="/trending"
                className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 border border-dark-700"
              >
                <TrendingUp className="w-5 h-5" />
                Trending Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Genre Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold text-white mb-4">Browse by Genre</h2>
          <div className="flex flex-wrap gap-2">
            {popularGenres.map((genre) => (
              <Link
                key={genre}
                href={`/search?genre=${genre}`}
                className="px-4 py-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-primary-500 rounded-full text-sm text-dark-200 hover:text-primary-400 transition-all"
              >
                {genre}
              </Link>
            ))}
            <Link
              href="/search"
              className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/50 rounded-full text-sm text-primary-400 transition-all flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        </div>
        <MangaCarousel
          manga={trendingData?.media || []}
          isLoading={trendingLoading}
          viewAllHref="/trending"
        />
      </section>

      {/* Popular Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Star className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Most Popular</h2>
        </div>
        <MangaGrid
          manga={popularData?.media || []}
          isLoading={popularLoading}
          viewAllHref="/popular"
          columns={5}
        />
      </section>

      {/* Top Rated Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-white">Top Rated</h2>
        </div>
        <MangaGrid
          manga={topRatedData?.media || []}
          isLoading={topRatedLoading}
          viewAllHref="/top-rated"
          columns={5}
        />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Why Choose AniDex Reader?
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto">
            Experience manga reading like never before with our feature-rich reader
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: '📖',
              title: 'Modern Reader',
              description: 'Vertical & horizontal reading modes with smooth navigation',
            },
            {
              icon: '🎨',
              title: 'Beautiful UI',
              description: 'Clean, MangaDex-inspired interface with dark mode support',
            },
            {
              icon: '⚡',
              title: 'Fast Loading',
              description: 'Optimized image loading with smart preloading',
            },
            {
              icon: '📱',
              title: 'Mobile First',
              description: 'Responsive design that works on any device',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-primary-500/50 transition-colors"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-dark-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
