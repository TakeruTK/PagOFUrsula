import { getSettings,database } from '@/lib/store';
import { protect } from '@/lib/admin-auth';
import { settingsSchema } from '@/lib/pieces';
import { jsonBody,invalid } from '@/lib/http';
export const dynamic='force-dynamic';
export async function GET(){return Response.json(getSettings());}
export async function PUT(request:Request){const denied=await protect(request);if(denied)return denied;try{const parsed=settingsSchema.safeParse(await jsonBody(request,120000));if(!parsed.success)throw new Error('Revisa los campos: '+parsed.error.issues[0].path.join('.')+' — '+parsed.error.issues[0].message);
    const used=[...parsed.data.images.hero,...(parsed.data.images.about?[parsed.data.images.about]:[])];
    for(const photo of used){if(photo.url.startsWith('/api/photos/')&&!database().prepare('SELECT id FROM photos WHERE id=?').get(photo.url.split('/').pop()!))throw new Error('Una fotografía no existe. Vuelve a subirla.');}database().prepare('UPDATE settings SET content=? WHERE id=1').run(JSON.stringify(parsed.data));return Response.json({ok:true});}catch(e){return invalid(e);}}
