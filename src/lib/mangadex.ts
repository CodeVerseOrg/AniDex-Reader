import axios from 'axios';
import type {
  MangaDexManga,
  MangaDexChapter,
  MangaDexChapterImages,
  MangaDexResponse,
} from '@/types';

// Use the Next.js rewrite proxy to avoid CORS issues
const MANGADEX_API = typeof window !== 'undefined' 
  ? '/api/mangadex' 
  : 'https://api.mangadex.org';

const api = axios.create({
  baseURL: MANGADEX_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Search manga on MangaDex by title (to link with AniList)
export async function searchMangaDex(title: string): Promise<MangaDexManga[]> {
  try {
    const { data } = await api.get<MangaDexResponse<MangaDexManga[]>>('/manga', {
      params: {
        title,
        limit: 10,
        includes: ['cover_art', 'author', 'artist'],
        contentRating: ['safe', 'suggestive'],
        order: { relevance: 'desc' },
      },
    });
    return data.data;
  } catch (error) {
    console.error('MangaDex search error:', error);
    return [];
  }
}

// Find MangaDex ID by AniList ID and title
export async function findMangaDexId(
  anilistId: number,
  title: string
): Promise<string | null> {
  try {
    // Search by title
    const results = await searchMangaDex(title);
    
    if (results.length === 0) return null;
    
    // Try to find by AniList ID in links
    for (const manga of results) {
      if (manga.attributes.links?.al === String(anilistId)) {
        return manga.id;
      }
    }
    
    // Fallback to first result with matching title
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const manga of results) {
      const mangaTitle = Object.values(manga.attributes.title)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
      if (mangaTitle.includes(normalizedTitle) || normalizedTitle.includes(mangaTitle)) {
        return manga.id;
      }
    }
    
    // Return first result as last resort
    return results[0]?.id || null;
  } catch (error) {
    console.error('Find MangaDex ID error:', error);
    return null;
  }
}

// Get manga by MangaDex ID
export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
  try {
    const { data } = await api.get<MangaDexResponse<MangaDexManga>>(`/manga/${id}`, {
      params: {
        includes: ['cover_art', 'author', 'artist'],
      },
    });
    return data.data;
  } catch (error) {
    console.error('MangaDex get manga error:', error);
    return null;
  }
}

// Get manga by AniList ID (using external link)
export async function getMangaDexByAniListId(anilistId: number): Promise<MangaDexManga | null> {
  try {
    const { data } = await api.get<MangaDexResponse<MangaDexManga[]>>('/manga', {
      params: {
        'ids[]': [],
        includes: ['cover_art'],
      },
    });
    
    // MangaDex doesn't have direct AniList ID lookup, so we search by title
    // In production, you'd maintain a mapping database
    return data.data[0] || null;
  } catch (error) {
    console.error('MangaDex AniList lookup error:', error);
    return null;
  }
}

// Get chapters for a manga
export async function getChapters(
  mangaId: string,
  options: {
    language?: string;
    limit?: number;
    offset?: number;
    order?: 'asc' | 'desc';
  } = {}
): Promise<{
  chapters: MangaDexChapter[];
  total: number;
  limit: number;
  offset: number;
}> {
  const {
    language = 'en',
    limit = 100,
    offset = 0,
    order = 'desc',
  } = options;

  try {
    const { data } = await api.get<MangaDexResponse<MangaDexChapter[]>>('/chapter', {
      params: {
        manga: mangaId,
        translatedLanguage: [language],
        limit,
        offset,
        order: { chapter: order },
        includes: ['scanlation_group', 'user'],
        contentRating: ['safe', 'suggestive'],
      },
    });

    return {
      chapters: data.data,
      total: data.total || 0,
      limit: data.limit || limit,
      offset: data.offset || offset,
    };
  } catch (error) {
    console.error('MangaDex get chapters error:', error);
    return { chapters: [], total: 0, limit, offset };
  }
}

// Get all chapters (handles pagination)
export async function getAllChapters(
  mangaId: string,
  language = 'en'
): Promise<MangaDexChapter[]> {
  const allChapters: MangaDexChapter[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  while (hasMore) {
    const { chapters, total } = await getChapters(mangaId, {
      language,
      limit,
      offset,
      order: 'asc',
    });

    allChapters.push(...chapters);
    offset += limit;
    hasMore = offset < total;
  }

  return allChapters;
}

// Get chapter pages/images
export async function getChapterImages(chapterId: string): Promise<MangaDexChapterImages | null> {
  try {
    const { data } = await api.get<MangaDexChapterImages>(`/at-home/server/${chapterId}`);
    return data;
  } catch (error) {
    console.error('MangaDex get chapter images error:', error);
    return null;
  }
}

// Build image URLs from chapter data
export function buildImageUrls(
  imageData: MangaDexChapterImages,
  quality: 'data' | 'dataSaver' = 'data'
): string[] {
  const { baseUrl, chapter } = imageData;
  const images = quality === 'data' ? chapter.data : chapter.dataSaver;
  const qualityPath = quality === 'data' ? 'data' : 'data-saver';

  return images.map(
    (filename) => `${baseUrl}/${qualityPath}/${chapter.hash}/${filename}`
  );
}

// Get available languages for a manga
export async function getAvailableLanguages(mangaId: string): Promise<string[]> {
  try {
    const manga = await getMangaDexManga(mangaId);
    return manga?.attributes.availableTranslatedLanguages || ['en'];
  } catch (error) {
    console.error('Error getting languages:', error);
    return ['en'];
  }
}

// Get recently updated manga
export async function getRecentlyUpdated(
  limit = 20,
  offset = 0
): Promise<MangaDexManga[]> {
  try {
    const { data } = await api.get<MangaDexResponse<MangaDexManga[]>>('/manga', {
      params: {
        limit,
        offset,
        order: { latestUploadedChapter: 'desc' },
        includes: ['cover_art', 'author'],
        contentRating: ['safe', 'suggestive'],
        hasAvailableChapters: true,
      },
    });
    return data.data;
  } catch (error) {
    console.error('MangaDex recent updates error:', error);
    return [];
  }
}

// Get cover art URL
export function getCoverUrl(manga: MangaDexManga, size: '256' | '512' | 'original' = '512'): string {
  const coverRel = manga.relationships.find((rel) => rel.type === 'cover_art');
  if (!coverRel?.attributes) return '/placeholder-cover.jpg';
  
  const filename = (coverRel.attributes as { fileName: string }).fileName;
  if (size === 'original') {
    return `https://uploads.mangadex.org/covers/${manga.id}/${filename}`;
  }
  return `https://uploads.mangadex.org/covers/${manga.id}/${filename}.${size}.jpg`;
}

// Get scanlation group from chapter
export function getScanlationGroup(chapter: MangaDexChapter): string {
  const groupRel = chapter.relationships.find((rel) => rel.type === 'scanlation_group');
  if (groupRel?.attributes) {
    return (groupRel.attributes as { name: string }).name;
  }
  return 'Unknown Group';
}

// Helper to get display title from MangaDex manga
export function getMangaDexTitle(manga: MangaDexManga, preferredLang = 'en'): string {
  const { title, altTitles } = manga.attributes;
  
  // Check main title
  if (title[preferredLang]) return title[preferredLang];
  if (title.en) return title.en;
  
  // Check alt titles
  for (const alt of altTitles) {
    if (alt[preferredLang]) return alt[preferredLang];
    if (alt.en) return alt.en;
  }
  
  // Return first available title
  return Object.values(title)[0] || 'Unknown Title';
}

// Format chapter number for display
export function formatChapterNumber(chapter: MangaDexChapter): string {
  const { volume, chapter: chNum, title } = chapter.attributes;
  let display = '';
  
  if (volume) display += `Vol. ${volume} `;
  if (chNum) display += `Ch. ${chNum}`;
  if (title) display += ` - ${title}`;
  
  return display.trim() || 'Oneshot';
}

// Group chapters by volume
export function groupChaptersByVolume(
  chapters: MangaDexChapter[]
): Map<string, MangaDexChapter[]> {
  const grouped = new Map<string, MangaDexChapter[]>();
  
  for (const chapter of chapters) {
    const volume = chapter.attributes.volume || 'No Volume';
    if (!grouped.has(volume)) {
      grouped.set(volume, []);
    }
    grouped.get(volume)!.push(chapter);
  }
  
  return grouped;
}
