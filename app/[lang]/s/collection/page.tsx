import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Cta from '@/components/cta';
import PiecesGrid from '@/components/pieces-grid';
import { toCards } from '@/lib/catalog';
import { getDictionary } from '@/lib/dictionaries';
import { homePath, isLocale, pagePath, piecePath } from '@/lib/i18n';
import { absolute, breadcrumbs, jsonLd, pageMetadata } from '@/lib/seo';
import { textsFor } from '@/lib/pieces';
import { getPieces, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata(lang, 'collection', dict.pages.collection.metaTitle, dict.pages.collection.metaDescription);
}

export default async function CollectionPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = getSettings();
  const text = textsFor(settings, lang);
  const cards = toCards(getPieces(), lang, settings.categories);
  const list = {
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: dict.pages.collection.metaTitle, url: absolute(pagePath(lang, 'collection')), inLanguage: lang,
    mainEntity: { '@type': 'ItemList', itemListElement: cards.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: absolute(piecePath(lang, c.slug)), name: c.name })) },
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([list, breadcrumbs([{ name: dict.nav.home, path: homePath(lang) }, { name: dict.nav.collection, path: pagePath(lang, 'collection') }])]) }} />
    <header className="page-head" data-reveal>
      <p className="eyebrow">{dict.collection.eyebrow}</p>
      <h1>{text.collectionTitle}</h1>
      <p>{dict.pages.collection.intro}</p>
    </header>
    <section className="pieces" aria-label={text.collectionTitle}>
      <PiecesGrid cards={cards} categories={settings.categories} lang={lang} dict={dict} showPrices={settings.showPrices} />
    </section>
    <Cta lang={lang} dict={dict} settings={settings} />
  </main>;
}
