import { allowIndexing, isHttps, siteUrl } from './config';
import { locales, nativeName } from './i18n';
import { isTranslated } from './pieces';
import { initialSettings } from './seed';
import { getPieces, getSettings } from './store';

type Check = { id: string; ok: boolean; label: string; hint: string };

/** What the owner sees in the panel: which launch steps are done and which are missing. */
export function storeStatus() {
  const settings = getSettings();
  const published = getPieces(true).filter(p => p.status === 'Publicado');
  const site = siteUrl();
  const realPhotos = published.filter(p => p.images.some(i => i.url.startsWith('/api/photos/'))).length;
  const missing = locales.filter(l => l !== 'es').flatMap(l => {
    const n = published.filter(p => !isTranslated(p, l)).length;
    return n ? [`${nativeName[l]} (${n} ${n === 1 ? 'pieza' : 'piezas'})`] : [];
  });
  const checks: Check[] = [
    { id: 'whatsapp', ok: !!settings.whatsapp, label: 'WhatsApp para recibir consultas', hint: 'Agrega tu número en “Mi página”. Es el botón principal de contacto de cada pieza.' },
    { id: 'products', ok: published.length > 0 && realPhotos === published.length, label: 'Piezas con fotografías reales', hint: `${published.length - realPhotos} de ${published.length} piezas publicadas aún usan las imágenes de referencia.` },
    { id: 'texts', ok: JSON.stringify([settings.headline, settings.story]) !== JSON.stringify([initialSettings.headline, initialSettings.story]), label: 'Textos de la portada revisados', hint: 'Los textos son una propuesta: edítalos en “Mi página” (se traducen solos a los otros idiomas).' },
    // Search engines only index a page in a language once it is written in that language.
    { id: 'translations', ok: missing.length === 0, label: 'Piezas traducidas a todos los idiomas', hint: missing.length ? `Faltan traducciones: ${missing.join(' · ')}. Pulsa «Traducir todo» en Mis piezas (se traducen solas desde el español); sin ellas la pieza no aparece en Google en ese idioma.` : '' },
    { id: 'contact', ok: !!settings.contactEmail, label: 'Correo de contacto', hint: 'Se muestra como alternativa de contacto en la página.' },
    { id: 'policies', ok: JSON.stringify(settings.policies) !== JSON.stringify(initialSettings.policies), label: 'Condiciones y privacidad revisadas', hint: 'Aún están los textos de ejemplo. Edítalos en “Políticas”.' },
    { id: 'domain', ok: isHttps() && !site.includes('127.0.0.1') && !site.includes('localhost'), label: 'Dirección pública con HTTPS', hint: 'Define SITE_URL con el dominio .com definitivo.' },
    { id: 'indexing', ok: allowIndexing(), label: 'Visible para Google', hint: 'Cuando la clienta apruebe la página, define ALLOW_INDEXING=true.' },
  ];
  return { siteUrl: site, indexing: allowIndexing(), checks };
}
export type StoreStatus = ReturnType<typeof storeStatus>;
