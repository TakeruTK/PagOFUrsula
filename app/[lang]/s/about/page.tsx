import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Cta from '@/components/cta';
import Photo from '@/components/photo';
import Tilt from '@/components/tilt';
import { toCards } from '@/lib/catalog';
import { getDictionary } from '@/lib/dictionaries';
import { homePath, isLocale, pagePath } from '@/lib/i18n';
import { initialPieces } from '@/lib/seed';
import { absolute, breadcrumbs, jsonLd, pageMetadata } from '@/lib/seo';
import { textsFor } from '@/lib/pieces';
import { getPieces, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata(lang, 'about', dict.pages.about.metaTitle, dict.pages.about.metaDescription);
}

export default async function AboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = getSettings();
  const text = textsFor(settings, lang);
  const paragraphs = text.story.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  const cards = toCards(getPieces(), lang, settings.categories);
  const photo = settings.images.about || (cards[1] || cards[0] || toCards(initialPieces, lang, settings.categories)[1]).images[0];
  const about = { '@context': 'https://schema.org', '@type': 'AboutPage', name: dict.pages.about.metaTitle, url: absolute(pagePath(lang, 'about')), inLanguage: lang, about: { '@id': absolute('/#organization') } };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([about, breadcrumbs([{ name: dict.nav.home, path: homePath(lang) }, { name: dict.nav.about, path: pagePath(lang, 'about') }])]) }} />
    <header className="page-head">
      <p className="eyebrow">{dict.about.eyebrow}</p>
      <h1>{dict.about.title}</h1>
    </header>
    <section className="about-grid">
      <Tilt max={7}><div className="about-photo"><Photo photo={photo} alt={settings.images.about?.caption || dict.pages.about.imageAlt} eager sizes="(max-width: 900px) 92vw, 45vw" /></div></Tilt>
      <div className="about-text" data-reveal>
        {paragraphs.map((paragraph, i) => paragraph.startsWith('## ') ? <h2 key={i}>{paragraph.slice(3)}</h2> : <p key={i} className={i === 0 ? 'lead' : undefined}>{paragraph}</p>)}
        <Link className="btn" href={pagePath(lang, 'collection')}>{dict.pages.about.more}</Link>
      </div>
    </section>
    <section className="section about">
      <ul className="pillars" style={{ marginTop: 0 }}>{dict.about.pillars.map(p => <li key={p.title} data-reveal><h3>{p.title}</h3><p>{p.text}</p></li>)}</ul>
    </section>
    <Cta lang={lang} dict={dict} settings={settings} />
  </main>;
}
