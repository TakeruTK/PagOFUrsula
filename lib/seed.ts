import { slugify, type Piece, type Settings } from './pieces';

const policiesEs = {
  terms: `Condiciones de las consultas y compras

Las joyas de este sitio son creadas por Úrsula Alcaíno · Orfebrería. La mayoría son piezas únicas y no se pueden reproducir de forma idéntica.

Cómo comprar. En este sitio no se paga en línea: si una pieza te interesa, escríbenos por WhatsApp, Instagram o correo. Te confirmaremos su disponibilidad, el valor, la forma de pago y el envío antes de cerrar la compra.

Disponibilidad. Cada pieza puede estar disponible, por encargo o vendida. La disponibilidad publicada puede cambiar sin aviso mientras conversamos contigo.

Precios. Cuando se muestran, son referenciales en pesos chilenos (CLP) y se confirman al momento de la compra.

Piezas artesanales. Al estar hechas a mano, pueden existir pequeñas diferencias respecto de las fotografías.

Derechos del consumidor. Estas condiciones no limitan los derechos que te otorga la ley de tu país de residencia.`,
  privacy: `Política de privacidad

Este sitio no recopila datos personales mediante formularios ni cuentas de usuario.

Cuando nos escribes por WhatsApp, Instagram o correo, recibimos los datos que tú decides compartir (por ejemplo tu nombre, tu número o tu dirección de envío) y los usamos solo para responderte y gestionar tu compra. No los vendemos ni los compartimos con terceros, salvo los necesarios para despachar tu pedido.

Los servicios de mensajería (WhatsApp, Instagram, tu proveedor de correo) tienen sus propias políticas de privacidad.

Puedes pedirnos acceder a tus datos, corregirlos o eliminarlos escribiéndonos al correo de contacto de la tienda.`,
};
const policiesEn = {
  terms: `Terms for inquiries and purchases

The jewelry on this site is made by Úrsula Alcaíno · Orfebrería. Most pieces are one of a kind and cannot be reproduced identically.

How to buy. There is no online payment on this site: if a piece interests you, write to us on WhatsApp, Instagram or by email. We will confirm availability, price, payment method and shipping before closing the purchase.

Availability. Each piece may be available, made to order or sold. Published availability may change without notice while we talk with you.

Prices. When shown, they are reference prices in Chilean pesos (CLP) and are confirmed at the time of purchase.

Handmade pieces. Because they are made by hand, small differences from the photographs may occur.

Consumer rights. These terms do not limit the rights granted by the law of your country of residence.`,
  privacy: `Privacy policy

This site does not collect personal data through forms or user accounts.

When you write to us on WhatsApp, Instagram or by email, we receive the data you choose to share (for example your name, your number or your shipping address) and use it only to answer you and handle your purchase. We do not sell it or share it with third parties, except those needed to ship your order.

Messaging services (WhatsApp, Instagram, your email provider) have their own privacy policies.

You can ask us to access, correct or delete your data by writing to the shop's contact email.`,
};

export const initialSettings: Settings = {
  headline: 'Joyas creadas desde la naturaleza, la materia y el color.',
  introduction: 'Formas orgánicas, destellos de color y pequeños detalles que hacen la diferencia. Descubre el universo de Úrsula Alcaíno.',
  story: 'Una curva, una textura, un reflejo. El trabajo de Úrsula Alcaíno invita a mirar de cerca: piezas donde las formas de la naturaleza se encuentran con la expresión del metal. Un universo de joyas con carácter propio, para acompañar tu manera de ser.',
  instagram: 'https://www.instagram.com/ursulaalcaino/',
  collectionTitle: 'Piezas',
  en: {
    headline: 'Jewelry created from nature, matter and color.',
    introduction: 'Organic shapes, flashes of color and small details that make the difference. Discover the world of Úrsula Alcaíno.',
    story: 'A curve, a texture, a reflection. Úrsula Alcaíno’s work invites you to look closely: pieces where the shapes of nature meet the expression of metal. A universe of jewelry with a character of its own, to accompany the way you are.',
    collectionTitle: 'Pieces',
  },
  contactEmail: '',
  whatsapp: '',
  showPrices: false,
  images: { hero: [], about: null },
  policies: { es: policiesEs, en: policiesEn },
};

const references: [string, string, Piece['category'], number, string, NonNullable<Piece['images'][number]['crop']>][] = [
  ['Aros Sendero', 'Sendero earrings', 'Aros', 38900, 'ursula', [57, 182, 364, 363, 475, 621]],
  ['Aros Brisa verde', 'Green Breeze earrings', 'Aros', 32900, 'color', [583, 10, 274, 364, 1443, 754]],
  ['Aros Órbita', 'Orbit earrings', 'Aros', 35900, 'silver', [51, 397, 270, 354, 1506, 761]],
  ['Anillo Bosque', 'Forest ring', 'Anillos', 42900, 'color', [1145, 12, 190, 237, 1443, 754]],
  ['Aros Mariposa', 'Butterfly earrings', 'Aros', 36900, 'nature', [1215, 13, 195, 228, 1433, 756]],
  ['Aros Gotas de noche', 'Night Drops earrings', 'Aros', 29900, 'silver', [52, 27, 267, 353, 1506, 761]],
  ['Anillo Violeta', 'Violet ring', 'Anillos', 44900, 'color', [865, 388, 269, 235, 1443, 754]],
  ['Colgante Atrapasueños', 'Dreamcatcher pendant', 'Collares', 39900, 'nature', [936, 377, 192, 356, 1433, 756]],
];
export const initialPieces: Piece[] = references.map(([name, nameEn, category, price, url, crop], index) => ({
  id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  slug: slugify(name),
  name, category, price, status: 'Publicado', availability: 'Disponible', order: index, featured: index < 4,
  description: 'Una pieza del universo creativo de Úrsula Alcaíno. Fotografía tomada de las referencias compartidas. Nombre y detalles de ejemplo; materiales y medidas pendientes de confirmar con la autora.',
  material: 'Por confirmar',
  images: [{ url: `/references/${url}.png`, caption: 'Trabajo de Úrsula Alcaíno', crop }],
  translations: { en: { name: nameEn, description: 'A piece from the creative world of Úrsula Alcaíno. Photograph taken from the shared references. Placeholder name and details; materials and measurements to be confirmed with the artist.', material: 'To be confirmed', caption: 'Work by Úrsula Alcaíno' } },
}));
