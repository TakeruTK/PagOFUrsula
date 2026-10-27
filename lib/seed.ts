import { slugify, type Piece, type Settings } from './pieces';

const policiesEs = {
  terms: `Condiciones de las consultas y compras

Las joyas de este sitio son creadas por Ursula Alcaino · Orfebrería. La mayoría son piezas únicas y no se pueden reproducir de forma idéntica.

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

The jewelry on this site is made by Ursula Alcaino · Orfebrería. Most pieces are one of a kind and cannot be reproduced identically.

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
const policiesPt = {
  terms: `Condições para consultas e compras

As joias deste site são criadas por Ursula Alcaino · Orfebrería. A maioria são peças únicas e não podem ser reproduzidas de forma idêntica.

Como comprar. Neste site não há pagamento online: se uma peça lhe interessa, escreva-nos pelo WhatsApp, Instagram ou e-mail. Confirmaremos a disponibilidade, o valor, a forma de pagamento e o envio antes de fechar a compra.

Disponibilidade. Cada peça pode estar disponível, sob encomenda ou vendida. A disponibilidade publicada pode mudar sem aviso enquanto conversamos com você.

Preços. Quando são exibidos, são valores de referência em pesos chilenos (CLP) e são confirmados no momento da compra.

Peças artesanais. Por serem feitas à mão, podem existir pequenas diferenças em relação às fotografias.

Direitos do consumidor. Estas condições não limitam os direitos que a lei do seu país de residência lhe concede.`,
  privacy: `Política de privacidade

Este site não coleta dados pessoais por meio de formulários nem de contas de usuário.

Quando você nos escreve pelo WhatsApp, Instagram ou e-mail, recebemos os dados que você decide compartilhar (por exemplo, seu nome, seu número ou seu endereço de entrega) e os usamos apenas para lhe responder e gerenciar sua compra. Não os vendemos nem os compartilhamos com terceiros, exceto os necessários para enviar o seu pedido.

Os serviços de mensagens (WhatsApp, Instagram, seu provedor de e-mail) têm suas próprias políticas de privacidade.

Você pode pedir para acessar, corrigir ou excluir seus dados escrevendo para o e-mail de contato da loja.`,
};
const policiesFr = {
  terms: `Conditions des demandes et des achats

Les bijoux de ce site sont créés par Ursula Alcaino · Orfebrería. La plupart sont des pièces uniques qui ne peuvent pas être reproduites à l'identique.

Comment acheter. Il n'y a pas de paiement en ligne sur ce site : si une pièce vous intéresse, écrivez-nous sur WhatsApp, Instagram ou par e-mail. Nous vous confirmerons la disponibilité, le prix, le mode de paiement et la livraison avant de conclure l'achat.

Disponibilité. Chaque pièce peut être disponible, sur commande ou vendue. La disponibilité affichée peut changer sans préavis pendant que nous échangeons avec vous.

Prix. Lorsqu'ils sont affichés, ce sont des prix indicatifs en pesos chiliens (CLP), confirmés au moment de l'achat.

Pièces artisanales. Étant faites à la main, de légères différences avec les photographies sont possibles.

Droits du consommateur. Ces conditions ne limitent pas les droits que vous accorde la loi de votre pays de résidence.`,
  privacy: `Politique de confidentialité

Ce site ne collecte pas de données personnelles au moyen de formulaires ou de comptes d'utilisateur.

Lorsque vous nous écrivez sur WhatsApp, Instagram ou par e-mail, nous recevons les données que vous choisissez de partager (par exemple votre nom, votre numéro ou votre adresse de livraison) et nous les utilisons uniquement pour vous répondre et gérer votre achat. Nous ne les vendons pas et ne les partageons pas avec des tiers, sauf ceux nécessaires à l'expédition de votre commande.

Les services de messagerie (WhatsApp, Instagram, votre fournisseur de messagerie) ont leurs propres politiques de confidentialité.

Vous pouvez nous demander d'accéder à vos données, de les corriger ou de les supprimer en écrivant à l'adresse e-mail de contact de la boutique.`,
};

const initialCategories: Settings['categories'] = [
  { es: 'Aros', en: 'Earrings', pt: 'Brincos', fr: 'Boucles d’oreilles' },
  { es: 'Anillos', en: 'Rings', pt: 'Anéis', fr: 'Bagues' },
  { es: 'Collares', en: 'Necklaces', pt: 'Colares', fr: 'Colliers' },
  { es: 'Pulseras', en: 'Bracelets', pt: 'Pulseiras', fr: 'Bracelets' },
  { es: 'Otros', en: 'Other', pt: 'Outros', fr: 'Autres' },
];
export const initialSettings: Settings = {
  categories: initialCategories,
  headline: 'Joyas creadas desde la naturaleza, la materia y el color.',
  introduction: 'Formas orgánicas, destellos de color y pequeños detalles que hacen la diferencia. Descubre el universo de Ursula Alcaino.',
  story: 'Una curva, una textura, un reflejo. El trabajo de Ursula Alcaino invita a mirar de cerca: piezas donde las formas de la naturaleza se encuentran con la expresión del metal. Un universo de joyas con carácter propio, para acompañar tu manera de ser.',
  instagram: 'https://www.instagram.com/ursulaalcaino/',
  collectionTitle: 'Piezas',
  en: {
    headline: 'Jewelry created from nature, matter and color.',
    introduction: 'Organic shapes, flashes of color and small details that make the difference. Discover the world of Ursula Alcaino.',
    story: 'A curve, a texture, a reflection. Ursula Alcaino’s work invites you to look closely: pieces where the shapes of nature meet the expression of metal. A universe of jewelry with a character of its own, to accompany the way you are.',
    collectionTitle: 'Pieces',
  },
  pt: {
    headline: 'Joias criadas a partir da natureza, da matéria e da cor.',
    introduction: 'Formas orgânicas, brilhos de cor e pequenos detalhes que fazem a diferença. Descubra o universo de Ursula Alcaino.',
    story: 'Uma curva, uma textura, um reflexo. O trabalho de Ursula Alcaino convida a olhar de perto: peças em que as formas da natureza encontram a expressão do metal. Um universo de joias com personalidade própria, para acompanhar o seu jeito de ser.',
    collectionTitle: 'Peças',
  },
  fr: {
    headline: 'Des bijoux nés de la nature, de la matière et de la couleur.',
    introduction: 'Des formes organiques, des éclats de couleur et de petits détails qui font la différence. Découvrez l’univers d’Ursula Alcaino.',
    story: 'Une courbe, une texture, un reflet. Le travail d’Ursula Alcaino invite à regarder de près : des pièces où les formes de la nature rencontrent l’expression du métal. Un univers de bijoux au caractère affirmé, pour accompagner votre façon d’être.',
    collectionTitle: 'Pièces',
  },
  facebook: '',
  tiktok: '',
  contactEmail: '',
  whatsapp: '',
  showPrices: false,
  images: { hero: [], about: null },
  policies: { es: policiesEs, en: policiesEn, pt: policiesPt, fr: policiesFr },
};

type Row = { es: string; en: string; pt: string; fr: string; category: string; price: number; url: string; crop: NonNullable<Piece['images'][number]['crop']> };
const references: Row[] = [
  { es: 'Aros Sendero', en: 'Sendero earrings', pt: 'Brincos Sendero', fr: 'Boucles d’oreilles Sendero', category: 'Aros', price: 38900, url: 'ursula', crop: [57, 182, 364, 363, 475, 621] },
  { es: 'Aros Brisa verde', en: 'Green Breeze earrings', pt: 'Brincos Brisa verde', fr: 'Boucles d’oreilles Brise verte', category: 'Aros', price: 32900, url: 'color', crop: [583, 10, 274, 364, 1443, 754] },
  { es: 'Aros Órbita', en: 'Orbit earrings', pt: 'Brincos Órbita', fr: 'Boucles d’oreilles Orbite', category: 'Aros', price: 35900, url: 'silver', crop: [51, 397, 270, 354, 1506, 761] },
  { es: 'Anillo Bosque', en: 'Forest ring', pt: 'Anel Bosque', fr: 'Bague Forêt', category: 'Anillos', price: 42900, url: 'color', crop: [1145, 12, 190, 237, 1443, 754] },
  { es: 'Aros Mariposa', en: 'Butterfly earrings', pt: 'Brincos Borboleta', fr: 'Boucles d’oreilles Papillon', category: 'Aros', price: 36900, url: 'nature', crop: [1215, 13, 195, 228, 1433, 756] },
  { es: 'Aros Gotas de noche', en: 'Night Drops earrings', pt: 'Brincos Gotas de noite', fr: 'Boucles d’oreilles Gouttes de nuit', category: 'Aros', price: 29900, url: 'silver', crop: [52, 27, 267, 353, 1506, 761] },
  { es: 'Anillo Violeta', en: 'Violet ring', pt: 'Anel Violeta', fr: 'Bague Violette', category: 'Anillos', price: 44900, url: 'color', crop: [865, 388, 269, 235, 1443, 754] },
  { es: 'Colgante Atrapasueños', en: 'Dreamcatcher pendant', pt: 'Pingente Apanhador de sonhos', fr: 'Pendentif Attrape-rêves', category: 'Collares', price: 39900, url: 'nature', crop: [936, 377, 192, 356, 1433, 756] },
];
const starterText = {
  es: 'Una pieza del universo de Ursula Alcaino, hecha a mano: formas que nacen de la naturaleza, metal y destellos de color. Escríbenos para conocer su disponibilidad y su historia.',
  en: 'A handmade piece from Ursula Alcaino’s world: shapes born from nature, metal and flashes of color. Write to us to learn about its availability and story.',
  pt: 'Uma peça do universo de Ursula Alcaino, feita à mão: formas que nascem da natureza, metal e brilhos de cor. Escreva-nos para conhecer a disponibilidade e a história.',
  fr: 'Une pièce de l’univers d’Ursula Alcaino, faite à la main : des formes nées de la nature, du métal et des éclats de couleur. Écrivez-nous pour connaître sa disponibilité et son histoire.',
};
const translated = (name: string, language: 'en' | 'pt' | 'fr') => ({
  name, description: starterText[language], size: '',
  material: { en: 'To be confirmed', pt: 'A confirmar', fr: 'À confirmer' }[language],
  caption: { en: 'Work by Ursula Alcaino', pt: 'Trabalho de Ursula Alcaino', fr: 'Travail d’Ursula Alcaino' }[language],
});

export const initialPieces: Piece[] = references.map((r, index) => ({
  id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
  slug: slugify(r.es),
  name: r.es, category: r.category, price: r.price, status: 'Publicado', availability: 'Disponible', order: index, featured: index < 4,
  description: starterText.es,
  material: 'Por confirmar',
  size: '',
  images: [{ url: `/references/${r.url}.png`, caption: 'Trabajo de Ursula Alcaino', crop: r.crop }],
  translations: { en: translated(r.en, 'en'), pt: translated(r.pt, 'pt'), fr: translated(r.fr, 'fr') },
}));
