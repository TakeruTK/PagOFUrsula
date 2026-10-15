import type { Locale } from './i18n';

const es = {
  site: { name: 'Úrsula Alcaíno · Orfebrería' },
  meta: {
    homeTitle: 'Úrsula Alcaíno · Joyería de autora hecha a mano',
    homeDescription: 'Orfebrería de autora: aros, anillos y colgantes hechos a mano, inspirados en la naturaleza, el metal y el color. Escríbenos por WhatsApp para conseguir tu pieza.',
    notFoundTitle: 'Página no encontrada',
  },
  nav: { collection: 'Colección', about: 'Sobre mí', contact: 'Contacto', language: 'Idioma', menu: 'Abrir menú', menuTitle: 'Menú', close: 'Cerrar', home: 'Inicio' },
  hero: { kicker: 'JOYERÍA DE AUTORA', scroll: 'Descubre' },
  about: {
    eyebrow: 'SOBRE MI TRABAJO',
    title: 'Joyas que nacen de mirar de cerca.',
    pillars: [
      { title: 'PIEZAS ÚNICAS', text: 'Cada joya nace de un proceso manual y conserva sus propias formas y detalles.' },
      { title: 'FORMAS ORGÁNICAS', text: 'La naturaleza es el punto de partida: curvas, texturas y reflejos que parecen encontrados.' },
      { title: 'METAL Y COLOR', text: 'El metal se encuentra con destellos de color para dar carácter a cada pieza.' },
      { title: 'EN PROCESO', text: 'Nuevas ideas y técnicas darán forma a futuras colecciones.' },
    ],
  },
  collection: { eyebrow: 'PIEZAS ÚNICAS', all: 'Todas', filterLabel: 'Filtrar por categoría', emptyTitle: 'Pronto habrá nuevas piezas.', emptyText: 'Mientras tanto, sigue el proceso en Instagram.', available: 'Disponible', onRequest: 'Por encargo', sold: 'Vendida', view: 'Ver {name}', price: 'Valor referencial {price}' },
  instagram: { text: 'Puedes seguir mi proceso, ver nuevas piezas y próximos proyectos en Instagram.', button: 'INSTAGRAM' },
  cta: { float: 'Escríbenos por WhatsApp', title: '¿Te interesa alguna pieza o tienes una idea que conecte con mi estilo?', whatsapp: 'HABLEMOS POR WHATSAPP', email: 'ESCRÍBENOS UN CORREO', note: 'Aquí no se paga en línea: conversamos, confirmamos disponibilidad y coordinamos el pago y el envío.', whatsappMessage: 'Hola Úrsula, me gustaría conversar sobre tus joyas.' },
  piece: { breadcrumb: 'Migas de pan', details: 'Materiales y técnica', availability: 'Disponibilidad', unconfirmed: 'Por confirmar', ask: 'CONSULTAR POR WHATSAPP', askEmail: 'CONSULTAR POR CORREO', askInstagram: 'ESCRIBIR POR INSTAGRAM', unique: 'Pieza única o de tirada muy limitada. Escríbenos para confirmar su disponibilidad, valor y envío.', whatsappMessage: 'Hola Úrsula, me interesa la pieza “{name}” ({url}). ¿Está disponible?', emailSubject: 'Consulta por la pieza {name}', related: 'Otras piezas', photo: 'Ver fotografía {n}', price: 'Valor referencial' },
  home: { aboutLink: 'Conoce más sobre mi trabajo', featured: 'Piezas destacadas', all: 'VER TODA LA COLECCIÓN', contactLink: 'IR A CONTACTO' },
  pages: {
    collection: { metaTitle: 'Colección de joyas hechas a mano', metaDescription: 'Aros, anillos y colgantes hechos a mano por Úrsula Alcaíno. Piezas únicas o de tirada muy limitada, inspiradas en la naturaleza, el metal y el color.', intro: 'Aros, anillos y colgantes hechos a mano. Cada pieza es única o de tirada muy limitada.' },
    about: { metaTitle: 'Sobre mi trabajo', metaDescription: 'Conoce el trabajo de Úrsula Alcaíno: orfebrería de autora inspirada en la naturaleza, con formas orgánicas, metal y color.', imageAlt: 'Detalle de una joya de Úrsula Alcaíno', more: 'VER LA COLECCIÓN' },
    contact: {
      title: 'Hablemos', metaTitle: 'Contacto', metaDescription: 'Escribe a Úrsula Alcaíno por WhatsApp, correo o Instagram para consultar por una pieza o conversar una idea.',
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
  footer: { terms: 'Condiciones', privacy: 'Privacidad', instagram: 'Instagram', workshop: 'Acceso al taller', rights: '© {year} Úrsula Alcaíno · Orfebrería' },
  legal: { terms: 'Condiciones de compra', privacy: 'Política de privacidad', empty: 'Este texto se publicará próximamente.', contact: 'Contacto' },
  notFound: { title: 'No encontramos esta página.', text: 'Quizás la joya que buscas ya encontró su dueña. Vuelve a las piezas.', cta: 'Volver al inicio' },
};

export type Dictionary = typeof es;

const en: Dictionary = {
  site: { name: 'Úrsula Alcaíno · Orfebrería' },
  meta: {
    homeTitle: 'Úrsula Alcaíno · Handmade Artisan Jewelry from Chile',
    homeDescription: 'Handcrafted jewelry by Chilean silversmith Úrsula Alcaíno: earrings, rings and pendants inspired by nature, metal and color. Message us on WhatsApp to get your piece.',
    notFoundTitle: 'Page not found',
  },
  nav: { collection: 'Collection', about: 'About', contact: 'Contact', language: 'Language', menu: 'Open menu', menuTitle: 'Menu', close: 'Close', home: 'Home' },
  hero: { kicker: 'ARTISAN JEWELRY', scroll: 'Discover' },
  about: {
    eyebrow: 'ABOUT MY WORK',
    title: 'Jewelry born from looking closely.',
    pillars: [
      { title: 'ONE OF A KIND', text: 'Each piece is born from a handmade process and keeps its own shapes and details.' },
      { title: 'ORGANIC FORMS', text: 'Nature is the starting point: curves, textures and reflections that feel found rather than made.' },
      { title: 'METAL AND COLOR', text: 'Metal meets flashes of color to give each piece its character.' },
      { title: 'WORK IN PROGRESS', text: 'New ideas and techniques will shape future collections.' },
    ],
  },
  collection: { eyebrow: 'UNIQUE PIECES', all: 'All', filterLabel: 'Filter by category', emptyTitle: 'New pieces are coming soon.', emptyText: 'Meanwhile, follow the process on Instagram.', available: 'Available', onRequest: 'Made to order', sold: 'Sold', view: 'View {name}', price: 'Reference price {price}' },
  instagram: { text: 'You can follow my process, see new pieces and upcoming projects on Instagram.', button: 'INSTAGRAM' },
  cta: { float: 'Message us on WhatsApp', title: 'Interested in a piece, or have an idea that connects with my style?', whatsapp: 'LET’S TALK ON WHATSAPP', email: 'SEND US AN EMAIL', note: 'There is no online payment here: we chat, confirm availability and arrange payment and shipping together.', whatsappMessage: 'Hello Úrsula, I would like to talk about your jewelry.' },
  piece: { breadcrumb: 'Breadcrumb', details: 'Materials and technique', availability: 'Availability', unconfirmed: 'To be confirmed', ask: 'ASK ON WHATSAPP', askEmail: 'ASK BY EMAIL', askInstagram: 'MESSAGE ON INSTAGRAM', unique: 'One-of-a-kind or very limited piece. Write to us to confirm availability, price and shipping.', whatsappMessage: 'Hello Úrsula, I am interested in the piece “{name}” ({url}). Is it available?', emailSubject: 'Inquiry about {name}', related: 'More pieces', photo: 'View photo {n}', price: 'Reference price' },
  home: { aboutLink: 'Learn more about my work', featured: 'Featured pieces', all: 'SEE THE FULL COLLECTION', contactLink: 'GO TO CONTACT' },
  pages: {
    collection: { metaTitle: 'Handmade jewelry collection', metaDescription: 'Handmade earrings, rings and pendants by Úrsula Alcaíno. One-of-a-kind or very limited pieces inspired by nature, metal and color.', intro: 'Handmade earrings, rings and pendants. Every piece is one of a kind or a very limited run.' },
    about: { metaTitle: 'About my work', metaDescription: 'Discover the work of Úrsula Alcaíno: artisan jewelry inspired by nature, with organic shapes, metal and color.', imageAlt: 'Detail of a jewelry piece by Úrsula Alcaíno', more: 'SEE THE COLLECTION' },
    contact: {
      title: 'Let’s talk', metaTitle: 'Contact', metaDescription: 'Write to Úrsula Alcaíno on WhatsApp, email or Instagram to ask about a piece or talk through an idea.',
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
  footer: { terms: 'Terms', privacy: 'Privacy', instagram: 'Instagram', workshop: 'Workshop access', rights: '© {year} Úrsula Alcaíno · Orfebrería' },
  legal: { terms: 'Terms of sale', privacy: 'Privacy policy', empty: 'This text will be published soon.', contact: 'Contact' },
  notFound: { title: 'We could not find this page.', text: 'Maybe the piece you were looking for already found its owner. Go back to the pieces.', cta: 'Back to home' },
};

const dictionaries: Record<Locale, Dictionary> = { es, en };
export const getDictionary = (locale: Locale) => dictionaries[locale];
export const fmt = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
