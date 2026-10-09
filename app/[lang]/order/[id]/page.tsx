import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OrderStatus from '@/components/order-status';
import { paymentMode } from '@/lib/config';
import { getDictionary } from '@/lib/dictionaries';
import { isLocale } from '@/lib/i18n';
import { getOrder, publicOrder } from '@/lib/orders';
import { reconcile } from '@/lib/payments/mercadopago';

export const dynamic = 'force-dynamic';
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return { title: isLocale(lang) && lang === 'en' ? 'Your order' : 'Tu pedido', robots: { index: false, follow: false } };
}

export default async function OrderPage({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ demo?: string }> }) {
  const { lang, id } = await params;
  const { demo } = await searchParams;
  if (!isLocale(lang) || !/^[a-f0-9-]{36}$/.test(id)) notFound();
  const found = getOrder(id);
  if (!found) notFound();
  // If the buyer returns before the webhook arrives, ask Mercado Pago directly.
  const order = await reconcile(found);
  return <OrderStatus initial={publicOrder(order)} lang={lang} dict={getDictionary(lang)} showSimulator={paymentMode() === 'demo' && order.provider === 'demo' && demo === '1'} />;
}
