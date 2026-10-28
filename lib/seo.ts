import type { Metadata } from 'next';
import { allowIndexing, siteUrl } from './config';
import { locales, ogLocale, pagePath, type Locale, type PageKey } from './i18n';

export const absolute = (path: string) => `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Canonical + hreflang. `paths` maps each language the page really exists in to its address; languages without
 * a version are left out so search engines never pair a page with a copy that is not written in that language.
 */
export function alternates(locale: Locale, paths: Partial<Record<Locale, string>>, ownPath?: string): Metadata['alternates'] {
  return {
    canonical: absolute(paths[locale] ?? ownPath ?? '/'),
    languages: { ...Object.fromEntries(Object.entries(paths).map(([l, p]) => [l, absolute(p)])), 'x-default': absolute('/') },
  };
}
/** BreadcrumbList for a page: Home is always first. */
export const breadcrumbs = (trail: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absolute(item.path) })),
});
export const robotsMeta = (): Metadata['robots'] => (allowIndexing() ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: false });
export const openGraphBase = (locale: Locale) => ({ siteName: 'Ursula Alcaino · Orfebrería', locale: ogLocale[locale], alternateLocale: locales.filter(l => l !== locale).map(l => ogLocale[l]), type: 'website' as const });

/** Serialises JSON-LD safely for a <script> tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

/** Metadata for the static pages (collection, about, contact), with every language version linked. */
export function pageMetadata(locale: Locale, key: PageKey, title: string, description: string): Metadata {
  const paths = Object.fromEntries(locales.map(l => [l, pagePath(l, key)])) as Record<Locale, string>;
  return {
    title, description, alternates: alternates(locale, paths),
    openGraph: { ...openGraphBase(locale), title, description, url: absolute(paths[locale]) },
    twitter: { card: 'summary_large_image', title, description },
  };
}
