'use client';

import { Star } from 'lucide-react';
import { useInfiniteSearchManga } from '@/hooks/useApi';
import { MangaGrid } from '@/components/manga';
import { InfiniteScroll } from '@/components/ui';

export default function PopularPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteSearchManga({
    sort: ['POPULARITY_DESC'],
    perPage: 20,
  });

  const allManga = data?.pages.flatMap((page) => page.media) || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Star className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Popular Manga</h1>
            <p className="text-dark-400">Most popular manga of all time</p>
          </div>
        </div>

        <InfiniteScroll
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
        >
          <MangaGrid
            manga={allManga}
            isLoading={isLoading}
            columns={5}
          />
        </InfiniteScroll>
      </div>
    </div>
  );
}
