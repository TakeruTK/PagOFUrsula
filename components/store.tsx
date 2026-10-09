'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { Dictionary } from '@/lib/dictionaries';
import { fmt } from '@/lib/dictionaries';
import { defaultCurrency, type Locale } from '@/lib/i18n';
import { formatPrice, type Currency } from '@/lib/money';
import type { Settings } from '@/lib/pieces';
import type { ProviderId } from '@/lib/config';
import type { Card } from '@/lib/catalog';
import { BagDrawer, CheckoutModal } from './bag';

export type Line = { id: string; quantity: number };
type Shared = { lang: Locale; dict: Dictionary; catalog: Card[]; usdRate: number; shipping: Settings['shipping']; providers: ProviderId[]; mode: 'demo' | 'live'; instagram: string };
type Store = Shared & {
  bag: Line[]; count: number; currency: Currency; setCurrency: (c: Currency) => void;
  add: (card: Card, amount?: number) => void; change: (id: string, delta: number) => void; remove: (id: string) => void; clear: () => void;
  bagOpen: boolean; setBagOpen: (open: boolean) => void; checkoutOpen: boolean; setCheckoutOpen: (open: boolean) => void; notify: (text: string) => void;
};
const BAG = 'ursula-bag-v1', CURRENCY = 'ursula-currency';
const StoreContext = createContext<Store | null>(null);
export const useStore = () => { const store = useContext(StoreContext); if (!store) throw new Error('StoreProvider missing'); return store; };

export function StoreProvider({ shared, children }: { shared: Shared; children: React.ReactNode }) {
  const { lang, dict, catalog } = shared;
  const [bag, setBag] = useState<Line[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency[lang]);
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(BAG) || '[]');
      if (Array.isArray(stored)) setBag(stored.filter((l: Line) => typeof l?.id === 'string' && Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= 20).slice(0, 30));
      const savedCurrency = localStorage.getItem(CURRENCY);
      if (savedCurrency === 'CLP' || savedCurrency === 'USD') setCurrencyState(savedCurrency);
    } catch { /* storage may be unavailable (private mode) */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) try { localStorage.setItem(BAG, JSON.stringify(bag)); } catch { /* ignore */ } }, [bag, loaded]);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(t); }, [notice]);

  const setCurrency = useCallback((c: Currency) => { setCurrencyState(c); try { localStorage.setItem(CURRENCY, c); } catch { /* ignore */ } }, []);
  const add = useCallback((card: Card, amount = 1) => {
    const current = bag.find(l => l.id === card.id)?.quantity || 0;
    if (current + amount > Math.min(card.stock, 20)) { setNotice(dict.bag.maxed); return; }
    setBag(old => old.some(l => l.id === card.id) ? old.map(l => l.id === card.id ? { ...l, quantity: l.quantity + amount } : l) : [...old, { id: card.id, quantity: amount }]);
    setNotice(fmt(dict.bag.added, { name: card.name }));
  }, [bag, dict]);
  const change = useCallback((id: string, delta: number) => setBag(old => old.map(l => l.id === id ? { ...l, quantity: Math.min(20, catalog.find(c => c.id === id)?.stock || 0, l.quantity + delta) } : l).filter(l => l.quantity > 0)), [catalog]);
  const remove = useCallback((id: string) => setBag(old => old.filter(l => l.id !== id)), []);
  const clear = useCallback(() => setBag([]), []);

  const value = useMemo<Store>(() => ({
    ...shared, bag, count: bag.reduce((n, l) => n + l.quantity, 0), currency, setCurrency, add, change, remove, clear, bagOpen, setBagOpen, checkoutOpen, setCheckoutOpen, notify: setNotice,
  }), [shared, bag, currency, setCurrency, add, change, remove, clear, bagOpen, checkoutOpen]);

  return <StoreContext.Provider value={value}>
    {children}
    <BagDrawer />
    <CheckoutModal />
    <div className={`toast ${notice ? 'visible' : ''}`} role="status"><Check size={17} />{notice}</div>
  </StoreContext.Provider>;
}

/** A price in CLP rendered in the visitor's chosen currency. */
export function Price({ clp, className }: { clp: number; className?: string }) {
  const { currency, usdRate, lang } = useStore();
  return <span className={className} suppressHydrationWarning>{formatPrice(clp, currency, usdRate, lang)}</span>;
}
