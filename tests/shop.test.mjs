import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { createHmac, randomBytes, pbkdf2Sync, randomUUID } from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';

const base = 'http://127.0.0.1:3013', live = 'http://127.0.0.1:3015', fakePort = 3014;
const username = 'test-atelier', password = randomBytes(20).toString('hex'), salt = randomBytes(16).toString('hex');
const hash = `pbkdf2-sha256:100000:${salt}:${pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')}`;
const MP_SECRET = 'mp-test-secret';
let server, indexed, fake, cookie = '', pieces, output = '', draftId, photoUrl, settings;

// ---- Fake Mercado Pago and PayPal APIs: the shop talks to these instead of the real ones -------------------------
const mp = { preferences: [], payments: {} };
const pp = { orders: {}, captures: {}, seq: 0 };
function startFake() {
  fake = createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString(); const body = raw && raw.startsWith('{') ? JSON.parse(raw) : {};
    const url = new URL(req.url, 'http://x'); const send = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)); };
    const p = url.pathname;
    if (p === '/mp/checkout/preferences') { mp.preferences.push({ body, headers: req.headers }); return send(201, { id: `pref-${mp.preferences.length}`, init_point: `https://mp.example/pay/pref-${mp.preferences.length}` }); }
    if (p === '/mp/v1/payments/search') return send(200, { results: Object.values(mp.payments).filter(x => x.external_reference === url.searchParams.get('external_reference')) });
    if (p.startsWith('/mp/v1/payments/')) { const found = mp.payments[p.split('/').pop()]; return found ? send(200, found) : send(404, { message: 'not found' }); }
    if (p === '/pp/v1/oauth2/token') return send(200, { access_token: 'pp-token', expires_in: 3000 });
    if (p === '/pp/v2/checkout/orders') { const id = `PP${++pp.seq}`; pp.orders[id] = body; return send(201, { id, status: 'PAYER_ACTION_REQUIRED', links: [{ rel: 'payer-action', href: `https://paypal.example/approve/${id}` }] }); }
    if (p.startsWith('/pp/v2/checkout/orders/') && p.endsWith('/capture')) {
      const id = p.split('/')[5]; const order = pp.orders[id]; if (!order) return send(404, {});
      const unit = order.purchase_units[0]; const capture = { id: `CAP-${id}`, status: 'COMPLETED', amount: unit.amount && { value: unit.amount.value, currency_code: unit.amount.currency_code }, custom_id: unit.custom_id };
      pp.captures[capture.id] = capture; return send(201, { id, status: 'COMPLETED', purchase_units: [{ payments: { captures: [capture] } }] });
    }
    if (p.startsWith('/pp/v2/payments/captures/')) { const c = pp.captures[p.split('/').pop()]; return c ? send(200, c) : send(404, {}); }
    if (p === '/pp/v1/notifications/verify-webhook-signature') return send(200, { verification_status: body.webhook_id === 'WH-1' && body.transmission_sig === 'good' ? 'SUCCESS' : 'FAILURE' });
    send(404, { error: p });
  });
  return new Promise(r => fake.listen(fakePort, '127.0.0.1', r));
}

const request = (url, { method = 'GET', body, auth = false, origin = base, headers = {}, ...rest } = {}) => fetch(base + url, { method, headers: { ...(method !== 'GET' ? { Origin: origin } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Cookie: cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined, redirect: 'manual', ...rest });
const shipTo = (country = 'CL') => ({ country, city: 'Santiago', address: 'Av. Siempre Viva 123', region: 'RM', postal: '8320000' });
const checkout = (o = {}) => ({ requestKey: randomUUID(), locale: 'es', provider: 'mercadopago', customer: { name: 'Prueba automática', email: 'test@example.com' }, shipping: shipTo(), items: [{ id: pieces[0].id, quantity: 1 }], ...o });
const stockOf = async id => (await (await request('/api/pieces')).json()).find(p => p.id === id).stock;
const orderStatus = async id => (await (await request(`/api/orders/${id}/status`)).json()).status;
const adminOrders = async () => (await request('/api/orders', { auth: true })).json();
const mpSign = (dataId, requestId = 'req-1') => { const ts = String(Date.now()); return { 'x-request-id': requestId, 'x-signature': `ts=${ts},v1=${createHmac('sha256', MP_SECRET).update(`id:${dataId};request-id:${requestId};ts:${ts};`).digest('hex')}` }; };
const mpWebhook = (dataId, headers) => request(`/api/webhooks/mercadopago?data.id=${dataId}&type=payment`, { method: 'POST', body: { type: 'payment', data: { id: dataId } }, headers });

function launch(port, env) {
  const dataDir = mkdtempSync(path.resolve('test-results', 'database-'));
  const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { cwd: process.cwd(), env: { ...process.env, ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: hash, DATA_DIR: dataDir, ...env }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
  child.stdout.on('data', d => output += d); child.stderr.on('data', d => output += d);
  return child;
}
async function ready(url) {
  const end = Date.now() + 60000;
  while (Date.now() < end) { try { const r = await fetch(url); if (r.ok) return r; } catch { /* starting */ } await new Promise(r => setTimeout(r, 300)); }
  assert.fail(output);
}
before(async () => {
  mkdirSync('test-results', { recursive: true });
  await startFake();
  server = launch(3013, {
    PAYMENT_MODE: 'live', SITE_URL: base, MP_ACCESS_TOKEN: 'mp-token', MP_WEBHOOK_SECRET: MP_SECRET, MP_API_BASE: `http://127.0.0.1:${fakePort}/mp`,
    PAYPAL_ENV: 'sandbox', PAYPAL_CLIENT_ID: 'id', PAYPAL_CLIENT_SECRET: 'secret', PAYPAL_WEBHOOK_ID: 'WH-1', PAYPAL_API_BASE: `http://127.0.0.1:${fakePort}/pp`,
  });
  indexed = launch(3015, { PAYMENT_MODE: 'demo', SITE_URL: 'https://shop.example.com', ALLOW_INDEXING: 'true' });
  pieces = await (await ready(base + '/api/pieces')).json();
  await ready(live + '/api/pieces');
  settings = await (await request('/api/settings')).json();
});
after(async () => {
  for (const child of [server, indexed]) if (child && child.exitCode === null) { child.kill(); await Promise.race([once(child, 'exit'), new Promise(r => setTimeout(r, 3000))]); }
  fake?.close();
});

// ---- Security of private endpoints ---------------------------------------------------------------------------
test('private endpoints and cross-origin writes are protected', async () => {
  assert.equal((await request('/api/pieces?admin')).status, 401);
  assert.equal((await request('/api/orders')).status, 401);
  assert.equal((await request('/api/admin/status')).status, 401);
  assert.equal((await request('/api/pieces', { method: 'POST', body: pieces[0] })).status, 401);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout(), origin: 'https://untrusted.example' })).status, 403);
  assert.equal((await request('/api/admin/login', { method: 'POST', body: { username, password: 'wrong' } })).status, 401);
  assert.equal((await request('/admin')).headers.get('x-robots-tag'), 'noindex, nofollow');
});
test('admin session uses HTTP-only cookie and supports authenticated edits', async () => {
  const r = await request('/api/admin/login', { method: 'POST', body: { username, password } }); assert.equal(r.status, 200);
  const header = r.headers.get('set-cookie'); assert.match(header, /HttpOnly/); assert.match(header, /SameSite=Strict/); cookie = header.split(';')[0];
  assert.equal((await request('/api/pieces?admin', { auth: true })).status, 200);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, origin: 'https://untrusted.example', body: {} })).status, 403);
  const status = await (await request('/api/admin/status', { auth: true })).json();
  assert.equal(status.mode, 'live'); assert.ok(status.providers.mercadopago.configured && status.providers.paypal.configured);
  assert.ok(!JSON.stringify(status).includes('mp-token') && !JSON.stringify(status).includes('secret'), 'status must never expose secrets');
});

// ---- Catalog ---------------------------------------------------------------------------------------------------
test('photo upload, private draft, publish, edit, slug and delete persist on server', async () => {
  const form = new FormData(); form.append('file', new Blob([readFileSync('public/references/ursula.png')], { type: 'image/png' }), 'piece.png');
  const upload = await fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form }); assert.equal(upload.status, 200); photoUrl = (await upload.json()).url;
  assert.equal((await request(photoUrl)).status, 404);
  const draft = { ...pieces[0], id: undefined, slug: undefined, name: 'Pieza de prueba privada', status: 'Borrador', stock: 3, images: [{ url: photoUrl, caption: 'Prueba' }] };
  const created = await request('/api/pieces', { method: 'POST', auth: true, body: draft }); assert.equal(created.status, 200); draftId = (await created.json()).id;
  assert.ok(!(await (await request('/api/pieces')).json()).some(p => p.id === draftId));
  assert.equal((await request('/es/joyas/pieza-de-prueba-privada')).status, 404, 'drafts have no public page');
  assert.equal((await request(photoUrl, { auth: true })).status, 200);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ items: [{ id: draftId, quantity: 1 }] }) })).status, 400);
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...draft, id: draftId, slug: pieces[0].slug, status: 'Publicado' } })).status, 400, 'duplicate slug is refused');
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...draft, id: draftId, status: 'Publicado', price: 55000, order: 99 } })).status, 200);
  const photo = await request(photoUrl); assert.equal(photo.status, 200); assert.match(photo.headers.get('cache-control'), /immutable/);
  const visible = (await (await request('/api/pieces')).json()).find(p => p.id === draftId); assert.equal(visible.price, 55000); assert.equal(visible.slug, 'pieza-de-prueba-privada');
  assert.equal((await request('/es/joyas/pieza-de-prueba-privada')).status, 200);
});
test('settings persist, merge new fields and reject non-Instagram links', async () => {
  assert.ok(settings.shipping.chile && settings.en.headline && settings.policies.es.terms, 'older settings are completed with defaults');
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...settings, headline: 'Una portada de prueba.' } })).status, 200);
  assert.equal((await (await request('/api/settings')).json()).headline, 'Una portada de prueba.');
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...settings, instagram: 'https://untrusted.example' } })).status, 400);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...settings, usdRate: 1 } })).status, 400);
});

// ---- Mercado Pago ---------------------------------------------------------------------------------------------
test('Mercado Pago: server-built preference, verified webhook, amounts re-checked, stock applied once', async () => {
  const before = await stockOf(pieces[0].id);
  const r = await request('/api/checkout', { method: 'POST', body: checkout({ items: [{ id: pieces[0].id, quantity: 1, price: 1 }], total: 1 }) }); assert.equal(r.status, 200);
  const order = await r.json(); const expected = pieces[0].price + settings.shipping.chile.cost;
  assert.equal(order.currency, 'CLP'); assert.equal(order.total, expected); assert.match(order.redirectUrl, /^https:\/\/mp\.example\/pay\//);
  const pref = mp.preferences.at(-1).body;
  assert.equal(pref.external_reference, order.id); assert.equal(pref.items[0].unit_price, pieces[0].price); assert.equal(pref.items.at(-1).unit_price, settings.shipping.chile.cost);
  assert.equal(pref.items.reduce((n, i) => n + i.unit_price * i.quantity, 0), expected);
  assert.equal(pref.notification_url, undefined, 'plain-http sites cannot receive webhooks');
  assert.equal(mp.preferences.at(-1).headers['x-idempotency-key'], order.id);
  assert.equal(await orderStatus(order.id), 'pending_payment'); assert.equal(await stockOf(pieces[0].id), before);

  mp.payments['9001'] = { id: 9001, status: 'approved', external_reference: order.id, transaction_amount: expected - 1, currency_id: 'CLP' };
  assert.equal((await mpWebhook('9001', { 'x-request-id': 'r', 'x-signature': 'ts=1,v1=' + '0'.repeat(64) })).status, 401, 'forged signature');
  assert.equal((await mpWebhook('9001', mpSign('9001'))).status, 200);
  assert.equal(await orderStatus(order.id), 'pending_payment', 'a payment with the wrong amount never confirms the order');

  mp.payments['9002'] = { id: 9002, status: 'approved', external_reference: order.id, transaction_amount: expected, currency_id: 'CLP' };
  assert.equal((await mpWebhook('9002', mpSign('9002'))).status, 200);
  assert.equal(await orderStatus(order.id), 'paid'); assert.equal(await stockOf(pieces[0].id), before - 1);
  assert.equal((await mpWebhook('9002', mpSign('9002'))).status, 200);
  assert.equal(await stockOf(pieces[0].id), before - 1, 'a repeated notification does not discount stock twice');
  globalThis.paidMpOrder = order.id;
});
test('Mercado Pago: returning buyer is reconciled against the API without a webhook', async () => {
  const order = await (await request('/api/checkout', { method: 'POST', body: checkout({ items: [{ id: pieces[1].id, quantity: 1 }] }) })).json();
  mp.payments['9100'] = { id: 9100, status: 'approved', external_reference: order.id, transaction_amount: pieces[1].price + settings.shipping.chile.cost, currency_id: 'CLP' };
  assert.equal(await orderStatus(order.id), 'paid');
});

// ---- PayPal ---------------------------------------------------------------------------------------------------------
test('PayPal: USD order built on the server, captured server-side and verified', async () => {
  const before = await stockOf(pieces[2].id);
  const r = await request('/api/checkout', { method: 'POST', body: checkout({ provider: 'paypal', locale: 'en', shipping: shipTo('US'), items: [{ id: pieces[2].id, quantity: 2 }] }) }); assert.equal(r.status, 200);
  const order = await r.json(); assert.equal(order.currency, 'USD');
  const unit = pp.orders[`PP${pp.seq}`].purchase_units[0]; const rate = settings.usdRate;
  const item = Math.round(pieces[2].price * 100 / rate), ship = Math.round(settings.shipping.world.cost * 100 / rate);
  assert.equal(order.total, item * 2 + ship); assert.equal(unit.amount.value, ((item * 2 + ship) / 100).toFixed(2)); assert.equal(unit.amount.breakdown.item_total.value, ((item * 2) / 100).toFixed(2));
  assert.equal(unit.items[0].unit_amount.value, (item / 100).toFixed(2)); assert.equal(unit.custom_id, order.id); assert.equal(unit.shipping.address.country_code, 'US');
  assert.match(order.redirectUrl, /^https:\/\/paypal\.example\/approve\/PP/);

  const orderId = `PP${pp.seq}`;
  const wrong = await request(`/api/checkout/paypal/return?order=${order.id}&token=NOT-THIS-ONE`); assert.equal(wrong.status, 303);
  assert.equal(await orderStatus(order.id), 'pending_payment', 'a token that does not match the stored PayPal order never captures');
  const back = await request(`/api/checkout/paypal/return?order=${order.id}&token=${orderId}`); assert.equal(back.status, 303); assert.match(back.headers.get('location'), new RegExp(`/en/order/${order.id}$`));
  assert.equal(await orderStatus(order.id), 'paid'); assert.equal(await stockOf(pieces[2].id), before - 2);
  await request(`/api/checkout/paypal/return?order=${order.id}&token=${orderId}`);
  assert.equal(await stockOf(pieces[2].id), before - 2, 'returning twice does not discount stock twice');
});
test('PayPal: webhook is verified with PayPal and the capture is re-fetched', async () => {
  const order = await (await request('/api/checkout', { method: 'POST', body: checkout({ provider: 'paypal', shipping: shipTo('DE'), items: [{ id: pieces[3].id, quantity: 1 }] }) })).json();
  const unit = pp.orders[`PP${pp.seq}`].purchase_units[0];
  pp.captures['CAP-W1'] = { id: 'CAP-W1', status: 'COMPLETED', amount: { value: unit.amount.value, currency_code: 'USD' }, custom_id: order.id };
  const event = { event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: { id: 'CAP-W1', custom_id: order.id, status: 'COMPLETED' } };
  const headers = { 'paypal-auth-algo': 'SHA256withRSA', 'paypal-cert-url': 'https://x', 'paypal-transmission-id': '1', 'paypal-transmission-time': 'now' };
  assert.equal((await request('/api/webhooks/paypal', { method: 'POST', body: event, headers: { ...headers, 'paypal-transmission-sig': 'bad' } })).status, 401);
  assert.equal(await orderStatus(order.id), 'pending_payment');
  assert.equal((await request('/api/webhooks/paypal', { method: 'POST', body: event, headers: { ...headers, 'paypal-transmission-sig': 'good' } })).status, 200);
  assert.equal(await orderStatus(order.id), 'paid');
});

// ---- Rules: shipping, availability, reservations ------------------------------------------------------------
test('payment method, destination and availability rules are enforced on the server', async () => {
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ shipping: shipTo('US') }) })).status, 400, 'Mercado Pago only ships to Chile');
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ provider: 'demo' }) })).status, 400, 'simulator is off in live mode');
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ shipping: shipTo('XX') }) })).status, 400);
  for (const items of [[{ id: randomUUID(), quantity: 1 }], [{ id: pieces[0].id, quantity: 0 }], [{ id: pieces[0].id, quantity: 99 }], [{ id: pieces[0].id, quantity: 3 }, { id: pieces[0].id, quantity: 3 }], []]) assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ items }) })).status, 400);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ customer: { name: 'A', email: 'no-email' } }) })).status, 400);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...settings, shipping: { ...settings.shipping, world: { ...settings.shipping.world, enabled: false } } } })).status, 200);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ provider: 'paypal', shipping: shipTo('JP') }) })).status, 400, 'disabled zone');
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: settings })).status, 200);
});
test('unpaid orders hold stock, idempotency keys are bound to their content and cancelling releases the hold', async () => {
  const item = { id: draftId, quantity: 3 };
  const input = checkout({ items: [item] });
  const first = await (await request('/api/checkout', { method: 'POST', body: input })).json();
  assert.equal((await (await request('/api/checkout', { method: 'POST', body: input })).json()).id, first.id, 'same key and content returns the same order');
  assert.equal((await request('/api/checkout', { method: 'POST', body: { ...input, customer: { ...input.customer, name: 'Otra persona' } } })).status, 400);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ items: [{ id: draftId, quantity: 1 }] }) })).status, 400, 'every unit is reserved');
  const card = (await (await request('/api/pieces')).json()).find(p => p.id === draftId); assert.equal(card.stock, 3, 'raw stock is unchanged until payment');
  const cancelled = await request(`/api/orders/${first.id}`, { method: 'PUT', auth: true, body: { action: 'cancel' } }); assert.equal(cancelled.status, 200);
  assert.equal((await request('/api/checkout', { method: 'POST', body: checkout({ items: [{ id: draftId, quantity: 1 }] }) })).status, 200);
});

// ---- Workshop order management ----------------------------------------------------------------------------------
test('workshop can ship, export, and refund with restock', async () => {
  const orders = await adminOrders(); const mine = orders.find(o => o.id === globalThis.paidMpOrder);
  assert.equal(mine.status, 'paid'); assert.equal(mine.customer.email, 'test@example.com'); assert.equal(mine.fingerprint, undefined);
  assert.equal((await request(`/api/orders/${mine.id}`, { method: 'PUT', body: { action: 'ship' } })).status, 401);
  const shipped = await request(`/api/orders/${mine.id}`, { method: 'PUT', auth: true, body: { action: 'ship', carrier: 'Chilexpress', code: 'CX123', url: 'https://example.com/t/CX123' } });
  assert.equal(shipped.status, 200); assert.equal((await shipped.json()).status, 'shipped');
  const pub = await (await request(`/api/orders/${mine.id}/status`)).json(); assert.equal(pub.tracking.code, 'CX123'); assert.equal(pub.customer, undefined, 'public status never exposes personal data');
  const csv = await request('/api/orders?format=csv', { auth: true }); assert.match(csv.headers.get('content-type'), /text\/csv/); assert.match(await csv.text(), /CX123/);
  const before = await stockOf(pieces[0].id);
  assert.equal((await request(`/api/orders/${mine.id}`, { method: 'PUT', auth: true, body: { action: 'refund', restock: true } })).status, 200);
  assert.equal(await stockOf(pieces[0].id), before + 1); assert.equal(await orderStatus(mine.id), 'refunded');
  assert.equal((await request(`/api/orders/${mine.id}`, { method: 'PUT', auth: true, body: { action: 'cancel' } })).status, 400, 'a paid order cannot be cancelled, only refunded');
});

// ---- International SEO -----------------------------------------------------------------------------------------------
test('language negotiation and localized pages with hreflang, canonical and structured data', async () => {
  const en = await request('/', { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }); assert.equal(en.status, 307); assert.match(en.headers.get('location'), /\/en$/);
  const es = await request('/', { headers: { 'Accept-Language': 'es-CL,es;q=0.9' } }); assert.match(es.headers.get('location'), /\/es$/);
  assert.match((await request('/', { headers: { 'Accept-Language': 'ja' } })).headers.get('location'), /\/en$/);
  assert.match((await request('/', { headers: { 'Accept-Language': 'ja', Cookie: 'NEXT_LOCALE=es' } })).headers.get('location'), /\/es$/);
  const home = await (await request('/en')).text();
  assert.match(home, /<html lang="en"/); assert.match(home, /rel="canonical" href="http:\/\/127\.0\.0\.1:3013\/en"/); assert.match(home, /hrefLang="es" href="http:\/\/127\.0\.0\.1:3013\/es"/); assert.match(home, /hrefLang="x-default"/); assert.match(home, /"@type":"Organization"/);
  const piece = await request(`/en/jewelry/${pieces[0].slug}`); const html = await piece.text();
  assert.equal(piece.status, 200); assert.match(html, /"@type":"Product"/); assert.match(html, /"priceCurrency":"USD"/); assert.match(html, /<h1>Sendero earrings<\/h1>/);
  assert.match(html, new RegExp(`hrefLang="es" href="http://127.0.0.1:3013/es/joyas/${pieces[0].slug}"`)); assert.match(html, /"@type":"BreadcrumbList"/);
  const es2 = await (await request(`/es/joyas/${pieces[0].slug}`)).text(); assert.match(es2, /"priceCurrency":"CLP"/); assert.match(es2, /<html lang="es"/);
  assert.equal((await request('/es/joyas/no-existe')).status, 404); assert.equal((await request('/fr')).status, 307);
  for (const p of ['/es/terminos', '/es/privacidad', '/es/envios-y-devoluciones', '/en/terms', '/en/privacy', '/en/shipping-returns']) assert.equal((await request(p)).status, 200, p);
});
test('review environments stay out of search engines; the approved site is indexable with a complete sitemap', async () => {
  assert.equal((await request('/es')).headers.get('x-robots-tag'), 'noindex, nofollow'); assert.match(await (await request('/es')).text(), /name="robots" content="noindex, nofollow"/);
  assert.match(await (await request('/robots.txt')).text(), /Disallow: \//); assert.doesNotMatch(await (await request('/robots.txt')).text(), /Sitemap:/);
  const home = await fetch(live + '/en'); assert.equal(home.headers.get('x-robots-tag'), null); const html = await home.text();
  assert.match(html, /name="robots" content="index, follow/); assert.match(html, /rel="canonical" href="https:\/\/shop\.example\.com\/en"/);
  const robots = await (await fetch(live + '/robots.txt')).text(); assert.match(robots, /Sitemap: https:\/\/shop\.example\.com\/sitemap\.xml/); assert.match(robots, /Disallow: \/admin/);
  const map = await (await fetch(live + '/sitemap.xml')).text(); assert.match(map, /hreflang="en" href="https:\/\/shop\.example\.com\/en\/jewelry\/sendero?|hreflang="en" href="https:\/\/shop\.example\.com\/en\/jewelry\/aros-sendero"/); assert.match(map, /shop\.example\.com\/es\/envios-y-devoluciones/);
  assert.equal((await fetch(live + '/admin')).headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal((await fetch(live + '/api/pieces')).headers.get('x-robots-tag'), 'noindex, nofollow');
});
test('simulator is available in demo mode and never discounts the real catalog', async () => {
  const items = (await (await fetch(live + '/api/pieces')).json()); const post = (url, body) => fetch(live + url, { method: 'POST', headers: { Origin: live, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const order = await (await post('/api/checkout', checkout({ provider: 'demo', items: [{ id: items[0].id, quantity: 2 }] }))).json(); assert.match(order.redirectUrl, /\/order\/.+\?demo=1$/);
  assert.equal((await post('/api/checkout/demo', { orderId: order.id, outcome: 'approved' })).status, 200);
  assert.equal((await (await fetch(`${live}/api/orders/${order.id}/status`)).json()).status, 'paid');
  assert.equal((await (await fetch(live + '/api/pieces')).json())[0].stock, items[0].stock);
  assert.equal((await post('/api/checkout', checkout({ provider: 'paypal' }))).status, 400, 'real providers are off without credentials');
});

// ---- Account ----------------------------------------------------------------------------------------------------------
test('password change revokes sessions; logout revokes a captured session; login rate limit is enforced', async () => {
  const next = randomBytes(12).toString('hex');
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: 'wrong-password', next } })).status, 400);
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: password, next: 'short' } })).status, 400);
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: password, next } })).status, 200);
  assert.equal((await request('/api/orders', { auth: true })).status, 401, 'old session is revoked');
  assert.equal((await request('/api/admin/login', { method: 'POST', body: { username, password } })).status, 401, 'old password no longer works');
  const login = await request('/api/admin/login', { method: 'POST', body: { username, password: next } }); assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/logout', { method: 'POST', auth: true })).status, 200);
  assert.equal((await request('/api/orders', { auth: true })).status, 401);
  let last; for (let i = 0; i < 9; i++) last = await request('/api/admin/login', { method: 'POST', body: { username, password: 'wrong' } });
  assert.equal(last.status, 429);
});
