import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Úrsula Alcaíno · Orfebrería de autor',
  description: 'Un encuentro entre naturaleza, metal y color. Descubre las creaciones de Úrsula Alcaíno.',
  robots: {index:false,follow:false},
  icons:{icon:'/favicon.svg'},
};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="es-CL"><body>{children}</body></html>;}
