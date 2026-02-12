import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { urlFriendlySlug } from './src/routes';

function applySecurityHeaders(response: NextResponse, pathname: string) {
  // Basic security headers for all routes
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  // Frame options (except for embeds)
  if (!pathname.startsWith('/embed/')) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // Enhanced Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'serial=()',
      'bluetooth=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'ambient-light-sensor=()',
      'autoplay=(self)',
    ].join(', '),
  );

  // Strict Transport Security for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  // Enhanced Content Security Policy
  const cspEnabled = process.env.CONTENT_SECURITY_POLICY_ENABLED !== 'false';
  if (cspEnabled) {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "media-src 'self' blob: data:",
      "connect-src 'self' https://www.google-analytics.com https://generativelanguage.googleapis.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'block-all-mixed-content',
      'upgrade-insecure-requests',
    ];

    // Allow more relaxed CSP for development
    if (process.env.NODE_ENV === 'development') {
      cspDirectives[1] =
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://gc.zgo.at https://localhost:* ws: wss:";
      cspDirectives[4] =
        "img-src 'self' data: blob: https: http: https://localhost:*";
      cspDirectives[6] =
        "connect-src 'self' https://www.google-analytics.com https://generativelanguage.googleapis.com https://gc.zgo.at https://localhost:* ws: wss:";
    }

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  }

  // Additional security headers
  response.headers.set('Cross-Origin-Embedder-Policy', 'credentialless');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  // Server identification removal
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect username-based card URLs to canonical gallery route
  const userCardMatch = pathname.match(/^\/u\/([^/]+)\/card\/(\d+)$/);
  if (userCardMatch) {
    const cardId = userCardMatch[1];
    const url = request.nextUrl.clone();
    url.pathname = `/gallery/${cardId}`;
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // Handle special-packs category slug normalization
  const specialPacksMatch = pathname.match(
    /^\/special-packs\/([^/]+)(?:\/.*)?$/,
  );
  if (specialPacksMatch) {
    const categorySlug = specialPacksMatch[1];
    const normalizedSlug = urlFriendlySlug(decodeURIComponent(categorySlug));

    // If the slug needs normalization, redirect to canonical URL
    if (categorySlug !== normalizedSlug && normalizedSlug !== '') {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace(
        `/special-packs/${categorySlug}`,
        `/special-packs/${normalizedSlug}`,
      );
      return NextResponse.redirect(url, 301); // Permanent redirect
    }
  }

  const response = NextResponse.next();

  // Apply security headers to all responses
  applySecurityHeaders(response, pathname);

  // Special handling for embed routes
  if (pathname.startsWith('/embed/')) {
    response.headers.set('X-Frame-Options', 'ALLOWALL');
    response.headers.set('Content-Security-Policy', 'frame-ancestors *');
  }

  // API route security
  if (pathname.startsWith('/api/')) {
    // Rate limiting headers for API routes
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Window', '60');

    // Prevent caching of sensitive API responses
    if (pathname.includes('/credits')) {
      response.headers.set(
        'Cache-Control',
        'private, no-cache, no-store, must-revalidate',
      );
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|robots.txt|sitemap.xml).*)',
  ],
};
