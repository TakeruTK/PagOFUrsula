import { database } from './store';
export async function jsonBody(request:Request,max=50000){
  const text=await request.text();
  if(text.length>max)throw new Error('El contenido es demasiado extenso.');
  try {return JSON.parse(text);}catch{throw new Error('El contenido no es válido.');}
}
export function invalid(error:unknown){return Response.json({error:error instanceof Error?error.message:'No pudimos completar la operación.'},{status:400});}
/** One shared budget per key (not per visitor): throttles login and password attempts without trusting proxy headers. */
export function withinBudget(key:string,max:number,windowMs:number){
  const db=database();const now=Date.now();
  db.prepare('DELETE FROM attempts WHERE expires<=?').run(now);
  const row=db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').get(key,now+windowMs);
  return Number(row?.count)<=max;
}
/** What to tell the owner when the translator could not reach a language; the Spanish text is saved either way. */
export const translationNote=(failed:string[])=>failed.length?'No pudimos traducir al '+(['en','pt','fr'] as const).filter(l=>failed.includes(l)).map(l=>({en:'inglés',pt:'portugués',fr:'francés'}[l])).join(', ')+' (el traductor no respondió). Se reintentará al guardar de nuevo o con «Traducir todo».':undefined;
