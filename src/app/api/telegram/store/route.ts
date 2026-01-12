import { NextRequest, NextResponse } from 'next/server';
import { storeMangaImages, storeMangaMetadata, setStorageChatId } from '@/lib/telegram';

// Store manga data to Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, mangaId, chapterId, imageUrls, metadata, chatId } = body;

    // Optionally set storage chat ID
    if (chatId) {
      setStorageChatId(chatId);
    }

    switch (action) {
      case 'storeImages':
        if (!mangaId || !chapterId || !imageUrls) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const fileIds = await storeMangaImages(mangaId, chapterId, imageUrls);
        return NextResponse.json({ ok: true, fileIds });

      case 'storeMetadata':
        if (!mangaId || !metadata) {
          return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        const messageId = await storeMangaMetadata(mangaId, metadata);
        return NextResponse.json({ ok: true, messageId });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Telegram store error:', error);
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }
}
