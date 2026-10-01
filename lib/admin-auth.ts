// Adapted from PagOf: PBKDF2 credentials, revocable server sessions and same-origin writes.
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { database } from './store';
const COOKIE='ursula_taller';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const version=()=>digest(`${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD_HASH}`);
export function configured(){return !!process.env.ADMIN_USERNAME&&/^pbkdf2-sha256:100000:[a-f0-9]{32}:[a-f0-9]{64}$/.test(process.env.ADMIN_PASSWORD_HASH||'');}
export function verifyCredentials(username:string,password:string){
  if(!configured())return false;
  const [,,salt,expected]=process.env.ADMIN_PASSWORD_HASH!.split(':');
  const actual=pbkdf2Sync(password,salt,100000,32,'sha256');
  return timingSafeEqual(actual,Buffer.from(expected,'hex'))&&username===process.env.ADMIN_USERNAME;
}
function token(h:Headers){return h.get('cookie')?.split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
export async function hasAdminSession(request?:Request){
  if(!configured())return false;
  const t=token(request?request.headers:await headers());
  if(!/^[a-f0-9]{64}$/.test(t))return false;
  return !!database().prepare('SELECT token FROM sessions WHERE token=? AND expires>? AND version=?').get(digest(t),Date.now(),version());
}
export function sameOrigin(request:Request){
  // Next may normalize request.url to localhost. Host retains the browser's
  // actual authority; do not trust arbitrary forwarded-host headers.
  try{const origin=new URL(request.headers.get('origin')||'');return ['http:','https:'].includes(origin.protocol)&&origin.host===(request.headers.get('host')||new URL(request.url).host);}catch{return false;}
}
function cookie(t:string,age:number){return `${COOKIE}=${t}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
export function createSession(){
  const t=randomBytes(32).toString('hex');const db=database();
  db.prepare('DELETE FROM sessions WHERE expires<=?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(t),Date.now()+8*3600000,version());
  return cookie(t,8*3600);
}
export function destroySession(request:Request){database().prepare('DELETE FROM sessions WHERE token=?').run(digest(token(request.headers)));return cookie('',0);}
export function loginAttempt(){
  // One shared budget is conservative for this single-owner local store. No untrusted proxy IPs.
  const db=database();const now=Date.now();
  db.prepare('DELETE FROM attempts WHERE expires<=?').run(now);
  const row=db.prepare('INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').get('login',now+15*60000);
  return Number(row?.count)<=8;
}
export async function protect(request:Request){
  if(!await hasAdminSession(request))return Response.json({error:'Inicia sesión para administrar el taller.'},{status:401});
  if(!['GET','HEAD'].includes(request.method)&&!sameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});
  return null;
}
