import axios from 'axios';
import type {
  ComickManga,
  ComickChapter,
  ComickChapterImages,
  SourceChapter,
  SourceChapterImages,
} from '@/types';

// Comick.fun API - Alternative manga source
const COMICK_API = typeof window !== 'undefined'
  ? '/api/comick'
  : 'https://api.comick.fun';

const api = axios.create({
  baseURL: COMICK_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Search manga on Comick.fun
export async function searchComick(title: string): Promise<ComickManga[]> {
  try {
    const { data } = await api.get<ComickManga[]>('/v1.0/search', {
      params: {
        q: title,
        limit: 10,
        tachiyomi: true,
      },
    });
    return data;
  } catch (error) {
    console.error('Comick search error:', error);
    return [];
  }
}

// Get manga details by slug/hid
export async function getComickManga(hid: string): Promise<ComickManga | null> {
  try {
    const { data } = await api.get<{ comic: ComickManga }>(`/comic/${hid}`);
    return data.comic;
  } catch (error) {
    console.error('Comick get manga error:', error);
    return null;
  }
}

// Get chapters for a manga
export async function getComickChapters(
  hid: string,
  language: string = 'en',
  page: number = 1,
  limit: number = 100
): Promise<{ chapters: ComickChapter[]; total: number }> {
  try {
    const { data } = await api.get<{ chapters: ComickChapter[]; total: number }>(
      `/comic/${hid}/chapters`,
      {
        params: {
          lang: language,
          page,
          limit,
          tachiyomi: true,
        },
      }
    );
    return data;
  } catch (error) {
    console.error('Comick chapters error:', error);
    return { chapters: [], total: 0 };
  }
}

// Get chapter images
export async function getComickChapterImages(hid: string): Promise<string[]> {
  try {
    const { data } = await api.get<ComickChapterImages>(`/chapter/${hid}`);
    
    // Build image URLs from Comick CDN
    const baseUrl = 'https://meo.comick.pictures';
    const images = data.chapter.md_images.map(
      (img) => `${baseUrl}/${img.b2key}`
    );
    
    return images;
  } catch (error) {
    console.error('Comick chapter images error:', error);
    return [];
  }
}

// Get available languages for a manga
export async function getComickLanguages(hid: string): Promise<string[]> {
  try {
    const { data } = await api.get<{ comic: { langList: string[] } }>(`/comic/${hid}`);
    return data.comic.langList || ['en'];
  } catch (error) {
    console.error('Comick languages error:', error);
    return ['en'];
  }
}

// Convert Comick chapter to unified SourceChapter format
export function convertComickChapter(chapter: ComickChapter): SourceChapter {
  return {
    id: chapter.hid,
    source: 'comick',
    chapter: chapter.chap,
    volume: chapter.vol,
    title: chapter.title,
    language: chapter.lang,
    pages: 0, // Not available until fetched
    publishedAt: chapter.created_at,
    scanlationGroup: chapter.group_name?.[0] || chapter.md_groups?.[0]?.title || null,
    externalUrl: null,
  };
}

// Get chapter images in unified format
export async function getComickSourceImages(chapterId: string): Promise<SourceChapterImages> {
  const images = await getComickChapterImages(chapterId);
  return {
    source: 'comick',
    images,
  };
}

// Find manga on Comick by AniList ID or title
export async function findComickManga(
  anilistId: number,
  title: string
): Promise<string | null> {
  try {
    // First try searching by title
    const results = await searchComick(title);
    
    if (results.length > 0) {
      // Try to find exact match or close match
      const exactMatch = results.find(
        (m) => m.title.toLowerCase() === title.toLowerCase()
      );
      if (exactMatch) return exactMatch.hid;
      
      // Check if any have AniList link matching our ID
      const anilistMatch = results.find(
        (m) => m.links?.al === String(anilistId)
      );
      if (anilistMatch) return anilistMatch.hid;
      
      // Return first result as fallback
      return results[0].hid;
    }
    
    return null;
  } catch (error) {
    console.error('Find Comick manga error:', error);
    return null;
  }
}
