import Link from 'next/link';
import { fmt, type Dictionary } from '@/lib/dictionaries';
import { legalPath, pagePath, type Locale } from '@/lib/i18n';
import SocialIcons, { type Social } from './social-icons';

export default function SiteFooter({ lang, dict, social }: { lang: Locale; dict: Dictionary; social: Social }) {
  return <footer className="footer">
    <Link className="wordmark" href={`/${lang}`}>úrsula alcaíno</Link>
    <SocialIcons social={social} dict={dict} />
    <nav aria-label="Footer">
      <Link href={pagePath(lang, 'collection')}>{dict.nav.collection}</Link>
      <Link href={pagePath(lang, 'about')}>{dict.nav.about}</Link>
      <Link href={pagePath(lang, 'contact')}>{dict.nav.contact}</Link>
      <Link href={legalPath(lang, 'terms')}>{dict.footer.terms}</Link>
      <Link href={legalPath(lang, 'privacy')}>{dict.footer.privacy}</Link>
    </nav>
    <small>{fmt(dict.footer.rights, { year: new Date().getFullYear() })}</small>
    <small className="tiny"><Link href="/admin" rel="nofollow">{dict.footer.workshop}</Link></small>
  </footer>;
}
