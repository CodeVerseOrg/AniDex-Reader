// Telegram Bot Integration for Manga Storage and Fetching
// Uses Telegram as a backend to store and retrieve manga data

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8322648904:AAFJOwWHY8rfem3vM3vQ1jU8qXI-bfAk69o';
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Types for Telegram responses
interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  photo?: Array<{
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  }>;
  document?: {
    file_id: string;
    file_unique_id: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
  };
}

interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

interface TelegramResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

// Storage channel ID (set this to your channel/group ID for storing manga data)
let STORAGE_CHAT_ID: number | string = process.env.TELEGRAM_STORAGE_CHAT_ID || '';

// Cache for manga data stored in Telegram (in-memory + persistent index)
interface MangaCache {
  [key: string]: {
    fileIds: string[];
    timestamp: number;
  };
}

const mangaCache: MangaCache = {};

// Persistent index stored in Telegram (message IDs mapping to chapters)
interface ChapterIndex {
  [mangaId: string]: {
    [chapterId: string]: string[]; // file IDs
  };
}

let chapterIndex: ChapterIndex = {};

/**
 * Send a request to Telegram Bot API
 */
async function telegramRequest<T>(method: string, params: Record<string, any> = {}): Promise<TelegramResponse<T>> {
  try {
    const response = await fetch(`${TELEGRAM_API}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    return await response.json();
  } catch (error) {
    console.error(`Telegram API error (${method}):`, error);
    return { ok: false, description: String(error) };
  }
}

/**
 * Get bot information and verify token
 */
export async function getBotInfo() {
  const response = await telegramRequest<{
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
  }>('getMe');
  
  return response.ok ? response.result : null;
}

/**
 * Set the storage chat ID (channel or group where manga will be stored)
 */
export function setStorageChatId(chatId: number | string) {
  STORAGE_CHAT_ID = chatId;
}

/**
 * Get file download URL from Telegram
 */
export async function getFileUrl(fileId: string): Promise<string | null> {
  const response = await telegramRequest<TelegramFile>('getFile', {
    file_id: fileId,
  });
  
  if (response.ok && response.result?.file_path) {
    return `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${response.result.file_path}`;
  }
  
  return null;
}

/**
 * Store manga chapter images to Telegram
 * Returns array of file IDs for later retrieval
 */
export async function storeMangaImages(
  mangaId: string,
  chapterId: string,
  imageUrls: string[]
): Promise<string[]> {
  if (!STORAGE_CHAT_ID) {
    console.error('Telegram storage chat ID not set');
    return [];
  }

  const fileIds: string[] = [];
  const cacheKey = `${mangaId}:${chapterId}`;

  // Check cache first
  if (mangaCache[cacheKey] && Date.now() - mangaCache[cacheKey].timestamp < 86400000) {
    return mangaCache[cacheKey].fileIds;
  }

  // Send each image to Telegram
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const response = await telegramRequest<TelegramMessage>('sendPhoto', {
        chat_id: STORAGE_CHAT_ID,
        photo: imageUrls[i],
        caption: `${mangaId}|${chapterId}|${i + 1}/${imageUrls.length}`,
        disable_notification: true,
      });

      if (response.ok && response.result?.photo) {
        // Get the largest photo size
        const largestPhoto = response.result.photo[response.result.photo.length - 1];
        fileIds.push(largestPhoto.file_id);
      }
      
      // Rate limiting - don't spam Telegram
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to store image ${i + 1}:`, error);
    }
  }

  // Cache the file IDs
  if (fileIds.length > 0) {
    mangaCache[cacheKey] = {
      fileIds,
      timestamp: Date.now(),
    };
    
    // Update chapter index
    if (!chapterIndex[mangaId]) {
      chapterIndex[mangaId] = {};
    }
    chapterIndex[mangaId][chapterId] = fileIds;
  }

  return fileIds;
}

/**
 * Get stored file IDs for a chapter from cache/index
 */
export async function getStoredChapterFileIds(mangaId: string, chapterId: string): Promise<string[]> {
  const cacheKey = `${mangaId}:${chapterId}`;
  
  // Check in-memory cache first
  if (mangaCache[cacheKey] && Date.now() - mangaCache[cacheKey].timestamp < 86400000) {
    return mangaCache[cacheKey].fileIds;
  }
  
  // Check chapter index
  if (chapterIndex[mangaId]?.[chapterId]) {
    return chapterIndex[mangaId][chapterId];
  }
  
  return [];
}

/**
 * Retrieve manga chapter images from Telegram storage
 */
export async function getMangaImagesFromTelegram(fileIds: string[]): Promise<string[]> {
  const urls: string[] = [];

  for (const fileId of fileIds) {
    const url = await getFileUrl(fileId);
    if (url) {
      urls.push(url);
    }
  }

  return urls;
}

/**
 * Store manga metadata as a document in Telegram
 */
export async function storeMangaMetadata(
  mangaId: string,
  metadata: Record<string, any>
): Promise<string | null> {
  if (!STORAGE_CHAT_ID) {
    console.error('Telegram storage chat ID not set');
    return null;
  }

  try {
    // Store as a text message with JSON data
    const response = await telegramRequest<TelegramMessage>('sendMessage', {
      chat_id: STORAGE_CHAT_ID,
      text: `MANGA_META:${mangaId}\n${JSON.stringify(metadata, null, 2)}`,
      disable_notification: true,
    });

    if (response.ok && response.result) {
      return response.result.message_id.toString();
    }
  } catch (error) {
    console.error('Failed to store manga metadata:', error);
  }

  return null;
}

/**
 * Search for cached manga data in Telegram
 * Note: This requires setting up a database or using Telegram's search
 */
export async function searchStoredManga(query: string): Promise<string[]> {
  // For now, return from local cache
  // In production, you might want to use a proper database
  const results: string[] = [];
  
  for (const key of Object.keys(mangaCache)) {
    if (key.toLowerCase().includes(query.toLowerCase())) {
      results.push(key);
    }
  }

  return results;
}

/**
 * Send manga notification to a user/channel
 */
export async function sendMangaNotification(
  chatId: number | string,
  mangaTitle: string,
  chapterNumber: string,
  coverUrl?: string
): Promise<boolean> {
  try {
    const text = `📚 New Chapter Available!\n\n*${mangaTitle}*\nChapter ${chapterNumber}`;
    
    if (coverUrl) {
      const response = await telegramRequest<TelegramMessage>('sendPhoto', {
        chat_id: chatId,
        photo: coverUrl,
        caption: text,
        parse_mode: 'Markdown',
      });
      return response.ok;
    } else {
      const response = await telegramRequest<TelegramMessage>('sendMessage', {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      });
      return response.ok;
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

/**
 * Handle incoming webhook updates from Telegram
 */
export async function handleTelegramUpdate(update: any): Promise<void> {
  if (update.message) {
    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || '';

    // Handle commands
    if (text.startsWith('/start')) {
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: '👋 Welcome to AniDex Reader Bot!\n\nCommands:\n/search <title> - Search for manga\n/subscribe <manga_id> - Get notifications\n/help - Show help',
      });
    } else if (text.startsWith('/search ')) {
      const query = text.replace('/search ', '').trim();
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: `🔍 Searching for: ${query}\n\nVisit https://anidex-reader.netlify.app/search?q=${encodeURIComponent(query)}`,
      });
    } else if (text.startsWith('/help')) {
      await telegramRequest('sendMessage', {
        chat_id: chatId,
        text: '📖 AniDex Reader Bot Help\n\n/search <title> - Search manga\n/subscribe <id> - Subscribe to updates\n\nVisit: https://anidex-reader.netlify.app',
      });
    }
  }
}

/**
 * Set up webhook for receiving Telegram updates
 */
export async function setWebhook(webhookUrl: string): Promise<boolean> {
  const response = await telegramRequest<boolean>('setWebhook', {
    url: webhookUrl,
    allowed_updates: ['message', 'callback_query'],
  });
  
  return response.ok;
}

/**
 * Remove webhook (for switching to polling)
 */
export async function deleteWebhook(): Promise<boolean> {
  const response = await telegramRequest<boolean>('deleteWebhook');
  return response.ok;
}
