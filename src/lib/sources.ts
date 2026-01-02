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

// Only Comick source
const SOURCE_PRIORITY: MangaSource[] = ['comick'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on Comick
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  const comickId = await findComickManga(anilistId, title);
  if (comickId) {
    return { source: 'comick', sourceId: comickId };
  }
  
  return null;
}

// Get chapters from Comick
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
  return [];
}

// Get chapter images from Comick
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  if (source === 'comick') {
    const images = await getComickChapterImages(chapterId);
    return { source: 'comick', images };
  }
  return { source, images: [] };
}

// Get chapters from Comick
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  try {
    const sourceId = await findComickManga(anilistId, title);
    
    if (sourceId) {
      const chapters = await getChaptersFromSource('comick', sourceId, language);
      
      if (chapters.length > 0) {
        // Get available languages
        const languages = await getComickLanguages(sourceId);
        
        return {
          source: 'comick',
          sourceId,
          chapters,
          languages: languages.length > 0 ? languages : ['en'],
        };
      }
    }
  } catch (error) {
    console.error('Error fetching from Comick:', error);
  }
  
  return null;
}

// Get chapters (simplified - only Comick)
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
  
  try {
    const comickId = await findComickManga(anilistId, title);
    if (comickId) {
      sources.push({ source: 'comick', sourceId: comickId });
      const ckChapters = await getChaptersFromSource('comick', comickId, language);
      chapters.push(...ckChapters);
    }
  } catch (error) {
    console.error('Comick fetch error:', error);
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
