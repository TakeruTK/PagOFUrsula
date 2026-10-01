import type { Piece, Settings } from './pieces';
export const initialSettings: Settings = {
  headline: 'La naturaleza, hecha joya.',
  introduction: 'Formas orgánicas, destellos de color y pequeños detalles que hacen la diferencia. Descubre el universo de Úrsula Alcaíno.',
  story: 'Una curva, una textura, un reflejo. El trabajo de Úrsula Alcaíno invita a mirar de cerca: piezas donde las formas de la naturaleza se encuentran con la expresión del metal. Un universo de joyas con carácter propio, para acompañar tu manera de ser.',
  instagram: 'https://www.instagram.com/ursulaalcaino/',
  collectionTitle: 'Encuentra tu próxima joya.',
};
const references: [string,Piece['category'],number,string,NonNullable<Piece['images'][number]['crop']>][] = [
  ['Aros Sendero','Aros',38900,'ursula',[57,182,364,363,475,621]],
  ['Aros Brisa verde','Aros',32900,'color',[583,10,274,364,1443,754]],
  ['Aros Órbita','Aros',35900,'silver',[51,397,270,354,1506,761]],
  ['Anillo Bosque','Anillos',42900,'color',[1145,12,190,237,1443,754]],
  ['Aros Mariposa','Aros',36900,'nature',[1215,13,195,228,1433,756]],
  ['Aros Gotas de noche','Aros',29900,'silver',[52,27,267,353,1506,761]],
  ['Anillo Violeta','Anillos',44900,'color',[865,388,269,235,1443,754]],
  ['Colgante Atrapasueños','Collares',39900,'nature',[936,377,192,356,1433,756]],
];
export const initialPieces: Piece[] = references.map(([name,category,price,url,crop],index)=>({
  id: `a0000000-0000-4000-8000-${String(index+1).padStart(12,'0')}`,
  name,category,price,kind:'Producto',status:'Publicado',availability:'Disponible',stock:5,order:index,featured:index<4,
  description:'Una pieza del universo creativo de Úrsula Alcaíno. Fotografía tomada de las referencias compartidas. Nombre y precio de demostración; materiales, medidas y disponibilidad pendientes de confirmar con la autora.',
  material:'Detalles por confirmar con la autora',
  images:[{url:`/references/${url}.png`,caption:'Trabajo de Úrsula Alcaíno · fotografía de referencia',crop}],
}));
