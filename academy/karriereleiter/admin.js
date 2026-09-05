(function(){
  const TOPICS=[
    ['Hygiene','Hygiene & Sicherheit'],['Temperatur','Temperatur & Messkunde'],['Geraetekunde','Gerätekunde'],['Materialkunde','Materialkunde'],['Warenkunde','Warenkunde'],['Fischkunde','Fischkunde'],['KraeuterGewuerze','Kräuter & Gewürze'],['Kalkulation','Kalkulation & Rechnen'],
    ['Personal','Personal / Mitarbeiter'],['Gerichte','Gerichte & Zutaten'],['Saucen','Saucen & klassische Küche'],['MenueService','Menü & Service'],
    ['Region','Regionalküche'],['Welt','Weltküche'],['Technik','Küchentechnik & Arbeitsabläufe'],['Fruehstueck','Frühstück'],['Sonstiges','Weitere Fachgebiete']
  ];
  const defaults=()=>({topics:Object.fromEntries(TOPICS.map(([id])=>[id,true])),pin:'1234'});
  let settings=defaults(),root=null,pressTimer=null;
  const $=s=>document.querySelector(s);
  function classify(q){
    const s=`${q.section||''} ${q.cat||''} ${q.title||''}`.toLowerCase();
    if(/temperatur|kerntemperatur|thermometer|messkunde|messfühler|messfuehler|kühlkette|kuehlkette|gargrad/.test(s))return'Temperatur';
    if(/gerätekunde|geraetekunde|herdarten|wärmegeräte|waermegeraete|backofen|fritteuse|mikrowelle|induktion|gasherd|elektroherd|festbrennstoff|kombidämpfer|kombidaempfer|salamander|produktionsgeräte|produktionsgeraete/.test(s))return'Geraetekunde';
    if(/materialkunde|kochgeschirr|handwerkzeug|messer|pfannenmaterial|messerpflege|pfannenauswahl/.test(s))return'Materialkunde';
    if(/hygiene|allergen|lebensmittelsicher|haccp|reklamation|jugendschutz|kontamination/.test(s))return'Hygiene';
    if(/kalkulation|rechnen|wareneinsatz|kosten|ausbeute|teigausbeute|produktionsrechnung|backstuben-kalkulation|konditorei-kalkulation/.test(s))return'Kalkulation';
    if(/personal|mitarbeiter|führung|leitung|passführung|produktionsleitung|schicht|team|organisation/.test(s))return'Personal';
    if(/fischkunde|kabeljau|lachs|seezunge|plattfisch|rundfisch|fischfond|fischfrische/.test(s))return'Fischkunde';
    if(/kräuterkunde|gewürzkunde|salbei|basilikum|rosmarin|thymian|dill|estragon|kerbel|schnittlauch|petersilie|minze|muskat|safran|kreuzkümmel|wacholder|fines herbes/.test(s))return'KraeuterGewuerze';
    if(/warenkunde|obst|gemüse|fleischkunde|fisch|eier|frische|lagerung|reifung|filet/.test(s))return'Warenkunde';
    if(/sauce|holland|béarn|bech|velout|jus|duxelles|consomm|fonds/.test(s))return'Saucen';
    if(/menü|service|tellerservice|französischer service|russischer service/.test(s))return'MenueService';
    if(/regionalküche|mault|spätz|pfefferpotthast|labskaus|schäufele|dibbelabbes|rheinischer/.test(s))return'Region';
    if(/weltküche|paella|irish|moussaka|nasi|biryani|gulasch|bouillabaisse|risotto/.test(s))return'Welt';
    if(/frühstück|croissant|konfitüre/.test(s))return'Fruehstueck';
    if(/küchentechnik|arbeitsablauf|grundablauf|garverfahren|fachbegriffe|anrichteweise|anrichten|tranch|pochier|panier/.test(s))return'Technik';
    if(/gericht|zutat|klassische garnitur|was fehlt|was gehört|klassische küche/.test(s))return'Gerichte';
    return'Sonstiges';
  }
  function isQuestionEnabled(q){const id=classify(q);return settings.topics?.[id]!==false}
  async function init(){
    try{settings={...defaults(),...(await window.KarriereStorage?.loadSettings?.()||{})};settings.topics={...defaults().topics,...(settings.topics||{})}}catch(e){}
    buildUI();bindSecretGesture();return settings;
  }
  function buildUI(){
    if($('#adminPinOverlay'))return;
    const el=document.createElement('div');
    el.innerHTML=`
      <div id="adminPinOverlay" class="overlay admin-pin-overlay hidden"><div class="admin-pin-card"><span class="eyebrow">GEHEIMER BEREICH</span><h2>Admin-Zugang</h2><p>PIN eingeben</p><input id="adminPinInput" inputmode="numeric" pattern="[0-9]*" maxlength="8" autocomplete="off" aria-label="Admin PIN"><div class="admin-pin-actions"><button id="adminPinCancel" class="secondary-btn">Abbrechen</button><button id="adminPinOk" class="primary-btn">Öffnen</button></div><small id="adminPinMsg"></small></div></div>
      <div id="adminModal" class="overlay admin-overlay hidden"><div class="admin-sheet"><header><div><span class="eyebrow">KARRIERELEITER · GEHEIMER BEREICH</span><h2>Administration</h2></div><button id="adminClose" class="icon-btn" aria-label="Schließen">×</button></header>
        <nav class="admin-tabs"><button class="active" data-admin-tab="settings">Voreinstellungen</button><button data-admin-tab="database">Datenbanken</button><button data-admin-tab="stats">Auswertungen</button></nav>
        <section class="admin-panel active" data-admin-panel="settings"><div class="admin-panel-head"><div><h3>Fachgebiete</h3><p>Nur aktivierte Fachgebiete kommen in den Fragenpool. Die Berufswahl am Start bleibt zusätzlich wirksam.</p></div><div class="admin-select-actions"><button id="topicsAll">Alle</button><button id="topicsNone">Keine</button></div></div><div id="topicGrid" class="topic-grid"></div><div class="admin-save-row"><span id="topicCount"></span><button id="saveAdminSettings" class="primary-btn compact">Speichern</button></div></section>
        <section class="admin-panel" data-admin-panel="database"><div class="db-grid"><article><span>LOKAL</span><h3>IndexedDB</h3><b id="adminIdbStatus">Prüfen…</b><small id="adminIdbDetail"></small></article><article><span>ONLINE</span><h3>Supabase</h3><b id="adminSupabaseStatus">nicht verbunden</b><small>Presence · Challenge · Ergebnis-Sync</small></article><article><span>SYNC</span><h3>Outbox</h3><b id="adminOutboxCount">0</b><small>noch nicht synchronisierte Datensätze</small></article></div><div class="db-actions"><button id="adminDbCheck" class="secondary-btn">Datenbanken prüfen</button><button id="adminSyncNow" class="primary-btn">Jetzt synchronisieren</button></div><div id="adminDbLog" class="admin-log">Bereit.</div></section>
        <section class="admin-panel" data-admin-panel="stats"><div class="admin-stats-toolbar"><div><h3>Benutzer & Lernstatistik</h3><p>Lokal gespeichert; bei berechtigter Supabase-Verbindung werden zentrale Daten ergänzt.</p></div><button id="adminRefreshStats" class="secondary-btn compact">Aktualisieren</button></div><div id="adminStatsKpis" class="admin-kpis"></div><div class="admin-stats-grid"><div><h4>Benutzer</h4><div id="adminUserTable" class="admin-table-wrap"></div></div><div><h4>Häufig falsch</h4><div id="adminWrongTable" class="admin-table-wrap"></div></div></div><div class="adaptive-admin-box"><h4>Adaptiver Lernstand dieses Geräts</h4><div id="adminAdaptiveModel" class="adaptive-admin-list"></div></div></section>
      </div></div>`;
    while(el.firstElementChild)document.body.appendChild(el.firstElementChild);
    root=$('#adminModal');renderTopicGrid();
    $('#adminPinCancel').onclick=closePin;$('#adminPinOk').onclick=verifyPin;$('#adminPinInput').addEventListener('keydown',e=>{if(e.key==='Enter')verifyPin()});$('#adminClose').onclick=()=>root.classList.add('hidden');
    document.querySelectorAll('[data-admin-tab]').forEach(b=>b.onclick=()=>switchTab(b.dataset.adminTab));
    $('#topicsAll').onclick=()=>setAllTopics(true);$('#topicsNone').onclick=()=>setAllTopics(false);$('#saveAdminSettings').onclick=saveSettingsFromUI;
    $('#adminDbCheck').onclick=refreshDb;$('#adminSyncNow').onclick=syncNow;$('#adminRefreshStats').onclick=refreshStats;
  }
  function renderTopicGrid(){const g=$('#topicGrid');if(!g)return;g.innerHTML=TOPICS.map(([id,label])=>`<label class="topic-toggle"><input type="checkbox" data-topic="${id}" ${settings.topics?.[id]!==false?'checked':''}><span><b>${label}</b><small>${topicDescription(id)}</small></span></label>`).join('');g.querySelectorAll('input').forEach(x=>x.onchange=updateTopicCount);updateTopicCount()}
  function topicDescription(id){return({Hygiene:'Hygiene, Allergene, Lebensmittelsicherheit',Temperatur:'Kerntemperatur, Thermometer, Kühlkette, Messpraxis und Gargrade',Geraetekunde:'Fritteuse, Backofen, Mikrowelle, Gas, Elektro, Induktion und weitere Wärmegeräte',Materialkunde:'Messer, Pfannen, Töpfe, Werkzeuge, Materialien',Warenkunde:'Obst, Gemüse, Fleisch, Lagerung',Fischkunde:'Rundfisch, Plattfisch, Frische, Filetieren, Fond und Garverfahren',KraeuterGewuerze:'Kräuter erkennen, klassische Verwendung, Gewürze und Würzprofile',Kalkulation:'Wareneinsatz, Mengen, Ausbeute, Rechnen',Personal:'Mitarbeiter, Führung, Organisation, Pass',Gerichte:'Zutaten, Garnituren, klassische Gerichte',Saucen:'Grundsaucen, Ableitungen, Fonds',MenueService:'Menüfolgen und Servicearten',Region:'Deutsche regionale Spezialitäten',Welt:'Internationale Landesküche',Technik:'Garverfahren, Fachbegriffe, Arbeitsabläufe',Fruehstueck:'Frühstücksarten und Bestandteile',Sonstiges:'weitere passende Fragen'})[id]||''}
  function updateTopicCount(){const all=[...document.querySelectorAll('#topicGrid input')],n=all.filter(x=>x.checked).length;$('#topicCount').textContent=`${n} von ${all.length} Fachgebieten aktiv`}
  function setAllTopics(on){document.querySelectorAll('#topicGrid input').forEach(x=>x.checked=on);updateTopicCount()}
  async function saveSettingsFromUI(){const inputs=[...document.querySelectorAll('#topicGrid input')],n=inputs.filter(x=>x.checked).length;if(!n){$('#topicCount').textContent='Mindestens ein Fachgebiet auswählen.';return}const topics={};inputs.forEach(x=>topics[x.dataset.topic]=x.checked);settings={...settings,topics};await window.KarriereStorage?.saveSettings?.(settings);$('#topicCount').textContent+=` · gespeichert`;setTimeout(updateTopicCount,900)}
  function futuraRoles(){const ctx=window.KCFuturaModuleContext||{};const raw=ctx.roles||ctx.user?.roles||ctx.user?.role||[];return(Array.isArray(raw)?raw:[raw]).filter(Boolean).map(x=>String(x).toLowerCase())}
  function isFuturaAdmin(){const r=futuraRoles();return r.includes('admin')||r.includes('superadmin')||r.includes('super-admin')}
  async function requestAdminOpen(){if(isFuturaAdmin())return openAdmin();const msg=$('#adminPinMsg');const o=$('#adminPinOverlay');if(o){o.classList.remove('hidden');$('#adminPinInput')?.classList.add('hidden');$('#adminPinOk')?.classList.add('hidden');if(msg)msg.textContent='Zugriff nur mit FUTURA-Rolle Admin/Superadmin.'}return false}
  function bindSecretGesture(){const target=$('#startScreen h1');if(!target)return;target.setAttribute('title','');const start=e=>{if(e.pointerType==='mouse'&&e.button!==0)return;clearTimeout(pressTimer);pressTimer=setTimeout(requestAdminOpen,5000)};const cancel=()=>{clearTimeout(pressTimer);pressTimer=null};target.addEventListener('pointerdown',start);['pointerup','pointerleave','pointercancel'].forEach(ev=>target.addEventListener(ev,cancel));}
  function openPin(){const o=$('#adminPinOverlay');o.classList.remove('hidden');const inp=$('#adminPinInput');inp.value='';$('#adminPinMsg').textContent='';setTimeout(()=>inp.focus(),60)}
  function closePin(){$('#adminPinOverlay').classList.add('hidden')}
  function verifyPin(){const v=$('#adminPinInput').value;if(v===String(settings.pin||'1234')){closePin();openAdmin()}else{$('#adminPinMsg').textContent='PIN nicht korrekt.';$('#adminPinInput').select()}}
  async function openAdmin(){root.classList.remove('hidden');switchTab('settings');renderTopicGrid();await refreshDb();await refreshStats()}
  function switchTab(id){document.querySelectorAll('[data-admin-tab]').forEach(b=>b.classList.toggle('active',b.dataset.adminTab===id));document.querySelectorAll('[data-admin-panel]').forEach(p=>p.classList.toggle('active',p.dataset.adminPanel===id));if(id==='database')refreshDb();if(id==='stats')refreshStats()}
  async function refreshDb(){const st=await window.KarriereStorage?.status?.();$('#adminIdbStatus').textContent=st?.ok?'bereit · verschlüsselt':'Fallback · verschlüsselt';const counts=await window.KarriereStorage?.counts?.();$('#adminIdbDetail').textContent=counts?`${counts.attempts} Antworten · ${counts.sessions} Sitzungen · ${st?.engine||'Speicher'} · AES-GCM`:st?.db||'';const out=counts?.outbox||0;$('#adminOutboxCount').textContent=String(out);const online=window.KarriereOnline?.isConnected?.();$('#adminSupabaseStatus').textContent=online?'verbunden · verschlüsselt':'nicht verbunden';const localLabel=st?.ok?'IndexedDB aktiv; Nutzdaten AES-GCM verschlüsselt.':'Verschlüsselter lokaler Fallback aktiv; Spielbetrieb bleibt möglich.';const cryptoMode=window.KarriereCrypto?.getMode?.()||'unbekannt';$('#adminDbLog').textContent=(online?`${localLabel} Supabase-Realtime verbunden; persistierte Sync-Payloads verschlüsselt.`:`${localLabel} Supabase wird über Futura/Bridge verbunden.`)+` Schlüsselmodus: ${cryptoMode}.`}
  async function syncNow(){const log=$('#adminDbLog');log.textContent='Synchronisation läuft…';try{await window.KarriereOnline?.syncOutbox?.();await refreshDb();log.textContent='Synchronisation abgeschlossen bzw. Outbox geprüft.'}catch(e){log.textContent='Synchronisation nicht möglich: '+String(e.message||e)}}
  async function refreshStats(){
    const attempts=await window.KarriereStorage?.allAttempts?.(3000)||[],sessions=await window.KarriereStorage?.allSessions?.(1000)||[];
    let remote=[],remoteSessions=[];try{remote=await window.KarriereOnline?.fetchAdminResults?.()||[];remoteSessions=await window.KarriereOnline?.fetchAdminSessions?.()||[]}catch(e){}
    const attemptMap=new Map();for(const a of attempts){const k=a.localAttemptId||`local:${a.id||Math.random()}`;attemptMap.set(k,a)}for(const r0 of remote){const r=normalizeRemote(r0),k=r.localAttemptId||`remote:${r.user_id}:${r.question_key}:${r.created_at}`;if(!attemptMap.has(k))attemptMap.set(k,r)}const merged=[...attemptMap.values()];
    const sessionMap=new Map();for(const x of sessions){const k=x.localSessionId||x.sessionId||`local-session:${x.id||Math.random()}`;sessionMap.set(k,x)}for(const r of remoteSessions){const k=r.local_session_id||`remote-session:${r.user_id}:${r.created_at}`;if(!sessionMap.has(k))sessionMap.set(k,normalizeRemoteSession(r))}const allSessions=[...sessionMap.values()];
    const groups=new Map();
    for(const a of merged){const key=a.playerId||a.user_id||a.playerName||'local',name=a.playerName||a.player_name||(key==='local'?'Lokaler Spieler':String(key).slice(0,8));if(!groups.has(key))groups.set(key,{name,n:0,good:0,ms:0,maxRank:0,sessionMs:0,sessions:0,examAll:0,examPassed:0});const g=groups.get(key);g.n++;if(a.correct)g.good++;g.ms+=Number(a.responseMs||a.response_ms||0);g.maxRank=Math.max(g.maxRank,Number(a.rank||0))}
    for(const x of allSessions){const key=x.playerId||x.user_id||x.playerName||'local',name=x.playerName||x.player_name||(key==='local'?'Lokaler Spieler':String(key).slice(0,8));if(!groups.has(key))groups.set(key,{name,n:0,good:0,ms:0,maxRank:0,sessionMs:0,sessions:0,examAll:0,examPassed:0});const g=groups.get(key);g.sessionMs+=Number(x.durationMs||x.duration_ms||0);g.sessions++;g.maxRank=Math.max(g.maxRank,Number(x.rank||0));if((x.sessionType||x.session_type)==='exam'){g.examAll++;if(x.passed===true)g.examPassed++}}
    const wrong=new Map();for(const a of merged.filter(x=>!x.correct&&!x.repeat&&!x.repeat_attempt)){const k=a.questionKey||a.question_key||a.questionId||'?';wrong.set(k,(wrong.get(k)||0)+1)}
    const total=merged.length,good=merged.filter(x=>x.correct).length,avg=total?merged.reduce((n,a)=>n+Number(a.responseMs||a.response_ms||0),0)/total:0,exams=allSessions.filter(x=>(x.sessionType||x.session_type)==='exam'),passed=exams.filter(x=>x.passed===true).length,quicks=merged.filter(x=>x.quick===true),quickGood=quicks.filter(x=>x.correct).length;
    $('#adminStatsKpis').innerHTML=`<article><span>Antworten</span><b>${total}</b></article><article><span>Trefferquote</span><b>${total?Math.round(good/total*100):0}%</b></article><article><span>Ø Antwortzeit</span><b>${(avg/1000).toFixed(1)} s</b></article><article><span>Prüfungen bestanden</span><b>${passed}/${exams.length}</b></article><article><span>Quick-Challenges</span><b>${quickGood}/${quicks.length}</b></article>`;
    $('#adminUserTable').innerHTML=table(['Benutzer','Fragen','Richtig','Ø Antwort','Lernzeit','Prüfungen','höchster Rang'],[...groups.values()].sort((a,b)=>b.maxRank-a.maxRank||b.good-a.good).map(g=>[g.name,g.n,`${g.n?Math.round(g.good/g.n*100):0}%`,`${(g.ms/Math.max(1,g.n)/1000).toFixed(1)} s`,fmtDuration(g.sessionMs),g.examAll?`${g.examPassed}/${g.examAll}`:'—',rankName(g.maxRank)]));
    const catalog=new Map((window.KarriereCatalog||[]).map(q=>[q.id,q]));$('#adminWrongTable').innerHTML=table(['Frage','Fachgebiet','Fehler'],[...wrong.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,n])=>{const q=catalog.get(k);return[q?.title||k,q?topicLabel(classify(q)):'—',n]}));
    const adaptive=window.KarriereAdaptive?.recommendations?.(8,{maxRank:6})||[];const am=$('#adminAdaptiveModel');if(am)am.innerHTML=adaptive.length?adaptive.map(x=>`<span><b>${esc(x.label)}</b><i>${Math.round(x.score)}%</i><em>${esc(x.level)}</em></span>`).join(''):'<p>Noch zu wenig Lerndaten.</p>';
  }
  function normalizeRemote(r){return{...r,playerId:r.playerId||r.user_id,playerName:r.playerName||r.player_name,questionKey:r.questionKey||r.question_key,responseMs:r.responseMs??r.response_ms,localAttemptId:r.localAttemptId||r.local_attempt_id,repeat:r.repeat??r.repeat_attempt,quick:r.quick===true||r.quick_challenge===true}}
  function normalizeRemoteSession(r){return{...r,playerId:r.playerId||r.user_id,playerName:r.playerName||r.player_name,localSessionId:r.localSessionId||r.local_session_id,sessionType:r.sessionType||r.session_type,durationMs:r.durationMs??r.duration_ms}}
  function topicLabel(id){return TOPICS.find(x=>x[0]===id)?.[1]||id}
  function fmtDuration(ms){const m=Math.round(Number(ms||0)/60000);if(m<60)return`${m} min`;const h=Math.floor(m/60),r=m%60;return`${h} h ${r} min`}
  function rankName(i){return['Praktikant','Azubi','Jungkoch','Koch','Meister','Küchenchef','Küchendirektor'][Math.max(0,Math.min(6,Number(i)||0))]}
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
  function table(head,rows){return`<table><thead><tr>${head.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${head.length}">Noch keine Daten.</td></tr>`}</tbody></table>`}
  window.KarriereAdmin={init,isQuestionEnabled,classify,getSettings:()=>JSON.parse(JSON.stringify(settings)),open:requestAdminOpen,refreshStats,isFuturaAdmin};
})();
