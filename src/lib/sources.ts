import type {
  MangaSource,
  SourceChapter,
  SourceChapterImages,
  MangaDexChapter,
} from '@/types';
import {
  searchMangaDex,
  getChapters as getMangaDexChapters,
  getChapterImages as getMangaDexImages,
  findMangaDexId,
} from './mangadex';
import {
  searchComick,
  getComickChapters,
  getComickChapterImages,
  findComickManga,
  convertComickChapter,
} from './comick';

// Priority order for sources
const SOURCE_PRIORITY: MangaSource[] = ['mangadex', 'comick'];

export interface MultiSourceResult {
  source: MangaSource;
  sourceId: string;
  chapters: SourceChapter[];
  languages: string[];
}

// Convert MangaDex chapter to unified format
function convertMangaDexChapter(chapter: MangaDexChapter): SourceChapter {
  const scanlationGroup = chapter.relationships.find(
    (r) => r.type === 'scanlation_group'
  );
  
  return {
    id: chapter.id,
    source: 'mangadex',
    chapter: chapter.attributes.chapter,
    volume: chapter.attributes.volume,
    title: chapter.attributes.title,
    language: chapter.attributes.translatedLanguage,
    pages: chapter.attributes.pages,
    publishedAt: chapter.attributes.publishAt,
    scanlationGroup: (scanlationGroup?.attributes?.name as string) || null,
    externalUrl: chapter.attributes.externalUrl,
  };
}

// Find manga across all sources
export async function findMangaAcrossSources(
  anilistId: number,
  title: string
): Promise<{ source: MangaSource; sourceId: string } | null> {
  // Try MangaDex first
  const mangadexId = await findMangaDexId(anilistId, title);
  if (mangadexId) {
    return { source: 'mangadex', sourceId: mangadexId };
  }
  
  // Try Comick as fallback
  const comickId = await findComickManga(anilistId, title);
  if (comickId) {
    return { source: 'comick', sourceId: comickId };
  }
  
  return null;
}

// Get chapters from a specific source
export async function getChaptersFromSource(
  source: MangaSource,
  sourceId: string,
  language: string = 'en',
  offset: number = 0,
  limit: number = 100
): Promise<SourceChapter[]> {
  switch (source) {
    case 'mangadex': {
      const result = await getMangaDexChapters(sourceId, { language, offset, limit });
      return result.chapters.map(convertMangaDexChapter);
    }
    case 'comick': {
      const page = Math.floor(offset / limit) + 1;
      const { chapters } = await getComickChapters(sourceId, language, page, limit);
      return chapters.map(convertComickChapter);
    }
    default:
      return [];
  }
}

// Get chapter images from a specific source
export async function getChapterImagesFromSource(
  source: MangaSource,
  chapterId: string
): Promise<SourceChapterImages> {
  switch (source) {
    case 'mangadex': {
      const data = await getMangaDexImages(chapterId);
      if (!data) {
        return { source: 'mangadex', images: [] };
      }
      // Build full image URLs
      const images = data.chapter.data.map(
        (filename) => `${data.baseUrl}/data/${data.chapter.hash}/${filename}`
      );
      return { source: 'mangadex', images, baseUrl: data.baseUrl };
    }
    case 'comick': {
      const images = await getComickChapterImages(chapterId);
      return { source: 'comick', images };
    }
    default:
      return { source, images: [] };
  }
}

// Get all chapters from multiple sources with fallback
export async function getChaptersMultiSource(
  anilistId: number,
  title: string,
  language: string = 'en'
): Promise<MultiSourceResult | null> {
  // Try each source in priority order
  for (const source of SOURCE_PRIORITY) {
    try {
      let sourceId: string | null = null;
      
      if (source === 'mangadex') {
        sourceId = await findMangaDexId(anilistId, title);
      } else if (source === 'comick') {
        sourceId = await findComickManga(anilistId, title);
      }
      
      if (sourceId) {
        const chapters = await getChaptersFromSource(source, sourceId, language);
        
        if (chapters.length > 0) {
          // Get available languages
          const allLangs = [...new Set(chapters.map((c) => c.language))];
          
          return {
            source,
            sourceId,
            chapters,
            languages: allLangs.length > 0 ? allLangs : ['en'],
          };
        }
      }
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      continue;
    }
  }
  
  return null;
}

// Get chapters from both sources and merge (for more complete coverage)
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
    const mangadexId = await findMangaDexId(anilistId, title);
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
  
  // Try Comick as supplement
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
  comick: { name: 'Comick', icon: '📖', color: '#6366f1' },
  mangaplus: { name: 'MangaPlus', icon: '📕', color: '#e91e63' },
  mangasee: { name: 'MangaSee', icon: '📗', color: '#4caf50' },
};
