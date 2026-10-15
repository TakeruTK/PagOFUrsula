import { ImageResponse } from 'next/og';
import { getSettings } from '@/lib/store';
import { isLocale } from '@/lib/i18n';
export const alt = 'Úrsula Alcaíno · Orfebrería';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const settings = getSettings();
  const text = isLocale(lang) && lang === 'en' ? settings.en : settings;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#bec092', color: '#272b00', fontFamily: 'Georgia, serif', padding: 80, textAlign: 'center' }}>
      <div style={{ fontSize: 28, letterSpacing: 10, color: '#574419', display: 'flex' }}>ORFEBRERÍA DE AUTOR</div>
      <div style={{ fontSize: 120, marginTop: 24, display: 'flex' }}>ÚRSULA ✧</div>
      <div style={{ fontSize: 40, letterSpacing: 12, display: 'flex' }}>ALCAÍNO</div>
      <div style={{ fontSize: 36, marginTop: 48, fontStyle: 'italic', display: 'flex', maxWidth: 900 }}>{text.headline}</div>
    </div>, size);
}
