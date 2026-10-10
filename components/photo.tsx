import type { Photo as PhotoType } from '@/lib/pieces';
export default function Photo({ photo, alt, eager = false }: { photo: PhotoType; alt: string; eager?: boolean }) {
  if (!photo.crop) return <img className="photo" src={photo.url} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
  const [x, y, w, h, sw, sh] = photo.crop;
  return <svg role="img" aria-label={alt} className="photo crop" viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" style={{ aspectRatio: `${w}/${h}` }}><image href={photo.url} width={sw} height={sh} /></svg>;
}
