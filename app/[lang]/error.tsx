'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const texts = {
  es: { title: 'Algo salió mal', text: 'No pudimos mostrar esta página. Intenta de nuevo o vuelve al inicio.', retry: 'Reintentar', home: 'Ir al inicio' },
  en: { title: 'Something went wrong', text: 'We could not show this page. Try again or go back to the home page.', retry: 'Try again', home: 'Go to the home page' },
  pt: { title: 'Algo correu mal', text: 'Não foi possível mostrar esta página. Tente novamente ou volte ao início.', retry: 'Tentar novamente', home: 'Ir para o início' },
  fr: { title: 'Un problème est survenu', text: 'Nous n’avons pas pu afficher cette page. Réessayez ou retournez à l’accueil.', retry: 'Réessayer', home: 'Aller à l’accueil' },
};

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  const { lang } = useParams<{ lang: string }>();
  const t = texts[lang as keyof typeof texts] ?? texts.es;
  return <main className="not-found" style={{ textAlign: 'center', padding: '140px 24px' }}>
    <h1>{t.title}</h1>
    <p>{t.text}</p>
    <p style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}><button className="btn solid" onClick={reset}>{t.retry}</button><Link className="btn" href={`/${texts[lang as keyof typeof texts] ? lang : 'es'}`}>{t.home}</Link></p>
  </main>;
}
