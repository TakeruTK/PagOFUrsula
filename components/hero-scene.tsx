'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { Photo } from '@/lib/pieces';

// three.js is loaded only in the browser and only after the page is interactive, so the text and
// photos of the hero are what search engines and slow connections see first.
const Hero3D = dynamic(() => import('./hero-3d'), { ssr: false });

/** True when the browser has a real graphics chip: with software drawing (or none) the 3D scene would only slow the page. */
function hasGraphics() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return false;
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const software = /swiftshader|llvmpipe|software|basic render/i.test(info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return !software;
  } catch { return false; }
}

export default function HeroScene({ photos }: { photos: Photo[] }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
    // Data saver on, or a very small device: the flat photo hero is shown instead of the 3D scene.
    if (device.connection?.saveData || (device.deviceMemory && device.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2 || !hasGraphics()) return;
    let cancel = () => {};
    const start = () => {
      const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
      if (w.requestIdleCallback) { const id = w.requestIdleCallback(() => setEnabled(true), { timeout: 1500 }); cancel = () => w.cancelIdleCallback?.(id); }
      else { const id = window.setTimeout(() => setEnabled(true), 400); cancel = () => clearTimeout(id); }
    };
    // Wait for the page to finish loading so the scene never competes with the first paint.
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    return () => { window.removeEventListener('load', start); cancel(); };
  }, []);
  if (!enabled) return null;
  return <Hero3D photos={photos} onReady={() => document.querySelector('.hero')?.classList.add('scene-on')} />;
}
