'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useInfiniteSearchManga, useGenres } from '@/hooks/useApi';
import { MangaGrid } from '@/components/manga';
import { SearchInput, FilterSelect, GenreFilter, InfiniteScroll } from '@/components/ui';
import { useSearchStore } from '@/store';
import { cn } from '@/lib/utils';

const statusOptions = [
  { value: 'RELEASING', label: 'Ongoing' },
  { value: 'FINISHED', label: 'Completed' },
  { value: 'NOT_YET_RELEASED', label: 'Upcoming' },
  { value: 'HIATUS', label: 'On Hiatus' },
];

const sortOptions = [
  { value: 'POPULARITY_DESC', label: 'Most Popular' },
  { value: 'TRENDING_DESC', label: 'Trending' },
  { value: 'SCORE_DESC', label: 'Highest Rated' },
  { value: 'START_DATE_DESC', label: 'Newest' },
  { value: 'FAVOURITES_DESC', label: 'Most Favourited' },
  { value: 'CHAPTERS_DESC', label: 'Most Chapters' },
];

const yearOptions = Array.from({ length: 30 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { value: year.toString(), label: year.toString() };
});

function SearchLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-dark-400">Loading search...</p>
      </div>
    </div>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: genresData } = useGenres();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    searchParams.get('genre')?.split(',').filter(Boolean) || []
  );
  const [status, setStatus] = useState<string | null>(searchParams.get('status'));
  const [year, setYear] = useState<string | null>(searchParams.get('year'));
  const [sort, setSort] = useState(searchParams.get('sort') || 'POPULARITY_DESC');

  // Build search params object
  const searchOptions = {
    search: searchQuery || undefined,
    genres: selectedGenres.length > 0 ? selectedGenres : undefined,
    status: status || undefined,
    year: year ? parseInt(year) : undefined,
    sort: [sort],
    perPage: 20,
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteSearchManga(searchOptions);

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedGenres.length > 0) params.set('genre', selectedGenres.join(','));
    if (status) params.set('status', status);
    if (year) params.set('year', year);
    if (sort !== 'POPULARITY_DESC') params.set('sort', sort);
    
    const newUrl = params.toString() ? `/search?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedGenres, status, year, sort, router]);

  // Flatten paginated results
  const allManga = data?.pages.flatMap((page) => page.media) || [];
  const totalResults = data?.pages[0]?.pageInfo.total || 0;

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedGenres([]);
    setStatus(null);
    setYear(null);
    setSort('POPULARITY_DESC');
  };

  const hasActiveFilters = searchQuery || selectedGenres.length > 0 || status || year || sort !== 'POPULARITY_DESC';

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-primary-500" />
            Search Manga
          </h1>
          <p className="text-dark-400">
            Discover manga from our extensive library powered by AniList
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by title, author, or description..."
            className="max-w-2xl"
            autoFocus
          />
        </motion.div>

        {/* Filter Toggle (Mobile) */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              showFilters
                ? 'bg-primary-500 text-white'
                : 'bg-dark-800 border border-dark-700 text-dark-300'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'mb-8 p-4 bg-dark-800/50 border border-dark-700 rounded-xl',
            !showFilters && 'hidden md:block'
          )}
        >
          <div className="flex flex-wrap items-center gap-3">
            <GenreFilter
              genres={genresData || []}
              selectedGenres={selectedGenres}
              onChange={setSelectedGenres}
            />
            
            <FilterSelect
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            
            <FilterSelect
              label="Year"
              options={yearOptions}
              value={year}
              onChange={setYear}
            />
            
            <FilterSelect
              label="Sort by"
              options={sortOptions}
              value={sort}
              onChange={(v) => setSort(v || 'POPULARITY_DESC')}
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-3 py-2 text-sm text-dark-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </motion.div>

        {/* Results Count */}
        {!isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-dark-400 mb-6"
          >
            {totalResults > 0
              ? `Found ${totalResults.toLocaleString()} manga`
              : 'No results found'}
          </motion.p>
        )}

        {/* Results Grid */}
        <InfiniteScroll
          onLoadMore={fetchNextPage}
          hasMore={!!hasNextPage}
          isLoading={isFetchingNextPage}
        >
          <MangaGrid
            manga={allManga}
            isLoading={isLoading}
            columns={5}
            emptyMessage="No manga found. Try adjusting your filters."
          />
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
}
