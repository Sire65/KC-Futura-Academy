'use strict';
(function(){
  const DB_NAME='kc-futura-secure-storage';
  const DB_VERSION=1;
  const RECORDS='records';
  const META='meta';
  const OUTBOX='outbox';
  const AAD='KC-FUTURA-ACADEMY-SECURE-STORAGE-V1';
  const cache=new Map();
  let db=null;
  let dataKey=null;
  let readyResolve;
  const ready=new Promise(r=>readyResolve=r);
  const pendingWrites=new Set();

  const enc=new TextEncoder();
  const dec=new TextDecoder();
  const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
  const unb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
  const activity=phase=>window.dispatchEvent(new CustomEvent('kc:db-traffic',{detail:{database:'indexeddb',phase,at:Date.now()}}));
  const request=req=>new Promise((resolve,reject)=>{activity('start');req.onsuccess=()=>{activity('end');resolve(req.result)};req.onerror=()=>{activity('end');reject(req.error)}});
  const txDone=tx=>new Promise((resolve,reject)=>{activity('start');tx.oncomplete=()=>{activity('end');resolve()};tx.onerror=()=>{activity('end');reject(tx.error)};tx.onabort=()=>{activity('end');reject(tx.error||new Error('Transaktion abgebrochen'))}});

  function openDb(){
    return new Promise((resolve,reject)=>{
      activity('start');
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onupgradeneeded=()=>{
        const d=req.result;
        if(!d.objectStoreNames.contains(RECORDS))d.createObjectStore(RECORDS,{keyPath:'key'});
        if(!d.objectStoreNames.contains(META))d.createObjectStore(META,{keyPath:'key'});
        if(!d.objectStoreNames.contains(OUTBOX))d.createObjectStore(OUTBOX,{keyPath:'id'});
      };
      req.onsuccess=()=>{activity('end');resolve(req.result)};
      req.onerror=()=>{activity('end');reject(req.error)};
    });
  }

  async function metaGet(key){return request(db.transaction(META,'readonly').objectStore(META).get(key));}
  async function metaPut(row){const tx=db.transaction(META,'readwrite');tx.objectStore(META).put(row);await txDone(tx);}

  async function ensureDataKey(){
    let deviceKeyRow=await metaGet('deviceKey');
    let deviceKey=deviceKeyRow?.value;
    if(!deviceKey){
      deviceKey=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);
      await metaPut({key:'deviceKey',value:deviceKey,createdAt:new Date().toISOString()});
    }
    const wrapped=await metaGet('wrappedDataKey');
    if(!wrapped){
      const raw=crypto.getRandomValues(new Uint8Array(32));
      const iv=crypto.getRandomValues(new Uint8Array(12));
      const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(AAD)},deviceKey,raw);
      await metaPut({key:'wrappedDataKey',iv:b64(iv),cipher:b64(cipher),createdAt:new Date().toISOString()});
      dataKey=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
      raw.fill(0);
      return;
    }
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(wrapped.iv),additionalData:enc.encode(AAD)},deviceKey,unb64(wrapped.cipher));
    dataKey=await crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);
  }

  async function encryptValue(value){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const plaintext=enc.encode(String(value));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(AAD)},dataKey,plaintext);
    return {v:1,alg:'AES-GCM',iv:b64(iv),cipher:b64(cipher),updatedAt:new Date().toISOString()};
  }
  async function decryptRow(row){
    const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(row.iv),additionalData:enc.encode(AAD)},dataKey,unb64(row.cipher));
    return dec.decode(plain);
  }
  async function encryptBytes(bytes,context='BINARY'){
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const aad=enc.encode(AAD+'-'+context);
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},dataKey,bytes);
    return {v:1,alg:'AES-GCM',context,iv:b64(iv),cipher:b64(cipher)};
  }
  async function decryptBytes(row){
    const aad=enc.encode(AAD+'-'+(row.context||'BINARY'));
    return crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(row.iv),additionalData:aad},dataKey,unb64(row.cipher));
  }
  async function persist(key,value){
    const payload=await encryptValue(value);
    const tx=db.transaction(RECORDS,'readwrite');
    tx.objectStore(RECORDS).put({key,...payload});
    await txDone(tx);
  }
  async function removePersisted(key){
    const tx=db.transaction(RECORDS,'readwrite');
    tx.objectStore(RECORDS).delete(key);
    await txDone(tx);
  }
  function track(operation){pendingWrites.add(operation);operation.finally(()=>pendingWrites.delete(operation));return operation;}
  function persistWhenReady(key,value){
    return track(ready.then(async()=>{
      if(db&&dataKey)return persist(key,value);
      try{localStorage.setItem(key,String(value));}catch{}
    }));
  }
  function removeWhenReady(key){
    return track(ready.then(async()=>{
      if(db&&dataKey)return removePersisted(key);
      try{localStorage.removeItem(key);}catch{}
    }));
  }
  async function loadCache(){
    const rows=await request(db.transaction(RECORDS,'readonly').objectStore(RECORDS).getAll());
    for(const row of rows){
      try{cache.set(row.key,await decryptRow(row));}
      catch(err){console.error('SecureStorage: Datensatz konnte nicht entschlüsselt werden',row.key,err);}
    }
  }
  async function migrateLegacy(){
    const keys=[
      'kcAcademySettings','kcAcademyCompleted','kcAcademyAudioBeta103','kcAcademyCharacterOverridesV1','kcAcademyTelemetryV1','kcAcademyName'
    ];
    for(const key of keys){
      let val=null;
      try{val=localStorage.getItem(key);}catch{}
      if(val===null){try{val=sessionStorage.getItem(key);}catch{}}
      if(val!==null&&!cache.has(key)){
        cache.set(key,val);
        await persist(key,val);
      }
      try{localStorage.removeItem(key);}catch{}
      try{sessionStorage.removeItem(key);}catch{}
    }
    await metaPut({key:'legacyMigrationV1',value:true,at:new Date().toISOString()});
  }

  async function exportRecovery(passphrase){
    if(!passphrase||passphrase.length<12)throw new Error('Recovery-Passphrase muss mindestens 12 Zeichen lang sein.');
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const base=await crypto.subtle.importKey('raw',enc.encode(passphrase),'PBKDF2',false,['deriveKey']);
    const kek=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
    const deviceKeyRow=await metaGet('deviceKey');
    const wrapped=await metaGet('wrappedDataKey');
    const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(wrapped.iv),additionalData:enc.encode(AAD)},deviceKeyRow.value,unb64(wrapped.cipher));
    const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(AAD+'-RECOVERY')},kek,raw);
    return JSON.stringify({format:'KC-FUTURA-RECOVERY',version:1,kdf:'PBKDF2-SHA256',iterations:310000,salt:b64(salt),iv:b64(iv),cipher:b64(cipher),createdAt:new Date().toISOString()},null,2);
  }

  async function queueForSync(type,payload,meta={}){
    const encrypted=await encryptValue(JSON.stringify(payload));
    const row={id:crypto.randomUUID(),type,createdAt:new Date().toISOString(),status:'pending',attempts:0,meta,payload:encrypted};
    const tx=db.transaction(OUTBOX,'readwrite');tx.objectStore(OUTBOX).put(row);await txDone(tx);return row.id;
  }
  async function getPendingOutbox(limit=100){
    const rows=await request(db.transaction(OUTBOX,'readonly').objectStore(OUTBOX).getAll());
    return rows.filter(r=>r.status!=='sent').sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt))).slice(0,limit);
  }
  async function updateOutbox(id,patch){
    const tx=db.transaction(OUTBOX,'readwrite'),store=tx.objectStore(OUTBOX);const row=await request(store.get(id));if(row)store.put({...row,...patch});await txDone(tx);
  }
  async function markOutboxSent(id){return updateOutbox(id,{status:'sent',sentAt:new Date().toISOString(),lastError:''})}
  async function markOutboxFailed(id,error){const tx=db.transaction(OUTBOX,'readwrite'),store=tx.objectStore(OUTBOX);const row=await request(store.get(id));if(row)store.put({...row,status:'pending',attempts:Number(row.attempts||0)+1,lastError:String(error||''),lastAttemptAt:new Date().toISOString()});await txDone(tx)}

  const api={
    version:'1.0.0',
    ready,
    getItem(key){return cache.has(key)?cache.get(key):null;},
    setItem(key,value){cache.set(key,String(value));persistWhenReady(key,String(value)).catch(err=>console.error('SecureStorage persist failed',err));},
    removeItem(key){cache.delete(key);removeWhenReady(key).catch(err=>console.error('SecureStorage remove failed',err));},
    async flush(){await ready;await Promise.allSettled([...pendingWrites]);},
    exportRecovery,
    encryptBytes,
    decryptBytes,
    queueForSync,getPendingOutbox,markOutboxSent,markOutboxFailed,
    async inventory(){
      const tx=db.transaction([RECORDS,META,OUTBOX],'readonly');
      const records=await request(tx.objectStore(RECORDS).getAll());
      const meta=await request(tx.objectStore(META).getAll());
      const outbox=await request(tx.objectStore(OUTBOX).getAll());
      return {database:DB_NAME,version:DB_VERSION,stores:{records:records.length,meta:meta.length,outbox:outbox.length},outbox:{pending:outbox.filter(x=>x.status!=='sent').length,sent:outbox.filter(x=>x.status==='sent').length,failed:outbox.filter(x=>Number(x.attempts||0)>0).length},records:records.map(x=>({key:x.key,updatedAt:x.updatedAt||'',bytes:JSON.stringify(x).length})),estimatedBytes:[...records,...meta,...outbox].reduce((n,x)=>n+JSON.stringify(x).length,0)};
    },
    async integrityCheck(onProgress){
      const rows=await request(db.transaction(RECORDS,'readonly').objectStore(RECORDS).getAll());let valid=0;const damaged=[];const total=rows.length;
      if(typeof onProgress==='function')onProgress({processed:0,total,phase:'Verschlüsselte Datensätze vorbereiten'});
      for(let i=0;i<rows.length;i++){const row=rows[i];try{await decryptRow(row);valid++}catch(e){damaged.push({key:row.key,error:e.message})}if(typeof onProgress==='function')onProgress({processed:i+1,total,phase:'Verschlüsselungsintegrität prüfen'});}
      return {ok:damaged.length===0,total:rows.length,valid,damaged,checkedAt:new Date().toISOString()};
    },
    async purgeSentOutbox(olderThanDays=7){
      const cutoff=Date.now()-Math.max(0,Number(olderThanDays)||0)*86400000;const tx=db.transaction(OUTBOX,'readwrite');const store=tx.objectStore(OUTBOX);const rows=await request(store.getAll());let deleted=0;
      rows.filter(x=>x.status==='sent'&&Date.parse(x.sentAt||x.createdAt||0)<=cutoff).forEach(x=>{store.delete(x.id);deleted++});await txDone(tx);return {deleted};
    },
    async retryFailedOutbox(){const tx=db.transaction(OUTBOX,'readwrite');const store=tx.objectStore(OUTBOX);const rows=await request(store.getAll());let reset=0;rows.filter(x=>Number(x.attempts||0)>0&&x.status!=='sent').forEach(x=>{store.put({...x,status:'pending',lastError:'',attempts:0});reset++});await txDone(tx);return {reset};},
    async encryptedBackup(){
      const tx=db.transaction([RECORDS,META,OUTBOX],'readonly');const records=await request(tx.objectStore(RECORDS).getAll());const outbox=await request(tx.objectStore(OUTBOX).getAll());
      return {format:'KC-FUTURA-DB-BACKUP',version:1,createdAt:new Date().toISOString(),database:DB_NAME,records,outbox};
    },
    async secureWipe(){cache.clear();dataKey=null;if(db)db.close();await new Promise((resolve,reject)=>{const r=indexedDB.deleteDatabase(DB_NAME);r.onsuccess=resolve;r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Datenbank ist noch geöffnet.'))});try{localStorage.clear()}catch{}try{sessionStorage.clear()}catch{}if('caches'in window){for(const n of await caches.keys())await caches.delete(n)}return {wiped:true,at:new Date().toISOString()};},
    async diagnostics(){
      const rows=await request(db.transaction(RECORDS,'readonly').objectStore(RECORDS).getAllKeys());
      return {db:DB_NAME,records:rows.length,encrypted:true,algorithm:'AES-GCM',legacyLocalStorageEmpty:['kcAcademySettings','kcAcademyCompleted','kcAcademyTelemetryV1'].every(k=>!localStorage.getItem(k))};
    },
    async benchmark(){
      const key='__kc_speed_test__';
      const payload=JSON.stringify({at:Date.now(),sample:'KC FUTURA IndexedDB Geschwindigkeitstest'.repeat(8)});
      const started=performance.now();
      await persist(key,payload);
      const writeMs=Math.max(0.1,performance.now()-started);
      const readStarted=performance.now();
      const tx=db.transaction(RECORDS,'readonly');
      const row=await request(tx.objectStore(RECORDS).get(key));
      if(row)await decryptRow(row);
      const readMs=Math.max(0.1,performance.now()-readStarted);
      await removePersisted(key);
      const totalMs=Math.max(0.2,writeMs+readMs);
      return {writeMs:Math.round(writeMs*10)/10,readMs:Math.round(readMs*10)/10,totalMs:Math.round(totalMs*10)/10,opsPerSecond:Math.max(1,Math.round(2000/totalMs)),at:new Date().toISOString()};
    }
  };
  window.KCSecureStorage=api;

  (async()=>{
    try{
      db=await openDb();
      await ensureDataKey();
      await loadCache();
      await migrateLegacy();
    }catch(err){
      console.error('KC Secure Storage konnte nicht initialisiert werden',err);
      window.KCSecureStorageInitError=err;
    }finally{readyResolve();}
  })();
})();
