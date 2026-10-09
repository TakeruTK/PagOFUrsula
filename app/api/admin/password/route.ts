import { z } from 'zod';
import { changePassword, protect } from '@/lib/admin-auth';
import { invalid, jsonBody, withinBudget } from '@/lib/http';
const schema = z.object({ current: z.string().max(256), next: z.string().min(12).max(256) });
export async function POST(request: Request) {
  const denied = await protect(request); if (denied) return denied;
  try {
    if (!withinBudget('password', 8, 15 * 60000)) return Response.json({ error: 'Demasiados intentos. Espera 15 minutos.' }, { status: 429 });
    const input = schema.safeParse(await jsonBody(request, 1200));
    if (!input.success) throw new Error('La nueva contraseña debe tener al menos 12 caracteres.');
    if (!changePassword(input.data.current, input.data.next)) return Response.json({ error: 'La contraseña actual no es correcta.' }, { status: 400 });
    // Every session, including this one, was revoked: the cookie is cleared and she signs in again.
    return Response.json({ ok: true }, { headers: { 'Set-Cookie': 'ursula_taller=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0', 'Cache-Control': 'no-store' } });
  } catch (e) { return invalid(e); }
}
