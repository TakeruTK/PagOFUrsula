import type { Locale } from './i18n';

const es = {
  site: { name: 'Úrsula Alcaíno · Orfebrería', tagline: 'Joyas que se encuentran contigo.' },
  meta: {
    homeTitle: 'Úrsula Alcaíno · Joyas artesanales de autor',
    homeDescription: 'Orfebrería de autor: aros, anillos y colgantes artesanales que encuentran su forma en la naturaleza, el metal y el color. Envíos a Chile y al mundo.',
    legalSuffix: 'Úrsula Alcaíno · Orfebrería',
    notFoundTitle: 'Página no encontrada',
  },
  announcement: 'JOYAS CON IDENTIDAD · ORFEBRERÍA DE AUTOR',
  announcementShipping: 'Envíos a Chile y al mundo',
  demoBanner: 'Tienda en revisión · Los pagos son de prueba',
  nav: { collection: 'La colección', universe: 'El universo de Úrsula', contact: 'Conectemos', workshop: 'Acceso al taller', menu: 'Abrir menú', menuTitle: 'Explora Úrsula', menuDescription: 'Joyas con identidad.', close: 'Cerrar', search: 'Buscar una joya', home: 'Inicio', language: 'Idioma', currency: 'Moneda', bag: 'Bolsa', openBag: 'Abrir bolsa, {count} piezas' },
  hero: {
    eyebrow: 'EL ARTE DE LO SINGULAR', note1: 'No hay dos formas', note2: 'de ser tú.', note3: 'Tampoco de llevar', note4: 'una joya.', discover: 'Descubre la colección',
    imageLabel: 'UN DETALLE. TODO UN UNIVERSO.', orbit: 'FORMAS LIBRES · ALMA PROPIA', magic1: 'Metal, naturaleza', magic2: 'y un poco de magia.', by: 'POR ÚRSULA ALCAÍNO', discoverPiece: 'Descubrir {name}',
  },
  values: { design: 'Diseño con identidad', organic: 'Inspiración orgánica', detail: 'Un detalle para ti', secure: 'Pago seguro · PayPal y Mercado Pago', worldwide: 'Envíos a todo el mundo' },
  collection: {
    eyebrow: 'ELIGE LO QUE HABLA DE TI', aside1: 'Pequeños tesoros.', aside2: 'Infinitas formas de llevarlos.', all: 'Todas', filterLabel: 'Filtrar por categoría', sortLabel: 'Ordenar colección',
    sortAtelier: 'Selección del taller', sortPriceUp: 'Menor precio', sortPriceDown: 'Mayor precio', searchLabel: 'Buscar en la colección', searchPlaceholder: 'Aros, verde, mariposa…',
    results: 'Resultados para “{query}”', clear: 'Limpiar búsqueda', emptyTitle: 'No encontramos esa joya.', emptyText: 'Prueba otra palabra o explora toda la colección.', seeAll: 'Ver todas las piezas',
    featured: 'Selección de Úrsula', gallery: 'Pieza de galería', onRequest: 'Por encargo', soldOut: 'Agotado', available: 'Disponible', addToBag: 'Agregar {name} a la bolsa', view: 'Ver {name}',
  },
  universe: { eyebrow: 'EL UNIVERSO DE ÚRSULA', title1: 'Una forma distinta', title2: 'de sentir la', title3: 'materia.', link: 'Conoce más de mi trabajo', signature: 'Úrsula Alcaíno', corner: 'LA BELLEZA DE MIRAR MÁS CERCA', alt: 'Mariposa de metal y color del trabajo de Úrsula Alcaíno' },
  contact: { eyebrow: 'SIGAMOS CONECTANDO', title1: 'Las historias continúan', title2: 'fuera del taller.', text: 'Nuevas piezas, detalles y un vistazo al proceso creativo.', whatsapp: 'Escríbenos por WhatsApp', email: 'Escríbenos un correo' },
  footer: { collection: 'Colección', terms: 'Condiciones de compra', privacy: 'Privacidad', shipping: 'Envíos y devoluciones', instagram: 'Instagram', workshop: 'Acceso al taller', rights: '© {year} Úrsula Alcaíno · Orfebrería', payments: 'Pagos con PayPal y Mercado Pago', made: 'HECHO CON INTENCIÓN' },
  piece: {
    breadcrumb: 'Migas de pan', details: 'Detalles', availability: 'Disponibilidad', inStock: 'Disponible', soldOut: 'Agotado', onRequest: 'Por encargo', sold: 'Vendido', gallery: 'Pieza de galería', unconfirmed: 'Por confirmar',
    addToBag: 'Agregar a la bolsa', viewBag: 'Ver mi bolsa', consult: 'Consultar por esta pieza', lessQty: 'Reducir cantidad', moreQty: 'Aumentar cantidad', photo: 'Ver fotografía {n}', shippingNote: 'Envíos a Chile y al mundo. El costo exacto se calcula según tu país antes de pagar.',
    related: 'También te puede gustar', translationNote: '', priceIn: 'Precio en {currency}',
  },
  bag: {
    title: 'Tu bolsa ({count})', description: 'Pequeños tesoros que elegiste para ti.', subtotal: 'Subtotal', shippingNote: 'El envío se calcula según tu país en el siguiente paso.', invalid: 'Ajusta las cantidades o retira las piezas que ya no están disponibles.',
    continue: 'Continuar con la compra', emptyTitle: 'Tu próxima joya te espera.', emptyText: 'Explora la colección y guarda aquí tus favoritas.', discover: 'Descubrir las piezas', unavailable: 'Pieza no disponible', removeIt: 'Retira esta pieza',
    removeOne: 'Quitar una unidad de {name}', addOne: 'Agregar una unidad de {name}', delete: 'Eliminar {name} de la bolsa', added: '{name} se agregó a tu bolsa.', maxed: 'Ya tienes la cantidad disponible en tu bolsa.', secure: 'Pago seguro con PayPal o Mercado Pago',
  },
  checkout: {
    title: 'Un paso más cerca', description: 'Completa tus datos para recibir tu pedido.', stepData: '01 / TUS DATOS', stepShipping: '02 / ENVÍO', stepPayment: '03 / MEDIO DE PAGO',
    name: 'Nombre completo', email: 'Correo electrónico', phone: 'Teléfono (opcional)', country: 'País de destino', region: 'Región / Estado', city: 'Ciudad o comuna', address: 'Dirección', postal: 'Código postal', notes: 'Indicaciones para la entrega (opcional)',
    emailHelp: 'Te enviaremos aquí la confirmación y el seguimiento.', shippingTo: 'Envío a {country} · {eta}', shippingUnavailable: 'Por ahora no realizamos envíos a ese país.', shippingCost: 'Envío', total: 'Total',
    methodMp: 'Mercado Pago', methodMpText: 'Tarjetas, débito y transferencia · Pesos chilenos (solo envíos a Chile)', methodPp: 'PayPal', methodPpText: 'Tarjetas internacionales o saldo PayPal · Se cobra en dólares (USD)', methodDemo: 'Pago de prueba', methodDemoText: 'Simulador: no se cobra dinero',
    noMethods: 'Los pagos aún no están activados en esta tienda.', summary: 'TU SELECCIÓN', rateNote: 'PayPal cobra en dólares (USD) al tipo de cambio de la tienda: 1 USD = {rate} CLP.', payWith: 'Pagar con {method}', processing: 'Redirigiendo al pago…', secure: 'Serás llevada al sitio seguro de {method}. No guardamos datos de tarjetas.',
    error: 'No pudimos conectar. Inténtalo otra vez.', qty: '{name} × {qty}',
  },
  order: {
    title: 'Tu pedido #{number}', paid: 'Recibimos tu pago. ¡Gracias!', paidText: 'Tu pedido quedó confirmado. Te enviaremos los detalles por correo y te avisaremos cuando sea despachado.',
    pending: 'Estamos esperando la confirmación del pago', pendingText: 'Si ya pagaste, esta página se actualizará sola. Si cerraste el pago antes de terminar, puedes retomarlo.',
    failed: 'El pago no se completó', failedText: 'No se realizó ningún cobro. Tus piezas siguen en tu bolsa para que lo intentes otra vez.', cancelled: 'Pedido cancelado', cancelledText: 'Este pedido fue cancelado. No se realizó ningún cobro.',
    expired: 'La reserva expiró', expiredText: 'Pasó el tiempo de reserva sin recibir el pago. Vuelve a la bolsa para intentarlo otra vez.', shipped: 'Tu pedido va en camino', shippedText: 'Despachamos tu pedido.', delivered: 'Pedido entregado', deliveredText: 'Esperamos que disfrutes tu joya.', refunded: 'Pedido reembolsado', refundedText: 'El pago de este pedido fue reembolsado.',
    total: 'Total', shipping: 'Envío', items: 'Piezas', retry: 'Retomar el pago', backToShop: 'Seguir explorando', backToBag: 'Volver a la bolsa', tracking: 'Seguimiento', demoTitle: 'Simulador de pago', demoText: 'La tienda está en revisión: elige el resultado que quieres probar. No se cobra dinero.', demoApproved: 'Aprobar pago', demoPending: 'Dejar pendiente', demoRejected: 'Rechazar pago', notFound: 'No encontramos este pedido.',
  },
  legal: { terms: 'Condiciones de compra', privacy: 'Política de privacidad', shipping: 'Envíos y devoluciones', empty: 'Este texto se publicará próximamente.', contact: 'Contacto' },
  notFound: { title: 'No encontramos esta página.', text: 'Quizás la joya que buscas ya encontró su dueña. Vuelve a la colección.', cta: 'Volver a la tienda' },
};

export type Dictionary = typeof es;

const en: Dictionary = {
  site: { name: 'Úrsula Alcaíno · Orfebrería', tagline: 'Jewelry that finds you.' },
  meta: {
    homeTitle: 'Úrsula Alcaíno · Handmade Artisan Jewelry from Chile',
    homeDescription: 'Handcrafted jewelry by Chilean silversmith Úrsula Alcaíno: earrings, rings and pendants shaped by nature, metal and color. Worldwide shipping.',
    legalSuffix: 'Úrsula Alcaíno · Orfebrería',
    notFoundTitle: 'Page not found',
  },
  announcement: 'JEWELRY WITH IDENTITY · ARTISAN SILVERSMITH',
  announcementShipping: 'Worldwide shipping from Chile',
  demoBanner: 'Shop under review · Payments are test payments',
  nav: { collection: 'The collection', universe: 'Úrsula’s world', contact: 'Get in touch', workshop: 'Workshop access', menu: 'Open menu', menuTitle: 'Explore Úrsula', menuDescription: 'Jewelry with identity.', close: 'Close', search: 'Search jewelry', home: 'Home', language: 'Language', currency: 'Currency', bag: 'Bag', openBag: 'Open bag, {count} items' },
  hero: {
    eyebrow: 'THE ART OF THE SINGULAR', note1: 'There are no two ways', note2: 'of being you.', note3: 'Nor of wearing', note4: 'a piece of jewelry.', discover: 'Discover the collection',
    imageLabel: 'ONE DETAIL. A WHOLE UNIVERSE.', orbit: 'FREE FORMS · OWN SOUL', magic1: 'Metal, nature', magic2: 'and a little magic.', by: 'BY ÚRSULA ALCAÍNO', discoverPiece: 'Discover {name}',
  },
  values: { design: 'Design with identity', organic: 'Organic inspiration', detail: 'A detail for you', secure: 'Secure payment · PayPal & Mercado Pago', worldwide: 'Worldwide shipping' },
  collection: {
    eyebrow: 'CHOOSE WHAT SPEAKS OF YOU', aside1: 'Small treasures.', aside2: 'Endless ways to wear them.', all: 'All', filterLabel: 'Filter by category', sortLabel: 'Sort collection',
    sortAtelier: 'Workshop selection', sortPriceUp: 'Price: low to high', sortPriceDown: 'Price: high to low', searchLabel: 'Search the collection', searchPlaceholder: 'Earrings, green, butterfly…',
    results: 'Results for “{query}”', clear: 'Clear search', emptyTitle: 'We could not find that piece.', emptyText: 'Try another word or explore the whole collection.', seeAll: 'See all pieces',
    featured: 'Úrsula’s selection', gallery: 'Gallery piece', onRequest: 'Made to order', soldOut: 'Sold out', available: 'Available', addToBag: 'Add {name} to bag', view: 'View {name}',
  },
  universe: { eyebrow: 'ÚRSULA’S WORLD', title1: 'A different way', title2: 'of feeling', title3: 'matter.', link: 'Learn more about my work', signature: 'Úrsula Alcaíno', corner: 'THE BEAUTY OF LOOKING CLOSER', alt: 'Metal and color butterfly from the work of Úrsula Alcaíno' },
  contact: { eyebrow: 'LET’S KEEP IN TOUCH', title1: 'The stories continue', title2: 'outside the workshop.', text: 'New pieces, details and a glimpse of the creative process.', whatsapp: 'Message us on WhatsApp', email: 'Send us an email' },
  footer: { collection: 'Collection', terms: 'Terms of sale', privacy: 'Privacy', shipping: 'Shipping & returns', instagram: 'Instagram', workshop: 'Workshop access', rights: '© {year} Úrsula Alcaíno · Orfebrería', payments: 'Payments with PayPal and Mercado Pago', made: 'MADE WITH INTENTION' },
  piece: {
    breadcrumb: 'Breadcrumb', details: 'Details', availability: 'Availability', inStock: 'Available', soldOut: 'Sold out', onRequest: 'Made to order', sold: 'Sold', gallery: 'Gallery piece', unconfirmed: 'To be confirmed',
    addToBag: 'Add to bag', viewBag: 'View my bag', consult: 'Ask about this piece', lessQty: 'Decrease quantity', moreQty: 'Increase quantity', photo: 'View photo {n}', shippingNote: 'We ship from Chile worldwide. The exact cost for your country is shown before you pay.',
    related: 'You may also like', translationNote: '', priceIn: 'Price in {currency}',
  },
  bag: {
    title: 'Your bag ({count})', description: 'Small treasures you chose for yourself.', subtotal: 'Subtotal', shippingNote: 'Shipping is calculated for your country in the next step.', invalid: 'Adjust the quantities or remove pieces that are no longer available.',
    continue: 'Continue to checkout', emptyTitle: 'Your next piece is waiting.', emptyText: 'Explore the collection and save your favorites here.', discover: 'Discover the pieces', unavailable: 'Piece unavailable', removeIt: 'Remove this piece',
    removeOne: 'Remove one unit of {name}', addOne: 'Add one unit of {name}', delete: 'Remove {name} from the bag', added: '{name} was added to your bag.', maxed: 'You already have all the available units in your bag.', secure: 'Secure payment with PayPal or Mercado Pago',
  },
  checkout: {
    title: 'One step closer', description: 'Complete your details to receive your order.', stepData: '01 / YOUR DETAILS', stepShipping: '02 / SHIPPING', stepPayment: '03 / PAYMENT METHOD',
    name: 'Full name', email: 'Email', phone: 'Phone (optional)', country: 'Destination country', region: 'State / Region', city: 'City', address: 'Address', postal: 'Postal code', notes: 'Delivery notes (optional)',
    emailHelp: 'Your confirmation and tracking will be sent here.', shippingTo: 'Shipping to {country} · {eta}', shippingUnavailable: 'We do not ship to that country yet.', shippingCost: 'Shipping', total: 'Total',
    methodMp: 'Mercado Pago', methodMpText: 'Cards, debit and bank transfer · Chilean pesos (Chile shipping only)', methodPp: 'PayPal', methodPpText: 'International cards or PayPal balance · Charged in US dollars (USD)', methodDemo: 'Test payment', methodDemoText: 'Simulator: no money is charged',
    noMethods: 'Payments are not yet enabled in this shop.', summary: 'YOUR SELECTION', rateNote: 'PayPal charges in US dollars (USD) at the shop’s exchange rate: 1 USD = {rate} CLP.', payWith: 'Pay with {method}', processing: 'Redirecting to payment…', secure: 'You will be taken to {method}’s secure site. We never store card data.',
    error: 'We could not connect. Please try again.', qty: '{name} × {qty}',
  },
  order: {
    title: 'Your order #{number}', paid: 'We received your payment. Thank you!', paidText: 'Your order is confirmed. We will email you the details and let you know when it ships.',
    pending: 'We are waiting for the payment confirmation', pendingText: 'If you already paid, this page will update by itself. If you closed the payment before finishing, you can resume it.',
    failed: 'The payment was not completed', failedText: 'You were not charged. Your pieces are still in your bag so you can try again.', cancelled: 'Order cancelled', cancelledText: 'This order was cancelled. You were not charged.',
    expired: 'The reservation expired', expiredText: 'The reservation time ran out before payment arrived. Go back to your bag to try again.', shipped: 'Your order is on its way', shippedText: 'We shipped your order.', delivered: 'Order delivered', deliveredText: 'We hope you enjoy your jewelry.', refunded: 'Order refunded', refundedText: 'The payment for this order was refunded.',
    total: 'Total', shipping: 'Shipping', items: 'Pieces', retry: 'Resume payment', backToShop: 'Keep exploring', backToBag: 'Back to the bag', tracking: 'Tracking', demoTitle: 'Payment simulator', demoText: 'The shop is under review: choose the result you want to test. No money is charged.', demoApproved: 'Approve payment', demoPending: 'Leave pending', demoRejected: 'Reject payment', notFound: 'We could not find this order.',
  },
  legal: { terms: 'Terms of sale', privacy: 'Privacy policy', shipping: 'Shipping and returns', empty: 'This text will be published soon.', contact: 'Contact' },
  notFound: { title: 'We could not find this page.', text: 'Maybe the piece you were looking for already found its owner. Go back to the collection.', cta: 'Back to the shop' },
};

export const dictionaries: Record<Locale, Dictionary> = { es, en };
export const getDictionary = (locale: Locale) => dictionaries[locale];
export const fmt = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
