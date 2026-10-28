import { protect } from '@/lib/admin-auth';
import { PHOTO_MAX_BYTES, STORAGE_MAX_BYTES } from '@/lib/limits';
import { database, photoUsage, purgeUnusedPhotos } from '@/lib/store';
const MB=(bytes:number)=>Math.round(bytes/1048576);
export async function POST(request:Request){
  const denied=await protect(request);if(denied)return denied;
  if(Number(request.headers.get('content-length')||0)>PHOTO_MAX_BYTES+65536)return Response.json({error:`La foto pesa más de ${MB(PHOTO_MAX_BYTES)} MB. Usa una más liviana.`},{status:413});
  try {
    const form=await request.formData(),file=form.get('file');
    if(!(file instanceof File)||!file.size||file.size>PHOTO_MAX_BYTES)return Response.json({error:`Selecciona una foto de hasta ${MB(PHOTO_MAX_BYTES)} MB.`},{status:400});
    const bytes=new Uint8Array(await file.arrayBuffer());
    const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    const png=[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
    const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
    const type=jpg?'image/jpeg':png?'image/png':webp?'image/webp':null;
    if(!type||file.type!==type)return Response.json({error:'Usa JPG, PNG o WebP válidos.'},{status:400});
    purgeUnusedPhotos();
    if(photoUsage().bytes+bytes.length>STORAGE_MAX_BYTES)return Response.json({error:`Llegaste al límite de espacio para fotos (${MB(STORAGE_MAX_BYTES)} MB). Elimina piezas o fotos que ya no uses para subir nuevas.`},{status:400});
    const id=crypto.randomUUID();database().prepare('INSERT INTO photos (id,type,bytes,created) VALUES (?,?,?,?)').run(id,type,bytes,Date.now());
    return Response.json({url:'/api/photos/'+id,caption:''});
  }catch{return Response.json({error:'No pudimos subir la fotografía.'},{status:400});}
}
