import { protect } from '@/lib/admin-auth';
import { storeStatus } from '@/lib/status';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const denied = await protect(request); if (denied) return denied;
  return Response.json(storeStatus(), { headers: { 'Cache-Control': 'no-store' } });
}
