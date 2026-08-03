(()=>{
'use strict';
const LOCAL=window.KC_FUTURA_VERSION||{};
const qs=(s)=>document.querySelector(s);
const parts=v=>String(v||'0').replace(/[^0-9.]/g,'').split('.').map(n=>Number(n)||0);
const compare=(a,b)=>{const A=parts(a),B=parts(b);for(let i=0;i<Math.max(A.length,B.length);i++){if((A[i]||0)!==(B[i]||0))return (A[i]||0)>(B[i]||0)?1:-1}return 0};
const fmt=v=>v?.academyVersion||v?.displayVersion||`Beta ${v?.version||'—'}`;
function emit(state,message,extra={}){window.dispatchEvent(new CustomEvent('kc-update-state',{detail:{state,message,...extra}}))}
function setBanner(show,remote,message){const b=qs('#kcUpdateBanner'),t=qs('#kcUpdateText'),btn=qs('#kcUpdateNow');if(!b)return;b.hidden=!show;if(t)t.textContent=message||'';if(btn){btn.disabled=false;btn.textContent=show?'Neue Version laden':'Version aktuell'}}
async function fetchJson(url){const r=await fetch(url+(url.includes('?')?'&':'?')+'ts='+Date.now(),{cache:'no-store',headers:{'Cache-Control':'no-cache'}});if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json()}
async function checkUpdate({silent=true}={}){
 emit('checking','Version wird geprüft …');
 try{
  const remote=await fetchJson('../latest-release-manifest.json');
  const local=LOCAL.academyVersionNumber||LOCAL.version||'0';
  const online=remote.version||remote.academyVersionNumber||'0';
  const cmp=compare(online,local);
  const result={ok:true,local,online,remote,updateAvailable:cmp>0,same:cmp===0};
  window.KC_FUTURA_RELEASE=remote;
  document.querySelectorAll('[data-academy-release]').forEach(n=>n.textContent=LOCAL.academyVersion||fmt(LOCAL));
  if(cmp>0){setBanner(true,remote,`${fmt(remote)} · installiert ${fmt(LOCAL)}`);emit('available','Eine neue Version ist verfügbar.',result)}
  else{setBanner(false,remote,'');emit('current',cmp===0?'Die Academy ist aktuell.':'Die installierte Version ist neuer als das Online-Manifest.',result);if(!silent)showNotice(cmp===0?'Academy ist aktuell':'Versionsstand geprüft',cmp===0?`${fmt(LOCAL)} ist bereits installiert.`:`Installiert: ${fmt(LOCAL)} · Online: ${fmt(remote)}`,'ok')}
  return result;
 }catch(error){setBanner(false,null,'');emit('offline','Updateprüfung derzeit nicht möglich.',{error:String(error)});if(!silent)showNotice('Updateprüfung nicht möglich','Bitte Internetverbindung prüfen und später erneut versuchen.','warning');return {ok:false,error:String(error)}}
}
function showNotice(title,message,type='ok'){
 let box=qs('#kcVersionNotice');if(!box){box=document.createElement('div');box.id='kcVersionNotice';box.className='modal-shell';box.hidden=true;box.innerHTML='<div class="modal-card compact" role="dialog" aria-modal="true"><h2 id="kcVersionNoticeTitle"></h2><p id="kcVersionNoticeText"></p><div id="kcVersionNoticeProgress" hidden><div style="height:12px;border-radius:999px;background:#dce7ee;overflow:hidden"><div id="kcVersionNoticeBar" style="height:100%;width:0;background:#178ac0;transition:width .25s"></div></div><p id="kcVersionNoticePhase"></p></div><div class="actions"><button id="kcVersionNoticeClose" class="primary">Schließen</button></div></div>';document.body.appendChild(box);qs('#kcVersionNoticeClose').addEventListener('click',()=>box.hidden=true)}
 qs('#kcVersionNoticeTitle').textContent=title;qs('#kcVersionNoticeText').textContent=message;qs('#kcVersionNoticeProgress').hidden=true;box.dataset.type=type;box.hidden=false;
}
async function forceUpdate(){
 const boxTitle='Academy wird aktualisiert';showNotice(boxTitle,'Vorbereitung läuft …');const prog=qs('#kcVersionNoticeProgress'),bar=qs('#kcVersionNoticeBar'),phase=qs('#kcVersionNoticePhase'),close=qs('#kcVersionNoticeClose');prog.hidden=false;close.disabled=true;
 const step=async(p,text)=>{bar.style.width=p+'%';phase.textContent=`${p} % · ${text}`;await new Promise(r=>setTimeout(r,220))};
 try{
  await step(10,'Online-Version prüfen');const result=await checkUpdate({silent:true});
  if(!result.ok)throw new Error('Online-Version konnte nicht geprüft werden.');
  if(!result.updateAvailable){await step(100,'Version ist bereits aktuell');qs('#kcVersionNoticeText').textContent=`${fmt(LOCAL)} ist bereits installiert.`;close.disabled=false;return result}
  await step(35,'Service Worker abmelden');if('serviceWorker' in navigator){for(const r of await navigator.serviceWorker.getRegistrations())await r.unregister()}
  await step(60,'Browser-Cache leeren');if('caches' in window){for(const k of await caches.keys())await caches.delete(k)}
  await step(85,'Neue Dateien anfordern');try{sessionStorage.setItem('kc_update_expected_version',result.online)}catch{}
  await step(100,'Seite wird neu geladen');const u=new URL(location.href);u.searchParams.set('kc-update',Date.now());setTimeout(()=>location.replace(u.toString()),450);return result;
 }catch(error){qs('#kcVersionNoticeText').textContent=error.message||String(error);phase.textContent='Aktualisierung abgebrochen';bar.style.width='100%';close.disabled=false;emit('error','Aktualisierung fehlgeschlagen',{error:String(error)});return {ok:false,error:String(error)}}
}
function installed(){return {...LOCAL,display:`${LOCAL.academyVersion||'Academy'} · Version Core ${LOCAL.versionCoreVersion||'—'} · DB Core ${LOCAL.databaseCoreVersion||'—'}`}}
document.addEventListener('DOMContentLoaded',()=>{checkUpdate({silent:true});qs('#kcUpdateNow')?.addEventListener('click',forceUpdate)});
window.KCVersionUpdateCore={version:'0.1.0',compare,checkUpdate,forceUpdate,installed,showNotice};
})();
