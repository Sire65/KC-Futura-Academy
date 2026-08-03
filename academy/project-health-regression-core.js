(()=>{
'use strict';
const VERSION='0.1.0'; let last=null;
const test=(name,fn)=>Promise.resolve().then(fn).then(detail=>({name,status:'ok',detail})).catch(e=>({name,status:'error',detail:String(e?.message||e)}));
async function runAll(){const host=document.querySelector('#regressionOutput');if(host)host.innerHTML='<p>Regression läuft … 0 %</p>';const cases=[
 ['Versionskonsistenz',()=>{const v=window.KC_FUTURA_VERSION||{};if(v.academyVersionNumber!=='2.3.1')throw Error('Lokale Version inkonsistent');return v.academyVersion}],
 ['Installation Manager',()=>{const s=window.KCInstallationManager?.status?.();if(!s)throw Error('Installation Manager fehlt');return s}],
 ['Secure Storage',async()=>{await window.KCSecureStorage?.ready;if(!window.KCSecureStorage)throw Error('Secure Storage fehlt');return window.KCSecureStorage.diagnostics()}],
 ['Teilnehmer-Core',async()=>{if(!window.KCParticipantDataCore)throw Error('Teilnehmer-Core fehlt');return window.KCParticipantDataCore.getProfile?.()||{profile:'noch nicht eingerichtet'}}],
 ['Supabase-Konfiguration',()=>{const d=window.KCSupabaseAdapter?.diagnostics?.();if(!d)throw Error('Supabase-Adapter fehlt');return {configured:d.configured,online:d.online}}],
 ['Update-Core',()=>{if(!window.KCVersionUpdateCore)throw Error('Update-Core fehlt');return window.KCVersionUpdateCore.installed()}],
 ['IndexedDB-Integrität',()=>window.KCSecureStorage.integrityCheck()],
 ['Backup-Struktur',async()=>{const b=await window.KCSecureStorage.encryptedBackup();if(b.format!=='KC-FUTURA-DB-BACKUP')throw Error('Backupformat falsch');return {records:b.records.length,outbox:b.outbox.length}}],
 ['Outbox-Status',()=>window.KCSecureStorage.outboxStats()],
 ['Dateiverweise Laufzeit',()=>({location:location.href,online:navigator.onLine})],
 ['UI-Grundelemente',()=>{const ids=['diagnosticsModal','episodeEditorModal','firstRunModal'];const missing=ids.filter(id=>!document.getElementById(id));if(missing.length)throw Error('Fehlt: '+missing.join(','));return 'vollständig'}],
 ['Tablet-Touchziele',()=>({viewport:`${innerWidth}x${innerHeight}`,touch:navigator.maxTouchPoints||0})]
]; const results=[];for(let i=0;i<cases.length;i++){results.push(await test(cases[i][0],cases[i][1]));if(host)host.innerHTML=`<p>Regression läuft … ${Math.round((i+1)/cases.length*100)} %</p>`}const passed=results.filter(x=>x.status==='ok').length;last={format:'KC-FUTURA-PROJECT-HEALTH',version:1,createdAt:new Date().toISOString(),academyVersion:window.KC_FUTURA_VERSION?.academyVersion,managerVersion:VERSION,total:results.length,passed,failed:results.length-passed,healthScore:Math.round(passed/results.length*100),results};if(host)host.innerHTML=`<h3>Project Health: ${last.healthScore} %</h3><p>${passed} von ${results.length} Prüfungen bestanden.</p>${results.map(r=>`<p class="${r.status==='ok'?'status-ok':'status-error'}">${r.status==='ok'?'✓':'✗'} ${r.name}</p>`).join('')}`;return last}
function exportLast(){if(!last)return runAll().then(exportLast);const blob=new Blob([JSON.stringify(last,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`KC_FUTURA_PROJECT_HEALTH_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
window.KCProjectHealth={version:VERSION,runAll,exportLast,getLast:()=>last};
})();
