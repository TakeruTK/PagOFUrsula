import { configured, sameOrigin, verifyCredentials, loginAttempt, createSession } from '@/lib/admin-auth';
import { database } from '@/lib/store';
import { jsonBody, invalid } from '@/lib/http';
export async function POST(request:Request){
  if(!sameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});
  if(!configured())return Response.json({error:'Configura el acceso ejecutando npm run admin:setup.'},{status:503});
  try {
    const input=await jsonBody(request,2048);
    if(typeof input?.username!=='string'||typeof input?.password!=='string'||input.password.length>256)return Response.json({error:'Datos inválidos.'},{status:400});
    if(!loginAttempt())return Response.json({error:'Demasiados intentos. Espera 15 minutos.'},{status:429});
    if(!verifyCredentials(input.username,input.password))return Response.json({error:'Usuario o contraseña incorrectos.'},{status:401});
    database().prepare('DELETE FROM attempts WHERE key=?').run('login');
    return Response.json({ok:true},{headers:{'Set-Cookie':createSession(),'Cache-Control':'no-store'}});
  }catch(e){return invalid(e);}
}
