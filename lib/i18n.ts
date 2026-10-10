export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { es: 'es', en: 'en' };
export const ogLocale: Record<Locale, string> = { es: 'es_CL', en: 'en_US' };
export const intlLocale: Record<Locale, string> = { es: 'es-CL', en: 'en-US' };

export type LegalDoc = 'terms' | 'privacy';
export const legalDocs: LegalDoc[] = ['terms', 'privacy'];

// URL segments are translated so that each language has natural, indexable addresses.
export type PageKey = 'collection' | 'about' | 'contact';
export const pageKeys: PageKey[] = ['collection', 'about', 'contact'];
export const segments = {
  es: { piece: 'joyas', terms: 'terminos', privacy: 'privacidad', collection: 'coleccion', about: 'sobre-mi', contact: 'contacto' },
  en: { piece: 'jewelry', terms: 'terms', privacy: 'privacy', collection: 'collection', about: 'about', contact: 'contact' },
} as const;

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
    for (const key of ['piece', 'terms', 'privacy', 'collection', 'about', 'contact'] as const) {
      if (rest[0] === segments[from][key]) rest[0] = segments[to][key];
    }
  }
  return `/${[to, ...rest].join('/')}`;
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
    if (tag.startsWith('es')) return 'es';
    if (tag.startsWith('en')) return 'en';
  }
  // Visitors whose language we do not translate are better served in English.
  return 'en';
}
