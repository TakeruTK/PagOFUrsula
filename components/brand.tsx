import Link from 'next/link';
/** Monogram and name. "light" is for the dark olive sidebar, "dark" for light backgrounds. */
export function Brand({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  return <Link className="brand-lockup" href="/" aria-label="Ursula Alcaino, inicio">
    <img src={`/brand/monogram-${tone}.png`} alt="" width="43" height="34" />
    <span className="wordmark">ursula alcaino</span>
  </Link>;
}
