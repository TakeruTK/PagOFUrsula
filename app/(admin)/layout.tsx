import type { Metadata } from 'next';
import { Cormorant_Garamond, Outfit } from 'next/font/google';
import '../admin.css';
const serif = Cormorant_Garamond({ subsets: ['latin', 'latin-ext'], weight: ['300', '400', '500'], variable: '--font-serif', display: 'swap' });
const sans = Outfit({ subsets: ['latin', 'latin-ext'], weight: ['300', '400'], variable: '--font-sans', display: 'swap' });
export const metadata: Metadata = { title: 'Taller · Úrsula Alcaíno', robots: { index: false, follow: false }, icons: { icon: '/favicon.svg' } };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" className={`${serif.variable} ${sans.variable}`}><body>{children}</body></html>;
}
