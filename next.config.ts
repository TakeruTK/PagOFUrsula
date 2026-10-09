import type { NextConfig } from 'next';

// Evaluated at build time, so only things that never change per environment live here.
// Per-environment indexing headers are set at runtime in proxy.ts.
const security = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const config: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  devIndicators: false,
  serverExternalPackages: ['node:sqlite'],
  async rewrites() {
    // Each language has natural addresses; they all render the same internal routes.
    return [
      { source: '/es/joyas/:slug', destination: '/es/p/:slug' },
      { source: '/en/jewelry/:slug', destination: '/en/p/:slug' },
      { source: '/es/terminos', destination: '/es/legal/terms' },
      { source: '/es/privacidad', destination: '/es/legal/privacy' },
      { source: '/es/envios-y-devoluciones', destination: '/es/legal/shipping' },
      { source: '/en/terms', destination: '/en/legal/terms' },
      { source: '/en/privacy', destination: '/en/legal/privacy' },
      { source: '/en/shipping-returns', destination: '/en/legal/shipping' },
    ];
  },
  async headers() {
    return [{ source: '/:path*', headers: security }];
  },
};
export default config;
