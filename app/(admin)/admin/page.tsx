import { hasAdminSession } from '@/lib/admin-auth';
import { getSettings, getPieces } from '@/lib/store';
import { storeStatus } from '@/lib/status';
import Login from '@/components/login';
import Studio from '@/components/studio';
export const dynamic = 'force-dynamic';
export default async function Admin() {
  if (!await hasAdminSession()) return <Login />;
  return <Studio initialPieces={getPieces(true)} initialSettings={getSettings()} initialStatus={storeStatus()} />;
}
