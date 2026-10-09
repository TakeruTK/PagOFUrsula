import { slugify, type Piece, type Settings } from './pieces';

const policiesEs = {
  terms: `Condiciones de compra de Úrsula Alcaíno · Orfebrería

1. Quién vende. Las joyas de esta tienda son creadas y vendidas por Úrsula Alcaíno · Orfebrería. Puedes escribirnos al correo de contacto publicado en el sitio.

2. Precios y moneda. Los precios base se expresan en pesos chilenos (CLP). Al pagar con PayPal el importe se convierte a dólares estadounidenses (USD) con el tipo de cambio que se muestra en la tienda. El total, con el envío, aparece antes de pagar.

3. Medios de pago. Mercado Pago (compras con despacho en Chile) y PayPal (todos los países). No almacenamos datos de tarjetas: el pago se realiza en el sitio de cada proveedor.

4. Piezas artesanales. Cada joya se elabora a mano; pueden existir pequeñas diferencias respecto de las fotografías.

5. Confirmación. Tu pedido queda confirmado cuando el proveedor de pagos aprueba el pago. Te enviaremos un correo con el detalle.

6. Derechos del consumidor. Esta política no limita los derechos que te otorga la ley de tu país de residencia.`,
  privacy: `Política de privacidad

Datos que recibimos. Nombre, correo electrónico, teléfono (opcional) y dirección de envío, solo para gestionar tu pedido y contactarte sobre él.

Pagos. Los pagos son procesados por Mercado Pago o PayPal. Nosotros no vemos ni guardamos los datos de tu tarjeta.

Uso. Usamos tus datos únicamente para preparar, enviar y dar soporte a tu compra. No los vendemos ni los compartimos con terceros, salvo con quienes sean necesarios para cobrar y despachar tu pedido.

Conservación. Conservamos los pedidos el tiempo necesario para cumplir obligaciones contables y de garantía.

Tus derechos. Puedes pedirnos acceder a tus datos, corregirlos o eliminarlos escribiendo al correo de contacto de la tienda.`,
  shipping: `Envíos y devoluciones

Envíos. Despachamos a Chile, Latinoamérica y el resto del mundo. El costo y el plazo estimado según tu país se muestran antes de pagar. Los plazos son estimados y pueden variar por aduana o por el transportista.

Aduanas e impuestos. En envíos internacionales, los impuestos o derechos de importación del país de destino pueden corresponder al comprador.

Cambios y devoluciones. Si tu joya llega dañada o distinta de lo que compraste, escríbenos dentro de los primeros días de recibirla, con fotos, y buscaremos la mejor solución. Las compras a distancia pueden tener derecho de retracto según la ley de tu país.

Seguimiento. Cuando tu pedido sea despachado te enviaremos el código de seguimiento si el servicio lo incluye.`,
};
const policiesEn = {
  terms: `Terms of sale · Úrsula Alcaíno · Orfebrería

1. Seller. The jewelry in this shop is made and sold by Úrsula Alcaíno · Orfebrería. You can write to us at the contact email published on the site.

2. Prices and currency. Base prices are in Chilean pesos (CLP). When paying with PayPal the amount is converted to US dollars (USD) using the exchange rate shown in the shop. The total, including shipping, is shown before you pay.

3. Payment methods. Mercado Pago (orders shipped within Chile) and PayPal (all countries). We never store card data: payment happens on each provider's own site.

4. Handmade pieces. Every piece is made by hand, so small differences from the photographs may occur.

5. Confirmation. Your order is confirmed once the payment provider approves the payment. We will email you the details.

6. Consumer rights. These terms do not limit the rights granted by the law of your country of residence.`,
  privacy: `Privacy policy

Data we receive. Name, email, phone number (optional) and shipping address, only to handle your order and contact you about it.

Payments. Payments are processed by Mercado Pago or PayPal. We never see or store your card details.

Use. We use your data only to prepare, ship and support your purchase. We do not sell it or share it with third parties, except those needed to charge and deliver your order.

Retention. We keep orders for as long as needed to meet accounting and warranty obligations.

Your rights. You can ask us to access, correct or delete your data by writing to the shop's contact email.`,
  shipping: `Shipping and returns

Shipping. We ship to Chile, Latin America and the rest of the world. The cost and estimated delivery time for your country are shown before you pay. Delivery times are estimates and may vary because of customs or the carrier.

Customs and taxes. For international shipments, import taxes or duties of the destination country may be the buyer's responsibility.

Exchanges and returns. If your jewelry arrives damaged or different from what you bought, write to us within a few days of receiving it, with photos, and we will find the best solution. Distance purchases may carry a right of withdrawal under the law of your country.

Tracking. When your order ships we will email you the tracking code if the service includes one.`,
};

export const initialSettings: Settings = {
  headline: 'La naturaleza, hecha joya.',
  introduction: 'Formas orgánicas, destellos de color y pequeños detalles que hacen la diferencia. Descubre el universo de Úrsula Alcaíno.',
  story: 'Una curva, una textura, un reflejo. El trabajo de Úrsula Alcaíno invita a mirar de cerca: piezas donde las formas de la naturaleza se encuentran con la expresión del metal. Un universo de joyas con carácter propio, para acompañar tu manera de ser.',
  instagram: 'https://www.instagram.com/ursulaalcaino/',
  collectionTitle: 'Encuentra tu próxima joya.',
  en: {
    headline: 'Nature, made into jewelry.',
    introduction: 'Organic shapes, flashes of color and small details that make the difference. Discover the world of Úrsula Alcaíno.',
    story: 'A curve, a texture, a reflection. Úrsula Alcaíno’s work invites you to look closely: pieces where the shapes of nature meet the expression of metal. A universe of jewelry with a character of its own, to accompany the way you are.',
    collectionTitle: 'Find your next piece of jewelry.',
  },
  contactEmail: '',
  whatsapp: '',
  usdRate: 950,
  shipping: {
    chile: { enabled: true, cost: 4500, eta: '2 a 5 días hábiles', etaEn: '2 to 5 business days' },
    latam: { enabled: true, cost: 15000, eta: '7 a 15 días hábiles', etaEn: '7 to 15 business days' },
    world: { enabled: true, cost: 25000, eta: '10 a 25 días hábiles', etaEn: '10 to 25 business days' },
  },
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
  name, category, price, kind: 'Producto', status: 'Publicado', availability: 'Disponible', stock: 5, order: index, featured: index < 4,
  description: 'Una pieza del universo creativo de Úrsula Alcaíno. Fotografía tomada de las referencias compartidas. Nombre y precio de demostración; materiales, medidas y disponibilidad pendientes de confirmar con la autora.',
  material: 'Detalles por confirmar con la autora',
  images: [{ url: `/references/${url}.png`, caption: 'Trabajo de Úrsula Alcaíno · fotografía de referencia', crop }],
  translations: { en: { name: nameEn, description: 'A piece from the creative world of Úrsula Alcaíno. Photograph taken from the shared references. Placeholder name and price; materials, measurements and availability to be confirmed with the artist.', material: 'Details to be confirmed with the artist', caption: 'Work by Úrsula Alcaíno · reference photograph' } },
}));
