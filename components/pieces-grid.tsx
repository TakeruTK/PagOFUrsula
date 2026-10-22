'use client';
import { useState } from 'react';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { categories, categoryLabel } from '@/lib/pieces';
import type { Card } from '@/lib/catalog';
import PieceCard from './piece-card';

export default function PiecesGrid({ cards, lang, dict, showPrices }: { cards: Card[]; lang: Locale; dict: Dictionary; showPrices: boolean }) {
  const [category, setCategory] = useState('all');
  const tabs = categories.filter(c => cards.some(p => p.categoryKey === c));
  const shown = cards.filter(p => category === 'all' || p.categoryKey === category);
  return <>
    {tabs.length > 1 && <div className="chips" role="group" aria-label={dict.collection.filterLabel}>
      <button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{dict.collection.all}</button>
      {tabs.map(c => <button key={c} aria-pressed={category === c} onClick={() => setCategory(c)}>{categoryLabel(c, lang)}</button>)}
    </div>}
    {shown.length ? <ul className="grid" style={{ marginTop: 56 }}>{shown.map((p, i) => <li key={p.id}><PieceCard piece={p} lang={lang} dict={dict} showPrices={showPrices} eager={i < 3} /></li>)}</ul> : <div className="empty"><h3>{dict.collection.emptyTitle}</h3><p>{dict.collection.emptyText}</p></div>}
  </>;
}
