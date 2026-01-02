'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp,
  Star,
  Clock,
  Sparkles,
  ChevronRight,
  Zap,
  Smartphone,
  Palette,
  BookOpen,
} from 'lucide-react';
import { useTrendingManga, usePopularManga, useTopRatedManga, useGenres } from '@/hooks/useApi';
import { MangaCarousel, MangaGrid } from '@/components/manga';
import { Skeleton } from '@/components/ui';

const popularGenres = [
  { name: 'Action', color: 'from-red-500 to-orange-500' },
  { name: 'Romance', color: 'from-pink-500 to-rose-500' },
  { name: 'Fantasy', color: 'from-purple-500 to-violet-500' },
  { name: 'Comedy', color: 'from-yellow-500 to-amber-500' },
  { name: 'Drama', color: 'from-blue-500 to-cyan-500' },
  { name: 'Adventure', color: 'from-green-500 to-emerald-500' },
  { name: 'Slice of Life', color: 'from-teal-500 to-cyan-500' },
  { name: 'Supernatural', color: 'from-indigo-500 to-purple-500' },
];

export default function HomePage() {
  const { data: trendingData, isLoading: trendingLoading } = useTrendingManga(1, 10);
  const { data: popularData, isLoading: popularLoading } = usePopularManga(1, 15);
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRatedManga(1, 15);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary-500/20 via-transparent to-transparent animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-pink-500/15 via-transparent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Your Ultimate Manga Destination</span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Read Manga with</span>
              <br />
              <span className="gradient-text">AniDex Reader</span>
            </h1>
            
            <p className="text-dark-300 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Discover thousands of manga titles with a beautiful, modern interface.
              Free reading, no ads, just pure manga enjoyment.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/search"
                className="group px-8 py-4 bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-400 hover:to-pink-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                Start Reading
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/trending"
                className="px-8 py-4 bg-dark-800/80 hover:bg-dark-700 text-white rounded-xl font-semibold transition-all border border-dark-600 hover:border-primary-500/50 flex items-center gap-2 backdrop-blur-sm"
              >
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Trending Now
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Genre Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Browse by Genre</h2>
            <Link
              href="/search"
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {popularGenres.map((genre, i) => (
              <motion.div
                key={genre.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
              >
                <Link
                  href={`/search?genre=${genre.name}`}
                  className={`block p-4 rounded-xl bg-gradient-to-br ${genre.color} opacity-80 hover:opacity-100 transition-all hover:scale-105 hover:shadow-lg`}
                >
                  <span className="text-white font-semibold text-sm md:text-base">{genre.name}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          </div>
          <Link href="/trending" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <MangaCarousel
          manga={trendingData?.media || []}
          isLoading={trendingLoading}
          viewAllHref="/trending"
        />
      </section>

      {/* Popular Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Most Popular</h2>
          </div>
          <Link href="/popular" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <MangaGrid
          manga={popularData?.media || []}
          isLoading={popularLoading}
          viewAllHref="/popular"
          columns={5}
        />
      </section>

      {/* Top Rated Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Top Rated</h2>
          </div>
          <Link href="/top-rated" className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1 transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <MangaGrid
          manga={topRatedData?.media || []}
          isLoading={topRatedLoading}
          viewAllHref="/top-rated"
          columns={5}
        />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why Choose <span className="gradient-text">AniDex Reader</span>?
          </h2>
          <p className="text-dark-400 max-w-2xl mx-auto text-lg">
            Experience manga reading like never before with our feature-rich platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: BookOpen,
              title: 'Modern Reader',
              description: 'Vertical & horizontal reading modes with smooth page navigation',
              gradient: 'from-violet-500 to-purple-500',
            },
            {
              icon: Palette,
              title: 'Beautiful UI',
              description: 'Clean, modern interface designed for optimal reading experience',
              gradient: 'from-pink-500 to-rose-500',
            },
            {
              icon: Zap,
              title: 'Fast Loading',
              description: 'Optimized image loading with intelligent preloading',
              gradient: 'from-cyan-500 to-blue-500',
            },
            {
              icon: Smartphone,
              title: 'Mobile First',
              description: 'Responsive design that works beautifully on any device',
              gradient: 'from-emerald-500 to-green-500',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 bg-dark-800/50 border border-dark-700 rounded-2xl hover:border-primary-500/50 transition-all hover:shadow-lg hover:shadow-primary-500/10 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-dark-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500/20 via-pink-500/10 to-cyan-500/20 border border-primary-500/20 p-12 text-center"
        >
          <div className="absolute inset-0 bg-dark-900/50 backdrop-blur-sm" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Reading?
            </h2>
            <p className="text-dark-300 text-lg max-w-xl mx-auto mb-8">
              Join thousands of manga enthusiasts. No account required, start reading instantly.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-400 hover:to-pink-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Explore Library
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
