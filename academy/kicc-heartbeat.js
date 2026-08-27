(()=>{
  'use strict';
  const PROGRAM_ID='kc-futura-academy';
  const NAME='KC FUTURA Academy';
  const HEARTBEAT_CHANNEL='kicc-program-heartbeat-v1';
  const FLOW_CHANNEL='kicc-program-flow-v1';
  const INTERVAL_MS=30000;
  let errorCount=0,tx=0,rx=0,lastLatencyMs=null,lastActivityAt=null,wrapped=false;

  function version(){return String(window.KC_FUTURA_VERSION?.academyVersionNumber||window.KC_DEPLOYMENT_CONFIG?.version||document.documentElement.dataset.academyVersion||'unknown');}
  function instanceId(){
    const key='kcFuturaKiccInstanceV1';
    try{let id=localStorage.getItem(key);if(!id){id=crypto.randomUUID?.()||`futura-${Date.now()}-${Math.random().toString(36).slice(2)}`;localStorage.setItem(key,id);}return id;}
    catch{return 'kc-futura-browser';}
  }
  const INSTANCE_ID=instanceId();
  function publishChannel(name,payload){try{const bc=new BroadcastChannel(name);bc.postMessage(payload);bc.close();}catch{}}
  function emitHeartbeat(){
    const diag=window.KCSupabaseAdapter?.diagnostics?.()||{};
    const hb={schema:'kicc.program-heartbeat.v1',programId:PROGRAM_ID,instanceId:INSTANCE_ID,name:NAME,deviceType:'ACADEMY_APP',version:version(),build:window.KC_FUTURA_VERSION?.build||version(),status:navigator.onLine?'ONLINE':'OFFLINE',measuredAt:new Date().toISOString(),latencyMs:Number.isFinite(lastLatencyMs)?Math.round(lastLatencyMs):null,trafficRx:rx,trafficTx:tx,queueDepth:Number(diag?.lastResult?.pending)||0,errorCount,source:'PROGRAM_HEARTBEAT',trust:'SELF_REPORTED',message:document.visibilityState==='hidden'?'Academy im Hintergrund':'Academy aktiv'};
    try{window.dispatchEvent(new CustomEvent('kicc:program-heartbeat',{detail:hb}));}catch{}
    publishChannel(HEARTBEAT_CHANNEL,hb);
    window.KC_FUTURA_KICC_STATE={programId:PROGRAM_ID,instanceId:INSTANCE_ID,version:version(),lastHeartbeatAt:hb.measuredAt,lastActivityAt,trafficTx:tx,trafficRx:rx,errorCount,lastLatencyMs,localBridge:true,remoteBridge:false,remoteBridgeReason:'CROSS_PROJECT_SERVER_RELAY_REQUIRED'};
    return hb;
  }
  function emitFlow({to='db-supabase-futura',type='API',direction='BIDIRECTIONAL',status='OK',latencyMs=null,count=1,message=''}={}){
    const flow={schema:'kicc.program-flow.v1',eventId:`${PROGRAM_ID}:${Date.now()}:${Math.random().toString(36).slice(2,8)}`,programId:PROGRAM_ID,instanceId:INSTANCE_ID,from:`program:${PROGRAM_ID}`,to,type,direction,status,count,latencyMs:Number.isFinite(latencyMs)?Math.round(latencyMs):null,measuredAt:new Date().toISOString(),source:'PROGRAM_FLOW',trust:'SELF_REPORTED',message};
    try{window.dispatchEvent(new CustomEvent('kicc:program-flow',{detail:flow}));}catch{}
    publishChannel(FLOW_CHANNEL,flow);
    lastActivityAt=flow.measuredAt;
    return flow;
  }
  function wrapMethod(api,name,type,direction='BIDIRECTIONAL'){
    if(!api||typeof api[name]!=='function'||api[name].__kiccWrapped)return;
    const base=api[name].bind(api);
    const wrappedFn=async function(...args){
      const started=performance.now();
      try{
        const result=await base(...args);const ms=performance.now()-started;lastLatencyMs=ms;tx++;rx++;
        emitFlow({type,direction,status:'OK',latencyMs:ms,message:`${name} erfolgreich`});emitHeartbeat();return result;
      }catch(error){const ms=performance.now()-started;lastLatencyMs=ms;errorCount++;tx++;
        emitFlow({type,direction,status:'FAILED',latencyMs:ms,message:`${name}: ${error instanceof Error?error.message:String(error)}`});emitHeartbeat();throw error;
      }
    };
    wrappedFn.__kiccWrapped=true;api[name]=wrappedFn;
  }
  function installObserver(){
    const api=window.KCSupabaseAdapter;if(!api||wrapped)return false;
    wrapMethod(api,'sync','SYNC','BIDIRECTIONAL');
    wrapMethod(api,'testConnection','API','BIDIRECTIONAL');
    wrapMethod(api,'registerDevice','WRITE','OUTBOUND');
    wrapMethod(api,'uploadSnapshot','WRITE','OUTBOUND');
    wrapMethod(api,'listDevices','READ','INBOUND');
    wrapMethod(api,'rpc','API','BIDIRECTIONAL');
    wrapped=true;window.KC_FUTURA_KICC_OBSERVER_READY=true;return true;
  }
  function boot(){
    if(!installObserver()){
      let attempts=0;const timer=setInterval(()=>{attempts++;if(installObserver()||attempts>=60)clearInterval(timer);},500);
    }
    emitHeartbeat();
  }
  addEventListener('online',()=>{emitFlow({to:'network:internet',type:'API',direction:'BIDIRECTIONAL',status:'OK',message:'Netzwerk online'});emitHeartbeat();});
  addEventListener('offline',()=>{emitFlow({to:'network:internet',type:'API',direction:'BIDIRECTIONAL',status:'FAILED',message:'Netzwerk offline'});emitHeartbeat();});
  addEventListener('visibilitychange',emitHeartbeat);
  addEventListener('error',()=>{errorCount++;emitHeartbeat();});
  addEventListener('unhandledrejection',()=>{errorCount++;emitHeartbeat();});
  setTimeout(boot,1000);setInterval(()=>{installObserver();emitHeartbeat();},INTERVAL_MS);
})();
