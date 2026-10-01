import { sameOrigin } from '@/lib/admin-auth';
import { checkoutSchema,paymentProvider } from '@/lib/payments';
import { jsonBody,invalid } from '@/lib/http';
export async function POST(request:Request){
  if(!sameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});
  try{const input=checkoutSchema.safeParse(await jsonBody(request,8000));if(!input.success)throw new Error('Revisa tu nombre, correo y las cantidades de tu bolsa.');const order=paymentProvider().create(input.data);return Response.json({id:order.id,status:order.status,total:order.total,mode:order.mode},{headers:{'Cache-Control':'no-store'}});}catch(e){return invalid(e);}
}
