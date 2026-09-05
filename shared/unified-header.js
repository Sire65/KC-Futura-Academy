(()=>{
'use strict';
const path=location.pathname.replace(/\\/g,'/'),isTraining=/\/training-video\//.test(path),isAcademy=/\/academy\//.test(path),mode=isTraining?'training':isAcademy?'academy':'launcher';
const base=isTraining||isAcademy?'../':'';
const config={launcher:{part:'Start',title:'Gemeinsame Schulung'},training:{part:'Teil 1',title:'Bilderrechner-Einführung'},academy:{part:'Teil 2',title:'FUTURA Academy'}}[mode];
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],safe=(s,f={})=>{try{return JSON.parse(localStorage.getItem(s)||JSON.stringify(f))}catch{return f}},tip=(t)=>`data-tooltip="${t}" title="${t}"`;
document.body.classList.add('kc-unified-active');
const header=document.createElement('header');header.className='kc-unified-header';header.innerHTML=`
 <div class="kc-brand"><div class="kc-chef-mark"><img src="${base}academy/assets/kc_logo.webp" alt="Originalsymbol des Köcheclubs Werne"><span>seit 1991</span></div><div class="kc-brand-copy"><small>KC FUTURA · Köcheclub Werne</small><h1>${config.part} · ${config.title}</h1><p>Entwickelt und designed by <button id="kcDeveloper" class="kc-developer" ${tip('Informationen zum Entwickler öffnen')}>Hans-Joachim Koch</button> · Version 2.6.15</p></div></div>
 <div id="kcDynamicZone" class="kc-dynamic-zone" aria-label="Dynamischer Kapitelbereich"><div id="kcDynamicMessage" class="kc-dynamic-message">Bereit</div><div id="kcChapterRow" class="kc-chapter-row"></div><div class="kc-dynamic-progress"><small>Lernfortschritt</small><span><i id="kcDynamicBar"></i></span><b id="kcDynamicPercent">0 %</b></div></div>
 <div class="kc-voice-wrap"><button id="kcOsc" class="kc-osc" ${tip('Audio-Schnelleinstellungen öffnen')} aria-label="Stimmen-Oszillograf"><span class="kc-wave">${'<i></i>'.repeat(9)}</span><span id="kcOscText">Stimme</span></button><section id="kcAudioPop" class="kc-popover" hidden><h3>Audio-Schnelleinstellungen</h3><div class="kc-audio-grid"><label>Lautstärke <span class="kc-volume-value"><b id="kcVolumeValue">7/10</b></span><input id="kcVolume" type="range" min="1" max="10" step="1" value="7"></label><div class="kc-volume-scale">${Array.from({length:10},(_,i)=>`<span>${i+1}</span>`).join('')}</div><label>Begleitung <select id="kcCoach"><option value="laura">Laura</option><option value="marc">Marc</option><option value="none">Ohne Begleitung</option></select></label><label>Stimme <select id="kcVoice"><option value="one">Stimme 1</option><option value="two">Stimme 2</option></select></label><div class="kc-quick-row"><button id="kcAudioToggle">🔊 Ton</button><button id="kcVoiceTest">▶ Test</button><button id="kcRepeat">↻ Wiederholen</button></div><button id="kcAudioOk" class="primary">OK · Einstellungen schließen</button></div></section></div>
 <div class="kc-time"><span id="kcDate">--.--.----</span><strong id="kcClock">--:--:--</strong><span id="kcElapsed" class="kc-elapsed">Laufzeit 00:00:00</span></div>
 <div class="kc-controls"><button id="kcBack" class="kc-icon" ${tip('Zurück')}>←</button><button id="kcPause" class="kc-icon" ${tip('Pause oder fortsetzen')}>⏸</button><button id="kcSound" class="kc-icon" ${tip('Einfachklick: Audioeinstellungen · Doppelklick: Ton ein oder aus')}>🔊</button><button id="kcDashboard" class="kc-icon" ${tip('Lernstand öffnen')}>📊</button><button id="kcRoadmap" class="kc-icon" ${tip('Schulungsübersicht öffnen')}>🗺️</button><button id="kcGlobalSearch" class="kc-icon kc-search-trigger" ${tip('Globale Live-Suche öffnen')}>⌕</button><span class="kc-sep"></span><div id="kcDbRow" class="kc-db-row" aria-label="Datenbanken"></div><span class="kc-sep"></span><button id="kcUser" class="kc-icon" ${tip('Teilnehmerprofil öffnen')}>👤</button><button id="kcSettings" class="kc-icon" ${tip('Einstellungen öffnen')}>⚙️</button><a id="kcExit" class="kc-icon" href="${base}index.html" ${tip('Programm verlassen')}>🚪</a></div>`;
document.body.prepend(header);
function modal(id,title,body){let shell=q('#'+id);if(!shell){shell=document.createElement('div');shell.id=id;shell.className='kc-modal-shell';shell.hidden=true;document.body.append(shell)}shell.innerHTML=`<section class="kc-modal" role="dialog" aria-modal="true"><div class="kc-modal-head"><h2>${title}</h2><button class="kc-close" aria-label="Fenster schließen">×</button></div>${body}</section>`;shell.hidden=false;q('.kc-close',shell).onclick=()=>shell.hidden=true;shell.onclick=e=>{if(e.target===shell)shell.hidden=true};return shell}
q('#kcDeveloper').onclick=()=>modal('kcDeveloperModal','Hans-Joachim Koch',`<div class="kc-vita"><img class="kc-vita-photo" src="${base}shared/hans-joachim-koch.jpg" alt="Hans-Joachim Koch"><div><h3>Entwickler und Designer von KC FUTURA</h3><p>Hans-Joachim Koch wurde 1961 in Holzwickede geboren. Bereits mit 16 Jahren begann er seine Ausbildung zum Koch. Nach mehreren Jahren Berufserfahrung legte er im Alter von 25 Jahren erfolgreich seine Meisterprüfung ab. Anschließend absolvierte er die Weiterbildung zum diätetisch geschulten Koch.</p><p>Seine beruflichen Stationen führten ihn durch verschiedene Restaurants sowie Großküchen in Krankenhäusern, Altenheimen, Einrichtungen der Behindertenhilfe, Kindergärten und Schulen, in denen er bis zu seinem Ruhestand tätig war.</p><p>Seit der Gründung des Köcheclubs Werne im Jahr 1991 ist er aktives Gründungsmitglied. Neben seiner Leidenschaft für das Kochen begeisterte ihn schon immer die Computertechnik.</p><p>Die <b>KC Academy</b> entwickelte er, um Kolleginnen und Kollegen den Einstieg in die Bilderkasse so einfach wie möglich zu machen. Gleichzeitig soll sie neuen Mitgliedern den Umgang mit dem System erleichtern und sie Schritt für Schritt auf die typischen Alltagssituationen beim Weihnachtsmarkt vorbereiten.</p></div></div>`);
const started=Date.now();function progress(){if(mode==='training'){const activeLesson=q('#lesson:not(.hidden)'),lessonPercent=activeLesson?q('#lessonPercent',activeLesson):null,lessonValue=Number((lessonPercent?.textContent||'').replace(/[^0-9]/g,''));if(activeLesson&&Number.isFinite(lessonValue))return Math.max(0,Math.min(100,lessonValue));const p=safe('kc_training_profile_v0254');return Math.round((Number(p.quick||0)+Number(p.advanced||0)+Number(p.practice||0))/3)}if(mode==='academy'){const c=safe('kcAcademyCompleted');return Math.min(100,Math.round(Object.keys(c).length/33*100))}const p=safe('kc_training_profile_v0254');return Math.round((Number(p.quick||0)+Number(p.advanced||0)+Number(p.practice||0))/3)}
function tick(){const n=new Date(),sec=Math.floor((Date.now()-started)/1000),h=String(Math.floor(sec/3600)).padStart(2,'0'),m=String(Math.floor(sec%3600/60)).padStart(2,'0'),s=String(sec%60).padStart(2,'0'),p=progress();q('#kcDate').textContent=n.toLocaleDateString('de-DE');q('#kcClock').textContent=n.toLocaleTimeString('de-DE');q('#kcElapsed').textContent=`Laufzeit ${h}:${m}:${s}`;q('#kcDynamicBar').style.width=p+'%';q('#kcDynamicPercent').textContent=p+' %'};tick();setInterval(tick,1000);
const CHAPTERS={launcher:[{title:'Teilnehmerprofil',detail:'Name und Anrede'},{title:'Begleitung und Stimme',detail:'Laura, Marc und Audio'}],training:[{title:'Grundlagen und Verkauf',detail:'12 Kapitel · Bedienung und Zahlung',target:'quick'},{title:'Sonderfunktionen',detail:'10 Kapitel · Artikelintelligenz',target:'advanced'},{title:'Praxisprüfung',detail:'Interaktive Aufgaben',target:'practice'}],academy:[{title:'Gäste und Reklamationen',detail:'Folgen 1–6',target:'reklamation'},{title:'Service und Hygiene',detail:'Folgen 7–12',target:'mettwurst'},{title:'Organisation im Alltag',detail:'Folgen 13–17',target:'wechselgeld'},{title:'Markt und Sicherheit',detail:'Folgen 19–24',target:'anlieferung'},{title:'Team und Verantwortung',detail:'Folgen 25–30',target:'gemeinsam'},{title:'Abschlussgeschichten',detail:'Folgen 31–35',target:'zwei_euro'}]};
function openChapter(item,index){if(mode==='training'){location.href=`${base}training-video/index.html?entry=unified&module=${item.target}`}else if(mode==='academy'){location.href=`${base}academy/index.html?source=chapter-nav&module=${item.target}`}else{const target=index===0?q('#setupBack'):q('#setupContinue');target?.click()}}
function chapters(){const row=q('#kcChapterRow');if(mode==='training'&&q('#lesson:not(.hidden)')){const source=qa('#lessonStepTrack [data-lesson-index]'),moduleName=q('#lessonModule')?.textContent?.trim()||'Pflichtschulung',currentTitle=q('#lessonTitle')?.textContent?.trim()||'Aktuelles Kapitel',signature='lesson:'+source.map(x=>`${x.dataset.lessonIndex}:${x.classList.contains('done')?'d':''}${x.classList.contains('current')?'c':''}`).join('|');if(row.dataset.signature!==signature){row.dataset.signature=signature;row.innerHTML=source.map((button,i)=>{const title=(button.getAttribute('title')||`Kapitel ${i+1}`).replace(/^Zu\s+/,'');const done=button.classList.contains('done'),current=button.classList.contains('current'),state=done?' · abgeschlossen':current?' · aktuell':'';return `<button class="kc-chapter ${done?'done':current?'current':''}" data-kc-lesson="${i}" ${tip(`${title}${state}. Anklicken, um direkt zu diesem Lerninhalt zu springen.`)} aria-label="${title}"><span>${i+1}</span></button>`}).join('');qa('[data-kc-lesson]',row).forEach(button=>button.onclick=()=>source[Number(button.dataset.kcLesson)]?.click())}q('#kcDynamicMessage').textContent=`${moduleName} · ${currentTitle}`;return}const items=CHAPTERS[mode];let current=1;if(mode==='launcher')current=q('#setupTwo:not(.hidden)')?2:1;const p=progress(),done=Math.floor(items.length*p/100),signature=`modules:${current}:${done}`;if(row.dataset.signature!==signature){row.dataset.signature=signature;row.innerHTML=items.map((item,i)=>{const state=i<done?' · abgeschlossen':i+1===current?' · aktuell':'';return `<button class="kc-chapter ${i<done?'done':i+1===current?'current':''}" data-kc-chapter="${i}" ${tip(`Kapitel ${i+1}: ${item.title} – ${item.detail}${state}`)} aria-label="Kapitel ${i+1}: ${item.title}"><span>${i+1}</span></button>`}).join('');qa('[data-kc-chapter]',row).forEach(btn=>btn.onclick=()=>openChapter(items[Number(btn.dataset.kcChapter)],Number(btn.dataset.kcChapter)))}q('#kcDynamicMessage').textContent=mode==='launcher'?(current===2?'Ersteinrichtung · Begleitung und Stimme':'Ersteinrichtung · Teilnehmerprofil'):mode==='training'?'Pflichtschulung · Kapitelübersicht':'Academy · Lernfolgen'}chapters();setInterval(chapters,600);
function sources(){window.KCSupabaseAdapter?.load?.();const diag=window.KCSupabaseAdapter?.diagnostics?.()||{},cloudStatus=diag.lastResult?.ok?'green':diag.configured?(diag.online?'blue':'red'):'gray',defaults=[{id:'indexeddb',short:'IDX',label:'IndexedDB',type:'Lokaler verschlüsselter Speicher',status:'green',role:'Primärspeicher'},{id:'supabase',short:'SUP',label:'Supabase',type:'Cloud-Datenbank',status:cloudStatus,role:'Synchronisation',detail:diag}],v=safe('kcFuturaDataSourcesV1',null),extra=Array.isArray(v)?v.filter(x=>x.enabled!==false&&!['local','indexeddb','cloud','supabase'].includes(x.id)).slice(0,2):[];return [...defaults,...extra].slice(0,4)}
const dbLatency={indexeddb:null,supabase:null};
function renderDb(){q('#kcDbRow').innerHTML=`<button id="kcDbGroup" class="kc-db-group" ${tip('Systemstatus aller Datenbanken öffnen')}>${sources().map((d,i)=>`<span class="kc-db-block" data-db="${i}"><i class="kc-led status ${d.status||'gray'}"></i><i class="kc-led traffic"></i><small>${d.short||`DB${i+1}`}</small></span>`).join('')}</button>`;q('#kcDbGroup').onclick=openSystemStatus}
async function testDatabase(d,i,sh){const status=q('#kcDbStatus',sh),last=q('#kcDbLast',sh),ring=q('#kcDbRing',sh),details=q('#kcDbDetails',sh),btn=q('#kcDbInfoTest',sh);btn.disabled=true;status.textContent='Prüfung läuft …';ring.style.setProperty('--score','15%');flashDb(i);let result={ok:false,score:0,message:'Nicht geprüft'};try{if(d.id==='indexeddb'){const started=performance.now();await window.KCSecureStorage?.ready;const bench=await window.KCSecureStorage?.benchmark?.();const key='kcUnifiedDbTestV1',value={at:new Date().toISOString(),token:crypto.randomUUID?.()||String(Date.now())};window.KCSecureStorage?.setItem(key,JSON.stringify(value));const read=JSON.parse(window.KCSecureStorage?.getItem(key)||'null');window.KCSecureStorage?.removeItem?.(key);result={ok:read?.token===value.token,score:read?.token===value.token?100:45,message:read?.token===value.token?'Schreib-, Lese- und Löschtest erfolgreich.':'Der gelesene Testwert stimmt nicht überein.',latencyMs:Math.round(performance.now()-started),benchmark:bench||null}}else if(d.id==='supabase'){const a=window.KCSupabaseAdapter,diag=a?.diagnostics?.()||{};if(!diag.configured)throw new Error('Supabase ist noch nicht vollständig eingerichtet. Projekt-URL oder Publishable Key fehlt.');const r=await a.testConnection({full:true});result={...r,score:r.ok?100:Math.round([r.authOk,r.dbOk,r.rlsOk,r.writeOk,r.readOk,r.cleanupOk].filter(Boolean).length/6*100),message:r.message||'Supabase-Test abgeschlossen.'}}else{result={ok:true,score:100,message:'Adapter ist registriert und erreichbar.'}}}catch(e){result={ok:false,score:0,message:e.message||String(e)}}const score=Math.max(0,Math.min(100,Number(result.score)||0));status.textContent=result.ok?'System OK':'Prüfung mit Hinweis';last.textContent=new Date().toLocaleString('de-DE');ring.style.setProperty('--score',score+'%');ring.querySelector('b').textContent=score+' %';ring.classList.toggle('ok',result.ok);details.innerHTML=`<b>${result.message}</b>${result.latencyMs?`<br>Laufzeit: ${result.latencyMs} ms`:''}`;btn.disabled=false;sh._kcDiagnostic={schema:'KC_FUTURA_DATABASE_DIAGNOSTIC_V1',version:'2.6.15',createdAt:new Date().toISOString(),database:{id:d.id,label:d.label,type:d.type,role:d.role},result,navigator:{online:navigator.onLine,language:navigator.language,platform:navigator.platform},application:{mode,location:location.pathname}};flashDb(i);renderDb()}
function downloadDiagnostic(sh,d){const report=sh._kcDiagnostic||{schema:'KC_FUTURA_DATABASE_DIAGNOSTIC_V1',version:'2.6.15',createdAt:new Date().toISOString(),database:{id:d.id,label:d.label},result:{ok:false,message:'Noch kein Test durchgeführt'}};const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`KC_FUTURA_DB_DIAG_${d.id}_${new Date().toISOString().replace(/[:.]/g,'-')}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),600)}
function openDb(i){const d=sources()[i];if(!d)return;const sh=modal('kcDbModal',d.label,`<div class="kc-db-health"><div id="kcDbRing" class="kc-health-ring" style="--score:${d.status==='green'?'100%':'0%'}"><b>${d.status==='green'?'100 %':'0 %'}</b></div><div><h3 id="kcDbStatus">${d.status==='green'?'System OK':d.status==='blue'?'Bereit für Verbindungstest':'Noch nicht geprüft'}</h3><p id="kcDbDetails">${d.type||'Datenbank'} · ${d.role||'Laufzeitdatenbank'}</p><small>Letzter Test: <span id="kcDbLast">Noch nicht getestet</span></small></div></div><div class="kc-info-grid"><div><b>Typ</b><br>${d.type||d.id}</div><div><b>Rolle</b><br>${d.role||'Laufzeitdatenbank'}</div><div><b>Online</b><br>${navigator.onLine?'Ja':'Nein'}</div><div><b>Status-LED</b><br>${d.status||'grau'}</div></div><div class="kc-modal-actions"><button id="kcDbInfoTest" class="primary">Vollständigen Test starten</button><button id="kcDbTrafficTest">Datenverkehr anzeigen</button><button id="kcDbDiagnostic">Diagnosedatei erstellen</button><button id="kcDbSettings">Datenbankeinstellungen</button></div>`);q('#kcDbInfoTest',sh).onclick=()=>testDatabase(d,i,sh);q('#kcDbTrafficTest',sh).onclick=()=>flashDb(i);q('#kcDbDiagnostic',sh).onclick=()=>downloadDiagnostic(sh,d);q('#kcDbSettings',sh).onclick=()=>delegate(mode==='academy'?'#settingsBtn':mode==='training'?'#globalSettingsBtn':'#settingsButton')}
async function runCombinedSystemTest(sh){const btn=q('#kcSystemRun',sh),ring=q('#kcSystemRing',sh),result=q('#kcSystemResult',sh);btn.disabled=true;result.innerHTML='<b>Prüfung läuft …</b><span>Lokale Daten und Online-Verbindung werden geprüft.</span>';let localOk=false,cloudOk=false,localDetail='',cloudDetail='';try{const localStart=performance.now();await window.KCSecureStorage?.ready;const key='kcCombinedSystemTest',token=crypto.randomUUID?.()||String(Date.now());window.KCSecureStorage?.setItem(key,token);localOk=window.KCSecureStorage?.getItem(key)===token;window.KCSecureStorage?.removeItem?.(key);dbLatency.indexeddb=Math.max(1,Math.round(performance.now()-localStart));localDetail=localOk?`Verschlüsselter Speicher aktiv · ${dbLatency.indexeddb} ms`:'Schreib-/Lesetest fehlgeschlagen'}catch(e){localDetail=e.message}try{const a=window.KCSupabaseAdapter,d=a?.diagnostics?.()||{};if(!d.configured)throw new Error('Supabase noch nicht vollständig eingerichtet');const r=await a.testConnection({full:true});dbLatency.supabase=r.latencyMs;cloudOk=Boolean(r.ok);cloudDetail=cloudOk?`Anmeldung und Datenbank aktiv · ${r.latencyMs||0} ms`:r.message}catch(e){cloudDetail=e.message}const score=(localOk?50:0)+(cloudOk?50:0);q('#kcLocalState',sh).textContent=localOk?'bereit':'Fehler';q('#kcLocalState',sh).className=localOk?'ok':'bad';q('#kcLocalDetail',sh).textContent=localDetail;q('#kcCloudState',sh).textContent=cloudOk?'bereit':'Hinweis';q('#kcCloudState',sh).className=cloudOk?'ok':'bad';q('#kcCloudDetail',sh).textContent=cloudDetail;ring.style.setProperty('--score',score+'%');ring.querySelector('b').textContent=score+' %';result.innerHTML=`<b>${score===100?'Alles Wichtige ist in Ordnung.':'Es wurden Hinweise gefunden.'}</b><span>${score} % Systemzustand</span>`;sh._kcDiagnostic={schema:'KC_FUTURA_SYSTEMSTATUS_V1',version:'2.6.15',createdAt:new Date().toISOString(),score,local:{ok:localOk,detail:localDetail,latencyMs:dbLatency.indexeddb},supabase:{ok:cloudOk,detail:cloudDetail,latencyMs:dbLatency.supabase},navigator:{online:navigator.onLine,platform:navigator.platform},mode};btn.disabled=false;flashDb(0);flashDb(1);renderDb()}
function latencyGauge(value,label){const known=Number.isFinite(value);return `<div class="kc-latency-gauge ${known?'measured':''}" style="--latency:${known?Math.min(100,Math.max(4,value/10)):0}%"><b>${known?Math.round(value):'–'}</b><small>ms</small><span>${label}</span></div>`}
function openSystemStatus(){const p=profile(),vol=q(mode==='academy'?'#headerVolume':mode==='training'?'#trainingVolume':'#kcVolume')?.value||7,d=sources(),local=d[0],cloud=d[1],sh=modal('kcSystemModal','KC FUTURA · Systemstatus',`<div class="kc-system-grid"><article class="kc-system-with-gauge"><div><b>Lokale Daten</b><strong id="kcLocalState" class="${local.status==='green'?'ok':''}">${local.status==='green'?'bereit':'prüfen'}</strong><small id="kcLocalDetail">Verschlüsselter Speicher aktiv</small></div>${latencyGauge(dbLatency.indexeddb,'Zugriffszeit')}</article><article class="kc-system-with-gauge"><div><b>Online-Verbindung</b><strong id="kcCloudState" class="${cloud.status==='green'?'ok':''}">${cloud.status==='green'?'bereit':cloud.status==='blue'?'eingerichtet':'nicht bereit'}</strong><small id="kcCloudDetail">${cloud.status==='green'?'Automatisch verbunden':cloud.status==='blue'?'Automatische Prüfung läuft oder steht aus':'Konfiguration prüfen'}</small></div>${latencyGauge(dbLatency.supabase,'Antwortzeit')}</article><article><b>Ton</b><strong>${p.sound===false?'aus':'aktiv'}</strong><small>Lautstärke ${vol}/10</small></article><article><b>Version</b><strong>2.6.15</strong><small>KC FUTURA Academy</small></article></div><div class="kc-system-result"><div id="kcSystemRing" class="kc-health-ring" style="--score:0%"><b>0 %</b></div><div id="kcSystemResult"><b>Automatische Startprüfung aktiv</b><span>Die Verbindungen werden zusätzlich bei jedem Programmstart geprüft.</span></div></div><div class="kc-modal-actions"><button id="kcSystemRun" class="primary">System erneut prüfen</button><button id="kcSystemReport">Supportbericht erstellen</button><button id="kcSystemMail">Per E-Mail senden</button></div><p class="kc-system-help">Bei Problemen die Systemprüfung erneut starten und anschließend einen Supportbericht erstellen.</p>`);q('#kcSystemRun',sh).onclick=()=>runCombinedSystemTest(sh);q('#kcSystemReport',sh).onclick=()=>{if(window.KCDatabaseSecurityCore?.exportSupportReport)window.KCDatabaseSecurityCore.exportSupportReport();else downloadDiagnostic(sh,{id:'system',label:'Gesamtsystem'})};q('#kcSystemMail',sh).onclick=()=>window.KCDatabaseSecurityCore?.openSupportEmail?.()}
async function autoConnectDatabases(){try{const start=performance.now();await window.KCSecureStorage?.ready;await window.KCSecureStorage?.benchmark?.();dbLatency.indexeddb=Math.max(1,Math.round(performance.now()-start));flashDb(0)}catch{dbLatency.indexeddb=null}try{const a=window.KCSupabaseAdapter,d=a?.diagnostics?.()||{};if(d.enabled&&d.configured&&navigator.onLine){const result=await a.testConnection({full:false});dbLatency.supabase=result.latencyMs;await a.sync?.();flashDb(1)}}catch(e){const report=e?.report||window.KCSupabaseAdapter?.diagnostics?.().lastResult;dbLatency.supabase=Number(report?.latencyMs)||null}renderDb()}
function flashDb(i,confirmedTraffic=false){if(!confirmedTraffic)return;const led=q(`.kc-db-block[data-db="${i}"] .traffic`);if(!led)return;led.classList.remove('flash');void led.offsetWidth;led.classList.add('flash');setTimeout(()=>led.classList.remove('flash'),420)}renderDb();setInterval(renderDb,5000);window.addEventListener('kc:db-traffic',e=>{if(e.detail?.phase!=='start')return;const index=e.detail?.database==='supabase'?1:e.detail?.database==='indexeddb'?0:-1;if(index>=0)flashDb(index,true)});window.addEventListener('kc:supabase-status',e=>{if(Number(e.detail?.lastResult?.latencyMs))dbLatency.supabase=Number(e.detail.lastResult.latencyMs);renderDb()});setTimeout(autoConnectDatabases,350);
function delegate(sel){const el=q(sel);if(el&&!header.contains(el)){el.click();return true}return false}
function profile(){return safe('kcFuturaLauncherProfileV1',{name:'Teilnehmer',addressMode:'du',coach:'laura',voiceVariant:'one',sound:true})}
q('#kcUser').onclick=()=>{const p=profile(),sh=modal('kcUserModal','Teilnehmerprofil',`<div class="kc-user-summary"><span>👤</span><div><b>${p.name||'Teilnehmer'}</b><small>Persönliche Einstellungen für alle Schulungsteile</small></div></div><div class="kc-user-grid"><section><h3>Persönliche Angaben</h3><label>Vorname <input id="kcUserName" value="${String(p.name||'').replace(/"/g,'&quot;')}"></label><label>Anrede <select id="kcUserAddress"><option value="du">Du</option><option value="sie">Sie</option></select></label></section><section><h3>Begleitung und Stimme</h3><label>Begleitung <select id="kcUserCoach"><option value="laura">Laura</option><option value="marc">Marc</option><option value="none">Ohne Begleitung</option></select></label><label>Stimme <select id="kcUserVoice"><option value="one">Stimme 1</option><option value="two">Stimme 2</option></select></label><label class="kc-check"><input id="kcUserSound" type="checkbox"> Erklärungen und Tipps vorlesen</label></section></div><div class="kc-modal-actions"><button id="kcUserSave" class="primary">Änderungen speichern</button><button id="kcUserTest">Stimme testen</button><button id="kcUserFull">Ersteinrichtung vollständig öffnen</button></div>`);q('#kcUserAddress',sh).value=p.addressMode||'du';q('#kcUserCoach',sh).value=p.coach||'laura';q('#kcUserVoice',sh).value=p.voiceVariant||'one';q('#kcUserSound',sh).checked=p.sound!==false;q('#kcUserSave',sh).onclick=()=>{const next={...p,name:q('#kcUserName',sh).value.trim(),addressMode:q('#kcUserAddress',sh).value,coach:q('#kcUserCoach',sh).value,voiceVariant:q('#kcUserVoice',sh).value,sound:q('#kcUserSound',sh).checked,updatedAt:new Date().toISOString()};localStorage.setItem('kcFuturaLauncherProfileV1',JSON.stringify(next));sh.hidden=true};q('#kcUserTest',sh).onclick=testParticipantVoice;q('#kcUserFull',sh).onclick=()=>{sh.hidden=true;if(mode==='launcher')delegate('#editProfile')||delegate('#settingsButton');else delegate(mode==='academy'?'#settingsBtn':'#globalSettingsBtn')}};
function openLearningDashboard(){const t=safe('kc_training_profile_v0254',{}),a=safe('kcAcademyCompleted',{}),quick=Math.round(Number(t.quick)||0),advanced=Math.round(Number(t.advanced)||0),practice=Math.round(Number(t.practice)||0),part1=Math.round((quick+advanced+practice)/3),academyCount=Object.keys(a).length,academyPct=Math.min(100,Math.round(academyCount/33*100)),part3=Math.round((practice+(t.feedbackSubmittedAt?100:0))/2),all=Math.round((part1+academyPct+part3)/3),quiz=Object.values(t.quizStats||{}),correct=quiz.reduce((n,x)=>n+Number(x.correct||0),0),questions=quiz.reduce((n,x)=>n+Number(x.total||x.attempts||0),0),accuracy=questions?Math.round(correct/questions*100):0,minutes=Math.max(0,Math.round((Date.now()-new Date(t.trainingStartedAt||Date.now()).getTime())/60000)),rows=[['1.1','Grundlagen und Verkauf',quick],['1.2','Sonderfunktionen',advanced],['1.3','Praxisprüfung',practice],['2','Academy-Folgen',academyPct],['3','Wiederholung und Ergebnisse',part3]],sh=modal('kcLearningModal','Mein Lernstand',`<div class="kc-stat-cards"><article><b>${all} %</b><span>Gesamtfortschritt</span></article><article><b>${academyCount}</b><span>Academy-Folgen</span></article><article><b>${accuracy||'—'}${accuracy?' %':''}</b><span>Richtige Antworten</span></article><article><b>${minutes} Min.</b><span>Lernzeit</span></article></div><div class="kc-learning-tabs"><button data-kc-stat="all" class="active">Gesamt</button><button data-kc-stat="part1">Teil 1</button><button data-kc-stat="part2">Teil 2</button><button data-kc-stat="part3">Teil 3</button></div><div class="kc-learning-overview"><section><h3>Fortschritt nach Bereichen</h3><div class="kc-topic-bars">${rows.map(r=>`<div data-part="${r[0].startsWith('1')?'part1':r[0]==='2'?'part2':'part3'}"><span>${r[0]} · ${r[1]}</span><i><b style="width:${r[2]}%"></b></i><strong>${r[2]} %</strong></div>`).join('')}</div></section><section class="kc-learning-ring"><h3>Gesamtstatistik</h3><div class="kc-health-ring ok" style="--score:${all}%"><b>${all} %</b></div><p>${correct} richtige Antworten · ${Math.max(0,questions-correct)} Fehler</p><p>${part1>=100?'Teil 1 abgeschlossen':'Teil 1 in Bearbeitung'} · ${academyCount} Academy-Folgen</p></section></div><table class="kc-progress-table"><thead><tr><th>Teil</th><th>Inhalt</th><th>Status</th><th>Fortschritt</th></tr></thead><tbody>${rows.map(r=>`<tr data-part="${r[0].startsWith('1')?'part1':r[0]==='2'?'part2':'part3'}"><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]>=100?'✓ Abgeschlossen':r[2]>0?'In Bearbeitung':'Offen'}</td><td>${r[2]} %</td></tr>`).join('')}</tbody></table><aside class="kc-recommendation"><b>Persönliche Empfehlung</b><span>${quick<100?'Als Nächstes: Grundlagen und Verkauf fortsetzen.':advanced<100?'Als Nächstes: Sonderfunktionen bearbeiten.':practice<100?'Als Nächstes: Praxisprüfung abschließen.':'Teil 1 ist abgeschlossen – weiter zur Academy.'}</span></aside><div class="kc-modal-actions"><button id="kcLearningContinue" class="primary">Empfohlenen Lernschritt öffnen</button></div>`);qa('[data-kc-stat]',sh).forEach(b=>b.onclick=()=>{qa('[data-kc-stat]',sh).forEach(x=>x.classList.toggle('active',x===b));const filter=b.dataset.kcStat;qa('[data-part]',sh).forEach(x=>x.hidden=filter!=='all'&&x.dataset.part!==filter)});q('#kcLearningContinue',sh).onclick=()=>location.href=quick<100?`${base}training-video/index.html?entry=unified&module=quick`:advanced<100?`${base}training-video/index.html?entry=unified&module=advanced`:practice<100?`${base}training-video/index.html?entry=unified&module=practice`:`${base}academy/index.html?source=unified-home`}
function openUnifiedRoadmap(){const t=safe('kc_training_profile_v0254',{}),cards=[{n:'1.1',title:'Grundlagen und Verkauf',p:Number(t.quick)||0,url:`${base}training-video/index.html?entry=unified&module=quick`},{n:'1.2',title:'Sonderfunktionen',p:Number(t.advanced)||0,url:`${base}training-video/index.html?entry=unified&module=advanced`},{n:'1.3',title:'Praxisprüfung',p:Number(t.practice)||0,url:`${base}training-video/index.html?entry=unified&module=practice`},{n:'2',title:'FUTURA Academy',p:Math.min(100,Math.round(Object.keys(safe('kcAcademyCompleted',{})).length/33*100)),url:`${base}academy/index.html?source=unified-home`}];modal('kcRoadmapModal','Schulungsübersicht',`<div class="kc-roadmap">${cards.map((c,i)=>`<a href="${c.url}" class="${c.p>=100?'done':c.p>0?'current':''}"><span>${c.p>=100?'✓':c.n}</span><div><b>${c.title}</b><small>${c.p>=100?'Abgeschlossen':c.p>0?'In Bearbeitung':'Offen'} · ${Math.round(c.p)} %</small></div></a>${i<cards.length-1?'<i>↓</i>':''}`).join('')}</div>`)}
const pop=q('#kcAudioPop'),osc=q('#kcOsc');osc.onclick=()=>pop.hidden=!pop.hidden;document.addEventListener('pointerdown',e=>{if(!e.target.closest('.kc-voice-wrap'))pop.hidden=true});const pr=profile();q('#kcCoach').value=pr.coach||'laura';q('#kcVoice').value=pr.voiceVariant||'one';
const searchEsc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const BUILTIN_SEARCH=[
 {kind:'academy',module:'',part:'Teil 2',section:'Figuren und Avatare',title:'Frau Schmitt',text:'Frau Schmitt Gast Reklamation Hygiene Pflaster Laktoseintoleranz Weihnachtsmarkt Avatar Figur'},
 {kind:'academy',module:'',part:'Teil 2',section:'Figuren und Avatare',title:'Herr Becker',text:'Herr Becker Gast Reklamation Pflaster Verletzung Weihnachtsmarkt Avatar Figur'},
 ...['Laura','Marc','Kalle','Hannes','Michael','Sabrina','Gisela','Detlef','Lukas','Eugen'].map(title=>({kind:'academy',module:'',part:'Teil 2',section:'Figuren und Avatare',title,text:`${title} Avatar Figur Begleitung Köcheclub`})),
 {kind:'academy',module:'hygiene',part:'Teil 2',section:'Schulungsthema',title:'Hygiene und Lebensmittelsicherheit',text:'Hygiene hygienisch sauber Sauberkeit Händehygiene Allergene Lebensmittel Sicherheit hyg'},
 {kind:'training',module:'quick',targetIndex:0,part:'Teil 1',section:'Schulungsthemen',title:'KC Bilderrechner – Grundlagen',text:'Oberfläche Bedienung Verkauf Warenkorb Zahlung Rückgeld Artikel Kasse'},
 {kind:'training-tuv',part:'Teil 1',section:'Prüfungen und Diagnose',title:'Integrierter Schulungs-TÜV',text:'TÜV TUV Prüfung Qualitätsprüfung Technik Regression Neu starten Bericht Diagnose'},
 {kind:'training-audio-tuv',part:'Teil 1',section:'Prüfungen und Diagnose',title:'Audio- und Stimmen-TÜV',text:'Audio Ton Stimme Lautsprecher Prüfung Testton TUV TÜV'},
 {kind:'system-status',part:'Gesamtprogramm',section:'Prüfungen und Diagnose',title:'Systemstatus und Datenbankprüfung',text:'System prüfen Datenbank IndexedDB Supabase Verbindung Diagnose TÜV TUV'}
 ,{kind:'training-notice',part:'Gesamtprogramm',section:'Informationen',title:'Wichtiger Hinweis zur Schulungsdarstellung',text:'Bilder Bedienoberflächen Funktionen Echtbetrieb Freischaltung Module Weiterentwicklung Abweichungen'}
];
function globalSearchItems(){const bundled=Array.isArray(window.KCFuturaBundledSearchCatalog)?window.KCFuturaBundledSearchCatalog:[],current=Array.isArray(window.KCFuturaGlobalSearchItems)?window.KCFuturaGlobalSearchItems:[],cached=[...safe('kcFuturaSearchCatalogPart1',[]),...safe('kcFuturaSearchCatalogPart2',[])],fallback=CHAPTERS[mode].map((item,index)=>({part:config.part,section:'Kapitelübersicht',chapter:index+1,title:item.title,text:item.detail||'',tip:'',url:mode==='training'?`${base}training-video/index.html?entry=unified&module=${item.target}`:mode==='academy'?`${base}academy/index.html?source=global-search&module=${item.target}`:`${base}index.html`})),all=[...bundled,...current,...cached,...BUILTIN_SEARCH,...fallback],seen=new Set();return all.filter(item=>{const key=`${item.part}|${item.section}|${item.title}`;if(seen.has(key))return false;seen.add(key);return true})}
function searchItemUrl(item){if(item.kind==='training'){const key=item.module==='practice'?'task':'chapter';return `${base}training-video/index.html?entry=unified&module=${encodeURIComponent(item.module)}&${key}=${Number(item.targetIndex)||0}`}if(item.kind==='academy')return `${base}academy/index.html?source=global-search${item.module?`&module=${encodeURIComponent(item.module)}`:''}`;if(item.kind==='training-tuv')return `${base}training-video/index.html?view=tuv`;if(item.kind==='training-audio-tuv')return `${base}training-video/index.html?view=audio-tuv`;if(item.kind==='system-status')return '#kc-system-status';if(item.kind==='training-notice')return '#kc-training-notice';return item.url||''}
function openGlobalSearch(){let shell=q('#kcGlobalSearchPanel');if(!shell){shell=document.createElement('section');shell.id='kcGlobalSearchPanel';shell.className='kc-global-search';shell.innerHTML=`<div class="kc-search-box"><span aria-hidden="true">⌕</span><input id="kcGlobalSearchInput" type="search" inputmode="search" autocomplete="off" enterkeyhint="search" placeholder="Kapitel, Thema oder Inhalt suchen" aria-label="Globale Suche"><button id="kcGlobalSearchClear" type="button" aria-label="Suchbegriff löschen" title="Suchbegriff löschen">×</button><button id="kcGlobalSearchClose" type="button" aria-label="Suche schließen" title="Suche schließen">Schließen</button></div><div id="kcGlobalSearchStatus" class="kc-search-status">Mindestens zwei Buchstaben eingeben.</div><div id="kcGlobalSearchResults" class="kc-search-results"></div>`;document.body.append(shell);const input=q('#kcGlobalSearchInput',shell),clear=q('#kcGlobalSearchClear',shell),results=q('#kcGlobalSearchResults',shell),status=q('#kcGlobalSearchStatus',shell);const render=()=>{const term=input.value.trim().toLocaleLowerCase('de-DE');clear.hidden=!input.value;if(term.length<2){results.innerHTML='';status.textContent='Mindestens zwei Buchstaben eingeben.';return}const hits=globalSearchItems().filter(item=>[item.part,item.section,item.title,item.text,item.tip].join(' ').toLocaleLowerCase('de-DE').includes(term)).slice(0,30);status.textContent=hits.length?`${hits.length} Treffer`:'Keine passenden Inhalte gefunden.';results.innerHTML=hits.map(item=>`<button type="button" data-search-url="${searchEsc(searchItemUrl(item))}" class="kc-search-result"><span>${searchEsc(item.part)} · ${searchEsc(item.section)}${item.chapter?` · Kapitel ${searchEsc(item.chapter)}`:''}</span><b>${searchEsc(item.title)}</b><small>${searchEsc((item.text||item.tip||'').slice(0,170))}</small></button>`).join('');qa('[data-search-url]',results).forEach(button=>button.onclick=()=>{const url=button.dataset.searchUrl;if(url==='#kc-system-status'){shell.hidden=true;openSystemStatus()}else if(url==='#kc-training-notice'){shell.hidden=true;showTrainingDisclaimer(true)}else if(url)location.href=new URL(url,location.href).href})};input.addEventListener('input',render);clear.onclick=()=>{input.value='';render();input.focus({preventScroll:true})};q('#kcGlobalSearchClose',shell).onclick=()=>{shell.hidden=true;q('#kcGlobalSearch').focus()};shell.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();shell.hidden=true;q('#kcGlobalSearch').focus()}})}shell.hidden=false;const input=q('#kcGlobalSearchInput',shell);requestAnimationFrame(()=>{input.focus({preventScroll:true});input.select()})}
q('#kcGlobalSearch').onclick=openGlobalSearch;
const DISCLAIMER_VERSION='2.6.15';
function trainingDisclaimerAlreadyOpen(){const shell=q('#kcTrainingDisclaimer');return Boolean(shell&&!shell.hidden)}
function showTrainingDisclaimer(force=false){const storageKey=`kcFuturaTrainingNotice:${DISCLAIMER_VERSION}`;if(!force&&safe(storageKey,null)?.accepted)return;let shell=q('#kcTrainingDisclaimer');if(!shell){shell=document.createElement('div');shell.id='kcTrainingDisclaimer';shell.className='kc-disclaimer-shell';shell.innerHTML=`<section class="kc-disclaimer" role="dialog" aria-modal="true" aria-labelledby="kcDisclaimerTitle"><div class="kc-disclaimer-symbol" aria-hidden="true">i</div><div><small>Vor Beginn der Schulung</small><h2 id="kcDisclaimerTitle">Wichtiger Hinweis</h2><div id="kcDisclaimerShort"><p>Die Schulung zeigt typische Arbeitsabläufe des KC Bilderrechners. Abbildungen und Funktionen können je nach Programmversion, Einstellungen und freigeschalteten Modulen vom späteren Echtbetrieb abweichen.</p><p>Prüfe deshalb vor dem Einsatz immer die angezeigten Artikel, Preise, Mengen, Zahlungsbeträge und freigegebenen Funktionen. Bei Unklarheiten unterbrich den Vorgang und frage eine verantwortliche Person.</p></div><div id="kcDisclaimerLong" class="kc-disclaimer-long" hidden><h3>Erweiterte Hinweise und Regeln</h3><p>Die Schulungsinhalte wurden nach bestem Wissen und mit größtmöglicher Sorgfalt erstellt. Eine Gewähr für die jederzeitige Vollständigkeit, Fehlerfreiheit und Aktualität sämtlicher Inhalte, Abbildungen und Funktionsbeschreibungen kann jedoch nicht übernommen werden.</p><p>Die Schulung ersetzt keine betrieblichen Anweisungen, gesetzlichen Vorschriften sowie Hygiene-, Sicherheits- oder Datenschutzvorgaben. Maßgeblich sind die am Einsatzort geltenden Regelungen und die dort freigegebene Programmversion.</p><p>Vor dem Echtbetrieb müssen Funktionen, Preise, Artikel, Zahlungsarten, Bedienerrechte und technische Verbindungen durch eine verantwortliche Person geprüft werden. Eingaben und Ergebnisse sind vor Abschluss eines Vorgangs zu kontrollieren.</p><p>Soweit gesetzlich zulässig, wird keine Haftung für Schäden übernommen, die durch unsachgemäße Bedienung, nicht freigegebene Veränderungen, unvollständige Konfigurationen oder veraltete Schulungsstände entstehen. Gesetzlich zwingende Haftungsansprüche bleiben unberührt.</p><ol><li>Vor Schichtbeginn Systemstatus und Bediener prüfen.</li><li>Artikel, Preise, Mengen und Zahlungsbetrag kontrollieren.</li><li>Nur freigeschaltete und freigegebene Funktionen verwenden.</li><li>Bei Fehlern den Vorgang stoppen und eine verantwortliche Person informieren.</li></ol><button id="kcDisclaimerBack" class="kc-disclaimer-secondary" type="button">Zurück zur Kurzfassung</button></div><button id="kcDisclaimerMore" class="kc-disclaimer-secondary" type="button">Erweiterte Hinweise und Regeln anzeigen</button><button id="kcDisclaimerAccept" type="button">Ich habe den Hinweis verstanden</button></div></section>`;document.body.append(shell);const short=q('#kcDisclaimerShort',shell),long=q('#kcDisclaimerLong',shell),more=q('#kcDisclaimerMore',shell),back=q('#kcDisclaimerBack',shell);more.onclick=()=>{short.hidden=true;long.hidden=false;more.hidden=true;back.focus()};back.onclick=()=>{long.hidden=true;short.hidden=false;more.hidden=false;more.focus()};q('#kcDisclaimerAccept',shell).onclick=()=>{const current=profile(),currentName=String(current.name||'Teilnehmer').trim();localStorage.setItem(`kcFuturaTrainingNotice:${DISCLAIMER_VERSION}`,JSON.stringify({accepted:true,acceptedAt:new Date().toISOString(),version:DISCLAIMER_VERSION,participant:currentName,extendedViewed:!long.hidden}));shell.hidden=true}}q('#kcDisclaimerLong',shell).hidden=true;q('#kcDisclaimerShort',shell).hidden=false;q('#kcDisclaimerMore',shell).hidden=false;shell.hidden=false;requestAnimationFrame(()=>q('#kcDisclaimerAccept',shell)?.focus())}
const showTrainingDisclaimerBase=showTrainingDisclaimer;
showTrainingDisclaimer=(force=false)=>{if(trainingDisclaimerAlreadyOpen())return;return showTrainingDisclaimerBase(force)};
function underlyingMonitor(){return q(mode==='training'?'#trainingVoiceMonitor':mode==='academy'?'#voiceMonitor':'#lauraVoiceStatus')}
function audioEnabled(){if(mode==='launcher')return q('#setupSound')?.checked??profile().sound!==false;const source=q(mode==='academy'?'#soundBtn':'#globalSoundBtn');return !/🔇/.test(source?.textContent||'')}
function syncOsc(){const u=underlyingMonitor(),enabled=audioEnabled(),speaking=enabled&&(u?.classList.contains('is-speaking')||/spricht|getestet|wird getestet/i.test(u?.textContent||'')),pending=enabled&&u?.classList.contains('is-pending');osc.classList.toggle('show',!!(speaking||pending||!pop.hidden));osc.classList.toggle('speaking',!!speaking);q('#kcOscText').textContent=enabled?(u?.textContent||'Audio').trim():'Ton aus';q('#kcSound').textContent=enabled?'🔊':'🔇';q('#kcAudioToggle').textContent=enabled?'🔊 Ton':'🔇 Ton aus';q('#kcVoiceTest').disabled=!enabled;q('#kcRepeat').disabled=!enabled;q('#kcVoiceTest').setAttribute('aria-disabled',String(!enabled));q('#kcRepeat').setAttribute('aria-disabled',String(!enabled))}
window.addEventListener('kc:voice-monitor',e=>{const state=e.detail?.mode||'ready',active=state==='speaking'||state==='pending';osc.classList.toggle('show',active||!pop.hidden);osc.classList.toggle('speaking',state==='speaking');q('#kcOscText').textContent=e.detail?.label||'Stimme'});
function testParticipantVoice(){const coach=q('#kcUserCoach')?.value||'laura',voiceVariant=q('#kcUserVoice')?.value||'one',name=q('#kcUserName')?.value.trim()||'Teilnehmer';q('#kcCoach').value=coach;q('#kcVoice').value=voiceVariant;saveAudioChoice();if(coach==='none')return;const label=coach==='marc'?'Marc':'Laura',message=`Hallo ${name}. Ich bin ${label}. So klingt die ausgewählte Stimme.`;try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(message),voices=speechSynthesis.getVoices().filter(v=>/^de/i.test(v.lang||''));utterance.voice=voices[voiceVariant==='two'?1:0]||voices[0]||null;utterance.rate=coach==='marc'?.92:.96;utterance.pitch=coach==='marc'?.9:1.05;utterance.onstart=()=>window.dispatchEvent(new CustomEvent('kc:voice-monitor',{detail:{mode:'speaking',label:`${label} spricht`}}));utterance.onend=()=>window.dispatchEvent(new CustomEvent('kc:voice-monitor',{detail:{mode:'ready',label:'Ton bereit'}}));utterance.onerror=utterance.onend;speechSynthesis.speak(utterance)}catch{q('#kcVoiceTest').click()}}
function saveAudioChoice(){const p=profile(),coach=q('#kcCoach').value,voiceVariant=q('#kcVoice').value;localStorage.setItem('kcFuturaLauncherProfileV1',JSON.stringify({...p,coach,voiceVariant,updatedAt:new Date().toISOString()}));const gender=coach==='marc'?'male':'female',coachSelect=q(mode==='training'?'#globalCoachSelect':mode==='academy'?'#modalCoach':'');if(coachSelect){coachSelect.value=mode==='training'?gender:coach;coachSelect.dispatchEvent(new Event('change',{bubbles:true}))}const voiceSelect=q(mode==='training'?'#globalVoiceSelect':'');if(voiceSelect){voiceSelect.value=voiceVariant;voiceSelect.dispatchEvent(new Event('change',{bubbles:true}))}if(mode==='launcher'){q(`input[name="${coach}Voice"][value="${voiceVariant}"]`)?.click()}}
function showAudioPop(){pop.hidden=false;syncOsc()}setInterval(syncOsc,180);q('#kcCoach').onchange=saveAudioChoice;q('#kcVoice').onchange=saveAudioChoice;q('#kcAudioToggle').onclick=()=>{if(mode==='launcher'){const t=q('#setupSound');if(t){t.checked=!t.checked;t.dispatchEvent(new Event('change',{bubbles:true}))}}else delegate(mode==='academy'?'#soundBtn':'#globalSoundBtn');syncOsc()};let soundClickTimer=null,lastSoundClick=0;q('#kcSound').onclick=e=>{const now=Date.now();if(now-lastSoundClick<=420){e.preventDefault();clearTimeout(soundClickTimer);lastSoundClick=0;q('#kcAudioToggle').click();return}lastSoundClick=now;clearTimeout(soundClickTimer);soundClickTimer=setTimeout(()=>{lastSoundClick=0;showAudioPop()},430)};q('#kcVoiceTest').onclick=()=>{if(!audioEnabled())return;saveAudioChoice();delegate(mode==='academy'?'#voicePreview':mode==='training'?'#globalVoiceTest':`[data-test-coach="${q('#kcCoach').value}"]`);showAudioPop()};q('#kcRepeat').onclick=()=>{if(!audioEnabled())return;delegate(mode==='academy'?'#repeatBtn':mode==='training'?'#speakBtn':`[data-test-coach="${q('#kcCoach').value}"]`);showAudioPop()};q('#kcVolume').oninput=e=>{q('#kcVolumeValue').textContent=e.target.value+'/10';const target=q(mode==='academy'?'#headerVolume':'#trainingVolume');if(target){target.value=e.target.value;target.dispatchEvent(new Event('input',{bubbles:true}))}showAudioPop()};q('#kcAudioOk').onclick=()=>{pop.hidden=true;syncOsc()};syncOsc();
function isPaused(){return document.body.classList.contains(mode==='academy'?'academy-paused':mode==='training'?'training-paused':'kc-paused')}
// Freischaltung Einarmiger Bandit im Pause-Fenster (User-Wunsch): nutzt DIESELBE Speicherstelle
// wie die Spielewelt (kc_training_profile_v0254), damit beide Stellen konsistent denselben
// Freischalt-Zustand zeigen - kein doppelter, auseinanderlaufender Fortschritt.
const KC_PAUSE_MANUAL_UNLOCK_KEY='kc-game-manual-unlock:slot';
// Vorläufiger vierstelliger Freischalt-Code (User-Wunsch: nicht im Klartext im Code, sondern als
// Prüfsumme). Aktueller Code: 1234 (vorläufig - für einen neuen Code einfach die Prüfsumme unten
// durch den SHA-256-Hash des neuen Codes ersetzen).
const KC_PAUSE_UNLOCK_CODE_HASH='03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
async function sha256Hex(text){
  const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function slotMachineUnlocked(){
  if(localStorage.getItem(KC_PAUSE_MANUAL_UNLOCK_KEY)==='1')return true;
  try{
    const profile=JSON.parse(localStorage.getItem('kc_training_profile_v0254')||'{}');
    return ['quick','advanced','practice'].every(key=>Number(profile[key])===100);
  }catch{return false}
}
async function tryUnlockSlotMachineByCode(){
  const eingabe=prompt('Vierstelliger Freischalt-Code für den Einarmigen Banditen:');
  if(eingabe===null)return;
  const hash=await sha256Hex(eingabe.trim());
  if(hash===KC_PAUSE_UNLOCK_CODE_HASH){
    localStorage.setItem(KC_PAUSE_MANUAL_UNLOCK_KEY,'1');
    renderUnifiedPause(true);
  }else{
    alert('Code nicht korrekt.');
  }
}
/* 02.09.2026 (Betreiber): "Nach jeder Leistung: Nach dieser Leistung wurde fuer Sie das Spiel
   X freigeschaltet." Bis hierher schaltete NUR die Kassenschulung Spiele frei - eine
   abgeschlossene Academy-Folge hatte null Wirkung. Deshalb bekommt jedes gesperrte Spiel
   zusaetzlich einen Academy-Weg: 'folgen' sagt, wie viele abgeschlossene Folgen reichen.
   Die alten Wege bleiben unveraendert bestehen; es kommt nur ein zweiter dazu. */
/* 02.09.2026, zweiter Fund (Betreiber): "Muss es nicht mehr Spiele geben? Ich weiss von
   Memory, Glaeserturm, Einarmiger, Leuchten, Vier gewinnt, Kuchentablett, Kuechengeheimnisse
   und zum Schluss das ganz Grosse, was wie eine Pruefungsvorbereitung ist."
   Er hatte recht. Hier stand eine ZWEITE, veraltete Abschrift mit 7 von 13 Spielen - die
   Wahrheit steht in games/spielpause/registries.js. Sechs Spiele fehlten komplett, und
   'glass' hiess hier "KC Glaeserturm", in Wirklichkeit "KC Balance-Duell". Das Pausenmenue
   fuetterte sich aus dieser Abschrift, deshalb sah niemand die anderen Spiele.
   Die Liste ist jetzt vollstaendig und wird von tests/spielewelt.test.cjs gegen die Registry
   geprueft - laufen die beiden auseinander, schlaegt die Pruefung an.
   Freischaltung nach Betreiberwunsch: drei Spiele von Anfang an, alle anderen ueber die
   abgeschlossenen Academy-Folgen, die Karriereleiter ganz zum Schluss. Die alten Wege
   (Kassenschulung, Erfolge in anderen Spielen) bleiben zusaetzlich bestehen. */
const PAUSE_SPIELE=[
  {id:'memory',title:'KC Memory',icon:'🃏',unlock:'open'},
  {id:'lights',title:'KC Küchenlicht',icon:'💡',unlock:'open'},
  {id:'ttt',title:'KC Tic-Tac-Toe',icon:'❎',unlock:'open'},
  {id:'maze',title:'KC Labyrinth',icon:'🧭',unlock:'academy',folgen:2},
  {id:'slot',title:'KC Einarmiger Bandit',icon:'🎰',unlock:'training-complete',folgen:4},
  {id:'service',title:'KC Serviertablett',icon:'🍽️',unlock:'academy',folgen:6},
  {id:'dice',title:'KC Würfelbecher',icon:'🎲',unlock:'training-complete',folgen:8},
  {id:'vault',title:'KC Küchen-Tresor',icon:'🔐',unlock:'academy',folgen:11},
  {id:'connect4',title:'KC Vier gewinnt',icon:'🔴',unlock:'dice-achievement',folgen:14},
  {id:'roulette',title:'KC Küchen-Roulette',icon:'🎡',unlock:'academy',folgen:18},
  {id:'kitchen',title:'KC Küchenbrigade',icon:'👨‍🍳',unlock:'training-complete',folgen:22},
  {id:'auction',title:'KC Privatauktion',icon:'🔨',unlock:'academy',folgen:27},
  {id:'glass',title:'KC Balance-Duell',icon:'🥂',unlock:'connect4-achievement',folgen:32}
];
/* Das grosse Abschlussmodul steht neben den Spielen, nicht darunter: 418 Fragen und
   Aufgaben, die Pruefungsvorbereitung. Es liegt in der Academy, nicht in der Spielpause,
   und geht auf, wenn alle Spiele frei sind - oder nach genuegend Academy-Folgen. */
const KARRIERELEITER={id:'karriereleiter',title:'KC Karriereleiter',icon:'🪜',
  beschreibung:'Das große Abschluss-Lernmodul · 418 Fragen und Aufgaben',
  ziel:'academy/karriereleiter/index.html',folgen:40};
function karriereleiterFrei(){
  if(localStorage.getItem('kc-game-manual-unlock:karriereleiter')==='1')return true;
  if(academyFolgenAbgeschlossen()>=KARRIERELEITER.folgen)return true;
  return PAUSE_SPIELE.every(spielFreigeschaltet);
}
/* Zaehlt die abgeschlossenen Academy-Folgen.
   Achtung, das war die Falle: Die Academy legt kcAcademyCompleted NICHT im normalen
   localStorage ab, sondern verschluesselt in der IndexedDB (KCSecureStorage). Ein
   localStorage.getItem() liefert dort schlicht nichts - die Freischaltung haette nie
   gegriffen, ohne dass irgendwo ein Fehler erschienen waere. Deshalb drei Quellen in
   dieser Reihenfolge: die schlichte Zahl, die die Academy beim Abschluss mitschreibt
   (sofort und auf allen Seiten lesbar), dann der verschluesselte Speicher, dann der
   normale localStorage als letzter Rueckfall. */
function academyFolgenAbgeschlossen(){
  try{const zahl=Number(localStorage.getItem('kcAcademyFolgenAnzahl'));
    if(Number.isFinite(zahl)&&zahl>0)return zahl}catch{}
  for(const lesen of [k=>window.KCSecureStorage?.getItem(k),k=>localStorage.getItem(k)]){
    try{const roh=lesen('kcAcademyCompleted');if(!roh)continue;
      const c=JSON.parse(roh);if(c&&typeof c==='object')return Object.keys(c).length}catch{}
  }
  return 0;
}
function spielFreigeschaltet(spiel){
  if(localStorage.getItem(`kc-game-manual-unlock:${spiel.id}`)==='1')return true;
  if(spiel.unlock==='open')return true;
  if(spiel.folgen&&academyFolgenAbgeschlossen()>=spiel.folgen)return true;
  if(spiel.unlock==='training-complete')return trainingAbgeschlossen();
  if(spiel.unlock==='dice-achievement')return localStorage.getItem('kc-game-achievement:dice')==='1';
  if(spiel.unlock==='connect4-achievement')return localStorage.getItem('kc-game-achievement:connect4')==='1';
  return false;
}
/* Was muss man noch tun, damit dieses Spiel aufgeht? Als Satz, den man einem Teilnehmer
   zeigen kann - bisher stand nur "Noch gesperrt" da, ohne zu sagen, wodurch. */
function freischaltHinweis(spiel){
  if(spielFreigeschaltet(spiel))return '';
  const teile=[];
  if(spiel.folgen){const fehlt=spiel.folgen-academyFolgenAbgeschlossen();
    teile.push(`noch ${fehlt} ${fehlt===1?'Academy-Folge':'Academy-Folgen'}`)}
  if(spiel.unlock==='training-complete')teile.push('oder die Kassenschulung vollständig');
  if(spiel.unlock==='dice-achievement')teile.push('oder ein Erfolg im Würfelbecher');
  if(spiel.unlock==='connect4-achievement')teile.push('oder ein Erfolg in Vier gewinnt');
  return teile.join(' ');
}
function karriereleiterHinweis(){
  if(karriereleiterFrei())return '';
  const fehlt=KARRIERELEITER.folgen-academyFolgenAbgeschlossen();
  return `noch ${fehlt} ${fehlt===1?'Academy-Folge':'Academy-Folgen'} oder alle Spiele frei`;
}
/* Welches Spiel geht bei genau dieser Folgenzahl auf? Die Academy fragt das nach jedem
   abgeschlossenen Modul, um es anzusagen. */
function spielFuerFolgenzahl(anzahl){
  return PAUSE_SPIELE.find(s=>s.folgen===anzahl)||null;
}
window.KCSpielewelt={spiele:PAUSE_SPIELE,freigeschaltet:spielFreigeschaltet,
  hinweis:freischaltHinweis,folgenAnzahl:academyFolgenAbgeschlossen,fuerFolgenzahl:spielFuerFolgenzahl,
  oeffnen:id=>openPauseGame(id,{ausUebersicht:true}),
  /* Fertige Kachel fuer die Uebersicht - damit Academy und Startseite dieselbe Liste zeigen
     und nicht zwei Stellen gepflegt werden muessen. */
  karriereleiter:KARRIERELEITER,karriereleiterFrei,
  kachelHtml(){
    const frei=PAUSE_SPIELE.filter(spielFreigeschaltet).length;
    const kFrei=karriereleiterFrei();
    const spielKnopf=s=>{const offen=spielFreigeschaltet(s);
      return `<button type="button" class="kc-spielewelt-spiel${offen?' offen':' zu'}" data-spielewelt="${s.id}" ${offen?'':'disabled aria-disabled="true"'}>`
        +`<span class="kc-spielewelt-icon">${s.icon}</span><span class="kc-spielewelt-name">${s.title}</span>`
        +`<small>${offen?'jetzt spielbar':'🔒 '+freischaltHinweis(s)}</small></button>`};
    return `<aside class="kc-spielewelt"><div class="kc-spielewelt-kopf"><div>`
      +`<span class="eyebrow">Spielewelt</span><h3>🎮 KC Spielewelt</h3>`
      +`<p>${frei} von ${PAUSE_SPIELE.length} Spielen frei. Weitere schalten sich frei, je mehr Academy-Folgen abgeschlossen sind. Erreichbar auch jederzeit über die Pause-Taste oben.</p>`
      +`</div><button type="button" class="kc-spielewelt-alle" data-spielewelt-alle="1">Ganze Spielewelt öffnen →</button></div>`
      +`<div class="kc-spielewelt-liste">${PAUSE_SPIELE.map(spielKnopf).join('')}</div>`
      /* Das Abschlussmodul steht eigens darunter - es ist kein Pausenspiel, sondern die
         Pruefungsvorbereitung mit 418 Fragen und Aufgaben. */
      +`<button type="button" class="kc-spielewelt-leiter${kFrei?' offen':' zu'}" data-karriereleiter="1" ${kFrei?'':'disabled aria-disabled="true"'}>`
      +`<span class="kc-spielewelt-icon">${KARRIERELEITER.icon}</span>`
      +`<span><b>${KARRIERELEITER.title}</b><br><small>${KARRIERELEITER.beschreibung}</small></span>`
      +`<em>${kFrei?'jetzt öffnen':'🔒 '+karriereleiterHinweis()}</em></button>`
      +`</aside>`;
  },
  /* Klicks auf die Kachel verdrahten. Wird nach jedem Neuzeichnen der Uebersicht gerufen. */
  kachelVerdrahten(wurzel=document){
    wurzel.querySelectorAll('[data-spielewelt]').forEach(btn=>{
      btn.onclick=()=>{if(!btn.disabled)openPauseGame(btn.dataset.spielewelt,{ausUebersicht:true})};
      /* 02.09.2026 (Betreiber): "Auf rechten Mausklick kann ich die Spiele freischalten."
         Das gab es im Pausenmenue und auf der Spielewelt-Seite - auf der neuen Kachel hatte
         ich es vergessen. Gesperrte Kacheln reagieren jetzt ueberall gleich. */
      btn.oncontextmenu=e=>{if(!btn.disabled)return;e.preventDefault();versucheSpielFreizuschalten(btn.dataset.spielewelt,()=>{
        const host=btn.closest('.kc-spielewelt')?.parentElement;
        if(host&&window.KCSpielewelt){const k=btn.closest('.kc-spielewelt');
          k.outerHTML=window.KCSpielewelt.kachelHtml();window.KCSpielewelt.kachelVerdrahten(host)}})};
    });
    wurzel.querySelectorAll('[data-spielewelt-alle]').forEach(btn=>{
      btn.onclick=()=>{location.href=new URL(`${base}games/spielpause/index.html`,location.href).href};
    });
    wurzel.querySelectorAll('[data-karriereleiter]').forEach(btn=>{
      btn.onclick=()=>{if(!btn.disabled)location.href=new URL(`${base}${KARRIERELEITER.ziel}`,location.href).href};
      btn.oncontextmenu=e=>{if(!btn.disabled)return;e.preventDefault();versucheSpielFreizuschalten('karriereleiter',()=>{
        const host=btn.closest('.kc-spielewelt')?.parentElement;
        if(host&&window.KCSpielewelt){const k=btn.closest('.kc-spielewelt');
          k.outerHTML=window.KCSpielewelt.kachelHtml();window.KCSpielewelt.kachelVerdrahten(host)}})};
    });
  }};
function trainingAbgeschlossen(){
  try{
    const profile=JSON.parse(localStorage.getItem('kc_training_profile_v0254')||'{}');
    return ['quick','advanced','practice'].every(key=>Number(profile[key])===100);
  }catch{return false}
}
/* Der Rueckruf sagt, was nach erfolgreicher Freischaltung neu zu zeichnen ist: aus dem
   Pausenmenue heraus das Pausenmenue, aus der Uebersichtskachel heraus die Kachel. */
async function versucheSpielFreizuschalten(spielId,neuZeichnen){
  const eingabe=prompt('Vierstelliger Freischalt-Code:');
  if(eingabe===null)return;
  const hash=await sha256Hex(eingabe.trim());
  if(hash===KC_PAUSE_UNLOCK_CODE_HASH){
    localStorage.setItem(`kc-game-manual-unlock:${spielId}`,'1');
    if(typeof neuZeichnen==='function')neuZeichnen();else renderUnifiedPause(true);
  }else{
    alert('Code nicht korrekt.');
  }
}
/* 02.09.2026 (Betreiber): "Die komplette Spieleakademie ist gar nicht drin in der Uebersicht."
   Die Spiele waren ausschliesslich ueber die Pause-Taste erreichbar - wer nicht auf Pause
   drueckte, erfuhr nie, dass es sie gibt. Aus der Spielewelt-Kachel heraus wird direkt
   geoeffnet; die Pause-Bedingung gilt nur fuer den Weg ueber die Pause-Taste. */
function openPauseGame(spielId,{ausUebersicht=false}={}){
  if(!PAUSE_SPIELE.some(s=>s.id===spielId))return;
  if(!ausUebersicht&&!isPaused())return;
  const spiel=PAUSE_SPIELE.find(s=>s.id===spielId);
  if(!spielFreigeschaltet(spiel))return;
  let shell=q('#kcPauseGameShell');if(shell)return;
  try{
    shell=document.createElement('div');
    shell.id='kcPauseGameShell';
    shell.className='kc-pause-game-shell';
    /* 02.09.2026: Hier stand "?game=<id>". Diesen Parameter wertet die Spielewelt NIRGENDS
       aus - man landete also immer auf der Uebersicht statt in dem Spiel, das man angeklickt
       hatte. Die Seite startet ein Spiel direkt ueber die Raute: index.html#slot. */
    const content=`<iframe src="${new URL(`${base}games/spielpause/index.html#${spielId}`,location.href).href}" title="${spiel.title}"></iframe>`;
    const head=`<div class="kc-pause-game-head"><div><small>Spielpause · reine Unterhaltung ohne Echtgeld</small><h2>${spiel.title}</h2></div><button id="kcPauseGameClose" type="button">← Spiel verlassen</button></div>`;
    shell.innerHTML=`<section>${head}${content}</section>`;
    document.body.append(shell);
    const close=q('#kcPauseGameClose',shell);if(close)close.onclick=()=>shell.remove();
  }catch(e){alert(`Das Pausenspiel konnte nicht gestartet werden. ${e.message||''}`)}
}
function pauseGameButtons(){
  return `<div class="kc-pause-games">${PAUSE_SPIELE.map(s=>{
    const frei=spielFreigeschaltet(s);
    // Gesperrte Spiele sagen jetzt, WODURCH sie aufgehen - vorher stand nur "Noch gesperrt".
    const hinweis=frei?'':freischaltHinweis(s);
    return `<button type="button" data-pause-game="${s.id}" ${frei?'':`disabled aria-disabled="true" title="Noch gesperrt: ${hinweis} · Rechtsklick für Freischalt-Code."`}>${s.icon} ${s.title}${frei?'':' 🔒'}${frei?'':`<small>${hinweis}</small>`}</button>`;
  }).join('')}
  <button type="button" data-pause-karriereleiter="1" ${karriereleiterFrei()?'':`disabled aria-disabled="true" title="Noch gesperrt: ${karriereleiterHinweis()}"`}>${KARRIERELEITER.icon} ${KARRIERELEITER.title}${karriereleiterFrei()?'':' 🔒'}<small>${karriereleiterFrei()?'418 Fragen und Aufgaben':karriereleiterHinweis()}</small></button>
  </div>`;
}
function renderUnifiedPause(wantPause){
  let overlay=q('#kcUnifiedPauseOverlay');
  /* 02.09.2026, erste Fassung: hier stand zusaetzlich mode==='academy'. Ich hatte das
     entfernt, weil es die Spielepause in der Academy nicht gab.
     Zweite Fassung, nach dem dritten Fund: Die Academy bringt ein EIGENES Pause-Fenster mit,
     und das zeigt inzwischen dieselbe vollstaendige Spielewelt. Ohne diese Ausnahme lagen
     zwei Pause-Fenster uebereinander, beide mit derselben Liste - gemessen, nicht vermutet.
     Deshalb ist die Ausnahme wieder da, jetzt aber mit dem Grund dabei: In der Academy
     zeichnet academy/app.js showPauseOverlay(), ueberall sonst dieses hier. */
  if(!wantPause||mode==='academy'){overlay?.remove();q('#kcPauseGameShell')?.remove();return}
  if(overlay)overlay.remove();
  overlay=document.createElement('div');
  overlay.id='kcUnifiedPauseOverlay';
  overlay.className='kc-unified-pause-overlay';
  overlay.innerHTML=`<div><span>⏸</span><h2>Pause</h2><button class="kc-resume-from-pause" type="button">▶ Fortsetzen</button>${pauseGameButtons()}<p>Stimme, Animationen und Lernzeit sind angehalten.</p></div>`;
  document.body.append(overlay);
  q('.kc-resume-from-pause',overlay).onclick=()=>setPause(false);
  PAUSE_SPIELE.forEach(s=>{
    const btn=q(`[data-pause-game="${s.id}"]`,overlay);
    if(!btn)return;
    btn.onclick=()=>openPauseGame(s.id);
    btn.oncontextmenu=e=>{if(spielFreigeschaltet(s))return;e.preventDefault();versucheSpielFreizuschalten(s.id)};
  });
  const leiter=q('[data-pause-karriereleiter]',overlay);
  if(leiter){leiter.onclick=()=>{if(!leiter.disabled)window.open(new URL(`${base}${KARRIERELEITER.ziel}`,location.href).href,'_blank')};
    leiter.oncontextmenu=e=>{if(karriereleiterFrei())return;e.preventDefault();versucheSpielFreizuschalten('karriereleiter')}}
}
function setPause(wantPause){if(mode==='launcher'){document.body.classList.toggle('kc-paused',wantPause);try{wantPause?speechSynthesis.pause():speechSynthesis.resume()}catch{}}else if(isPaused()!==wantPause)delegate(mode==='academy'?'#pauseBtn':'#trainingHeaderPause');q('#kcPause').textContent=wantPause?'▶':'⏸';renderUnifiedPause(wantPause)}
function openProtectedArea(){
 if(mode==='academy'){
  if(window.KCFuturaProtectedArea?.open)window.KCFuturaProtectedArea.open();
  else window.dispatchEvent(new CustomEvent('kc:open-protected-area'));
  return;
 }
 const target=new URL(`${base}academy/index.html`,location.href);
 target.searchParams.set('protected','1');
 target.searchParams.set('return',location.href);
 location.href=target.href;
}
function bindProtectedGesture(){
 const mark=q('.kc-chef-mark');if(!mark)return;
 let clicks=[],holdTimer=null,opened=false;
 const open=()=>{if(opened)return;opened=true;clicks=[];clearTimeout(holdTimer);openProtectedArea();setTimeout(()=>opened=false,1200)};
 mark.addEventListener('click',()=>{const now=Date.now();clicks=clicks.filter(t=>now-t<2500);clicks.push(now);if(clicks.length>=7)open()});
 mark.addEventListener('pointerdown',()=>{clearTimeout(holdTimer);holdTimer=setTimeout(open,5000)});
 ['pointerup','pointerleave','pointercancel'].forEach(type=>mark.addEventListener(type,()=>clearTimeout(holdTimer)));
}
bindProtectedGesture();
q('#kcBack').onclick=()=>delegate(mode==='academy'?'#backBtn':mode==='training'?'#trainingHeaderBack':'#setupBack')||history.back();q('#kcPause').onclick=()=>{const paused=isPaused(),sh=modal('kcPauseModal','Schulung unterbrechen',`<div class="kc-pause-question"><span>⏸</span><div><h3>Möchtest du jetzt eine Pause machen oder mit der Schulung fortfahren?</h3><p>Während der Pause werden Stimme, Animationen und Lernzeit angehalten.</p></div></div><div class="kc-modal-actions"><button id="kcMakePause" class="primary">Pause machen</button><button id="kcContinueNow">Weiterlernen</button><button id="kcPauseCancel">Abbrechen</button></div>`);q('#kcMakePause',sh).onclick=()=>{sh.hidden=true;setPause(true)};q('#kcContinueNow',sh).onclick=()=>{sh.hidden=true;setPause(false)};q('#kcPauseCancel',sh).onclick=()=>sh.hidden=true;if(paused)q('#kcContinueNow',sh).classList.add('primary')};setInterval(()=>{const paused=isPaused();q('#kcPause').textContent=paused?'▶':'⏸';q('#kcPause').setAttribute('data-tooltip',paused?'Schulung fortsetzen':'Schulung pausieren')},150);q('#kcDashboard').onclick=openLearningDashboard;q('#kcRoadmap').onclick=openUnifiedRoadmap;q('#kcSettings').onclick=()=>delegate(mode==='academy'?'#settingsBtn':mode==='training'?'#globalSettingsBtn':'#settingsButton');setTimeout(()=>showTrainingDisclaimer(false),500);setInterval(()=>showTrainingDisclaimer(false),1500);
})();
