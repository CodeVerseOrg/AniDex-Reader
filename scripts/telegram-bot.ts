#!/usr/bin/env npx ts-node
/**
 * Telegram Bot Polling Script
 * Run this to make the bot respond to commands
 * 
 * Usage: npx ts-node scripts/telegram-bot.ts
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8322648904:AAFJOwWHY8rfem3vM3vQ1jU8qXI-bfAk69o';
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SITE_URL = 'https://anidex-reader.netlify.app';

let lastUpdateId = 0;

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; username?: string; first_name: string };
    chat: { id: number; type: string; title?: string };
    text?: string;
    date: number;
  };
}

async function sendMessage(chatId: number, text: string, parseMode?: string) {
  try {
    const response = await fetch(`${API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: false,
      }),
    });
    const data = await response.json();
    if (!data.ok) {
      console.error('Send error:', data.description);
    }
    return data;
  } catch (error) {
    console.error('Send failed:', error);
  }
}

// Webtoon API functions
async function searchWebtoonAPI(query: string) {
  try {
    const searchUrl = `https://www.webtoons.com/en/search?keyword=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    
    // Simple regex extraction for search results
    const results: { title: string; id: string; author: string }[] = [];
    const titleRegex = /title_no=(\d+)[^>]*>([^<]+)/g;
    let match;
    
    while ((match = titleRegex.exec(html)) !== null && results.length < 5) {
      results.push({
        id: match[1],
        title: match[2].trim(),
        author: ''
      });
    }
    
    return results;
  } catch (error) {
    console.error('Webtoon search error:', error);
    return [];
  }
}

async function getWebtoonChaptersAPI(titleNo: string) {
  try {
    const listUrl = `https://www.webtoons.com/en/episodeList?titleNo=${titleNo}`;
    const response = await fetch(listUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    
    // Extract episode info
    const episodes: { num: string; title: string; id: string }[] = [];
    const episodeRegex = /episode_no=(\d+)[^>]*>\s*<[^>]*>\s*#?(\d+)[^<]*<[^>]*>([^<]*)/g;
    let match;
    
    while ((match = episodeRegex.exec(html)) !== null && episodes.length < 10) {
      episodes.push({
        id: match[1],
        num: match[2],
        title: match[3].trim() || `Episode ${match[2]}`
      });
    }
    
    return episodes;
  } catch (error) {
    console.error('Webtoon chapters error:', error);
    return [];
  }
}

async function handleCommand(chatId: number, text: string, from: string) {
  const command = text.split(' ')[0].toLowerCase().replace('@anidex_reader_bot', '');
  const args = text.substring(command.length).trim();

  console.log(`[${new Date().toISOString()}] Command: ${command} from ${from}`);

  switch (command) {
    case '/start':
      await sendMessage(chatId, 
        `👋 Welcome to AniDex Reader Bot!\n\n` +
        `📖 *Commands:*\n` +
        `/search <title> - Search for manga\n` +
        `/webtoon <title> - Search Webtoon directly\n` +
        `/chapters <id> - Get chapters for a Webtoon\n` +
        `/popular - View popular manga\n` +
        `/trending - View trending manga\n` +
        `/help - Show this help\n\n` +
        `🔗 *Website:* ${SITE_URL}`,
        'Markdown'
      );
      break;

    case '/help':
      await sendMessage(chatId,
        `📚 *AniDex Reader Bot Help*\n\n` +
        `*Available Commands:*\n` +
        `• /search <title> - Search manga by title\n` +
        `• /webtoon <title> - Search Webtoon.com\n` +
        `• /chapters <id> - Get chapters (use ID from /webtoon)\n` +
        `• /popular - Browse popular manga\n` +
        `• /trending - Browse trending manga\n\n` +
        `*How to Read:*\n` +
        `1. Use /webtoon to search\n` +
        `2. Use /chapters <id> to see episodes\n` +
        `3. Click link to read!\n\n` +
        `🔗 ${SITE_URL}`,
        'Markdown'
      );
      break;

    case '/search':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a search query.\n\nExample: `/search One Piece`', 'Markdown');
      } else {
        const searchUrl = `${SITE_URL}/search?q=${encodeURIComponent(args)}`;
        await sendMessage(chatId,
          `🔍 *Searching for:* ${args}\n\n` +
          `📖 Click here to view results:\n${searchUrl}`,
          'Markdown'
        );
      }
      break;

    case '/webtoon':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a title to search.\n\nExample: `/webtoon Tower of God`', 'Markdown');
      } else {
        await sendMessage(chatId, `🔍 Searching Webtoon for: ${args}...`);
        const results = await searchWebtoonAPI(args);
        
        if (results.length === 0) {
          await sendMessage(chatId, `❌ No results found for "${args}"`);
        } else {
          let message = `📚 *Webtoon Results for "${args}":*\n\n`;
          results.forEach((r, i) => {
            message += `${i + 1}. *${r.title}*\n   ID: \`${r.id}\`\n   📖 /chapters\\_${r.id}\n\n`;
          });
          message += `Use /chapters <id> to see episodes!`;
          await sendMessage(chatId, message, 'Markdown');
        }
      }
      break;

    case '/chapters':
      if (!args) {
        await sendMessage(chatId, '❌ Please provide a Webtoon ID.\n\nExample: `/chapters 95` (Tower of God)', 'Markdown');
      } else {
        const titleNo = args.replace('_', '');
        await sendMessage(chatId, `📖 Fetching chapters for ID: ${titleNo}...`);
        const chapters = await getWebtoonChaptersAPI(titleNo);
        
        if (chapters.length === 0) {
          await sendMessage(chatId, `❌ No chapters found for ID ${titleNo}. Make sure the ID is correct.`);
        } else {
          let message = `📚 *Latest Chapters (ID: ${titleNo}):*\n\n`;
          chapters.forEach((ch) => {
            const readUrl = `https://www.webtoons.com/en/viewer?titleNo=${titleNo}&episodeNo=${ch.id}`;
            message += `📖 #${ch.num}: ${ch.title}\n🔗 [Read Episode](${readUrl})\n\n`;
          });
          await sendMessage(chatId, message, 'Markdown');
        }
      }
      break;

    case '/popular':
      await sendMessage(chatId,
        `🔥 *Popular Manga*\n\n` +
        `Browse the most popular manga:\n${SITE_URL}/popular`,
        'Markdown'
      );
      break;

    case '/trending':
      await sendMessage(chatId,
        `📈 *Trending Manga*\n\n` +
        `See what's trending now:\n${SITE_URL}/trending`,
        'Markdown'
      );
      break;

    default:
      // Handle /chapters_<id> format
      if (command.startsWith('/chapters_')) {
        const titleNo = command.replace('/chapters_', '');
        await sendMessage(chatId, `📖 Fetching chapters for ID: ${titleNo}...`);
        const chapters = await getWebtoonChaptersAPI(titleNo);
        
        if (chapters.length === 0) {
          await sendMessage(chatId, `❌ No chapters found for ID ${titleNo}.`);
        } else {
          let message = `📚 *Latest Chapters:*\n\n`;
          chapters.forEach((ch) => {
            const readUrl = `https://www.webtoons.com/en/viewer?titleNo=${titleNo}&episodeNo=${ch.id}`;
            message += `📖 #${ch.num}: ${ch.title}\n🔗 [Read](${readUrl})\n\n`;
          });
          await sendMessage(chatId, message, 'Markdown');
        }
      }
      // Check if it's a mention without command
      else if (text.includes('@Anidex_Reader_bot')) {
        await sendMessage(chatId,
          `👋 Hi! I'm AniDex Reader Bot.\n\nUse /help to see available commands.`
        );
      }
  }
}

async function processUpdate(update: TelegramUpdate) {
  if (!update.message?.text) return;

  const { chat, text, from } = update.message;
  const username = from.username || from.first_name;

  // Only respond to commands (starting with /) or mentions
  if (text.startsWith('/') || text.includes('@Anidex_Reader_bot')) {
    await handleCommand(chat.id, text, username);
  }
}

async function pollUpdates() {
  try {
    const response = await fetch(`${API_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        await processUpdate(update);
      }
    }
  } catch (error) {
    console.error('Polling error:', error);
  }
}

async function main() {
  console.log('🤖 AniDex Reader Bot starting...');
  
  // Delete any existing webhook
  await fetch(`${API_URL}/deleteWebhook`);
  
  // Get bot info
  const meResponse = await fetch(`${API_URL}/getMe`);
  const meData = await meResponse.json();
  if (meData.ok) {
    console.log(`✅ Bot: @${meData.result.username}`);
  }

  console.log('📡 Polling for updates...\n');

  // Continuous polling loop
  while (true) {
    await pollUpdates();
  }
}

main().catch(console.error);
