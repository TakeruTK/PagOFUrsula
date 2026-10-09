import { paypal, siteUrl } from '../config';
import { decimal, toMinor } from '../money';
import { getOrder, markPaid, markRefunded, note, type Order } from '../orders';
import { notifyPaid } from '../mail';

let cached: { token: string; expires: number } | null = null;
async function accessToken() {
  if (cached && cached.expires > Date.now() + 30000) return cached.token;
  const cfg = paypal();
  const response = await fetch(`${cfg.api}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${Buffer.from(`${cfg.clientId}:${cfg.secret}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error(`PayPal no autorizó las credenciales (${response.status}).`);
  cached = { token: data.access_token, expires: Date.now() + Number(data.expires_in || 300) * 1000 };
  return cached.token;
}
async function pp(path: string, init: RequestInit & { requestId?: string } = {}) {
  const { requestId, ...rest } = init;
  const response = await fetch(`${paypal().api}${path}`, {
    ...rest,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...(requestId ? { 'PayPal-Request-Id': requestId } : {}), ...rest.headers },
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

/** Creates the PayPal order on the server; the buyer approves it on PayPal and returns to our capture route. */
export async function startPayPal(order: Order) {
  const currency = order.charge.currency;
  const money = (minor: number) => ({ currency_code: currency, value: decimal(minor, currency) });
  const country = order.shipping.country;
  const { ok, data } = await pp('/v2/checkout/orders', {
    method: 'POST',
    requestId: `create-${order.id}`,
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.id,
        custom_id: order.id,
        invoice_id: order.number,
        description: 'Úrsula Alcaíno · Orfebrería',
        amount: { ...money(order.charge.total), breakdown: { item_total: money(order.charge.subtotal), shipping: money(order.charge.shipping) } },
        items: order.items.map(i => ({
          name: i.name.slice(0, 127), quantity: String(i.quantity), category: 'PHYSICAL_GOODS',
          unit_amount: money(toMinor(i.price, currency, order.charge.rate)),
        })),
        shipping: {
          name: { full_name: order.customer.name },
          address: { address_line_1: order.shipping.address, admin_area_2: order.shipping.city, admin_area_1: order.shipping.region || undefined, postal_code: order.shipping.postal || undefined, country_code: country },
        },
      }],
      payment_source: {
        paypal: {
          email_address: order.customer.email,
          experience_context: {
            brand_name: 'Úrsula Alcaíno · Orfebrería',
            locale: order.locale === 'es' ? 'es-CL' : 'en-US',
            shipping_preference: 'SET_PROVIDED_ADDRESS',
            user_action: 'PAY_NOW',
            return_url: `${siteUrl()}/api/checkout/paypal/return?order=${order.id}`,
            cancel_url: `${siteUrl()}/${order.locale}/order/${order.id}?cancelled=1`,
          },
        },
      },
    }),
  });
  const link = (data.links || []).find((l: { rel: string; href: string }) => l.rel === 'payer-action' || l.rel === 'approve');
  if (!ok || !data.id || !link) throw new Error(`PayPal no pudo crear el pago: ${JSON.stringify(data).slice(0, 300)}`);
  return { redirectUrl: link.href as string, ref: data.id as string };
}

type Capture = { id: string; status: string; amount: { value: string; currency_code: string }; custom_id?: string };

/** Verifies a PayPal capture against the stored order before confirming it. */
export function applyCapture(order: Order, capture: Capture) {
  const expected = decimal(order.charge.total, order.charge.currency);
  if (capture.status === 'COMPLETED') {
    if (capture.amount.currency_code !== order.charge.currency || capture.amount.value !== expected) {
      note(order.id, `Cobro ${capture.id} ignorado: monto o moneda no coinciden (${capture.amount.value} ${capture.amount.currency_code}).`, 'mismatch');
      return getOrder(order.id)!;
    }
    const result = markPaid(order.id, { ref: capture.id, status: capture.status });
    if (result?.changed) void notifyPaid(result.order);
    return result?.order || order;
  }
  note(order.id, `PayPal: cobro ${capture.id} en estado ${capture.status}.`, capture.status);
  return getOrder(order.id)!;
}

/** Called when the buyer comes back from PayPal: captures the approved order server-side. */
export async function capturePayPal(order: Order, paypalOrderId: string) {
  if (order.provider !== 'paypal' || !order.payment.ref || order.payment.ref !== paypalOrderId) throw new Error('El pago no corresponde a este pedido.');
  if (['paid', 'shipped', 'delivered'].includes(order.status)) return order;
  let { ok, data } = await pp(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, { method: 'POST', requestId: `capture-${order.id}`, body: '{}' });
  if (!ok && JSON.stringify(data).includes('ORDER_ALREADY_CAPTURED')) ({ ok, data } = await pp(`/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`));
  const capture = data?.purchase_units?.[0]?.payments?.captures?.[0] as Capture | undefined;
  if (!ok || !capture) {
    note(order.id, `PayPal no completó el cobro: ${JSON.stringify(data).slice(0, 200)}`, 'capture_failed');
    return getOrder(order.id)!;
  }
  return applyCapture(order, capture);
}

/** PayPal asks its own API whether the webhook is genuine (certificate verification). */
export async function verifyWebhook(headers: Headers, event: unknown) {
  const webhookId = paypal().webhookId;
  if (!webhookId) return false;
  const { ok, data } = await pp('/v1/notifications/verify-webhook-signature', {
    method: 'POST',
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'), cert_url: headers.get('paypal-cert-url'), transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'), transmission_time: headers.get('paypal-transmission-time'), webhook_id: webhookId, webhook_event: event,
    }),
  });
  return ok && data.verification_status === 'SUCCESS';
}

export async function handleWebhook(event: { event_type: string; resource: Capture & { supplementary_data?: unknown } }) {
  const capture = event.resource;
  const id = capture?.custom_id;
  const order = id ? getOrder(id) : null;
  if (!order || order.provider !== 'paypal') return;
  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    // Fetch the capture from PayPal instead of trusting the notification body.
    const { ok, data } = await pp(`/v2/payments/captures/${encodeURIComponent(capture.id)}`);
    if (ok && data.status === 'COMPLETED' && data.custom_id === order.id) applyCapture(order, data as Capture);
  } else if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED' || event.event_type === 'PAYMENT.CAPTURE.REVERSED') {
    markRefunded(order.id, { restock: false, text: `PayPal informó ${event.event_type}.` });
  } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
    note(order.id, 'PayPal informó que el cobro fue denegado.', 'DENIED');
  }
}
