import { z } from 'zod';
export const categories = ['Aros', 'Anillos', 'Collares', 'Pulseras', 'Otros'] as const;
export const imageSchema = z.object({
  url: z.string().regex(/^\/(?:api\/photos\/[a-f0-9-]{36}|references\/(?:silver|ursula|color|nature)\.png)$/),
  caption: z.string().max(200).default(''),
  crop: z.tuple([z.number(), z.number(), z.number().positive(), z.number().positive(), z.number().positive(), z.number().positive()]).optional(),
});
export const pieceSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(100),
  category: z.enum(categories),
  kind: z.enum(['Producto','Trabajo']).default('Producto'),
  description: z.string().trim().min(10).max(4000),
  material: z.string().trim().max(150),
  price: z.number().int().min(1).max(100000000),
  status: z.enum(['Borrador','Publicado']),
  availability: z.enum(['Disponible','Por encargo','Vendido']),
  stock: z.number().int().min(0).max(10000),
  order: z.number().int().min(0).max(10000),
  featured: z.boolean(),
  images: z.array(imageSchema).min(1).max(8),
});
export type Piece = z.infer<typeof pieceSchema> & {id:string};
export type Photo = z.infer<typeof imageSchema>;
export const settingsSchema = z.object({
  headline: z.string().trim().min(5).max(100),
  introduction: z.string().trim().min(10).max(500),
  story: z.string().trim().min(10).max(2000),
  instagram: z.string().url().regex(/^https:\/\/(?:www\.)?instagram\.com\/[a-zA-Z0-9_.]+\/?$/),
  collectionTitle: z.string().trim().min(3).max(100),
});
export type Settings = z.infer<typeof settingsSchema>;
export const money = (price:number) => new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP',maximumFractionDigits:0}).format(price);
