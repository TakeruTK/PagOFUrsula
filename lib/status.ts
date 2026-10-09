import { allowIndexing, configuredProviders, isHttps, mercadoPago, paymentMode, paypal, siteUrl } from './config';
import { mailConfigured } from './mail';
import { initialSettings } from './seed';
import { getPieces, getSettings } from './store';

export type Check = { id: string; ok: boolean; label: string; hint: string };

/** What the owner sees in the panel: which launch steps are done and which are missing. Never exposes secrets. */
export function storeStatus() {
  const settings = getSettings();
  const pieces = getPieces(true);
  const published = pieces.filter(p => p.status === 'Publicado');
  const providers = configuredProviders();
  const site = siteUrl();
  const realPhotos = published.filter(p => p.images.some(i => i.url.startsWith('/api/photos/'))).length;
  const policiesEdited = JSON.stringify(settings.policies) !== JSON.stringify(initialSettings.policies);
  const shippingEdited = JSON.stringify(settings.shipping) !== JSON.stringify(initialSettings.shipping);
  const checks: Check[] = [
    { id: 'payments', ok: paymentMode() === 'live' && providers.length > 0, label: 'Pagos reales activos', hint: 'Configura PAYMENT_MODE=live y las credenciales de Mercado Pago y/o PayPal en el servidor.' },
    { id: 'domain', ok: isHttps() && !site.includes('127.0.0.1') && !site.includes('localhost'), label: 'Dirección pública con HTTPS', hint: 'Define SITE_URL con el dominio .com definitivo.' },
    { id: 'indexing', ok: allowIndexing(), label: 'Visible para Google', hint: 'Cuando la clienta apruebe la tienda, define ALLOW_INDEXING=true.' },
    { id: 'products', ok: realPhotos > 0 && realPhotos === published.length, label: 'Catálogo con fotografías reales', hint: `${published.length - realPhotos} de ${published.length} piezas publicadas aún usan las imágenes de referencia.` },
    { id: 'shipping', ok: shippingEdited, label: 'Tarifas de envío confirmadas', hint: 'Revisa costos y plazos en “Envíos y precios”: son valores de ejemplo hasta que los guardes.' },
    { id: 'rate', ok: settings.usdRate !== initialSettings.usdRate, label: 'Tipo de cambio USD revisado', hint: 'PayPal cobra en dólares: ajusta cuántos pesos equivalen a 1 USD.' },
    { id: 'policies', ok: policiesEdited, label: 'Políticas revisadas', hint: 'Los textos legales son borradores. Revísalos en “Políticas”.' },
    { id: 'contact', ok: !!settings.contactEmail, label: 'Correo de contacto', hint: 'Se usa para avisarte de cada pedido y como contacto de la tienda.' },
    { id: 'mail', ok: mailConfigured(), label: 'Correos automáticos a clientes', hint: 'Configura RESEND_API_KEY y MAIL_FROM para enviar confirmaciones.' },
  ];
  return {
    mode: paymentMode(), siteUrl: site, indexing: allowIndexing(), checks,
    providers: {
      mercadopago: { configured: !!mercadoPago().token, webhookSecret: !!mercadoPago().webhookSecret, webhookUrl: `${site}/api/webhooks/mercadopago` },
      paypal: { configured: !!(paypal().clientId && paypal().secret), environment: paypal().env, webhookId: !!paypal().webhookId, webhookUrl: `${site}/api/webhooks/paypal` },
    },
  };
}
export type StoreStatus = ReturnType<typeof storeStatus>;
