// Server-side configuration read from environment variables.
// SITE_URL is read at runtime (NEXT_PUBLIC_* values would be frozen into the build).
export const siteUrl = () => (process.env.SITE_URL || process.env['NEXT_PUBLIC_SITE_URL'] || 'http://127.0.0.1:3002').replace(/\/+$/, '');
export const isHttps = () => siteUrl().startsWith('https://');
/** Search engines are only invited in once the owner approves the shop and sets ALLOW_INDEXING=true. */
export const allowIndexing = () => process.env.ALLOW_INDEXING === 'true' && isHttps();
