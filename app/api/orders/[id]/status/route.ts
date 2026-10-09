import { getOrder, publicOrder } from '@/lib/orders';
import { reconcile } from '@/lib/payments/mercadopago';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = /^[a-f0-9-]{36}$/.test(id) ? getOrder(id) : null;
  if (!order) return Response.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  return Response.json(publicOrder(await reconcile(order)), { headers: { 'Cache-Control': 'no-store' } });
}
