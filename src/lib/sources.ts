import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
} from '@/types';
import {
  findMangaPlusManga,
  getMangaPlusChapters,
  getMangaPlusChapterImages,
  convertMangaPlusChapter,
  isChapterAvailable,
} from './mangaplus';

// MangaPlus is the only source
const SOURCE_PRIORITY: MangaSource[] = ['mangaplus'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on MangaPlus
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  const mangaplusId = await findMangaPlusManga(anilistId, title);
  if (mangaplusId) {
    return { source: 'mangaplus', sourceId: mangaplusId.toString() };
  }
  
  return null;
}

// Get chapters from MangaPlus
export async function getChaptersFromSource(
  source: MangaSource,
  sourceId: string,
  language: string = 'en',
  offset: number = 0,
  limit: number = 100
): Promise<SourceChapter[]> {
  if (source === 'mangaplus') {
    const chapters = await getMangaPlusChapters(parseInt(sourceId));
    // Filter to only available chapters and convert
    return chapters
      .filter(isChapterAvailable)
      .map(convertMangaPlusChapter);
  }
  
  return [];
}

// Get chapter images from MangaPlus
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  if (source === 'mangaplus') {
    const images = await getMangaPlusChapterImages(parseInt(chapterId));
    return { source: 'mangaplus', images };
  }
  
  return { source, images: [] };
}

// Get chapters from MangaPlus
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
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

// Get chapters from MangaPlus
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
    const mangaplusId = await findMangaPlusManga(anilistId, title);
    if (mangaplusId) {
      sources.push({ source: 'mangaplus', sourceId: mangaplusId.toString() });
      const mpChapters = await getChaptersFromSource('mangaplus', mangaplusId.toString(), language);
      chapters.push(...mpChapters);
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
  mangaplus: { name: 'MangaPlus', icon: '📕', color: '#e91e63' },
  mangasee: { name: 'MangaSee', icon: '📗', color: '#4caf50' },
};
