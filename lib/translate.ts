import type { Locale } from './i18n';

export type Target = Exclude<Locale, 'es'>;
const languageName: Record<Target, string> = { en: 'English', pt: 'Brazilian Portuguese', fr: 'French' };

/**
 * Translates Spanish texts. With DEEPL_API_KEY (free plan: 500,000 characters a month) they go to DeepL; with
 * ANTHROPIC_API_KEY, to Claude; with neither, the public Google Translate endpoint is used so the site still works,
 * although it can be blocked at any time. Empty texts stay empty and the order of the list is kept.
 */
export async function translateTexts(texts: string[], to: Target): Promise<string[]> {
  const pending = texts.map((text, i) => ({ text, i })).filter(t => t.text.trim());
  const out = texts.map(() => '');
  if (!pending.length) return out;
  const list = pending.map(t => t.text);
  const done = process.env.DEEPL_API_KEY ? await withDeepL(list, to) : process.env.ANTHROPIC_API_KEY ? await withClaude(list, to) : await withGoogle(list, to);
  pending.forEach((t, n) => { out[t.i] = done[n]; });
  return out;
}

// DeepL keys of the free plan end in ":fx" and use their own address.
const deeplCode: Record<Target, string> = { en: 'EN-US', pt: 'PT-BR', fr: 'FR' };
async function withDeepL(texts: string[], to: Target): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY!;
  const url = process.env.DEEPL_URL || (key.endsWith(':fx') ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate');
  // Subtitles ("## ") travel without their marker and get it back afterwards.
  const parts = texts.map(text => text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean));
  const flat = parts.flat();
  const response = await fetch(url, {
    method: 'POST', headers: { Authorization: `DeepL-Auth-Key ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text: flat.map(p => p.startsWith('## ') ? p.slice(3) : p), source_lang: 'ES', target_lang: deeplCode[to], preserve_formatting: true }),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`DeepL respondió ${response.status}`);
  const data = await response.json() as { translations?: { text: string }[] };
  if (data.translations?.length !== flat.length) throw new Error('DeepL devolvió una cantidad inesperada de textos');
  let n = 0;
  return parts.map(group => group.map(p => (p.startsWith('## ') ? '## ' : '') + data.translations![n++].text).join('\n\n'));
}

async function withClaude(texts: string[], to: Target): Promise<string[]> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY!, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-5-5', max_tokens: 8000,
      system: `You translate texts for the website of Ursula Alcaino, a Chilean silversmith who makes handmade jewelry. Translate from Spanish to ${languageName[to]} with a warm, elegant, natural tone. In Chilean Spanish "aros" means earrings (hoop earrings only when it says "argollas"). Keep names (Ursula Alcaino), numbers, units and any line starting with "## " (keep the "## "). Reply with ONLY a JSON array of strings, one translation per input, in the same order.`,
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
