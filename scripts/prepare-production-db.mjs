// Makes a clean copy of the workshop database to upload to the production server: pieces, texts and photos stay;
// sessions, login attempts, saved passwords and unpublished drafts do not.
// Usage: node scripts/prepare-production-db.mjs [output-folder]   (default: data/production)
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const source = path.resolve(process.env.DATA_DIR || 'data', 'ursula.sqlite');
const folder = path.resolve(process.argv[2] || path.join('data', 'production'));
const target = path.join(folder, 'ursula.sqlite');
if (!existsSync(source)) { console.error('No encuentro la base de datos en ' + source); process.exit(1); }
mkdirSync(folder, { recursive: true });
rmSync(target, { force: true });

const origin = new DatabaseSync(source, { readOnly: true });
origin.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
origin.close();

const db = new DatabaseSync(target);
db.exec('DELETE FROM sessions; DELETE FROM attempts; DELETE FROM admin_credentials;');
let removed = 0;
for (const row of db.prepare('SELECT id, content FROM pieces').all()) {
  if (JSON.parse(row.content).status !== 'Publicado') { db.prepare('DELETE FROM pieces WHERE id=?').run(row.id); removed++; }
}
// Photos nobody uses any more (removed from a piece or from the home page) stay out of the copy.
const used = new Set();
const collect = text => { for (const m of text.matchAll(/\/api\/photos\/([a-f0-9-]{36})/g)) used.add(m[1]); };
for (const row of db.prepare('SELECT content FROM pieces').all()) collect(row.content);
for (const row of db.prepare('SELECT content FROM settings').all()) collect(row.content);
let photos = 0;
for (const row of db.prepare('SELECT id FROM photos').all()) if (!used.has(row.id)) { db.prepare('DELETE FROM photos WHERE id=?').run(row.id); photos++; }
db.exec('VACUUM');
const left = db.prepare('SELECT count(*) c FROM pieces').get().c;
db.close();
console.log(`Listo: ${target}\n  piezas publicadas: ${left} · borradores descartados: ${removed} · fotos sin uso descartadas: ${photos}`);
console.log('Súbela a la carpeta de datos del servidor (DATA_DIR) y crea el acceso con: pnpm admin:setup');
