import { randomBytes,pbkdf2Sync } from 'node:crypto';
import { readFileSync,writeFileSync,existsSync } from 'node:fs';
const file=new URL('../.env.local',import.meta.url);
let content=existsSync(file)?readFileSync(file,'utf8'):'';
if(/ADMIN_PASSWORD_HASH=pbkdf2/.test(content)&&!process.argv.includes('--reset')){
  console.log('El administrador ya está configurado. Usa --reset solo para cambiar su contraseña.');process.exit(0);
}
const username='ursula';
const password=randomBytes(15).toString('base64url');
const salt=randomBytes(16).toString('hex');
const hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
content=content.split('\n').filter(line=>!/^ADMIN_(USERNAME|PASSWORD_HASH)=/.test(line)).join('\n').trim();
writeFileSync(file,content+`\nADMIN_USERNAME=${username}\nADMIN_PASSWORD_HASH=pbkdf2-sha256:100000:${salt}:${hash}\n`,{mode:0o600});
console.log(`Administrador local configurado.\nUsuario: ${username}\nContraseña: ${password}\nGuarda la contraseña. Reinicia el servidor si ya estaba abierto.`);
