import { allowIndexing, siteUrl } from './config';
import { legalDocs, legalPath, locales, pageKeys, pagePath, piecePath, homePath } from './i18n';
import { isTranslated, type Piece } from './pieces';
import { absolute } from './seo';

// IndexNow (Bing, Yandex, Naver, Seznam...): the key is public by design, the search engine checks that this same
// text is published at /<key>.txt (see public/).
const KEY = '486cdd156fd6366edf5744f3c9af62c5';

/** The pages that list or describe the owner's work: they change whenever a piece or a text changes. */
const siteListings = () => [...locales.map(homePath), ...locales.flatMap(l => pageKeys.map(k => pagePath(l, k))), ...locales.flatMap(l => legalDocs.map(d => legalPath(l, d)))];
const piecePaths = (piece: Piece) => locales.filter(l => isTranslated(piece, l)).map(l => piecePath(l, piece.slug));

/**
 * Tells the search engines which addresses changed so they come back sooner than their normal schedule.
 * Only for the real public site; a failure never affects the owner's save.
 */
function notifySearchEngines(paths: string[]) {
  if (!allowIndexing() || !paths.length) return;
  const urlList = [...new Set(paths)].slice(0, 500).map(absolute);
  void fetch(process.env.INDEXNOW_URL || 'https://api.indexnow.org/indexnow', {
    method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, signal: AbortSignal.timeout(10000),
    body: JSON.stringify({ host: new URL(siteUrl()).host, key: KEY, keyLocation: absolute(`/${KEY}.txt`), urlList }),
  }).catch(() => { /* the engines will find the change on their own schedule */ });
}
export const notifyPieceChange = (piece: Piece) => notifySearchEngines([...piecePaths(piece), ...siteListings()]);
export const notifySiteChange = () => notifySearchEngines(siteListings());
