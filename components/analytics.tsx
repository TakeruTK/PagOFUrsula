'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import type { Dictionary } from '@/lib/dictionaries';
import { legalPath, type Locale } from '@/lib/i18n';

const KEY = 'ursula_cookies';
type Choice = 'granted' | 'denied';

const stored = (): Choice | null => { try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; } };
const forgetGoogleCookies = () => { for (const name of document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => n === '_ga' || n.startsWith('_ga_'))) document.cookie = `${name}=; Max-Age=0; Path=/`; };

/**
 * Google Analytics, loaded only after the visitor accepts. Rejecting (or not answering) loads nothing and sets no
 * cookies, which is what the privacy rules of Europe and Chile expect. The choice can be changed from the footer.
 */
export default function Analytics({ id, lang, dict }: { id: string; lang: Locale; dict: Dictionary['cookies'] }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    const saved = stored();
    setChoice(saved); setAsking(saved === null);
    const reopen = () => setAsking(true);
    window.addEventListener('ursula:cookies', reopen);
    return () => window.removeEventListener('ursula:cookies', reopen);
  }, []);

  const decide = (next: Choice) => {
    try { localStorage.setItem(KEY, next); } catch { /* private mode: the choice lasts until the page closes */ }
    if (next === 'denied') forgetGoogleCookies();
    setChoice(next); setAsking(false);
  };

  return <>
    {choice === 'granted' && <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{anonymize_ip:true});`}</Script>
    </>}
    {asking && <div className="cookie-bar" role="dialog" aria-live="polite" aria-label={dict.title}>
      <p>{dict.text} <Link href={legalPath(lang, 'privacy')}>{dict.more}</Link></p>
      <div className="cookie-actions">
        <button type="button" className="cookie-reject" onClick={() => decide('denied')}>{dict.reject}</button>
        <button type="button" className="cookie-accept" onClick={() => decide('granted')}>{dict.accept}</button>
      </div>
    </div>}
  </>;
}

/** Footer button to change the cookie choice later. */
export function CookieSettings({ label }: { label: string }) {
  return <button type="button" className="cookie-settings" onClick={() => window.dispatchEvent(new Event('ursula:cookies'))}>{label}</button>;
}
