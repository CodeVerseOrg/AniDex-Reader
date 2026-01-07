import * as cheerio from 'cheerio';
import { MangaSource, SourceChapter, SourceChapterImages } from '@/types';

const WEBTOON_URL = 'https://www.webtoons.com';

// Webtoon Interfaces
interface WebtoonSearch {
  title: string;
  id: string; // link to series
  author: string;
  coverId: string;
}

// Search Webtoon (Official)
export async function searchWebtoon(query: string): Promise<WebtoonSearch[]> {
  try {
    const searchUrl = `${WEBTOON_URL}/en/search?keyword=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: WebtoonSearch[] = [];
    
    $('#content > div.card_wrap.search > ul > li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const title = $el.find('p.subj').text();
      const author = $el.find('p.author').text();
      const img = $el.find('img').attr('src') || '';
      
      // Extract title_no (ID)
      const urlParams = new URLSearchParams(link.split('?')[1]);
      const id = urlParams.get('title_no');
      
      if (id && title) {
        results.push({
          title,
          id,
          author,
          coverId: img,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Webtoon search error:', error);
    return [];
  }
}

// Get Chapters
export async function getWebtoonChapters(seriesId: string): Promise<SourceChapter[]> {
  try {
    // We need to fetch the main series page to get the list
    // Webtoon paginates content. We might just get the first page (latest chapters) for now
    const response = await fetch(`${WEBTOON_URL}/en/action/tower-of-god/list?title_no=${seriesId}`);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const chapters: SourceChapter[] = [];
    
    $('#_listUl > li').each((_, el) => {
      const $el = $(el);
      const id = $el.attr('id')?.replace('episode_', '') || '';
      const title = $el.find('span.subj > span').text();
      const num = $el.find('span.tx').text().replace('#', '');
      const date = $el.find('span.date').text();
      
      if (id) {
        chapters.push({
          id: `${seriesId}:${id}`, // Composite ID
          source: 'webtoon',
          chapter: num,
          volume: null,
          title: title,
          language: 'en',
          pages: 0, // Unknown until loaded
          publishedAt: date,
          scanlationGroup: 'Official',
          externalUrl: `${WEBTOON_URL}/en/action/tower-of-god/episode/viewer?title_no=${seriesId}&episode_no=${id}`,
        });
      }
    });
    
    return chapters;
  } catch (error) {
    console.error('Webtoon chapter error:', error);
    return [];
  }
}

// Get Images
// Note: Webtoon images deny hotlinking. We might need a proxy or referer.
export async function getWebtoonImages(chapterId: string): Promise<string[]> {
  try {
    const [titleNo, episodeNo] = chapterId.split(':');
    const url = `${WEBTOON_URL}/en/action/tower-of-god/episode/viewer?title_no=${titleNo}&episode_no=${episodeNo}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://www.webtoons.com/'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const images: string[] = [];
    
    $('.viewer_img img').each((_, el) => {
      const src = $(el).attr('data-url');
      if (src) {
        // Use our proxy with the correct referrer
        const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&referer=${encodeURIComponent(WEBTOON_URL)}`;
        images.push(proxyUrl);
      }
    });
    
    return images;
  } catch (error) {
    console.error('Webtoon image fetch error:', error);
    return [];
  }
}
