import { PHOTO_MAX_EDGE } from './limits';

/**
 * Shrinks a photo in the browser before it is uploaded: at most PHOTO_MAX_EDGE pixels on the long side, saved as WebP.
 * A phone picture of several MB ends up at a few hundred KB. If the browser cannot do it, the original is sent.
 */
export async function optimizeImage(file: File): Promise<File> {
  // Anything that looks like a picture is tried: the browser decodes by content, so odd file types (image/jpg, none,
  // HEIC on an iPhone) still end up as a small WebP. If it cannot read it, the original goes up and the server decides.
  if (!/^image\//.test(file.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(done => canvas.toBlob(done, 'image/webp', 0.85));
    return blob && blob.type === 'image/webp' && blob.size < file.size ? new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }) : file;
  } catch { return file; }
}
