import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale, legalDocs, legalPath, locales, type LegalDoc, type Locale } from '@/lib/i18n';
import { absolute, alternates, openGraphBase } from '@/lib/seo';
import { getSettings } from '@/lib/store';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ lang: string; doc: string }> };
const valid = (doc: string): doc is LegalDoc => (legalDocs as string[]).includes(doc);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, doc } = await params;
  if (!isLocale(lang) || !valid(doc)) return {};
  const dict = getDictionary(lang);
  const paths = Object.fromEntries(locales.map(l => [l, legalPath(l, doc)])) as Record<Locale, string>;
  return { title: dict.legal[doc], alternates: alternates(lang, paths), openGraph: { ...openGraphBase(lang), title: dict.legal[doc], url: absolute(paths[lang]) } };
}

export default async function Legal({ params }: Props) {
  const { lang, doc } = await params;
  if (!isLocale(lang) || !valid(doc)) notFound();
  const dict = getDictionary(lang);
  const settings = getSettings();
  const blocks = settings.policies[lang][doc].split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return <main className="doc">
    <p className="eyebrow">{dict.site.name}</p>
    <h1>{dict.legal[doc]}</h1>
    {blocks.length ? blocks.map((block, i) => <p key={i}>{block.split('\n').map((line, j) => <span key={j}>{line}<br /></span>)}</p>) : <p>{dict.legal.empty}</p>}
    {settings.contactEmail && <p><strong>{dict.legal.contact}:</strong> <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></p>}
  </main>;
}
