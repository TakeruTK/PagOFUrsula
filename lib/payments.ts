import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { database, getPieces, type DemoOrder } from './store';
export const checkoutSchema=z.object({
  requestKey:z.string().uuid(),
  customer:z.object({name:z.string().trim().min(2).max(100),email:z.string().trim().email().max(200)}),
  items:z.array(z.object({id:z.string().uuid(),quantity:z.number().int().min(1).max(20)})).min(1).max(30),
  outcome:z.enum(['approved','pending','rejected']),
});
export type CheckoutInput=z.infer<typeof checkoutSchema>;
// Provider boundary: a future Mercado Pago adapter must create a server-side preference
// and reconcile status through verified webhooks. Browser return URLs cannot mark orders paid.
export interface PaymentProvider { create(input:CheckoutInput):DemoOrder }
class DemoPaymentProvider implements PaymentProvider {
  create(input:CheckoutInput):DemoOrder {
    const db=database();
    const fingerprint=createHash('sha256').update(JSON.stringify({customer:input.customer,items:input.items,outcome:input.outcome})).digest('hex');
    db.exec('BEGIN IMMEDIATE');
    try {
      const existing=db.prepare('SELECT content FROM orders WHERE request_key=?').get(input.requestKey);
      if(existing){const order=JSON.parse(existing.content as string) as DemoOrder;if(order.fingerprint!==fingerprint)throw new Error('Esta solicitud ya fue utilizada. Inicia un nuevo intento.');db.exec('COMMIT');return order;}
      const pieces=getPieces();const quantities=new Map<string,number>();
      for(const line of input.items)quantities.set(line.id,(quantities.get(line.id)||0)+line.quantity);
      const items=[...quantities].map(([id,quantity])=>{
        const p=pieces.find(p=>p.id===id);
        if(!p||p.kind!=='Producto'||p.availability!=='Disponible'||p.stock<quantity||quantity>20)throw new Error('Una pieza ya no está disponible en esa cantidad. Actualiza tu bolsa.');
        return {id,name:p.name,price:p.price,quantity};
      });
      const order:DemoOrder={id:randomUUID(),created:new Date().toISOString(),mode:'demo',status:input.outcome,customer:input.customer,items,total:items.reduce((n,p)=>n+p.price*p.quantity,0),delivery:'coordinar',fingerprint};
      db.prepare('INSERT INTO orders VALUES (?,?,?,?)').run(order.id,input.requestKey,JSON.stringify(order),order.created);
      // Simulations deliberately do not reserve or consume real inventory.
      db.exec('COMMIT');return order;
    }catch(e){db.exec('ROLLBACK');throw e;}
  }
}
export function paymentProvider():PaymentProvider {
  if((process.env.PAYMENT_MODE||'demo')!=='demo')throw new Error('Los pagos reales todavía no están habilitados.');
  return new DemoPaymentProvider();
}
