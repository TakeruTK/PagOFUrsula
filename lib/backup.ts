import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { dataPath, database } from './store';

const KEEP_DAYS = 7;

/** One copy of the database per day (the last 7 are kept), made the first time the owner saves something that day. */
export function backupIfDue() {
  try {
    const folder = path.join(dataPath(), 'backups');
    const file = path.join(folder, `ursula-${new Date().toISOString().slice(0, 10)}.sqlite`);
    if (existsSync(file)) return;
    mkdirSync(folder, { recursive: true });
    database().exec(`VACUUM INTO '${file.replace(/'/g, "''")}'`);
    for (const old of readdirSync(folder).filter(f => /^ursula-\d{4}-\d{2}-\d{2}\.sqlite$/.test(f)).sort().slice(0, -KEEP_DAYS)) rmSync(path.join(folder, old), { force: true });
  } catch { /* a failed backup must never block the owner's save */ }
}
