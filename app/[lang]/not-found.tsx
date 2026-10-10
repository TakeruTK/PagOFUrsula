import Link from 'next/link';
import { getDictionary } from '@/lib/dictionaries';
// The language of a not-found page is not available as a param, so both languages are offered.
export default function NotFound() {
  const es = getDictionary('es'), en = getDictionary('en');
  return <main className="notfound">
    <span className="eyebrow">404</span>
    <h1>{es.notFound.title}</h1><p>{es.notFound.text}</p>
    <Link className="btn solid" href="/es">{es.notFound.cta}</Link>
    <p>{en.notFound.title}</p>
    <Link className="btn" href="/en">{en.notFound.cta}</Link>
  </main>;
}
