'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { AniListMedia } from '@/types';
import { MangaCard, MangaCardSkeleton } from './MangaCard';
import { cn } from '@/lib/utils';

interface MangaGridProps {
  title?: string;
  manga: AniListMedia[];
  isLoading?: boolean;
  viewAllHref?: string;
  columns?: number;
  emptyMessage?: string;
  className?: string;
}

export function MangaGrid({
  title,
  manga,
  isLoading = false,
  viewAllHref,
  columns = 5,
  emptyMessage = 'No manga found',
  className,
}: MangaGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  };

  return (
    <section className={cn('space-y-4', className)}>
      {/* Header */}
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between">
          {title && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl md:text-2xl font-bold text-white"
            >
              {title}
            </motion.h2>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className={cn('grid gap-4', gridCols[columns as keyof typeof gridCols])}>
          {Array.from({ length: 10 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </div>
      ) : manga.length > 0 ? (
        <div className={cn('grid gap-4', gridCols[columns as keyof typeof gridCols])}>
          {manga.map((m, i) => (
            <MangaCard key={m.id} manga={m} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-dark-400">{emptyMessage}</p>
        </div>
      )}
    </section>
  );
}

// Horizontal scroll variant
interface MangaCarouselProps {
  title?: string;
  manga: AniListMedia[];
  isLoading?: boolean;
  viewAllHref?: string;
  className?: string;
}

export function MangaCarousel({
  title,
  manga,
  isLoading = false,
  viewAllHref,
  className,
}: MangaCarouselProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {/* Header */}
      {(title || viewAllHref) && (
        <div className="flex items-center justify-between px-4 md:px-0">
          {title && (
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl md:text-2xl font-bold text-white"
            >
              {title}
            </motion.h2>
          )}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex items-center gap-1 text-primary-500 hover:text-primary-400 transition-colors text-sm font-medium"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-0 scrollbar-hide snap-x snap-mandatory">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 md:w-44 snap-start">
                  <MangaCardSkeleton />
                </div>
              ))
            : manga.map((m, i) => (
                <div key={m.id} className="flex-shrink-0 w-36 md:w-44 snap-start">
                  <MangaCard manga={m} index={i} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
