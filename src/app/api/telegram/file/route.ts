import { NextRequest, NextResponse } from 'next/server';
import { getFileUrl, getMangaImagesFromTelegram } from '@/lib/telegram';

// Proxy Telegram file downloads
export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get('fileId');
  const fileIds = request.nextUrl.searchParams.get('fileIds');

  if (fileId) {
    // Single file
    const url = await getFileUrl(fileId);
    if (url) {
      // Proxy the image through our server
      const response = await fetch(url);
      const blob = await response.blob();
      
      return new NextResponse(blob, {
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  if (fileIds) {
    // Multiple files - return URLs
    const ids = fileIds.split(',');
    const urls = await getMangaImagesFromTelegram(ids);
    return NextResponse.json({ urls });
  }

  return NextResponse.json({ error: 'Missing fileId or fileIds parameter' }, { status: 400 });
}
