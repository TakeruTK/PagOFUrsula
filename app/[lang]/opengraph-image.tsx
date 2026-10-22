import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { textsFor } from '@/lib/pieces';
import { getSettings } from '@/lib/store';
import { isLocale } from '@/lib/i18n';
export const alt = 'Ursula Alcaino · Orfebrería';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const settings = getSettings();
  const text = isLocale(lang) ? textsFor(settings, lang) : settings;
  const logo = `data:image/png;base64,${readFileSync(path.join(process.cwd(), 'public', 'brand', 'logo-dark.png')).toString('base64')}`;
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#bec092', color: '#272b00', padding: 60, textAlign: 'center' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logo} width={520} height={297} alt="" />
      <div style={{ fontSize: 34, marginTop: 34, fontStyle: 'italic', display: 'flex', maxWidth: 940, fontFamily: 'Georgia, serif' }}>{text.headline}</div>
    </div>, size);
}
