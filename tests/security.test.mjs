// Adversarial checks against a real production build with its own empty database: injection, hijacking, uploads,
// header tricks, brute force and data exposure. Nothing here may succeed.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const port = 3031, base = `http://127.0.0.1:${port}`;
const username = 'sec-atelier', password = randomBytes(20).toString('hex'), salt = randomBytes(16).toString('hex');
const hash = `pbkdf2-sha256:100000:${salt}:${pbkdf2Sync(password, salt, 100000, 32, 'sha256').toString('hex')}`;
let server, cookie = '', output = '', dataDir;

const send = (url, { method = 'GET', body, auth = false, origin = base, headers = {}, raw } = {}) => fetch(base + url, {
  method, redirect: 'manual',
  headers: { ...(method !== 'GET' && method !== 'HEAD' ? { Origin: origin } : {}), ...(body && !raw ? { 'Content-Type': 'application/json' } : {}), ...(auth ? { Cookie: cookie } : {}), ...headers },
  body: raw ?? (body ? JSON.stringify(body) : undefined),
});
const ready = async () => { const end = Date.now() + 60000; while (Date.now() < end) { try { if ((await fetch(base + '/es')).ok) return; } catch { /* starting */ } await new Promise(r => setTimeout(r, 300)); } assert.fail(output); };

before(async () => {
  mkdirSync('test-results', { recursive: true });
  dataDir = mkdtempSync(path.resolve('test-results', 'security-'));
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: process.cwd(), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, SITE_URL: 'https://ursulaalcainoorfebreria.com', ALLOW_INDEXING: 'true', ADMIN_USERNAME: username, ADMIN_PASSWORD_HASH: hash, DATA_DIR: dataDir, ANTHROPIC_API_KEY: '', TRANSLATE_URL: 'http://127.0.0.1:9/' },
  });
  server.stdout.on('data', d => output += d); server.stderr.on('data', d => output += d);
  await ready();
});
after(async () => { if (server?.exitCode === null) { server.kill(); await Promise.race([once(server, 'exit'), new Promise(r => setTimeout(r, 3000))]); } });
const login = async () => { const r = await send('/api/admin/login', { method: 'POST', body: { username, password } }); assert.equal(r.status, 200); cookie = r.headers.get('set-cookie').split(';')[0]; return r; };

const piece = (over = {}) => ({ name: 'Pieza segura', category: 'Aros', description: 'Una pieza usada por las pruebas de seguridad.', material: 'Plata 950', size: '', price: 0, status: 'Publicado', availability: 'Disponible', order: 0, featured: false, images: [{ url: '/references/silver.png', caption: 'foto' }], ...over });

test('the session cookie is HttpOnly, Strict and Secure, and every private route refuses strangers', async () => {
  const r = await login();
  const flags = r.headers.get('set-cookie');
  assert.match(flags, /HttpOnly/); assert.match(flags, /SameSite=Strict/); assert.match(flags, /Secure/); assert.match(flags, /Path=\//);
  assert.equal((await send('/api/pieces')).status, 401);
  for (const [method, url] of [['GET', '/api/pieces'], ['POST', '/api/pieces'], ['PUT', '/api/pieces'], ['DELETE', '/api/pieces?id=x'], ['GET', '/api/settings'], ['PUT', '/api/settings'], ['POST', '/api/photos'], ['POST', '/api/admin/translate'], ['GET', '/api/admin/status'], ['POST', '/api/admin/password']]) {
    const stranger = await send(url, { method, body: method === 'GET' ? undefined : {} });
    assert.equal(stranger.status, 401, `${method} ${url} without a session`);
  }
  for (const forged of ['x', 'a'.repeat(64), '0'.repeat(63), "' OR 1=1 --", '../../etc/passwd']) assert.equal((await send('/api/pieces', { headers: { Cookie: `ursula_taller=${forged}` } })).status, 401, `forged cookie ${forged.slice(0, 12)}`);
});

test('writes from another origin or without an origin are refused even with a valid session', async () => {
  await login();
  for (const origin of ['https://evil.example', 'http://127.0.0.1:9999', 'null']) assert.equal((await send('/api/settings', { method: 'PUT', auth: true, origin, body: {} })).status, 403, origin);
  const noOrigin = await fetch(base + '/api/pieces', { method: 'POST', headers: { Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(piece()) });
  assert.equal(noOrigin.status, 403, 'POST without Origin');
  const cors = await send('/api/pieces', { auth: true, headers: { Origin: 'https://evil.example' } });
  assert.equal(cors.headers.get('access-control-allow-origin'), null, 'no CORS grant to other sites');
});

test('text with HTML and script tags is shown as text everywhere, never executed', async () => {
  await login();
  const payload = '<script>window.pwned=1</script><img src=x onerror=alert(1)>';
  const cfg = await (await send('/api/settings', { auth: true })).json();
  const category = { es: 'Cat <b>x</b>', en: '', pt: '', fr: '' };
  assert.equal((await send('/api/settings', { method: 'PUT', auth: true, body: { ...cfg, headline: 'Frase ' + payload, story: 'Historia </script><script>alert(1)</script> ' + payload, categories: [...cfg.categories, category] } })).status, 200);
  const created = await send('/api/pieces', { method: 'POST', auth: true, body: piece({ name: 'Aro ' + payload, description: 'Descripción ' + payload + ' larga', material: payload, category: category.es, images: [{ url: '/references/silver.png', caption: payload }] }) });
  assert.equal(created.status, 200);
  const slug = (await (await send('/api/pieces', { auth: true })).json()).find(p => p.name.startsWith('Aro <')).slug;
  for (const url of ['/es', '/es/coleccion', '/es/sobre-mi', `/es/joyas/${slug}`, `/en/jewelry/${slug}`]) {
    const html = await (await send(url)).text();
    assert.ok(!/<script>window\.pwned/.test(html), `raw script tag in ${url}: ${html.slice(Math.max(0, html.search(/<script>window\.pwned/) - 160), html.search(/<script>window\.pwned/) + 60)}`);
    assert.ok(!/<img src=x onerror/.test(html), `raw img tag in ${url}`);
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { assert.ok(!m[1].includes('</script'), `JSON-LD breaks out in ${url}`); assert.doesNotThrow(() => JSON.parse(m[1])); }
  }
});

test('profile links and numbers only accept what they should', async () => {
  await login();
  const cfg = await (await send('/api/settings', { auth: true })).json();
  const put = patch => send('/api/settings', { method: 'PUT', auth: true, body: { ...cfg, ...patch } });
  for (const bad of [{ instagram: 'javascript:alert(1)' }, { instagram: 'https://evil.example/ursulaalcaino' }, { facebook: 'https://evil.example/x' }, { facebook: 'javascript:alert(1)' }, { tiktok: 'data:text/html,<script>1</script>' }, { contactEmail: 'no-es-un-correo' }, { whatsapp: 'abc' }, { whatsapp: '+56912345678901234567' }]) assert.equal((await put(bad)).status, 400, JSON.stringify(bad));
  assert.equal((await put({ whatsapp: '+56 9 7849 3012', contactEmail: 'contacto@ursulaalcainoorfebreria.com' })).status, 200);
  assert.equal((await (await send('/api/settings', { auth: true })).json()).whatsapp, '+56978493012');
});

test('pieces reject malformed, oversized, foreign and unknown data', async () => {
  await login();
  const post = body => send('/api/pieces', { method: 'POST', auth: true, body });
  for (const bad of [piece({ name: '' }), piece({ name: 'x'.repeat(101) }), piece({ category: 'Inventada' }), piece({ status: 'Otro' }), piece({ price: -1 }), piece({ price: 1.5 }), piece({ images: [] }), piece({ images: Array(9).fill({ url: '/references/silver.png', caption: '' }) }),
    piece({ images: [{ url: 'https://evil.example/a.png', caption: '' }] }), piece({ images: [{ url: '/api/photos/../../.env', caption: '' }] }), piece({ images: [{ url: '/api/photos/00000000-0000-0000-0000-000000000000', caption: '' }] }), piece({ slug: '../etc' }), piece({ slug: 'Mayusculas' }), piece({ description: 'corta' })])
    assert.equal((await post(bad)).status, 400, JSON.stringify(bad).slice(0, 80));
  assert.equal((await send('/api/pieces', { method: 'POST', auth: true, raw: '{no es json' })).status, 400);
  assert.equal((await send('/api/pieces', { method: 'POST', auth: true, raw: JSON.stringify(piece({ description: 'x'.repeat(60000) })) })).status, 400, 'oversized body');
  const polluted = await post(JSON.parse('{"__proto__":{"admin":true},"constructor":{"prototype":{"admin":true}},' + JSON.stringify(piece()).slice(1)));
  assert.equal(polluted.status, 200);
  assert.equal({}.admin, undefined, 'prototype pollution');
  const stored = (await (await send('/api/pieces', { auth: true })).json()).find(p => p.name === 'Pieza segura');
  assert.ok(!('admin' in stored) && !('__proto__' in JSON.parse(JSON.stringify(stored)) && stored.__proto__?.admin), 'unknown keys are not stored');
  assert.equal((await send('/api/pieces?id=' + encodeURIComponent("x' OR '1'='1"), { method: 'DELETE', auth: true })).status, 200, 'SQL in id is only data');
  assert.ok((await (await send('/api/pieces', { auth: true })).json()).some(p => p.name === 'Pieza segura'), 'and deleted nothing');
});

test('uploads accept only real JPG, PNG and WebP and nothing else', async () => {
  await login();
  const upload = (bytes, type, name = 'f') => { const form = new FormData(); form.append('file', new Blob([bytes], { type }), name); return fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form }); };
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), randomBytes(64)]);
  assert.equal((await upload(png, 'image/png')).status, 200);
  assert.equal((await upload(png, 'image/jpeg')).status, 400, 'declared type must match the content');
  assert.equal((await upload(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'), 'image/svg+xml')).status, 400, 'SVG');
  assert.equal((await upload(Buffer.from('<html><script>alert(1)</script></html>'), 'image/png')).status, 400, 'HTML disguised as PNG');
  assert.equal((await upload(Buffer.from('GIF89a' + 'x'.repeat(50)), 'image/gif')).status, 400, 'GIF');
  assert.equal((await upload(Buffer.alloc(0), 'image/png')).status, 400, 'empty file');
  assert.equal((await upload(Buffer.concat([png, Buffer.alloc(7 * 1024 * 1024)]), 'image/png')).status, 413, 'more than 6 MB');
  const form = new FormData(); form.append('other', 'x'); assert.equal((await fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form })).status, 400, 'no file field');
});

test('photos of drafts and unused uploads are private; published ones are cacheable and sniff-proof', async () => {
  await login();
  const form = new FormData(); form.append('file', new Blob([Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), randomBytes(64)])], { type: 'image/png' }), 'a.png');
  const { url } = await (await fetch(base + '/api/photos', { method: 'POST', headers: { Origin: base, Cookie: cookie }, body: form })).json();
  assert.equal((await send(url)).status, 404, 'unattached upload is not public');
  assert.equal((await send(url, { auth: true })).status, 200, 'the owner can see it');
  const draft = await send('/api/pieces', { method: 'POST', auth: true, body: piece({ name: 'Borrador privado', status: 'Borrador', images: [{ url, caption: '' }] }) }); assert.equal(draft.status, 200);
  assert.equal((await send(url)).status, 404, 'draft photo is not public');
  const id = (await draft.json()).id;
  const slug = (await (await send('/api/pieces', { auth: true })).json()).find(p => p.id === id).slug;
  assert.equal((await send(`/es/joyas/${slug}`)).status, 404, 'draft page is not public');
  assert.ok(!(await (await send('/sitemap.xml')).text()).includes(slug), 'draft is not in the sitemap');
  await send('/api/pieces', { method: 'PUT', auth: true, body: { ...piece({ name: 'Borrador privado', images: [{ url, caption: '' }] }), id, slug } });
  const open = await send(url);
  assert.equal(open.status, 200); assert.match(open.headers.get('cache-control'), /immutable/); assert.equal(open.headers.get('x-content-type-options'), 'nosniff'); assert.equal(open.headers.get('content-type'), 'image/png');
  for (const bad of ['/api/photos/..%2f..%2f.env.local', '/api/photos/' + 'A'.repeat(36), '/api/photos/not-a-uuid']) assert.equal((await send(bad)).status, 404, bad);
});

test('login: wrong credentials, odd inputs and brute force', async () => {
  const attempt = (body, extra) => send('/api/admin/login', { method: 'POST', body, ...extra });
  for (const bad of [{ username: 'x' }, { username: 1, password: 2 }, { username, password: 'a'.repeat(300) }, { username: ['a'], password: ['b'] }, null]) assert.ok([400, 401].includes((await attempt(bad)).status), JSON.stringify(bad)?.slice(0, 40));
  assert.equal((await attempt({ username, password: "' OR '1'='1" })).status, 401);
  assert.equal((await attempt({ username: "' OR '1'='1' --", password: 'x' })).status, 401);
  assert.equal((await send('/api/admin/login', { method: 'POST', origin: 'https://evil.example', body: { username, password } })).status, 403, 'login from another site');
  assert.equal((await send('/api/admin/login')).status, 405, 'GET is not a login');
  let blocked = false;
  for (let i = 0; i < 12 && !blocked; i++) blocked = (await attempt({ username, password: 'mala' + i })).status === 429;
  assert.ok(blocked, 'repeated failures are blocked');
  assert.equal((await attempt({ username, password })).status, 429, 'even the right password waits while blocked');
});

test('headers: CSP, framing, sniffing, HSTS and no technology leaks; Host tricks do not change links', async () => {
  const r = await send('/es', { headers: { Host: 'evil.example' } });
  const html = await r.text();
  assert.ok(!html.includes('evil.example'), 'Host header is not reflected into the page');
  assert.ok(html.includes('https://ursulaalcainoorfebreria.com/es'), 'links use the configured site address');
  const h = r.headers;
  assert.match(h.get('content-security-policy'), /default-src 'self'/); assert.match(h.get('content-security-policy'), /frame-ancestors 'none'/); assert.match(h.get('content-security-policy'), /object-src 'none'/);
  assert.equal(h.get('x-frame-options'), 'DENY'); assert.equal(h.get('x-content-type-options'), 'nosniff'); assert.match(h.get('strict-transport-security'), /max-age=\d+/);
  assert.equal(h.get('x-powered-by'), null); assert.match(h.get('referrer-policy'), /strict-origin/); assert.match(h.get('permissions-policy'), /camera=\(\)/);
  for (const url of ['/admin', '/api/pieces']) assert.equal((await send(url)).headers.get('x-robots-tag'), 'noindex, nofollow', url);
  const admin = await send('/admin'); assert.match(admin.headers.get('cache-control') || '', /no-store|private|no-cache/);
});

test('paths: no file exposure, no open redirects, no image proxy, no stack traces', async () => {
  for (const p of ['/.env', '/.env.local', '/.git/config', '/package.json', '/data/ursula.sqlite', '/ursula.sqlite', '/next.config.ts', '/proxy.ts', '/lib/store.ts', '/tests/shop.test.mjs', '/_next/../.env', '/%2e%2e/.env', '/es/%2e%2e/%2e%2e/.env', '/scripts/setup-admin.mjs', '/node_modules/next/package.json'])
    { const r = await send(p); assert.ok([400, 404].includes(r.status) || (r.status === 307 && (await send(new URL(r.headers.get('location'), base).pathname)).status === 404), `${p} → ${r.status} ${r.headers.get('location') || ''}`); }
  for (const p of ['//evil.example', '/%2F%2Fevil.example', '/\\evil.example', '/es//evil.example', '/es/%0d%0aSet-Cookie:x=1']) {
    const r = await send(p); const loc = r.headers.get('location') || '';
    assert.ok(![/^https?:\/\/evil/i, /^\/\/evil/].some(re => re.test(loc)), `open redirect via ${p}: ${loc}`); assert.ok(r.status < 500, `${p} → ${r.status}`);
  }
  assert.ok((await send('/_next/image?url=http%3A%2F%2Fevil.example%2Fa.png&w=64&q=75')).status >= 400, 'image proxy');
  assert.ok((await send('/_next/image?url=%2Fapi%2Fadmin%2Fstatus&w=64&q=75')).status >= 400, 'image proxy to private API');
  for (const p of ['/es/joyas/%00', '/es/joyas/..%2f..%2fx', '/xx', '/es/s/nope', '/api/nope', '/es/legal/otra']) { const r = await send(p); const t = await r.text(); assert.ok(r.status === 404 || r.status === 307 || r.status === 308 || r.status === 400, `${p} → ${r.status}`); assert.ok(!/at .*node_modules|Error:.*\n\s+at /.test(t), `stack trace on ${p}`); }
  assert.equal((await send('/api/pieces', { method: 'TRACE' }).catch(() => ({ status: 405 }))).status >= 400, true);
});

test('logout and password change revoke sessions; a stolen cookie stops working', async () => {
  // The brute-force test used up the login budget on purpose; release it as the 15 minutes passing would.
  const db = new DatabaseSync(path.join(dataDir, 'ursula.sqlite')); db.exec('DELETE FROM attempts'); db.close();
  await login();
  const stolen = cookie;
  assert.equal((await send('/api/pieces', { auth: true })).status, 200);
  assert.equal((await send('/api/admin/logout', { method: 'POST', auth: true })).status, 200);
  cookie = stolen;
  assert.equal((await send('/api/pieces', { auth: true })).status, 401, 'cookie is dead after logout');
  await login();
  const changed = await send('/api/admin/password', { method: 'POST', auth: true, body: { current: password, next: 'una-clave-nueva-muy-larga-1' } });
  assert.equal(changed.status, 200);
  assert.equal((await send('/api/pieces', { auth: true })).status, 401, 'password change revokes the session');
  assert.equal((await send('/api/admin/login', { method: 'POST', body: { username, password } })).status, 401, 'old password no longer works');
  assert.equal((await send('/api/admin/login', { method: 'POST', body: { username, password: 'una-clave-nueva-muy-larga-1' } })).status, 200, 'new password works');
});

test('the public site survives a burst of traffic without errors', async () => {
  const started = Date.now();
  const urls = ['/es', '/en/collection', '/pt/colecao', '/fr/a-propos', '/es/terminos', '/sitemap.xml', '/robots.txt', '/es/contacto'];
  const results = await Promise.all(Array.from({ length: 160 }, (_, i) => send(urls[i % urls.length]).then(async r => { await r.text(); return r.status; })));
  assert.ok(results.every(s => s === 200), `statuses: ${[...new Set(results)]}`);
  assert.ok(Date.now() - started < 15000, `took ${Date.now() - started} ms`);
});
