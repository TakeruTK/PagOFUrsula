import { z } from 'zod';
export const categories = ['Aros', 'Anillos', 'Collares', 'Pulseras', 'Otros'] as const;
export const categoryEn: Record<(typeof categories)[number], string> = { Aros: 'Earrings', Anillos: 'Rings', Collares: 'Necklaces', Pulseras: 'Bracelets', Otros: 'Other' };

export const imageSchema = z.object({
  url: z.string().regex(/^\/(?:api\/photos\/[a-f0-9-]{36}|references\/(?:silver|ursula|color|nature)\.png)$/),
  caption: z.string().max(200).default(''),
  crop: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive(), z.number().positive(), z.number().positive()]).optional(),
});
const translationSchema = z.object({
  name: z.string().trim().max(100).default(''),
  description: z.string().trim().max(4000).default(''),
  material: z.string().trim().max(150).default(''),
  caption: z.string().trim().max(200).default(''),
});
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80);
export const pieceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema.optional(),
  name: z.string().trim().min(2).max(100),
  category: z.enum(categories),
  kind: z.enum(['Producto', 'Trabajo']).default('Producto'),
  description: z.string().trim().min(10).max(4000),
  material: z.string().trim().max(150),
  price: z.number().int().min(1).max(100000000),
  status: z.enum(['Borrador', 'Publicado']),
  availability: z.enum(['Disponible', 'Por encargo', 'Vendido']),
  stock: z.number().int().min(0).max(10000),
  order: z.number().int().min(0).max(10000),
  featured: z.boolean(),
  images: z.array(imageSchema).min(1).max(8),
  translations: z.object({ en: translationSchema.optional() }).optional(),
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

/** Name, description and material for a language, falling back to Spanish when no translation exists. */
export function localizedPiece(piece: Piece, locale: 'es' | 'en') {
  const t = locale === 'en' ? piece.translations?.en : undefined;
  return {
    name: t?.name || piece.name,
    description: t?.description || piece.description,
    material: t?.material || piece.material,
    category: locale === 'en' ? categoryEn[piece.category] : piece.category,
    translated: locale === 'es' || !!(t?.name && t?.description),
  };
}

const shippingZoneSchema = z.object({
  enabled: z.boolean(),
  cost: z.number().int().min(0).max(10000000),
  eta: z.string().trim().max(100),
  etaEn: z.string().trim().max(100),
});
const policySchema = z.object({
  terms: z.string().max(20000),
  privacy: z.string().max(20000),
  shipping: z.string().max(20000),
});
const textsSchema = z.object({
  headline: z.string().trim().min(5).max(100),
  introduction: z.string().trim().min(10).max(500),
  story: z.string().trim().min(10).max(2000),
  collectionTitle: z.string().trim().min(3).max(100),
});
export const settingsSchema = textsSchema.extend({
  instagram: z.string().url().regex(/^https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/),
  en: textsSchema,
  contactEmail: z.union([z.string().trim().email().max(200), z.literal('')]),
  whatsapp: z.string().trim().regex(/^(\+?[0-9]{8,15})?$/),
  usdRate: z.number().min(100).max(5000),
  shipping: z.object({ chile: shippingZoneSchema, latam: shippingZoneSchema, world: shippingZoneSchema }),
  policies: z.object({ es: policySchema, en: policySchema }),
});
export type Settings = z.infer<typeof settingsSchema>;
export type ShippingZoneId = keyof Settings['shipping'];
