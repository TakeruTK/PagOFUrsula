'use client';
import { useRef } from 'react';

/** Gives its content a soft 3D tilt and a light sheen that follow the pointer. Off for touch and reduced motion. */
export default function Tilt({ children, className = '', max = 9 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const allowed = () => !window.matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches;
  const move = (e: React.PointerEvent) => {
    if (!allowed() || e.pointerType === 'touch') return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      el.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
      el.dataset.active = 'true';
    });
  };
  const leave = () => {
    const el = ref.current; if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg');
    el.dataset.active = 'false';
  };
  return <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}><div className="tilt-body">{children}<span className="tilt-sheen" aria-hidden /></div></div>;
}
