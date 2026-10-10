import { localizedPiece, type Photo, type Piece } from './pieces';
import type { Dictionary } from './dictionaries';
import type { Locale } from './i18n';

/** A piece prepared for display in one language. */
export type Card = {
  id: string; slug: string; name: string; description: string; material: string; category: string; categoryKey: Piece['category'];
  price: number; featured: boolean; order: number; availability: Piece['availability']; images: Photo[]; translated: boolean;
};
export function toCards(pieces: Piece[], locale: Locale): Card[] {
  return pieces.map(piece => {
    const text = localizedPiece(piece, locale);
    return {
      id: piece.id, slug: piece.slug, name: text.name, description: text.description, material: text.material, category: text.category, categoryKey: piece.category,
      price: piece.price, featured: piece.featured, order: piece.order, availability: piece.availability, translated: text.translated,
      images: piece.images.map((image, i) => ({ ...image, caption: (locale === 'en' && i === 0 && piece.translations?.en?.caption) || image.caption })),
    };
  });
}

export const availabilityLabel = (card: Pick<Card, 'availability'>, dict: Dictionary) => card.availability === 'Disponible' ? dict.collection.available : card.availability === 'Por encargo' ? dict.collection.onRequest : dict.collection.sold;
export const formatPrice = (clp: number, lang: Locale) => new Intl.NumberFormat(lang === 'es' ? 'es-CL' : 'en-US', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(clp);
