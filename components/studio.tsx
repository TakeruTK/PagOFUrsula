'use client';
import { useMemo, useState } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, ArrowUpRight, Check, CheckCircle2, Circle, Copy, Download, ImagePlus, KeyRound, LayoutDashboard, LogOut, Package, Pencil, Plus, Save, Search, ShoppingBag, Truck, Trash2, Wallet, X, FileText, Home } from 'lucide-react';
import Link from 'next/link';
import { categories, slugify, type Photo as PhotoType, type Piece, type Settings } from '@/lib/pieces';
import { formatMinor } from '@/lib/money';
import type { Order } from '@/lib/orders';
import type { StoreStatus } from '@/lib/status';
import { Brand } from './brand';
import Modal from './modal';
import Photo from './photo';

type Tab = 'summary' | 'pieces' | 'orders' | 'store' | 'shipping' | 'policies' | 'payments' | 'security';
type SafeOrder = Omit<Order, 'fingerprint'>;
type Draft = Omit<Piece, 'id' | 'slug'> & { id?: string; slug?: string };
const emptyEn = { name: '', description: '', material: '', caption: '' };
const blank = (): Draft => ({ name: '', category: 'Aros', kind: 'Producto', description: '', material: '', price: 0, stock: 1, order: 0, featured: false, status: 'Borrador', availability: 'Disponible', images: [], translations: { en: { ...emptyEn } } });
const STATUS: Record<string, string> = { pending_payment: 'Esperando pago', expired: 'Reserva vencida', paid: 'Pagado · por despachar', shipped: 'Despachado', delivered: 'Entregado', failed: 'Pago fallido', cancelled: 'Cancelado', refunded: 'Reembolsado' };
const effective = (o: SafeOrder) => (o.status === 'pending_payment' && Date.parse(o.reservedUntil) < Date.now() ? 'expired' : o.status);
const PROVIDER: Record<string, string> = { mercadopago: 'Mercado Pago', paypal: 'PayPal', demo: 'Prueba' };
const TABS: [Tab, string, React.ReactNode][] = [
  ['summary', 'Resumen', <LayoutDashboard size={19} key="a" />], ['pieces', 'Mis piezas', <Package size={19} key="b" />], ['orders', 'Pedidos', <ShoppingBag size={19} key="c" />],
  ['store', 'Mi tienda', <Home size={19} key="d" />], ['shipping', 'Envíos y precios', <Truck size={19} key="e" />], ['policies', 'Políticas', <FileText size={19} key="f" />],
  ['payments', 'Pagos y lanzamiento', <Wallet size={19} key="g" />], ['security', 'Seguridad', <KeyRound size={19} key="h" />],
];
const TITLES: Record<Tab, string> = { summary: 'Tu tienda de un vistazo.', pieces: 'Tus piezas, tu universo.', orders: 'Cada nueva historia.', store: 'Una tienda que habla de ti.', shipping: 'Llegar lejos, con claridad.', policies: 'Reglas claras, compras tranquilas.', payments: 'Todo listo para abrir.', security: 'Tu taller, protegido.' };

export default function Studio({ initialPieces, initialSettings, initialOrders, initialStatus }: { initialPieces: Piece[]; initialSettings: Settings; initialOrders: SafeOrder[]; initialStatus: StoreStatus }) {
  const [pieces, setPieces] = useState(initialPieces);
  const [settings, setSettings] = useState(initialSettings);
  const [orders, setOrders] = useState(initialOrders);
  const [status, setStatus] = useState(initialStatus);
  const [tab, setTab] = useState<Tab>('summary');
  const [filter, setFilter] = useState('');
  const [visibility, setVisibility] = useState('Todas');
  const [orderFilter, setOrderFilter] = useState('all');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank());
  const [english, setEnglish] = useState(false);
  const [deleting, setDeleting] = useState<Piece | null>(null);
  const [openOrder, setOpenOrder] = useState<SafeOrder | null>(null);
  const [tracking, setTracking] = useState({ carrier: '', code: '', url: '' });
  const [policyLang, setPolicyLang] = useState<'es' | 'en'>('es');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function api(url: string, options?: RequestInit) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'No pudimos guardar los cambios.');
    return data;
  }
  const options = (method: string, data: unknown) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const run = async (task: () => Promise<void>) => { setBusy(true); setError(''); try { await task(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); } };

  const refreshPieces = async () => setPieces(await api('/api/pieces?admin'));
  const refreshStatus = async () => setStatus(await api('/api/admin/status'));
  function edit(piece?: Piece, copy = false) {
    const base = piece ? structuredClone(piece) : { ...blank(), order: pieces.length };
    if (copy && piece) { delete (base as Draft).id; delete (base as Draft).slug; base.name = `${piece.name} (copia)`; base.status = 'Borrador'; base.featured = false; }
    base.translations = { en: { ...emptyEn, ...(base.translations?.en || {}) } };
    setDraft(base); setEnglish(false); setError(''); setMessage(''); setEditing(true);
  }
  const savePiece = (event: React.FormEvent) => { event.preventDefault(); void run(async () => { await api('/api/pieces', options(draft.id ? 'PUT' : 'POST', draft)); await Promise.all([refreshPieces(), refreshStatus()]); setEditing(false); setMessage('Pieza guardada. Los cambios ya están disponibles en la tienda.'); }); };
  async function upload(files: FileList | null) {
    if (!files) return;
    if (files.length + draft.images.length > 8) { setError('Puedes agregar hasta 8 fotografías.'); return; }
    setUploading(true); setError('');
    const added: PhotoType[] = [];
    try { for (const file of Array.from(files)) { const body = new FormData(); body.append('file', file); added.push(await api('/api/photos', { method: 'POST', body })); } }
    catch (e) { setError((e as Error).message); } finally { setDraft(p => ({ ...p, images: [...p.images, ...added] })); setUploading(false); }
  }
  const removePiece = () => void run(async () => { if (!deleting) return; await api('/api/pieces?id=' + deleting.id, { method: 'DELETE' }); await Promise.all([refreshPieces(), refreshStatus()]); setDeleting(null); setMessage('Pieza eliminada.'); });
  const saveSettings = (event: React.FormEvent, note: string) => { event.preventDefault(); void run(async () => { await api('/api/settings', options('PUT', settings)); await refreshStatus(); setMessage(note); }); };
  const logout = () => void run(async () => { await api('/api/admin/logout', { method: 'POST' }); window.location.replace('/admin'); });
  async function selectTab(next: Tab) {
    setTab(next); setMessage(''); setError('');
    try { if (next === 'orders' || next === 'summary') setOrders(await api('/api/orders')); if (next === 'payments' || next === 'summary') await refreshStatus(); } catch (e) { setError((e as Error).message); }
  }
  function movePhoto(index: number, direction: number) { setDraft(p => { const images = [...p.images];[images[index], images[index + direction]] = [images[index + direction], images[index]]; return { ...p, images }; }); }
  const orderAction = (body: object) => void run(async () => {
    if (!openOrder) return;
    const updated = await api(`/api/orders/${openOrder.id}`, options('PUT', body));
    setOrders(list => list.map(o => (o.id === updated.id ? updated : o))); setOpenOrder(updated);
    await Promise.all([refreshPieces(), refreshStatus()]);
    setMessage('Pedido actualizado.');
  });
  const changePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('next') !== form.get('repeat')) { setError('Las contraseñas nuevas no coinciden.'); return; }
    void run(async () => { await api('/api/admin/password', options('POST', { current: form.get('current'), next: form.get('next') })); window.location.replace('/admin'); });
  };

  const shownPieces = pieces.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) && (visibility === 'Todas' || p.status === visibility));
  const shownOrders = orders.filter(o => orderFilter === 'all' || effective(o) === orderFilter || (orderFilter === 'open' && ['paid', 'shipped'].includes(o.status)));
  const summary = useMemo(() => {
    const since = Date.now() - 30 * 86400000;
    const paid = orders.filter(o => ['paid', 'shipped', 'delivered'].includes(o.status) && o.provider !== 'demo');
    const recent = paid.filter(o => Date.parse(o.created) >= since);
    const totals = (['CLP', 'USD'] as const).map(c => [c, recent.filter(o => o.charge.currency === c).reduce((n, o) => n + o.charge.total, 0)] as const).filter(([, n]) => n > 0);
    return { totals, toShip: orders.filter(o => o.status === 'paid' && o.provider !== 'demo').length, attention: orders.filter(o => o.attention).length, recentCount: recent.length, low: pieces.filter(p => p.status === 'Publicado' && p.kind === 'Producto' && p.stock <= 1) };
  }, [orders, pieces]);
  const text = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(s => ({ ...s, [key]: value }));
  const zone = (id: keyof Settings['shipping'], patch: Partial<Settings['shipping']['chile']>) => setSettings(s => ({ ...s, shipping: { ...s.shipping, [id]: { ...s.shipping[id], ...patch } } }));
  const en = draft.translations?.en || emptyEn;
  const setEn = (patch: Partial<typeof emptyEn>) => setDraft(d => ({ ...d, translations: { en: { ...emptyEn, ...(d.translations?.en || {}), ...patch } } }));
  const pending = status.checks.filter(c => !c.ok).length;

  return <div className="studio-shell">
    <aside className="studio-sidebar">
      <Brand /><p className="tiny-label">TU ESPACIO DE CREACIÓN</p>
      <nav>{TABS.map(([id, label, icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => selectTab(id)}>{icon} {label}{id === 'pieces' && <span>{pieces.length}</span>}{id === 'orders' && summary.toShip > 0 && <span>{summary.toShip}</span>}{id === 'payments' && pending > 0 && <span>{pending}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <span className={`demo-indicator ${status.mode === 'live' ? 'live' : ''}`}>{status.mode === 'live' ? 'Pagos reales activos' : 'Modo demostración'}</span>
        <Link href="/" target="_blank">Ver mi tienda <ArrowUpRight size={16} /></Link>
        <button onClick={logout} disabled={busy}><LogOut size={17} /> Cerrar sesión</button>
      </div>
    </aside>
    <main className="studio-main">
      <header className="studio-top"><span><LayoutDashboard size={17} /> EL TALLER DE ÚRSULA</span><Link href="/" target="_blank">Visitar tienda <ArrowUpRight size={15} /></Link></header>
      <div className="studio-content">
        <div className="section-heading"><div><p className="eyebrow">TODO COMIENZA CON UNA IDEA</p><h1>{TITLES[tab]}</h1></div>{tab === 'pieces' && <button className="button" onClick={() => edit()}><Plus size={17} /> Nueva pieza</button>}</div>
        {message && <p className="success-box" role="status"><Check size={17} />{message}</p>}
        {error && !editing && !deleting && !openOrder && <p className="error-box" role="alert">{error}</p>}

        {tab === 'summary' && <>
          <div className="stats-grid">
            <div><span>Ventas (30 días)</span><strong>{summary.totals.length ? summary.totals.map(([c, n]) => formatMinor(n, c, 'es')).join(' · ') : '—'}</strong></div>
            <div><span>Pedidos por despachar</span><strong>{String(summary.toShip).padStart(2, '0')}</strong></div>
            <div><span>Piezas publicadas</span><strong>{String(pieces.filter(p => p.status === 'Publicado').length).padStart(2, '0')}</strong></div>
            <div><span>Pasos de lanzamiento pendientes</span><strong>{String(pending).padStart(2, '0')}</strong></div>
          </div>
          {summary.attention > 0 && <p className="error-box" role="alert"><AlertTriangle size={16} /> {summary.attention} pedido(s) pagado(s) requieren tu atención (inventario insuficiente). Ábrelos en “Pedidos”.</p>}
          {summary.low.length > 0 && <div className="settings-card"><span className="step-label">STOCK BAJO</span>{summary.low.map(p => <p key={p.id}>{p.name} · quedan {p.stock}</p>)}</div>}
          <Checklist status={status} />
        </>}

        {tab === 'pieces' && <>
          <div className="stats-grid">
            <div><span>Piezas en tu taller</span><strong>{pieces.length.toString().padStart(2, '0')}</strong></div>
            <div><span>Publicadas</span><strong>{pieces.filter(p => p.status === 'Publicado').length.toString().padStart(2, '0')}</strong></div>
            <div><span>En borrador</span><strong>{pieces.filter(p => p.status === 'Borrador').length.toString().padStart(2, '0')}</strong></div>
            <div><span>Destacadas</span><strong>{pieces.filter(p => p.featured && p.status === 'Publicado').length.toString().padStart(2, '0')}</strong></div>
          </div>
          <div className="studio-filters">
            <label><Search size={17} /><input aria-label="Buscar piezas" placeholder="Buscar una pieza…" value={filter} onChange={e => setFilter(e.target.value)} /></label>
            <select aria-label="Filtrar por visibilidad" value={visibility} onChange={e => setVisibility(e.target.value)}><option>Todas</option><option>Publicado</option><option>Borrador</option></select>
          </div>
          <div className="admin-products">{shownPieces.map(p => <article key={p.id}>
            <Photo photo={p.images[0]} alt={p.name} />
            <div className="admin-product-body">
              <span className={`status ${p.status === 'Borrador' ? 'draft' : ''}`}>{p.status}</span>
              <h2>{p.name}</h2>
              <p>{p.category} · {formatMinor(p.price, 'CLP', 'es')}</p>
              <p className="tiny-label">STOCK {p.stock}{p.stock <= 1 && p.kind === 'Producto' ? ' ⚠' : ''} · ORDEN {p.order}{p.featured ? ' · DESTACADA' : ''}{p.translations?.en?.name ? ' · EN ✓' : ' · SIN INGLÉS'}</p>
              <div className="admin-actions">
                <button onClick={() => edit(p)}><Pencil size={15} /> Editar</button>
                <button className="icon-button" aria-label={`Duplicar ${p.name}`} onClick={() => edit(p, true)}><Copy size={16} /></button>
                <button className="icon-button" aria-label={`Eliminar ${p.name}`} onClick={() => { setError(''); setDeleting(p); }}><Trash2 size={16} /></button>
              </div>
            </div>
          </article>)}</div>
          {!shownPieces.length && <div className="empty-state"><Package size={30} /><h2>No hay piezas para mostrar.</h2><button className="button" onClick={() => edit()}>Crear una pieza <Plus size={16} /></button></div>}
        </>}

        {tab === 'orders' && <>
          <div className="studio-filters">
            <select aria-label="Filtrar pedidos" value={orderFilter} onChange={e => setOrderFilter(e.target.value)}><option value="all">Todos los pedidos</option><option value="open">Por despachar / en camino</option>{Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <a className="button outline" href="/api/orders?format=csv"><Download size={16} /> Exportar CSV</a>
          </div>
          <p className="admin-explainer">Los pedidos pagados descuentan el inventario solos. Los pedidos de prueba (simulador) nunca descuentan inventario.</p>
          {shownOrders.length ? <div className="orders-table"><table><thead><tr><th>Pedido / fecha</th><th>Cliente</th><th>Piezas</th><th>Total</th><th>Estado</th></tr></thead><tbody>{shownOrders.map(o => <tr key={o.id} className="clickable" onClick={() => { setTracking({ carrier: o.tracking?.carrier || '', code: o.tracking?.code || '', url: o.tracking?.url || '' }); setError(''); setOpenOrder(o); }}>
            <td><strong>#{o.number}</strong><small>{new Date(o.created).toLocaleString('es-CL')}</small><small>{PROVIDER[o.provider]}{o.attention ? ' · ⚠ requiere atención' : ''}</small></td>
            <td>{o.customer.name}<small>{o.customer.email}</small><small>{o.shipping.country}</small></td>
            <td>{o.items.map(i => <small key={i.id}>{i.name} × {i.quantity}</small>)}</td>
            <td>{formatMinor(o.charge.total, o.charge.currency, 'es')}</td>
            <td><span className={`status ${effective(o)}`}>{STATUS[effective(o)]}</span></td>
          </tr>)}</tbody></table></div> : <div className="empty-state"><ShoppingBag size={32} /><h2>Aún no hay pedidos.</h2><p>Cuando alguien compre, lo verás aquí y podrás gestionar su despacho.</p></div>}
        </>}

        {tab === 'store' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Los textos de tu tienda quedaron actualizados.')}>
          <div className="settings-card"><span className="step-label">01 / PORTADA Y COLECCIÓN · ESPAÑOL</span>
            <label className="field">Título de portada<input required minLength={5} maxLength={100} value={settings.headline} onChange={e => text('headline', e.target.value)} /><small>Una coma separa las dos líneas del título.</small></label>
            <label className="field">Introducción<textarea required minLength={10} maxLength={500} rows={3} value={settings.introduction} onChange={e => text('introduction', e.target.value)} /></label>
            <label className="field">Título de la colección<input required maxLength={100} minLength={3} value={settings.collectionTitle} onChange={e => text('collectionTitle', e.target.value)} /></label>
            <label className="field">El universo de Úrsula<textarea required minLength={10} maxLength={2000} rows={5} value={settings.story} onChange={e => text('story', e.target.value)} /></label></div>
          <div className="settings-card"><span className="step-label">02 / PORTADA Y COLECCIÓN · ENGLISH</span><p className="field-help">Lo que verán las visitas que usan la tienda en inglés (/en).</p>
            <label className="field">Cover title<input required minLength={5} maxLength={100} value={settings.en.headline} onChange={e => text('en', { ...settings.en, headline: e.target.value })} /></label>
            <label className="field">Introduction<textarea required minLength={10} maxLength={500} rows={3} value={settings.en.introduction} onChange={e => text('en', { ...settings.en, introduction: e.target.value })} /></label>
            <label className="field">Collection title<input required maxLength={100} minLength={3} value={settings.en.collectionTitle} onChange={e => text('en', { ...settings.en, collectionTitle: e.target.value })} /></label>
            <label className="field">Úrsula’s world<textarea required minLength={10} maxLength={2000} rows={5} value={settings.en.story} onChange={e => text('en', { ...settings.en, story: e.target.value })} /></label></div>
          <div className="settings-card"><span className="step-label">03 / CONTACTO</span>
            <label className="field">Perfil de Instagram<input type="url" required value={settings.instagram} onChange={e => text('instagram', e.target.value)} /></label>
            <label className="field">Correo de la tienda<input type="email" maxLength={200} value={settings.contactEmail} onChange={e => text('contactEmail', e.target.value)} /><small>Recibe aquí el aviso de cada pedido y se muestra como contacto.</small></label>
            <label className="field">WhatsApp (con código de país, ej. +56912345678)<input maxLength={16} value={settings.whatsapp} onChange={e => text('whatsapp', e.target.value)} /></label></div>
          <button className="button" disabled={busy}><Save size={17} />{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>}

        {tab === 'shipping' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Tarifas y tipo de cambio guardados.')}>
          <div className="settings-card"><span className="step-label">01 / TIPO DE CAMBIO</span>
            <label className="field">Pesos chilenos por 1 dólar (USD)<input type="number" min={100} max={5000} step={1} required value={settings.usdRate} onChange={e => text('usdRate', Number(e.target.value))} /><small>PayPal cobra en dólares: el precio en USD de cada pieza se calcula con este valor. Revísalo de vez en cuando.</small></label></div>
          {(['chile', 'latam', 'world'] as const).map((id, i) => <div className="settings-card" key={id}><span className="step-label">0{i + 2} / {id === 'chile' ? 'CHILE' : id === 'latam' ? 'LATINOAMÉRICA' : 'RESTO DEL MUNDO'}</span>
            <label className="check-field"><input type="checkbox" checked={settings.shipping[id].enabled} onChange={e => zone(id, { enabled: e.target.checked })} /> Realizo envíos a esta zona</label>
            <div className="form-row"><label className="field">Costo de envío (CLP)<input type="number" min={0} step={1} required value={settings.shipping[id].cost} onChange={e => zone(id, { cost: Number(e.target.value) })} /></label>
              <label className="field">Plazo estimado (español)<input maxLength={100} value={settings.shipping[id].eta} onChange={e => zone(id, { eta: e.target.value })} /></label></div>
            <label className="field">Estimated time (English)<input maxLength={100} value={settings.shipping[id].etaEn} onChange={e => zone(id, { etaEn: e.target.value })} /></label></div>)}
          <p className="field-help">Mercado Pago se ofrece solo para envíos a Chile (pesos). PayPal se ofrece en todos los países.</p>
          <button className="button" disabled={busy}><Save size={17} />{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>}

        {tab === 'policies' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Las políticas quedaron actualizadas.')}>
          <p className="admin-explainer">Estos textos son borradores generales. Revísalos (idealmente con asesoría legal) antes de abrir la tienda: se publican en /terminos, /privacidad y /envios-y-devoluciones. Separa los párrafos con una línea en blanco.</p>
          <div className="studio-filters"><select aria-label="Idioma de las políticas" value={policyLang} onChange={e => setPolicyLang(e.target.value as 'es' | 'en')}><option value="es">Español</option><option value="en">English</option></select></div>
          {(['terms', 'privacy', 'shipping'] as const).map(doc => <div className="settings-card" key={doc}><label className="field">{doc === 'terms' ? 'Condiciones de compra' : doc === 'privacy' ? 'Política de privacidad' : 'Envíos y devoluciones'}<textarea rows={12} maxLength={20000} value={settings.policies[policyLang][doc]} onChange={e => setSettings(s => ({ ...s, policies: { ...s.policies, [policyLang]: { ...s.policies[policyLang], [doc]: e.target.value } } }))} /></label></div>)}
          <button className="button" disabled={busy}><Save size={17} />{busy ? 'Guardando…' : 'Guardar políticas'}</button>
        </form>}

        {tab === 'payments' && <>
          <Checklist status={status} />
          <div className="settings-card"><span className="step-label">MERCADO PAGO · PESOS CHILENOS</span>
            <p><span className={`pill ${status.providers.mercadopago.configured ? 'ok' : ''}`}>{status.providers.mercadopago.configured ? 'CREDENCIALES CARGADAS' : 'SIN CREDENCIALES'}</span> {status.providers.mercadopago.webhookSecret ? '· firma de webhook configurada' : '· falta MP_WEBHOOK_SECRET'}</p>
            <p className="field-help">En Mercado Pago Developers → tu aplicación → Webhooks, registra esta URL para el evento “Pagos”:</p><code className="code-line">{status.providers.mercadopago.webhookUrl}</code></div>
          <div className="settings-card"><span className="step-label">PAYPAL · DÓLARES (USD)</span>
            <p><span className={`pill ${status.providers.paypal.configured ? 'ok' : ''}`}>{status.providers.paypal.configured ? `CREDENCIALES CARGADAS · ${status.providers.paypal.environment === 'live' ? 'PRODUCCIÓN' : 'SANDBOX'}` : 'SIN CREDENCIALES'}</span> {status.providers.paypal.webhookId ? '· webhook configurado' : '· falta PAYPAL_WEBHOOK_ID'}</p>
            <p className="field-help">En PayPal Developer → tu app → Webhooks, registra esta URL con los eventos PAYMENT.CAPTURE.COMPLETED, DENIED y REFUNDED:</p><code className="code-line">{status.providers.paypal.webhookUrl}</code></div>
          <div className="settings-card"><span className="step-label">SITIO Y BUSCADORES</span>
            <p>Dirección pública: <strong>{status.siteUrl}</strong></p><p>Indexación en Google: <strong>{status.indexing ? 'activada' : 'desactivada (la tienda aún no es visible en buscadores)'}</strong></p>
            <p className="field-help">Las claves y secretos se configuran en el servidor (archivo .env) y nunca se muestran ni se guardan en este panel.</p></div>
        </>}

        {tab === 'security' && <form className="settings-form" onSubmit={changePassword}>
          <div className="settings-card"><span className="step-label">CAMBIAR CONTRASEÑA</span>
            <label className="field">Contraseña actual<input name="current" type="password" required autoComplete="current-password" maxLength={256} /></label>
            <label className="field">Nueva contraseña (mínimo 12 caracteres)<input name="next" type="password" required minLength={12} autoComplete="new-password" maxLength={256} /></label>
            <label className="field">Repite la nueva contraseña<input name="repeat" type="password" required minLength={12} autoComplete="new-password" maxLength={256} /></label>
            <p className="field-help">Al cambiarla se cierran todas las sesiones abiertas y volverás a iniciar sesión.</p></div>
          <button className="button" disabled={busy}><KeyRound size={17} />{busy ? 'Guardando…' : 'Cambiar contraseña'}</button>
        </form>}
      </div>
    </main>

    <Modal open={editing} onClose={() => { if (!busy && !uploading) setEditing(false); }} title={draft.id ? 'Editar pieza' : 'Una nueva pieza'} description="Fotografías, detalles y una historia por contar." className="editor-modal">
      <form onSubmit={savePiece}>
        <div className="editor-grid">
          <div>
            <label className="upload-zone"><ImagePlus size={30} /><strong>{uploading ? 'Subiendo fotografías…' : 'Agregar fotografías'}</strong><span>JPG, PNG o WebP · Hasta 6 MB</span><span>Máximo 8 fotos. La primera es la portada.</span>
              <input aria-label="Subir fotografías" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || uploading} onChange={e => { void upload(e.target.files); e.target.value = ''; }} /></label>
            <div className="editor-photos">{draft.images.map((image, index) => <div key={image.url}><Photo photo={image} alt={`Fotografía ${index + 1}`} /><div className="photo-tools">
              <button type="button" aria-label={`Mover foto ${index + 1} antes`} disabled={index === 0} onClick={() => movePhoto(index, -1)}><ArrowUp size={14} /></button><span>{index === 0 ? 'Portada' : `Foto ${index + 1}`}</span>
              <button type="button" aria-label={`Mover foto ${index + 1} después`} disabled={index === draft.images.length - 1} onClick={() => movePhoto(index, 1)}><ArrowDown size={14} /></button>
              <button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => setDraft(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}><X size={14} /></button></div>
              <input aria-label={`Descripción de foto ${index + 1}`} placeholder="Descripción de la foto (también sirve para buscadores y accesibilidad)" maxLength={200} value={image.caption} onChange={e => setDraft(p => ({ ...p, images: p.images.map((im, i) => (i === index ? { ...im, caption: e.target.value } : im)) }))} /></div>)}</div>
          </div>
          <div>
            <div className="lang-tabs" role="tablist"><button type="button" role="tab" aria-selected={!english} className={!english ? 'active' : ''} onClick={() => setEnglish(false)}>Español</button><button type="button" role="tab" aria-selected={english} className={english ? 'active' : ''} onClick={() => setEnglish(true)}>English</button></div>
            {english ? <>
              <p className="field-help">Opcional pero recomendado: así la pieza se encuentra en Google en inglés. Si lo dejas vacío se muestra el texto en español.</p>
              <label className="field">Piece name<input maxLength={100} value={en.name} onChange={e => setEn({ name: e.target.value })} /></label>
              <label className="field">Story and description<textarea rows={5} maxLength={4000} value={en.description} onChange={e => setEn({ description: e.target.value })} /></label>
              <label className="field">Materials and technique<input maxLength={150} value={en.material} onChange={e => setEn({ material: e.target.value })} /></label>
              <label className="field">Cover photo description<input maxLength={200} value={en.caption} onChange={e => setEn({ caption: e.target.value })} /></label>
            </> : <>
              <label className="field">Nombre de la pieza<input required minLength={2} maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
              <label className="field">Dirección en internet (slug)<input maxLength={80} placeholder={slugify(draft.name) || 'se genera sola'} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug || ''} onChange={e => setDraft({ ...draft, slug: e.target.value.toLowerCase() })} /><small>Aparece en el enlace de la pieza. Déjalo vacío para generarlo desde el nombre; no lo cambies si ya compartiste el enlace.</small></label>
              <div className="form-row">
                <label className="field">Categoría<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as Piece['category'] })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
                <label className="field">Tipo<select value={draft.kind} onChange={e => setDraft({ ...draft, kind: e.target.value as Piece['kind'] })}><option>Producto</option><option>Trabajo</option></select></label>
              </div>
              <label className="field">Historia y descripción<textarea required minLength={10} maxLength={4000} rows={4} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
              <label className="field">Materiales y técnica<input maxLength={150} value={draft.material} onChange={e => setDraft({ ...draft, material: e.target.value })} /></label>
              <div className="form-row">
                <label className="field">Precio (CLP)<input type="number" min={1} max={100000000} step={1} required value={draft.price || ''} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /></label>
                <label className="field">Stock<input type="number" min={0} max={10000} step={1} required value={draft.stock} onChange={e => setDraft({ ...draft, stock: Number(e.target.value) })} /></label>
              </div>
              <div className="form-row">
                <label className="field">Visibilidad<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Piece['status'] })}><option>Borrador</option><option>Publicado</option></select></label>
                <label className="field">Disponibilidad<select value={draft.availability} onChange={e => setDraft({ ...draft, availability: e.target.value as Piece['availability'] })}><option>Disponible</option><option>Por encargo</option><option>Vendido</option></select></label>
              </div>
              <label className="field">Orden en la colección<input type="number" min={0} max={10000} required value={draft.order} onChange={e => setDraft({ ...draft, order: Number(e.target.value) })} /><small>Los números menores aparecen primero.</small></label>
              <label className="check-field"><input type="checkbox" checked={draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Destacar en portada y colección</label>
              <p className="field-help">{draft.status === 'Borrador' ? 'Solo tú puedes ver esta pieza y sus fotografías subidas.' : 'Al guardar, esta pieza aparecerá en la tienda.'}</p>
            </>}
          </div>
        </div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <div className="editor-footer"><button type="button" className="button outline" disabled={busy || uploading} onClick={() => setEditing(false)}>Cancelar</button><button className="button" disabled={busy || uploading || !draft.images.length}><Save size={17} />{busy ? 'Guardando…' : draft.status === 'Publicado' ? 'Guardar y publicar' : 'Guardar borrador'}</button></div>
      </form>
    </Modal>

    <Modal open={!!deleting} onClose={() => { if (!busy) setDeleting(null); }} title="¿Eliminar esta pieza?" description={`“${deleting?.name || ''}” se retirará de la tienda. Esta acción no se puede deshacer.`}>
      {error && <p className="error-box" role="alert">{error}</p>}
      <div className="editor-footer"><button className="button outline" disabled={busy} onClick={() => setDeleting(null)}>Conservar</button><button className="button danger" disabled={busy} onClick={removePiece}>{busy ? 'Eliminando…' : 'Eliminar pieza'}</button></div>
    </Modal>

    <Modal open={!!openOrder} onClose={() => { if (!busy) setOpenOrder(null); }} title={openOrder ? `Pedido #${openOrder.number}` : 'Pedido'} description={openOrder ? `${new Date(openOrder.created).toLocaleString('es-CL')} · ${PROVIDER[openOrder.provider]}` : ''} className="order-modal">
      {openOrder && <div className="order-detail">
        <p><span className={`status ${effective(openOrder)}`}>{STATUS[effective(openOrder)]}</span> <strong>{formatMinor(openOrder.charge.total, openOrder.charge.currency, 'es')}</strong> <small>(envío {formatMinor(openOrder.charge.shipping, openOrder.charge.currency, 'es')})</small></p>
        {openOrder.attention && <p className="error-box"><AlertTriangle size={16} /> {openOrder.attention}</p>}
        <div className="detail-columns">
          <div><span className="step-label">CLIENTE</span><p>{openOrder.customer.name}<br /><a href={`mailto:${openOrder.customer.email}`}>{openOrder.customer.email}</a>{openOrder.customer.phone && <><br />{openOrder.customer.phone}</>}</p></div>
          <div><span className="step-label">ENVIAR A</span><p>{openOrder.shipping.address}<br />{openOrder.shipping.city}{openOrder.shipping.region ? `, ${openOrder.shipping.region}` : ''} {openOrder.shipping.postal}<br />{openOrder.shipping.country}{openOrder.shipping.notes && <><br /><em>{openOrder.shipping.notes}</em></>}</p></div>
        </div>
        <span className="step-label">PIEZAS</span>{openOrder.items.map(i => <p key={i.id}>{i.name} × {i.quantity}</p>)}
        {openOrder.payment.ref && <p className="field-help">Referencia de pago: {openOrder.payment.ref}</p>}
        {['paid', 'shipped'].includes(openOrder.status) && <div className="settings-card"><span className="step-label">DESPACHO</span>
          <div className="form-row"><label className="field">Transportista<input maxLength={60} value={tracking.carrier} onChange={e => setTracking({ ...tracking, carrier: e.target.value })} /></label><label className="field">Código de seguimiento<input maxLength={80} value={tracking.code} onChange={e => setTracking({ ...tracking, code: e.target.value })} /></label></div>
          <label className="field">Enlace de seguimiento (opcional)<input type="url" maxLength={300} value={tracking.url} onChange={e => setTracking({ ...tracking, url: e.target.value })} /></label>
          <button className="button" disabled={busy} onClick={() => orderAction({ action: 'ship', ...tracking })}><Truck size={16} /> {openOrder.status === 'shipped' ? 'Actualizar seguimiento' : 'Marcar como despachado'}{!openOrder.tracking && ' y avisar al cliente'}</button></div>}
        <div className="editor-footer">
          {['paid', 'shipped'].includes(openOrder.status) && <button className="button outline" disabled={busy} onClick={() => orderAction({ action: 'deliver' })}><CheckCircle2 size={16} /> Marcar entregado</button>}
          {['pending_payment', 'failed'].includes(openOrder.status) && <button className="button outline" disabled={busy} onClick={() => orderAction({ action: 'cancel' })}>Cancelar pedido</button>}
          {['paid', 'shipped', 'delivered'].includes(openOrder.status) && openOrder.provider !== 'demo' && <button className="button danger" disabled={busy} onClick={() => { if (confirm('Esto solo registra el reembolso y devuelve las piezas al inventario. El dinero se devuelve desde tu cuenta de Mercado Pago o PayPal. ¿Continuar?')) orderAction({ action: 'refund', restock: true }); }}>Registrar reembolso</button>}
        </div>
        <span className="step-label">HISTORIAL</span>{[...openOrder.events].reverse().map((e, i) => <p className="event" key={i}><small>{new Date(e.at).toLocaleString('es-CL')}</small> {e.text}</p>)}
        {error && <p className="error-box" role="alert">{error}</p>}
      </div>}
    </Modal>
  </div>;
}

function Checklist({ status }: { status: StoreStatus }) {
  return <div className="settings-card"><span className="step-label">ANTES DE ABRIR AL PÚBLICO</span><ul className="checklist">{status.checks.map(c => <li key={c.id} className={c.ok ? 'ok' : ''}>{c.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}<div><strong>{c.label}</strong>{!c.ok && <small>{c.hint}</small>}</div></li>)}</ul></div>;
}
