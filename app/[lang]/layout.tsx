import type { Metadata, Viewport } from 'next';
import { DM_Sans, Italiana } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { StoreProvider } from '@/components/store';
import { configuredProviders, paymentMode, siteUrl } from '@/lib/config';
import { getDictionary } from '@/lib/dictionaries';
import { htmlLang, isLocale, locales } from '@/lib/i18n';
import { toCards } from '@/lib/catalog';
import { robotsMeta } from '@/lib/seo';
import { getPieces, getSettings } from '@/lib/store';

const sans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const serif = Italiana({ subsets: ['latin'], weight: '400', variable: '--font-serif', display: 'swap' });

export const viewport: Viewport = { themeColor: '#f7f5ef', width: 'device-width', initialScale: 1 };
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
  const settings = getSettings();
  const catalog = toCards(getPieces(), lang);
  return <html lang={htmlLang[lang]} className={`${sans.variable} ${serif.variable}`}>
    <body>
      <StoreProvider shared={{ lang, dict: getDictionary(lang), catalog, usdRate: settings.usdRate, shipping: settings.shipping, providers: configuredProviders(), mode: paymentMode(), instagram: settings.instagram }}>
        <SiteHeader />
        {children}
        <SiteFooter lang={lang} dict={getDictionary(lang)} instagram={settings.instagram} />
      </StoreProvider>
    </body>
  </html>;
}
