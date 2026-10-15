'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import { locales, pagePath, switchLocalePath, type Locale } from '@/lib/i18n';

export default function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const home = `/${lang}`;
  const links: [string, string][] = [[dict.nav.collection, pagePath(lang, 'collection')], [dict.nav.about, pagePath(lang, 'about')], [dict.nav.contact, pagePath(lang, 'contact')]];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const remember = (locale: string) => { try { document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`; } catch { /* ignore */ } };
  const language = <div className="lang" role="group" aria-label={dict.nav.language}>{locales.map(l => <Link key={l} href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined} onClick={() => remember(l)}>{l.toUpperCase()}</Link>)}</div>;

  return <>
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`} aria-label={dict.nav.menuTitle}>
      <Link className="brand-lockup" href={home} aria-label={`${dict.site.name} · ${dict.nav.home}`}><img src="/brand/monogram-dark.png" alt="" width="43" height="34" /><span className="wordmark">ursula alcaino</span></Link>
      <div className="nav-links">{links.map(([name, href]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>{name}</Link>)}{language}</div>
      <button className="menu-button" aria-label={open ? dict.nav.close : dict.nav.menu} aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? <X size={22} strokeWidth={1.4} /> : <Menu size={22} strokeWidth={1.4} />}</button>
    </nav>
    <div className={`menu-panel ${open ? 'open' : ''}`}>{links.map(([name, href]) => <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined} onClick={() => setOpen(false)}>{name}</Link>)}{language}</div>
  </>;
}
