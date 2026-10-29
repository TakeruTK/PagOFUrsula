'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Dictionary } from '@/lib/dictionaries';
import { mailLink } from '@/lib/contact';

/**
 * A "write to us" link that always leads somewhere. A plain mailto: link does nothing when the visitor has no mail
 * program set up, which is common. After the click, if the page never lost focus (no mail program opened), a small
 * window offers the address to copy and the web versions of Gmail and Outlook with the message already written.
 */
export default function EmailLink({ email, subject = '', body = '', dict, className, children, ...rest }: {
  email: string; subject?: string; body?: string; dict: Dictionary['mail']; className?: string; children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'>) {
  const [help, setHelp] = useState(false);
  const [copied, setCopied] = useState(false);
  const left = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const away = () => { left.current = true; };
    window.addEventListener('blur', away); document.addEventListener('visibilitychange', away);
    return () => { window.removeEventListener('blur', away); document.removeEventListener('visibilitychange', away); clearTimeout(timer.current); };
  }, []);
  useEffect(() => {
    if (!help) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setHelp(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [help]);

  const open = () => { left.current = false; clearTimeout(timer.current); timer.current = setTimeout(() => { if (!left.current) setHelp(true); }, 1200); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(email); }
    catch { const field = document.createElement('input'); field.value = email; document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove(); }
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };
  const q = (v: string) => encodeURIComponent(v);
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${q(email)}&su=${q(subject)}&body=${q(body)}`;
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${q(email)}&subject=${q(subject)}&body=${q(body)}`;

  return <>
    <a {...rest} className={className} href={mailLink(email, subject, body)} onClick={open}>{children}</a>
    {help && createPortal(<div className="mail-help" role="dialog" aria-modal="true" aria-label={dict.title} onClick={e => { if (e.target === e.currentTarget) setHelp(false); }}>
      <div className="mail-box">
        <button type="button" className="mail-x" aria-label={dict.close} onClick={() => setHelp(false)}>×</button>
        <h3>{dict.title}</h3>
        <p>{dict.text}</p>
        <div className="mail-address">{email}</div>
        <button type="button" className="mail-primary" onClick={copy}>{copied ? dict.copied : dict.copy}</button>
        <div className="mail-web">
          <a href={gmail} target="_blank" rel="noreferrer noopener">Gmail</a>
          <a href={outlook} target="_blank" rel="noreferrer noopener">Outlook</a>
        </div>
      </div>
    </div>, document.body)}
  </>;
}
