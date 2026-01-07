import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  const referer = request.nextUrl.searchParams.get('referer');

  if (!url) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    const headers: HeadersInit = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    };

    if (referer) {
      headers['Referer'] = referer;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
        return new NextResponse(`Failed to fetch image: ${response.status}`, { status: response.status });
    }

    const blob = await response.blob();
    const headersOut = new Headers();
    headersOut.set('Content-Type', response.headers.get('Content-Type') || 'image/jpeg');
    headersOut.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(blob, {
      status: 200,
      headers: headersOut,
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
