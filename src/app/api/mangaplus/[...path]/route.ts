import { NextRequest, NextResponse } from 'next/server';

const MANGAPLUS_API_URL = 'https://jumpg-webapi.tokyo-cdn.com/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams;
  
  // Build the MangaPlus API URL
  const url = new URL(`${MANGAPLUS_API_URL}/${pathString}`);
  
  // Forward query parameters
  searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });
  
  // Always request JSON format
  if (!url.searchParams.has('format')) {
    url.searchParams.append('format', 'json');
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
        'Accept': 'application/json',
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `MangaPlus API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('MangaPlus proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from MangaPlus' },
      { status: 500 }
    );
  }
}
