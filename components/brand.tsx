import Link from 'next/link';
export function Brand({ href = '/', label = 'Úrsula Alcaíno, inicio' }: { href?: string; label?: string }) {
  return <Link className="wordmark" href={href} aria-label={label}>úrsula alcaíno</Link>;
}
