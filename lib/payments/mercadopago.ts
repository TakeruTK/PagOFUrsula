import { createHmac, timingSafeEqual } from 'node:crypto';
import { isHttps, mercadoPago, siteUrl } from '../config';
import { orderPath } from '../i18n';
import { getOrder, markPaid, markRefunded, note, RESERVATION_MINUTES, type Order } from '../orders';
import { notifyPaid } from '../mail';

type MpPayment = { id: number | string; status: string; status_detail?: string; external_reference?: string; transaction_amount: number; currency_id: string };

async function mp(path: string, init?: RequestInit) {
  const cfg = mercadoPago();
  const response = await fetch(`${cfg.api}${path}`, { ...init, headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json', ...init?.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Mercado Pago respondió ${response.status}: ${JSON.stringify(data).slice(0, 300)}`);
  return data;
}

/** Creates a Checkout Pro preference on the server and returns the page where the buyer pays. */
export async function startMercadoPago(order: Order) {
  const back = `${siteUrl()}${orderPath(order.locale, order.id)}`;
  const items = order.items.map(i => ({ id: i.id, title: i.name, quantity: i.quantity, unit_price: i.price, currency_id: 'CLP' }));
  if (order.charge.shipping > 0) items.push({ id: 'shipping', title: order.locale === 'es' ? 'Envío' : 'Shipping', quantity: 1, unit_price: order.charge.shipping, currency_id: 'CLP' });
  const body: Record<string, unknown> = {
    items,
    payer: { name: order.customer.name, email: order.customer.email },
    external_reference: order.id,
    statement_descriptor: 'URSULA ALCAINO',
    back_urls: { success: back, pending: back, failure: back },
    expires: true,
    expiration_date_to: new Date(Date.now() + RESERVATION_MINUTES * 60000).toISOString(),
  };
  // Mercado Pago rejects non-HTTPS callbacks, so these are only sent on a public HTTPS site.
  if (isHttps()) {
    body.auto_return = 'approved';
    body.notification_url = `${siteUrl()}/api/webhooks/mercadopago`;
  }
  const preference = await mp('/checkout/preferences', { method: 'POST', body: JSON.stringify(body), headers: { 'X-Idempotency-Key': order.id } });
  const redirectUrl = preference.init_point as string | undefined;
  if (!redirectUrl) throw new Error('Mercado Pago no devolvió la dirección de pago.');
  return { redirectUrl, ref: String(preference.id) };
}

/** Validates the `x-signature` header (HMAC-SHA256 of "id:<data.id>;request-id:<id>;ts:<ts>;"). */
export function verifySignature(headers: Headers, dataId: string | null) {
  const secret = mercadoPago().webhookSecret;
  if (!secret) return true; // Payments are always re-fetched from Mercado Pago; the signature is an extra layer.
  const parts = Object.fromEntries((headers.get('x-signature') || '').split(',').map(p => p.trim().split('=') as [string, string]));
  if (!parts.ts || !parts.v1) return false;
  const manifest = `${dataId ? `id:${dataId.toLowerCase()};` : ''}${headers.get('x-request-id') ? `request-id:${headers.get('x-request-id')};` : ''}ts:${parts.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest('hex');
  const received = Buffer.from(parts.v1, 'hex'), wanted = Buffer.from(expected, 'hex');
  return received.length === wanted.length && timingSafeEqual(received, wanted);
}

/** Applies a payment fetched *from Mercado Pago*; the browser and webhook body are never trusted. */
export async function applyPayment(payment: MpPayment) {
  const order = payment.external_reference ? getOrder(payment.external_reference) : null;
  if (!order || order.provider !== 'mercadopago') return null;
  if (payment.status === 'approved') {
    if (payment.currency_id !== 'CLP' || Math.round(payment.transaction_amount) !== order.charge.total) {
      note(order.id, `Pago ${payment.id} ignorado: monto o moneda no coinciden (${payment.transaction_amount} ${payment.currency_id}).`, 'mismatch');
      return order;
    }
    const result = markPaid(order.id, { ref: String(payment.id), status: payment.status });
    if (result?.changed) void notifyPaid(result.order);
    return result?.order || order;
  }
  if (payment.status === 'refunded' || payment.status === 'charged_back') return markRefunded(order.id, { restock: false, text: `Mercado Pago informó ${payment.status}.` });
  if (order.payment.status !== payment.status) note(order.id, `Mercado Pago: pago ${payment.id} en estado ${payment.status}${payment.status_detail ? ` (${payment.status_detail})` : ''}.`, payment.status);
  return getOrder(order.id);
}

export const fetchPayment = (id: string) => mp(`/v1/payments/${encodeURIComponent(id)}`) as Promise<MpPayment>;

/** Used when the buyer returns before the webhook arrives (or on a site that cannot receive webhooks). */
export async function reconcile(order: Order) {
  if (order.provider !== 'mercadopago' || order.status !== 'pending_payment' || !mercadoPago().token) return order;
  try {
    const found = await mp(`/v1/payments/search?external_reference=${encodeURIComponent(order.id)}&sort=date_created&criteria=desc`);
    const payments = (found.results || []) as MpPayment[];
    const winner = payments.find(p => p.status === 'approved') || payments[0];
    if (winner) return (await applyPayment(winner)) || order;
  } catch { /* the webhook or the next visit will retry */ }
  return getOrder(order.id) || order;
}
