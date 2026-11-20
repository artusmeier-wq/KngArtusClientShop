const $ = id => document.getElementById(id);
const productNames = {client:'KngArtusClient',texture:'6-in-1 Texture Pack + X-Ray'};
let currentProduct='client';
const requestStorage = product => 'kng-request-'+product;
function selectProduct(product){
  currentProduct=product==='texture'?'texture':'client';
  for(const name of Object.keys(productNames)) $('product-'+name).classList.toggle('selected',name===currentProduct);
  $('selected-product').textContent=productNames[currentProduct];
  $('download').textContent=currentProduct==='texture'?'Texture-Pack-ZIP herunterladen':'Client-JAR herunterladen';
  $('request-check').classList.toggle('hidden',!localStorage.getItem(requestStorage(currentProduct)) && !(currentProduct==='client'&&localStorage.getItem('kng-request')));
  show('key-msg','');show('request-msg','');
  refreshStatus().catch(()=>{ $('file-status').textContent='Serverstatus konnte nicht geladen werden.';});
}
async function api(url,method='GET',data){
  const options={method,credentials:'same-origin',headers:{}};
  if(method!=='GET'){options.headers['Content-Type']='application/json';options.body=JSON.stringify(data||{});}
  const r=await fetch(url,options);let b;try{b=await r.json()}catch{b={error:'Server antwortet nicht.'}}
  if(!r.ok)throw Error(b.error||'Anfrage fehlgeschlagen');return b;
}
const show=(id,msg,error=false)=>{const el=$(id);el.textContent=msg;el.className=msg?'message'+(error?' error':''):'';};
const guard=async (fn,out)=>{try{await fn()}catch(e){show(out,e.message,true)}};
async function refreshStatus(){
  const v=await api('/api/info');
  const allowed=Boolean(v.accesses?.[currentProduct] ?? (currentProduct==='client'&&v.access));
  const uploaded=Boolean(v.files?.[currentProduct] ?? (currentProduct==='client'&&v.file));
  $('download').disabled=!(allowed&&uploaded);
  $('file-status').textContent=allowed?(uploaded?'Freigeschaltet! Du kannst dein Produkt herunterladen.':'Freigeschaltet – die Produktdatei wurde noch nicht hochgeladen.'):'Noch nicht freigeschaltet für '+productNames[currentProduct]+'.';
}
async function checkRequest(){
  const req=JSON.parse(localStorage.getItem(requestStorage(currentProduct))||(currentProduct==='client'?localStorage.getItem('kng-request'):null)||'null');
  if(!req)return show('request-msg','Du hast hier noch keine Anfrage erstellt.',true);
  const r=await api('/api/check','POST',req);
  const labels={pending:'Deine Anfrage ist noch offen. Der Admin muss sie bestätigen.',approved:'Deine Anfrage wurde bestätigt. Download freigeschaltet!',rejected:'Der Admin hat deine Anfrage abgelehnt.'};
  show('request-msg',req.id+' · '+(labels[r.status]||r.status));
  await refreshStatus();
}
function node(tag,content,className){const n=document.createElement(tag);n.textContent=content||'';if(className)n.className=className;return n;}
function row(title,sub){
  const d=node('div','','item'),info=node('div');
  info.append(node('strong',title),node('div',sub,'muted'));d.append(info);return d;
}
async function adminRefresh(){
  const data=await api('/api/admin/status');
  $('login-panel').classList.add('hidden');$('admin-content').classList.remove('hidden');
  $('pending-list').replaceChildren();$('keys-list').replaceChildren();
  for(const q of data.requests){
    const el=row(q.name+' · '+q.id+' · '+productNames[q.product||'client'],q.status==='pending'?'Offen':q.status==='approved'?'Freigegeben':'Abgelehnt');
    if(q.status==='pending')for(const [label,decision] of [['Freigeben','approved'],['Ablehnen','rejected']]){
      const btn=node('button',label,decision==='approved'?'':'secondary');
      btn.addEventListener('click',()=>guard(async()=>{await api('/api/admin/decide','POST',{id:q.id,decision});show('admin-msg','Anfrage '+q.id+' bearbeitet.');await adminRefresh()},'admin-msg'));
      el.append(btn);
    }
    $('pending-list').append(el);
  }
  if(!data.requests.length)$('pending-list').append(node('p','Noch keine Anfragen.'));
  for(const k of data.keys)$('keys-list').append(row(k.id+' · '+productNames[k.product||'client'],k.revoked?'Gesperrt':k.used?'Eingelöst':'Noch verfügbar'));
  if(!data.keys.length)$('keys-list').append(node('p','Noch keine Keys.'));
  show('admin-msg','Client-JAR: '+(data.files?.client?'hochgeladen':'fehlt')+' · Texture-Pack-ZIP: '+(data.files?.texture?'hochgeladen':'fehlt'));
}
$('key-form').addEventListener('submit',e=>{e.preventDefault();guard(async()=>{
  await api('/api/redeem','POST',{key:$('key-input').value,product:currentProduct});
  show('key-msg','Key gültig! Dein Download ist jetzt freigeschaltet.');
  $('key-input').value='';await refreshStatus();
},'key-msg')});
$('request-form').addEventListener('submit',e=>{e.preventDefault();guard(async()=>{
  const v=await api('/api/request','POST',{name:$('request-name').value,product:currentProduct});
  localStorage.setItem(requestStorage(currentProduct),JSON.stringify({id:v.id,token:v.token}));
  $('request-check').classList.remove('hidden');
  show('request-msg','Anfrage '+v.id+' verschickt! Bewahre diese Nummer auf. Ein Admin muss sie bestätigen.');
},'request-msg')});
$('check-button').addEventListener('click',()=>guard(checkRequest,'request-msg'));
$('download').addEventListener('click',()=>{window.location.href='/api/download?product='+encodeURIComponent(currentProduct)});
$('open-admin').addEventListener('click',()=>{const el=$('admin-panel');el.classList.toggle('hidden');if(!el.classList.contains('hidden')){el.scrollIntoView({behavior:'smooth'});adminRefresh().catch(()=>{});}});
$('login-form').addEventListener('submit',e=>{e.preventDefault();guard(async()=>{
  await api('/api/admin/login','POST',{password:$('admin-pass').value});
  $('admin-pass').value='';await adminRefresh();
},'admin-msg')});
$('generate-form').addEventListener('submit',e=>{e.preventDefault();guard(async()=>{
  const r=await api('/api/admin/keys','POST',{count:Number($('key-count').value)||1,product:$('admin-key-product').value});
  $('new-keys').textContent=r.keys.join('\n');
  $('new-keys').classList.remove('hidden');
  await adminRefresh();
},'admin-msg')});
$('upload-button').addEventListener('click',()=>guard(async()=>{
  const f=$('jar-picker').files[0],product=$('admin-upload-product').value;
  const extension=product==='texture'?'.zip':'.jar';
  if(!f||!f.name.toLowerCase().endsWith(extension))throw Error('Bitte eine '+extension+'-Datei für dieses Produkt auswählen.');
  if(f.size>35000000)throw Error('Datei ist zu groß.');
  const r=await fetch('/api/admin/upload?product='+encodeURIComponent(product),{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/octet-stream'},body:f});
  const v=await r.json();if(!r.ok)throw Error(v.error||'Upload fehlgeschlagen');
  show('admin-msg',productNames[product]+' erfolgreich hochgeladen ('+v.size+' Bytes).');
  await adminRefresh();await refreshStatus();
},'admin-msg'));
if(localStorage.getItem(requestStorage('client'))||localStorage.getItem('kng-request')){$('request-check').classList.remove('hidden');guard(checkRequest,'request-msg')}
refreshStatus().catch(()=>{$('file-status').textContent='Serverstatus konnte nicht geladen werden.'});

$('jump-key').addEventListener('click',()=> $('key-input').focus());
$('jump-request').addEventListener('click',()=> $('request-name').focus());

for(const btn of document.querySelectorAll('[data-pick]'))btn.addEventListener('click',()=>{
  selectProduct(btn.getAttribute('data-pick'));
  $('products').scrollIntoView({behavior:'smooth'});
});
