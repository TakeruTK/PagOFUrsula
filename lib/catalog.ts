import { availableStock, holds } from './orders';
import { localizedPiece, type Photo, type Piece } from './pieces';
import type { Locale } from './i18n';

/** A piece prepared for display in one language, with stock net of units held by unpaid orders. */
export type Card = {
  id: string; slug: string; name: string; description: string; material: string; category: string; categoryKey: Piece['category'];
  price: number; featured: boolean; order: number; kind: Piece['kind']; availability: Piece['availability']; stock: number; sellable: boolean;
  images: Photo[]; translated: boolean;
};
export function toCards(pieces: Piece[], locale: Locale): Card[] {
  const held = holds();
  return pieces.map(piece => {
    const text = localizedPiece(piece, locale);
    const stock = availableStock(piece, held);
    return {
      id: piece.id, slug: piece.slug, name: text.name, description: text.description, material: text.material, category: text.category, categoryKey: piece.category,
      price: piece.price, featured: piece.featured, order: piece.order, kind: piece.kind, availability: piece.availability, stock,
      sellable: piece.kind === 'Producto' && piece.availability === 'Disponible' && stock > 0,
      images: piece.images.map((image, i) => ({ ...image, caption: (locale === 'en' && i === 0 && piece.translations?.en?.caption) || image.caption })),
      translated: text.translated,
    };
  });
}
