import { mailConfig, siteUrl } from './config';
import { formatMinor } from './money';
import { orderPath } from './i18n';
import { getSettings } from './store';
import type { Order } from './orders';

export const mailConfigured = () => !!(mailConfig().key && mailConfig().from);
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

async function send(to: string, subject: string, lines: string[], replyTo?: string) {
  const cfg = mailConfig();
  if (!cfg.key || !cfg.from || !to) return false;
  const html = `<div style="font-family:Arial,sans-serif;color:#293e35;max-width:560px">${lines.map(l => (l ? `<p>${esc(l)}</p>` : '<br>')).join('')}</div>`;
  try {
    const response = await fetch(`${cfg.api}/emails`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: cfg.from, to: [to], subject, text: lines.join('\n'), html, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    return response.ok;
  } catch { return false; }
}

const summary = (order: Order) => [
  ...order.items.map(i => `• ${i.name} × ${i.quantity}`),
  `${order.locale === 'es' ? 'Envío' : 'Shipping'}: ${formatMinor(order.charge.shipping, order.charge.currency, order.locale)}`,
  `Total: ${formatMinor(order.charge.total, order.charge.currency, order.locale)}`,
];

/** Emails are best-effort: a failed email never blocks or rolls back a confirmed payment. */
export async function notifyPaid(order: Order) {
  const settings = getSettings();
  const url = `${siteUrl()}${orderPath(order.locale, order.id)}`;
  const es = order.locale === 'es';
  await send(order.customer.email, es ? `Recibimos tu pedido #${order.number}` : `We received your order #${order.number}`, [
    es ? `Hola ${order.customer.name}, ¡gracias por tu compra!` : `Hi ${order.customer.name}, thank you for your purchase!`,
    '', ...summary(order), '',
    es ? 'Prepararemos tu pedido y te avisaremos cuando sea despachado.' : 'We will prepare your order and let you know when it ships.',
    `${es ? 'Estado del pedido' : 'Order status'}: ${url}`,
    'Úrsula Alcaíno · Orfebrería',
  ], settings.contactEmail || undefined);
  if (settings.contactEmail) {
    await send(settings.contactEmail, `Nuevo pedido pagado #${order.number}`, [
      `${order.customer.name} <${order.customer.email}> pagó con ${order.provider}.`,
      '', ...summary(order), '',
      `Enviar a: ${order.shipping.address}, ${order.shipping.city} ${order.shipping.region} ${order.shipping.postal}, ${order.shipping.country}`,
      order.shipping.notes ? `Notas: ${order.shipping.notes}` : '',
      order.attention ? `ATENCIÓN: ${order.attention}` : '',
      `Gestiónalo en ${siteUrl()}/admin`,
    ], order.customer.email);
  }
}
export async function notifyShipped(order: Order) {
  const es = order.locale === 'es';
  await send(order.customer.email, es ? `Tu pedido #${order.number} va en camino` : `Your order #${order.number} is on its way`, [
    es ? `Hola ${order.customer.name}, despachamos tu pedido.` : `Hi ${order.customer.name}, your order has shipped.`,
    order.tracking?.code ? `${es ? 'Seguimiento' : 'Tracking'}: ${order.tracking.carrier} ${order.tracking.code}` : '',
    order.tracking?.url || '',
    'Úrsula Alcaíno · Orfebrería',
  ], getSettings().contactEmail || undefined);
}
