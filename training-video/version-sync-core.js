(()=>{
'use strict';
const FALLBACK_PRODUCT={schema:'KC_PRODUCT_VERSION_MANIFEST_V1',product:'KC Bilderrechner',version:'0.31.3.6.11',displayVersion:'V0.31.3.6 Repair 11',uiSchemaVersion:'0.31.3.6-r11-ui.1',trainingCompatibility:'3.14.x'};
const FALLBACK_TRAINING={schema:'KC_TRAINING_VERSION_MANIFEST_V1',product:'KC Bilderrechner – Interaktive Schulung',trainingVersion:'3.14.0-FUTURA',version:'FUTURA 3.14',academyVersion:'Beta 2.6.15',basedOnProductVersion:'0.31.3.6.11',supportedUiSchema:'0.31.3.6-r11-ui.1',compatibleProductRange:'0.31.3.6 Repair 11',status:'Candidate'};
const safeJson=async(url,fallback)=>{try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw 0;return await r.json()}catch{return fallback}};
const versionParts=v=>String(v||'0').split('.').map(x=>parseInt(x,10)||0);
const cmp=(a,b)=>{const A=versionParts(a),B=versionParts(b);for(let i=0;i<Math.max(A.length,B.length);i++){if((A[i]||0)!==(B[i]||0))return (A[i]||0)>(B[i]||0)?1:-1}return 0};
function managerManifest(){
 try{return window.KC_MANAGER_VERSION_MANIFEST||JSON.parse(localStorage.getItem('kc_bilderrechner_current_manifest')||'null')}catch{return null}
}
function status(training,embedded,current){
 const actual=current||embedded;
 if(!actual)return {level:'yellow',label:'Schulungsgrundlage nicht vollständig prüfbar',detail:'Die Schulung kann gestartet werden. Bei Problemen bitte den Systemcheck verwenden.'};
 if(actual.uiSchemaVersion&&actual.uiSchemaVersion!==training.supportedUiSchema)return {level:'yellow',label:'Schulungsgrundlage prüfen',detail:'Die erkannte Bilderrechner-Oberfläche unterscheidet sich von der Schulungsgrundlage. Die Schulung kann trotzdem gestartet werden.'};
 /* BEFUND 02.09.2026 (in der MarktKasse-Schulung gefunden, hier vorsorglich mitgezogen):
    hier stand cmp(actual.version, ...). Ein PRODUKT-Manifest (pos/version-manifest.json) hat
    ein Feld "version" - ein RELEASE-Manifest aber nicht, dort heisst es "releaseVersion".
    Kommt hier je ein Release-Manifest an, waere actual.version undefined, verglichen wuerde 0,
    und die Anzeige meldete auf ewig eine Abweichung - egal wie die Zahlen stehen. Eine
    Anzeige, die immer dasselbe sagt, sagt nichts. */
 const istVersion=actual.version||actual.releaseVersion||actual.productBaseVersion;
 const c=cmp(istVersion,training.basedOnProductVersion);
 const shown=actual.displayVersion||`V${istVersion}`;
 if(c===0)return {level:'green',label:'Aktuell und kompatibel',detail:`KC Bilderrechner ${shown}`};
 if(c>0)return {level:'green',label:'Bilderrechner-Version geprüft',detail:`Aktuelle Grundlage ${shown}; Schulung kompatibel mit V${training.basedOnProductVersion}.`};
 return {level:'yellow',label:'Ältere Oberfläche erkannt',detail:`Geladen ${shown}; vorgesehen V${training.basedOnProductVersion}.`};
}
async function check(){
 const [training,embedded,release]=await Promise.all([
  safeJson('training-version-manifest.json',FALLBACK_TRAINING),
  safeJson('../pos/version-manifest.json',FALLBACK_PRODUCT),
  Promise.resolve(null)
 ]);
 const stored=managerManifest();const current=stored||embedded;
 const result=status(training,embedded,current);
 const payload={checkedAt:new Date().toISOString(),training,embedded,release,current:current||embedded,result};
 window.KCVersionSync=payload;
 try{localStorage.setItem('kc_training_last_version_check',JSON.stringify(payload))}catch{}
 const trainingLabel=training.version||`FUTURA ${String(training.trainingVersion||'3.14').replace(/\.0-FUTURA$/,'')}`;
 document.querySelectorAll('[data-training-version]').forEach(n=>n.textContent=`${trainingLabel}${training.status?` · ${training.status}`:''}`);
 document.querySelectorAll('[data-product-version]').forEach(n=>n.textContent=`KC Bilderrechner ${embedded.displayVersion||`V${training.basedOnProductVersion}`}`);
 const box=document.getElementById('versionSyncStatus');
 if(box){box.className=`version-sync-status ${result.level}`;box.innerHTML=`<span class="version-dot"></span><div><strong>${result.label}</strong><small>${result.detail}</small><small>Geprüft: ${new Date(payload.checkedAt).toLocaleString('de-DE')}</small></div>`}
 window.dispatchEvent(new CustomEvent('kc-version-sync-complete',{detail:payload}));
 return payload;
}
window.KCVersionSyncCore={check,setManagerManifest(m){localStorage.setItem('kc_bilderrechner_current_manifest',JSON.stringify(m));return check()},clearManagerManifest(){localStorage.removeItem('kc_bilderrechner_current_manifest');return check()}};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',check):check();
})();
