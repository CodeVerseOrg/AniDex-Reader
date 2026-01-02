// AniList Types
export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
  format: 'MANGA' | 'ONE_SHOT' | 'NOVEL';
  chapters: number | null;
  volumes: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  favourites: number;
  trending: number;
  genres: string[];
  tags: {
    id: number;
    name: string;
    rank: number;
  }[];
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  endDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  staff: {
    edges: {
      role: string;
      node: {
        id: number;
        name: {
          full: string;
        };
      };
    }[];
  };
  isAdult: boolean;
  countryOfOrigin: string;
}

export interface AniListPageInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage: number;
}

export interface AniListResponse {
  Page: {
    pageInfo: AniListPageInfo;
    media: AniListMedia[];
  };
}

// Reader Types
export type ReaderMode = 'vertical' | 'horizontal' | 'webtoon';
export type ReaderTheme = 'light' | 'dark' | 'sepia';

export interface ReaderSettings {
  mode: ReaderMode;
  theme: ReaderTheme;
  zoom: number;
  fitWidth: boolean;
  preloadPages: number;
  showProgress: boolean;
}

export interface ChapterNavigation {
  currentChapter: SourceChapter;
  prevChapter: SourceChapter | null;
  nextChapter: SourceChapter | null;
}

// UI Types
export interface SearchFilters {
  query: string;
  genres: string[];
  status: string | null;
  year: number | null;
  sort: string;
  format: string | null;
}

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  hasNextPage: boolean;
}

// Unified Manga Type (combines AniList + Consumet data)
export interface UnifiedManga {
  anilistId: number;
  consumetId?: string;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  description: string | null;
  coverImage: string;
  bannerImage: string | null;
  status: string;
  genres: string[];
  tags: string[];
  rating: number | null;
  popularity: number;
  chapters: number | null;
  volumes: number | null;
  startYear: number | null;
  authors: string[];
  isAdult: boolean;
}
// Multi-Source Types
export type MangaSource = 'consumet';

export interface SourceChapter {
  id: string;
  source: MangaSource;
  chapter: string | null;
  volume: string | null;
  title: string | null;
  language: string;
  pages: number;
  publishedAt: string;
  scanlationGroup: string | null;
  externalUrl: string | null;
}

export interface SourceChapterImages {
  source: MangaSource;
  images: string[];
  baseUrl?: string;
}

// MangaSee Types  
export interface MangaSeeChapter {
  Chapter: string;
  Type: string;
  Date: string;
  ChapterName: string | null;
}