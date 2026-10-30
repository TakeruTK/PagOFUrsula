import Link from 'next/link';
import { resized } from '@/lib/image';
/** Monogram and name. "light" is for the dark olive sidebar, "dark" for light backgrounds. */
export function Brand({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return <Link className="brand-lockup" href="/" aria-label="Ursula Alcaino, inicio">
    <img src={resized(`/brand/monogram-${tone}.png`, 96)} srcSet={`${resized(`/brand/monogram-${tone}.png`, 96)} 1x, ${resized(`/brand/monogram-${tone}.png`, 128)} 2x`} alt="" width="43" height="34" />
    <span className="wordmark">ursula alcaino</span>
  </Link>;
}
