import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';

const base = 'http://127.0.0.1:3013', live = 'http://127.0.0.1:3015';
const username = 'test-atelier', password = randomBytes(20).toString('hex'), salt = randomBytes(16).toString('hex');
const hash = `pbkdf2-sha256:100000:${salt}:${pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')}`;
let server, indexed, legacy, cookie = '', pieces, output = '', draftId, photoUrl, settings;

const request = (url, { method = 'GET', body, auth = false, origin = base, headers = {}, ...rest } = {}) => fetch(base + url, { method, headers: { ...(method !== 'GET' ? { Origin: origin } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Cookie: cookie } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined, redirect: 'manual', ...rest });
const saveSettings = patch => request('/api/settings', { method: 'PUT', auth: true, body: { ...settings, ...patch } });

function launch(port, env, dataDir = mkdtempSync(path.resolve('test-results', 'database-'))) {
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
  server = launch(3013, { SITE_URL: base });
  indexed = launch(3015, { SITE_URL: 'https://shop.example.com', ALLOW_INDEXING: 'true' });
  await ready(base + '/es'); await ready(live + '/es');
  // The data endpoints are private: the suite signs in once to read the starting catalog and settings.
  const login = await request('/api/admin/login', { method: 'POST', body: { username, password } }); cookie = login.headers.get('set-cookie').split(';')[0];
  pieces = await (await request('/api/pieces', { auth: true })).json();
  settings = await (await request('/api/settings', { auth: true })).json();
});
after(async () => {
  for (const child of [server, indexed, legacy]) if (child && child.exitCode === null) { child.kill(); await Promise.race([once(child, 'exit'), new Promise(r => setTimeout(r, 3000))]); }
});

// ---- No payment gateway ---------------------------------------------------------------------------------------
test('there is no checkout, payment or order surface any more', async () => {
  for (const p of ['/api/checkout', '/api/orders', '/api/webhooks/mercadopago', '/api/webhooks/paypal', '/api/checkout/demo']) {
    const r = await request(p, { method: 'POST', body: {} }); assert.equal(r.status, 404, p);
  }
  const html = await (await request('/es')).text();
  assert.doesNotMatch(html, /Mercado Pago|PayPal|Agregar a la bolsa|Bolsa/i);
});

// ---- Security of private endpoints ---------------------------------------------------------------------------
test('private endpoints and cross-origin writes are protected', async () => {
  assert.equal((await request('/api/pieces')).status, 401);
  assert.equal((await request('/api/settings')).status, 401);
  assert.equal((await request('/api/admin/status')).status, 401);
  assert.equal((await request('/api/pieces', { method: 'POST', body: pieces[0] })).status, 401);
  assert.equal((await request('/api/admin/login', { method: 'POST', body: { username, password: 'wrong' } })).status, 401);
  assert.equal((await request('/admin')).headers.get('x-robots-tag'), 'noindex, nofollow');
});
test('admin session uses HTTP-only cookie and supports authenticated edits', async () => {
  const r = await request('/api/admin/login', { method: 'POST', body: { username, password } }); assert.equal(r.status, 200);
  const header = r.headers.get('set-cookie'); assert.match(header, /HttpOnly/); assert.match(header, /SameSite=Strict/); cookie = header.split(';')[0];
  assert.equal((await request('/api/pieces', { auth: true })).status, 200);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, origin: 'https://untrusted.example', body: {} })).status, 403);
  const status = await (await request('/api/admin/status', { auth: true })).json();
  assert.ok(status.checks.some(c => c.id === 'whatsapp' && !c.ok), 'launch checklist reports the missing WhatsApp number');
});

// ---- Catalog ---------------------------------------------------------------------------------------------------
test('photo upload, private draft, publish, edit, slug and delete persist on server', async () => {
  const form = new FormData(); form.append('file', new Blob([readFileSync('public/references/ursula.png')], { type: 'image/png' }), 'piece.png');
  const upload = await fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form }); assert.equal(upload.status, 200); photoUrl = (await upload.json()).url;
  assert.equal((await request(photoUrl)).status, 404);
  const draft = { ...pieces[0], id: undefined, slug: undefined, name: 'Pieza de prueba privada', status: 'Borrador', images: [{ url: photoUrl, caption: 'Prueba' }] };
  const created = await request('/api/pieces', { method: 'POST', auth: true, body: draft }); assert.equal(created.status, 200); draftId = (await created.json()).id;
  assert.ok(!(await (await request('/es/coleccion')).text()).includes('Pieza de prueba privada'), 'drafts are not listed publicly');
  assert.equal((await request('/es/joyas/pieza-de-prueba-privada')).status, 404, 'drafts have no public page');
  assert.equal((await request(photoUrl, { auth: true })).status, 200);
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...draft, id: draftId, slug: pieces[0].slug, status: 'Publicado' } })).status, 400, 'duplicate slug is refused');
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...draft, id: draftId, status: 'Publicado', price: 55000, order: 99 } })).status, 200);
  const photo = await request(photoUrl); assert.equal(photo.status, 200); assert.match(photo.headers.get('cache-control'), /immutable/);
  const visible = (await (await request('/api/pieces', { auth: true })).json()).find(p => p.id === draftId); assert.equal(visible.price, 55000); assert.equal(visible.slug, 'pieza-de-prueba-privada');
  assert.equal((await request('/es/joyas/pieza-de-prueba-privada')).status, 200);
  assert.equal((await request('/api/pieces', { method: 'POST', auth: true, body: { ...draft, id: undefined, slug: undefined, name: 'Sin valor', price: 0, status: 'Borrador' } })).status, 200, 'price is optional');
});
test('settings persist, are completed with defaults and reject invalid contact data', async () => {
  assert.ok(settings.en.headline && settings.policies.es.terms && settings.showPrices === false, 'defaults are present');
  assert.equal((await saveSettings({ headline: 'Una portada de prueba.' })).status, 200);
  assert.equal((await (await request('/api/settings', { auth: true })).json()).headline, 'Una portada de prueba.');
  assert.equal((await saveSettings({ instagram: 'https://untrusted.example' })).status, 400);
  assert.equal((await saveSettings({ whatsapp: 'no-es-un-numero' })).status, 400);
  assert.equal((await saveSettings({ contactEmail: 'sin-arroba' })).status, 400);
  assert.equal((await saveSettings({ facebook: 'https://untrusted.example/ursula' })).status, 400);
  assert.equal((await saveSettings({ tiktok: 'https://www.tiktok.com/ursula' })).status, 400, 'TikTok profiles start with @');
});

// ---- Selling by conversation -------------------------------------------------------------------------------------
test('without a WhatsApp number every piece falls back to Instagram; with one it opens a ready message', async () => {
  const piece = pieces[0];
  let html = await (await request(`/es/joyas/${piece.slug}`)).text();
  assert.doesNotMatch(html, /wa\.me/); assert.match(html, /instagram\.com\/ursulaalcaino/);
  assert.doesNotMatch(html, /aria-label="WhatsApp"/, 'no WhatsApp icon in the footer without a number');
  assert.equal((await saveSettings({ whatsapp: '+56 9 1234 5678', contactEmail: 'ursula@example.com' })).status, 200);
  html = await (await request(`/es/joyas/${piece.slug}`)).text();
  const link = html.match(/href="(https:\/\/wa\.me\/[^"]+)"/)[1].replace(/&amp;/g, '&'); const url = new URL(link);
  assert.equal(url.pathname, '/56912345678'); const msg = decodeURIComponent(url.searchParams.get('text'));
  assert.match(msg, new RegExp(piece.name)); assert.match(msg, new RegExp(`/es/joyas/${piece.slug}`));
  assert.match(html, /mailto:ursula@example\.com\?subject=/);
  assert.match(html, /<footer[\s\S]*href="https:\/\/wa\.me\/56912345678[^"]*"[^>]*aria-label="WhatsApp"/, 'WhatsApp icon in the footer of every page');
  assert.match(html, /<footer[\s\S]*href="mailto:ursula@example\.com"[^>]*aria-label="Correo electrónico"/, 'email icon in the footer');
  assert.doesNotMatch(html, /wa-float/, 'the floating button is gone');
  assert.match(await (await request('/en')).text(), /LET.S TALK ON WHATSAPP/);
  assert.match(await (await request('/es/contacto')).text(), /wa\.me\/56912345678/);
});
test('prices stay hidden unless the owner turns them on, in the page and in structured data', async () => {
  const piece = pieces[0];
  let html = await (await request(`/es/joyas/${piece.slug}`)).text();
  assert.doesNotMatch(html, /\$\s?38\.900/); assert.doesNotMatch(html, /"offers"/);
  assert.equal((await saveSettings({ whatsapp: '+56912345678', contactEmail: 'ursula@example.com', showPrices: true })).status, 200);
  html = await (await request(`/es/joyas/${piece.slug}`)).text();
  assert.match(html, /\$38\.900/); assert.match(html, /"priceCurrency":"CLP"/); assert.match(html, /"price":"38900"/);
  const grid = await (await request('/es/coleccion')).text(); assert.match(grid, /Valor referencial/);
  assert.equal((await saveSettings({ whatsapp: '+56912345678', contactEmail: 'ursula@example.com', showPrices: false })).status, 200);
});

test('Facebook and TikTok profiles are optional and appear on the contact page, home and footer when saved', async () => {
  assert.doesNotMatch(await (await request('/es/contacto')).text(), /facebook\.com|tiktok\.com/);
  assert.equal((await saveSettings({ whatsapp: '+56912345678', facebook: 'https://www.facebook.com/ursula.alcaino', tiktok: 'https://www.tiktok.com/@ursulaalcaino' })).status, 200);
  const contact = await (await request('/es/contacto')).text();
  assert.match(contact, /href="https:\/\/www\.facebook\.com\/ursula\.alcaino"/); assert.match(contact, /href="https:\/\/www\.tiktok\.com\/@ursulaalcaino"/); assert.match(contact, />@ursulaalcaino</);
  const home = await (await request('/en')).text();
  assert.match(home, />FACEBOOK</); assert.match(home, />TIKTOK</); assert.match(home, /"sameAs":\["https:\/\/www\.instagram\.com\/ursulaalcaino\/","https:\/\/www\.facebook\.com\/ursula\.alcaino","https:\/\/www\.tiktok\.com\/@ursulaalcaino"\]/);
  assert.match(home, /<footer[\s\S]*Facebook[\s\S]*TikTok/);
  assert.equal((await saveSettings({ whatsapp: '+56912345678', contactEmail: 'ursula@example.com', facebook: '', tiktok: '' })).status, 200);
  assert.doesNotMatch(await (await request('/es/contacto')).text(), /facebook\.com|tiktok\.com/);
});

test('a piece can carry its size, in both languages, and the page shows it only when written', async () => {
  const base0 = { ...pieces[0], id: undefined, slug: undefined, name: 'Aros con medidas', status: 'Publicado', price: 0 };
  const plain = await request('/api/pieces', { method: 'POST', auth: true, body: base0 }); assert.equal(plain.status, 200);
  const id = (await plain.json()).id;
  let html = await (await request('/es/joyas/aros-con-medidas')).text();
  assert.doesNotMatch(html, /<dt>Tamaño<\/dt>/, 'no size row until one is written');
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...base0, id, size: '2,5 cm de diámetro', translations: { en: { name: 'Earrings with sizes', description: 'Earrings with a written size.', material: '', size: '2.5 cm diameter', caption: '' } } } })).status, 200);
  html = await (await request('/es/joyas/aros-con-medidas')).text();
  assert.match(html, /<dt>Tamaño<\/dt><dd>2,5 cm de diámetro<\/dd>/); assert.match(html, /"size":"2,5 cm de diámetro"/);
  assert.match(await (await request('/en/jewelry/aros-con-medidas')).text(), /<dt>Size<\/dt><dd>2\.5 cm diameter<\/dd>/);
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...base0, id, size: 'x'.repeat(151) } })).status, 400, 'size is limited to 150 characters');
  assert.equal((await request(`/api/pieces?id=${id}`, { method: 'DELETE', auth: true })).status, 200);
});

// ---- International SEO -----------------------------------------------------------------------------------------------
test('language negotiation and localized pages with hreflang, canonical and structured data', async () => {
  const en = await request('/', { headers: { 'Accept-Language': 'en-US,en;q=0.9' } }); assert.equal(en.status, 307); assert.match(en.headers.get('location'), /\/en$/);
  assert.match((await request('/', { headers: { 'Accept-Language': 'es-CL,es;q=0.9' } })).headers.get('location'), /\/es$/);
  assert.match((await request('/', { headers: { 'Accept-Language': 'ja' } })).headers.get('location'), /\/en$/);
  assert.match((await request('/', { headers: { 'Accept-Language': 'ja', Cookie: 'NEXT_LOCALE=es' } })).headers.get('location'), /\/es$/);
  const home = await (await request('/en')).text();
  assert.match(home, /<html lang="en"/); assert.match(home, /rel="canonical" href="http:\/\/127\.0\.0\.1:3013\/en"/); assert.match(home, /hrefLang="es" href="http:\/\/127\.0\.0\.1:3013\/es"/); assert.match(home, /hrefLang="x-default"/); assert.match(home, /"@type":"Organization"/);
  assert.match(home, /<h1 class="hero-logo"><img src="\/brand\/logo-light\.png" alt="Ursula Alcaino · Orfebrería"/); assert.match(home, /href="\/en\/collection"/); assert.match(home, /href="\/en\/about"/); assert.match(home, /href="\/en\/contact"/);
  const piece = await request(`/en/jewelry/${pieces[0].slug}`); const html = await piece.text();
  assert.equal(piece.status, 200); assert.match(html, /"@type":"Product"/); assert.match(html, /<h1>Sendero earrings<\/h1>/);
  assert.match(html, new RegExp(`hrefLang="es" href="http://127.0.0.1:3013/es/joyas/${pieces[0].slug}"`)); assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /og:image" content="http:\/\/127\.0\.0\.1:3013\/en\/opengraph-image/);
  assert.match(await (await request(`/es/joyas/${pieces[0].slug}`)).text(), /<html lang="es"/);
  assert.equal((await request('/es/joyas/no-existe')).status, 404); assert.equal((await request('/de')).status, 307);
  for (const p of ['/es/terminos', '/es/privacidad', '/en/terms', '/en/privacy']) assert.equal((await request(p)).status, 200, p);
  assert.equal((await request('/es/envios-y-devoluciones')).status, 404);
});
test('review environments stay out of search engines; the approved site is indexable with a complete sitemap', async () => {
  assert.equal((await request('/es')).headers.get('x-robots-tag'), 'noindex, nofollow'); assert.match(await (await request('/es')).text(), /name="robots" content="noindex, nofollow"/);
  assert.match(await (await request('/robots.txt')).text(), /Disallow: \//); assert.doesNotMatch(await (await request('/robots.txt')).text(), /Sitemap:/);
  const home = await fetch(live + '/en'); assert.equal(home.headers.get('x-robots-tag'), null); const html = await home.text();
  assert.match(html, /name="robots" content="index, follow/); assert.match(html, /rel="canonical" href="https:\/\/shop\.example\.com\/en"/);
  const robots = await (await fetch(live + '/robots.txt')).text(); assert.match(robots, /Sitemap: https:\/\/shop\.example\.com\/sitemap\.xml/); assert.match(robots, /Disallow: \/admin/);
  const map = await (await fetch(live + '/sitemap.xml')).text(); assert.match(map, /hreflang="en" href="https:\/\/shop\.example\.com\/en\/jewelry\/aros-sendero"/); assert.match(map, /shop\.example\.com\/es\/privacidad/);
  assert.equal((await fetch(live + '/admin')).headers.get('x-robots-tag'), 'noindex, nofollow');
  assert.equal((await fetch(live + '/api/pieces')).headers.get('x-robots-tag'), 'noindex, nofollow');
});

// ---- Multi-page corporate structure -------------------------------------------------------------------------------
test('the site is multi-page: collection, about and contact each have their own localized address, metadata and links', async () => {
  const pages = [['es', 'coleccion', 'en', 'collection'], ['es', 'sobre-mi', 'en', 'about'], ['es', 'contacto', 'en', 'contact']];
  for (const [, esSlug, , enSlug] of pages) {
    const es = await request(`/es/${esSlug}`), en = await request(`/en/${enSlug}`);
    assert.equal(es.status, 200, esSlug); assert.equal(en.status, 200, enSlug);
    const html = await es.text();
    assert.match(html, new RegExp(`rel="canonical" href="http://127\.0\.0\.1:3013/es/${esSlug}"`));
    assert.match(html, new RegExp(`hrefLang="en" href="http://127\.0\.0\.1:3013/en/${enSlug}"`));
    assert.match(html, /<h1>/); assert.match(html, /aria-current="page"/, 'the navigation marks the current page');
  }
  assert.match(await (await request('/es/coleccion')).text(), /"@type":"CollectionPage"/);
  assert.match(await (await request('/en/about')).text(), /"@type":"AboutPage"/);
  assert.match(await (await request('/en/contact')).text(), /"@type":"ContactPage"/);
  assert.equal((await request('/es/s/about')).status, 200, 'internal route is reachable but canonical points to the clean address');
  const map = await (await request('/sitemap.xml')).text();
  for (const p of ['/es/coleccion', '/en/collection', '/es/sobre-mi', '/en/about', '/es/contacto', '/en/contact']) assert.match(map, new RegExp(`<loc>http://127\.0\.0\.1:3013${p}</loc>`), p);
  const robots = await (await fetch(live + '/sitemap.xml')).text(); assert.match(robots, /shop\.example\.com\/en\/contact/);
});

// ---- Home images chosen from the workshop -------------------------------------------------------------------------
test('the owner can choose the home photos: they become public only when used, and fall back when removed', async () => {
  const send = async name => { const form = new FormData(); form.append('file', new Blob([readFileSync('public/references/ursula.png')], { type: 'image/png' }), name); return (await (await fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form })).json()).url; };
  const heroUrl = await send('hero.png'), aboutUrl = await send('about.png');
  assert.equal((await request(heroUrl)).status, 404, 'an uploaded photo is private until the page uses it');
  const current = await (await request('/api/settings', { auth: true })).json();
  const images = { hero: [{ url: heroUrl, caption: 'Foto de portada' }], about: { url: aboutUrl, caption: 'Taller de Ursula' } };
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...current, images: { hero: [], about: { url: '/api/photos/00000000-0000-4000-8000-000000000000', caption: '' } } } })).status, 400, 'a photo that does not exist is refused');
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...current, images: { hero: Array(9).fill({ url: heroUrl, caption: '' }), about: null } } })).status, 400, 'at most 8 floating photos');
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, origin: 'https://untrusted.example', body: { ...current, images } })).status, 403);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...current, images } })).status, 200);
  assert.equal((await request(heroUrl)).status, 200); assert.equal((await request(aboutUrl)).status, 200);
  const about = await (await request('/es/sobre-mi')).text(); assert.ok(about.includes(aboutUrl)); assert.match(about, /alt="Taller de Ursula"/);
  assert.equal((await request('/api/settings', { method: 'PUT', auth: true, body: { ...current, images: { hero: [], about: null } } })).status, 200);
  assert.equal((await request(aboutUrl)).status, 404, 'removed from the page, the photo is private again');
  assert.ok(!(await (await request('/es/sobre-mi')).text()).includes(aboutUrl));
});

// ---- Databases created by the old payment shop ---------------------------------------------------------------------
test('starting on a database from the payment version drops its orders tables and keeps the catalog', async () => {
  const dir = mkdtempSync(path.resolve('test-results', 'legacy-'));
  const old = new DatabaseSync(path.join(dir, 'ursula.sqlite'));
  old.exec("CREATE TABLE orders (id TEXT PRIMARY KEY, request_key TEXT, content TEXT, created TEXT); CREATE TABLE webhook_events (id TEXT PRIMARY KEY, received TEXT); INSERT INTO orders VALUES ('1','k','{}','now');");
  old.close();
  legacy = launch(3016, { SITE_URL: 'http://127.0.0.1:3016' }, dir);
  await ready('http://127.0.0.1:3016/es');
  const db = new DatabaseSync(path.join(dir, 'ursula.sqlite'), { readOnly: true });
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
  assert.ok(!tables.includes('orders') && !tables.includes('webhook_events'), tables.join());
  assert.ok(tables.includes('pieces') && tables.includes('settings') && tables.includes('photos'));
  assert.equal(db.prepare('SELECT count(*) c FROM pieces').get().c, 8, 'the starter catalog is created as usual');
  db.close();
});

// ---- Four languages: Spanish, English, Portuguese and French ----------------------------------------------------------
const LANGS = { es: { home: '/es', pages: ['coleccion', 'sobre-mi', 'contacto', 'terminos', 'privacidad'], piece: 'joyas' }, en: { home: '/en', pages: ['collection', 'about', 'contact', 'terms', 'privacy'], piece: 'jewelry' }, pt: { home: '/pt', pages: ['colecao', 'sobre', 'contato', 'termos', 'privacidade'], piece: 'joias' }, fr: { home: '/fr', pages: ['collection', 'a-propos', 'contact', 'conditions', 'confidentialite'], piece: 'bijoux' } };
test('Portuguese and French are negotiated, routed and fully served like Spanish and English', async () => {
  const to = async (accept, cookie) => (await request('/', { headers: { 'Accept-Language': accept, ...(cookie ? { Cookie: cookie } : {}) } })).headers.get('location');
  assert.match(await to('pt-BR,pt;q=0.9,en;q=0.5'), /\/pt$/); assert.match(await to('pt-PT'), /\/pt$/);
  assert.match(await to('fr-CH,fr;q=0.9'), /\/fr$/); assert.match(await to('es-MX,es;q=0.9'), /\/es$/);
  assert.match(await to('de-DE,de;q=0.9'), /\/en$/, 'languages we do not translate fall back to English');
  assert.match(await to('en-GB', 'NEXT_LOCALE=fr'), /\/fr$/, 'the visitor\'s own choice wins');
  for (const [lang, def] of Object.entries(LANGS)) {
    const home = await request(def.home); const html = await home.text();
    assert.equal(home.status, 200, lang); assert.match(html, new RegExp(`<html lang="${lang}"`));
    for (const l of Object.keys(LANGS)) assert.match(html, new RegExp(`hrefLang="${l}" href="http://127\\.0\\.0\\.1:3013/${l}"`), `${lang} home links ${l}`);
    assert.match(html, /hrefLang="x-default"/); assert.match(html, new RegExp(`rel="canonical" href="http://127\\.0\\.0\\.1:3013/${lang}"`));
    assert.match(html, /<h1 class="hero-logo">/); assert.match(html, /"inLanguage":\["es","en","pt","fr"\]/);
    for (const page of def.pages) { const r = await request(`/${lang}/${page}`); assert.equal(r.status, 200, `/${lang}/${page}`); assert.match(await r.text(), new RegExp(`<html lang="${lang}"`)); }
    const piece = await request(`/${lang}/${def.piece}/${pieces[0].slug}`); assert.equal(piece.status, 200, `piece in ${lang}`);
    const body = await piece.text(); assert.match(body, /"@type":"Product"/); assert.doesNotMatch(body, /name="robots" content="noindex, follow"/, `${lang} piece is indexable once written in that language`);
  }
  assert.match(await (await request(`/pt/joias/${pieces[0].slug}`)).text(), /<h1>Brincos Sendero<\/h1>/);
  assert.match(await (await request(`/fr/bijoux/${pieces[0].slug}`)).text(), /<h1>Boucles d’oreilles Sendero<\/h1>/);
  assert.match(await (await request('/fr/conditions')).text(), /Conditions des demandes et des achats/); assert.match(await (await request('/pt/privacidade')).text(), /Política de privacidade/);
  const switcher = await (await request('/pt/colecao')).text();
  for (const target of ['/es/coleccion', '/en/collection', '/fr/collection']) assert.ok(switcher.includes(`href="${target}"`), `the language switcher goes to ${target}`);
  assert.ok((await (await request(`/fr/bijoux/${pieces[0].slug}`)).text()).includes(`href="/en/jewelry/${pieces[0].slug}"`), 'pieces keep their address across languages');
});
test('a piece without a translation is kept out of that language for search engines and visitors', async () => {
  const bare = { ...pieces[0], id: undefined, slug: undefined, name: 'Solo en español', description: 'Una pieza que aún no tiene traducciones escritas.', status: 'Publicado', translations: undefined };
  const created = await request('/api/pieces', { method: 'POST', auth: true, body: bare }); assert.equal(created.status, 200); const id = (await created.json()).id;
  const en = await request('/en/jewelry/solo-en-espanol'); assert.equal(en.status, 200); const html = await en.text();
  assert.match(html, /name="robots" content="noindex, follow"/, 'an English page that would repeat the Spanish text is not indexed');
  assert.doesNotMatch(html, /<link rel="alternate" hrefLang="en"/); assert.match(html, /hrefLang="es" href="[^"]*\/es\/joyas\/solo-en-espanol"/);
  assert.doesNotMatch(await (await request('/en/collection')).text(), /Solo en español/, 'and it is not listed in the English collection');
  assert.match(await (await request('/es/coleccion')).text(), /Solo en español/);
  const map = await (await request('/sitemap.xml')).text();
  assert.ok(map.includes('/es/joyas/solo-en-espanol') && !map.includes('/en/jewelry/solo-en-espanol') && !map.includes('/fr/bijoux/solo-en-espanol'), 'the sitemap lists only the languages that exist');
  const status = await (await request('/api/admin/status', { auth: true })).json();
  assert.ok(status.checks.some(c => c.id === 'translations' && !c.ok && /Français/.test(c.hint)), 'the panel tells the owner what is missing');
  assert.equal((await request('/api/pieces', { method: 'PUT', auth: true, body: { ...bare, id, translations: { fr: { name: 'Seulement en espagnol', description: 'Une pièce écrite uniquement en français.', material: '', size: '', caption: '' } } } })).status, 200);
  assert.doesNotMatch(await (await request('/fr/bijoux/solo-en-espanol')).text(), /name="robots" content="noindex, follow"/, 'writing the French text makes the French page indexable');
  assert.ok((await (await request('/sitemap.xml')).text()).includes('/fr/bijoux/solo-en-espanol'));
  assert.equal((await request(`/api/pieces?id=${id}`, { method: 'DELETE', auth: true })).status, 200);
});

// ---- Account ----------------------------------------------------------------------------------------------------------
test('password change revokes sessions; logout revokes a captured session; login rate limit is enforced', async () => {
  const next = randomBytes(12).toString('hex');
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: 'wrong-password', next } })).status, 400);
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: password, next: 'short' } })).status, 400);
  assert.equal((await request('/api/admin/password', { method: 'POST', auth: true, body: { current: password, next } })).status, 200);
  assert.equal((await request('/api/pieces', { auth: true })).status, 401, 'old session is revoked');
  assert.equal((await request('/api/admin/login', { method: 'POST', body: { username, password } })).status, 401, 'old password no longer works');
  const login = await request('/api/admin/login', { method: 'POST', body: { username, password: next } }); assert.equal(login.status, 200); cookie = login.headers.get('set-cookie').split(';')[0];
  assert.equal((await request('/api/admin/logout', { method: 'POST', auth: true })).status, 200);
  assert.equal((await request('/api/pieces', { auth: true })).status, 401);
  let last; for (let i = 0; i < 9; i++) last = await request('/api/admin/login', { method: 'POST', body: { username, password: 'wrong' } });
  assert.equal(last.status, 429);
});
