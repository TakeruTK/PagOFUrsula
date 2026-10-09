// Server-side configuration read from environment variables. Secrets never reach the browser.
// SITE_URL is read at runtime (NEXT_PUBLIC_* values would be frozen into the build).
export const siteUrl = () => (process.env.SITE_URL || process.env['NEXT_PUBLIC_SITE_URL'] || 'http://127.0.0.1:3002').replace(/\/+$/, '');
export const isHttps = () => siteUrl().startsWith('https://');
/** Search engines are only invited in once the owner approves the shop and sets ALLOW_INDEXING=true. */
export const allowIndexing = () => process.env.ALLOW_INDEXING === 'true' && isHttps();
/** "demo" shows a payment simulator; "live" uses the real providers whose credentials are configured. */
export const paymentMode = () => ((process.env.PAYMENT_MODE || 'demo') === 'live' ? 'live' : 'demo') as 'demo' | 'live';

export const mercadoPago = () => ({
  token: process.env.MP_ACCESS_TOKEN || '',
  webhookSecret: process.env.MP_WEBHOOK_SECRET || '',
  api: (process.env.MP_API_BASE || 'https://api.mercadopago.com').replace(/\/+$/, ''),
});
export const paypal = () => {
  const env = process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox';
  return {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    secret: process.env.PAYPAL_CLIENT_SECRET || '',
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    env: env as 'live' | 'sandbox',
    api: (process.env.PAYPAL_API_BASE || (env === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com')).replace(/\/+$/, ''),
  };
};
export const mailConfig = () => ({ key: process.env.RESEND_API_KEY || '', from: process.env.MAIL_FROM || '', api: process.env.RESEND_API_BASE || 'https://api.resend.com' });

export type ProviderId = 'mercadopago' | 'paypal' | 'demo';
export function configuredProviders(): ProviderId[] {
  if (paymentMode() === 'demo') return ['demo'];
  const list: ProviderId[] = [];
  if (mercadoPago().token) list.push('mercadopago');
  if (paypal().clientId && paypal().secret) list.push('paypal');
  return list;
}
