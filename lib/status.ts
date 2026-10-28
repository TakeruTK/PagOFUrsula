import { locales, nativeName } from './i18n';
import { isTranslated } from './pieces';
import { getPieces, getSettings } from './store';

type Check = { id: string; ok: boolean; label: string; hint: string };

/** What the owner sees in the panel: what is still missing for the page to work well. */
export function storeStatus() {
  const settings = getSettings();
  const published = getPieces(true).filter(p => p.status === 'Publicado');
  const missing = locales.filter(l => l !== 'es').flatMap(l => {
    const n = published.filter(p => !isTranslated(p, l)).length;
    return n ? [`${nativeName[l]} (${n} ${n === 1 ? 'pieza' : 'piezas'})`] : [];
  });
  const checks: Check[] = [
    { id: 'whatsapp', ok: !!settings.whatsapp, label: 'WhatsApp para recibir consultas', hint: 'Agrega tu número en “Mi página”. Es el botón principal de contacto de cada pieza.' },
    // Search engines only index a page in a language once it is written in that language.
    { id: 'translations', ok: missing.length === 0, label: 'Piezas traducidas a todos los idiomas', hint: missing.length ? `Faltan traducciones: ${missing.join(' · ')}. Pulsa «Traducir todo» en Mis piezas (se traducen solas desde el español); sin ellas la pieza no aparece en Google en ese idioma.` : '' },
    { id: 'contact', ok: !!settings.contactEmail, label: 'Correo de contacto', hint: 'Se muestra como alternativa de contacto en la página.' },
  ];
  return { checks };
}
export type StoreStatus = ReturnType<typeof storeStatus>;
