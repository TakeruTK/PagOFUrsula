import Link from 'next/link';
import { availabilityLabel, formatPrice, type Card } from '@/lib/catalog';
import { fmt, type Dictionary } from '@/lib/dictionaries';
import { piecePath, type Locale } from '@/lib/i18n';
import Photo from './photo';
import Tilt from './tilt';

/** One piece in a grid. Pure markup so it works in server and client components. */
export default function PieceCard({ piece: p, lang, dict, showPrices, eager = false }: { piece: Card; lang: Locale; dict: Dictionary; showPrices: boolean; eager?: boolean }) {
  const material = p.material && p.material !== 'Por confirmar' && p.material !== 'To be confirmed' ? p.material : p.category;
  return <Link className="card" data-reveal href={piecePath(lang, p.slug)} aria-label={fmt(dict.collection.view, { name: p.name })}>
    <Tilt><div className="card-image"><Photo photo={p.images[0]} alt={p.images[0].caption || p.name} eager={eager} sizes="(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 380px" />{p.availability !== 'Disponible' && <span className="card-tag">{availabilityLabel(p, dict)}</span>}</div></Tilt>
    <div className="card-text">
      <span className="eyebrow">{material}</span>
      <h3>{p.name}</h3>
      {showPrices && p.price > 0 && <small>{fmt(dict.collection.price, { price: formatPrice(p.price, lang) })}</small>}
    </div>
  </Link>;
}
