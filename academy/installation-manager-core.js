(()=>{
'use strict';
const VERSION='0.1.0', KEY='kcInstallationProfileV1';
const now=()=>new Date().toISOString();
const uuid=()=>crypto.randomUUID?crypto.randomUUID():'kc-'+Date.now()+'-'+Math.random().toString(16).slice(2);
function read(){try{const raw=window.KCSecureStorage?.getItem?.(KEY)||localStorage.getItem(KEY);return raw?JSON.parse(raw):null}catch{return null}}
function write(profile){const text=JSON.stringify(profile);window.KCSecureStorage?.setItem?.(KEY,text);try{localStorage.setItem(KEY,text)}catch{};return profile}
function deviceType(){const ua=navigator.userAgent||'';if(/iPad|Tablet/i.test(ua))return 'Tablet';if(/Android|iPhone|Mobile/i.test(ua))return 'Mobil';return 'Desktop'}
function buildStatus(profile){const participant=window.KCParticipantDataCore?.getProfile?.()||null;const d=window.KCSupabaseAdapter?.diagnostics?.()||{};return {
  setupComplete:Boolean(profile?.setupComplete), participant:Boolean(participant?.displayName||profile?.participantName),
  secureStorage:Boolean(window.KCSecureStorage&&!window.KCSecureStorageInitError), database:Boolean(window.KCSecureStorage),
  supabaseConfigured:Boolean(d.configured), academyReady:Boolean(profile?.setupComplete&&window.KCSecureStorage)
}}
function initialize(){let p=read();const v=window.KC_FUTURA_VERSION||{};if(!p)p={schema:'KC_INSTALLATION_PROFILE_V1',installationId:uuid(),installedAt:now(),setupComplete:false};p={...p,lastStartAt:now(),deviceType:deviceType(),platform:navigator.platform||'',academyVersion:v.academyVersion||'',academyVersionNumber:v.academyVersionNumber||'',databaseCoreVersion:v.databaseCoreVersion||'',releaseCoreVersion:v.versionCoreVersion||'',installationManagerVersion:VERSION};return write(p)}
function markSetup(extra={}){const p=initialize();return write({...p,...extra,setupComplete:true,setupCompletedAt:p.setupCompletedAt||now(),lastSetupUpdateAt:now()})}
function refreshFromUi(){const name=document.querySelector('#firstRunName')?.value?.trim()||'';const address=document.querySelector('input[name="firstRunAddress"]:checked')?.value||'du';const coach=document.querySelector('input[name="firstRunCoach"]:checked')?.value||'laura';const autoUpdate=Boolean(document.querySelector('#firstRunUpdateCheck')?.checked);return markSetup({participantName:name,address,coach,autoUpdate})}
function renderAdmin(){const host=document.querySelector('#installationQualityAdmin');if(!host)return;const p=initialize(),s=buildStatus(p);const checks=[['Ersteinrichtung',s.setupComplete],['Teilnehmerprofil',s.participant],['Secure Storage',s.secureStorage],['Datenbank',s.database],['Supabase konfiguriert',s.supabaseConfigured],['Academy betriebsbereit',s.academyReady]];host.innerHTML=`<div class="control-center-grid"><article class="health-card"><h3>Installation & Gerät</h3><p><b>Gerät:</b> ${p.deviceType||'—'}</p><p><b>Installation:</b> ${p.installedAt?new Date(p.installedAt).toLocaleString('de-DE'):'—'}</p><p><b>Letzter Start:</b> ${p.lastStartAt?new Date(p.lastStartAt).toLocaleString('de-DE'):'—'}</p><p><b>Version:</b> ${p.academyVersion||'—'}</p></article><article class="health-card"><h3>Einrichtungsstatus</h3>${checks.map(x=>`<p class="${x[1]?'status-ok':'status-warn'}">${x[1]?'✓':'○'} ${x[0]}</p>`).join('')}</article></div><div class="actions"><button id="installationRefresh" class="secondary">Status aktualisieren</button><button id="regressionRunAll" class="primary">Regression starten</button><button id="projectHealthExport" class="secondary">Prüfbericht exportieren</button></div><div id="regressionOutput" class="release-result-list" aria-live="polite"></div>`;
 document.querySelector('#installationRefresh')?.addEventListener('click',renderAdmin);
 document.querySelector('#regressionRunAll')?.addEventListener('click',()=>window.KCProjectHealth?.runAll?.());
 document.querySelector('#projectHealthExport')?.addEventListener('click',()=>window.KCProjectHealth?.exportLast?.());
}
document.addEventListener('DOMContentLoaded',()=>{initialize();document.querySelector('#firstRunContinue')?.addEventListener('click',()=>setTimeout(refreshFromUi,50));document.querySelector('#participantCodeContinue')?.addEventListener('click',()=>setTimeout(()=>markSetup({participantName:document.querySelector('#firstRunName')?.value?.trim()||read()?.participantName||''}),50));renderAdmin()});
window.KCInstallationManager={version:VERSION,initialize,read,markSetup,status:()=>buildStatus(read()),renderAdmin};
})();
