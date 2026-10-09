import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { configuredProviders, type ProviderId } from './config';
import { toMinor, type Currency } from './money';
import { database, getPieces, getSettings } from './store';
import { COUNTRIES, MERCADOPAGO_COUNTRIES, shippingFor } from './shipping';
import type { Piece } from './pieces';

export type OrderStatus = 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'failed' | 'cancelled' | 'refunded';
export type Order = {
  id: string;
  number: string;
  created: string;
  updated: string;
  provider: ProviderId;
  status: OrderStatus;
  locale: 'es' | 'en';
  customer: { name: string; email: string; phone: string };
  shipping: { country: string; zone: string; region: string; city: string; address: string; postal: string; notes: string };
  items: { id: string; slug: string; name: string; price: number; quantity: number }[];
  /** Amounts in the minor unit of `currency` (CLP pesos or USD cents), computed only on the server. */
  charge: { currency: Currency; rate: number; subtotal: number; shipping: number; total: number };
  payment: { ref?: string; status?: string; redirectUrl?: string; paidAt?: string };
  tracking?: { carrier: string; code: string; url: string; at: string };
  reservedUntil: string;
  stockApplied: boolean;
  attention?: string;
  fingerprint: string;
  events: { at: string; text: string }[];
};

export const RESERVATION_MINUTES = 45;

export const checkoutSchema = z.object({
  requestKey: z.string().uuid(),
  locale: z.enum(['es', 'en']),
  provider: z.enum(['mercadopago', 'paypal', 'demo']),
  customer: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().max(30).default(''),
  }),
  shipping: z.object({
    country: z.string().length(2),
    region: z.string().trim().max(100).default(''),
    city: z.string().trim().min(2).max(100),
    address: z.string().trim().min(4).max(200),
    postal: z.string().trim().max(20).default(''),
    notes: z.string().trim().max(300).default(''),
  }),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

const STATUS_MAP: Record<string, OrderStatus> = { approved: 'paid', pending: 'pending_payment', rejected: 'failed' };
// Orders saved by the first demo version have a different shape.
function normalize(raw: any): Order {
  if (raw.charge) return raw as Order;
  const total = Number(raw.total) || 0;
  return {
    id: raw.id, number: String(raw.id).slice(0, 8).toUpperCase(), created: raw.created, updated: raw.created, provider: 'demo',
    status: STATUS_MAP[raw.status] || 'failed', locale: 'es',
    customer: { name: raw.customer?.name || '', email: raw.customer?.email || '', phone: '' },
    shipping: { country: 'CL', zone: 'chile', region: '', city: '', address: '', postal: '', notes: '' },
    items: (raw.items || []).map((i: any) => ({ slug: '', ...i })),
    charge: { currency: 'CLP', rate: 950, subtotal: total, shipping: 0, total },
    payment: {}, reservedUntil: raw.created, stockApplied: false, fingerprint: raw.fingerprint || '', events: [],
  };
}
const parse = (row: Record<string, unknown> | undefined) => (row ? normalize(JSON.parse(row.content as string)) : null);

export const getOrder = (id: string) => parse(database().prepare('SELECT content FROM orders WHERE id=?').get(id));
export const listOrders = (limit = 500) => database().prepare('SELECT content FROM orders ORDER BY created DESC LIMIT ?').all(limit).map(r => normalize(JSON.parse(r.content as string)));
function save(order: Order) {
  order.updated = new Date().toISOString();
  order.events = order.events.slice(-60);
  database().prepare('UPDATE orders SET content=? WHERE id=?').run(JSON.stringify(order), order.id);
}
const log = (order: Order, text: string) => { order.events.push({ at: new Date().toISOString(), text }); };
export const isExpired = (order: Order) => order.status === 'pending_payment' && Date.parse(order.reservedUntil) < Date.now();
/** What the owner sees: unpaid orders whose reservation ran out are shown as expired. */
export const displayStatus = (order: Order) => (isExpired(order) ? 'expired' : order.status);

export function holds() {
  const map = new Map<string, number>();
  for (const order of listOrders(300)) {
    if (order.status !== 'pending_payment' || isExpired(order)) continue;
    for (const line of order.items) map.set(line.id, (map.get(line.id) || 0) + line.quantity);
  }
  return map;
}
/** Units the public can still buy: stock minus units held by orders that are awaiting payment. */
export function availableStock(piece: Piece, held = holds()) { return Math.max(0, piece.stock - (held.get(piece.id) || 0)); }

export class CheckoutError extends Error {}

export function createOrder(input: CheckoutInput): Order {
  const db = database();
  const settings = getSettings();
  if (!COUNTRIES.includes(input.shipping.country)) throw new CheckoutError('No realizamos envíos a ese país.');
  const zone = shippingFor(settings, input.shipping.country);
  if (!zone.enabled) throw new CheckoutError('No realizamos envíos a ese país.');
  if (!configuredProviders().includes(input.provider)) throw new CheckoutError('Ese medio de pago no está disponible.');
  if (input.provider === 'mercadopago' && !MERCADOPAGO_COUNTRIES.has(input.shipping.country)) throw new CheckoutError('Mercado Pago solo está disponible para envíos a Chile. Usa PayPal.');
  const currency: Currency = input.provider === 'paypal' ? 'USD' : 'CLP';
  const fingerprint = createHash('sha256').update(JSON.stringify({ c: input.customer, s: input.shipping, i: input.items, p: input.provider, l: input.locale })).digest('hex');
  db.exec('BEGIN IMMEDIATE');
  try {
    const existing = parse(db.prepare('SELECT content FROM orders WHERE request_key=?').get(input.requestKey));
    if (existing) {
      if (existing.fingerprint !== fingerprint) throw new CheckoutError('Esta solicitud ya fue utilizada. Inicia un nuevo intento.');
      db.exec('COMMIT');
      return existing;
    }
    const pieces = getPieces();
    const held = holds();
    const quantities = new Map<string, number>();
    for (const line of input.items) quantities.set(line.id, (quantities.get(line.id) || 0) + line.quantity);
    const items = [...quantities].map(([id, quantity]) => {
      const piece = pieces.find(p => p.id === id);
      if (!piece || piece.kind !== 'Producto' || piece.availability !== 'Disponible' || quantity > 20 || availableStock(piece, held) < quantity) throw new CheckoutError('Una pieza ya no está disponible en esa cantidad. Actualiza tu bolsa.');
      return { id, slug: piece.slug, name: piece.name, price: piece.price, quantity };
    });
    const rate = settings.usdRate;
    const subtotal = items.reduce((n, i) => n + toMinor(i.price, currency, rate) * i.quantity, 0);
    const shipping = toMinor(zone.cost, currency, rate);
    const id = randomUUID();
    const now = new Date();
    const order: Order = {
      id, number: id.slice(0, 8).toUpperCase(), created: now.toISOString(), updated: now.toISOString(), provider: input.provider, status: 'pending_payment', locale: input.locale,
      customer: input.customer, shipping: { ...input.shipping, zone: zone.zone }, items,
      charge: { currency, rate, subtotal, shipping, total: subtotal + shipping }, payment: {},
      reservedUntil: new Date(now.getTime() + RESERVATION_MINUTES * 60000).toISOString(), stockApplied: false, fingerprint,
      events: [{ at: now.toISOString(), text: `Pedido creado (${input.provider}).` }],
    };
    db.prepare('INSERT INTO orders VALUES (?,?,?,?)').run(order.id, input.requestKey, JSON.stringify(order), order.created);
    db.exec('COMMIT');
    return order;
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

export function recordPaymentStart(id: string, payment: { ref?: string; redirectUrl?: string }) {
  const order = getOrder(id)!;
  order.payment = { ...order.payment, ...payment };
  save(order);
  return order;
}
export function note(id: string, text: string, status?: string) {
  const order = getOrder(id);
  if (!order) return null;
  if (status) order.payment.status = status;
  log(order, text);
  save(order);
  return order;
}
export function failOrder(id: string, text: string) {
  const order = getOrder(id);
  if (!order || order.status !== 'pending_payment') return order;
  order.status = 'failed';
  log(order, text);
  save(order);
  return order;
}

/** Confirms a verified payment: applies stock once and moves the order out of "pending". */
export function markPaid(id: string, payment: { ref: string; status: string }): { order: Order; changed: boolean } | null {
  const db = database();
  db.exec('BEGIN IMMEDIATE');
  try {
    const order = getOrder(id);
    if (!order) { db.exec('COMMIT'); return null; }
    if (['paid', 'shipped', 'delivered'].includes(order.status)) { db.exec('COMMIT'); return { order, changed: false }; }
    const problems: string[] = [];
    // Simulated payments never consume the real catalog's stock.
    if (order.provider !== 'demo') for (const line of order.items) {
      const row = db.prepare('SELECT content FROM pieces WHERE id=?').get(line.id);
      if (!row) { problems.push(`${line.name}: la pieza ya no existe`); continue; }
      const piece = JSON.parse(row.content as string) as Piece;
      if (piece.stock < line.quantity) problems.push(`${line.name}: stock insuficiente (${piece.stock} de ${line.quantity})`);
      piece.stock = Math.max(0, piece.stock - line.quantity);
      db.prepare('UPDATE pieces SET content=? WHERE id=?').run(JSON.stringify(piece), line.id);
    }
    const wasExpired = isExpired(order);
    order.status = 'paid';
    order.stockApplied = order.provider !== 'demo';
    order.payment = { ...order.payment, ref: payment.ref, status: payment.status, paidAt: new Date().toISOString() };
    if (problems.length) order.attention = `Pago recibido pero el inventario no alcanzó: ${problems.join('; ')}. Contacta a la clienta o reembolsa.`;
    else if (wasExpired) order.attention = undefined;
    log(order, `Pago confirmado (${order.provider}, ref ${payment.ref}).`);
    if (problems.length) log(order, order.attention!);
    save(order);
    db.exec('COMMIT');
    return { order, changed: true };
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

function restock(order: Order) {
  if (!order.stockApplied) return;
  for (const line of order.items) {
    const row = database().prepare('SELECT content FROM pieces WHERE id=?').get(line.id);
    if (!row) continue;
    const piece = JSON.parse(row.content as string) as Piece;
    piece.stock += line.quantity;
    database().prepare('UPDATE pieces SET content=? WHERE id=?').run(JSON.stringify(piece), line.id);
  }
  order.stockApplied = false;
}
export function markRefunded(id: string, options: { restock: boolean; text: string }) {
  const db = database();
  db.exec('BEGIN IMMEDIATE');
  try {
    const order = getOrder(id);
    if (!order || order.status === 'refunded' || order.status === 'pending_payment' || order.status === 'failed' || order.status === 'cancelled') { db.exec('COMMIT'); return order; }
    if (options.restock) restock(order);
    order.status = 'refunded';
    log(order, options.text);
    save(order);
    db.exec('COMMIT');
    return order;
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

export type AdminAction =
  | { action: 'ship'; carrier: string; code: string; url: string }
  | { action: 'deliver' }
  | { action: 'cancel' }
  | { action: 'refund'; restock: boolean };
export function applyAdminAction(id: string, input: AdminAction): Order {
  let order = getOrder(id);
  if (!order) throw new CheckoutError('El pedido no existe.');
  if (input.action === 'refund') return markRefunded(id, { restock: input.restock, text: 'Reembolso registrado por la administradora.' })!;
  if (input.action === 'ship') {
    if (order.status !== 'paid' && order.status !== 'shipped') throw new CheckoutError('Solo puedes despachar pedidos pagados.');
    order.status = 'shipped';
    order.tracking = { carrier: input.carrier, code: input.code, url: input.url, at: new Date().toISOString() };
    log(order, `Pedido despachado${input.code ? ` · ${input.carrier} ${input.code}` : ''}.`);
  } else if (input.action === 'deliver') {
    if (order.status !== 'shipped' && order.status !== 'paid') throw new CheckoutError('Solo puedes entregar pedidos pagados.');
    order.status = 'delivered';
    log(order, 'Pedido marcado como entregado.');
  } else {
    if (order.status !== 'pending_payment' && order.status !== 'failed') throw new CheckoutError('Un pedido pagado no se cancela: usa Reembolso.');
    order.status = 'cancelled';
    log(order, 'Pedido cancelado por la administradora.');
  }
  save(order);
  order = getOrder(id)!;
  return order;
}

/** Minimal projection for the buyer's status page and API: no address, no email. */
export function publicOrder(order: Order) {
  return {
    id: order.id, number: order.number, status: displayStatus(order), provider: order.provider, locale: order.locale,
    currency: order.charge.currency, total: order.charge.total, shippingCost: order.charge.shipping,
    items: order.items.map(i => ({ name: i.name, slug: i.slug, quantity: i.quantity })),
    retryUrl: order.provider !== 'demo' && order.status === 'pending_payment' && !isExpired(order) ? order.payment.redirectUrl || null : null,
    tracking: order.tracking ? { carrier: order.tracking.carrier, code: order.tracking.code, url: order.tracking.url } : null,
  };
}
