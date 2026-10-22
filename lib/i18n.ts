// Spanish serves Latin America and Spain, English is the common language of Europe and the world,
// Portuguese serves Brazil and Portugal, and French serves France, Belgium and Switzerland.
export const locales = ['es', 'en', 'pt', 'fr'] as const;
export type Locale = (typeof locales)[number];
const defaultLocale: Locale = 'es';
export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { es: 'es', en: 'en', pt: 'pt', fr: 'fr' };
export const ogLocale: Record<Locale, string> = { es: 'es_LA', en: 'en_US', pt: 'pt_BR', fr: 'fr_FR' };
export const intlLocale: Record<Locale, string> = { es: 'es-CL', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR' };
/** Language names written in their own language, for the switcher. */
export const nativeName: Record<Locale, string> = { es: 'Español', en: 'English', pt: 'Português', fr: 'Français' };

export type LegalDoc = 'terms' | 'privacy';
export const legalDocs: LegalDoc[] = ['terms', 'privacy'];

// URL segments are translated so that each language has natural, indexable addresses.
export type PageKey = 'collection' | 'about' | 'contact';
export const pageKeys: PageKey[] = ['collection', 'about', 'contact'];
type Segments = { piece: string; terms: string; privacy: string; collection: string; about: string; contact: string };
const segments: Record<Locale, Segments> = {
  es: { piece: 'joyas', terms: 'terminos', privacy: 'privacidad', collection: 'coleccion', about: 'sobre-mi', contact: 'contacto' },
  en: { piece: 'jewelry', terms: 'terms', privacy: 'privacy', collection: 'collection', about: 'about', contact: 'contact' },
  pt: { piece: 'joias', terms: 'termos', privacy: 'privacidade', collection: 'colecao', about: 'sobre', contact: 'contato' },
  fr: { piece: 'bijoux', terms: 'conditions', privacy: 'confidentialite', collection: 'collection', about: 'a-propos', contact: 'contact' },
};
const segmentKeys = ['piece', 'terms', 'privacy', 'collection', 'about', 'contact'] as const;

export const homePath = (locale: Locale) => `/${locale}`;
export const piecePath = (locale: Locale, slug: string) => `/${locale}/${segments[locale].piece}/${slug}`;
export const pagePath = (locale: Locale, key: PageKey) => `/${locale}/${segments[locale][key]}`;
export const legalPath = (locale: Locale, doc: LegalDoc) => `/${locale}/${segments[locale][doc]}`;

/** Translates the current pathname into the equivalent page of another language. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  const from = parts[0];
  if (!from || !isLocale(from)) return homePath(to);
  const rest = parts.slice(1);
  if (rest.length) {
    const key = segmentKeys.find(k => segments[from][k] === rest[0]);
    if (key) rest[0] = segments[to][key];
  }
  return `/${[to, ...rest].join('/')}`;
}

/**
 * The internal route behind a pretty address ("/pt/colecao" is rendered by "/pt/s/collection"),
 * or null when the address needs no rewriting. One table drives every language.
 */
export function internalPath(pathname: string): string | null {
  const [, locale, segment, slug, ...extra] = pathname.split('/');
  if (!locale || !isLocale(locale) || !segment || extra.length) return null;
  const key = segmentKeys.find(k => segments[locale][k] === segment);
  if (!key) return null;
  if (key === 'piece') return slug ? `/${locale}/p/${slug}` : null;
  if (slug) return null;
  if (key === 'terms' || key === 'privacy') return `/${locale}/legal/${key}`;
  return `/${locale}/s/${key}`;
}

/** The public address of a route: server rendering reports the internal one ("/pt/s/collection"), browsers the pretty one. */
export function prettyPath(pathname: string): string {
  const [, locale, kind, name, ...extra] = pathname.split('/');
  if (!locale || !isLocale(locale) || !name || extra.length) return pathname;
  if (kind === 'p') return piecePath(locale, name);
  const key = kind === 's' ? pageKeys.find(k => k === name) : kind === 'legal' ? legalDocs.find(d => d === name) : undefined;
  return key ? `/${locale}/${segments[locale][key]}` : pathname;
}

export function negotiateLocale(acceptLanguage: string | null, cookie?: string | null): Locale {
  if (cookie && isLocale(cookie)) return cookie;
  if (!acceptLanguage) return defaultLocale;
  const ranked = acceptLanguage
    .split(',')
    .map(part => {
      const [tag, q] = part.trim().split(';q=');
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of ranked) {
    const match = locales.find(l => tag === l || tag.startsWith(`${l}-`));
    if (match) return match;
  }
  // Visitors whose language we do not translate are better served in English.
  return 'en';
}
