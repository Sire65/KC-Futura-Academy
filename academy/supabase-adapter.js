'use strict';
(function(){
  const CONFIG_KEY='kcAcademySupabaseConfigV2';
  const SESSION_KEY='kcAcademySupabaseSessionV1';
  const INSTALLATION_KEY='kcAcademyInstallationIdV1';
  const DEVICE_NAME_KEY='kcAcademyDeviceNameV1';
  const STATS_KEY='kcAcademySupabaseStatsV1';
  const deployment=window.KC_DEPLOYMENT_CONFIG?.supabase||{};
  const defaults={enabled:deployment.enabled!==false,projectUrl:deployment.projectUrl||'https://iddudrxuihdodnvejxcp.supabase.co',projectRef:'iddudrxuihdodnvejxcp',publishableKey:deployment.publishableKey||'',schema:'public',table:'academy_encrypted_events',autoSync:deployment.autoSync!==false,offlineAllowed:deployment.offlineAllowed!==false,syncIntervalSeconds:Number(deployment.syncIntervalSeconds)||60,anonymousAuth:true};
  const config={...defaults};
  let syncTimer=null,syncing=false,lastResult={ok:false,reason:'not_started'},activityHandler=()=>{};
  let heartbeatTimer=null;
  const now=()=>new Date().toISOString();
  const normalizeUrl=v=>String(v||'').trim().replace(/\/+$/,'');
  const safeParse=(v,f)=>{try{return JSON.parse(v)}catch{return f}};
  const storage=()=>window.KCSecureStorage;
  function load(){const stored=safeParse(storage()?.getItem(CONFIG_KEY)||'{}',{});Object.assign(config,defaults,stored);config.projectUrl=normalizeUrl(config.projectUrl)||defaults.projectUrl;config.publishableKey=String(config.publishableKey||'').trim()||defaults.publishableKey;config.enabled=config.enabled!==false;config.projectRef=config.projectRef||defaults.projectRef;config.table=config.table||defaults.table;return config}
  function save(){storage()?.setItem(CONFIG_KEY,JSON.stringify(config));return config}
  function configure(next={}){Object.assign(config,next);config.projectUrl=normalizeUrl(config.projectUrl);save();schedule();window.dispatchEvent(new CustomEvent('kc:supabase-status',{detail:diagnostics()}));return {...config}}
  function installationId(){let id=storage()?.getItem(INSTALLATION_KEY);if(!id){id=crypto.randomUUID();storage()?.setItem(INSTALLATION_KEY,id)}return id}
  function inferredDeviceName(){const ua=navigator.userAgent||'';if(/iPad/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1))return 'iPad';if(/iPhone/i.test(ua))return 'iPhone';if(/Android/i.test(ua))return 'Android Tablet';if(/Windows/i.test(ua))return 'Windows-PC';if(/Macintosh/i.test(ua))return 'Mac';return 'Browser-Gerät'}
  function deviceName(){return storage()?.getItem(DEVICE_NAME_KEY)||inferredDeviceName()}
  function setDeviceName(name){const clean=String(name||'').trim().slice(0,60)||inferredDeviceName();storage()?.setItem(DEVICE_NAME_KEY,clean);return clean}
  function stats(){return safeParse(storage()?.getItem(STATS_KEY)||'{}',{uploaded:0,downloaded:0,lastSync:'',lastHeartbeat:''})}
  function saveStats(next){const merged={...stats(),...next};storage()?.setItem(STATS_KEY,JSON.stringify(merged));return merged}
  function deviceMetadata(){return {device_name:deviceName(),device_type:inferredDeviceName(),platform:navigator.platform||'',user_agent:(navigator.userAgent||'').slice(0,220),last_seen:now(),online:navigator.onLine,app:'KC FUTURA Academy'}}
  function session(){return safeParse(storage()?.getItem(SESSION_KEY)||'null',null)}
  function storeSession(s){storage()?.setItem(SESSION_KEY,JSON.stringify(s));return s}
  function headers(token,extra={}){return {'apikey':config.publishableKey,'Authorization':`Bearer ${token||config.publishableKey}`,'Content-Type':'application/json',...extra}}
  async function request(path,options={}){if(!config.projectUrl||!config.publishableKey)throw new Error('Supabase-Projekt-URL oder Publishable Key fehlt.');const emit=phase=>window.dispatchEvent(new CustomEvent('kc:db-traffic',{detail:{database:'supabase',phase,at:Date.now()}}));activityHandler('start');emit('start');try{const res=await fetch(config.projectUrl+path,options);const text=await res.text();let body=text;try{body=text?JSON.parse(text):null}catch{}if(!res.ok)throw new Error(body?.msg||body?.message||body?.error_description||body?.error||`HTTP ${res.status}`);return body}finally{activityHandler('end');emit('end')}}
  async function refreshSession(current){if(!current?.refresh_token)return null;const body=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:headers(null),body:JSON.stringify({refresh_token:current.refresh_token})});return storeSession(body)}
  async function ensureSession(){
    let s=session();const expiresAt=Number(s?.expires_at||0);if(s?.access_token&&expiresAt>Date.now()/1000+60)return s;
    if(s?.refresh_token){try{s=await refreshSession(s);if(s?.access_token)return s}catch(e){console.warn('Supabase session refresh failed',e)}}
    if(!config.anonymousAuth)throw new Error('Keine Supabase-Anmeldung vorhanden.');
    const body=await request('/auth/v1/signup',{method:'POST',headers:headers(null),body:JSON.stringify({data:{installation_id:installationId(),client:'kc-futura-academy'}})});
    if(!body?.access_token)throw new Error('Anonyme Supabase-Anmeldung ist im Projekt nicht aktiviert.');
    return storeSession(body);
  }
  async function enqueue(type,payload,meta={}){const id=await storage().queueForSync(type,payload,{...meta,installationId:installationId()});if(config.enabled&&navigator.onLine&&config.autoSync)setTimeout(()=>sync(),20);return id}
  async function sync(options={}){
    if(syncing)return {ok:false,reason:'already_running'};
    if(!config.enabled)return lastResult={ok:false,reason:'disabled'};
    if(!config.projectUrl||!config.publishableKey)return lastResult={ok:false,reason:'missing_config'};
    const syncStarted=performance.now();
    syncing=true;window.dispatchEvent(new CustomEvent('kc:supabase-status',{detail:{...diagnostics(),syncing:true}}));
    try{
      const s=await ensureSession();const pending=await storage().getPendingOutbox(100);let sent=0,failed=0;const total=pending.length;
      if(typeof options.onProgress==='function')options.onProgress({processed:0,total,phase:'Supabase-Sitzung hergestellt'});
      for(let index=0;index<pending.length;index++){const row=pending[index];
        try{
          const plainMeta={...(row.meta||{})};const source=row.meta?.summary||{};const record={client_event_id:row.id,event_type:row.type,encrypted_payload:row.payload,client_created_at:row.createdAt,installation_id:installationId(),academy_version:document.documentElement.dataset.academyVersion||'unknown',participant_name:String(plainMeta.participantName||source.name||'').slice(0,120),module_id:String(source.module||plainMeta.module||'').slice(0,120),is_correct:typeof source.correct==='boolean'?source.correct:null,duration_ms:Number(source.durationMs||plainMeta.durationMs)||null,score:Number(source.score)||null,total:Number(source.total)||null,metadata:plainMeta};
          await request(`/rest/v1/${encodeURIComponent(config.table)}?on_conflict=owner_id,client_event_id`,{method:'POST',headers:headers(s.access_token,{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(record)});
          await storage().markOutboxSent(row.id);sent++;
        }catch(err){await storage().markOutboxFailed(row.id,err.message);failed++}
        if(typeof options.onProgress==='function')options.onProgress({processed:index+1,total,phase:'Outbox an Supabase übertragen',sent,failed});
      }
      const durationMs=Math.max(1,Math.round(performance.now()-syncStarted));
      lastResult={ok:failed===0,sent,failed,pending:(await storage().getPendingOutbox(1000)).length,durationMs,recordsPerSecond:sent?Math.max(1,Math.round(sent/(durationMs/1000))):0,at:now()};const st=stats();saveStats({uploaded:Number(st.uploaded||0)+sent,lastSync:lastResult.at});registerDevice().catch(()=>{});return lastResult;
    }catch(err){lastResult={ok:false,reason:'sync_error',message:err.message,at:now()};return lastResult}
    finally{syncing=false;window.dispatchEvent(new CustomEvent('kc:supabase-status',{detail:diagnostics()}))}
  }
  async function testConnection(options={}){
    const started=performance.now();
    const report={ok:false,authOk:false,dbOk:false,rlsOk:false,writeOk:false,readOk:false,cleanupOk:false,userId:'',table:config.table,latencyMs:null,message:''};
    try{
      const s=await ensureSession();report.authOk=Boolean(s?.access_token&&s?.user?.id);report.userId=s?.user?.id||'';
      const result=await request(`/rest/v1/${encodeURIComponent(config.table)}?select=id&limit=1`,{headers:headers(s.access_token)});report.dbOk=Array.isArray(result);report.rlsOk=true;report.rlsMessage='Eigener Zugriff mit authentifizierter anonymer Sitzung erlaubt.';
      if(options.full){
        const testId=crypto.randomUUID();
        const testRecord={client_event_id:testId,event_type:'connection_test',encrypted_payload:{format:'kc-connection-test-v1',payload:'no-personal-data'},client_created_at:now(),installation_id:installationId(),academy_version:document.documentElement.dataset.academyVersion||'2.2.0',participant_name:'',module_id:'system.connection',metadata:{connection_test:true,stage:'written'}};
        await request(`/rest/v1/${encodeURIComponent(config.table)}`,{method:'POST',headers:headers(s.access_token,{'Prefer':'return=minimal'}),body:JSON.stringify(testRecord)});report.writeOk=true;report.writeMessage='Testdatensatz wurde unter der eigenen Benutzer-ID gespeichert.';
        const rows=await request(`/rest/v1/${encodeURIComponent(config.table)}?client_event_id=eq.${encodeURIComponent(testId)}&select=id,client_event_id,event_type`,{headers:headers(s.access_token)});report.readOk=Array.isArray(rows)&&rows.length===1;report.readMessage=report.readOk?'Gespeicherter Testdatensatz wurde wieder gelesen.':'Testdatensatz konnte nicht wieder gelesen werden.';
        if(report.readOk){await request(`/rest/v1/${encodeURIComponent(config.table)}?client_event_id=eq.${encodeURIComponent(testId)}`,{method:'PATCH',headers:headers(s.access_token,{'Prefer':'return=minimal'}),body:JSON.stringify({metadata:{connection_test:true,stage:'completed',completed_at:now()}})});report.cleanupOk=true;report.cleanupMessage='Testdatensatz wurde als erfolgreicher Verbindungsnachweis abgeschlossen.'}
      }else{report.writeOk=report.readOk=report.cleanupOk=true}
      report.ok=report.authOk&&report.dbOk&&report.rlsOk&&report.writeOk&&report.readOk&&report.cleanupOk;report.latencyMs=Math.max(1,Math.round(performance.now()-started));report.message=report.ok?'Verbindungstest erfolgreich.':'Verbindungstest unvollständig.';lastResult={...report,connectionTest:report.ok,at:now()};return report;
    }catch(err){report.message=err.message||String(err);report.latencyMs=Math.max(1,Math.round(performance.now()-started));lastResult={...report,connectionTest:false,at:now()};throw Object.assign(new Error(report.message),{report})}
  }
  async function registerDevice(){
    if(!config.enabled||!config.projectUrl||!config.publishableKey)return {ok:false,reason:'disabled'};
    const s=await ensureSession();const meta=deviceMetadata();
    const record={client_event_id:installationId(),event_type:'device_heartbeat',encrypted_payload:{format:'kc-device-heartbeat-v1',payload:'metadata-only'},client_created_at:now(),installation_id:installationId(),academy_version:document.documentElement.dataset.academyVersion||'unknown',participant_name:'',module_id:'system.device',metadata:meta};
    await request(`/rest/v1/${encodeURIComponent(config.table)}?on_conflict=owner_id,client_event_id`,{method:'POST',headers:headers(s.access_token,{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(record)});
    saveStats({lastHeartbeat:meta.last_seen});return {ok:true,device:meta};
  }
  async function listDevices(){
    if(!config.enabled||!config.projectUrl||!config.publishableKey)return [];
    const s=await ensureSession();
    const rows=await request(`/rest/v1/${encodeURIComponent(config.table)}?event_type=eq.device_heartbeat&select=installation_id,client_created_at,academy_version,metadata&order=client_created_at.desc&limit=50`,{headers:headers(s.access_token)});
    const seen=new Set();return (Array.isArray(rows)?rows:[]).filter(r=>{if(seen.has(r.installation_id))return false;seen.add(r.installation_id);return true});
  }
  function participantProfile(){return safeParse(storage()?.getItem('kcAcademyParticipantProfileV1')||'null',null)}
  function setParticipantProfile(profile){storage()?.setItem('kcAcademyParticipantProfileV1',JSON.stringify(profile));return profile}
  async function rpc(name,body={}){const s=await ensureSession();return request(`/rest/v1/rpc/${encodeURIComponent(name)}`,{method:'POST',headers:headers(s.access_token),body:JSON.stringify(body)})}
  async function findParticipantNames(displayName){if(!config.enabled||!config.publishableKey)return [];try{return await rpc('kc_find_participant_names',{p_display_name:String(displayName||'').trim()})}catch{return []}}
  async function registerParticipant(profile,recoveryHash){if(!config.enabled||!config.publishableKey)return {id:profile.id,display_name:profile.displayName};try{return await rpc('kc_register_participant',{p_participant_id:profile.id,p_display_name:profile.displayName,p_recovery_hash:recoveryHash,p_installation_id:installationId()})}catch(e){console.warn('Participant registration pending SQL migration',e);return {id:profile.id,display_name:profile.displayName}}}
  async function claimParticipant(displayName,recoveryHash){return rpc('kc_claim_participant',{p_display_name:String(displayName||'').trim(),p_recovery_hash:recoveryHash,p_installation_id:installationId()})}
  async function adminLearningReport(){return rpc('kc_admin_learning_report',{})}
  async function getDeviceSecurityCommand(){
    if(!config.enabled||!config.publishableKey)return null;const sess=await ensureSession();
    const rows=await request(`/rest/v1/kc_device_security_commands?installation_id=eq.${encodeURIComponent(installationId())}&select=command,reason,created_at,acknowledged_at&order=created_at.desc&limit=1`,{headers:headers(sess.access_token)});
    return Array.isArray(rows)&&rows[0]?rows[0]:null;
  }
  async function setDeviceSecurityCommand(command,reason=''){
    const allowed=['ACTIVE','LOCKED','WIPE_PENDING','REVOKED'];if(!allowed.includes(command))throw new Error('Ungültiger Gerätebefehl.');const sess=await ensureSession();
    const row={installation_id:installationId(),command,reason:String(reason||'').slice(0,300),created_at:now(),acknowledged_at:null};
    await request('/rest/v1/kc_device_security_commands?on_conflict=owner_id,installation_id',{method:'POST',headers:headers(sess.access_token,{'Prefer':'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(row)});return row;
  }
  function startHeartbeat(){if(heartbeatTimer)clearInterval(heartbeatTimer);heartbeatTimer=null;if(config.enabled&&config.autoSync){setTimeout(()=>registerDevice().catch(()=>{}),1500);heartbeatTimer=setInterval(()=>registerDevice().catch(()=>{}),60000)}}
  async function uploadSnapshot(kind,data,metadata={}){return enqueue('snapshot:'+kind,data,metadata)}
  function schedule(){if(syncTimer)clearInterval(syncTimer);syncTimer=null;if(config.enabled&&config.autoSync){syncTimer=setInterval(()=>{if(navigator.onLine)sync()},Math.max(15,Number(config.syncIntervalSeconds)||60)*1000)}startHeartbeat()}
  function setActivityHandler(fn){activityHandler=typeof fn==='function'?fn:()=>{}}
  function diagnostics(){const s=session();return {version:'1.6.0',enabled:config.enabled,configured:Boolean(config.projectUrl&&config.publishableKey),projectUrl:config.projectUrl,authenticated:Boolean(s?.access_token),userId:s?.user?.id||'',online:navigator.onLine,syncing,lastResult,installationId:installationId(),deviceName:deviceName(),stats:stats()}}
  load();schedule();window.addEventListener('online',()=>config.enabled&&sync());
  window.KCSupabaseAdapter={version:'1.6.0',config,configure,save,load,enqueue,sync,testConnection,uploadSnapshot,ensureSession,diagnostics,setActivityHandler,deviceName,setDeviceName,registerDevice,listDevices,stats,setParticipantProfile,findParticipantNames,registerParticipant,claimParticipant,adminLearningReport,getDeviceSecurityCommand,setDeviceSecurityCommand,rpc,request,installationId};
})();
