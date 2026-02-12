import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    if (!url) {
      return new NextResponse('Missing url', { status: 400 });
    }

    // Only allow http(s) and block localhost SSRF
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) {
      return new NextResponse('Invalid protocol', { status: 400 });
    }
    if (/^(localhost|127\.0\.0\.1|::1)$/i.test(parsed.hostname)) {
      return new NextResponse('Blocked host', { status: 400 });
    }

    // Append cache-busting token if provided
    const cb = searchParams.get('_cb');
    if (cb) parsed.searchParams.set('_cb', cb);

    const res = await fetch(parsed.toString(), {
      // Do not forward cookies/credentials
      headers: { 'User-Agent': 'ImageProxy/1.0' },
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!res.ok) {
      return new NextResponse('Upstream error', { status: res.status });
    }

    const ct = res.headers.get('content-type') || 'application/octet-stream';
    const body = res.body;
    if (!body) {
      return new NextResponse('Empty body', { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': ct,
        // Disable caching to avoid stale images during HTML->canvas capture
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        Vary: 'Accept-Encoding',
        // Allow drawing to canvas without taint when used through same-origin proxy
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('image-proxy error:', e);
    return new NextResponse('Failed to proxy image', { status: 500 });
  }
}
