import { handleWebhook, verifyWebhook } from '@/lib/payments/paypal';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  let event;
  try { event = JSON.parse(await request.text()); } catch { return Response.json({ error: 'Contenido inválido.' }, { status: 400 }); }
  try {
    if (!await verifyWebhook(request.headers, event)) return Response.json({ error: 'Firma inválida.' }, { status: 401 });
    await handleWebhook(event);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'Reintenta más tarde.' }, { status: 500 }); }
}
