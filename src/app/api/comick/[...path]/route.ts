import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for serverless
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
  
  const cacheKey = `comick:${pathString}:${queryString}`;
  
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
    const url = new URL(`https://api.comick.fun/${pathString}`);
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'AniDex-Reader/1.0',
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Comick API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Cache for 5 minutes
    setCache(cacheKey, data, 300);

    return NextResponse.json(data, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Comick proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Comick' },
      { status: 500 }
    );
  }
}
