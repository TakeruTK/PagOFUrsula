import { getSettings,getPieces,database } from '@/lib/store';
import { protect } from '@/lib/admin-auth';
import { settingsSchema } from '@/lib/pieces';
import { jsonBody,invalid,translationNote } from '@/lib/http';
import { translateSettings } from '@/lib/autotranslate';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await protect(request);if(denied)return denied;return Response.json(getSettings(),{headers:{'Cache-Control':'no-store'}});}
export async function PUT(request:Request){const denied=await protect(request);if(denied)return denied;try{const parsed=settingsSchema.safeParse(await jsonBody(request,120000));if(!parsed.success)throw new Error('Revisa los campos: '+parsed.error.issues[0].path.join('.')+' — '+parsed.error.issues[0].message);
    const orphan=getPieces(true).find(p=>!parsed.data.categories.some(c=>c.es===p.category));
    if(orphan)throw new Error('La categoría «'+orphan.category+'» todavía tiene piezas (por ejemplo «'+orphan.name+'»). Cámbialas de categoría antes de quitarla.');
    const used=[...parsed.data.images.hero,...(parsed.data.images.about?[parsed.data.images.about]:[])];
    for(const photo of used){if(photo.url.startsWith('/api/photos/')&&!database().prepare('SELECT id FROM photos WHERE id=?').get(photo.url.split('/').pop()!))throw new Error('Una fotografía no existe. Vuelve a subirla.');}const translated=await translateSettings(parsed.data);database().prepare('UPDATE settings SET content=? WHERE id=1').run(JSON.stringify(translated.value));return Response.json({ok:true,warning:translationNote(translated.failed)});}catch(e){return invalid(e);}}
