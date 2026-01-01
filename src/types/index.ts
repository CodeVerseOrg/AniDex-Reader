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

// MangaDex Types
export interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    altTitles: Record<string, string>[];
    description: Record<string, string>;
    isLocked: boolean;
    links: Record<string, string> | null;
    originalLanguage: string;
    lastVolume: string | null;
    lastChapter: string | null;
    publicationDemographic: string | null;
    status: string;
    year: number | null;
    contentRating: string;
    tags: MangaDexTag[];
    state: string;
    createdAt: string;
    updatedAt: string;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexTag {
  id: string;
  type: 'tag';
  attributes: {
    name: Record<string, string>;
    group: string;
  };
}

export interface MangaDexRelationship {
  id: string;
  type: string;
  attributes?: Record<string, unknown>;
}

export interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
  };
  relationships: MangaDexRelationship[];
}

export interface MangaDexChapterImages {
  result: string;
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

export interface MangaDexResponse<T> {
  result: string;
  response: string;
  data: T;
  limit?: number;
  offset?: number;
  total?: number;
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
  currentChapter: MangaDexChapter;
  prevChapter: MangaDexChapter | null;
  nextChapter: MangaDexChapter | null;
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

// Unified Manga Type (combines AniList + MangaDex data)
export interface UnifiedManga {
  anilistId: number;
  mangadexId?: string;
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
export type MangaSource = 'mangadex' | 'comick' | 'mangaplus' | 'mangasee';

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

// Comick.fun Types
export interface ComickManga {
  id: number;
  hid: string;
  slug: string;
  title: string;
  country: string;
  status: number;
  links: Record<string, string>;
  last_chapter: number | null;
  chapter_count: number;
  demographic: number | null;
  genres: { id: number; name: string; slug: string }[];
  md_covers: { b2key: string; w: number; h: number }[];
}

export interface ComickChapter {
  id: number;
  hid: string;
  chap: string | null;
  vol: string | null;
  title: string | null;
  lang: string;
  created_at: string;
  updated_at: string;
  up_count: number;
  group_name: string[] | null;
  md_groups?: { title: string }[];
}

export interface ComickChapterImages {
  chapter: {
    id: number;
    chap: string;
    title: string | null;
    vol: string | null;
    lang: string;
    md_images: { b2key: string; w: number; h: number; name: string }[];
  };
}

// MangaSee Types  
export interface MangaSeeChapter {
  Chapter: string;
  Type: string;
  Date: string;
  ChapterName: string | null;
}