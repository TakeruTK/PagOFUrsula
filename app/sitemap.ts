import type { MetadataRoute } from 'next';
import { legalDocs, legalPath, locales, pageKeys, pagePath, piecePath, homePath, type Locale } from '@/lib/i18n';
import { absolute } from '@/lib/seo';
import { getPieces } from '@/lib/store';
export const dynamic = 'force-dynamic';

// Every entry lists all language versions so search engines pair them (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  const entry = (paths: Record<Locale, string>, priority: number, changeFrequency: 'weekly' | 'monthly', lastModified?: Date): MetadataRoute.Sitemap =>
    locales.map(l => ({ url: absolute(paths[l]), lastModified, changeFrequency, priority, alternates: { languages: Object.fromEntries(locales.map(x => [x, absolute(paths[x])])) } }));
  const all = (f: (l: Locale) => string) => Object.fromEntries(locales.map(l => [l, f(l)])) as Record<Locale, string>;
  return [
    ...entry(all(homePath), 1, 'weekly', new Date()),
    ...pageKeys.flatMap(key => entry(all(l => pagePath(l, key)), key === 'collection' ? 0.9 : 0.7, 'monthly')),
    ...getPieces().flatMap(p => entry(all(l => piecePath(l, p.slug)), 0.8, 'weekly')),
    ...legalDocs.flatMap(doc => entry(all(l => legalPath(l, doc)), 0.3, 'monthly')),
  ];
}
