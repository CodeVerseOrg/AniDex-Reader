// Telegram Manga Gallery Integration
// Fetches manga from @Manga_Gallery and @Manga_Gallery_Index channels

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8322648904:AAFJOwWHY8rfem3vM3vQ1jU8qXI-bfAk69o';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Manga Gallery channels
const MANGA_GALLERY_ID = -1001200929866;
const MANGA_GALLERY_INDEX_ID = -1001566297640;
const MANGA_GALLERY_USERNAME = '@Manga_Gallery';
const MANGA_GALLERY_INDEX_USERNAME = '@Manga_Gallery_Index';

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
  }>;
  document?: {
    file_id: string;
    file_name?: string;
    mime_type?: string;
  };
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
    url?: string;
  }>;
  caption_entities?: Array<{
    type: string;
    offset: number;
    length: number;
    url?: string;
  }>;
}

interface MangaEntry {
  title: string;
  messageId: number;
  fileId?: string;
  caption?: string;
  date: string;
  url?: string;
}

interface MangaChapter {
  title: string;
  chapter: string;
  messageId: number;
  images: string[];
  date: string;
}

/**
 * Send a request to Telegram Bot API
 */
async function telegramRequest<T>(method: string, params: Record<string, any> = {}): Promise<{ ok: boolean; result?: T; description?: string }> {
  try {
    const response = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return await response.json();
  } catch (error) {
    console.error(`Telegram API error (${method}):`, error);
    return { ok: false, description: String(error) };
  }
}

/**
 * Get file download URL from Telegram
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  const response = await telegramRequest<{ file_path?: string }>('getFile', { file_id: fileId });
  
  if (response.ok && response.result?.file_path) {
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${response.result.file_path}`;
  }
  return null;
}

/**
 * Search for manga in Manga Gallery Index
 * The index channel contains hashtags and links to manga posts
 */
export async function searchMangaGallery(query: string): Promise<MangaEntry[]> {
  try {
    // Forward search to the request bot mentioned in the channel
    // For now, we'll search through recent messages
    const response = await telegramRequest<{ messages: TelegramMessage[] }>('getMessages', {
      chat_id: MANGA_GALLERY_INDEX_ID,
    });

    // Since getMessages isn't available for bots in public channels,
    // we need to use a different approach - search via inline or forwarding
    
    // Alternative: Use the channel's message history if bot is admin
    // For public channels, we can use getChatHistory with offset
    
    console.log('Searching Manga Gallery for:', query);
    return [];
  } catch (error) {
    console.error('Manga Gallery search error:', error);
    return [];
  }
}

/**
 * Get manga chapters from a specific manga thread/topic in Manga Gallery
 */
export async function getMangaGalleryChapters(mangaId: string): Promise<MangaChapter[]> {
  const chapters: MangaChapter[] = [];
  
  try {
    // The mangaId would be a message ID or thread ID
    // We can get replies/thread messages
    console.log('Getting chapters for manga:', mangaId);
  } catch (error) {
    console.error('Manga Gallery chapters error:', error);
  }
  
  return chapters;
}

/**
 * Get images from a chapter message in Manga Gallery
 */
export async function getMangaGalleryImages(messageId: number): Promise<string[]> {
  const images: string[] = [];
  
  try {
    // Get the message and extract photo/document file IDs
    // Then convert to download URLs
    console.log('Getting images for message:', messageId);
  } catch (error) {
    console.error('Manga Gallery images error:', error);
  }
  
  return images;
}

/**
 * Forward a manga post from Manga Gallery to our storage channel
 */
export async function forwardMangaToStorage(
  messageId: number,
  storageChatId: number | string
): Promise<boolean> {
  try {
    const response = await telegramRequest<TelegramMessage>('forwardMessage', {
      chat_id: storageChatId,
      from_chat_id: MANGA_GALLERY_ID,
      message_id: messageId,
    });
    
    return response.ok;
  } catch (error) {
    console.error('Forward error:', error);
    return false;
  }
}

/**
 * Copy manga images from Manga Gallery to our storage
 * This preserves the images in our channel for reliable access
 */
export async function copyMangaToStorage(
  messageIds: number[],
  storageChatId: number | string
): Promise<string[]> {
  const copiedFileIds: string[] = [];
  
  for (const messageId of messageIds) {
    try {
      const response = await telegramRequest<TelegramMessage>('copyMessage', {
        chat_id: storageChatId,
        from_chat_id: MANGA_GALLERY_ID,
        message_id: messageId,
      });
      
      if (response.ok && response.result) {
        // Get the copied message to extract file ID
        // The result contains the new message_id
        console.log('Copied message:', messageId);
      }
      
      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Copy error for message', messageId, error);
    }
  }
  
  return copiedFileIds;
}

/**
 * Get Manga Gallery channel link for a specific manga
 */
export function getMangaGalleryLink(messageId?: number): string {
  if (messageId) {
    return `https://t.me/Manga_Gallery/${messageId}`;
  }
  return 'https://t.me/Manga_Gallery';
}

/**
 * Parse manga title from message caption
 */
export function parseMangaTitle(caption: string): { title: string; chapter?: string } {
  // Common patterns in Manga Gallery:
  // "Title - Chapter XX" or "#Title Chapter XX" or "Title Ch.XX"
  
  const patterns = [
    /^#?(.+?)\s*[-–]\s*(?:Chapter|Ch\.?)\s*(\d+(?:\.\d+)?)/i,
    /^#?(.+?)\s+(?:Chapter|Ch\.?)\s*(\d+(?:\.\d+)?)/i,
    /^#(\w+)\s*$/,
  ];
  
  for (const pattern of patterns) {
    const match = caption.match(pattern);
    if (match) {
      return {
        title: match[1].trim().replace(/_/g, ' '),
        chapter: match[2],
      };
    }
  }
  
  // Return the whole caption as title if no pattern matches
  return { title: caption.split('\n')[0].replace(/^#/, '').trim() };
}

/**
 * Extract hashtags from caption
 */
export function extractHashtags(caption: string): string[] {
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  
  while ((match = hashtagRegex.exec(caption)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  
  return hashtags;
}

// Export channel info for reference
export const MANGA_GALLERY_INFO = {
  channelId: MANGA_GALLERY_ID,
  indexId: MANGA_GALLERY_INDEX_ID,
  username: MANGA_GALLERY_USERNAME,
  indexUsername: MANGA_GALLERY_INDEX_USERNAME,
  link: 'https://t.me/Manga_Gallery',
  indexLink: 'https://t.me/Manga_Gallery_Index',
};
