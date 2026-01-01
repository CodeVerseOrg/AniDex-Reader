import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getTrendingManga,
  getPopularManga,
  getTopRatedManga,
  searchManga,
  getMangaById,
  getGenres,
} from '@/lib/anilist';
import {
  searchMangaDex,
  getChapters,
  getAllChapters,
  getChapterImages,
  getRecentlyUpdated,
  getMangaDexManga,
  getAvailableLanguages,
} from '@/lib/mangadex';
import {
  getChaptersMultiSource,
  getChapterImagesFromSource,
  getMergedChapters,
  findMangaAcrossSources,
} from '@/lib/sources';
import type { AniListMedia, MangaDexChapter, MangaDexChapterImages, MangaSource, SourceChapter } from '@/types';

// AniList Hooks
export function useTrendingManga(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['trending-manga', page, perPage],
    queryFn: () => getTrendingManga(page, perPage),
  });
}

export function usePopularManga(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['popular-manga', page, perPage],
    queryFn: () => getPopularManga(page, perPage),
  });
}

export function useTopRatedManga(page = 1, perPage = 20) {
  return useQuery({
    queryKey: ['top-rated-manga', page, perPage],
    queryFn: () => getTopRatedManga(page, perPage),
  });
}

export function useSearchManga(options: {
  search?: string;
  genres?: string[];
  status?: string;
  year?: number;
  sort?: string[];
  format?: string;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}) {
  const { enabled = true, ...searchOptions } = options;
  
  return useQuery({
    queryKey: ['search-manga', searchOptions],
    queryFn: () => searchManga(searchOptions),
    enabled,
  });
}

export function useInfiniteSearchManga(options: {
  search?: string;
  genres?: string[];
  status?: string;
  year?: number;
  sort?: string[];
  format?: string;
  perPage?: number;
}) {
  return useInfiniteQuery({
    queryKey: ['infinite-search-manga', options],
    queryFn: ({ pageParam = 1 }) =>
      searchManga({ ...options, page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasNextPage
        ? lastPage.pageInfo.currentPage + 1
        : undefined,
    initialPageParam: 1,
  });
}

export function useMangaById(id: number | null) {
  return useQuery({
    queryKey: ['manga', id],
    queryFn: () => getMangaById(id!),
    enabled: !!id,
  });
}

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}

// MangaDex Hooks
export function useMangaDexSearch(title: string, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-search', title],
    queryFn: () => searchMangaDex(title),
    enabled: enabled && !!title,
  });
}

export function useMangaDexManga(id: string | null) {
  return useQuery({
    queryKey: ['mangadex-manga', id],
    queryFn: () => getMangaDexManga(id!),
    enabled: !!id,
  });
}

export function useChapters(
  mangaId: string | null,
  options?: {
    language?: string;
    limit?: number;
    offset?: number;
    order?: 'asc' | 'desc';
  }
) {
  return useQuery({
    queryKey: ['chapters', mangaId, options],
    queryFn: () => getChapters(mangaId!, options),
    enabled: !!mangaId,
  });
}

export function useAllChapters(mangaId: string | null, language = 'en') {
  return useQuery({
    queryKey: ['all-chapters', mangaId, language],
    queryFn: () => getAllChapters(mangaId!, language),
    enabled: !!mangaId,
  });
}

export function useChapterImages(chapterId: string | null) {
  return useQuery({
    queryKey: ['chapter-images', chapterId],
    queryFn: () => getChapterImages(chapterId!),
    enabled: !!chapterId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRecentlyUpdated(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ['recently-updated', limit, offset],
    queryFn: () => getRecentlyUpdated(limit, offset),
  });
}

export function useAvailableLanguages(mangaId: string | null) {
  return useQuery({
    queryKey: ['available-languages', mangaId],
    queryFn: () => getAvailableLanguages(mangaId!),
    enabled: !!mangaId,
  });
}

// Combined hook to get manga data from both sources
export function useMangaWithChapters(anilistId: number | null) {
  const anilistQuery = useMangaById(anilistId);
  
  // Search MangaDex using the AniList title
  const mangaDexSearchQuery = useMangaDexSearch(
    anilistQuery.data?.title.romaji || '',
    !!anilistQuery.data
  );
  
  // Get MangaDex ID from search results (first match)
  const mangaDexId = mangaDexSearchQuery.data?.[0]?.id || null;
  
  // Get chapters using MangaDex ID
  const chaptersQuery = useAllChapters(mangaDexId);
  
  return {
    manga: anilistQuery.data,
    mangaDexId,
    mangaDexData: mangaDexSearchQuery.data?.[0],
    chapters: chaptersQuery.data || [],
    isLoading:
      anilistQuery.isLoading ||
      mangaDexSearchQuery.isLoading ||
      chaptersQuery.isLoading,
    isError:
      anilistQuery.isError ||
      mangaDexSearchQuery.isError ||
      chaptersQuery.isError,
    error: anilistQuery.error || mangaDexSearchQuery.error || chaptersQuery.error,
  };
}

// Hook for chapter navigation
export function useChapterNavigation(
  chapters: MangaDexChapter[],
  currentChapterId: string | null
) {
  const currentIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  
  return {
    currentChapter: chapters[currentIndex] || null,
    prevChapter: currentIndex > 0 ? chapters[currentIndex - 1] : null,
    nextChapter:
      currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
    currentIndex,
    totalChapters: chapters.length,
  };
}

// Multi-Source Hooks
export function useMultiSourceChapters(
  anilistId: number | null,
  title: string | null,
  language: string = 'en'
) {
  return useQuery({
    queryKey: ['multi-source-chapters', anilistId, title, language],
    queryFn: () => getChaptersMultiSource(anilistId!, title!, language),
    enabled: !!anilistId && !!title,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMergedChapters(
  anilistId: number | null,
  title: string | null,
  language: string = 'en'
) {
  return useQuery({
    queryKey: ['merged-chapters', anilistId, title, language],
    queryFn: () => getMergedChapters(anilistId!, title!, language),
    enabled: !!anilistId && !!title,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMultiSourceImages(
  source: MangaSource | null,
  chapterId: string | null
) {
  return useQuery({
    queryKey: ['multi-source-images', source, chapterId],
    queryFn: () => getChapterImagesFromSource(source!, chapterId!),
    enabled: !!source && !!chapterId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for multi-source chapter navigation
export function useSourceChapterNavigation(
  chapters: SourceChapter[],
  currentChapterId: string | null
) {
  const currentIndex = chapters.findIndex((ch) => ch.id === currentChapterId);
  
  return {
    currentChapter: chapters[currentIndex] || null,
    prevChapter: currentIndex > 0 ? chapters[currentIndex - 1] : null,
    nextChapter:
      currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null,
    currentIndex,
    totalChapters: chapters.length,
  };
}

// Combined hook with multi-source fallback
export function useMangaWithMultiSourceChapters(
  anilistId: number | null,
  language: string = 'en'
) {
  const anilistQuery = useMangaById(anilistId);
  const title = anilistQuery.data?.title.romaji || null;
  
  // Get chapters from multiple sources with fallback
  const chaptersQuery = useMultiSourceChapters(anilistId, title, language);
  
  return {
    manga: anilistQuery.data,
    source: chaptersQuery.data?.source || null,
    sourceId: chaptersQuery.data?.sourceId || null,
    chapters: chaptersQuery.data?.chapters || [],
    languages: chaptersQuery.data?.languages || ['en'],
    isLoading: anilistQuery.isLoading || chaptersQuery.isLoading,
    isError: anilistQuery.isError || chaptersQuery.isError,
    error: anilistQuery.error || chaptersQuery.error,
  };
}
