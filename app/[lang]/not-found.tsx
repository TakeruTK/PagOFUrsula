import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getDictionary } from '@/lib/dictionaries';
import { defaultLocale } from '@/lib/i18n';
// The locale of a not-found page is not available as a param, so the Spanish text is shown with both links.
export default function NotFound() {
  const es = getDictionary(defaultLocale), en = getDictionary('en');
  return <main className="order-page section"><div className="payment-result">
    <span className="eyebrow">404</span>
    <h1>{es.notFound.title}</h1><p>{es.notFound.text}</p>
    <Link className="button full" href="/es">{es.notFound.cta} <ArrowRight size={16} /></Link>
    <p>{en.notFound.title}</p>
    <Link className="button outline full" href="/en">{en.notFound.cta} <ArrowRight size={16} /></Link>
  </div></main>;
}
