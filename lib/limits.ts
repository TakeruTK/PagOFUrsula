// Photo limits keep the page fast and the server small. The workshop shrinks every photo before uploading it,
// so a phone picture of 5 MB ends up around 300 KB; these limits are the safety net behind that.
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;
export const PHOTO_MAX_EDGE = 1800;
export const PHOTOS_PER_PIECE = 4;
export const HOME_PHOTOS = 6;
// Total space for photos on the server; PHOTO_STORAGE_MB changes it if the hosting plan allows more.
export const STORAGE_MAX_BYTES = Number(process.env.PHOTO_STORAGE_MB || 150) * 1024 * 1024;
