'use client';
import { useState } from 'react';
import type { Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import type { CategoryDef } from '@/lib/pieces';
import type { Card } from '@/lib/catalog';
import PieceCard from './piece-card';

export default function PiecesGrid({ cards, categories, lang, dict, showPrices }: { cards: Card[]; categories: CategoryDef[]; lang: Locale; dict: Dictionary; showPrices: boolean }) {
  const [category, setCategory] = useState('all');
  // Only categories that have pieces in this language get a button, in the order the owner arranged them.
  const tabs = categories.filter(c => cards.some(p => p.categoryKey === c.es));
  const shown = cards.filter(p => category === 'all' || p.categoryKey === category);
  return <>
    {cards.length > 1 && <div className="chips" role="group" aria-label={dict.collection.filterLabel}>
      <button aria-pressed={category === 'all'} onClick={() => setCategory('all')}>{dict.collection.all}</button>
      {tabs.map(c => <button key={c.es} aria-pressed={category === c.es} onClick={() => setCategory(c.es)}>{c[lang]}</button>)}
    </div>}
    {shown.length ? <ul className="grid" style={{ marginTop: 56 }}>{shown.map((p, i) => <li key={p.id}><PieceCard piece={p} lang={lang} dict={dict} showPrices={showPrices} eager={i < 3} /></li>)}</ul> : <div className="empty"><h3>{dict.collection.emptyTitle}</h3><p>{dict.collection.emptyText}</p></div>}
  </>;
}
