import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Cta from '@/components/cta';
import HeroScene from '@/components/hero-scene';
import PieceCard from '@/components/piece-card';
import Photo from '@/components/photo';
import { toCards } from '@/lib/catalog';
import { resized, srcSetFor } from '@/lib/image';
import { getDictionary } from '@/lib/dictionaries';
import { homePath, isLocale, locales, pagePath, type Locale } from '@/lib/i18n';
import { initialPieces } from '@/lib/seed';
import { absolute, alternates, jsonLd, openGraphBase } from '@/lib/seo';
import { textsFor } from '@/lib/pieces';
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

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = getSettings();
  const text = textsFor(settings, lang);
  const cards = toCards(getPieces(), lang, settings.categories);
  const fallbackCover = (cards.find(p => p.featured) || cards[0] || toCards(initialPieces, lang, settings.categories)[0]).images[0];
  // The owner picks the home photos in the workshop. Until she does, only the pieces she marked as featured appear
  // (and the first ones if she marked none): a piece uploaded later never shows up on the home page by itself.
  const chosen = settings.images.hero;
  const automatic = cards.filter(p => p.featured).length ? cards.filter(p => p.featured) : cards.slice(0, 4);
  const sceneImages = chosen.length ? chosen : automatic.slice(0, 6).map(p => p.images[0]);
  const cover = chosen[0] || fallbackCover;
  const featured = automatic.slice(0, 3);
  const handle = settings.instagram.split('/').filter(Boolean).pop();

  const organization = {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': absolute('/#organization'), name: 'Ursula Alcaino · Orfebrería', url: absolute('/'),
    logo: absolute('/brand/logo-dark.png'), sameAs: [settings.instagram, settings.facebook, settings.tiktok].filter(Boolean), ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    description: dict.meta.homeDescription, founder: { '@type': 'Person', name: 'Ursula Alcaino' }, image: absolute('/brand/logo-dark.png'),
    knowsLanguage: ['es', 'en', 'pt', 'fr'], areaServed: 'Worldwide',
    ...(settings.contactEmail || settings.whatsapp ? { contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: ['Spanish', 'English', 'Portuguese', 'French'], ...(settings.contactEmail ? { email: settings.contactEmail } : {}), ...(settings.whatsapp ? { telephone: settings.whatsapp } : {}) } } : {}),
  };
  const website = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': absolute('/#website'), url: absolute('/'), name: 'Ursula Alcaino · Orfebrería', inLanguage: locales, publisher: { '@id': absolute('/#organization') } };

  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([organization, website]) }} />
    <header className="hero">
      <div className="hero-photo" aria-hidden><Photo photo={cover} alt="" eager sizes="100vw" /></div>
      <HeroScene photos={sceneImages} />
      <div className="hero-inner">
        <h1 className="hero-logo"><img src={resized('/brand/logo-light.png', 640)} srcSet={srcSetFor('/brand/logo-light.png', [384, 640, 828])} sizes="(max-width: 700px) 80vw, 460px" alt={dict.site.name} width="1000" height="572" fetchPriority="high" /></h1>
        <span className="hero-rule" />
        <span className="eyebrow">{dict.hero.kicker}</span>
        <p className="hero-tagline">{text.headline}</p>
      </div>
      <a className="hero-scroll" href="#sobre-mi" aria-label={dict.hero.scroll} />
    </header>

    <section className="section about" id="sobre-mi">
      <div className="narrow" data-reveal>
        <p className="eyebrow">{dict.about.eyebrow}</p>
        <h2>{dict.about.title}</h2>
        <p className="lead">{text.introduction}</p>
        <Link className="text-link" href={pagePath(lang, 'about')}>{dict.home.aboutLink} →</Link>
      </div>
    </section>

    <section className="pieces" aria-labelledby="featured-title">
      <div className="pieces-head" data-reveal>
        <p className="eyebrow">{dict.collection.eyebrow}</p>
        <h2 id="featured-title">{dict.home.featured}</h2>
      </div>
      <ul className="grid" style={{ marginTop: 20 }}>{featured.map((p, i) => <li key={p.id}><PieceCard piece={p} lang={lang} dict={dict} showPrices={settings.showPrices} eager={i < 3} /></li>)}</ul>
      <div style={{ textAlign: 'center', marginTop: 64 }}><Link className="btn" href={pagePath(lang, 'collection')}>{dict.home.all}</Link></div>
    </section>

    <section className="social" data-reveal>
      <p>{dict.instagram.text}</p>
      <div className="cta-row">
        <a className="btn" href={settings.instagram} target="_blank" rel="noreferrer noopener">{dict.instagram.button} · @{handle}</a>
        {settings.facebook && <a className="btn" href={settings.facebook} target="_blank" rel="noreferrer noopener">FACEBOOK</a>}
        {settings.tiktok && <a className="btn" href={settings.tiktok} target="_blank" rel="noreferrer noopener">TIKTOK</a>}
      </div>
    </section>

    <Cta lang={lang} dict={dict} settings={settings} id="contacto" />
  </main>;
}
