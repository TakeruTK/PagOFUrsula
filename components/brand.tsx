import Link from 'next/link';
export function Brand({ href = '/', label = 'Úrsula Alcaíno, inicio' }: { href?: string; label?: string }) {
  return <Link className="brand" href={href} aria-label={label}><span>ÚRSULA<span className="brand-spark">✧</span></span><small>ALCAÍNO · ORFEBRERÍA</small></Link>;
}
