// Adapted from PagOf: PBKDF2 credentials, revocable server sessions and same-origin writes.
import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';
import { headers } from 'next/headers';
import { backupIfDue } from './backup';
import { withinBudget } from './http';
import { database } from './store';
const COOKIE='ursula_taller';
const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
// 600,000 rounds for new passwords; hashes made with the earlier 100,000 keep working until the password changes.
const ROUNDS=600000;
const HASH=/^pbkdf2-sha256:(?:100000|600000):[a-f0-9]{32}:[a-f0-9]{64}$/;
// A password changed from the panel (stored in the database) takes precedence over the one in .env.local.
function credentials(){
  const row=database().prepare('SELECT username,hash FROM admin_credentials WHERE id=1').get() as {username:string;hash:string}|undefined;
  return row?{username:row.username,hash:row.hash}:{username:process.env.ADMIN_USERNAME||'',hash:process.env.ADMIN_PASSWORD_HASH||''};
}
const version=()=>{const c=credentials();return digest(`${c.username}:${c.hash}`);};
export function configured(){const c=credentials();return !!c.username&&HASH.test(c.hash);}
function hashPassword(password:string){const salt=randomBytes(16).toString('hex');return `pbkdf2-sha256:${ROUNDS}:${salt}:${pbkdf2Sync(password,salt,ROUNDS,32,'sha256').toString('hex')}`;}
export function verifyCredentials(username:string,password:string){
  if(!configured())return false;
  const c=credentials();
  const [,rounds,salt,expected]=c.hash.split(':');
  const actual=pbkdf2Sync(password,salt,Number(rounds),32,'sha256');
  return timingSafeEqual(actual,Buffer.from(expected,'hex'))&&username===c.username;
}
/** Verifies the current password, stores the new one and revokes every session (including this one). */
export function changePassword(current:string,next:string){
  const c=credentials();
  if(!verifyCredentials(c.username,current))return false;
  const db=database();
  db.prepare('INSERT INTO admin_credentials VALUES (1,?,?) ON CONFLICT(id) DO UPDATE SET username=excluded.username,hash=excluded.hash').run(c.username,hashPassword(next));
  db.prepare('DELETE FROM sessions').run();
  return true;
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
/**
 * Failed logins are limited to 8 per 15 minutes. Behind a trusted proxy (TRUST_PROXY=true) the budget is per visitor,
 * so a stranger guessing passwords cannot lock the owner out; without one it is shared, since headers cannot be trusted.
 */
export const loginKey=(request:Request)=>'login:'+(process.env.TRUST_PROXY==='true'?request.headers.get('x-forwarded-for')?.split(',')[0].trim().slice(0,45)||'unknown':'all');
export function loginAttempt(request:Request){return withinBudget(loginKey(request),8,15*60000);}
export async function protect(request:Request){
  if(!await hasAdminSession(request))return Response.json({error:'Inicia sesión para administrar el taller.'},{status:401});
  if(!['GET','HEAD'].includes(request.method)){
    if(!sameOrigin(request))return Response.json({error:'Solicitud no permitida.'},{status:403});
    backupIfDue();
  }
  return null;
}
