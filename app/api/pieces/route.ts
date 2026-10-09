import { database,getPieces } from '@/lib/store';
import { protect } from '@/lib/admin-auth';
import { pieceSchema, uniqueSlug } from '@/lib/pieces';
import { jsonBody,invalid } from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(request:Request){const admin=new URL(request.url).searchParams.has('admin');if(admin){const denied=await protect(request);if(denied)return denied;}return Response.json(getPieces(admin),{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){return save(request,false);}
export async function PUT(request:Request){return save(request,true);}
async function save(request:Request,update:boolean){
  const denied=await protect(request);if(denied)return denied;
  try {
    const parsed=pieceSchema.safeParse(await jsonBody(request));
    if(!parsed.success)return Response.json({error:'Revisa los campos: '+parsed.error.issues[0].path.join('.')+' — '+parsed.error.issues[0].message},{status:400});
    const p=parsed.data,id=update?p.id:crypto.randomUUID();
    if(!id)return Response.json({error:'Falta la pieza.'},{status:400});
    const others=getPieces(true).filter(x=>x.id!==id);
    const current=update?getPieces(true).find(x=>x.id===id):undefined;
    const wanted=p.slug||current?.slug;
    if(wanted&&others.some(x=>x.slug===wanted))return Response.json({error:'Otra pieza ya usa esa dirección (slug). Elige otra.'},{status:400});
    p.slug=wanted||uniqueSlug(p.name,others.map(x=>x.slug));
    for(const photo of p.images){if(photo.url.startsWith('/api/photos/')&&!database().prepare('SELECT id FROM photos WHERE id=?').get(photo.url.split('/').pop()!))return Response.json({error:'Una fotografía no existe. Vuelve a subirla.'},{status:400});}
    const result=update?database().prepare('UPDATE pieces SET content=? WHERE id=?').run(JSON.stringify({...p,id}),id):database().prepare('INSERT INTO pieces VALUES (?,?)').run(id,JSON.stringify({...p,id}));
    if(!result.changes)return Response.json({error:'La pieza ya no existe.'},{status:404});
    return Response.json({id});
  }catch(e){return invalid(e);}
}
export async function DELETE(request:Request){const denied=await protect(request);if(denied)return denied;const id=new URL(request.url).searchParams.get('id');if(!id)return Response.json({error:'Falta la pieza.'},{status:400});database().prepare('DELETE FROM pieces WHERE id=?').run(id);return Response.json({ok:true});}
