import { displayStatus, listOrders } from '@/lib/orders';
import { protect } from '@/lib/admin-auth';
export const dynamic = 'force-dynamic';
const strip = ({ fingerprint, ...order }: ReturnType<typeof listOrders>[number]) => order;
// Spreadsheet programs run cells that start with = + - @, so those are neutralised.
const csv = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""').replace(/^([=+\-@])/, "'$1")}"`;
export async function GET(request: Request) {
  const denied = await protect(request); if (denied) return denied;
  const orders = listOrders();
  if (new URL(request.url).searchParams.get('format') === 'csv') {
    const rows = [
      ['Pedido', 'Fecha', 'Estado', 'Medio', 'Moneda', 'Total', 'Nombre', 'Correo', 'Teléfono', 'País', 'Región', 'Ciudad', 'Dirección', 'Postal', 'Piezas', 'Seguimiento'],
      ...orders.map(o => [o.number, o.created, displayStatus(o), o.provider, o.charge.currency, o.charge.currency === 'USD' ? (o.charge.total / 100).toFixed(2) : o.charge.total, o.customer.name, o.customer.email, o.customer.phone, o.shipping.country, o.shipping.region, o.shipping.city, o.shipping.address, o.shipping.postal, o.items.map(i => `${i.name} x${i.quantity}`).join(' | '), o.tracking?.code || '']),
    ];
    return new Response('﻿' + rows.map(r => r.map(csv).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="pedidos.csv"', 'Cache-Control': 'no-store' } });
  }
  return Response.json(orders.map(strip), { headers: { 'Cache-Control': 'no-store' } });
}
