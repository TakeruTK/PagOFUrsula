import { z } from 'zod';
import type { Locale } from './i18n';
export const categories = ['Aros', 'Anillos', 'Collares', 'Pulseras', 'Otros'] as const;
type Category = (typeof categories)[number];
const categoryNames: Record<Locale, Record<Category, string>> = {
  es: { Aros: 'Aros', Anillos: 'Anillos', Collares: 'Collares', Pulseras: 'Pulseras', Otros: 'Otros' },
  en: { Aros: 'Earrings', Anillos: 'Rings', Collares: 'Necklaces', Pulseras: 'Bracelets', Otros: 'Other' },
  pt: { Aros: 'Brincos', Anillos: 'Anéis', Collares: 'Colares', Pulseras: 'Pulseiras', Otros: 'Outros' },
  fr: { Aros: 'Boucles d’oreilles', Anillos: 'Bagues', Collares: 'Colliers', Pulseras: 'Bracelets', Otros: 'Autres' },
};
export const categoryLabel = (category: Category, locale: Locale) => categoryNames[locale][category];

const imageSchema = z.object({
  url: z.string().regex(/^\/(?:api\/photos\/[a-f0-9-]{36}|references\/(?:silver|ursula|color|nature)\.png)$/),
  caption: z.string().max(200).default(''),
  crop: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive(), z.number().positive(), z.number().positive()]).optional(),
});
const translationSchema = z.object({
  name: z.string().trim().max(100).default(''),
  description: z.string().trim().max(4000).default(''),
  material: z.string().trim().max(150).default(''),
  size: z.string().trim().max(150).default(''),
  caption: z.string().trim().max(200).default(''),
});
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
export const pieceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema.optional(),
  name: z.string().trim().min(2).max(100),
  category: z.enum(categories),
  description: z.string().trim().min(10).max(4000),
  material: z.string().trim().max(150),
  size: z.string().trim().max(150).default(''),
  price: z.number().int().min(0).max(100000000),
  status: z.enum(['Borrador', 'Publicado']),
  availability: z.enum(['Disponible', 'Por encargo', 'Vendido']),
  order: z.number().int().min(0).max(10000),
  featured: z.boolean(),
  images: z.array(imageSchema).min(1).max(8),
  // Spanish is the base text; every other language is optional and, when missing, the page is not indexed.
  translations: z.object({ en: translationSchema.optional(), pt: translationSchema.optional(), fr: translationSchema.optional() }).optional(),
});
export type Piece = z.infer<typeof pieceSchema> & { id: string; slug: string };
export type Photo = z.infer<typeof imageSchema>;

export function slugify(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'pieza';
}
export function uniqueSlug(base: string, taken: Iterable<string>) {
  const used = new Set(taken);
  let slug = slugify(base), n = 2;
  const root = slug;
  while (used.has(slug)) slug = `${root}-${n++}`;
  return slug;
}

/** Name, description, material and size for a language, falling back to Spanish when no translation exists. */
export function localizedPiece(piece: Piece, locale: Locale) {
  const t = locale === 'es' ? undefined : piece.translations?.[locale];
  return {
    name: t?.name || piece.name,
    description: t?.description || piece.description,
    material: t?.material || piece.material,
    size: t?.size || piece.size,
    category: categoryLabel(piece.category, locale),
  };
}
/** A piece page is only worth indexing in a language once its name and description are written in it. */
export const isTranslated = (piece: Piece, locale: Locale) => locale === 'es' || !!(piece.translations?.[locale]?.name && piece.translations?.[locale]?.description);

const policySchema = z.object({
  terms: z.string().max(20000),
  privacy: z.string().max(20000),
});
const optionalProfile = (pattern: RegExp) => z.union([z.literal(''), z.string().trim().url().regex(pattern)]);
const textsSchema = z.object({
  headline: z.string().trim().min(5).max(100),
  introduction: z.string().trim().min(10).max(500),
  story: z.string().trim().min(10).max(8000),
  collectionTitle: z.string().trim().min(3).max(100),
});
export const settingsSchema = textsSchema.extend({
  instagram: z.string().url().regex(/^https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/),
  facebook: optionalProfile(/^https:\/\/(?:www\.|m\.|web\.)?(?:facebook|fb)\.com\/.+/),
  tiktok: optionalProfile(/^https:\/\/(?:www\.)?tiktok\.com\/@[a-zA-Z0-9_.]+\/?$/),
  en: textsSchema,
  pt: textsSchema,
  fr: textsSchema,
  contactEmail: z.union([z.string().trim().email().max(200), z.literal('')]),
  // Spaces, dashes and parentheses are accepted and removed: "+56 9 1234 5678" is stored as "+56912345678".
  whatsapp: z.string().trim().transform(v => v.replace(/[\s().-]/g, '')).pipe(z.string().regex(/^(\+?[0-9]{8,15})?$/)),
  showPrices: z.boolean(),
  // Photos of the home page chosen by the owner. Empty means "use the featured pieces".
  images: z.object({ hero: z.array(imageSchema).max(8), about: imageSchema.nullable() }),
  policies: z.object({ es: policySchema, en: policySchema, pt: policySchema, fr: policySchema }),
});
export type Settings = z.infer<typeof settingsSchema>;

/** The page texts for a language (Spanish lives at the top level of the settings). */
export const textsFor = (settings: Settings, locale: Locale) => (locale === 'es' ? settings : settings[locale]);
