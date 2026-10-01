import { test,before,after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync,mkdtempSync,readFileSync } from 'node:fs';
import { randomBytes,pbkdf2Sync,randomUUID } from 'node:crypto';
import { once } from 'node:events';
import path from 'node:path';
const base='http://127.0.0.1:3013';
const username='test-atelier',password=randomBytes(20).toString('hex'),salt=randomBytes(16).toString('hex');
const hash=`pbkdf2-sha256:100000:${salt}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex')}`;
let server,cookie='',pieces,output='',draftId,photoUrl;
const request=(url,{method='GET',body,auth=false,origin=base,...rest}={})=>fetch(base+url,{method,headers:{...(method!=='GET'?{Origin:origin}:{}),...(body?{'Content-Type':'application/json'}:{}),...(auth?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined,...rest});
const checkout=(overrides={})=>({requestKey:randomUUID(),customer:{name:'Prueba automática',email:'test@example.com'},items:[{id:pieces[0].id,quantity:1}],outcome:'approved',...overrides});
before(async()=>{
  mkdirSync('test-results',{recursive:true});
  const dataDir=mkdtempSync(path.resolve('test-results','database-'));
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3013'],{cwd:process.cwd(),env:{...process.env,ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:hash,DATA_DIR:dataDir,PAYMENT_MODE:'demo'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  server.stdout.on('data',d=>output+=d);server.stderr.on('data',d=>output+=d);
  const end=Date.now()+45000;let ready=false;
  while(Date.now()<end){try{const r=await request('/api/pieces');if(r.ok){pieces=await r.json();ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,300));}
  assert.ok(ready,output);
});
after(async()=>{if(server&&server.exitCode===null){server.kill();await Promise.race([once(server,'exit'),new Promise(r=>setTimeout(r,3000))]);}});
test('private endpoints and cross-origin writes are protected',async()=>{
  assert.equal((await request('/api/pieces?admin')).status,401);
  assert.equal((await request('/api/orders')).status,401);
  assert.equal((await request('/api/pieces',{method:'POST',body:pieces[0]})).status,401);
  assert.equal((await request('/api/checkout',{method:'POST',body:checkout(),origin:'https://untrusted.example'})).status,403);
  assert.equal((await request('/api/admin/login',{method:'POST',body:{username,password:'wrong'}})).status,401);
});
test('admin session uses HTTP-only cookie and supports authenticated edits',async()=>{
  const r=await request('/api/admin/login',{method:'POST',body:{username,password}});assert.equal(r.status,200);
  const header=r.headers.get('set-cookie');assert.match(header,/HttpOnly/);assert.match(header,/SameSite=Strict/);cookie=header.split(';')[0];
  assert.equal((await request('/api/pieces?admin',{auth:true})).status,200);
  assert.equal((await request('/api/settings',{method:'PUT',auth:true,origin:'https://untrusted.example',body:{}})).status,403);
});
test('photo upload, private draft, publish, edit and delete persist on server',async()=>{
  const form=new FormData();form.append('file',new Blob([readFileSync('public/references/ursula.png')],{type:'image/png'}),'piece.png');
  const upload=await fetch(base+'/api/photos',{method:'POST',headers:{Origin:base,Cookie:cookie},body:form});assert.equal(upload.status,200);photoUrl=(await upload.json()).url;
  assert.equal((await request(photoUrl)).status,404);
  const draft={...pieces[0],id:undefined,name:'Pieza de prueba privada',status:'Borrador',images:[{url:photoUrl,caption:'Prueba'}]};
  const created=await request('/api/pieces',{method:'POST',auth:true,body:draft});assert.equal(created.status,200);draftId=(await created.json()).id;
  assert.ok(!(await (await request('/api/pieces')).json()).some(p=>p.id===draftId));
  assert.equal((await request(photoUrl,{auth:true})).status,200);
  assert.equal((await request('/api/checkout',{method:'POST',body:checkout({items:[{id:draftId,quantity:1}]})})).status,400);
  assert.equal((await request('/api/pieces',{method:'PUT',auth:true,body:{...draft,id:draftId,status:'Publicado',price:55000,order:99}})).status,200);
  assert.equal((await request(photoUrl)).status,200);
  const visible=(await (await request('/api/pieces')).json()).find(p=>p.id===draftId);assert.equal(visible.price,55000);assert.equal(visible.order,99);
  assert.equal((await request('/api/pieces?id='+draftId,{method:'DELETE',auth:true})).status,200);
  assert.equal((await request(photoUrl)).status,404);
});
test('settings persist and reject non-Instagram links',async()=>{
  const settings=await (await request('/api/settings')).json();
  assert.equal((await request('/api/settings',{method:'PUT',auth:true,body:{...settings,headline:'Una portada de prueba.'}})).status,200);
  assert.equal((await (await request('/api/settings')).json()).headline,'Una portada de prueba.');
  assert.equal((await request('/api/settings',{method:'PUT',auth:true,body:{...settings,instagram:'https://untrusted.example'}})).status,400);
});
test('approved, pending and rejected simulations calculate authoritative totals',async()=>{
  for(const outcome of ['approved','pending','rejected']){
    const input=checkout({outcome,items:[{id:pieces[0].id,quantity:2,price:1}],total:1});
    const r=await request('/api/checkout',{method:'POST',body:input});assert.equal(r.status,200);const order=await r.json();
    assert.equal(order.status,outcome);assert.equal(order.mode,'demo');assert.equal(order.total,pieces[0].price*2);
    const repeated=await (await request('/api/checkout',{method:'POST',body:input})).json();assert.equal(repeated.id,order.id);
    assert.equal((await request('/api/checkout',{method:'POST',body:{...input,customer:{...input.customer,name:'Otra persona'}}})).status,400);
  }
  assert.equal((await (await request('/api/pieces')).json()).find(p=>p.id===pieces[0].id).stock,pieces[0].stock);
  const orders=await (await request('/api/orders',{auth:true})).json();assert.equal(orders.length,3);
});
test('unavailable, duplicate-line overstock and malformed purchases are rejected',async()=>{
  for(const items of [[{id:randomUUID(),quantity:1}],[{id:pieces[0].id,quantity:0}],[{id:pieces[0].id,quantity:6}],[{id:pieces[0].id,quantity:3},{id:pieces[0].id,quantity:3}],[]]){
    assert.equal((await request('/api/checkout',{method:'POST',body:checkout({items})})).status,400);
  }
  assert.equal((await request('/api/checkout',{method:'POST',body:checkout({customer:{name:'A',email:'no-email'}})})).status,400);
});
test('logout revokes a captured session and login rate limit is enforced',async()=>{
  assert.equal((await request('/api/admin/logout',{method:'POST',auth:true})).status,200);
  assert.equal((await request('/api/orders',{auth:true})).status,401);
  let last;
  for(let i=0;i<9;i++)last=await request('/api/admin/login',{method:'POST',body:{username,password:'wrong'}});
  assert.equal(last.status,429);
});
