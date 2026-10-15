import Link from 'next/link';
import { fmt, type Dictionary } from '@/lib/dictionaries';
import { legalPath, pagePath, type Locale } from '@/lib/i18n';

export default function SiteFooter({ lang, dict, social }: { lang: Locale; dict: Dictionary; social: { instagram: string; facebook: string; tiktok: string } }) {
  return <footer className="footer">
    <Link className="wordmark" href={`/${lang}`}>úrsula alcaíno</Link>
    <nav aria-label="Footer">
      <Link href={pagePath(lang, 'collection')}>{dict.nav.collection}</Link><span aria-hidden>·</span>
      <Link href={pagePath(lang, 'about')}>{dict.nav.about}</Link><span aria-hidden>·</span>
      <Link href={pagePath(lang, 'contact')}>{dict.nav.contact}</Link><span aria-hidden>·</span>
      <a href={social.instagram} target="_blank" rel="noreferrer noopener">{dict.footer.instagram}</a><span aria-hidden>·</span>
      {social.facebook && <><a href={social.facebook} target="_blank" rel="noreferrer noopener">Facebook</a><span aria-hidden>·</span></>}
      {social.tiktok && <><a href={social.tiktok} target="_blank" rel="noreferrer noopener">TikTok</a><span aria-hidden>·</span></>}
      <Link href={legalPath(lang, 'terms')}>{dict.footer.terms}</Link><span aria-hidden>·</span>
      <Link href={legalPath(lang, 'privacy')}>{dict.footer.privacy}</Link>
    </nav>
    <small>{fmt(dict.footer.rights, { year: new Date().getFullYear() })}</small>
    <small className="tiny"><Link href="/admin" rel="nofollow">{dict.footer.workshop}</Link></small>
  </footer>;
}
