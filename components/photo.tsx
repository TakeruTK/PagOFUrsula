import { resized, srcSetFor } from '@/lib/image';
import type { Photo as PhotoType } from '@/lib/pieces';

/**
 * A photograph. With `sizes` (how wide it is shown on each screen) the browser picks a resized WebP; without it the
 * original file is used, which is what the workshop needs for photos that are not public yet.
 */
export default function Photo({ photo, alt, eager = false, sizes }: { photo: PhotoType; alt: string; eager?: boolean; sizes?: string }) {
  if (!photo.crop) return <img className="photo" src={sizes ? resized(photo.url, 828) : photo.url} srcSet={sizes ? srcSetFor(photo.url) : undefined} sizes={sizes} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
  const [x, y, w, h, sw, sh] = photo.crop;
  return <svg role="img" aria-label={alt} className="photo crop" viewBox={`${x} ${y} ${w} ${h}`} preserveAspectRatio="xMidYMid slice" style={{ aspectRatio: `${w}/${h}` }}><image href={photo.url} width={sw} height={sh} /></svg>;
}
