'use client';
import { useState } from 'react';
import type { Photo as PhotoType } from '@/lib/pieces';
import Photo from './photo';
import Tilt from './tilt';

export default function Gallery({ images, name, label }: { images: PhotoType[]; name: string; label: string }) {
  const [index, setIndex] = useState(0);
  return <figure className="gallery">
    <Tilt max={6}><div className="main"><Photo photo={images[index]} alt={images[index].caption || name} eager sizes="(max-width: 900px) 94vw, 55vw" /></div></Tilt>
    {images.length > 1 && <div className="thumbs">{images.map((im, i) => <button key={i} aria-label={label.replace('{n}', String(i + 1))} aria-pressed={index === i} onClick={() => setIndex(i)}><Photo photo={im} alt="" sizes="96px" /></button>)}</div>}
    {images[index].caption && <figcaption>{images[index].caption}</figcaption>}
  </figure>;
}
