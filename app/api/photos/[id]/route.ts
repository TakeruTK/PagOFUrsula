import { database,getPieces } from '@/lib/store';
import { hasAdminSession } from '@/lib/admin-auth';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!/^[a-f0-9-]{36}$/.test(id))return new Response(null,{status:404});
  const visible=getPieces().some(p=>p.images.some(im=>im.url==='/api/photos/'+id));
  if(!visible&&!await hasAdminSession(request))return new Response(null,{status:404});
  const photo=database().prepare('SELECT * FROM photos WHERE id=?').get(id);
  if(!photo)return new Response(null,{status:404});
  return new Response(new Uint8Array(photo.bytes as Uint8Array),{headers:{'Content-Type':photo.type as string,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
