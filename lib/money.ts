import { intlLocale, type Locale } from './i18n';
export type Currency = 'CLP' | 'USD';

/** Catalog prices are stored in whole Chilean pesos. USD is derived with the owner's configured rate. */
export const usdCents = (clp: number, rate: number) => Math.round((clp * 100) / rate);

/** Minor units of a currency: CLP has no decimals, USD uses cents. */
export function toMinor(clp: number, currency: Currency, rate: number) {
  return currency === 'CLP' ? clp : usdCents(clp, rate);
}
export function formatMinor(minor: number, currency: Currency, locale: Locale) {
  if (currency === 'CLP') return new Intl.NumberFormat(intlLocale[locale], { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(minor);
  return new Intl.NumberFormat(intlLocale[locale] === 'es-CL' ? 'es-CL' : 'en-US', { style: 'currency', currency: 'USD' }).format(minor / 100);
}
export const formatPrice = (clp: number, currency: Currency, rate: number, locale: Locale) => formatMinor(toMinor(clp, currency, rate), currency, locale);
/** Decimal string as required by PayPal ("41.00"). */
export const decimal = (minor: number, currency: Currency) => (currency === 'CLP' ? String(minor) : (minor / 100).toFixed(2));
