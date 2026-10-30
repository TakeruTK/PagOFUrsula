// Photos and logos are shown through the server's image resizer (WebP, cached for a year), so a phone downloads a few
// dozen KB instead of the full picture. The widths are the ones allowed in next.config.ts (images.deviceSizes/imageSizes).
const WIDTHS = [384, 480, 640, 750, 828, 1080, 1200];

/** The address of `url` resized to `width` pixels. Addresses of other sites are left alone. */
export const resized = (url: string, width: number) => (url.startsWith('/') && !url.startsWith('/_next') ? `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75` : url);

/** `srcset` for a picture shown at different sizes on different screens. */
export const srcSetFor = (url: string, widths: number[] = WIDTHS) => widths.map(w => `${resized(url, w)} ${w}w`).join(', ');
