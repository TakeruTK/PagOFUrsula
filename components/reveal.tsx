'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/** Fades elements marked with data-reveal into view as they are scrolled to. Content stays visible without JavaScript. */
export default function Reveal() {
  const pathname = usePathname();
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const root = document.documentElement;
    const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { (entry.target as HTMLElement).classList.add('in'); io.unobserve(entry.target); }
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach((el, i) => { el.style.setProperty('--d', `${(i % 3) * 90}ms`); io.observe(el); });
    root.classList.add('reveal-ready');
    return () => io.disconnect();
  }, [pathname]);
  return null;
}
