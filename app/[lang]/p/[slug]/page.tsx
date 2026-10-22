import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/gallery';
import PieceCard from '@/components/piece-card';
import { availabilityLabel, formatPrice, toCard, toCards } from '@/lib/catalog';
import { mailLink, whatsappLink } from '@/lib/contact';
import { fmt, getDictionary } from '@/lib/dictionaries';
import { homePath, isLocale, locales, pagePath, piecePath, type Locale } from '@/lib/i18n';
import { isTranslated } from '@/lib/pieces';
import { absolute, alternates, breadcrumbs as breadcrumbLd, jsonLd, openGraphBase } from '@/lib/seo';
import { getPieceBySlug, getPieces, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string; slug: string }> };

function load(lang: Locale, slug: string) {
  const piece = getPieceBySlug(slug);
  if (!piece) return null;
  // The page itself is served in any language; only pieces written in that language are suggested next to it.
  return { piece, cards: toCards(getPieces(), lang), card: toCard(piece, lang) };
}
const clean = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const data = load(lang, slug);
  if (!data) return { title: getDictionary(lang).meta.notFoundTitle, robots: { index: false } };
  const { card, piece } = data;
  const paths = Object.fromEntries(locales.filter(l => isTranslated(piece, l)).map(l => [l, piecePath(l, slug)])) as Partial<Record<Locale, string>>;
  const title = `${card.name} · ${card.category}`;
  const description = clean(card.description, 158);
  const upload = card.images.find(i => i.url.startsWith('/api/photos/'));
  // Pieces that still use reference screenshots fall back to the generated brand image.
  const image = upload ? absolute(upload.url) : absolute(`/${lang}/opengraph-image`);
  return {
    title, description, alternates: alternates(lang, paths, piecePath(lang, slug)),
    // A language without its own text for this piece would only repeat the Spanish page: keep it out of the index.
    ...(isTranslated(piece, lang) ? {} : { robots: { index: false, follow: true } }),
    openGraph: { ...openGraphBase(lang), title, description, url: absolute(piecePath(lang, slug)), images: [{ url: image, alt: card.name }] },
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
  const url = absolute(piecePath(lang, slug));
  const related = cards.filter(c => c.id !== card.id).slice(0, 3);
  const upload = card.images.filter(i => i.url.startsWith('/api/photos/')).map(i => absolute(i.url));
  const message = fmt(dict.piece.whatsappMessage, { name: card.name, url });
  const hasPrice = settings.showPrices && card.price > 0;
  const availability = card.availability === 'Disponible' ? 'https://schema.org/InStock' : card.availability === 'Por encargo' ? 'https://schema.org/PreOrder' : 'https://schema.org/SoldOut';
  const product = {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`, name: card.name, description: card.description, sku: card.id, url,
    ...(upload.length ? { image: upload } : {}), brand: { '@type': 'Brand', name: 'Ursula Alcaino' }, category: card.category,
    ...(card.material && !['Por confirmar', 'To be confirmed'].includes(card.material) ? { material: card.material } : {}),
    ...(card.size ? { size: card.size } : {}),
    // Without online checkout a price is only published when the owner chooses to show it.
    ...(hasPrice ? { offers: { '@type': 'Offer', url, priceCurrency: 'CLP', price: String(card.price), availability, seller: { '@id': absolute('/#organization') } } } : {}),
  };
  const trail = breadcrumbLd([{ name: dict.nav.home, path: homePath(lang) }, { name: dict.nav.collection, path: pagePath(lang, 'collection') }, { name: card.name, path: piecePath(lang, slug) }]);
  const stateLabel = availabilityLabel(card, dict);

  return <main className="piece">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([product, trail]) }} />
    <nav className="crumbs" aria-label={dict.piece.breadcrumb}><Link href={homePath(lang)}>{dict.nav.home}</Link><span>/</span><Link href={pagePath(lang, 'collection')}>{dict.nav.collection}</Link><span>/</span><span aria-current="page">{card.name}</span></nav>
    <article className="piece-grid">
      <Gallery images={card.images} name={card.name} label={dict.piece.photo} />
      <div className="piece-info">
        <span className="eyebrow">{card.category}</span>
        <h1>{card.name}</h1>
        <p className="desc">{card.description}</p>
        <dl className="facts">
          <div><dt>{dict.piece.details}</dt><dd>{card.material || dict.piece.unconfirmed}</dd></div>
          {card.size && <div><dt>{dict.piece.size}</dt><dd>{card.size}</dd></div>}
          <div><dt>{dict.piece.availability}</dt><dd>{stateLabel}</dd></div>
          {hasPrice && <div><dt>{dict.piece.price}</dt><dd>{formatPrice(card.price, lang)}</dd></div>}
        </dl>
        <div className="actions">
          {settings.whatsapp && <a className="btn solid" href={whatsappLink(settings.whatsapp, message)} target="_blank" rel="noreferrer noopener">{dict.piece.ask}</a>}
          {settings.contactEmail && <a className="btn" href={mailLink(settings.contactEmail, fmt(dict.piece.emailSubject, { name: card.name }), message)}>{dict.piece.askEmail}</a>}
          <a className={`btn ${settings.whatsapp ? '' : 'solid'}`} href={settings.instagram} target="_blank" rel="noreferrer noopener">{dict.piece.askInstagram}</a>
        </div>
        <p className="unique">{dict.piece.unique}</p>
      </div>
    </article>
    {related.length > 0 && <section className="related" style={{ padding: '90px 0 0' }}><h2>{dict.piece.related}</h2><ul className="grid">{related.map(p => <li key={p.id}><PieceCard piece={p} lang={lang} dict={dict} showPrices={settings.showPrices} /></li>)}</ul></section>}
  </main>;
}
