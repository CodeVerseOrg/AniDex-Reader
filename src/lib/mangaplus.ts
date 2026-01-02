// MangaPlus API Client
// Official Shueisha manga platform - https://mangaplus.shueisha.co.jp

const MANGAPLUS_API_URL = 'https://jumpg-webapi.tokyo-cdn.com/api';
const MANGAPLUS_IMAGE_URL = 'https://mangaplus.shueisha.co.jp';

// MangaPlus uses protobuf, but we can use JSON endpoints
// API endpoints discovered from web app

export interface MangaPlusManga {
  titleId: number;
  name: string;
  author: string;
  portraitImageUrl: string;
  landscapeImageUrl: string;
  viewCount: number;
  language: string;
}

export interface MangaPlusChapter {
  chapterId: number;
  name: string;
  subTitle: string | null;
  startTimeStamp: number;
  endTimeStamp: number;
  isVerticalOnly: boolean;
}

export interface MangaPlusChapterGroup {
  firstChapterList: MangaPlusChapter[];
  midChapterList: MangaPlusChapter[];
  lastChapterList: MangaPlusChapter[];
}

export interface MangaPlusPage {
  imageUrl: string;
  width: number;
  height: number;
  encryptionKey: string | null;
}

export interface MangaPlusTitleDetail {
  titleId: number;
  name: string;
  author: string;
  portraitImageUrl: string;
  landscapeImageUrl: string;
  viewCount: number;
  overview: string;
  chapterListGroup: MangaPlusChapterGroup[];
  isSimulRelease: boolean;
  nextTimeStamp: number;
}

// Decrypt MangaPlus images (they use XOR encryption)
function decryptImage(encryptedData: Uint8Array, key: string): Uint8Array {
  const keyBytes = key.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
  const decrypted = new Uint8Array(encryptedData.length);
  
  for (let i = 0; i < encryptedData.length; i++) {
    decrypted[i] = encryptedData[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return decrypted;
}

// Get all manga titles
export async function getMangaPlusTitles(language: string = 'eng'): Promise<MangaPlusManga[]> {
  try {
    const response = await fetch(`${MANGAPLUS_API_URL}/title_list/allV2?format=json`, {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MangaPlus API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter by language
    const allTitles = data.success?.allTitlesViewV2?.AllTitlesGroup || [];
    const titles: MangaPlusManga[] = [];
    
    for (const group of allTitles) {
      if (group.titles) {
        for (const title of group.titles) {
          if (title.language === language.toUpperCase() || language === 'all') {
            titles.push({
              titleId: title.titleId,
              name: title.name,
              author: title.author || 'Unknown',
              portraitImageUrl: title.portraitImageUrl,
              landscapeImageUrl: title.landscapeImageUrl,
              viewCount: title.viewCount || 0,
              language: title.language,
            });
          }
        }
      }
    }
    
    return titles;
  } catch (error) {
    console.error('Error fetching MangaPlus titles:', error);
    return [];
  }
}

// Get manga details and chapters
export async function getMangaPlusTitle(titleId: number): Promise<MangaPlusTitleDetail | null> {
  try {
    const response = await fetch(`${MANGAPLUS_API_URL}/title_detailV3?title_id=${titleId}&format=json`, {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MangaPlus API error: ${response.status}`);
    }
    
    const data = await response.json();
    const titleDetail = data.success?.titleDetailView;
    
    if (!titleDetail) {
      return null;
    }
    
    return {
      titleId: titleDetail.title?.titleId,
      name: titleDetail.title?.name,
      author: titleDetail.title?.author || 'Unknown',
      portraitImageUrl: titleDetail.title?.portraitImageUrl,
      landscapeImageUrl: titleDetail.title?.landscapeImageUrl,
      viewCount: titleDetail.title?.viewCount || 0,
      overview: titleDetail.overview || '',
      chapterListGroup: titleDetail.chapterListGroup || [],
      isSimulRelease: titleDetail.isSimulRelease || false,
      nextTimeStamp: titleDetail.nextTimeStamp || 0,
    };
  } catch (error) {
    console.error('Error fetching MangaPlus title:', error);
    return null;
  }
}

// Get chapter images
export async function getMangaPlusChapterImages(chapterId: number): Promise<string[]> {
  try {
    const response = await fetch(`${MANGAPLUS_API_URL}/manga_viewer?chapter_id=${chapterId}&split=no&img_quality=super_high&format=json`, {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MangaPlus API error: ${response.status}`);
    }
    
    const data = await response.json();
    const pages = data.success?.mangaViewer?.pages || [];
    
    const imageUrls: string[] = [];
    
    for (const page of pages) {
      if (page.mangaPage?.imageUrl) {
        // MangaPlus images may need decryption key
        let imageUrl = page.mangaPage.imageUrl;
        
        // If there's an encryption key, we need to handle it client-side
        // For now, return the URL with encryption info
        if (page.mangaPage.encryptionKey) {
          imageUrl = `${imageUrl}#key=${page.mangaPage.encryptionKey}`;
        }
        
        imageUrls.push(imageUrl);
      }
    }
    
    return imageUrls;
  } catch (error) {
    console.error('Error fetching MangaPlus chapter images:', error);
    return [];
  }
}

// Search MangaPlus titles
export async function searchMangaPlus(query: string): Promise<MangaPlusManga[]> {
  const allTitles = await getMangaPlusTitles('eng');
  
  const queryLower = query.toLowerCase();
  
  return allTitles.filter(title => 
    title.name.toLowerCase().includes(queryLower) ||
    title.author.toLowerCase().includes(queryLower)
  );
}

// Get recently updated manga
export async function getMangaPlusUpdates(): Promise<MangaPlusManga[]> {
  try {
    const response = await fetch(`${MANGAPLUS_API_URL}/web/web_homeV4?lang=eng&format=json`, {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MangaPlus API error: ${response.status}`);
    }
    
    const data = await response.json();
    const groups = data.success?.webHomeViewV4?.groups || [];
    
    const titles: MangaPlusManga[] = [];
    
    for (const group of groups) {
      if (group.titleList) {
        for (const item of group.titleList) {
          if (item.title) {
            titles.push({
              titleId: item.title.titleId,
              name: item.title.name,
              author: item.title.author || 'Unknown',
              portraitImageUrl: item.title.portraitImageUrl,
              landscapeImageUrl: item.title.landscapeImageUrl,
              viewCount: item.title.viewCount || 0,
              language: 'ENGLISH',
            });
          }
        }
      }
    }
    
    return titles;
  } catch (error) {
    console.error('Error fetching MangaPlus updates:', error);
    return [];
  }
}

// Get featured/popular manga
export async function getMangaPlusFeatured(): Promise<MangaPlusManga[]> {
  try {
    const response = await fetch(`${MANGAPLUS_API_URL}/featured?lang=eng&format=json`, {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`MangaPlus API error: ${response.status}`);
    }
    
    const data = await response.json();
    const featuredTitles = data.success?.featuredTitlesView?.contents || [];
    
    const titles: MangaPlusManga[] = [];
    
    for (const content of featuredTitles) {
      if (content.title) {
        titles.push({
          titleId: content.title.titleId,
          name: content.title.name,
          author: content.title.author || 'Unknown',
          portraitImageUrl: content.title.portraitImageUrl,
          landscapeImageUrl: content.title.landscapeImageUrl,
          viewCount: content.title.viewCount || 0,
          language: 'ENGLISH',
        });
      }
    }
    
    return titles;
  } catch (error) {
    console.error('Error fetching MangaPlus featured:', error);
    return [];
  }
}

// Find MangaPlus manga by AniList ID or title
export async function findMangaPlusManga(anilistId: number, title: string): Promise<number | null> {
  try {
    // Search by title since MangaPlus doesn't have AniList ID mapping
    const results = await searchMangaPlus(title);
    
    if (results.length > 0) {
      // Return the first match
      return results[0].titleId;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding MangaPlus manga:', error);
    return null;
  }
}

// Get chapters for a manga
export async function getMangaPlusChapters(titleId: number): Promise<MangaPlusChapter[]> {
  const titleDetail = await getMangaPlusTitle(titleId);
  
  if (!titleDetail) {
    return [];
  }
  
  const chapters: MangaPlusChapter[] = [];
  
  for (const group of titleDetail.chapterListGroup) {
    // First chapters (usually free)
    if (group.firstChapterList) {
      chapters.push(...group.firstChapterList);
    }
    // Middle chapters (may require subscription)
    if (group.midChapterList) {
      chapters.push(...group.midChapterList);
    }
    // Last chapters (usually free - latest releases)
    if (group.lastChapterList) {
      chapters.push(...group.lastChapterList);
    }
  }
  
  return chapters;
}

// Convert MangaPlus chapter to unified SourceChapter format
export function convertMangaPlusChapter(chapter: MangaPlusChapter): {
  id: string;
  source: 'mangaplus';
  chapter: string | null;
  volume: string | null;
  title: string | null;
  language: string;
  pages: number;
  publishedAt: string;
  scanlationGroup: string | null;
  externalUrl: string | null;
} {
  // Extract chapter number from name (e.g., "#001" -> "1")
  const chapterMatch = chapter.name.match(/#?(\d+)/);
  const chapterNum = chapterMatch ? chapterMatch[1].replace(/^0+/, '') || '0' : null;
  
  return {
    id: chapter.chapterId.toString(),
    source: 'mangaplus',
    chapter: chapterNum,
    volume: null,
    title: chapter.subTitle,
    language: 'en',
    pages: 0, // MangaPlus doesn't provide page count upfront
    publishedAt: new Date(chapter.startTimeStamp * 1000).toISOString(),
    scanlationGroup: 'MANGA Plus by SHUEISHA',
    externalUrl: `https://mangaplus.shueisha.co.jp/viewer/${chapter.chapterId}`,
  };
}

// Check if a chapter is currently available (not expired)
export function isChapterAvailable(chapter: MangaPlusChapter): boolean {
  const now = Date.now() / 1000;
  return chapter.startTimeStamp <= now && (chapter.endTimeStamp === 0 || chapter.endTimeStamp > now);
}

// Popular titles on MangaPlus
export const MANGAPLUS_POPULAR_TITLES = [
  { name: 'One Piece', titleId: 100020 },
  { name: 'My Hero Academia', titleId: 100017 },
  { name: 'Jujutsu Kaisen', titleId: 100034 },
  { name: 'Chainsaw Man', titleId: 100037 },
  { name: 'Spy x Family', titleId: 100056 },
  { name: 'Dandadan', titleId: 100171 },
  { name: 'Kaiju No. 8', titleId: 100110 },
  { name: 'Sakamoto Days', titleId: 100127 },
  { name: 'Blue Box', titleId: 100122 },
  { name: 'Undead Unluck', titleId: 100081 },
];
