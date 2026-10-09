'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from 'lucide-react';
import { fmt } from '@/lib/dictionaries';
import { formatMinor, toMinor, type Currency } from '@/lib/money';
import { COUNTRIES, MERCADOPAGO_COUNTRIES, countryName, shippingFor } from '@/lib/shipping';
import type { ProviderId } from '@/lib/config';
import Modal from './modal';
import Photo from './photo';
import { Price, useStore } from './store';

export function BagDrawer() {
  const { dict, lang, bag, count, catalog, bagOpen, setBagOpen, change, remove, setCheckoutOpen } = useStore();
  const lines = bag.map(line => ({ ...line, card: catalog.find(c => c.id === line.id) }));
  const subtotal = lines.reduce((n, l) => n + (l.card?.price || 0) * l.quantity, 0);
  const invalid = lines.some(l => !l.card || !l.card.sellable || l.card.stock < l.quantity);
  return <Modal open={bagOpen} onClose={() => setBagOpen(false)} title={fmt(dict.bag.title, { count })} description={dict.bag.description} className="bag-drawer" closeLabel={dict.nav.close}>
    {bag.length ? <>
      <div className="bag-lines">{lines.map(({ id, quantity, card }) => <div className="bag-line" key={id}>
        {card && <Photo photo={card.images[0]} alt={card.name} />}
        <div>
          <h3>{card?.name || dict.bag.unavailable}</h3>
          {card ? <Price clp={card.price} /> : <span>{dict.bag.removeIt}</span>}
          <div className="quantity">
            <button aria-label={fmt(dict.bag.removeOne, { name: card?.name || '' })} onClick={() => change(id, -1)}><Minus size={13} /></button>
            <span>{quantity}</span>
            <button aria-label={fmt(dict.bag.addOne, { name: card?.name || '' })} disabled={!card || quantity >= Math.min(card.stock, 20)} onClick={() => change(id, 1)}><Plus size={13} /></button>
          </div>
        </div>
        <button className="icon-button" aria-label={fmt(dict.bag.delete, { name: card?.name || '' })} onClick={() => remove(id)}><Trash2 size={17} /></button>
      </div>)}</div>
      <div className="bag-summary">
        <div><span>{dict.bag.subtotal}</span><strong><Price clp={subtotal} /></strong></div>
        <p>{dict.bag.shippingNote}</p>
        {invalid && <p className="error-box">{dict.bag.invalid}</p>}
        <button className="button full" disabled={invalid} onClick={() => { setBagOpen(false); setCheckoutOpen(true); }}>{dict.bag.continue} <ArrowRight size={17} /></button>
        <p className="demo-note"><ShieldCheck size={15} /> {dict.bag.secure}</p>
      </div>
    </> : <div className="empty-state"><ShoppingBag size={36} /><h3>{dict.bag.emptyTitle}</h3><p>{dict.bag.emptyText}</p><Link className="button" href={`/${lang}#coleccion`} onClick={() => setBagOpen(false)}>{dict.bag.discover} <ArrowRight size={16} /></Link></div>}
  </Modal>;
}

const providerCurrency = (p: ProviderId): Currency => (p === 'paypal' ? 'USD' : 'CLP');

export function CheckoutModal() {
  const { dict, lang, bag, catalog, usdRate, shipping, providers, checkoutOpen, setCheckoutOpen } = useStore();
  const [country, setCountry] = useState(lang === 'es' ? 'CL' : 'US');
  const [method, setMethod] = useState<ProviderId | ''>('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const requestKey = useRef('');

  useEffect(() => { if (checkoutOpen) { requestKey.current = crypto.randomUUID(); setError(''); } }, [checkoutOpen]);
  const countries = useMemo(() => [...COUNTRIES].sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang)), [lang]);
  const zone = shippingFor({ shipping }, country);
  const methods = providers.filter(p => p !== 'mercadopago' || MERCADOPAGO_COUNTRIES.has(country));
  const selected: ProviderId | '' = method && methods.includes(method) ? method : methods[0] || '';
  const currency = selected ? providerCurrency(selected) : 'CLP';
  const lines = bag.map(line => ({ ...line, card: catalog.find(c => c.id === line.id) }));
  const subtotal = lines.reduce((n, l) => n + toMinor(l.card?.price || 0, currency, usdRate) * l.quantity, 0);
  const shippingMinor = toMinor(zone.cost, currency, usdRate);
  const fmtMoney = (minor: number) => formatMinor(minor, currency, lang);
  const names: Record<ProviderId, [string, string]> = { mercadopago: [dict.checkout.methodMp, dict.checkout.methodMpText], paypal: [dict.checkout.methodPp, dict.checkout.methodPpText], demo: [dict.checkout.methodDemo, dict.checkout.methodDemoText] };
  const invalid = !lines.length || lines.some(l => !l.card || !l.card.sellable || l.card.stock < l.quantity);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !selected || !zone.enabled) return;
    setPending(true); setError('');
    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) || '');
    try {
      if (!requestKey.current) requestKey.current = crypto.randomUUID();
      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestKey: requestKey.current, locale: lang, provider: selected, items: bag,
          customer: { name: text('name'), email: text('email'), phone: text('phone') },
          shipping: { country, region: text('region'), city: text('city'), address: text('address'), postal: text('postal'), notes: text('notes') },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || dict.checkout.error);
      window.location.assign(data.redirectUrl);
    } catch (e) { setError(e instanceof Error ? e.message : dict.checkout.error); setPending(false); }
  }

  return <Modal open={checkoutOpen} onClose={() => { if (!pending) setCheckoutOpen(false); }} title={dict.checkout.title} description={dict.checkout.description} className="checkout-modal" closeLabel={dict.nav.close}>
    <form onSubmit={submit} onChange={() => { requestKey.current = ''; }}>
      <div className="checkout-grid">
        <div>
          <p className="step-label">{dict.checkout.stepData}</p>
          <label className="field">{dict.checkout.name}<input name="name" required minLength={2} maxLength={100} autoComplete="name" /></label>
          <label className="field">{dict.checkout.email}<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
          <p className="field-help">{dict.checkout.emailHelp}</p>
          <label className="field">{dict.checkout.phone}<input name="phone" type="tel" maxLength={30} autoComplete="tel" /></label>
          <p className="step-label">{dict.checkout.stepShipping}</p>
          <label className="field">{dict.checkout.country}<select value={country} onChange={e => setCountry(e.target.value)} autoComplete="country">{countries.map(c => <option key={c} value={c}>{countryName(c, lang)}</option>)}</select></label>
          <div className="form-row">
            <label className="field">{dict.checkout.region}<input name="region" maxLength={100} autoComplete="address-level1" /></label>
            <label className="field">{dict.checkout.city}<input name="city" required minLength={2} maxLength={100} autoComplete="address-level2" /></label>
          </div>
          <label className="field">{dict.checkout.address}<input name="address" required minLength={4} maxLength={200} autoComplete="street-address" /></label>
          <div className="form-row">
            <label className="field">{dict.checkout.postal}<input name="postal" maxLength={20} autoComplete="postal-code" /></label>
            <label className="field">{dict.checkout.notes}<input name="notes" maxLength={300} /></label>
          </div>
          <div className="delivery-card"><Truck size={19} /><div><strong>{zone.enabled ? fmt(dict.checkout.shippingTo, { country: countryName(country, lang), eta: lang === 'es' ? zone.eta : zone.etaEn }) : dict.checkout.shippingUnavailable}</strong></div></div>
          <p className="step-label">{dict.checkout.stepPayment}</p>
          {methods.length ? methods.map(p => <label className={`payment-option selectable ${selected === p ? 'selected' : ''}`} key={p}>
            <input type="radio" name="method" value={p} checked={selected === p} onChange={() => setMethod(p)} />
            <span className="radio-dot" /><div><strong>{names[p][0]}</strong><span>{names[p][1]}</span></div>{p === 'demo' && <span className="pill">DEMO</span>}
          </label>) : <p className="error-box">{dict.checkout.noMethods}</p>}
        </div>
        <aside className="checkout-summary">
          <p className="step-label">{dict.checkout.summary}</p>
          {lines.map(l => <div className="checkout-item" key={l.id}><span>{fmt(dict.checkout.qty, { name: l.card?.name || '', qty: l.quantity })}</span><strong>{fmtMoney(toMinor(l.card?.price || 0, currency, usdRate) * l.quantity)}</strong></div>)}
          <div className="checkout-item"><span>{dict.bag.subtotal}</span><strong>{fmtMoney(subtotal)}</strong></div>
          <div className="checkout-item"><span>{dict.checkout.shippingCost}</span><strong>{zone.enabled ? fmtMoney(shippingMinor) : '—'}</strong></div>
          <div className="checkout-total"><span>{dict.checkout.total}</span><strong>{fmtMoney(subtotal + (zone.enabled ? shippingMinor : 0))}</strong></div>
          {selected === 'paypal' && <p>{fmt(dict.checkout.rateNote, { rate: usdRate })}</p>}
          {error && <p className="error-box" role="alert">{error}</p>}
          <button className="button full" type="submit" disabled={pending || invalid || !selected || !zone.enabled}>{pending ? dict.checkout.processing : fmt(dict.checkout.payWith, { method: selected ? names[selected][0] : '' })} {!pending && <ArrowRight size={16} />}</button>
          {selected && <p className="demo-note"><ShieldCheck size={15} /> {fmt(dict.checkout.secure, { method: names[selected][0] })}</p>}
        </aside>
      </div>
    </form>
  </Modal>;
}
