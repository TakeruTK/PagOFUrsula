import { z } from 'zod';
import { sameOrigin } from '@/lib/admin-auth';
import { simulate } from '@/lib/payments';
import { invalid, jsonBody } from '@/lib/http';
const schema = z.object({ orderId: z.string().uuid(), outcome: z.enum(['approved', 'pending', 'rejected']) });
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  try {
    const input = schema.parse(await jsonBody(request, 1000));
    const order = simulate(input.orderId, input.outcome);
    return Response.json({ status: order.status }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return invalid(e); }
}
