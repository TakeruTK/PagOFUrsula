import { createHash } from 'node:crypto';
import type { CategoryDef, Piece, Settings } from './pieces';
import { translateTexts, type Target } from './translate';

const targets: Target[] = ['en', 'pt', 'fr'];
const fingerprint = (source: string[]) => createHash('sha1').update(JSON.stringify(source)).digest('hex').slice(0, 12);

/**
 * A translation is written when it is missing, and rewritten when the Spanish text changed since the machine wrote it.
 * Anything the owner corrected by hand (no `auto` mark) is never touched.
 */
const needsWork = (current: { auto?: string } | undefined, hasText: boolean, mark: string) => !hasText || (!!current?.auto && current.auto !== mark);

export type Outcome<T> = { value: T; failed: Target[] };

export async function translatePiece(piece: Piece): Promise<Outcome<Piece>> {
  const source = [piece.name, piece.description, piece.material, piece.size, piece.images[0]?.caption || ''];
  const mark = fingerprint(source);
  const translations = { ...piece.translations };
  const failed: Target[] = [];
  await Promise.all(targets.map(async l => {
    const current = translations[l];
    if (!needsWork(current, !!(current?.name && current.description), mark)) return;
    try {
      const [name, description, material, size, caption] = await translateTexts(source, l);
      translations[l] = { name, description, material, size, caption, auto: mark };
    } catch { failed.push(l); }
  }));
  return { value: { ...piece, translations }, failed };
}

export async function translateSettings(settings: Settings): Promise<Outcome<Settings>> {
  const source = [settings.headline, settings.introduction, settings.story, settings.collectionTitle];
  const mark = fingerprint(source);
  const next = { ...settings };
  const failed: Target[] = [];
  await Promise.all(targets.map(async l => {
    const current = settings[l];
    if (!needsWork(current, !!(current.headline && current.story), mark)) return;
    try {
      const [headline, introduction, story, collectionTitle] = await translateTexts(source, l);
      next[l] = { headline, introduction, story, collectionTitle, auto: mark };
    } catch { failed.push(l); }
  }));
  const categories: CategoryDef[] = await Promise.all(settings.categories.map(async category => {
    const mark = fingerprint([category.es]);
    const result = { ...category, auto: mark };
    await Promise.all(targets.filter(l => needsWork(category, !!category[l], mark)).map(async l => {
      try { result[l] = (await translateTexts([category.es], l))[0]; } catch { failed.push(l); }
    }));
    return result;
  }));
  return { value: { ...next, categories }, failed: [...new Set(failed)] };
}
