export async function jsonBody(request:Request,max=50000){
  const text=await request.text();
  if(text.length>max)throw new Error('El contenido es demasiado extenso.');
  try {return JSON.parse(text);}catch{throw new Error('El contenido no es válido.');}
}
export function invalid(error:unknown){return Response.json({error:error instanceof Error?error.message:'No pudimos completar la operación.'},{status:400});}
