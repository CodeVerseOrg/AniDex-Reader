import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for serverless (will reset between cold starts)
const cache = new Map<string, { data: unknown; expiry: number }>();

function getFromCache(key: string): unknown | null {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown, ttlSeconds: number): void {
  cache.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathString = path.join('/');
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  const cacheKey = `mangadex:${pathString}:${queryString}`;
  
  // Check cache
  const cached = getFromCache(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  }

  try {
    const url = new URL(`https://api.mangadex.org/${pathString}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: pathString.includes('at-home') ? 1800 : 300,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'MangaDex API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Cache the response
    const ttl = pathString.includes('at-home') ? 1800 : 300;
    setCache(cacheKey, data, ttl);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': `s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
      },
    });
  } catch (error) {
    console.error('MangaDex proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from MangaDex' },
      { status: 500 }
    );
  }
}
