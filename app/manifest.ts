import type { MetadataRoute } from 'next';

/** Lets phones show the right name, colour and icon when the page is saved to the home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ursula Alcaino · Orfebrería', short_name: 'Ursula Alcaino', description: 'Joyas de autor hechas a mano en plata 950.',
    start_url: '/', display: 'browser', background_color: '#bec092', theme_color: '#bec092', lang: 'es',
    icons: [{ src: '/favicon.png', sizes: '48x48', type: 'image/png' }, { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'any' }],
  };
}
