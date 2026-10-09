import type { Metadata } from 'next';
import { DM_Sans, Italiana } from 'next/font/google';
import '../globals.css';
const sans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const serif = Italiana({ subsets: ['latin'], weight: '400', variable: '--font-serif', display: 'swap' });
export const metadata: Metadata = { title: 'Taller · Úrsula Alcaíno', robots: { index: false, follow: false }, icons: { icon: '/favicon.svg' } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
