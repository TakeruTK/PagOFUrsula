import type { MetadataRoute } from 'next';
import { legalDocs, legalPath, locales, pageKeys, pagePath, piecePath, homePath, type Locale } from '@/lib/i18n';
import { isTranslated } from '@/lib/pieces';
import { absolute } from '@/lib/seo';
import { getPieces } from '@/lib/store';
export const dynamic = 'force-dynamic';

type Paths = Partial<Record<Locale, string>>;
// Every entry lists the language versions that really exist so search engines pair them (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (paths: Paths, priority: number, changeFrequency: 'weekly' | 'monthly', extra: { lastModified?: Date; images?: string[] } = {}): MetadataRoute.Sitemap =>
    (Object.entries(paths) as [Locale, string][]).map(([, p]) => ({
      url: absolute(p), ...extra, changeFrequency, priority,
      alternates: { languages: Object.fromEntries((Object.entries(paths) as [Locale, string][]).map(([l, x]) => [l, absolute(x)])) },
    }));
  const all = (f: (l: Locale) => string): Paths => Object.fromEntries(locales.map(l => [l, f(l)]));
  return [
    ...entry(all(homePath), 1, 'weekly', { lastModified: new Date() }),
    ...pageKeys.flatMap(key => entry(all(l => pagePath(l, key)), key === 'collection' ? 0.9 : 0.7, 'monthly')),
    ...getPieces().flatMap(piece => {
      const images = piece.images.filter(i => i.url.startsWith('/api/photos/')).map(i => absolute(i.url));
      return entry(Object.fromEntries(locales.filter(l => isTranslated(piece, l)).map(l => [l, piecePath(l, piece.slug)])), 0.8, 'weekly', { images });
    }),
    ...legalDocs.flatMap(doc => entry(all(l => legalPath(l, doc)), 0.3, 'monthly')),
  ];
}
