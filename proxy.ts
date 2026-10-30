import { NextResponse, type NextRequest } from 'next/server';
import { allowIndexing, isHttps } from '@/lib/config';
import { internalPath, isLocale, negotiateLocale } from '@/lib/i18n';

const UNLOCALIZED = /^\/(?:api|admin|_next|references|robots\.txt$|sitemap\.xml$)|\.[a-z0-9]+$/i;

// Runs on every request, with the environment of the running server:
// 1) visitors without a language in the address are sent to the best one for them,
// 2) search engines are kept out unless ALLOW_INDEXING=true on an https site (private areas always stay out).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const parts = pathname.split('/');
  let response: NextResponse;
  if (!isLocale(parts[1]) && !UNLOCALIZED.test(pathname)) {
    const locale = negotiateLocale(request.headers.get('accept-language'), request.cookies.get('NEXT_LOCALE')?.value);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
    // Temporary redirect: the right language depends on who is asking.
    response = NextResponse.redirect(url, 307);
    response.headers.set('Vary', 'Accept-Language, Cookie');
  } else {
    // Pretty, translated addresses are rendered by the internal routes ("/pt/colecao" -> "/pt/s/collection").
    const target = internalPath(pathname);
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      // Behind a proxy that ends TLS, X-Forwarded-Proto makes this address look like https while the server itself only
      // speaks http: Next would then try to fetch the page from itself over TLS and fail with a 500.
      url.protocol = 'http:';
      response = NextResponse.rewrite(url);
    } else response = NextResponse.next();
  }
  const privateArea = pathname.startsWith('/admin') || pathname.startsWith('/api/');
  if (!allowIndexing() || privateArea) response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  // Public pages may be kept by a CDN for a minute (and served while it refreshes), so visitors far from the server
  // are answered from a nearby copy. Browsers always ask again, and the workshop and the API are never stored.
  if (allowIndexing() && !privateArea && isLocale(parts[1]) && request.method === 'GET') response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=600');
  if (isHttps()) response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|brand/|references/|favicon\.png|apple-touch-icon\.png).*)'] };
