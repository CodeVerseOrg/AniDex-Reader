import { NextRequest, NextResponse } from 'next/server';

const MANGADEX_API = 'https://api.mangadex.org';
const MANGADEX_API_KEY = process.env.MANGADEX_API_KEY || 'IfJ99BGvK1TkFyNsZFXWIvh9YwBvzV8e';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const apiPath = path.join('/');
    const searchParams = request.nextUrl.searchParams;

    // Build the full API URL
    const url = new URL(`/${apiPath}`, MANGADEX_API);
    
    // Copy all query parameters
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'AniDex-Reader/1.0',
    };

    // Add API key if available (for authenticated requests)
    if (MANGADEX_API_KEY) {
      headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
    }

    // Forward the request to MangaDex API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'MangaDex API error', status: response.status },
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
    console.error('MangaDex proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from MangaDex API' },
      { status: 500 }
    );
  }
}

// Support POST for MangaDex@Home reporting
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const apiPath = path.join('/');
    const body = await request.json();

    const url = new URL(`/${apiPath}`, MANGADEX_API);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'User-Agent': 'AniDex-Reader/1.0',
    };

    if (MANGADEX_API_KEY) {
      headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'MangaDex API error', status: response.status },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('MangaDex proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to post to MangaDex API' },
      { status: 500 }
    );
  }
}
