import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowDown, ArrowUpRight, Camera as Instagram, Leaf, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import Collection from '@/components/collection';
import Photo from '@/components/photo';
import { toCards } from '@/lib/catalog';
import { getDictionary, fmt } from '@/lib/dictionaries';
import { homePath, isLocale, locales, piecePath, type Locale } from '@/lib/i18n';
import { initialPieces } from '@/lib/seed';
import { absolute, alternates, jsonLd, openGraphBase } from '@/lib/seo';
import { getPieces, getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  const paths = Object.fromEntries(locales.map(l => [l, homePath(l)])) as Record<Locale, string>;
  return {
    title: { absolute: dict.meta.homeTitle },
    description: dict.meta.homeDescription,
    alternates: alternates(lang, paths),
    openGraph: { ...openGraphBase(lang), title: dict.meta.homeTitle, description: dict.meta.homeDescription, url: absolute(paths[lang]) },
    twitter: { card: 'summary_large_image', title: dict.meta.homeTitle, description: dict.meta.homeDescription },
  };
}

export default async function Home({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { q } = await searchParams;
  const dict = getDictionary(lang);
  const settings = getSettings();
  const text = lang === 'en' ? settings.en : settings;
  const cards = toCards(getPieces(), lang);
  const fallback = toCards(initialPieces, lang);
  const hero = cards.find(p => p.featured) || cards[0] || fallback[0];
  const accent = cards.find(p => p.featured && p.id !== hero.id) || cards[1] || fallback[1];
  const universe = fallback[4];
  const [first, ...rest] = text.headline.split(',');
  const handle = settings.instagram.split('/').filter(Boolean).pop();

  const organization = {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': absolute('/#organization'), name: 'Úrsula Alcaíno · Orfebrería', url: absolute('/'),
    logo: absolute('/favicon.svg'), sameAs: [settings.instagram], ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    description: dict.meta.homeDescription, areaServed: 'Worldwide', founder: { '@type': 'Person', name: 'Úrsula Alcaíno' },
  };
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': absolute('/#website'), url: absolute('/'), name: 'Úrsula Alcaíno · Orfebrería', inLanguage: locales, publisher: { '@id': absolute('/#organization') } };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organization, website]) }} />
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-heading">
          <p className="eyebrow"><span /> {dict.hero.eyebrow} <span /></p>
          <h1 id="hero-title">{rest.length ? <>{first},<br /><em>{rest.join(',').trim()}</em></> : text.headline}</h1>
          <p className="hero-intro">{text.introduction}</p>
        </div>
        <div className="hero-stage">
          <div className="hero-note"><div className="little-star">✳</div><p>{dict.hero.note1}<br />{dict.hero.note2}</p><span>{dict.hero.note3}<br />{dict.hero.note4}</span><a href="#coleccion" className="text-link">{dict.hero.discover} <ArrowDown size={16} /></a></div>
          <Link className="hero-main" href={piecePath(lang, hero.slug)} aria-label={fmt(dict.hero.discoverPiece, { name: hero.name })}><Photo photo={hero.images[0]} alt={hero.name} eager /><span className="image-label">{dict.hero.imageLabel} <ArrowUpRight size={18} /></span></Link>
          <div className="hero-aside"><div className="orbit-label">{dict.hero.orbit}</div><Link className="hero-secondary" href={piecePath(lang, accent.slug)} aria-label={fmt(dict.hero.discoverPiece, { name: accent.name })}><Photo photo={accent.images[0]} alt={accent.name} /></Link><p>{dict.hero.magic1}<br />{dict.hero.magic2}</p><span className="tiny-label">{dict.hero.by}</span></div>
        </div>
      </section>
      <div className="values-strip"><span><Sparkles size={17} /> {dict.values.design}</span><i>✧</i><span><Leaf size={17} /> {dict.values.organic}</span><i>✧</i><span><Truck size={17} /> {dict.values.worldwide}</span><i>✧</i><span><ShieldCheck size={17} /> {dict.values.secure}</span></div>
      <section className="collection section" id="coleccion">
        <div className="section-heading"><div><p className="eyebrow">{dict.collection.eyebrow}</p><h2>{text.collectionTitle}</h2></div><p>{dict.collection.aside1}<br />{dict.collection.aside2}</p></div>
        <Collection cards={cards} initialQuery={(q || '').slice(0, 80)} />
      </section>
      <section className="universe" id="universo">
        <div className="universe-image"><Photo photo={universe.images[0]} alt={dict.universe.alt} /><span className="image-corner">{dict.universe.corner}</span></div>
        <div className="universe-copy"><span className="little-star">✳</span><p className="eyebrow">{dict.universe.eyebrow}</p><h2>{dict.universe.title1}<br />{dict.universe.title2} <em>{dict.universe.title3}</em></h2><p>{text.story}</p><a className="text-link light" href={settings.instagram} target="_blank" rel="noreferrer noopener">{dict.universe.link} <ArrowUpRight size={17} /></a><span className="signature">{dict.universe.signature}</span></div>
      </section>
      <section className="contact section" id="contacto">
        <p className="eyebrow">{dict.contact.eyebrow}</p><h2>{dict.contact.title1}<br /><em>{dict.contact.title2}</em></h2><p>{dict.contact.text}</p>
        <div className="contact-actions">
          <a className="button outline" href={settings.instagram} target="_blank" rel="noreferrer noopener"><Instagram size={18} /> @{handle} <ArrowUpRight size={17} /></a>
          {settings.whatsapp && <a className="button outline" href={`https://wa.me/${settings.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer noopener"><ShoppingBag size={18} /> {dict.contact.whatsapp}</a>}
          {settings.contactEmail && <a className="button outline" href={`mailto:${settings.contactEmail}`}>{dict.contact.email}</a>}
        </div>
      </section>
    </main>
  </>;
}
