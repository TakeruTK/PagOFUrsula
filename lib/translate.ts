import type { Locale } from './i18n';

export type Target = Exclude<Locale, 'es'>;
const languageName: Record<Target, string> = { en: 'English', pt: 'Brazilian Portuguese', fr: 'French' };

/**
 * Translates Spanish texts. Quality first: with ANTHROPIC_API_KEY the texts go to Claude, which knows this is
 * handmade jewelry. Without a key the public Google Translate endpoint is used so the site still works.
 * Empty texts stay empty and the order of the list is kept.
 */
export async function translateTexts(texts: string[], to: Target): Promise<string[]> {
  const pending = texts.map((text, i) => ({ text, i })).filter(t => t.text.trim());
  const out = texts.map(() => '');
  if (!pending.length) return out;
  const done = process.env.ANTHROPIC_API_KEY ? await withClaude(pending.map(t => t.text), to) : await withGoogle(pending.map(t => t.text), to);
  pending.forEach((t, n) => { out[t.i] = done[n]; });
  return out;
}

async function withClaude(texts: string[], to: Target): Promise<string[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-5-5', max_tokens: 8000,
      system: `You translate texts for the website of Ursula Alcaino, a Chilean silversmith who makes handmade jewelry. Translate from Spanish to ${languageName[to]} with a warm, elegant, natural tone. Keep names (Ursula Alcaino), numbers, units and any line starting with "## " (keep the "## "). Reply with ONLY a JSON array of strings, one translation per input, in the same order.`,
      messages: [{ role: 'user', content: JSON.stringify(texts) }],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Claude respondió ${response.status}`);
  const data = await response.json() as { content?: { text?: string }[] };
  const list: unknown = JSON.parse((data.content?.[0]?.text || '').replace(/^```(?:json)?|```$/gm, '').trim());
  if (!Array.isArray(list) || list.length !== texts.length || list.some(t => typeof t !== 'string')) throw new Error('Traducción con formato inesperado');
  return list as string[];
}

async function withGoogle(texts: string[], to: Target): Promise<string[]> {
  const url = process.env.TRANSLATE_URL || 'https://translate.googleapis.com/translate_a/single';
  const one = async (text: string) => {
    const response = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client: 'gtx', sl: 'es', tl: to, dt: 't', q: text }), signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`El traductor respondió ${response.status}`);
    const data = await response.json() as [[string | null][]];
    return data[0].map(part => part[0] || '').join('');
  };
  // Long texts go paragraph by paragraph so their structure survives; subtitles keep their "## " marker.
  const paragraph = async (text: string) => text.startsWith('## ') ? '## ' + await one(text.slice(3)) : one(text);
  const results: string[] = [];
  for (const text of texts) {
    const parts = text.split(/\n{2,}/);
    const done: string[] = [];
    for (let i = 0; i < parts.length; i += 5) done.push(...await Promise.all(parts.slice(i, i + 5).map(p => p.trim() ? paragraph(p.trim()) : Promise.resolve(''))));
    results.push(done.join('\n\n'));
  }
  return results;
}
