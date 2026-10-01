import { hasAdminSession } from '@/lib/admin-auth';
import { getPieces,getSettings,getOrders } from '@/lib/store';
import Login from '@/components/login';
import Studio from '@/components/studio';
export const dynamic='force-dynamic';
export default async function Admin(){return await hasAdminSession()?<Studio initialPieces={getPieces(true)} initialSettings={getSettings()} initialOrders={getOrders().map(({fingerprint,...o})=>o)}/>:<Login/>;}
