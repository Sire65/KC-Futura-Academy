(function(){
  'use strict';
  const DB_NAME='karriereleiter_v7', DB_VERSION=5, OPEN_TIMEOUT_MS=1800;
  const LS={state:'karriereleiter_v8_backup',profile:'karriereleiter_profile_backup',settings:'karriereleiter_admin_settings_backup',attempts:'karriereleiter_attempts_fallback',sessions:'karriereleiter_sessions_fallback',outbox:'karriereleiter_outbox_fallback',contentMeta:'karriereleiter_content_meta_fallback',questionHistory:'karriereleiter_question_history_v14',certificates:'karriereleiter_certificates_v14',learningModel:'karriereleiter_learning_model_v16',kitchenBook:'karriereleiter_kitchenbook_v18'};
  let dbPromise=null,lastDbError=null;
  const listeners={status:new Set(),traffic:new Set()};
  const emit=(type,p)=>listeners[type].forEach(fn=>{try{fn(p)}catch(e){}});
  const signal=(op,store)=>emit('traffic',{op,store,at:Date.now()});
  const uid=(p='id')=>crypto.randomUUID?.()||(`${p}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const timeout=(ms,msg)=>new Promise((_,reject)=>setTimeout(()=>reject(new Error(msg)),ms));
  const enc=(v,p)=>window.KarriereCrypto.encrypt(v,p),dec=(v,p)=>window.KarriereCrypto.decrypt(v,p);
  async function lsGet(k,fallback=null,purpose='fallback'){try{const raw=localStorage.getItem(k);if(!raw)return fallback;const parsed=JSON.parse(raw);return await dec(parsed,`${purpose}:${k}`)}catch(e){return fallback}}
  async function lsSet(k,v,purpose='fallback'){try{const e=await enc(v,`${purpose}:${k}`);localStorage.setItem(k,JSON.stringify(e));return true}catch(err){return false}}
  const lsRemove=k=>{try{localStorage.removeItem(k)}catch(e){}};
  function open(){
    if(dbPromise)return dbPromise;
    dbPromise=(async()=>{try{
      if(!('indexedDB'in window))throw new Error('IndexedDB nicht verfügbar');
      const opening=new Promise((resolve,reject)=>{let req;try{req=indexedDB.open(DB_NAME,DB_VERSION)}catch(e){reject(e);return}
        req.onupgradeneeded=()=>{const db=req.result;
          if(!db.objectStoreNames.contains('state'))db.createObjectStore('state',{keyPath:'id'});
          if(!db.objectStoreNames.contains('attempts'))db.createObjectStore('attempts',{keyPath:'id',autoIncrement:true});
          if(!db.objectStoreNames.contains('profile'))db.createObjectStore('profile',{keyPath:'id'});
          if(!db.objectStoreNames.contains('content'))db.createObjectStore('content',{keyPath:'id'});
          if(!db.objectStoreNames.contains('outbox'))db.createObjectStore('outbox',{keyPath:'id',autoIncrement:true});
          if(!db.objectStoreNames.contains('settings'))db.createObjectStore('settings',{keyPath:'id'});
          if(!db.objectStoreNames.contains('sessions'))db.createObjectStore('sessions',{keyPath:'id',autoIncrement:true});
        };
        req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB open fehlgeschlagen'));req.onblocked=()=>reject(new Error('IndexedDB blockiert'));
      });
      const db=await Promise.race([opening,timeout(OPEN_TIMEOUT_MS,'IndexedDB Zeitüberschreitung')]);lastDbError=null;emit('status',{ok:true,engine:'IndexedDB'});return db;
    }catch(e){lastDbError=e;dbPromise=null;emit('status',{ok:false,engine:'localStorage-Fallback',error:String(e)});throw e}})();
    return dbPromise;
  }
  const reqValue=req=>new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('IndexedDB Request fehlgeschlagen'))});
  async function rawGet(store,id){const db=await open();signal('read',store);return reqValue(db.transaction(store,'readonly').objectStore(store).get(id))}
  async function rawPut(store,record){const db=await open();signal('write',store);return reqValue(db.transaction(store,'readwrite').objectStore(store).put(record))}
  async function rawAdd(store,record){const db=await open();signal('write',store);return reqValue(db.transaction(store,'readwrite').objectStore(store).add(record))}
  async function rawDelete(store,id){const db=await open();signal('write',store);return reqValue(db.transaction(store,'readwrite').objectStore(store).delete(id))}
  async function allRaw(store,limit=1000){const db=await open();signal('read',store);const req=db.transaction(store,'readonly').objectStore(store).openCursor(null,'prev');return new Promise((resolve,reject)=>{const out=[];req.onsuccess=()=>{const c=req.result;if(c&&out.length<limit){out.push(c.value);c.continue()}else resolve(out)};req.onerror=()=>reject(req.error)})}
  async function pack(value,purpose){return{enc:await enc(value,`idb:${purpose}`)}}
  async function unpack(record,purpose){if(!record)return null;if(record.enc)return dec(record.enc,`idb:${purpose}`);return record}
  async function fallbackAppend(key,item,limit=4000){const a=await lsGet(key,[],'list');a.unshift(item);if(a.length>limit)a.length=limit;await lsSet(key,a,'list')}
  function mergeUnique(primary,fallback,keyFn,limit){const m=new Map();for(const x of [...primary,...fallback]){const k=keyFn(x);if(!m.has(k))m.set(k,x)}return[...m.values()].slice(0,limit)}
  async function decodeMany(store,rows){const out=[];for(const r of rows){try{if(r.enc){const x=await dec(r.enc,`idb:${store}`);if(x&&x.id==null&&r.id!=null)x.id=r.id;out.push(x)}else{const legacy={...r};out.push(legacy)}}catch(e){}}return out}
  async function migrateLegacy(){
    const stores=['state','attempts','profile','content','outbox','settings','sessions'];let migrated=0,fallbackMigrated=0;
    for(const [name,key] of Object.entries(LS)){try{const raw=localStorage.getItem(key);if(!raw)continue;const parsed=JSON.parse(raw);if(parsed?.__kc_enc)continue;const value=parsed;await lsSet(key,value,`migration:${name}`);fallbackMigrated++}catch(e){}}
    try{const db=await open();for(const store of stores){const rows=await allRaw(store,5000);for(const r of rows){if(r?.enc)continue;const id=r.id;let value={...r};delete value.id;try{const nr={id,...await pack(value,store)};await rawPut(store,nr);migrated++}catch(e){}}}return{ok:true,migrated,fallbackMigrated}}catch(e){return{ok:false,migrated,fallbackMigrated,error:String(e)}}
  }
  const api={
    on(type,fn){listeners[type]?.add(fn);return()=>listeners[type]?.delete(fn)},
    async saveState(state){const clean=JSON.parse(JSON.stringify(state));clean.current=null;clean.answered=false;clean.sequence=[];clean.matchLeft=null;clean.matchRight=null;await lsSet(LS.state,clean,'state');try{await rawPut('state',{id:'main',...await pack({value:clean,updatedAt:new Date().toISOString()},'state')})}catch(e){}return true},
    async loadState(){try{const r=await rawGet('state','main');if(r){const x=await unpack(r,'state');if(x?.value)return x.value;if(x?.current!==undefined)return x}}catch(e){}return lsGet(LS.state,null,'state')},
    async clearState(){lsRemove(LS.state);try{await rawDelete('state','main')}catch(e){}return true},
    async addAttempt(attempt){const item={...attempt,localAttemptId:attempt.localAttemptId||uid('a'),createdAt:attempt.createdAt||new Date().toISOString(),synced:false};try{const id=await rawAdd('attempts',await pack(item,'attempts'));await rawAdd('outbox',await pack({type:'attempt',payload:{...item,id},createdAt:item.createdAt},'outbox'));return id}catch(e){await fallbackAppend(LS.attempts,item,4000);await fallbackAppend(LS.outbox,{id:item.localAttemptId,type:'attempt',payload:item,createdAt:item.createdAt},1000);return item.localAttemptId}},
    async addSession(session){const item={...session,localSessionId:session.localSessionId||uid('s'),createdAt:session.createdAt||new Date().toISOString(),synced:false};try{const id=await rawAdd('sessions',await pack(item,'sessions'));await rawAdd('outbox',await pack({type:'session',payload:{...item,id},createdAt:item.createdAt},'outbox'));return id}catch(e){await fallbackAppend(LS.sessions,item,1500);await fallbackAppend(LS.outbox,{id:item.localSessionId,type:'session',payload:item,createdAt:item.createdAt},1000);return item.localSessionId}},
    async recentAttempts(limit=20){return this.allAttempts(limit)},
    async allAttempts(limit=2000){let a=[];try{a=await decodeMany('attempts',await allRaw('attempts',limit))}catch(e){}const f=await lsGet(LS.attempts,[],'list');return mergeUnique(a,f,x=>x.localAttemptId||`id:${x.id}`,limit)},
    async allSessions(limit=500){let a=[];try{a=await decodeMany('sessions',await allRaw('sessions',limit))}catch(e){}const f=await lsGet(LS.sessions,[],'list');return mergeUnique(a,f,x=>x.localSessionId||`id:${x.id}`,limit)},
    async saveProfile(profile){await lsSet(LS.profile,profile,'profile');try{await rawPut('profile',{id:'main',...await pack(profile,'profile')})}catch(e){}return true},
    async loadProfile(){try{const r=await rawGet('profile','main');if(r){const x=await unpack(r,'profile');if(x)return x}}catch(e){}return lsGet(LS.profile,null,'profile')},
    getQuestionHistorySync(){return[]},
    async loadQuestionHistory(){try{const r=await rawGet('profile','questionHistory');if(r){const x=await unpack(r,'profile');if(Array.isArray(x?.items))return x.items}}catch(e){}return lsGet(LS.questionHistory,[],'history')},
    async recordQuestionHistory(questionId){if(!questionId)return false;let items=await this.loadQuestionHistory();items=[questionId,...items.filter(x=>x!==questionId)].slice(0,160);await lsSet(LS.questionHistory,items,'history');try{await rawPut('profile',{id:'questionHistory',...await pack({items,updatedAt:new Date().toISOString()},'profile')})}catch(e){}return true},
    async recordCertificate(cert){if(!cert?.id)return false;let items=await this.listCertificates();items=[cert,...items.filter(x=>x.id!==cert.id)].slice(0,50);await lsSet(LS.certificates,items,'certs');try{await rawPut('profile',{id:'certificates',...await pack({items,updatedAt:new Date().toISOString()},'profile')})}catch(e){}return true},
    async listCertificates(){try{const r=await rawGet('profile','certificates');if(r){const x=await unpack(r,'profile');if(Array.isArray(x?.items))return x.items}}catch(e){}return lsGet(LS.certificates,[],'certs')},
    async saveKitchenBookEntry(entry){if(!entry?.id)return false;let items=await this.listKitchenBook();items=[{...entry,savedAt:entry.savedAt||new Date().toISOString()},...items.filter(x=>x.id!==entry.id)].slice(0,240);await lsSet(LS.kitchenBook,items,'kitchenBook');try{await rawPut('profile',{id:'kitchenBook',...await pack({items,updatedAt:new Date().toISOString()},'profile')})}catch(e){}return true},
    async listKitchenBook(){try{const r=await rawGet('profile','kitchenBook');if(r){const x=await unpack(r,'profile');if(Array.isArray(x?.items))return x.items}}catch(e){}return lsGet(LS.kitchenBook,[],'kitchenBook')},
    async saveLearningModel(value){await lsSet(LS.learningModel,value,'learningModel');try{await rawPut('profile',{id:'learningModel',...await pack(value,'profile')})}catch(e){}return true},
    async loadLearningModel(){try{const r=await rawGet('profile','learningModel');if(r){const x=await unpack(r,'profile');if(x)return x}}catch(e){}return lsGet(LS.learningModel,null,'learningModel')},
    async saveSettings(value){await lsSet(LS.settings,value,'settings');try{await rawPut('settings',{id:'admin',...await pack({value,updatedAt:new Date().toISOString()},'settings')})}catch(e){}return true},
    async loadSettings(){try{const r=await rawGet('settings','admin');if(r){const x=await unpack(r,'settings');if(x?.value)return x.value;if(x)return x}}catch(e){}return lsGet(LS.settings,null,'settings')},
    async cacheContent(items,version='v16.0'){await lsSet(LS.contentMeta,{version,count:items.length,updatedAt:new Date().toISOString()},'contentMeta');try{await rawPut('content',{id:'catalog-meta',...await pack({version,count:items.length,updatedAt:new Date().toISOString()},'content')});await rawPut('content',{id:'catalog',...await pack({items,version},'content')})}catch(e){}return true},
    async contentMeta(){try{const r=await rawGet('content','catalog-meta');if(r)return unpack(r,'content')}catch(e){}return lsGet(LS.contentMeta,null,'contentMeta')},
    async getOutbox(limit=50){let a=[];try{a=await decodeMany('outbox',await allRaw('outbox',limit))}catch(e){}const f=await lsGet(LS.outbox,[],'list');return mergeUnique(a,f,x=>String(x.id||x.payload?.localAttemptId||x.payload?.localSessionId||Math.random()),limit)},
    async deleteOutbox(id){try{await rawDelete('outbox',id)}catch(e){}const a=(await lsGet(LS.outbox,[],'list')).filter(x=>String(x.id)!==String(id));await lsSet(LS.outbox,a,'list')},
    async counts(){let idb={attempts:0,sessions:0,outbox:0,content:0};try{const db=await open();for(const n of Object.keys(idb)){signal('read',n);idb[n]=await reqValue(db.transaction(n,'readonly').objectStore(n).count())}}catch(e){}const fa=await lsGet(LS.attempts,[],'list'),fs=await lsGet(LS.sessions,[],'list'),fo=await lsGet(LS.outbox,[],'list'),fm=await lsGet(LS.contentMeta,{count:0},'contentMeta');return{attempts:idb.attempts+fa.length,sessions:idb.sessions+fs.length,outbox:idb.outbox+fo.length,content:idb.content||Number(fm?.count||0)}},
    async status(){try{await open();return{ok:true,playable:true,engine:'IndexedDB',db:DB_NAME,version:DB_VERSION,encrypted:true,crypto:window.KarriereCrypto?.getMode?.()||'unknown'}}catch(e){return{ok:false,playable:true,engine:'encrypted-localStorage-Fallback',db:DB_NAME,error:String(lastDbError||e),encrypted:true,crypto:window.KarriereCrypto?.getMode?.()||'unknown'}}},
    async health(){const st=await this.status(),counts=await this.counts(),cryptoTest=await window.KarriereCrypto?.selfTest?.();return{...st,counts,cryptoTest,timestamp:new Date().toISOString()}},
    migrateLegacy
  };
  window.KarriereStorage=api;
})();
