import { applyPayment, fetchPayment, verifySignature } from '@/lib/payments/mercadopago';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const url = new URL(request.url);
  let body: { type?: string; data?: { id?: string | number } } = {};
  try { body = JSON.parse(await request.text() || '{}'); } catch { /* IPN-style notifications carry everything in the query string */ }
  const signedId = url.searchParams.get('data.id') || (body.data?.id != null ? String(body.data.id) : null);
  const dataId = signedId || url.searchParams.get('id');
  const type = url.searchParams.get('type') || url.searchParams.get('topic') || body.type || '';
  if (!verifySignature(request.headers, signedId)) return Response.json({ error: 'Firma inválida.' }, { status: 401 });
  if (type !== 'payment' || !dataId) return Response.json({ ok: true, ignored: true });
  try {
    // The notification only says "payment N changed"; the truth is fetched from Mercado Pago itself.
    await applyPayment(await fetchPayment(dataId));
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Reintenta más tarde.' }, { status: 500 }); }
}
