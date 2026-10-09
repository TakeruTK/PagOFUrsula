'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Plus, Search, X } from 'lucide-react';
import { fmt } from '@/lib/dictionaries';
import { categories, categoryEn } from '@/lib/pieces';
import { piecePath } from '@/lib/i18n';
import type { Card } from '@/lib/catalog';
import Photo from './photo';
import { Price, useStore } from './store';

export default function Collection({ cards, initialQuery = '' }: { cards: Card[]; initialQuery?: string }) {
  const { lang, dict, add } = useStore();
  const [category, setCategory] = useState('Todas');
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState('atelier');
  const shown = cards
    .filter(p => (category === 'Todas' || p.categoryKey === category) && `${p.name} ${p.category} ${p.material}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'price-up' ? a.price - b.price : sort === 'price-down' ? b.price - a.price : a.order - b.order);
  const label = (p: Card) => p.kind === 'Trabajo' ? dict.collection.gallery : p.sellable ? dict.collection.available : p.availability === 'Por encargo' ? dict.collection.onRequest : dict.collection.soldOut;
  const tabs = ['Todas', ...categories.filter(c => cards.some(p => p.categoryKey === c))];

  return <>
    <div className="collection-controls">
      <div className="category-tabs" role="group" aria-label={dict.collection.filterLabel}>{tabs.map(c => <button key={c} onClick={() => setCategory(c)} aria-pressed={category === c} className={category === c ? 'active' : ''}>{c === 'Todas' ? dict.collection.all : lang === 'en' ? categoryEn[c as keyof typeof categoryEn] : c}{c === 'Todas' && <sup>{cards.length}</sup>}</button>)}</div>
      <label className="search-control"><Search size={15} /><span className="sr-only">{dict.collection.searchLabel}</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder={dict.collection.searchPlaceholder} maxLength={80} /></label>
      <label className="sort-control"><span className="sr-only">{dict.collection.sortLabel}</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="atelier">{dict.collection.sortAtelier}</option><option value="price-up">{dict.collection.sortPriceUp}</option><option value="price-down">{dict.collection.sortPriceDown}</option></select><ChevronDown size={14} /></label>
    </div>
    {query && <div className="search-result">{fmt(dict.collection.results, { query })} <button onClick={() => setQuery('')}>{dict.collection.clear} <X size={14} /></button></div>}
    {shown.length ? <div className="product-grid">{shown.map((p, index) => <article className="product-card" key={p.id}>
      <div className="product-visual">
        <Link className="product-image" href={piecePath(lang, p.slug)} aria-label={fmt(dict.collection.view, { name: p.name })}><Photo photo={p.images[0]} alt={p.images[0].caption || p.name} /></Link>
        {p.featured && <span className="product-badge">{dict.collection.featured}</span>}
        <button className="quick-add" aria-label={fmt(dict.collection.addToBag, { name: p.name })} disabled={!p.sellable} onClick={() => add(p)}><Plus size={20} /></button>
      </div>
      <div className="product-meta"><div><span className="tiny-label">{p.category} <span className="meta-dot">·</span> {String(index + 1).padStart(2, '0')}</span><Link className="product-name" href={piecePath(lang, p.slug)}>{p.name}</Link></div><Price className="price" clp={p.price} /></div>
      <span className="product-availability">{label(p)}</span>
    </article>)}</div> : <div className="empty-state"><Search size={28} /><h3>{dict.collection.emptyTitle}</h3><p>{dict.collection.emptyText}</p><button className="button" onClick={() => { setCategory('Todas'); setQuery(''); }}>{dict.collection.seeAll}</button></div>}
  </>;
}
