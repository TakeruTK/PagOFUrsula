import { sameOrigin,destroySession } from '@/lib/admin-auth';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':destroySession(request)}});}
