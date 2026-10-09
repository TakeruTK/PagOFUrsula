import { paymentMode, siteUrl } from '../config';
import { orderPath } from '../i18n';
import { failOrder, getOrder, markPaid, note, recordPaymentStart, type Order } from '../orders';
import { startMercadoPago } from './mercadopago';
import { startPayPal } from './paypal';

/** Sends the order to its provider and stores where the buyer must go to pay. */
export async function startPayment(order: Order): Promise<{ redirectUrl: string }> {
  try {
    if (order.payment.redirectUrl && order.status === 'pending_payment') return { redirectUrl: order.payment.redirectUrl };
    const started = order.provider === 'mercadopago' ? await startMercadoPago(order)
      : order.provider === 'paypal' ? await startPayPal(order)
      : { redirectUrl: `${siteUrl()}${orderPath(order.locale, order.id)}?demo=1`, ref: 'demo' };
    recordPaymentStart(order.id, started);
    return { redirectUrl: started.redirectUrl };
  } catch (error) {
    failOrder(order.id, `No se pudo iniciar el pago: ${error instanceof Error ? error.message : 'error desconocido'}`);
    throw new Error('No pudimos iniciar el pago. Inténtalo de nuevo en unos minutos.');
  }
}

/** Local simulator used while the shop is under review (PAYMENT_MODE=demo). */
export function simulate(id: string, outcome: 'approved' | 'pending' | 'rejected') {
  if (paymentMode() !== 'demo') throw new Error('El simulador no está habilitado.');
  const order = getOrder(id);
  if (!order || order.provider !== 'demo') throw new Error('Pedido no encontrado.');
  if (outcome === 'approved') return markPaid(id, { ref: `demo-${id.slice(0, 8)}`, status: 'approved' })!.order;
  if (outcome === 'rejected') return failOrder(id, 'Pago de prueba rechazado.')!;
  return note(id, 'Pago de prueba pendiente.', 'pending')!;
}
