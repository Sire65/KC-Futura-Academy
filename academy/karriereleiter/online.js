(function(){
  'use strict';
  const listeners={presence:new Set(),challenge:new Set(),status:new Set(),duel:new Set(),traffic:new Set()};
  let client=null,channel=null,profile={id:null,name:'Spieler',rank:'Praktikant',professions:['Küche']},players=[],connected=false,pending=new Map();
  const emit=(type,payload)=>listeners[type].forEach(fn=>{try{fn(payload)}catch(e){}});
  const traffic=(op,area='supabase')=>emit('traffic',{op,area,at:Date.now()});
  const uid=()=>profile.id||('local-'+Math.random().toString(36).slice(2));
  function findClient(){return client||window.KCFuturaSupabase?.client||window.FuturaSupabase?.client||window.supabaseClient||null}
  function normalizedPresence(){if(!channel)return[];const state=channel.presenceState?.()||{};return Object.values(state).flat().map(x=>x).filter(x=>x?.id&&x.id!==profile.id)}
  async function connect(){
    const c=findClient();if(!c?.channel){setStatus(false,'Supabase nicht verbunden');return false}client=c;
    try{
      if(channel)try{await client.removeChannel(channel)}catch(e){}
      channel=client.channel('karriereleiter:lobby',{config:{private:true,presence:{key:profile.id||uid()}}})
        .on('presence',{event:'sync'},()=>{traffic('rx','presence');players=normalizedPresence();emit('presence',players)})
        .on('broadcast',{event:'secure-challenge'},async({payload})=>{traffic('rx','broadcast');const p=await unwrap(payload,'challenge');handleChallenge(p)})
        .on('broadcast',{event:'secure-challenge-response'},async({payload})=>{traffic('rx','broadcast');const p=await unwrap(payload,'challenge-response');handleResponse(p)})
        .on('broadcast',{event:'secure-duel-progress'},async({payload})=>{traffic('rx','broadcast');const p=await unwrap(payload,'duel-progress');if(p)emit('duel',p)})
        .subscribe(async status=>{
          if(status==='SUBSCRIBED'){connected=true;setStatus(true,'Online');traffic('tx','presence');await channel.track({...profile,online_at:new Date().toISOString(),status:'bereit'});await syncProfile();syncOutbox()}
          else if(['CHANNEL_ERROR','TIMED_OUT','CLOSED'].includes(status)){connected=false;setStatus(false,'Verbindung unterbrochen')}
        });
      return true;
    }catch(e){setStatus(false,'Supabase-Fehler');return false}
  }
  function setStatus(ok,text){connected=ok;emit('status',{connected:ok,text})}
  async function wrap(value,purpose){return window.KarriereCrypto?.encrypt?.(value,`realtime:${purpose}`)||value}
  async function unwrap(value,purpose){try{return window.KarriereCrypto?.decrypt?.(value,`realtime:${purpose}`)||value}catch(e){return null}}
  async function setProfile(p){profile={...profile,...p};if(!profile.id)profile.id=crypto.randomUUID?.()||('p-'+Date.now()+'-'+Math.random().toString(36).slice(2));try{await window.KarriereStorage?.saveProfile(profile)}catch(e){}if(channel&&connected)try{traffic('tx','presence');await channel.track({...profile,online_at:new Date().toISOString(),status:'bereit'});await syncProfile()}catch(e){}return profile}
  function handleChallenge(p){if(!p||p.to!==profile.id)return;pending.set(p.challengeId,p);emit('challenge',p)}
  function handleResponse(p){if(!p||p.to!==profile.id)return;const original=pending.get(p.challengeId);emit('challenge',{...p,original,response:true})}
  async function sendSecure(event,payload,purpose){if(!channel||!connected)return false;traffic('tx','broadcast');await channel.send({type:'broadcast',event,payload:await wrap(payload,purpose)});return true}
  async function sendChallenge(to,questionIds){if(!channel||!connected)return false;const payload={challengeId:crypto.randomUUID?.()||String(Date.now()),from:profile.id,fromName:profile.name,fromRank:profile.rank,to,questionIds,createdAt:new Date().toISOString()};pending.set(payload.challengeId,payload);await sendSecure('secure-challenge',payload,'challenge');return payload}
  async function respondChallenge(challenge,accepted){return sendSecure('secure-challenge-response',{challengeId:challenge.challengeId,from:profile.id,fromName:profile.name,to:challenge.from,accepted,questionIds:challenge.questionIds},'challenge-response')}
  async function sendDuelProgress(payload){if(channel&&connected)await sendSecure('secure-duel-progress',{...payload,playerId:profile.id,name:profile.name},'duel-progress')}
  async function authUserId(c=findClient()){try{traffic('tx','auth');const r=await c?.auth?.getUser?.();traffic('rx','auth');return r?.data?.user?.id||null}catch(e){return null}}
  async function secureUpsert(table,row,opts){const c=findClient();traffic('tx','database');const res=await c.from(table).upsert(row,opts);traffic('rx','database');return res}
  async function secureSelect(table){const c=findClient();traffic('tx','database');const q=c.from(table).select('*').order('created_at',{ascending:false}).limit(1500);const res=await q;traffic('rx','database');return res}
  async function syncProfile(){const c=findClient();if(!c?.from)return;const userId=await authUserId(c);if(!userId)return;try{const payload=await window.KarriereCrypto.encrypt({...profile,updatedAt:new Date().toISOString()},'supabase:profile');await secureUpsert('karriereleiter_secure_profiles',{user_id:userId,payload_enc:payload,created_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'})}catch(e){}}
  async function syncOutbox(){const c=findClient();if(!c?.from||!window.KarriereStorage)return;const userId=await authUserId(c);if(!userId)return;const rows=await window.KarriereStorage.getOutbox(50);for(const row of rows){try{const p=row.payload||{},localId=String(p.localAttemptId||p.localSessionId||p.id||row.id||'');const payload=await window.KarriereCrypto.encrypt(p,`supabase:${row.type}`);const {error}=await secureUpsert('karriereleiter_secure_events',{user_id:userId,local_id:localId,event_type:row.type,payload_enc:payload,created_at:p.createdAt||row.createdAt||new Date().toISOString()},{onConflict:'user_id,local_id,event_type'});if(!error)await window.KarriereStorage.deleteOutbox(row.id);else break}catch(e){break}}}
  async function fetchSecureEvents(type){const c=findClient();if(!c?.from||!connected)return[];try{const {data,error}=await secureSelect('karriereleiter_secure_events');if(error)throw error;const out=[];for(const row of data||[]){if(type&&row.event_type!==type)continue;try{const p=await window.KarriereCrypto.decrypt(row.payload_enc,`supabase:${row.event_type}`);out.push({...p,user_id:row.user_id,created_at:row.created_at})}catch(e){}}return out}catch(e){return[]}}
  async function fetchAdminResults(){return fetchSecureEvents('attempt')}
  async function fetchAdminSessions(){return fetchSecureEvents('session')}
  window.KarriereOnline={
    setClient(c){client=c;return connect()},connect,setProfile,getProfile:()=>({...profile}),getPlayers:()=>players,isConnected:()=>connected,
    on(type,fn){listeners[type]?.add(fn);return()=>listeners[type]?.delete(fn)},sendChallenge,respondChallenge,sendDuelProgress,syncOutbox,fetchAdminResults,fetchAdminSessions,
    async init(){const local=await window.KarriereStorage?.loadProfile?.();if(local)profile={...profile,...local};const futura=window.__KC_FUTURA_KARRIERE_PROFILE;if(futura?.id)profile={...profile,...futura,id:futura.id,name:futura.name||profile.name,professions:futura.professions||profile.professions};if(!profile.id)await setProfile({name:profile.name});else await window.KarriereStorage?.saveProfile?.(profile);await connect();return profile}
  };
  window.KarriereleiterOnlineBridge={setSupabaseClient:c=>window.KarriereOnline.setClient(c),setProfile:p=>window.KarriereOnline.setProfile(p)};
})();
