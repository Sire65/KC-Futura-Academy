'use strict';
(function(){
  const VERSION='1.0.0';
  const PROFILE_KEY='kcFuturaUnifiedParticipantV1';
  const TRAINING_KEY='kcFuturaUnifiedTrainingV1';
  const LEGACY_TRAINING='kc_training_profile_v0254';
  const LEGACY_ACADEMY='kcAcademyParticipantProfileV1';
  const safeParse=(v,f=null)=>{try{return JSON.parse(v)}catch{return f}};
  const uuid=()=>crypto.randomUUID?.()||`kc-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now=()=>new Date().toISOString();
  const storage=()=>window.KCSecureStorage||localStorage;
  async function ready(){if(window.KCSecureStorage?.ready)await window.KCSecureStorage.ready;}
  function read(key){return safeParse(storage().getItem(key)||localStorage.getItem(key)||'null',null)}
  function write(key,value){const text=JSON.stringify(value);storage().setItem(key,text);return value}
  function normalizeProfile(p={}){return {version:1,id:p.id||p.participantId||uuid(),displayName:String(p.displayName||p.name||'').trim(),addressMode:p.addressMode||'du',coach:p.coach||(p.gender==='male'?'marc':'laura'),recoveryCode:p.recoveryCode||'',createdAt:p.createdAt||now(),updatedAt:now(),installationId:p.installationId||''}}
  function normalizeTraining(t={}){return {version:1,participantId:t.participantId||t.id||'',name:String(t.name||'').trim(),quick:Number(t.quick||0),advanced:Number(t.advanced||0),practice:Number(t.practice||0),quickDone:Array.isArray(t.quickDone)?t.quickDone:[],advancedDone:Array.isArray(t.advancedDone)?t.advancedDone:[],passedTasks:Array.isArray(t.passedTasks)?t.passedTasks:[],attempts:t.attempts||{},quizStats:t.quizStats||{},lessonStats:t.lessonStats||{},trainingStartedAt:t.trainingStartedAt||'',lastActivityAt:t.lastActivityAt||now(),completedAt:t.completedAt||'',source:t.source||'training-video'}}
  async function migrate(){await ready();let profile=read(PROFILE_KEY);let training=read(TRAINING_KEY);const lp=safeParse(localStorage.getItem(LEGACY_ACADEMY)||'null',null);const lt=safeParse(localStorage.getItem(LEGACY_TRAINING)||'null',null);
    if(!profile&&(lp||lt)){profile=normalizeProfile(lp||lt);write(PROFILE_KEY,profile)}
    if(!training&&lt){training=normalizeTraining({...lt,participantId:profile?.id||lt.participantId});write(TRAINING_KEY,training)}
    if(profile&&training&&!training.participantId){training.participantId=profile.id;write(TRAINING_KEY,training)}
    return {profile,training,migrated:!!(lp||lt)};
  }
  async function getProfile(){await migrate();return read(PROFILE_KEY)}
  async function saveProfile(p){await ready();const existing=read(PROFILE_KEY)||{};const profile=normalizeProfile({...existing,...p,id:p.id||existing.id});write(PROFILE_KEY,profile);localStorage.setItem(LEGACY_ACADEMY,JSON.stringify(profile));return profile}
  async function getTraining(){await migrate();return read(TRAINING_KEY)}
  async function saveTraining(t){await ready();let profile=read(PROFILE_KEY);if(!profile&&t.name)profile=await saveProfile(t);const training=normalizeTraining({...t,participantId:t.participantId||profile?.id});write(TRAINING_KEY,training);localStorage.setItem(LEGACY_TRAINING,JSON.stringify({...t,participantId:training.participantId}));
    try{window.KCSecureStorage?.queueForSync?.({eventType:'training_progress',payload:training,participantName:training.name,participantId:training.participantId})}catch{}
    try{window.KCSupabaseAdapter?.uploadSnapshot?.('training_progress',training,{participantName:training.name,participantId:training.participantId}).catch(()=>{})}catch{}
    return training}
  function trainingToRow(training,profile,deviceName='Dieses Gerät'){
    if(!training&&!profile)return null;const name=training?.name||profile?.displayName||'Unbekannt';const quiz=training?.quizStats||{};let correct=0,wrong=0,runs=0;Object.values(quiz).forEach(v=>{correct+=Number(v.correct||0);wrong+=Number(v.wrong||0);runs+=Number(v.runs||v.attempts||0)});const completed=[training?.quick,training?.advanced,training?.practice].filter(v=>Number(v)>=100).length;
    const start=Date.parse(training?.trainingStartedAt||0),last=Date.parse(training?.lastActivityAt||0);const minutes=start&&last&&last>=start?Math.max(1,Math.round((last-start)/60000)):0;
    return {participant_id:profile?.id||training?.participantId||'local',participant_name:name,device_name:deviceName,last_activity:training?.lastActivityAt||profile?.updatedAt||now(),total_minutes:minutes,total_correct:correct,total_wrong:wrong,completed_modules:completed,total_runs:runs,topics:[{id:'hauptschulung',title:'KC Bilderrechner Hauptschulung',minutes,correct,wrong,runs,progress:Math.round((Number(training?.quick||0)+Number(training?.advanced||0)+Number(training?.practice||0))/3)}],source:'local-training'}
  }
  async function diagnostics(){const m=await migrate();const row=trainingToRow(m.training,m.profile,window.KCSupabaseAdapter?.diagnostics?.().deviceName||'Dieses Gerät');return {version:VERSION,profileFound:!!m.profile,trainingFound:!!m.training,participantId:m.profile?.id||m.training?.participantId||'',name:m.profile?.displayName||m.training?.name||'',lastActivity:m.training?.lastActivityAt||'',row,migrated:m.migrated,secureStorage:!!window.KCSecureStorage};}
  window.KCParticipantDataCore={version:VERSION,migrate,getProfile,saveProfile,getTraining,saveTraining,trainingToRow,diagnostics,keys:{PROFILE_KEY,TRAINING_KEY,LEGACY_TRAINING,LEGACY_ACADEMY}};
})();
