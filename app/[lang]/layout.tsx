import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../site.css';
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

export const viewport: Viewport = { themeColor: '#0f0e0c', width: 'device-width', initialScale: 1 };
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  robots: robotsMeta(),
  icons: { icon: '/favicon.svg' },
  applicationName: 'Úrsula Alcaíno · Orfebrería',
};
export const generateStaticParams = () => locales.map(lang => ({ lang }));
export const dynamic = 'force-dynamic';

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  return <html lang={htmlLang[lang]} className={`${serif.variable} ${sans.variable}`}>
    <body>
      <SiteHeader lang={lang} dict={dict} />
      {children}
      <Reveal />
      <SiteFooter lang={lang} dict={dict} instagram={getSettings().instagram} />
    </body>
  </html>;
}
