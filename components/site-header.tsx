'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import { fmt } from '@/lib/dictionaries';
import { locales, switchLocalePath } from '@/lib/i18n';
import { Brand } from './brand';
import Modal from './modal';
import { useStore } from './store';

export default function SiteHeader() {
  const { lang, dict, count, setBagOpen, currency, setCurrency, mode } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [query, setQuery] = useState('');
  const home = `/${lang}`;
  const links: [string, string][] = [[dict.nav.collection, `${home}#coleccion`], [dict.nav.universe, `${home}#universo`], [dict.nav.contact, `${home}#contacto`]];

  const remember = (locale: string) => { try { document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`; } catch { /* ignore */ } };
  return <>
    <div className="announcement"><span>{dict.announcement}</span><span>{mode === 'demo' ? dict.demoBanner : dict.announcementShipping}</span></div>
    <header className="site-header">
      <nav className="desktop-nav" aria-label={dict.nav.collection}>{links.slice(0, 2).map(([name, href]) => <Link key={href} href={href}>{name}</Link>)}</nav>
      <button className="icon-button mobile-menu" aria-label={dict.nav.menu} onClick={() => setMenu(true)}><Menu size={22} /></button>
      <Brand href={home} label={`${dict.site.name} · ${dict.nav.home}`} />
      <div className="header-tools">
        <div className="switches">
          <div className="switch" role="group" aria-label={dict.nav.language}>{locales.map(l => <Link key={l} href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined} className={l === lang ? 'active' : ''} onClick={() => remember(l)}>{l.toUpperCase()}</Link>)}</div>
          <div className="switch switch-currency" role="group" aria-label={dict.nav.currency}>{(['CLP', 'USD'] as const).map(c => <button key={c} aria-pressed={currency === c} className={currency === c ? 'active' : ''} onClick={() => setCurrency(c)}>{c}</button>)}</div>
        </div>
        <button className="icon-button" aria-label={dict.nav.search} onClick={() => setSearch(true)}><Search size={20} /></button>
        <Link className="icon-button account-link" href="/admin" aria-label={dict.nav.workshop} rel="nofollow"><UserRound size={20} /></Link>
        <button className="bag-button" onClick={() => setBagOpen(true)} aria-label={fmt(dict.nav.openBag, { count })}><ShoppingBag size={20} /><span className="bag-word">{dict.nav.bag}</span><span className="bag-count">{count}</span></button>
      </div>
    </header>
    <Modal open={menu} onClose={() => setMenu(false)} title={dict.nav.menuTitle} description={dict.nav.menuDescription} className="menu-modal" closeLabel={dict.nav.close}>
      <nav>{links.map(([name, href]) => <Link key={href} href={href} onClick={() => setMenu(false)}>{name}<ArrowUpRight size={18} /></Link>)}</nav>
      <div className="menu-currency"><span>{dict.nav.language}</span><div className="switch" role="group" aria-label={dict.nav.language}>{locales.map(l => <Link key={l} href={switchLocalePath(pathname, l)} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined} className={l === lang ? 'active' : ''} onClick={() => { remember(l); setMenu(false); }}>{l.toUpperCase()}</Link>)}</div></div>
      <div className="menu-currency"><span>{dict.nav.currency}</span><div className="switch" role="group" aria-label={dict.nav.currency}>{(['CLP', 'USD'] as const).map(c => <button key={c} aria-pressed={currency === c} className={currency === c ? 'active' : ''} onClick={() => setCurrency(c)}>{c}</button>)}</div></div>
    </Modal>
    <Modal open={search} onClose={() => setSearch(false)} title={dict.nav.search} description={dict.collection.searchLabel} className="search-modal" closeLabel={dict.nav.close}>
      <form onSubmit={e => { e.preventDefault(); setSearch(false); router.push(`${home}${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}#coleccion`); }}>
        <label className="field">{dict.collection.searchLabel}<input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder={dict.collection.searchPlaceholder} maxLength={80} /></label>
        <button className="button" type="submit">{dict.nav.search} <Search size={17} /></button>
      </form>
    </Modal>
  </>;
}
