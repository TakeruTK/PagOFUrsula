'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Photo } from '@/lib/pieces';

// three.js is loaded only in the browser and only after the page is interactive, so the text and
// photos of the hero are what search engines and slow connections see first.
const Hero3D = dynamic(() => import('./hero-3d'), { ssr: false });

export default function HeroScene({ photos }: { photos: Photo[] }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const start = () => setEnabled(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) { const id = w.requestIdleCallback(start, { timeout: 1200 }); return () => w.cancelIdleCallback?.(id); }
    const id = window.setTimeout(start, 400); return () => clearTimeout(id);
  }, []);
  if (!enabled) return null;
  return <Hero3D photos={photos} onReady={() => document.querySelector('.hero')?.classList.add('scene-on')} />;
}
