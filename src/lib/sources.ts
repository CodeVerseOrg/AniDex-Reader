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
  getConsumetChapters,
  getConsumetChapterImages,
} from './consumet';

// MangaDex as primary, Consumet as fallback
const SOURCE_PRIORITY: MangaSource[] = ['mangadex', 'consumet'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Find manga on MangaDex or Consumet API
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  // Try MangaDex first
  try {
    const mangadexId = await findMangaDexManga(anilistId, title);
    if (mangadexId) {
      return { source: 'mangadex', sourceId: mangadexId };
    }
  } catch (error) {
    console.error('MangaDex API error:', error);
  }
  
  // Fallback to Consumet
  try {
    const consumetChapters = await getConsumetChapters(anilistId);
    if (consumetChapters.length > 0) {
      return { source: 'consumet', sourceId: anilistId.toString() };
    }
  } catch (error) {
    console.error('Consumet API error:', error);
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
  
  if (source === 'consumet') {
    const chapters = await getConsumetChapters(parseInt(sourceId));
    return chapters as SourceChapter[];
  }
  
  return [];
}

// Get chapter images from source
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  if (source === 'mangadex') {
    const images = await getMangaDexChapterImages(chapterId);
    return { source: 'mangadex', images };
  }
  
  if (source === 'consumet') {
    const images = await getConsumetChapterImages(chapterId);
    return { source: 'consumet', images };
  }
  
  return { source, images: [] };
}

// Get chapters with multi-source fallback
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  // Try MangaDex first
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
  
  // Fallback to Consumet
  try {
    const consumetChapters = await getConsumetChapters(anilistId);
    
    if (consumetChapters.length > 0) {
      return {
        source: 'consumet',
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
  
  // Add Consumet chapters
  try {
    const consumetChapters = await getConsumetChapters(anilistId);
    if (consumetChapters.length > 0) {
      sources.push({ source: 'consumet', sourceId: anilistId.toString() });
      for (const chapter of consumetChapters as SourceChapter[]) {
        const key = `${chapter.chapter}-${chapter.volume}`;
        if (!seenChapters.has(key)) {
          seenChapters.add(key);
          chapters.push(chapter);
        }
      }
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
  mangadex: { name: 'MangaDex', icon: '📖', color: '#ff6740' },
  consumet: { name: 'Consumet', icon: '📚', color: '#2196f3' },
  mangaplus: { name: 'MangaPlus', icon: '📕', color: '#e91e63' },
  mangasee: { name: 'MangaSee', icon: '📗', color: '#4caf50' },
};
