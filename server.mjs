import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const port = Number(process.env.PORT || 3000);
const secret = process.env.ADMIN_PASSWORD || '';
const dataDir = path.resolve(process.env.DATA_DIR || './private-data');
fs.mkdirSync(dataDir, { recursive:true, mode:0o700 });
const storeFile = path.join(dataDir,'store.json');
const jarFile = path.join(dataDir,'client.jar');
const state = fs.existsSync(storeFile) ? JSON.parse(fs.readFileSync(storeFile,'utf8')) : { keys:[], grants:[], requests:[] };
state.keys ||= []; state.grants ||= []; state.requests ||= [];
const hash = s => crypto.createHash('sha256').update(String(s)).digest('hex');
const rand = (n=24) => crypto.randomBytes(n).toString('base64url');
const save = () => { const temp=storeFile+'.tmp'; fs.writeFileSync(temp,JSON.stringify(state),{mode:0o600}); fs.renameSync(temp,storeFile); };
const equal = (a,b) => { const x=Buffer.from(String(a)), y=Buffer.from(String(b)); return x.length===y.length && crypto.timingSafeEqual(x,y); };
const cookies = req => Object.fromEntries((req.headers.cookie || '').split(';').map(x=>x.trim().split('=')).filter(x=>x.length===2));
const isSecure = req => req.headers['x-forwarded-proto']==='https';
const setCookie = (req,res,name,val,seconds) => res.setHeader('Set-Cookie',name+'='+encodeURIComponent(val)+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+seconds+(isSecure(req)?'; Secure':''));
function reply(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj));}
function admin(req){
  if(secret.length<16)return false;
  const token=cookies(req).admin || '';
  const [payload,sig] = token.split('.');
  if(!payload || !sig || !equal(sig,crypto.createHmac('sha256',secret).update(payload).digest('base64url')))return false;
  try { return JSON.parse(Buffer.from(payload,'base64url').toString()).expires>Date.now(); } catch { return false; }
}
function access(req){
  const [id,key] = (cookies(req).access||'').split('.');
  return !!(id && key && state.grants.some(g=>g.id===id && equal(g.hash,hash(key))));
}
function grant(req,res){
  const id=rand(12), key=rand(32);
  state.grants.push({id,hash:hash(key),created:Date.now()}); save();
  setCookie(req,res,'access',id+'.'+key,30*86400);
}
async function getBody(req,max=20000){
  const chunks=[];let bytes=0;
  for await(const chunk of req){bytes+=chunk.length;if(bytes>max)throw Error('Zu große Anfrage');chunks.push(chunk);}
  return Buffer.concat(chunks);
}
const attempts = new Map();
function limit(req,label,max=10,window=900000){
  const id=label+':'+req.socket.remoteAddress, now=Date.now();
  const list=(attempts.get(id)||[]).filter(t=>t>now-window);
  list.push(now);attempts.set(id,list);return list.length>max;
}
function originOK(req){
  if(!req.headers.origin)return true;
  const host=req.headers['x-forwarded-host']||req.headers.host;
  return req.headers.origin==='https://'+host || req.headers.origin==='http://'+host;
}
const mime = p => p.endsWith('.css')?'text/css':p.endsWith('.js')?'application/javascript':'text/html';
const publicly = {'/':'public/index.html','/index.html':'public/index.html'};
const server=http.createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://local').pathname;
    if(req.method==='GET' && publicly[pathname]){
      const file=path.resolve(publicly[pathname]);
      res.writeHead(200,{'Content-Type':mime(file)+'; charset=utf-8','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; base-uri 'self'; frame-ancestors 'none'"});
      fs.createReadStream(file).pipe(res);return;
    }
    if(req.method==='GET'&&pathname==='/health')return reply(res,200,{ok:true});
    if(req.method==='GET'&&pathname==='/api/info')return reply(res,200,{version:'1.2.1-experimental',file:fs.existsSync(jarFile),access:access(req),pendingAllowed:true});
    if(req.method==='GET'&&pathname==='/api/download'){
      if(!access(req))return reply(res,403,{error:'Bitte zuerst deinen Key einlösen oder eine Freigabe erhalten.'});
      if(!fs.existsSync(jarFile))return reply(res,404,{error:'JAR-Datei wurde noch nicht vom Admin hochgeladen.'});
      return void (res.writeHead(200,{'Content-Type':'application/java-archive','Content-Disposition':'attachment; filename="KngArtusClient-1.2.1-EXPERIMENTAL-mc26.3.jar"','Cache-Control':'private, no-store','Content-Length':fs.statSync(jarFile).size}),fs.createReadStream(jarFile).pipe(res));
    }
    if(req.method!=='GET'&&!originOK(req))return reply(res,403,{error:'Anfrageherkunft nicht erlaubt.'});
    if(req.method==='POST'&&pathname==='/api/redeem'){
      if(limit(req,'redeem',8))return reply(res,429,{error:'Zu viele Versuche.'});
      const b=JSON.parse((await getBody(req)).toString()||'{}');
      const key=String(b.key||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
      const record=state.keys.find(k=>!k.used&&!k.revoked&&equal(k.hash,hash(key)));
      if(!record)return reply(res,403,{error:'Key ungültig oder bereits verwendet.'});
      record.used=Date.now();grant(req,res);return reply(res,200,{ok:true});
    }
    if(req.method==='POST'&&pathname==='/api/request'){
      if(limit(req,'request',4,3600000))return reply(res,429,{error:'Zu viele Anfragen.'});
      const b=JSON.parse((await getBody(req)).toString()||'{}');
      const name=String(b.name||'').trim().slice(0,32);
      if(!/^[\p{L}\p{N} ._-]{2,32}$/u.test(name))return reply(res,400,{error:'Bitte einen Spitznamen von 2–32 Zeichen eingeben.'});
      const id='KNG-'+crypto.randomBytes(5).toString('hex').toUpperCase(), token=rand(24);
      state.requests.push({id,name,tokenHash:hash(token),status:'pending',created:Date.now()});save();
      return reply(res,200,{id,token,status:'pending'});
    }
    if(req.method==='POST'&&pathname==='/api/check'){
      if(limit(req,'check',60,3600000))return reply(res,429,{error:'Zu viele Prüfungen.'});
      const b=JSON.parse((await getBody(req)).toString()||'{}');
      const record=state.requests.find(x=>x.id===b.id&&equal(x.tokenHash,hash(b.token||'')));
      if(!record)return reply(res,404,{error:'Anfrage nicht gefunden.'});
      if(record.status==='approved'&&!record.claimed){record.claimed=Date.now();grant(req,res);}
      return reply(res,200,{status:record.status,access:access(req)});
    }
    if(req.method==='POST'&&pathname==='/api/admin/login'){
      if(limit(req,'login',6))return reply(res,429,{error:'Zu viele Login-Versuche.'});
      const b=JSON.parse((await getBody(req)).toString()||'{}');
      if(secret.length<16 || !equal(hash(secret),hash(b.password||'')))return reply(res,401,{error:'Falsches Passwort. Auf Render muss ADMIN_PASSWORD gesetzt sein.'});
      const p=Buffer.from(JSON.stringify({expires:Date.now()+12*3600000})).toString('base64url');
      setCookie(req,res,'admin',p+'.'+crypto.createHmac('sha256',secret).update(p).digest('base64url'),12*3600);
      return reply(res,200,{ok:true});
    }
    if(pathname.startsWith('/api/admin/')){
      if(!admin(req))return reply(res,401,{error:'Admin-Anmeldung erforderlich.'});
      if(req.method==='GET'&&pathname==='/api/admin/status')return reply(res,200,{
        requests:state.requests.slice().reverse().map(x=>({id:x.id,name:x.name,status:x.status,created:x.created})),
        keys:state.keys.map(x=>({id:x.id,used:!!x.used,revoked:!!x.revoked})),file:fs.existsSync(jarFile)
      });
      if(req.method==='POST'&&pathname==='/api/admin/keys'){
        const b=JSON.parse((await getBody(req)).toString()||'{}'),count=Math.min(20,Math.max(1,Number(b.count)||1));
        const out=[];
        for(let i=0;i<count;i++){const key='KNG-'+crypto.randomBytes(12).toString('hex').toUpperCase().match(/.{1,6}/g).join('-');state.keys.push({id:rand(8),hash:hash(key.replace(/-/g,'')),used:null,revoked:false});out.push(key);}
        save();return reply(res,200,{keys:out});
      }
      if(req.method==='POST'&&pathname==='/api/admin/decide'){
        const b=JSON.parse((await getBody(req)).toString()||'{}');
        if(!['approved','rejected'].includes(b.decision))return reply(res,400,{error:'Ungültige Entscheidung.'});
        const record=state.requests.find(x=>x.id===b.id);
        if(!record)return reply(res,404,{error:'Anfrage nicht gefunden.'});
        if(record.status!=='pending')return reply(res,409,{error:'Schon entschieden.'});
        record.status=b.decision;save();return reply(res,200,{ok:true});
      }
      if(req.method==='POST'&&pathname==='/api/admin/upload'){
        if(req.headers['content-type']!=='application/octet-stream')return reply(res,415,{error:'Dateityp nicht erlaubt.'});
        const file=await getBody(req,35000000);
        if(file.length<100||file.slice(0,2).toString()!=='PK')return reply(res,400,{error:'Nur JAR/ZIP-Dateien.'});
        const temp=jarFile+'.tmp';fs.writeFileSync(temp,file,{mode:0o600});fs.renameSync(temp,jarFile);
        return reply(res,200,{ok:true,size:file.length});
      }
    }
    reply(res,404,{error:'Nicht gefunden.'});
  }catch(e){console.error(e);reply(res,500,{error:'Serverfehler.'});}
});
server.listen(port,'0.0.0.0',()=>console.log('KngArtusClient läuft auf Port '+port));
