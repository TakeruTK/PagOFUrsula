import { protect } from '@/lib/admin-auth';
import { database } from '@/lib/store';
export async function POST(request:Request){
  const denied=await protect(request);if(denied)return denied;
  if(Number(request.headers.get('content-length')||0)>6*1024*1024+65536)return Response.json({error:'La foto supera los 6 MB.'},{status:413});
  try {
    const form=await request.formData(),file=form.get('file');
    if(!(file instanceof File)||!file.size||file.size>6*1024*1024)return Response.json({error:'Selecciona una foto de hasta 6 MB.'},{status:400});
    const bytes=new Uint8Array(await file.arrayBuffer());
    const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
    const png=[137,80,78,71,13,10,26,10].every((b,i)=>bytes[i]===b);
    const webp=new TextDecoder().decode(bytes.slice(0,4))==='RIFF'&&new TextDecoder().decode(bytes.slice(8,12))==='WEBP';
    const type=jpg?'image/jpeg':png?'image/png':webp?'image/webp':null;
    if(!type||file.type!==type)return Response.json({error:'Usa JPG, PNG o WebP válidos.'},{status:400});
    const id=crypto.randomUUID();database().prepare('INSERT INTO photos VALUES (?,?,?)').run(id,type,bytes);
    return Response.json({url:'/api/photos/'+id,caption:''});
  }catch{return Response.json({error:'No pudimos subir la fotografía.'},{status:400});}
}
