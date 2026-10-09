import { siteUrl } from '@/lib/config';
import { orderPath } from '@/lib/i18n';
import { getOrder } from '@/lib/orders';
import { capturePayPal } from '@/lib/payments/paypal';
export const dynamic = 'force-dynamic';
// The buyer lands here after approving on PayPal. The capture happens on the server and is verified
// against the stored order; the query string alone never marks anything as paid.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const order = getOrder(params.get('order') || '');
  if (!order) return Response.redirect(`${siteUrl()}/`, 303);
  try { await capturePayPal(order, params.get('token') || ''); } catch { /* the status page shows the real state */ }
  return Response.redirect(`${siteUrl()}${orderPath(order.locale, order.id)}`, 303);
}
