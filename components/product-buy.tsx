'use client';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import type { Card } from '@/lib/catalog';
import type { Photo as PhotoType } from '@/lib/pieces';
import Photo from './photo';
import { useStore } from './store';

export function Gallery({ images, name }: { images: PhotoType[]; name: string }) {
  const [index, setIndex] = useState(0);
  return <div className="product-gallery">
    <Photo photo={images[index]} alt={images[index].caption || name} eager />
    {images.length > 1 && <div className="photo-thumbnails">{images.map((im, i) => <button key={i} aria-label={`${name} · ${i + 1}`} aria-pressed={index === i} onClick={() => setIndex(i)}><Photo photo={im} alt="" /></button>)}</div>}
    <p className="photo-caption">{images[index].caption}</p>
  </div>;
}

export function BuyBox({ card, contactHref }: { card: Card; contactHref: string }) {
  const { dict, add, setBagOpen } = useStore();
  const [quantity, setQuantity] = useState(1);
  if (!card.sellable) return <a href={contactHref} className="button" target="_blank" rel="noreferrer noopener">{dict.piece.consult} <ArrowUpRight size={17} /></a>;
  return <>
    <div className="purchase-row">
      <div className="quantity">
        <button aria-label={dict.piece.lessQty} disabled={quantity <= 1} onClick={() => setQuantity(q => q - 1)}><Minus size={15} /></button>
        <span>{quantity}</span>
        <button aria-label={dict.piece.moreQty} disabled={quantity >= Math.min(card.stock, 20)} onClick={() => setQuantity(q => q + 1)}><Plus size={15} /></button>
      </div>
      <button className="button" onClick={() => add(card, quantity)}>{dict.piece.addToBag} <ShoppingBag size={17} /></button>
    </div>
    <button className="text-link" onClick={() => setBagOpen(true)}>{dict.piece.viewBag} <ArrowRight size={16} /></button>
  </>;
}
