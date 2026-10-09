import { z } from 'zod';
import { protect } from '@/lib/admin-auth';
import { applyAdminAction, type AdminAction } from '@/lib/orders';
import { notifyShipped } from '@/lib/mail';
import { invalid, jsonBody } from '@/lib/http';
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('ship'), carrier: z.string().trim().max(60).default(''), code: z.string().trim().max(80).default(''), url: z.union([z.string().url().max(300), z.literal('')]).default('') }),
  z.object({ action: z.literal('deliver') }),
  z.object({ action: z.literal('cancel') }),
  z.object({ action: z.literal('refund'), restock: z.boolean().default(true) }),
]);
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await protect(request); if (denied) return denied;
  try {
    const { id } = await params;
    const input = schema.parse(await jsonBody(request, 2000)) as AdminAction;
    const order = applyAdminAction(id, input);
    if (input.action === 'ship') void notifyShipped(order);
    const { fingerprint, ...safe } = order;
    return Response.json(safe, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return invalid(e); }
}
