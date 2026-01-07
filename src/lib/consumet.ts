// Consumet API Client
// API: https://apiconsumetorg-tan.vercel.app

const CONSUMET_API_URL = 'https://apiconsumetorg-tan.vercel.app';
const ANILIST_MANGA_API = `${CONSUMET_API_URL}/meta/anilist-manga`;

// Types for Consumet API responses
export interface ConsumetMangaSearchResult {
  id: string;
  malId: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
    userPreferred: string;
  };
  status: string;
  image: string;
  imageHash: string;
  cover: string | null;
  coverHash: string;
  popularity: number;
  description: string | null;
  rating: number | null;
  genres: string[];
  color: string | null;
  totalChapters: number | null;
  volumes: number | null;
  type: string;
  releaseDate: number | null;
}

export interface ConsumetSearchResponse {
  currentPage: number;
  hasNextPage: boolean;
  results: ConsumetMangaSearchResult[];
}

export interface ConsumetChapter {
  id: string;
  title: string | null;
  chapterNumber: string;
  volumeNumber: string | null;
  pages: number;
}

export interface ConsumetMangaRecommendation {
  id: string;
  malId: number | null;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
    userPreferred: string;
  };
  status: string;
  chapters: number | null;
  image: string;
  imageHash: string;
  cover: string | null;
  coverHash: string;
  rating: number | null;
  type: string;
}

export interface ConsumetMangaInfo {
  id: string;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  malId: number | null;
  image: string;
  imageHash: string;
  popularity: number;
  color: string | null;
  cover: string | null;
  coverHash: string;
  description: string | null;
  status: string;
  releaseDate: number | null;
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
  rating: number | null;
  genres: string[];
  season: string | null;
  studios: string[];
  type: string;
  recommendations: ConsumetMangaRecommendation[];
  chapters: ConsumetChapter[];
}

export interface ConsumetChapterPage {
  img: string;
  page: number;
}

// Search manga using Consumet API
export async function searchMangaConsumet(query: string, page: number = 1): Promise<ConsumetSearchResponse> {
  try {
    const response = await fetch(`${ANILIST_MANGA_API}/${encodeURIComponent(query)}?page=${page}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Consumet API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching manga via Consumet:', error);
    return {
      currentPage: page,
      hasNextPage: false,
      results: [],
    };
  }
}

// Get manga info with chapters from Consumet API
export async function getMangaInfoConsumet(id: string | number): Promise<ConsumetMangaInfo | null> {
  try {
    const response = await fetch(`${ANILIST_MANGA_API}/info/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Consumet API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching manga info via Consumet:', error);
    return null;
  }
}

// Get chapter pages/images from Consumet API
export async function getChapterPagesConsumet(chapterId: string): Promise<ConsumetChapterPage[]> {
  try {
    const response = await fetch(`${ANILIST_MANGA_API}/read?chapterId=${encodeURIComponent(chapterId)}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Consumet API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter pages via Consumet:', error);
    return [];
  }
}

// Convert Consumet chapter to SourceChapter format
export function convertConsumetChapter(chapter: ConsumetChapter): {
  id: string;
  source: 'consumet';
  chapter: string | null;
  volume: string | null;
  title: string | null;
  language: string;
  pages: number;
  publishedAt: string;
  scanlationGroup: string | null;
  externalUrl: string | null;
} {
  return {
    id: chapter.id,
    source: 'consumet',
    chapter: chapter.chapterNumber,
    volume: chapter.volumeNumber,
    title: chapter.title,
    language: 'en',
    pages: chapter.pages || 0,
    publishedAt: new Date().toISOString(),
    scanlationGroup: null,
    externalUrl: null,
  };
}

// Convert Consumet manga info to AniList-compatible format
export function convertConsumetToAniList(info: ConsumetMangaInfo) {
  return {
    id: parseInt(info.id),
    idMal: info.malId,
    title: {
      romaji: info.title.romaji,
      english: info.title.english,
      native: info.title.native,
    },
    description: info.description,
    coverImage: {
      extraLarge: info.image,
      large: info.image,
      medium: info.image,
      color: info.color,
    },
    bannerImage: info.cover,
    status: info.status?.toUpperCase().replace(' ', '_') || 'UNKNOWN',
    format: info.type === 'MANGA' ? 'MANGA' : info.type === 'ONE_SHOT' ? 'ONE_SHOT' : 'MANGA',
    chapters: info.chapters?.length || null,
    volumes: null,
    averageScore: info.rating,
    meanScore: info.rating,
    popularity: info.popularity,
    favourites: 0,
    trending: 0,
    genres: info.genres || [],
    tags: [],
    startDate: info.startDate || { year: null, month: null, day: null },
    endDate: info.endDate || { year: null, month: null, day: null },
    staff: { edges: [] },
    isAdult: false,
    countryOfOrigin: 'JP',
  };
}

// Get chapters using Consumet API (for integration with existing sources.ts)
export async function getConsumetChapters(anilistId: number): Promise<{
  id: string;
  source: 'consumet';
  chapter: string | null;
  volume: string | null;
  title: string | null;
  language: string;
  pages: number;
  publishedAt: string;
  scanlationGroup: string | null;
  externalUrl: string | null;
}[]> {
  const info = await getMangaInfoConsumet(anilistId);
  
  if (!info || !info.chapters || info.chapters.length === 0) {
    return [];
  }

  return info.chapters.map(convertConsumetChapter);
}

// Get chapter images using Consumet API (for integration with existing sources.ts)
export async function getConsumetChapterImages(chapterId: string): Promise<string[]> {
  const pages = await getChapterPagesConsumet(chapterId);
  
  // Filter out MangaDex placeholder/redirect images
  const filteredPages = pages.filter(page => {
    const imgUrl = page.img.toLowerCase();
    
    // Filter out MangaDex placeholder images and redirect pages
    const blockedPatterns = [
      'mangadex',
      'read it on',
      'please support',
      'official release',
      'licensed',
      'unavailable',
      'placeholder',
      'cmdxd',  // MangaDex CDN pattern
      'uploads.mangadex.org',
    ];
    
    // Check if URL contains any blocked patterns
    const isBlocked = blockedPatterns.some(pattern => imgUrl.includes(pattern));
    
    return !isBlocked;
  });
  
  return filteredPages.map(page => page.img);
}
