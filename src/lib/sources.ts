import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
} from '@/types';
import {
  searchWebtoon,
  getWebtoonChapters,
  getWebtoonImages,
} from './webtoon';
import {
  storeMangaImages,
  getMangaImagesFromTelegram,
  getStoredChapterFileIds,
} from './telegram';

// Source priority (telegram cache first, then webtoon)
const SOURCE_PRIORITY: MangaSource[] = ['webtoon'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga across sources (Webtoon only now)
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  // Try Webtoon
  try {
    const results = await searchWebtoon(title);
    if (results.length > 0) {
      return { source: 'webtoon', sourceId: results[0].id };
    }
  } catch (error) {
    console.error('Webtoon search error:', error);
  }
  
  return null;
}

// Get chapters from source
export async function getChaptersFromSource(
  source: MangaSource,
  sourceId: string,
  language: string = 'en',
  offset: number = 0,
  limit: number = 100
): Promise<SourceChapter[]> {
  if (source === 'webtoon') {
    return await getWebtoonChapters(sourceId);
  }
  
  return [];
}

// Get chapter images from source (with Telegram caching)
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string,
  mangaId?: string
): Promise<SourceChapterImages> {
  // Check Telegram cache first
  const cachedFileIds = await getStoredChapterFileIds(mangaId || 'unknown', chapterId);
  if (cachedFileIds.length > 0) {
    const images = await getMangaImagesFromTelegram(cachedFileIds);
    if (images.length > 0) {
      console.log(`Loaded ${images.length} images from Telegram cache`);
      return { source: 'webtoon', images };
    }
  }

  let images: string[] = [];

  if (source === 'webtoon') {
    images = await getWebtoonImages(chapterId);
  }

  // Store to Telegram for future use (async, don't block)
  if (images.length > 0 && mangaId) {
    storeMangaImages(mangaId, chapterId, images).catch(err => 
      console.error('Failed to cache images to Telegram:', err)
    );
  }

  return { source, images };
}

// Get chapters with multi-source fallback
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  // Try Webtoon
  try {
    const results = await searchWebtoon(title);
    if (results.length > 0) {
      const sourceId = results[0].id;
      const chapters = await getWebtoonChapters(sourceId);
      
      if (chapters.length > 0) {
        return {
          source: 'webtoon',
          sourceId,
          chapters,
          languages: ['en'],
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from Webtoon:', error);
  }
  
  return null;
}

// Get merged chapters from all sources
export async function getMergedChapters(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<{
  chapters: SourceChapter[];
  sources: { source: MangaSource; sourceId: string }[];
}> {
  const chapters: SourceChapter[] = [];
  const sources: { source: MangaSource; sourceId: string }[] = [];
  const seenChapters = new Set<string>();
  
  // Try Webtoon
  try {
    const results = await searchWebtoon(title);
    if (results.length > 0) {
      const sourceId = results[0].id;
      sources.push({ source: 'webtoon', sourceId });
      const wtChapters = await getWebtoonChapters(sourceId);
      for (const chapter of wtChapters) {
        const key = `${chapter.chapter}-${chapter.volume}`;
        if (!seenChapters.has(key)) {
          seenChapters.add(key);
          chapters.push(chapter);
        }
      }
    }
  } catch (error) {
    console.error('Webtoon fetch error:', error);
  }
  
  // Sort chapters by chapter number
  chapters.sort((a, b) => {
    const aNum = parseFloat(a.chapter || '0');
    const bNum = parseFloat(b.chapter || '0');
    return bNum - aNum;
  });
  
  return { chapters, sources };
}

// Source display names and info
export const SOURCE_INFO: Record<MangaSource, { name: string; icon: string; color: string }> = {
  webtoon: { name: 'Webtoon', icon: '📱', color: '#00dc64' },
  telegram: { name: 'Telegram Cache', icon: '📦', color: '#0088cc' },
} as any;
