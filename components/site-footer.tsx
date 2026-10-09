import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { fmt, type Dictionary } from '@/lib/dictionaries';
import { legalPath, type Locale } from '@/lib/i18n';
import { Brand } from './brand';

export default function SiteFooter({ lang, dict, instagram }: { lang: Locale; dict: Dictionary; instagram: string }) {
  return <footer>
    <div className="footer-main">
      <Brand href={`/${lang}`} label={dict.site.name} />
      <p>{dict.site.tagline}</p>
      <div>
        <Link href={`/${lang}#coleccion`}>{dict.footer.collection}</Link>
        <Link href={legalPath(lang, 'terms')}>{dict.footer.terms}</Link>
        <Link href={legalPath(lang, 'shipping')}>{dict.footer.shipping}</Link>
        <Link href={legalPath(lang, 'privacy')}>{dict.footer.privacy}</Link>
        <a href={instagram} target="_blank" rel="noreferrer noopener">{dict.footer.instagram} <ArrowUpRight size={13} /></a>
        <Link href="/admin" rel="nofollow">{dict.footer.workshop} <ArrowUpRight size={13} /></Link>
      </div>
    </div>
    <div className="footer-bottom"><span>{fmt(dict.footer.rights, { year: new Date().getFullYear() })}</span><span>{dict.footer.payments}</span><span>{dict.footer.made} <span className="footer-star">✧</span></span></div>
  </footer>;
}
