'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock3, Truck, XCircle } from 'lucide-react';
import { fmt, type Dictionary } from '@/lib/dictionaries';
import type { Locale } from '@/lib/i18n';
import { formatMinor } from '@/lib/money';
import type { publicOrder } from '@/lib/orders';
import { useStore } from './store';

type PublicOrder = ReturnType<typeof publicOrder>;
const PENDING = 'pending_payment';

export default function OrderStatus({ initial, lang, dict, showSimulator }: { initial: PublicOrder; lang: Locale; dict: Dictionary; showSimulator: boolean }) {
  const { clear } = useStore();
  const [order, setOrder] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const paid = ['paid', 'shipped', 'delivered'].includes(order.status);

  // The bag is emptied only once the payment is confirmed, so a cancelled payment keeps the selection.
  useEffect(() => { if (paid) clear(); }, [paid, clear]);
  useEffect(() => {
    if (order.status !== PENDING) return;
    const timer = setInterval(async () => {
      try { const response = await fetch(`/api/orders/${order.id}/status`, { cache: 'no-store' }); if (response.ok) setOrder(await response.json()); } catch { /* try again */ }
    }, 5000);
    return () => clearInterval(timer);
  }, [order.status, order.id]);

  async function simulate(outcome: 'approved' | 'pending' | 'rejected') {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/checkout/demo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: order.id, outcome }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const status = await fetch(`/api/orders/${order.id}/status`, { cache: 'no-store' });
      setOrder(await status.json());
    } catch (e) { setError(e instanceof Error ? e.message : dict.checkout.error); } finally { setBusy(false); }
  }

  const view = {
    paid: [<CheckCircle2 key="i" size={52} />, dict.order.paid, dict.order.paidText],
    pending_payment: [<Clock3 key="i" size={52} />, dict.order.pending, dict.order.pendingText],
    expired: [<Clock3 key="i" size={52} />, dict.order.expired, dict.order.expiredText],
    failed: [<XCircle key="i" size={52} />, dict.order.failed, dict.order.failedText],
    cancelled: [<XCircle key="i" size={52} />, dict.order.cancelled, dict.order.cancelledText],
    shipped: [<Truck key="i" size={52} />, dict.order.shipped, dict.order.shippedText],
    delivered: [<CheckCircle2 key="i" size={52} />, dict.order.delivered, dict.order.deliveredText],
    refunded: [<XCircle key="i" size={52} />, dict.order.refunded, dict.order.refundedText],
  }[order.status] as [React.ReactNode, string, string];
  const retry = !['paid', 'shipped', 'delivered', 'refunded'].includes(order.status);

  return <main className="order-page section">
    <div className="payment-result">
      {view[0]}
      <span className="eyebrow">{fmt(dict.order.title, { number: order.number })}</span>
      <h1>{view[1]}</h1>
      <p>{view[2]}</p>
      <div className="receipt">
        <span>{dict.order.items}</span><strong>{order.items.map(i => `${i.name} × ${i.quantity}`).join(' · ')}</strong>
        <span>{dict.order.shipping}</span><strong>{formatMinor(order.shippingCost, order.currency, lang)}</strong>
        <span>{dict.order.total}</span><strong>{formatMinor(order.total, order.currency, lang)}</strong>
        {order.tracking && <><span>{dict.order.tracking}</span><strong>{order.tracking.url ? <a href={order.tracking.url} target="_blank" rel="noreferrer noopener">{order.tracking.carrier} {order.tracking.code}</a> : `${order.tracking.carrier} ${order.tracking.code}`}</strong></>}
      </div>
      {order.retryUrl && retry && <a className="button full" href={order.retryUrl}>{dict.order.retry} <ArrowRight size={16} /></a>}
      {showSimulator && order.status === PENDING && <div className="simulator"><strong>{dict.order.demoTitle}</strong><p>{dict.order.demoText}</p><div>
        <button className="button" disabled={busy} onClick={() => simulate('approved')}>{dict.order.demoApproved}</button>
        <button className="button outline" disabled={busy} onClick={() => simulate('pending')}>{dict.order.demoPending}</button>
        <button className="button outline" disabled={busy} onClick={() => simulate('rejected')}>{dict.order.demoRejected}</button>
      </div>{error && <p className="error-box" role="alert">{error}</p>}</div>}
      <Link className={`button ${retry ? 'outline' : ''} full`} href={`/${lang}${paid ? '' : '#coleccion'}`}>{paid ? dict.order.backToShop : dict.order.backToShop} <ArrowRight size={16} /></Link>
    </div>
  </main>;
}
