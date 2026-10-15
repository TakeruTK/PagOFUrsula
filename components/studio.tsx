'use client';
import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, CheckCircle2, Circle, Copy, FileText, Home, ImagePlus, Images, KeyRound, LayoutDashboard, LogOut, Package, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { categories, slugify, type Photo as PhotoType, type Piece, type Settings } from '@/lib/pieces';
import type { StoreStatus } from '@/lib/status';
import { Brand } from './brand';
import Modal from './modal';
import Photo from './photo';

type Tab = 'summary' | 'pieces' | 'images' | 'store' | 'policies' | 'security';
type Target = 'hero' | 'about';
type Draft = Omit<Piece, 'id' | 'slug'> & { id?: string; slug?: string };
const emptyEn = { name: '', description: '', material: '', caption: '' };
const blank = (): Draft => ({ name: '', category: 'Aros', description: '', material: '', price: 0, order: 0, featured: false, status: 'Borrador', availability: 'Disponible', images: [], translations: { en: { ...emptyEn } } });
const TABS: [Tab, string, React.ReactNode][] = [
  ['summary', 'Resumen', <LayoutDashboard size={19} key="a" />], ['pieces', 'Mis piezas', <Package size={19} key="b" />], ['images', 'Fotos del inicio', <Images size={19} key="f" />], ['store', 'Mi página', <Home size={19} key="c" />],
  ['policies', 'Políticas', <FileText size={19} key="d" />], ['security', 'Seguridad', <KeyRound size={19} key="e" />],
];
const TITLES: Record<Tab, string> = { summary: 'Tu página de un vistazo.', pieces: 'Tus piezas, tu universo.', images: 'Las fotos de tu portada.', store: 'Una página que habla de ti.', policies: 'Reglas claras, consultas tranquilas.', security: 'Tu taller, protegido.' };

export default function Studio({ initialPieces, initialSettings, initialStatus }: { initialPieces: Piece[]; initialSettings: Settings; initialStatus: StoreStatus }) {
  const [pieces, setPieces] = useState(initialPieces);
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState(initialStatus);
  const [tab, setTab] = useState<Tab>('summary');
  const [filter, setFilter] = useState('');
  const [visibility, setVisibility] = useState('Todas');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank());
  const [english, setEnglish] = useState(false);
  const [deleting, setDeleting] = useState<Piece | null>(null);
  const [picker, setPicker] = useState<Target | null>(null);
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

  const refreshPieces = async () => setPieces(await api('/api/pieces'));
  const refreshStatus = async () => setStatus(await api('/api/admin/status'));
  function edit(piece?: Piece, copy = false) {
    const base = piece ? structuredClone(piece) : { ...blank(), order: pieces.length };
    if (copy && piece) { delete (base as Draft).id; delete (base as Draft).slug; base.name = `${piece.name} (copia)`; base.status = 'Borrador'; base.featured = false; }
    base.translations = { en: { ...emptyEn, ...(base.translations?.en || {}) } };
    setDraft(base); setEnglish(false); setError(''); setMessage(''); setEditing(true);
  }
  const savePiece = (event: React.FormEvent) => { event.preventDefault(); void run(async () => { await api('/api/pieces', options(draft.id ? 'PUT' : 'POST', draft)); await Promise.all([refreshPieces(), refreshStatus()]); setEditing(false); setMessage('Pieza guardada. Los cambios ya están en tu página.'); }); };
  async function upload(files: FileList | null) {
    if (!files) return;
    if (files.length + draft.images.length > 8) { setError('Puedes agregar hasta 8 fotografías.'); return; }
    setUploading(true); setError('');
    const added: PhotoType[] = [];
    try { for (const file of Array.from(files)) { const body = new FormData(); body.append('file', file); added.push(await api('/api/photos', { method: 'POST', body })); } }
    catch (e) { setError((e as Error).message); } finally { setDraft(p => ({ ...p, images: [...p.images, ...added] })); setUploading(false); }
  }
  const removePiece = () => void run(async () => { if (!deleting) return; await api('/api/pieces?id=' + deleting.id, { method: 'DELETE' }); await Promise.all([refreshPieces(), refreshStatus()]); setDeleting(null); setMessage('Pieza eliminada.'); });
  const saveSettings = (event: React.FormEvent, note: string) => { event.preventDefault(); void run(async () => { await api('/api/settings', options('PUT', settings)); setSettings(await api('/api/settings')); await refreshStatus(); setMessage(note); }); };
  const logout = () => void run(async () => { await api('/api/admin/logout', { method: 'POST' }); window.location.replace('/admin'); });
  async function selectTab(next: Tab) { setTab(next); setMessage(''); setError(''); if (next === 'summary') try { await refreshStatus(); } catch (e) { setError((e as Error).message); } }
  function movePhoto(index: number, direction: number) { setDraft(p => { const images = [...p.images];[images[index], images[index + direction]] = [images[index + direction], images[index]]; return { ...p, images }; }); }
  const changePassword = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('next') !== form.get('repeat')) { setError('Las contraseñas nuevas no coinciden.'); return; }
    void run(async () => { await api('/api/admin/password', options('POST', { current: form.get('current'), next: form.get('next') })); window.location.replace('/admin'); });
  };

  // ---- Home photos: upload new ones, pick from the pieces, reorder and remove. Saved with the form button.
  async function uploadHome(files: FileList | null, target: Target) {
    if (!files?.length) return;
    const room = target === 'hero' ? 8 - settings.images.hero.length : 1;
    if (room <= 0) { setError('La portada admite hasta 8 fotos. Quita una para agregar otra.'); return; }
    setUploading(true); setError('');
    try {
      const added: PhotoType[] = [];
      for (const file of Array.from(files).slice(0, room)) { const body = new FormData(); body.append('file', file); added.push(await api('/api/photos', { method: 'POST', body })); }
      setSettings(s => target === 'hero' ? { ...s, images: { ...s.images, hero: [...s.images.hero, ...added] } } : { ...s, images: { ...s.images, about: added[0] } });
      setMessage('Foto cargada. Recuerda presionar “Guardar fotos del inicio”.');
    } catch (e) { setError((e as Error).message); } finally { setUploading(false); }
  }
  function choosePhoto(photo: PhotoType) {
    if (picker === 'hero') {
      if (settings.images.hero.length >= 8) { setError('La portada admite hasta 8 fotos.'); setPicker(null); return; }
      setSettings(s => ({ ...s, images: { ...s.images, hero: [...s.images.hero, photo] } }));
    } else setSettings(s => ({ ...s, images: { ...s.images, about: photo } }));
    setPicker(null); setMessage('Foto elegida. Recuerda presionar “Guardar fotos del inicio”.');
  }
  const heroPhotos = (patch: (list: PhotoType[]) => PhotoType[]) => setSettings(s => ({ ...s, images: { ...s.images, hero: patch(s.images.hero) } }));
  function moveHero(index: number, direction: number) { heroPhotos(list => { const next = [...list];[next[index], next[index + direction]] = [next[index + direction], next[index]]; return next; }); }
  const photoKey = (i: PhotoType) => i.url + JSON.stringify(i.crop || '');
  const library = Array.from(new Map([...pieces.flatMap(p => p.images.map(i => [photoKey(i), { photo: i, label: p.name }] as const)), ...settings.images.hero.map(i => [photoKey(i), { photo: i, label: 'Portada' }] as const)]).values());

  const shownPieces = pieces.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) && (visibility === 'Todas' || p.status === visibility));
  const text = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings(s => ({ ...s, [key]: value }));
  const en = draft.translations?.en || emptyEn;
  const setEn = (patch: Partial<typeof emptyEn>) => setDraft(d => ({ ...d, translations: { en: { ...emptyEn, ...(d.translations?.en || {}), ...patch } } }));
  const pending = status.checks.filter(c => !c.ok).length;
  const count = (s: string) => pieces.filter(p => p.status === s).length.toString().padStart(2, '0');

  return <div className="studio-shell">
    <aside className="studio-sidebar">
      <Brand tone="light" /><p className="tiny-label">TU ESPACIO DE CREACIÓN</p>
      <nav>{TABS.map(([id, label, icon]) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => selectTab(id)}>{icon} {label}{id === 'pieces' && <span>{pieces.length}</span>}{id === 'summary' && pending > 0 && <span>{pending}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <Link href="/" target="_blank">Ver mi página <ArrowUpRight size={16} /></Link>
        <button onClick={logout} disabled={busy}><LogOut size={17} /> Cerrar sesión</button>
      </div>
    </aside>
    <main className="studio-main">
      <header className="studio-top"><span><LayoutDashboard size={17} /> EL TALLER DE URSULA</span><Link href="/" target="_blank">Visitar página <ArrowUpRight size={15} /></Link></header>
      <div className="studio-content">
        <div className="section-heading"><div><p className="eyebrow">TODO COMIENZA CON UNA IDEA</p><h1>{TITLES[tab]}</h1></div>{tab === 'pieces' && <button className="button" onClick={() => edit()}><Plus size={17} /> Nueva pieza</button>}</div>
        {message && <p className="success-box" role="status"><Check size={17} />{message}</p>}
        {error && !editing && !deleting && <p className="error-box" role="alert">{error}</p>}

        {tab === 'summary' && <>
          <div className="stats-grid">
            <div><span>Piezas en tu taller</span><strong>{pieces.length.toString().padStart(2, '0')}</strong></div>
            <div><span>Publicadas</span><strong>{count('Publicado')}</strong></div>
            <div><span>En borrador</span><strong>{count('Borrador')}</strong></div>
            <div><span>Pasos pendientes</span><strong>{String(pending).padStart(2, '0')}</strong></div>
          </div>
          <div className="settings-card"><span className="step-label">ANTES DE ABRIR AL PÚBLICO</span><ul className="checklist">{status.checks.map(c => <li key={c.id} className={c.ok ? 'ok' : ''}>{c.ok ? <CheckCircle2 size={18} /> : <Circle size={18} />}<div><strong>{c.label}</strong>{!c.ok && <small>{c.hint}</small>}</div></li>)}</ul></div>
          <div className="settings-card"><span className="step-label">DIRECCIÓN Y BUSCADORES</span>
            <p>Dirección pública: <strong>{status.siteUrl}</strong></p><p>Indexación en Google: <strong>{status.indexing ? 'activada' : 'desactivada (la página aún no aparece en buscadores)'}</strong></p>
            <p className="field-help">La dirección y la visibilidad en Google se configuran en el servidor, no en este panel.</p></div>
        </>}

        {tab === 'pieces' && <>
          <div className="studio-filters">
            <label><Search size={17} /><input aria-label="Buscar piezas" placeholder="Buscar una pieza…" value={filter} onChange={e => setFilter(e.target.value)} /></label>
            <select aria-label="Filtrar por visibilidad" value={visibility} onChange={e => setVisibility(e.target.value)}><option>Todas</option><option>Publicado</option><option>Borrador</option></select>
          </div>
          <div className="admin-products">{shownPieces.map(p => <article key={p.id}>
            <Photo photo={p.images[0]} alt={p.name} />
            <div className="admin-product-body">
              <span className={`status ${p.status === 'Borrador' ? 'draft' : ''}`}>{p.status}</span>
              <h2>{p.name}</h2>
              <p>{p.category} · {p.availability}</p>
              <p className="tiny-label">ORDEN {p.order}{p.featured ? ' · PORTADA' : ''}{p.translations?.en?.name ? ' · EN ✓' : ' · SIN INGLÉS'}</p>
              <div className="admin-actions">
                <button onClick={() => edit(p)}><Pencil size={15} /> Editar</button>
                <button className="icon-button" aria-label={`Duplicar ${p.name}`} onClick={() => edit(p, true)}><Copy size={16} /></button>
                <button className="icon-button" aria-label={`Eliminar ${p.name}`} onClick={() => { setError(''); setDeleting(p); }}><Trash2 size={16} /></button>
              </div>
            </div>
          </article>)}</div>
          {!shownPieces.length && <div className="empty-state"><Package size={30} /><h2>No hay piezas para mostrar.</h2><button className="button" onClick={() => edit()}>Crear una pieza <Plus size={16} /></button></div>}
        </>}

        {tab === 'images' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Las fotos del inicio quedaron guardadas.')}>
          <p className="admin-explainer">Aquí eliges las fotografías que se ven en el inicio de tu página. Los cambios se publican al presionar <strong>Guardar fotos del inicio</strong>. Si no eliges ninguna, la página usa las fotos de tus piezas destacadas.</p>
          <div className="settings-card">
            <span className="step-label">01 / PORTADA · FOTOS FLOTANTES</span>
            <p className="field-help">Son las láminas que flotan en 3D alrededor de tu nombre al abrir la página. Entre 4 y 8 fotos se ven mejor. La primera también es el fondo de la portada en equipos antiguos. Usa fotos verticales o cuadradas, con buena luz.</p>
            <div className="slot-actions" style={{ marginTop: 0 }}>
              <label className="button small" style={{ position: 'relative', cursor: 'pointer' }}><ImagePlus size={16} /> {uploading ? 'Subiendo…' : 'Subir fotos'}<input aria-label="Subir fotos de la portada" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || uploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => { void uploadHome(e.target.files, 'hero'); e.target.value = ''; }} /></label>
              <button type="button" className="button outline small" onClick={() => setPicker('hero')}>Elegir de mis piezas</button>
              {settings.images.hero.length > 0 && <button type="button" className="button outline small" onClick={() => heroPhotos(() => [])}>Volver a la selección automática</button>}
            </div>
            {settings.images.hero.length ? <div className="photo-grid">{settings.images.hero.map((image, index) => <div className="photo-card" key={image.url + index}>
              <Photo photo={image} alt={`Foto ${index + 1} de la portada`} />
              <div className="photo-tools">
                <button type="button" aria-label={`Mover foto ${index + 1} antes`} disabled={index === 0} onClick={() => moveHero(index, -1)}><ArrowUp size={14} /></button><span>{index === 0 ? 'Principal' : `Foto ${index + 1}`}</span>
                <button type="button" aria-label={`Mover foto ${index + 1} después`} disabled={index === settings.images.hero.length - 1} onClick={() => moveHero(index, 1)}><ArrowDown size={14} /></button>
                <button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => heroPhotos(list => list.filter((_, i) => i !== index))}><X size={14} /></button>
              </div>
              <input aria-label={`Descripción de la foto ${index + 1}`} placeholder="Descripción breve (opcional)" maxLength={200} value={image.caption} onChange={e => heroPhotos(list => list.map((im, i) => (i === index ? { ...im, caption: e.target.value } : im)))} />
            </div>)}</div> : <p className="field-help" style={{ marginTop: 18, marginBottom: 0 }}>Ahora la portada usa automáticamente las fotos de tus piezas destacadas.</p>}
          </div>
          <div className="settings-card">
            <span className="step-label">02 / SOBRE MÍ · FOTOGRAFÍA</span>
            <p className="field-help">Es la foto grande de la página “Sobre mí”. Funciona mejor una foto vertical: tu taller, tus manos trabajando o una joya en detalle.</p>
            <div className="slot">
              {settings.images.about ? <Photo photo={settings.images.about} alt="Foto de Sobre mí" /> : <div className="slot-empty">Ahora se usa la foto de una de tus piezas. Sube la tuya para reemplazarla.</div>}
              <div>
                <label className="field">Descripción de la foto (opcional)<input maxLength={200} disabled={!settings.images.about} value={settings.images.about?.caption || ''} onChange={e => setSettings(s => (s.images.about ? { ...s, images: { ...s.images, about: { ...s.images.about, caption: e.target.value } } } : s))} /><small>Ayuda a los buscadores y a quienes usan lectores de pantalla.</small></label>
                <div className="slot-actions">
                  <label className="button small" style={{ position: 'relative', cursor: 'pointer' }}><ImagePlus size={16} /> {settings.images.about ? 'Cambiar foto' : 'Subir foto'}<input aria-label="Subir foto de Sobre mí" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || uploading} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} onChange={e => { void uploadHome(e.target.files, 'about'); e.target.value = ''; }} /></label>
                  <button type="button" className="button outline small" onClick={() => setPicker('about')}>Elegir de mis piezas</button>
                  {settings.images.about && <button type="button" className="button outline small" onClick={() => setSettings(s => ({ ...s, images: { ...s.images, about: null } }))}>Quitar</button>}
                </div>
              </div>
            </div>
          </div>
          <div className="slot-actions" style={{ marginTop: 0 }}>
            <button className="button" disabled={busy || uploading}><Save size={17} />{busy ? 'Guardando…' : 'Guardar fotos del inicio'}</button>
            <Link className="button outline" href="/es" target="_blank">Ver cómo queda <ArrowUpRight size={16} /></Link>
          </div>
          <p className="field-help" style={{ marginTop: 16 }}>Formatos JPG, PNG o WebP, hasta 6 MB por foto.</p>
        </form>}

        {tab === 'store' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Los cambios de tu página quedaron guardados.')}>
          <div className="settings-card"><span className="step-label">01 / PORTADA Y TEXTOS · ESPAÑOL</span>
            <label className="field">Frase de la portada<input required minLength={5} maxLength={100} value={settings.headline} onChange={e => text('headline', e.target.value)} /></label>
            <label className="field">Introducción (destacada en “Sobre mi trabajo”)<textarea required minLength={10} maxLength={500} rows={3} value={settings.introduction} onChange={e => text('introduction', e.target.value)} /></label>
            <label className="field">Sobre mi trabajo<textarea required minLength={10} maxLength={2000} rows={6} value={settings.story} onChange={e => text('story', e.target.value)} /><small>Separa los párrafos con una línea en blanco.</small></label>
            <label className="field">Título de la sección de piezas<input required maxLength={100} minLength={3} value={settings.collectionTitle} onChange={e => text('collectionTitle', e.target.value)} /></label></div>
          <div className="settings-card"><span className="step-label">02 / PORTADA Y TEXTOS · ENGLISH</span><p className="field-help">Lo que verán las visitas que usan la página en inglés (/en).</p>
            <label className="field">Cover phrase<input required minLength={5} maxLength={100} value={settings.en.headline} onChange={e => text('en', { ...settings.en, headline: e.target.value })} /></label>
            <label className="field">Introduction<textarea required minLength={10} maxLength={500} rows={3} value={settings.en.introduction} onChange={e => text('en', { ...settings.en, introduction: e.target.value })} /></label>
            <label className="field">About my work<textarea required minLength={10} maxLength={2000} rows={6} value={settings.en.story} onChange={e => text('en', { ...settings.en, story: e.target.value })} /></label>
            <label className="field">Pieces section title<input required maxLength={100} minLength={3} value={settings.en.collectionTitle} onChange={e => text('en', { ...settings.en, collectionTitle: e.target.value })} /></label></div>
          <div className="settings-card"><span className="step-label">03 / CONTACTO</span><p className="field-help">Las ventas se conversan directamente: cada pieza lleva un botón que abre WhatsApp con un mensaje listo.</p>
            <label className="field">WhatsApp (con código de país, ej. +56912345678)<input maxLength={16} value={settings.whatsapp} onChange={e => text('whatsapp', e.target.value)} /></label>
            <label className="field">Correo de contacto<input type="email" maxLength={200} value={settings.contactEmail} onChange={e => text('contactEmail', e.target.value)} /></label>
            <label className="field">Perfil de Instagram<input type="url" required placeholder="https://www.instagram.com/tu_usuario/" value={settings.instagram} onChange={e => text('instagram', e.target.value)} /></label>
            <label className="field">Perfil de Facebook (opcional)<input type="url" placeholder="https://www.facebook.com/tu.pagina" value={settings.facebook} onChange={e => text('facebook', e.target.value)} /><small>Si lo dejas vacío, no se muestra en la página.</small></label>
            <label className="field">Perfil de TikTok (opcional)<input type="url" placeholder="https://www.tiktok.com/@tu_usuario" value={settings.tiktok} onChange={e => text('tiktok', e.target.value)} /><small>Copia la dirección de tu perfil. Si lo dejas vacío, no se muestra.</small></label></div>
          <div className="settings-card"><span className="step-label">04 / VALORES</span>
            <label className="check-field"><input type="checkbox" checked={settings.showPrices} onChange={e => text('showPrices', e.target.checked)} /> Mostrar el valor referencial de cada pieza en la página</label>
            <p className="field-help">Apagado: la página invita a consultar el valor. Encendido: se muestra el valor que escribas en cada pieza (si lo dejas en 0, esa pieza no lo muestra).</p></div>
          <button className="button" disabled={busy}><Save size={17} />{busy ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>}

        {tab === 'policies' && <form className="settings-form" onSubmit={e => saveSettings(e, 'Los textos legales quedaron actualizados.')}>
          <p className="admin-explainer">Estos textos son borradores generales. Revísalos antes de abrir la página: se publican en /terminos y /privacidad. Separa los párrafos con una línea en blanco.</p>
          <div className="studio-filters"><select aria-label="Idioma de los textos" value={policyLang} onChange={e => setPolicyLang(e.target.value as 'es' | 'en')}><option value="es">Español</option><option value="en">English</option></select></div>
          {(['terms', 'privacy'] as const).map(doc => <div className="settings-card" key={doc}><label className="field">{doc === 'terms' ? 'Condiciones de consulta y compra' : 'Política de privacidad'}<textarea rows={12} maxLength={20000} value={settings.policies[policyLang][doc]} onChange={e => setSettings(s => ({ ...s, policies: { ...s.policies, [policyLang]: { ...s.policies[policyLang], [doc]: e.target.value } } }))} /></label></div>)}
          <button className="button" disabled={busy}><Save size={17} />{busy ? 'Guardando…' : 'Guardar textos'}</button>
        </form>}

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
            <label className="upload-zone"><ImagePlus size={30} /><strong>{uploading ? 'Subiendo fotografías…' : 'Agregar fotografías'}</strong><span>JPG, PNG o WebP · Hasta 6 MB</span><span>Máximo 8 fotos. La primera es la portada de la pieza.</span>
              <input aria-label="Subir fotografías" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || uploading} onChange={e => { void upload(e.target.files); e.target.value = ''; }} /></label>
            <div className="editor-photos">{draft.images.map((image, index) => <div className="photo-card" key={image.url}><Photo photo={image} alt={`Fotografía ${index + 1}`} /><div className="photo-tools">
              <button type="button" aria-label={`Mover foto ${index + 1} antes`} disabled={index === 0} onClick={() => movePhoto(index, -1)}><ArrowUp size={14} /></button><span>{index === 0 ? 'Portada' : `Foto ${index + 1}`}</span>
              <button type="button" aria-label={`Mover foto ${index + 1} después`} disabled={index === draft.images.length - 1} onClick={() => movePhoto(index, 1)}><ArrowDown size={14} /></button>
              <button type="button" aria-label={`Quitar foto ${index + 1}`} onClick={() => setDraft(p => ({ ...p, images: p.images.filter((_, i) => i !== index) }))}><X size={14} /></button></div>
              <input aria-label={`Descripción de foto ${index + 1}`} placeholder="Descripción de la foto (sirve para buscadores y accesibilidad)" maxLength={200} value={image.caption} onChange={e => setDraft(p => ({ ...p, images: p.images.map((im, i) => (i === index ? { ...im, caption: e.target.value } : im)) }))} /></div>)}</div>
          </div>
          <div>
            <div className="lang-tabs" role="tablist"><button type="button" role="tab" aria-selected={!english} className={!english ? 'active' : ''} onClick={() => setEnglish(false)}>Español</button><button type="button" role="tab" aria-selected={english} className={english ? 'active' : ''} onClick={() => setEnglish(true)}>English</button></div>
            {english ? <>
              <p className="field-help">Recomendado: así la pieza se encuentra en Google en inglés. Si lo dejas vacío se muestra el texto en español.</p>
              <label className="field">Piece name<input maxLength={100} value={en.name} onChange={e => setEn({ name: e.target.value })} /></label>
              <label className="field">Story and description<textarea rows={5} maxLength={4000} value={en.description} onChange={e => setEn({ description: e.target.value })} /></label>
              <label className="field">Materials and technique<input maxLength={150} value={en.material} onChange={e => setEn({ material: e.target.value })} /></label>
              <label className="field">Cover photo description<input maxLength={200} value={en.caption} onChange={e => setEn({ caption: e.target.value })} /></label>
            </> : <>
              <label className="field">Nombre de la pieza<input required minLength={2} maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label>
              <label className="field">Dirección en internet (slug)<input maxLength={80} placeholder={slugify(draft.name) || 'se genera sola'} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={draft.slug || ''} onChange={e => setDraft({ ...draft, slug: e.target.value.toLowerCase() })} /><small>Aparece en el enlace de la pieza. Déjalo vacío para generarlo desde el nombre; no lo cambies si ya compartiste el enlace.</small></label>
              <div className="form-row">
                <label className="field">Categoría<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as Piece['category'] })}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
                <label className="field">Disponibilidad<select value={draft.availability} onChange={e => setDraft({ ...draft, availability: e.target.value as Piece['availability'] })}><option>Disponible</option><option>Por encargo</option><option>Vendido</option></select></label>
              </div>
              <label className="field">Historia y descripción<textarea required minLength={10} maxLength={4000} rows={4} value={draft.description} onChange={e => setDraft({ ...draft, description: e.target.value })} /></label>
              <label className="field">Materiales y técnica (ej. Plata 950, bronce, oro 18 k)<input maxLength={150} value={draft.material} onChange={e => setDraft({ ...draft, material: e.target.value })} /></label>
              <label className="field">Valor referencial (CLP, opcional)<input type="number" min={0} max={100000000} step={1} value={draft.price || ''} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} /><small>Solo se muestra si activas “Mostrar el valor” en Mi página.</small></label>
              <div className="form-row">
                <label className="field">Visibilidad<select value={draft.status} onChange={e => setDraft({ ...draft, status: e.target.value as Piece['status'] })}><option>Borrador</option><option>Publicado</option></select></label>
                <label className="field">Orden en la página<input type="number" min={0} max={10000} required value={draft.order} onChange={e => setDraft({ ...draft, order: Number(e.target.value) })} /></label>
              </div>
              <label className="check-field"><input type="checkbox" checked={draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Usar su fotografía como fondo de la portada</label>
              <p className="field-help">{draft.status === 'Borrador' ? 'Solo tú puedes ver esta pieza y sus fotografías subidas.' : 'Al guardar, esta pieza aparecerá en tu página.'}</p>
            </>}
          </div>
        </div>
        {error && <p className="error-box" role="alert">{error}</p>}
        <div className="editor-footer"><button type="button" className="button outline" disabled={busy || uploading} onClick={() => setEditing(false)}>Cancelar</button><button className="button" disabled={busy || uploading || !draft.images.length}><Save size={17} />{busy ? 'Guardando…' : draft.status === 'Publicado' ? 'Guardar y publicar' : 'Guardar borrador'}</button></div>
      </form>
    </Modal>

    <Modal open={!!picker} onClose={() => setPicker(null)} title="Elegir una foto" description="Toca la foto que quieres usar. Son las fotografías de tus piezas.">
      <div className="picker-grid">{library.map(({ photo, label }) => <button key={photoKey(photo)} type="button" aria-label={`Usar la foto de ${label}`} onClick={() => choosePhoto(photo)}><Photo photo={photo} alt="" /><small>{label}</small></button>)}</div>
    </Modal>

    <Modal open={!!deleting} onClose={() => { if (!busy) setDeleting(null); }} title="¿Eliminar esta pieza?" description={`“${deleting?.name || ''}” se retirará de tu página. Esta acción no se puede deshacer.`}>
      {error && <p className="error-box" role="alert">{error}</p>}
      <div className="editor-footer"><button className="button outline" disabled={busy} onClick={() => setDeleting(null)}>Conservar</button><button className="button danger" disabled={busy} onClick={removePiece}>{busy ? 'Eliminando…' : 'Eliminar pieza'}</button></div>
    </Modal>
  </div>;
}
