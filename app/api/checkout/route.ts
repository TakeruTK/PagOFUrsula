import { sameOrigin } from '@/lib/admin-auth';
import { CheckoutError, checkoutSchema, createOrder } from '@/lib/orders';
import { startPayment } from '@/lib/payments';
import { invalid, jsonBody, withinBudget } from '@/lib/http';
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Solicitud no permitida.' }, { status: 403 });
  try {
    if (!withinBudget('checkout', 40, 10 * 60000)) return Response.json({ error: 'Hay muchas compras en curso. Inténtalo en unos minutos.' }, { status: 429 });
    const input = checkoutSchema.safeParse(await jsonBody(request, 12000));
    if (!input.success) throw new CheckoutError('Revisa tus datos de contacto, la dirección de envío y las cantidades de tu bolsa.');
    const order = createOrder(input.data);
    const { redirectUrl } = await startPayment(order);
    return Response.json({ id: order.id, redirectUrl, total: order.charge.total, currency: order.charge.currency }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return invalid(e); }
}
