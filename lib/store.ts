import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialPieces, initialSettings } from './seed';
import type { Piece, Settings } from './pieces';
export const dataDir = path.resolve(process.env.DATA_DIR || path.join(process.cwd(),'data'));
const globalStore = globalThis as typeof globalThis & {ursulaDb?: DatabaseSync};
export function database() {
  if (globalStore.ursulaDb) return globalStore.ursulaDb;
  mkdirSync(dataDir,{recursive:true});
  const db = new DatabaseSync(path.join(dataDir,'ursula.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS pieces (id TEXT PRIMARY KEY, content TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, content TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, expires INTEGER NOT NULL, version TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, request_key TEXT UNIQUE NOT NULL, content TEXT NOT NULL, created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS photos (id TEXT PRIMARY KEY, type TEXT NOT NULL, bytes BLOB NOT NULL);
  `);
  if(!db.prepare('SELECT id FROM settings WHERE id=1').get()) {
    db.exec('BEGIN IMMEDIATE');
    try {
      for(const piece of initialPieces) db.prepare('INSERT OR IGNORE INTO pieces VALUES (?,?)').run(piece.id,JSON.stringify(piece));
      db.prepare('INSERT OR IGNORE INTO settings VALUES (1,?)').run(JSON.stringify(initialSettings));
      db.exec('COMMIT');
    } catch(e) {db.exec('ROLLBACK');throw e;}
  }
  globalStore.ursulaDb=db;
  return db;
}
export function getPieces(admin=false):Piece[] {
  return database().prepare('SELECT content FROM pieces').all().map(r=>JSON.parse(r.content as string) as Piece).filter(p=>admin||p.status==='Publicado').sort((a,b)=>a.order-b.order||a.name.localeCompare(b.name,'es'));
}
export function getSettings():Settings { return JSON.parse(database().prepare('SELECT content FROM settings WHERE id=1').get()!.content as string); }
export type DemoOrder = {id:string;created:string;mode:'demo';status:'approved'|'pending'|'rejected';customer:{name:string;email:string};items:{id:string;name:string;price:number;quantity:number}[];total:number;delivery:'coordinar';fingerprint:string};
export function getOrders():DemoOrder[] {return database().prepare('SELECT content FROM orders ORDER BY created DESC LIMIT 200').all().map(r=>JSON.parse(r.content as string));}
