import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mailLink, profileHandle, whatsappLink } from '@/lib/contact';
import { getDictionary } from '@/lib/dictionaries';
import { homePath, isLocale, pagePath } from '@/lib/i18n';
import { absolute, breadcrumbs, jsonLd, pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);
  return pageMetadata(lang, 'contact', dict.pages.contact.metaTitle, dict.pages.contact.metaDescription);
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const c = dict.pages.contact;
  const settings = getSettings();
  const channels = [
    settings.whatsapp && { key: 'wa', title: c.whatsapp, text: c.whatsappText, label: settings.whatsapp, href: whatsappLink(settings.whatsapp, dict.cta.whatsappMessage), external: true },
    settings.contactEmail && { key: 'mail', title: c.email, text: c.emailText, label: settings.contactEmail, href: mailLink(settings.contactEmail, dict.meta.homeTitle, ''), external: false },
    { key: 'ig', title: c.instagram, text: c.instagramText, label: profileHandle(settings.instagram), href: settings.instagram, external: true },
    settings.facebook && { key: 'fb', title: c.facebook, text: c.facebookText, label: profileHandle(settings.facebook), href: settings.facebook, external: true },
    settings.tiktok && { key: 'tt', title: c.tiktok, text: c.tiktokText, label: profileHandle(settings.tiktok), href: settings.tiktok, external: true },
  ].filter(Boolean) as { key: string; title: string; text: string; label: string; href: string; external: boolean }[];
  const page = {
    '@context': 'https://schema.org', '@type': 'ContactPage', name: c.metaTitle, url: absolute(pagePath(lang, 'contact')), inLanguage: lang,
    about: { '@id': absolute('/#organization') },
  };
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd([page, breadcrumbs([{ name: dict.nav.home, path: homePath(lang) }, { name: dict.nav.contact, path: pagePath(lang, 'contact') }])]) }} />
    <header className="page-head">
      <p className="eyebrow">{dict.nav.contact}</p>
      <h1>{c.title}</h1>
      <p>{c.intro}</p>
    </header>
    <section className="contact-cards" aria-label={c.channels}>
      {channels.map(ch => <a key={ch.key} data-reveal className="contact-card" href={ch.href} {...(ch.external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}>
        <span className="eyebrow">{ch.title}</span>
        <strong>{ch.label}</strong>
        <small>{ch.text}</small>
        <span className="contact-open">{c.open} →</span>
      </a>)}
    </section>
    <section className="section steps-section">
      <div className="narrow">
        <h2>{c.stepsTitle}</h2>
        <ol className="steps">{c.steps.map((s, i) => <li key={s.title} data-reveal><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{s.title}</h3><p>{s.text}</p></div></li>)}</ol>
        <p className="steps-note">{dict.cta.note}</p>
      </div>
    </section>
  </main>;
}
