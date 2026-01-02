import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
} from '@/types';
import {
  getConsumetChapters,
  getConsumetChapterImages,
} from './consumet';

// MangaDex (via Consumet API) is the only source
const SOURCE_PRIORITY: MangaSource[] = ['mangadex'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on MangaDex (Consumet)
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  try {
    const consumetChapters = await getConsumetChapters(anilistId);
    if (consumetChapters.length > 0) {
      return { source: 'mangadex', sourceId: anilistId.toString() };
    }
  } catch (error) {
    console.error('Consumet API error:', error);
  }
  
  return null;
}

// Get chapters from MangaDex (Consumet)
export async function getChaptersFromSource(
  source: MangaSource,
  sourceId: string,
  language: string = 'en',
  offset: number = 0,
  limit: number = 100
): Promise<SourceChapter[]> {
  if (source === 'mangadex') {
    const chapters = await getConsumetChapters(parseInt(sourceId));
    return chapters as SourceChapter[];
  }
  
  return [];
}

// Get chapter images from MangaDex (Consumet)
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  if (source === 'mangadex') {
    const images = await getConsumetChapterImages(chapterId);
    return { source: 'mangadex', images };
  }
  
  return { source, images: [] };
}

// Get chapters from MangaDex (Consumet)
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  try {
    const consumetChapters = await getConsumetChapters(anilistId);
    
    if (consumetChapters.length > 0) {
      return {
        source: 'mangadex',
        sourceId: anilistId.toString(),
        chapters: consumetChapters as SourceChapter[],
        languages: ['en'],
      };
    }
  } catch (error) {
    console.error('Error fetching from Consumet:', error);
  }
  
  return null;
}

// Get merged chapters from Consumet API
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
    const consumetChapters = await getConsumetChapters(anilistId);
    if (consumetChapters.length > 0) {
      sources.push({ source: 'mangadex', sourceId: anilistId.toString() });
      chapters.push(...(consumetChapters as SourceChapter[]));
    }
  } catch (error) {
    console.error('Consumet API fetch error:', error);
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
  mangadex: { name: 'MangaDex', icon: '📚', color: '#ff6740' },
};
