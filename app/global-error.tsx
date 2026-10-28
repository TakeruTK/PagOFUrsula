'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return <html lang="es"><body style={{ margin: 0, background: '#bec092', color: '#272b00', fontFamily: 'Georgia, serif', display: 'grid', placeItems: 'center', minHeight: '100vh', textAlign: 'center', padding: 24 }}>
    <div>
      <h1 style={{ fontWeight: 300 }}>Algo salió mal</h1>
      <p>Estamos trabajando para solucionarlo. Intenta de nuevo en unos minutos.</p>
      <button onClick={reset} style={{ padding: '12px 26px', border: '1px solid #272b00', background: 'transparent', color: 'inherit', cursor: 'pointer', letterSpacing: '.1em' }}>REINTENTAR</button>
    </div>
  </body></html>;
}
