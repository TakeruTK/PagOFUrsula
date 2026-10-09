import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck, Truck } from 'lucide-react';
import { BuyBox, Gallery } from '@/components/product-buy';
import Photo from '@/components/photo';
import { Price } from '@/components/store';
import { toCards } from '@/lib/catalog';
import { defaultCurrency, homePath, isLocale, locales, piecePath, type Locale } from '@/lib/i18n';
import { getDictionary } from '@/lib/dictionaries';
import { usdCents } from '@/lib/money';
import { absolute, alternates, jsonLd, openGraphBase } from '@/lib/seo';
import { getPieceBySlug, getPieces, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string; slug: string }> };

function load(lang: Locale, slug: string) {
  const piece = getPieceBySlug(slug);
  if (!piece) return null;
  const cards = toCards(getPieces(), lang);
  return { piece, cards, card: cards.find(c => c.id === piece.id)! };
}
const clean = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const data = load(lang, slug);
  if (!data) return { title: getDictionary(lang).meta.notFoundTitle, robots: { index: false } };
  const { card } = data;
  const dict = getDictionary(lang);
  const paths = Object.fromEntries(locales.map(l => [l, piecePath(l, slug)])) as Record<Locale, string>;
  const title = `${card.name} · ${card.category}`;
  const description = clean(card.description, 158);
  const upload = card.images.find(i => i.url.startsWith('/api/photos/'));
  const image = upload ? absolute(upload.url) : absolute(`/${lang}/opengraph-image`);
  return {
    title, description, alternates: alternates(lang, paths),
    // Pieces that still use reference screenshots fall back to the generated brand image.
    openGraph: { ...openGraphBase(lang), type: 'website', title, description, url: absolute(paths[lang]), images: [{ url: image, alt: card.name }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function PiecePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const data = load(lang, slug);
  if (!data) notFound();
  const { card, cards } = data;
  const dict = getDictionary(lang);
  const settings = getSettings();
  const related = cards.filter(c => c.id !== card.id).slice(0, 4);
  const currency = defaultCurrency[lang];
  const price = currency === 'USD' ? (usdCents(card.price, settings.usdRate) / 100).toFixed(2) : String(card.price);
  const url = absolute(piecePath(lang, slug));
  const upload = card.images.filter(i => i.url.startsWith('/api/photos/')).map(i => absolute(i.url));
  const availability = card.sellable ? 'https://schema.org/InStock' : card.availability === 'Por encargo' ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock';
  const product = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, name: card.name, description: card.description, sku: card.id, url,
    ...(upload.length ? { image: upload } : {}), brand: { '@type': 'Brand', name: 'Úrsula Alcaíno' }, category: card.category,
    ...(card.material ? { material: card.material } : {}),
    offers: { '@type': 'Offer', url, priceCurrency: currency, price, availability, itemCondition: 'https://schema.org/NewCondition', seller: { '@id': absolute('/#organization') } },
  };
  const breadcrumbs = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: dict.nav.home, item: absolute(homePath(lang)) }, { '@type': 'ListItem', position: 2, name: card.name, item: url }],
  };
  const availabilityLabel = card.sellable ? dict.piece.inStock : card.kind === 'Trabajo' ? dict.piece.gallery : card.availability === 'Por encargo' ? dict.piece.onRequest : card.availability === 'Vendido' ? dict.piece.sold : dict.piece.soldOut;
  const contact = settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/\D/g, '')}` : settings.instagram;

  return <main className="piece-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([product, breadcrumbs]) }} />
    <nav className="breadcrumb" aria-label={dict.piece.breadcrumb}><Link href={homePath(lang)}>{dict.nav.home}</Link><span>/</span><Link href={`${homePath(lang)}#coleccion`}>{dict.nav.collection}</Link><span>/</span><span aria-current="page">{card.name}</span></nav>
    <article className="detail-grid page">
      <Gallery images={card.images} name={card.name} />
      <div className="detail-copy">
        <span className="eyebrow">{card.category} · ÚRSULA ALCAÍNO</span>
        <h1>{card.name}</h1>
        <Price className="detail-price" clp={card.price} />
        <p>{card.description}</p>
        <div className="detail-facts"><span>{dict.piece.details} <strong>{card.material || dict.piece.unconfirmed}</strong></span><span>{dict.piece.availability} <strong>{availabilityLabel}</strong></span></div>
        <BuyBox card={card} contactHref={contact} />
        <p className="detail-note"><Truck size={16} /> {dict.piece.shippingNote}</p>
        <p className="detail-note"><ShieldCheck size={16} /> {dict.bag.secure}</p>
      </div>
    </article>
    {related.length > 0 && <section className="related section"><h2>{dict.piece.related}</h2><div className="product-grid">{related.map(p => <article className="product-card" key={p.id}>
      <div className="product-visual"><Link className="product-image" href={piecePath(lang, p.slug)} aria-label={p.name}><Photo photo={p.images[0]} alt={p.images[0].caption || p.name} /></Link></div>
      <div className="product-meta"><div><span className="tiny-label">{p.category}</span><Link className="product-name" href={piecePath(lang, p.slug)}>{p.name}</Link></div><Price className="price" clp={p.price} /></div>
    </article>)}</div></section>}
  </main>;
}
