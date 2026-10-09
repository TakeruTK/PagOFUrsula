export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

export const htmlLang: Record<Locale, string> = { es: 'es', en: 'en' };
export const ogLocale: Record<Locale, string> = { es: 'es_CL', en: 'en_US' };
export const intlLocale: Record<Locale, string> = { es: 'es-CL', en: 'en-US' };
export const defaultCurrency: Record<Locale, 'CLP' | 'USD'> = { es: 'CLP', en: 'USD' };

export type LegalDoc = 'terms' | 'privacy' | 'shipping';
export const legalDocs: LegalDoc[] = ['terms', 'privacy', 'shipping'];

// URL segments are translated so that each language has natural, indexable addresses.
export const segments = {
  es: { piece: 'joyas', terms: 'terminos', privacy: 'privacidad', shipping: 'envios-y-devoluciones' },
  en: { piece: 'jewelry', terms: 'terms', privacy: 'privacy', shipping: 'shipping-returns' },
} as const;

export const homePath = (locale: Locale) => `/${locale}`;
export const piecePath = (locale: Locale, slug: string) => `/${locale}/${segments[locale].piece}/${slug}`;
export const legalPath = (locale: Locale, doc: LegalDoc) => `/${locale}/${segments[locale][doc]}`;
export const orderPath = (locale: Locale, id: string) => `/${locale}/order/${id}`;

/** Translates the current pathname into the equivalent page of another language. */
export function switchLocalePath(pathname: string, to: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  const from = parts[0];
  if (!from || !isLocale(from)) return homePath(to);
  const rest = parts.slice(1);
  if (rest.length) {
    for (const key of ['piece', 'terms', 'privacy', 'shipping'] as const) {
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
