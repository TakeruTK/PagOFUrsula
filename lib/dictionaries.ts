import type { Locale } from './i18n';

const es = {
  site: { name: 'Ursula Alcaino · Orfebrería' },
  meta: {
    homeTitle: 'Ursula Alcaino · Joyería de autora hecha a mano',
    homeDescription: 'El lujo de lo irrepetible: joyas de autor creadas a mano para quienes encuentran belleza en lo singular y significado en lo extraordinario. Escríbenos para conseguir tu pieza.',
    notFoundTitle: 'Página no encontrada',
  },
  nav: { collection: 'Colección', about: 'Sobre mí', contact: 'Contacto', language: 'Idioma', menu: 'Abrir menú', menuTitle: 'Menú', close: 'Cerrar', home: 'Inicio' },
  hero: { kicker: 'JOYAS DE AUTOR', scroll: 'Descubre' },
  about: {
    eyebrow: 'DETRÁS DE CADA JOYA, UNA HISTORIA',
    title: 'Mi historia como orfebre',
    pillars: [
      { title: 'VEINTE AÑOS DE OFICIO', text: 'Veinte años creando, aprendiendo y descubriendo nuevas formas de expresar mi mirada.' },
      { title: 'LO IRREPETIBLE', text: 'Joyas de autor creadas a mano para quienes encuentran belleza en lo singular.' },
      { title: 'PENSADAS PARA CADA MUJER', text: 'Cada lóbulo es diferente, cada mujer tiene sus propias necesidades y su propio ritmo de vida.' },
      { title: 'UNA MIRADA PROPIA', text: 'Una inquietud de juventud, el gancho de los aros, que se volvió mi manera de entender la joyería.' },
    ],
  },
  collection: { eyebrow: 'PIEZAS ÚNICAS', all: 'Todas', filterLabel: 'Filtrar por categoría', emptyTitle: 'Pronto habrá nuevas piezas.', emptyText: 'Mientras tanto, sigue el proceso en Instagram.', available: 'Disponible', onRequest: 'Por encargo', sold: 'Vendida', view: 'Ver {name}', price: 'Valor referencial {price}' },
  instagram: { text: 'Puedes seguir mi proceso, ver nuevas piezas y próximos proyectos en Instagram.', button: 'INSTAGRAM' },
  cta: { title: '¿Te interesa alguna pieza o tienes una idea que conecte con mi estilo?', whatsapp: 'HABLEMOS POR WHATSAPP', email: 'ESCRÍBENOS UN CORREO', note: 'Aquí no se paga en línea: conversamos, confirmamos disponibilidad y coordinamos el pago y el envío.', whatsappMessage: 'Hola Ursula, me gustaría conversar sobre tus joyas.' },
  piece: { breadcrumb: 'Migas de pan', details: 'Materiales y técnica', availability: 'Disponibilidad', unconfirmed: 'Por confirmar', ask: 'CONSULTAR POR WHATSAPP', askEmail: 'CONSULTAR POR CORREO', askInstagram: 'ESCRIBIR POR INSTAGRAM', unique: 'Pieza única o de tirada muy limitada. Escríbenos para confirmar su disponibilidad, valor y envío.', whatsappMessage: 'Hola Ursula, me interesa la pieza “{name}” ({url}). ¿Está disponible?', emailSubject: 'Consulta por la pieza {name}', related: 'Otras piezas', photo: 'Ver fotografía {n}', price: 'Valor referencial' },
  home: { aboutLink: 'Lee mi historia', featured: 'Piezas destacadas', all: 'VER TODA LA COLECCIÓN', contactLink: 'IR A CONTACTO' },
  pages: {
    collection: { metaTitle: 'Colección de joyas hechas a mano', metaDescription: 'Aros, anillos y colgantes hechos a mano por Ursula Alcaino. Piezas únicas o de tirada muy limitada, inspiradas en la naturaleza, el metal y el color.', intro: 'Aros, anillos y colgantes hechos a mano. Cada pieza es única o de tirada muy limitada.' },
    about: { metaTitle: 'Mi historia como orfebre', metaDescription: 'Veinte años creando joyas de autor: la historia de Ursula Alcaino, orfebre, y cómo nació su mirada sobre la joyería.', imageAlt: 'Detalle de una joya de Ursula Alcaino', more: 'VER LA COLECCIÓN' },
    contact: {
      title: 'Hablemos', metaTitle: 'Contacto', metaDescription: 'Escribe a Ursula Alcaino por WhatsApp, correo o Instagram para consultar por una pieza o conversar una idea.',
      intro: '¿Te interesa alguna pieza o tienes una idea que conecte con mi estilo? Escríbeme y lo conversamos.',
      stepsTitle: 'Cómo conseguir tu pieza',
      steps: [
        { title: 'Elige', text: 'Recorre la colección y elige la pieza que te llame la atención.' },
        { title: 'Escríbenos', text: 'Cuéntanos cuál te interesa. Te confirmamos disponibilidad y valor.' },
        { title: 'Coordinamos', text: 'Acordamos juntos la forma de pago y el envío a tu país.' },
      ],
      channels: 'Canales de contacto', whatsapp: 'WhatsApp', whatsappText: 'La forma más directa de consultar por una pieza.', email: 'Correo', emailText: 'Para consultas más largas o ideas a conversar.', instagram: 'Instagram', instagramText: 'Sigue el proceso y escríbenos por mensaje directo.', facebook: 'Facebook', facebookText: 'Novedades y mensajes desde nuestra página.', tiktok: 'TikTok', tiktokText: 'Mira el proceso de las piezas en video.', open: 'ABRIR',
    },
  },
  footer: { email: 'Correo electrónico', follow: 'Síguenos y escríbenos', terms: 'Condiciones', privacy: 'Privacidad', workshop: 'Acceso al taller', rights: '© {year} Ursula Alcaino · Orfebrería' },
  legal: { terms: 'Condiciones de compra', privacy: 'Política de privacidad', empty: 'Este texto se publicará próximamente.', contact: 'Contacto' },
  notFound: { title: 'No encontramos esta página.', text: 'Quizás la joya que buscas ya encontró su dueña. Vuelve a las piezas.', cta: 'Volver al inicio' },
};

export type Dictionary = typeof es;

const en: Dictionary = {
  site: { name: 'Ursula Alcaino · Orfebrería' },
  meta: {
    homeTitle: 'Ursula Alcaino · Handmade Artisan Jewelry from Chile',
    homeDescription: 'The luxury of the unrepeatable: handcrafted signature jewelry by Chilean silversmith Ursula Alcaino, for those who find beauty in the singular. Write to us to get your piece.',
    notFoundTitle: 'Page not found',
  },
  nav: { collection: 'Collection', about: 'About', contact: 'Contact', language: 'Language', menu: 'Open menu', menuTitle: 'Menu', close: 'Close', home: 'Home' },
  hero: { kicker: 'ARTISAN JEWELRY', scroll: 'Discover' },
  about: {
    eyebrow: 'BEHIND EVERY PIECE, A STORY',
    title: 'My story as a silversmith',
    pillars: [
      { title: 'TWENTY YEARS OF CRAFT', text: 'Twenty years creating, learning and discovering new ways to express my vision.' },
      { title: 'THE UNREPEATABLE', text: 'Handcrafted signature jewelry for those who find beauty in the singular.' },
      { title: 'DESIGNED FOR EVERY WOMAN', text: 'Every earlobe is different, every woman has her own needs and her own rhythm of life.' },
      { title: 'A VISION OF MY OWN', text: 'A restlessness from my youth, the hook of earrings, that became my way of understanding jewelry.' },
    ],
  },
  collection: { eyebrow: 'UNIQUE PIECES', all: 'All', filterLabel: 'Filter by category', emptyTitle: 'New pieces are coming soon.', emptyText: 'Meanwhile, follow the process on Instagram.', available: 'Available', onRequest: 'Made to order', sold: 'Sold', view: 'View {name}', price: 'Reference price {price}' },
  instagram: { text: 'You can follow my process, see new pieces and upcoming projects on Instagram.', button: 'INSTAGRAM' },
  cta: { title: 'Interested in a piece, or have an idea that connects with my style?', whatsapp: 'LET’S TALK ON WHATSAPP', email: 'SEND US AN EMAIL', note: 'There is no online payment here: we chat, confirm availability and arrange payment and shipping together.', whatsappMessage: 'Hello Ursula, I would like to talk about your jewelry.' },
  piece: { breadcrumb: 'Breadcrumb', details: 'Materials and technique', availability: 'Availability', unconfirmed: 'To be confirmed', ask: 'ASK ON WHATSAPP', askEmail: 'ASK BY EMAIL', askInstagram: 'MESSAGE ON INSTAGRAM', unique: 'One-of-a-kind or very limited piece. Write to us to confirm availability, price and shipping.', whatsappMessage: 'Hello Ursula, I am interested in the piece “{name}” ({url}). Is it available?', emailSubject: 'Inquiry about {name}', related: 'More pieces', photo: 'View photo {n}', price: 'Reference price' },
  home: { aboutLink: 'Read my story', featured: 'Featured pieces', all: 'SEE THE FULL COLLECTION', contactLink: 'GO TO CONTACT' },
  pages: {
    collection: { metaTitle: 'Handmade jewelry collection', metaDescription: 'Handmade earrings, rings and pendants by Ursula Alcaino. One-of-a-kind or very limited pieces inspired by nature, metal and color.', intro: 'Handmade earrings, rings and pendants. Every piece is one of a kind or a very limited run.' },
    about: { metaTitle: 'My story as a silversmith', metaDescription: 'Twenty years creating signature jewelry: the story of Ursula Alcaino, silversmith, and how her vision of jewelry was born.', imageAlt: 'Detail of a jewelry piece by Ursula Alcaino', more: 'SEE THE COLLECTION' },
    contact: {
      title: 'Let’s talk', metaTitle: 'Contact', metaDescription: 'Write to Ursula Alcaino on WhatsApp, email or Instagram to ask about a piece or talk through an idea.',
      intro: 'Interested in a piece, or have an idea that connects with my style? Write to me and we will talk it through.',
      stepsTitle: 'How to get your piece',
      steps: [
        { title: 'Choose', text: 'Browse the collection and pick the piece that catches your eye.' },
        { title: 'Write to us', text: 'Tell us which one you like. We confirm availability and price.' },
        { title: 'We arrange it', text: 'Together we agree on payment and shipping to your country.' },
      ],
      channels: 'Ways to reach us', whatsapp: 'WhatsApp', whatsappText: 'The most direct way to ask about a piece.', email: 'Email', emailText: 'For longer questions or ideas to talk through.', instagram: 'Instagram', instagramText: 'Follow the process and send us a direct message.', facebook: 'Facebook', facebookText: 'News and messages from our page.', tiktok: 'TikTok', tiktokText: 'Watch the making of the pieces on video.', open: 'OPEN',
    },
  },
  footer: { email: 'Email', follow: 'Follow and write to us', terms: 'Terms', privacy: 'Privacy', workshop: 'Workshop access', rights: '© {year} Ursula Alcaino · Orfebrería' },
  legal: { terms: 'Terms of sale', privacy: 'Privacy policy', empty: 'This text will be published soon.', contact: 'Contact' },
  notFound: { title: 'We could not find this page.', text: 'Maybe the piece you were looking for already found its owner. Go back to the pieces.', cta: 'Back to home' },
};

const dictionaries: Record<Locale, Dictionary> = { es, en };
export const getDictionary = (locale: Locale) => dictionaries[locale];
export const fmt = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
