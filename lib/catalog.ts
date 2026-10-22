import { isTranslated, localizedPiece, type Photo, type Piece } from './pieces';
import type { Dictionary } from './dictionaries';
import { intlLocale, type Locale } from './i18n';

/** A piece prepared for display in one language. */
export type Card = {
  id: string; slug: string; name: string; description: string; material: string; size: string; category: string; categoryKey: Piece['category'];
  price: number; featured: boolean; order: number; availability: Piece['availability']; images: Photo[];
};
export function toCard(piece: Piece, locale: Locale): Card {
  const text = localizedPiece(piece, locale);
  return {
      id: piece.id, slug: piece.slug, name: text.name, description: text.description, material: text.material, size: text.size, category: text.category, categoryKey: piece.category,
      price: piece.price, featured: piece.featured, order: piece.order, availability: piece.availability,
      images: piece.images.map((image, i) => ({ ...image, caption: (locale !== 'es' && i === 0 && piece.translations?.[locale]?.caption) || image.caption })),
  };
}
/** The pieces shown in a language: a visitor never sees a name or description in a language she did not choose. */
export const toCards = (pieces: Piece[], locale: Locale): Card[] => pieces.filter(p => isTranslated(p, locale)).map(p => toCard(p, locale));

export const availabilityLabel = (card: Pick<Card, 'availability'>, dict: Dictionary) => card.availability === 'Disponible' ? dict.collection.available : card.availability === 'Por encargo' ? dict.collection.onRequest : dict.collection.sold;
export const formatPrice = (clp: number, lang: Locale) => new Intl.NumberFormat(intlLocale[lang], { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(clp);
