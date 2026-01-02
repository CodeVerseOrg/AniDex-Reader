import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
} from '@/types';
import {
  searchComick,
  getComickChapters,
  getComickChapterImages,
  findComickManga,
  convertComickChapter,
  getComickLanguages,
} from './comick';
import {
  findMangaPlusManga,
  getMangaPlusChapters,
  getMangaPlusChapterImages,
  convertMangaPlusChapter,
  isChapterAvailable,
} from './mangaplus';

// Sources in priority order: Comick first, then MangaPlus as fallback
const SOURCE_PRIORITY: MangaSource[] = ['comick', 'mangaplus'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on Comick or MangaPlus
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  // Try Comick first
  const comickId = await findComickManga(anilistId, title);
  if (comickId) {
    return { source: 'comick', sourceId: comickId };
  }
  
  // Try MangaPlus as fallback
  const mangaplusId = await findMangaPlusManga(anilistId, title);
  if (mangaplusId) {
    return { source: 'mangaplus', sourceId: mangaplusId.toString() };
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
  if (source === 'comick') {
    const page = Math.floor(offset / limit) + 1;
    const { chapters } = await getComickChapters(sourceId, language, page, limit);
    return chapters.map(convertComickChapter);
  }
  
  if (source === 'mangaplus') {
    const chapters = await getMangaPlusChapters(parseInt(sourceId));
    // Filter to only available chapters and convert
    return chapters
      .filter(isChapterAvailable)
      .map(convertMangaPlusChapter);
  }
  
  return [];
}

// Get chapter images from source
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  if (source === 'comick') {
    const images = await getComickChapterImages(chapterId);
    return { source: 'comick', images };
  }
  
  if (source === 'mangaplus') {
    const images = await getMangaPlusChapterImages(parseInt(chapterId));
    return { source: 'mangaplus', images };
  }
  
  return { source, images: [] };
}

// Get chapters from multiple sources with fallback
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  // Try Comick first
  try {
    const comickId = await findComickManga(anilistId, title);
    
    if (comickId) {
      const chapters = await getChaptersFromSource('comick', comickId, language);
      
      if (chapters.length > 0) {
        const languages = await getComickLanguages(comickId);
        
        return {
          source: 'comick',
          sourceId: comickId,
          chapters,
          languages: languages.length > 0 ? languages : ['en'],
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from Comick:', error);
  }
  
  // Try MangaPlus as fallback
  try {
    const mangaplusId = await findMangaPlusManga(anilistId, title);
    
    if (mangaplusId) {
      const chapters = await getChaptersFromSource('mangaplus', mangaplusId.toString(), language);
      
      if (chapters.length > 0) {
        return {
          source: 'mangaplus',
          sourceId: mangaplusId.toString(),
          chapters,
          languages: ['en'], // MangaPlus is primarily English
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from MangaPlus:', error);
  }
  
  return null;
}

// Get chapters from all available sources
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
  
  // Try Comick
  try {
    const comickId = await findComickManga(anilistId, title);
    if (comickId) {
      sources.push({ source: 'comick', sourceId: comickId });
      const ckChapters = await getChaptersFromSource('comick', comickId, language);
      for (const chapter of ckChapters) {
        const key = `${chapter.chapter}-${chapter.volume}`;
        if (!seenChapters.has(key)) {
          seenChapters.add(key);
          chapters.push(chapter);
        }
      }
    }
  } catch (error) {
    console.error('Comick fetch error:', error);
  }
  
  // Try MangaPlus as supplement
  try {
    const mangaplusId = await findMangaPlusManga(anilistId, title);
    if (mangaplusId) {
      sources.push({ source: 'mangaplus', sourceId: mangaplusId.toString() });
      const mpChapters = await getChaptersFromSource('mangaplus', mangaplusId.toString(), language);
      for (const chapter of mpChapters) {
        const key = `${chapter.chapter}-${chapter.volume}`;
        if (!seenChapters.has(key)) {
          seenChapters.add(key);
          chapters.push(chapter);
        }
      }
    }
  } catch (error) {
    console.error('MangaPlus fetch error:', error);
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
  comick: { name: 'Comick', icon: '📖', color: '#6366f1' },
  mangaplus: { name: 'MangaPlus', icon: '📕', color: '#e91e63' },
  mangasee: { name: 'MangaSee', icon: '📗', color: '#4caf50' },
};
