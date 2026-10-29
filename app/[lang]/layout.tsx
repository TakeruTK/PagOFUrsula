import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../site.css';
import Analytics from '@/components/analytics';
import Reveal from '@/components/reveal';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { siteUrl } from '@/lib/config';
import { getDictionary } from '@/lib/dictionaries';
import { htmlLang, isLocale, locales } from '@/lib/i18n';
import { robotsMeta } from '@/lib/seo';
import { getSettings } from '@/lib/store';

const serif = Cormorant_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '500'], style: ['normal', 'italic'], variable: '--font-serif', display: 'swap' });
const sans = Outfit({ subsets: ['latin', 'latin-ext'], weight: ['300', '400'], variable: '--font-sans', display: 'swap' });

export const viewport: Viewport = { themeColor: '#bec092', width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // Every inner page ends with the brand: "Aros argollas con brotes · Aros | Ursula Alcaino".
  title: { template: '%s | Ursula Alcaino', default: 'Ursula Alcaino · Orfebrería' },
  // Search Console and Bing Webmaster ownership codes, set in the server environment once the domain exists.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION || undefined, other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : undefined },
  robots: robotsMeta(),
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  applicationName: 'Ursula Alcaino · Orfebrería',
};
export const generateStaticParams = () => locales.map(lang => ({ lang }));
export const dynamic = 'force-dynamic';

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const settings = getSettings();
  // Analytics is switched on by the server environment: GTM_ID (Tag Manager container, GTM-XXXXXXX) or GA_MEASUREMENT_ID (G-XXXXXXXXXX).
  const gtmId = /^GTM-[A-Z0-9]{4,10}$/.test(process.env.GTM_ID || '') ? process.env.GTM_ID! : '';
  const gaId = /^G-[A-Z0-9]{4,14}$/.test(process.env.GA_MEASUREMENT_ID || '') ? process.env.GA_MEASUREMENT_ID! : '';
  const tracking = !!(gtmId || gaId);
  return <html lang={htmlLang[lang]} className={`${serif.variable} ${sans.variable}`}>
    <body>
      <SiteHeader lang={lang} dict={dict} />
      {children}
      <Reveal />
      {tracking && <Analytics gaId={gaId} gtmId={gtmId} lang={lang} dict={dict.cookies} />}
      <SiteFooter lang={lang} dict={dict} analytics={tracking} social={{ instagram: settings.instagram, facebook: settings.facebook, tiktok: settings.tiktok, whatsapp: settings.whatsapp, email: settings.contactEmail }} />
    </body>
  </html>;
}
