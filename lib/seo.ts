import type { Metadata } from 'next';
import { allowIndexing, siteUrl } from './config';
import { locales, ogLocale, pagePath, type Locale, type PageKey } from './i18n';

export const absolute = (path: string) => `${siteUrl()}${path.startsWith('/') ? path : `/${path}`}`;

/** Canonical + hreflang for a page that exists in every language. `paths` maps each locale to its own address. */
export function alternates(locale: Locale, paths: Record<Locale, string>): Metadata['alternates'] {
  return {
    canonical: absolute(paths[locale]),
    languages: { ...Object.fromEntries(locales.map(l => [l, absolute(paths[l])])), 'x-default': absolute('/') },
  };
}
export const robotsMeta = (): Metadata['robots'] => (allowIndexing() ? { index: true, follow: true, 'max-image-preview': 'large' } : { index: false, follow: false });
export const openGraphBase = (locale: Locale) => ({ siteName: 'Úrsula Alcaíno · Orfebrería', locale: ogLocale[locale], alternateLocale: locales.filter(l => l !== locale).map(l => ogLocale[l]), type: 'website' as const });

/** Serialises JSON-LD safely for a <script> tag. */
export const jsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\u003c');

/** Metadata for the static pages (collection, about, contact), with every language version linked. */
export function pageMetadata(locale: Locale, key: PageKey, title: string, description: string): Metadata {
  const paths = Object.fromEntries(locales.map(l => [l, pagePath(l, key)])) as Record<Locale, string>;
  return {
    title, description, alternates: alternates(locale, paths),
    openGraph: { ...openGraphBase(locale), title, description, url: absolute(paths[locale]) },
    twitter: { card: 'summary_large_image', title, description },
  };
}
