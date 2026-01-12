import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
} from '@/types';
import {
  findMangaDexManga,
  getMangaDexChapters,
  getMangaDexChapterImages,
  convertMangaDexChapter,
  getMangaDexLanguages,
} from './mangadex';
import {
  searchWebtoon,
  getWebtoonChapters,
  getWebtoonImages,
} from './webtoon';
import {
  storeMangaImages,
  getMangaImagesFromTelegram,
  getStoredChapterFileIds,
  setStorageChatId,
} from './telegram';

// Source priority (telegram first if cached, then mangadex, then webtoon)
const SOURCE_PRIORITY: MangaSource[] = ['mangadex', 'webtoon'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on MangaDex
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  // Try MangaDex
  try {
    const mangadexId = await findMangaDexManga(anilistId, title);
    if (mangadexId) {
      return { source: 'mangadex', sourceId: mangadexId };
    }
  } catch (error) {
    console.error('MangaDex API error:', error);
  }

  // Try Webtoon
  try {
    const results = await searchWebtoon(title);
    if (results.length > 0) {
       // Return first match
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
  if (source === 'mangadex') {
    const { chapters } = await getMangaDexChapters(sourceId, language, limit, offset);
    return chapters.map((ch) => convertMangaDexChapter(ch, sourceId));
  }

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
      return { source: 'mangadex', images }; // Return as original source
    }
  }

  let images: string[] = [];

  if (source === 'mangadex') {
    images = await getMangaDexChapterImages(chapterId);
  } else if (source === 'webtoon') {
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

// Get chapters with multi-source fallback (Only MangaDex now)
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  // Try MangaDex
  try {
    const mangadexId = await findMangaDexManga(anilistId, title);
    
    if (mangadexId) {
      const chapters = await getChaptersFromSource('mangadex', mangadexId, language);
      
      if (chapters.length > 0) {
        const languages = await getMangaDexLanguages(mangadexId);
        
        return {
          source: 'mangadex',
          sourceId: mangadexId,
          chapters,
          languages: languages.length > 0 ? languages : ['en'],
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from MangaDex:', error);
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
  
  // Try MangaDex
  try {
    const mangadexId = await findMangaDexManga(anilistId, title);
    if (mangadexId) {
      sources.push({ source: 'mangadex', sourceId: mangadexId });
      const mdChapters = await getChaptersFromSource('mangadex', mangadexId, language);
      for (const chapter of mdChapters) {
        const key = `${chapter.chapter}-${chapter.volume}`;
        if (!seenChapters.has(key)) {
          seenChapters.add(key);
          chapters.push(chapter);
        }
      }
    }
  } catch (error) {
    console.error('MangaDex fetch error:', error);
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
  mangadex: { name: 'MangaDex', icon: '📖', color: '#ff6740' },
  // Keeping others just in case the type requires it temporarily, but logically removed from use
  mangaplus: { name: 'MangaPlus', icon: '📕', color: '#e91e63' },
  mangasee: { name: 'MangaSee', icon: '📗', color: '#4caf50' },
} as any;
