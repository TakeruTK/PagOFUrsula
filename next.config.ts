import type { NextConfig } from 'next';

// Evaluated at build time, so only things that never change per environment live here.
// Per-environment indexing headers are set at runtime in proxy.ts.
const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Next.js needs inline scripts and styles; everything else is limited to this site.
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com; font-src 'self' data:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://www.google.com; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const config: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  poweredByHeader: false,
  // Photos and logos are served resized and as WebP, cached for a year (their addresses change when the picture changes).
  images: { formats: ['image/webp'], minimumCacheTTL: 31536000, deviceSizes: [480, 640, 750, 828, 1080, 1200, 1920], imageSizes: [96, 128, 256, 384] },
  // The page styles travel inside the HTML instead of a separate file that blocks the first paint.
  experimental: { inlineCss: true },
  serverExternalPackages: ['node:sqlite'],
  async headers() {
    return [{ source: '/:path*', headers: security }];
  },
};
export default config;
