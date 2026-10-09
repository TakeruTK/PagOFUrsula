import type { Settings, ShippingZoneId } from './pieces';
// ISO 3166-1 alpha-2 codes the shop can ship to (PayPal supports the vast majority).
export const COUNTRIES = 'CL AR BO BR CO CR CU DO EC SV GT HN MX NI PA PY PE UY VE US CA ES PT FR DE IT GB IE NL BE LU CH AT SE NO DK FI IS PL CZ SK HU RO BG GR HR SI EE LV LT MT CY AU NZ JP KR SG HK TW IL AE SA QA ZA'.split(' ');
const LATAM = new Set(['AR', 'BO', 'BR', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'UY', 'VE']);
/** Mercado Pago account is Chilean: Checkout Pro is offered to buyers shipping within Chile. */
export const MERCADOPAGO_COUNTRIES = new Set(['CL']);

export const zoneFor = (country: string): ShippingZoneId => (country === 'CL' ? 'chile' : LATAM.has(country) ? 'latam' : 'world');
export function shippingFor(settings: Pick<Settings, 'shipping'>, country: string) {
  const zone = zoneFor(country);
  const config = settings.shipping[zone];
  return { zone, enabled: config.enabled && COUNTRIES.includes(country), cost: config.cost, eta: config.eta, etaEn: config.etaEn };
}
export function countryName(code: string, locale: 'es' | 'en') {
  try { return new Intl.DisplayNames([locale === 'es' ? 'es-CL' : 'en'], { type: 'region' }).of(code) || code; } catch { return code; }
}
