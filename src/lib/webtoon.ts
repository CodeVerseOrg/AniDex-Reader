import * as cheerio from 'cheerio';
import type { SourceChapter } from '@/types';

const WEBTOON_URL = 'https://www.webtoons.com';

// Webtoon Interfaces
interface WebtoonSearch {
  title: string;
  id: string; // title_no
  author: string;
  coverId: string;
  genre: string;
  url: string;
}

interface WebtoonSeries {
  title: string;
  id: string;
  author: string;
  coverUrl: string;
  description: string;
  genre: string;
  totalEpisodes: number;
}

// Search Webtoon (Official)
export async function searchWebtoon(query: string): Promise<WebtoonSearch[]> {
  try {
    const searchUrl = `${WEBTOON_URL}/en/search?keyword=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const results: WebtoonSearch[] = [];
    
    // Search results in card wrap
    $('#content .card_wrap.search li, .search_result li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const title = $el.find('.subj, .title').first().text().trim();
      const author = $el.find('.author, .by').first().text().trim();
      const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
      const genre = $el.find('.genre').text().trim();
      
      // Extract title_no (ID) from URL
      const match = link.match(/title_no=(\d+)/);
      const id = match ? match[1] : '';
      
      if (id && title) {
        results.push({
          title,
          id,
          author,
          coverId: img,
          genre,
          url: link.startsWith('http') ? link : `${WEBTOON_URL}${link}`,
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Webtoon search error:', error);
    return [];
  }
}

// Get series info and chapters URL pattern
export async function getWebtoonSeriesInfo(titleNo: string): Promise<WebtoonSeries | null> {
  try {
    // First, get the series page to find the correct genre/path
    const listUrl = `${WEBTOON_URL}/en/episodeList?titleNo=${titleNo}`;
    const response = await fetch(listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': WEBTOON_URL,
      },
      redirect: 'follow',
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('h1.subj, .detail_header .subj').first().text().trim();
    const author = $('.author_area, .author').first().text().trim();
    const coverUrl = $('.detail_body img, .thmb img').first().attr('src') || '';
    const description = $('.summary, .detail_body p').first().text().trim();
    const genre = $('.genre, .info .genre').first().text().trim();
    
    // Get total episodes from pagination or list
    const episodeCount = $('#_listUl li, .episode_lst li').length;
    
    return {
      title,
      id: titleNo,
      author,
      coverUrl,
      description,
      genre,
      totalEpisodes: episodeCount,
    };
  } catch (error) {
    console.error('Webtoon series info error:', error);
    return null;
  }
}

// Get Chapters - Fixed to work with any series
export async function getWebtoonChapters(seriesId: string, page: number = 1): Promise<SourceChapter[]> {
  try {
    // Use the universal episodeList endpoint
    const listUrl = `${WEBTOON_URL}/en/episodeList?titleNo=${seriesId}&page=${page}`;
    
    const response = await fetch(listUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': WEBTOON_URL,
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const chapters: SourceChapter[] = [];
    
    // Try multiple selectors for episode list
    $('#_listUl li, .episode_lst li, ul[id*="list"] li').each((_, el) => {
      const $el = $(el);
      
      // Get episode number from various attributes
      let episodeNo = $el.attr('data-episode-no') || 
                      $el.attr('id')?.replace('episode_', '') ||
                      $el.find('a').attr('href')?.match(/episode_no=(\d+)/)?.[1] || '';
      
      const title = $el.find('.subj span, .episode_title, .sub_title').first().text().trim();
      const num = $el.find('.tx, .num, .episode_num').first().text().replace('#', '').trim();
      const date = $el.find('.date, .update_date').first().text().trim();
      const link = $el.find('a').attr('href') || '';
      
      // Extract episode_no from link if not found
      if (!episodeNo && link) {
        const match = link.match(/episode_no=(\d+)/);
        if (match) episodeNo = match[1];
      }
      
      if (episodeNo) {
        chapters.push({
          id: `${seriesId}:${episodeNo}`,
          source: 'webtoon',
          chapter: num || episodeNo,
          volume: null,
          title: title || `Episode ${num || episodeNo}`,
          language: 'en',
          pages: 0,
          publishedAt: date,
          scanlationGroup: 'Official Webtoon',
          externalUrl: link.startsWith('http') ? link : `${WEBTOON_URL}${link}`,
        });
      }
    });
    
    return chapters;
  } catch (error) {
    console.error('Webtoon chapter error:', error);
    return [];
  }
}

// Get ALL chapters (paginated)
export async function getAllWebtoonChapters(seriesId: string): Promise<SourceChapter[]> {
  const allChapters: SourceChapter[] = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= 50) { // Max 50 pages safety limit
    const chapters = await getWebtoonChapters(seriesId, page);
    
    if (chapters.length === 0) {
      hasMore = false;
    } else {
      allChapters.push(...chapters);
      page++;
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return allChapters;
}

// Get Images - Fixed to work with any series
export async function getWebtoonImages(chapterId: string): Promise<string[]> {
  try {
    const [titleNo, episodeNo] = chapterId.split(':');
    
    // Use the viewer URL pattern
    const viewerUrl = `${WEBTOON_URL}/en/viewer?titleNo=${titleNo}&episodeNo=${episodeNo}`;
    
    const response = await fetch(viewerUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': WEBTOON_URL,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      }
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const images: string[] = [];
    
    // Multiple selectors for image containers
    $('#_imageList img, .viewer_img img, .content_img img, img[data-url]').each((_, el) => {
      const src = $(el).attr('data-url') || $(el).attr('src') || '';
      
      // Filter out non-content images
      if (src && !src.includes('banner') && !src.includes('thumb') && src.includes('webtoon')) {
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
