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
  piece: { breadcrumb: 'Migas de pan', details: 'Materiales y técnica', size: 'Tamaño', availability: 'Disponibilidad', unconfirmed: 'Por confirmar', ask: 'CONSULTAR POR WHATSAPP', askEmail: 'CONSULTAR POR CORREO', askInstagram: 'ESCRIBIR POR INSTAGRAM', unique: 'Pieza única o de tirada muy limitada. Escríbenos para confirmar su disponibilidad, valor y envío.', whatsappMessage: 'Hola Ursula, me interesa la pieza “{name}” ({url}). ¿Está disponible?', emailSubject: 'Consulta por la pieza {name}', related: 'Otras piezas', photo: 'Ver fotografía {n}', price: 'Valor referencial' },
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
  mail: { title: 'Escríbenos un correo', text: 'Si tu programa de correo no se abrió, copia nuestra dirección o redacta el mensaje desde tu correo en línea.', copy: 'Copiar correo', copied: '¡Copiado!', close: 'Cerrar' },
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
  piece: { breadcrumb: 'Breadcrumb', details: 'Materials and technique', size: 'Size', availability: 'Availability', unconfirmed: 'To be confirmed', ask: 'ASK ON WHATSAPP', askEmail: 'ASK BY EMAIL', askInstagram: 'MESSAGE ON INSTAGRAM', unique: 'One-of-a-kind or very limited piece. Write to us to confirm availability, price and shipping.', whatsappMessage: 'Hello Ursula, I am interested in the piece “{name}” ({url}). Is it available?', emailSubject: 'Inquiry about {name}', related: 'More pieces', photo: 'View photo {n}', price: 'Reference price' },
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
  mail: { title: 'Send us an email', text: 'If your mail program did not open, copy our address or write the message from your webmail.', copy: 'Copy email', copied: 'Copied!', close: 'Close' },
  footer: { email: 'Email', follow: 'Follow and write to us', terms: 'Terms', privacy: 'Privacy', workshop: 'Workshop access', rights: '© {year} Ursula Alcaino · Orfebrería' },
  legal: { terms: 'Terms of sale', privacy: 'Privacy policy', empty: 'This text will be published soon.', contact: 'Contact' },
  notFound: { title: 'We could not find this page.', text: 'Maybe the piece you were looking for already found its owner. Go back to the pieces.', cta: 'Back to home' },
};


const pt: Dictionary = {
  site: { name: 'Ursula Alcaino · Orfebrería' },
  meta: {
    homeTitle: 'Ursula Alcaino · Joias de autor feitas à mão no Chile',
    homeDescription: 'O luxo do irrepetível: joias de autor criadas à mão para quem encontra beleza no singular e significado no extraordinário. Escreva-nos para conseguir a sua peça.',
    notFoundTitle: 'Página não encontrada',
  },
  nav: { collection: 'Coleção', about: 'Sobre', contact: 'Contato', language: 'Idioma', menu: 'Abrir menu', menuTitle: 'Menu', close: 'Fechar', home: 'Início' },
  hero: { kicker: 'JOIAS DE AUTOR', scroll: 'Descubra' },
  about: {
    eyebrow: 'POR TRÁS DE CADA JOIA, UMA HISTÓRIA',
    title: 'Minha história como ourives',
    pillars: [
      { title: 'VINTE ANOS DE OFÍCIO', text: 'Vinte anos criando, aprendendo e descobrindo novas formas de expressar o meu olhar.' },
      { title: 'O IRREPETÍVEL', text: 'Joias de autor criadas à mão para quem encontra beleza no singular.' },
      { title: 'PENSADAS PARA CADA MULHER', text: 'Cada lóbulo é diferente, cada mulher tem suas próprias necessidades e seu próprio ritmo de vida.' },
      { title: 'UM OLHAR PRÓPRIO', text: 'Uma inquietação da juventude, o fecho dos brincos, que se tornou a minha maneira de entender a joalheria.' },
    ],
  },
  collection: { eyebrow: 'PEÇAS ÚNICAS', all: 'Todas', filterLabel: 'Filtrar por categoria', emptyTitle: 'Em breve haverá novas peças.', emptyText: 'Enquanto isso, acompanhe o processo no Instagram.', available: 'Disponível', onRequest: 'Sob encomenda', sold: 'Vendida', view: 'Ver {name}', price: 'Valor de referência {price}' },
  instagram: { text: 'Você pode acompanhar meu processo, ver novas peças e próximos projetos no Instagram.', button: 'INSTAGRAM' },
  cta: { title: 'Interessou-se por alguma peça ou tem uma ideia que combine com o meu estilo?', whatsapp: 'VAMOS CONVERSAR NO WHATSAPP', email: 'ESCREVA-NOS UM E-MAIL', note: 'Aqui não há pagamento online: conversamos, confirmamos a disponibilidade e combinamos o pagamento e o envio.', whatsappMessage: 'Olá Ursula, gostaria de conversar sobre as suas joias.' },
  piece: { breadcrumb: 'Trilha de navegação', details: 'Materiais e técnica', size: 'Tamanho', availability: 'Disponibilidade', unconfirmed: 'A confirmar', ask: 'CONSULTAR NO WHATSAPP', askEmail: 'CONSULTAR POR E-MAIL', askInstagram: 'ESCREVER NO INSTAGRAM', unique: 'Peça única ou de tiragem muito limitada. Escreva-nos para confirmar disponibilidade, valor e envio.', whatsappMessage: 'Olá Ursula, tenho interesse na peça “{name}” ({url}). Está disponível?', emailSubject: 'Consulta sobre a peça {name}', related: 'Outras peças', photo: 'Ver fotografia {n}', price: 'Valor de referência' },
  home: { aboutLink: 'Leia a minha história', featured: 'Peças em destaque', all: 'VER TODA A COLEÇÃO', contactLink: 'IR PARA CONTATO' },
  pages: {
    collection: { metaTitle: 'Coleção de joias artesanais', metaDescription: 'Brincos, anéis e pingentes feitos à mão por Ursula Alcaino. Peças únicas ou de tiragem muito limitada, inspiradas na natureza, no metal e na cor.', intro: 'Brincos, anéis e pingentes feitos à mão. Cada peça é única ou de tiragem muito limitada.' },
    about: { metaTitle: 'Minha história como ourives', metaDescription: 'Vinte anos criando joias de autor: a história de Ursula Alcaino, ourives, e como nasceu o seu olhar sobre a joalheria.', imageAlt: 'Detalhe de uma joia de Ursula Alcaino', more: 'VER A COLEÇÃO' },
    contact: {
      title: 'Vamos conversar', metaTitle: 'Contato', metaDescription: 'Escreva para Ursula Alcaino pelo WhatsApp, e-mail ou Instagram para consultar uma peça ou conversar sobre uma ideia.',
      intro: 'Interessou-se por alguma peça ou tem uma ideia que combine com o meu estilo? Escreva-me e conversamos.',
      stepsTitle: 'Como conseguir a sua peça',
      steps: [
        { title: 'Escolha', text: 'Percorra a coleção e escolha a peça que chamar a sua atenção.' },
        { title: 'Escreva-nos', text: 'Conte-nos qual lhe interessa. Confirmamos a disponibilidade e o valor.' },
        { title: 'Combinamos', text: 'Combinamos juntos a forma de pagamento e o envio para o seu país.' },
      ],
      channels: 'Canais de contato', whatsapp: 'WhatsApp', whatsappText: 'A forma mais direta de consultar uma peça.', email: 'E-mail', emailText: 'Para consultas mais longas ou ideias para conversar.', instagram: 'Instagram', instagramText: 'Acompanhe o processo e envie-nos uma mensagem direta.', facebook: 'Facebook', facebookText: 'Novidades e mensagens pela nossa página.', tiktok: 'TikTok', tiktokText: 'Veja o processo das peças em vídeo.', open: 'ABRIR',
    },
  },
  mail: { title: 'Escreva-nos um e-mail', text: 'Se o seu programa de e-mail não abriu, copie o nosso endereço ou escreva a mensagem pelo seu e-mail online.', copy: 'Copiar e-mail', copied: 'Copiado!', close: 'Fechar' },
  footer: { email: 'E-mail', follow: 'Siga-nos e escreva-nos', terms: 'Condições', privacy: 'Privacidade', workshop: 'Acesso ao ateliê', rights: '© {year} Ursula Alcaino · Orfebrería' },
  legal: { terms: 'Condições de compra', privacy: 'Política de privacidade', empty: 'Este texto será publicado em breve.', contact: 'Contato' },
  notFound: { title: 'Não encontramos esta página.', text: 'Talvez a joia que você procura já tenha encontrado a sua dona. Volte às peças.', cta: 'Voltar ao início' },
};

const fr: Dictionary = {
  site: { name: 'Ursula Alcaino · Orfebrería' },
  meta: {
    homeTitle: 'Ursula Alcaino · Bijoux d’auteur faits main au Chili',
    homeDescription: 'Le luxe de ce qui ne se répète pas : des bijoux d’auteur façonnés à la main pour celles et ceux qui trouvent la beauté dans le singulier. Écrivez-nous pour obtenir votre pièce.',
    notFoundTitle: 'Page introuvable',
  },
  nav: { collection: 'Collection', about: 'À propos', contact: 'Contact', language: 'Langue', menu: 'Ouvrir le menu', menuTitle: 'Menu', close: 'Fermer', home: 'Accueil' },
  hero: { kicker: 'BIJOUX D’AUTEUR', scroll: 'Découvrir' },
  about: {
    eyebrow: 'DERRIÈRE CHAQUE BIJOU, UNE HISTOIRE',
    title: 'Mon histoire d’orfèvre',
    pillars: [
      { title: 'VINGT ANS DE MÉTIER', text: 'Vingt ans à créer, à apprendre et à découvrir de nouvelles façons d’exprimer mon regard.' },
      { title: 'CE QUI NE SE RÉPÈTE PAS', text: 'Des bijoux d’auteur faits à la main pour celles et ceux qui trouvent la beauté dans le singulier.' },
      { title: 'PENSÉS POUR CHAQUE FEMME', text: 'Chaque lobe est différent, chaque femme a ses propres besoins et son propre rythme de vie.' },
      { title: 'UN REGARD PERSONNEL', text: 'Une inquiétude de jeunesse, le crochet des boucles d’oreilles, devenue ma manière de concevoir la joaillerie.' },
    ],
  },
  collection: { eyebrow: 'PIÈCES UNIQUES', all: 'Toutes', filterLabel: 'Filtrer par catégorie', emptyTitle: 'De nouvelles pièces arrivent bientôt.', emptyText: 'En attendant, suivez le processus sur Instagram.', available: 'Disponible', onRequest: 'Sur commande', sold: 'Vendue', view: 'Voir {name}', price: 'Prix indicatif {price}' },
  instagram: { text: 'Vous pouvez suivre mon processus, découvrir les nouvelles pièces et les projets à venir sur Instagram.', button: 'INSTAGRAM' },
  cta: { title: 'Une pièce vous intéresse, ou vous avez une idée qui rejoint mon style ?', whatsapp: 'PARLONS-EN SUR WHATSAPP', email: 'ÉCRIVEZ-NOUS UN E-MAIL', note: 'Il n’y a pas de paiement en ligne ici : nous échangeons, confirmons la disponibilité et convenons ensemble du paiement et de la livraison.', whatsappMessage: 'Bonjour Ursula, j’aimerais échanger à propos de vos bijoux.' },
  piece: { breadcrumb: 'Fil d’Ariane', details: 'Matériaux et technique', size: 'Taille', availability: 'Disponibilité', unconfirmed: 'À confirmer', ask: 'DEMANDER SUR WHATSAPP', askEmail: 'DEMANDER PAR E-MAIL', askInstagram: 'ÉCRIRE SUR INSTAGRAM', unique: 'Pièce unique ou à très petite série. Écrivez-nous pour confirmer sa disponibilité, son prix et la livraison.', whatsappMessage: 'Bonjour Ursula, la pièce « {name} » ({url}) m’intéresse. Est-elle disponible ?', emailSubject: 'Demande à propos de la pièce {name}', related: 'Autres pièces', photo: 'Voir la photo {n}', price: 'Prix indicatif' },
  home: { aboutLink: 'Lire mon histoire', featured: 'Pièces à la une', all: 'VOIR TOUTE LA COLLECTION', contactLink: 'ALLER AU CONTACT' },
  pages: {
    collection: { metaTitle: 'Collection de bijoux faits main', metaDescription: 'Boucles d’oreilles, bagues et pendentifs faits main par Ursula Alcaino. Pièces uniques ou en très petite série, inspirées par la nature, le métal et la couleur.', intro: 'Boucles d’oreilles, bagues et pendentifs faits main. Chaque pièce est unique ou en très petite série.' },
    about: { metaTitle: 'Mon histoire d’orfèvre', metaDescription: 'Vingt ans de création de bijoux d’auteur : l’histoire d’Ursula Alcaino, orfèvre, et la naissance de son regard sur la joaillerie.', imageAlt: 'Détail d’un bijou d’Ursula Alcaino', more: 'VOIR LA COLLECTION' },
    contact: {
      title: 'Parlons-en', metaTitle: 'Contact', metaDescription: 'Écrivez à Ursula Alcaino sur WhatsApp, par e-mail ou sur Instagram pour vous renseigner sur une pièce ou partager une idée.',
      intro: 'Une pièce vous intéresse, ou vous avez une idée qui rejoint mon style ? Écrivez-moi et nous en parlons.',
      stepsTitle: 'Comment obtenir votre pièce',
      steps: [
        { title: 'Choisissez', text: 'Parcourez la collection et choisissez la pièce qui vous séduit.' },
        { title: 'Écrivez-nous', text: 'Dites-nous laquelle vous intéresse. Nous confirmons la disponibilité et le prix.' },
        { title: 'Nous convenons', text: 'Ensemble, nous fixons le mode de paiement et la livraison vers votre pays.' },
      ],
      channels: 'Moyens de contact', whatsapp: 'WhatsApp', whatsappText: 'Le moyen le plus direct de se renseigner sur une pièce.', email: 'E-mail', emailText: 'Pour les demandes plus longues ou les idées à partager.', instagram: 'Instagram', instagramText: 'Suivez le processus et envoyez-nous un message privé.', facebook: 'Facebook', facebookText: 'Actualités et messages depuis notre page.', tiktok: 'TikTok', tiktokText: 'Découvrez la création des pièces en vidéo.', open: 'OUVRIR',
    },
  },
  mail: { title: 'Écrivez-nous un e-mail', text: 'Si votre programme de messagerie ne s’est pas ouvert, copiez notre adresse ou rédigez le message depuis votre webmail.', copy: 'Copier l’adresse', copied: 'Copié !', close: 'Fermer' },
  footer: { email: 'E-mail', follow: 'Suivez-nous et écrivez-nous', terms: 'Conditions', privacy: 'Confidentialité', workshop: 'Accès à l’atelier', rights: '© {year} Ursula Alcaino · Orfebrería' },
  legal: { terms: 'Conditions d’achat', privacy: 'Politique de confidentialité', empty: 'Ce texte sera publié prochainement.', contact: 'Contact' },
  notFound: { title: 'Nous n’avons pas trouvé cette page.', text: 'Peut-être que le bijou que vous cherchiez a déjà trouvé sa propriétaire. Retournez aux pièces.', cta: 'Retour à l’accueil' },
};

const dictionaries: Record<Locale, Dictionary> = { es, en, pt, fr };
export const getDictionary = (locale: Locale) => dictionaries[locale];
export const fmt = (text: string, values: Record<string, string | number>) => text.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
