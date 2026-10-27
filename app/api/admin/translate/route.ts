import { protect } from '@/lib/admin-auth';
import { translatePiece, translateSettings } from '@/lib/autotranslate';
import { translationNote } from '@/lib/http';
import { database, getPieces, getSettings } from '@/lib/store';
export const dynamic = 'force-dynamic';

/** Writes every missing translation (pieces, page texts and categories) in one go. */
export async function POST(request: Request) {
  const denied = await protect(request); if (denied) return denied;
  const failed = new Set<string>();
  for (const piece of getPieces(true)) {
    const result = await translatePiece(piece);
    result.failed.forEach(l => failed.add(l));
    database().prepare('UPDATE pieces SET content=? WHERE id=?').run(JSON.stringify(result.value), piece.id);
  }
  const settings = await translateSettings(getSettings());
  settings.failed.forEach(l => failed.add(l));
  database().prepare('UPDATE settings SET content=? WHERE id=1').run(JSON.stringify(settings.value));
  return Response.json({ ok: true, warning: translationNote([...failed]) });
}
