'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, BookOpen, Eye } from 'lucide-react';
import type { AniListMedia } from '@/types';
import { getDisplayTitle, formatStatus } from '@/lib/anilist';
import { cn, formatNumber, truncateText } from '@/lib/utils';

interface MangaCardProps {
  manga: AniListMedia;
  index?: number;
  variant?: 'default' | 'compact' | 'wide';
}

export function MangaCard({ manga, index = 0, variant = 'default' }: MangaCardProps) {
  const title = getDisplayTitle(manga.title);
  const status = formatStatus(manga.status);

  if (variant === 'compact') {
    return (
      <Link href={`/manga/${manga.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group flex gap-3 p-2 rounded-lg hover:bg-dark-800/50 transition-colors"
        >
          <div className="relative w-12 h-16 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={manga.coverImage.large}
              alt={title}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-xs text-dark-400 mt-0.5">{status}</p>
            {manga.averageScore && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-dark-300">{manga.averageScore}%</span>
              </div>
            )}
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'wide') {
    return (
      <Link href={`/manga/${manga.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group flex gap-4 p-3 rounded-xl bg-dark-800/50 hover:bg-dark-800 transition-all border border-dark-700/50 hover:border-dark-600"
        >
          <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={manga.coverImage.large}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="96px"
            />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <h3 className="text-base font-semibold text-white line-clamp-1 group-hover:text-primary-400 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-dark-400 mt-1">{status}</p>
            {manga.description && (
              <p className="text-xs text-dark-400 mt-2 line-clamp-2">
                {truncateText(manga.description.replace(/<[^>]*>/g, ''), 150)}
              </p>
            )}
            <div className="flex items-center gap-4 mt-3">
              {manga.averageScore && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm text-dark-300">{manga.averageScore}%</span>
                </div>
              )}
              {manga.chapters && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-dark-400" />
                  <span className="text-sm text-dark-300">{manga.chapters} chapters</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4 text-dark-400" />
                <span className="text-sm text-dark-300">{formatNumber(manga.popularity)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default card
  return (
    <Link href={`/manga/${manga.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -8 }}
        className="group relative"
      >
        {/* Card Container */}
        <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-dark-800 shadow-lg group-hover:shadow-xl group-hover:shadow-primary-500/20 transition-all duration-300">
          {/* Cover Image */}
          <Image
            src={manga.coverImage.extraLarge || manga.coverImage.large}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

          {/* Glow Effect on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-primary-500/20 to-transparent" />

          {/* Score Badge */}
          {manga.averageScore && (
            <div
              className={cn(
                'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-sm',
                manga.averageScore >= 80
                  ? 'bg-emerald-500/90 text-white'
                  : manga.averageScore >= 60
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              )}
            >
              <Star className="w-3 h-3 fill-current" />
              {manga.averageScore}%
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-sm',
                manga.status === 'RELEASING'
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                  : manga.status === 'FINISHED'
                  ? 'bg-cyan-500/90 text-white'
                  : 'bg-dark-600/90 text-dark-200'
              )}
            >
              {status}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold line-clamp-2 text-sm leading-tight group-hover:text-primary-300 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {manga.genres.slice(0, 2).map((genre) => (
                <span key={genre} className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs text-white/80">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Border Glow Effect */}
          <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-primary-500/50 transition-colors duration-300" />
        </div>
      </motion.div>
    </Link>
  );
}

// Skeleton loader for MangaCard
export function MangaCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' | 'wide' }) {
  if (variant === 'compact') {
    return (
      <div className="flex gap-3 p-2 animate-pulse">
        <div className="w-12 h-16 bg-dark-700 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-dark-700 rounded w-3/4" />
          <div className="h-3 bg-dark-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === 'wide') {
    return (
      <div className="flex gap-4 p-3 rounded-xl bg-dark-800/50 border border-dark-700/50 animate-pulse">
        <div className="w-24 h-32 bg-dark-700 rounded-lg" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-5 bg-dark-700 rounded w-3/4" />
          <div className="h-4 bg-dark-700 rounded w-1/3" />
          <div className="h-3 bg-dark-700 rounded w-full" />
          <div className="h-3 bg-dark-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-dark-800">
        <div className="h-full w-full bg-gradient-to-t from-dark-700 to-dark-800" />
      </div>
    </div>
  );
}
