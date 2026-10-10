import { database,getPieces,getSettings } from '@/lib/store';
import { hasAdminSession } from '@/lib/admin-auth';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
  const {id}=await params;
  if(!/^[a-f0-9-]{36}$/.test(id))return new Response(null,{status:404});
  const url='/api/photos/'+id;
  // Public when a published piece or the home page uses it; everything else is private to the workshop.
  const visible=getPieces().some(p=>p.images.some(im=>im.url===url))||(()=>{const {images}=getSettings();return images.hero.some(im=>im.url===url)||images.about?.url===url;})();
  if(!visible&&!await hasAdminSession(request))return new Response(null,{status:404});
  const photo=database().prepare('SELECT * FROM photos WHERE id=?').get(id);
  if(!photo)return new Response(null,{status:404});
  // Published photos never change (new uploads get a new id), so browsers and search engines may cache them.
  return new Response(new Uint8Array(photo.bytes as Uint8Array),{headers:{'Content-Type':photo.type as string,'Cache-Control':visible?'public, max-age=31536000, immutable':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
