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
  async headers() {
    return [{ source: '/:path*', headers: security }];
  },
};
export default config;
