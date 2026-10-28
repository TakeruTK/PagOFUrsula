import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialPieces, initialSettings } from './seed';
import { settingsSchema, uniqueSlug, type Piece, type Settings } from './pieces';
const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(), 'data'));
export const dataPath = () => dataDir;
const globalStore = globalThis as typeof globalThis & { ursulaDb?: DatabaseSync };

export function database() {
  if (globalStore.ursulaDb) return globalStore.ursulaDb;
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'ursula.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS pieces (id TEXT PRIMARY KEY, content TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, content TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, version TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, type TEXT NOT NULL, bytes BLOB NOT NULL);
    CREATE TABLE IF NOT EXISTS admin_credentials (id INTEGER PRIMARY KEY CHECK (id=1), username TEXT NOT NULL, hash TEXT NOT NULL);
  `);
  // Photos remember when they were uploaded so unused ones can be cleaned up after a day.
  if (!db.prepare('PRAGMA table_info(photos)').all().some(c => c.name === 'created')) db.exec('ALTER TABLE photos ADD COLUMN created INTEGER');
  // Tables of the removed online-payment shop. Databases created by that version still carry them.
  db.exec('DROP TABLE IF EXISTS orders; DROP TABLE IF EXISTS webhook_events;');
  if (!db.prepare('SELECT id FROM settings WHERE id=1').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      for (const piece of initialPieces) db.prepare('INSERT OR IGNORE INTO pieces VALUES (?,?)').run(piece.id, JSON.stringify(piece));
      db.prepare('INSERT OR IGNORE INTO settings VALUES (1,?)').run(JSON.stringify(initialSettings));
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  globalStore.ursulaDb = db;
  backfillSlugs(db);
  return db;
}

// Pieces saved before slugs/translations existed get an address on first start.
function backfillSlugs(db: DatabaseSync) {
  const rows = db.prepare('SELECT id, content FROM pieces').all().map(r => ({ id: r.id as string, piece: JSON.parse(r.content as string) as Piece }));
  const taken = new Set(rows.map(r => r.piece.slug).filter(Boolean));
  for (const { id, piece } of rows) {
    let changed = false;
    if (!piece.slug) { piece.slug = uniqueSlug(piece.name, taken); taken.add(piece.slug); changed = true; }
    // Starter pieces saved before a language existed get that language's starter translation.
    const starter = initialPieces.find(p => p.id === id);
    if (starter) for (const l of ['en', 'pt', 'fr'] as const) {
      if (!piece.translations?.[l]?.name && starter.translations?.[l]) { piece.translations = { ...piece.translations, [l]: starter.translations[l] }; changed = true; }
    }
    if (changed) db.prepare('UPDATE pieces SET content=? WHERE id=?').run(JSON.stringify(piece), id);
  }
}

export function getPieces(admin = false): Piece[] {
  return database().prepare('SELECT content FROM pieces').all().map(r => JSON.parse(r.content as string) as Piece).filter(p => admin || p.status === 'Publicado').sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'));
}
export const getPieceBySlug = (slug: string) => getPieces().find(p => p.slug === slug) || null;

const isPlain = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
function merge<T>(base: T, extra: unknown): T {
  if (!isPlain(base) || !isPlain(extra)) return (extra === undefined ? base : extra) as T;
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(extra)) out[key] = key in base ? merge((base as Record<string, unknown>)[key], extra[key]) : extra[key];
  return out as T;
}
/** Settings saved by older versions are completed with the current defaults. */
export function getSettings(): Settings {
  const stored = JSON.parse(database().prepare('SELECT content FROM settings WHERE id=1').get()!.content as string);
  const parsed = settingsSchema.safeParse(merge(initialSettings, stored));
  return parsed.success ? parsed.data : initialSettings;
}

/** Photos in use by any piece (drafts included) or by the home page. */
function usedPhotoIds(db: DatabaseSync) {
  const used = new Set<string>();
  const collect = (text: string) => { for (const m of text.matchAll(/\/api\/photos\/([a-f0-9-]{36})/g)) used.add(m[1]); };
  for (const row of db.prepare('SELECT content FROM pieces').all()) collect(row.content as string);
  for (const row of db.prepare('SELECT content FROM settings').all()) collect(row.content as string);
  return used;
}
/** Removes uploads nobody uses (removed from a piece, or never saved) once they are more than a day old. */
export function purgeUnusedPhotos() {
  const db = database(), used = usedPhotoIds(db), limit = Date.now() - 24 * 3600000;
  for (const row of db.prepare('SELECT id, created FROM photos').all()) if (!used.has(row.id as string) && (row.created == null || Number(row.created) < limit)) db.prepare('DELETE FROM photos WHERE id=?').run(row.id);
}
export function photoUsage() {
  const row = database().prepare('SELECT count(*) AS n, COALESCE(SUM(length(bytes)), 0) AS bytes FROM photos').get() as { n: number; bytes: number };
  return { count: Number(row.n), bytes: Number(row.bytes) };
}
