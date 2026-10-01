import { getOrders } from '@/lib/store';
import { protect } from '@/lib/admin-auth';
export const dynamic='force-dynamic';
export async function GET(request:Request){const denied=await protect(request);if(denied)return denied;return Response.json(getOrders().map(({fingerprint,...order})=>order),{headers:{'Cache-Control':'no-store'}});}
