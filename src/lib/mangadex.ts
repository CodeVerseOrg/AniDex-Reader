import axios from 'axios';

// Determine if we are on the server or client
const isServer = typeof window === 'undefined';

// Use direct API on server, proxy on client
const MANGADEX_API = isServer ? 'https://api.mangadex.org' : '/api/mangadex';
const MANGADEX_API_KEY = process.env.MANGADEX_API_KEY || '';

// Axios instance with default config
const mangadexClient = axios.create({
  baseURL: MANGADEX_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add API key to requests if available (server-side only)
if (isServer && MANGADEX_API_KEY) {
  mangadexClient.defaults.headers.common['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
}

// MangaDex Types
export interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: {
    title: Record<string, string>;
    altTitles: Array<Record<string, string>>;
    description: Record<string, string>;
    isLocked: boolean;
    links: Record<string, string>;
    originalLanguage: string;
    lastVolume: string | null;
    lastChapter: string | null;
    publicationDemographic: string | null;
    status: string;
    year: number | null;
    contentRating: string;
    tags: Array<{
      id: string;
      type: string;
      attributes: {
        name: Record<string, string>;
        description: Record<string, string>;
        group: string;
        version: number;
      };
    }>;
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
  };
  relationships: Array<{
    id: string;
    type: string;
    attributes?: any;
  }>;
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
    version: number;
  };
  relationships: Array<{
    id: string;
    type: string;
  }>;
}

export interface MangaDexAtHomeResponse {
  result: 'ok' | 'error';
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
    dataSaver: string[];
  };
}

/**
 * Search for manga by title
 */
export async function searchMangaDex(
  title: string,
  limit: number = 10
): Promise<MangaDexManga[]> {
  try {
    const response = await mangadexClient.get('/manga', {
      params: {
        title,
        limit,
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive', 'erotica'],
        order: { relevance: 'desc' },
      },
    });

    return response.data.data || [];
  } catch (error) {
    console.error('MangaDex search error:', error);
    return [];
  }
}

/**
 * Get manga by ID
 */
export async function getMangaDexManga(mangaId: string): Promise<MangaDexManga | null> {
  try {
    const response = await mangadexClient.get(`/manga/${mangaId}`, {
      params: {
        includes: ['cover_art', 'author', 'artist'],
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('MangaDex manga fetch error:', error);
    return null;
  }
}

/**
 * Get cover image URL for a manga
 */
export function getMangaDexCoverUrl(manga: MangaDexManga, quality: 'original' | '512' | '256' = '512'): string | null {
  const coverRelationship = manga.relationships.find((rel) => rel.type === 'cover_art');
  
  if (!coverRelationship?.attributes?.fileName) {
    return null;
  }

  const fileName = coverRelationship.attributes.fileName;
  
  if (quality === 'original') {
    return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}`;
  }
  
  return `https://uploads.mangadex.org/covers/${manga.id}/${fileName}.${quality}.jpg`;
}

/**
 * Get chapters for a manga (chapter feed)
 */
export async function getMangaDexChapters(
  mangaId: string,
  language: string = 'en',
  limit: number = 100,
  offset: number = 0
): Promise<{ chapters: MangaDexChapter[]; total: number }> {
  try {
    const response = await mangadexClient.get(`/manga/${mangaId}/feed`, {
      params: {
        translatedLanguage: [language],
        limit,
        offset,
        includes: ['scanlation_group', 'user'],
        order: { chapter: 'desc' },
        contentRating: ['safe', 'suggestive', 'erotica'],
      },
    });

    return {
      chapters: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('MangaDex chapters fetch error:', error);
    return { chapters: [], total: 0 };
  }
}

/**
 * Get chapter images via MangaDex@Home
 */
export async function getMangaDexChapterImages(
  chapterId: string,
  dataSaver: boolean = false
): Promise<string[]> {
  try {
    // Get at-home server info
    const response = await mangadexClient.get(`/at-home/server/${chapterId}`);
    
    // Log response for debugging (remove in production)
    if (!response.data || response.data.result !== 'ok') {
      console.error('MangaDex @Home error:', response.data);
      return [];
    }

    const data: MangaDexAtHomeResponse = response.data;
    const { baseUrl, chapter } = data;
    
    if (!chapter || !chapter.data) {
       console.error('MangaDex @Home: Missing chapter data', data);
       return [];
    }

    const quality = dataSaver ? 'data-saver' : 'data';
    const files = dataSaver ? chapter.dataSaver : chapter.data;

    // Construct image URLs
    return files.map((filename) => `${baseUrl}/${quality}/${chapter.hash}/${filename}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
       console.error('MangaDex chapter images error:', error.message, error.response?.data);
    } else {
       console.error('MangaDex chapter images error:', error);
    }
    return [];
  }
}

/**
 * Find MangaDex manga by AniList ID or title
 */
export async function findMangaDexManga(
  anilistId: number,
  title: string
): Promise<string | null> {
  try {
    // Search by title as fallback
    const results = await searchMangaDex(title, 5);
    
    if (results.length > 0) {
      // Try to find exact match or closest match
      for (const manga of results) {
        const titles = [
          ...Object.values(manga.attributes.title),
          ...manga.attributes.altTitles.flatMap((t) => Object.values(t)),
        ];

        // Check if any title matches closely
        if (titles.some((t) => 
          t.toLowerCase().includes(title.toLowerCase()) ||
          title.toLowerCase().includes(t.toLowerCase())
        )) {
          return manga.id;
        }
      }
      
      // Return first result if no exact match
      return results[0].id;
    }

    return null;
  } catch (error) {
    console.error('MangaDex manga find error:', error);
    return null;
  }
}

/**
 * Convert MangaDex chapter to SourceChapter format
 */
export function convertMangaDexChapter(chapter: MangaDexChapter, mangaId: string): any {
  // Find scanlation group
  const groupRelationship = chapter.relationships.find((rel) => rel.type === 'scanlation_group');
  
  return {
    id: chapter.id,
    source: 'mangadex' as const,
    chapter: chapter.attributes.chapter,
    volume: chapter.attributes.volume,
    title: chapter.attributes.title,
    language: chapter.attributes.translatedLanguage,
    pages: chapter.attributes.pages,
    publishedAt: chapter.attributes.publishAt,
    scanlationGroup: groupRelationship?.id || null,
    externalUrl: chapter.attributes.externalUrl,
  };
}

/**
 * Get available languages for a manga
 */
export async function getMangaDexLanguages(mangaId: string): Promise<string[]> {
  try {
    const manga = await getMangaDexManga(mangaId);
    
    if (!manga) {
      return ['en'];
    }

    return manga.attributes.availableTranslatedLanguages || ['en'];
  } catch (error) {
    console.error('MangaDex languages error:', error);
    return ['en'];
  }
}
