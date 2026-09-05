(()=>{
'use strict';
const VERSION='1.0.0';
const MARKER='KC_FUTURA_DIDAKTIK_CORE_V1';
const CONFIDENCE=[
  {id:'sicher',label:'Sicher',weight:1,detail:'Ich wusste die Antwort.'},
  {id:'eher_sicher',label:'Eher sicher',weight:.85,detail:'Ich war ziemlich sicher.'},
  {id:'unsicher',label:'Unsicher',weight:.55,detail:'Ich musste deutlich überlegen.'},
  {id:'geraten',label:'Geraten',weight:.25,detail:'Ich habe im Wesentlichen geraten.'}
];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const normalize=s=>String(s??'').toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9äöü\s/-]/g,' ').replace(/\s+/g,' ').trim();
function termMatch(text,term){
  const t=normalize(text),x=normalize(term);
  if(!x)return false;
  return t.includes(x);
}
function scoreExplanation(text,rubric={}){
  const groups=Array.isArray(rubric.groups)?rubric.groups:[];
  const matched=[];
  groups.forEach((g,i)=>{
    const terms=Array.isArray(g)?g:(g?.terms||[]);
    if(terms.some(term=>termMatch(text,term)))matched.push(i);
  });
  const minGroups=Math.max(1,Math.min(groups.length||1,Number(rubric.minGroups||Math.ceil((groups.length||1)*.6))));
  return {ok:matched.length>=minGroups,matched:matched.length,total:groups.length,minGroups};
}
function needsConsolidation(correct,confidence){return !correct||confidence==='unsicher'||confidence==='geraten'}
function resultMeta(q,{correct,confidence}={}){
  const c=CONFIDENCE.find(x=>x.id===confidence)||null;
  return {
    version:VERSION,
    marker:MARKER,
    mechanism:q?.didaktik||q?.type||'standard',
    competencyStage:q?.competencyStage||'Wissen',
    confidence:confidence||null,
    confidenceLabel:c?.label||null,
    confidenceWeight:c?.weight??null,
    needsConsolidation:needsConsolidation(!!correct,confidence)
  };
}
function injectStyles(){
  if(document.getElementById('kcDidaktikStyles'))return;
  const s=document.createElement('style');s.id='kcDidaktikStyles';s.textContent=`
  .kc-confidence-backdrop{position:fixed;inset:0;z-index:10080;background:#0e1820b8;display:grid;place-items:center;padding:18px}
  .kc-confidence-card{width:min(680px,96vw);background:#fffdf9;border:1px solid #ccbda8;border-radius:18px;padding:18px;box-shadow:0 22px 60px #0005;color:#1e2a30}
  .kc-confidence-card h3{margin:0 0 5px;font:800 1.12rem/1.2 Georgia,serif}.kc-confidence-card p{margin:0 0 14px;color:#52616a}
  .kc-confidence-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.kc-confidence-btn{min-height:72px;border:1px solid #b9c7cf;border-radius:13px;background:#f8fbfc;padding:10px;text-align:left;font:inherit;cursor:pointer}.kc-confidence-btn strong,.kc-confidence-btn span{display:block}.kc-confidence-btn strong{font-size:.94rem}.kc-confidence-btn span{font-size:.72rem;color:#60727d;margin-top:3px}.kc-confidence-btn:focus-visible{outline:3px solid #2e7cb8;outline-offset:2px}
  .kc-explain-wrap{display:grid;gap:10px;width:100%}.kc-explain-card{border:1px solid #cdbda8;border-radius:16px;background:#fffdf9;padding:14px}.kc-explain-card h3{margin:0 0 6px;font:800 1rem/1.2 Georgia,serif}.kc-explain-card p{margin:0 0 10px;color:#52616a}.kc-explain-text{width:100%;min-height:150px;resize:vertical;border:1px solid #aebdc7;border-radius:12px;padding:12px;font:inherit;line-height:1.45;box-sizing:border-box}.kc-explain-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.kc-explain-check{border:0;border-radius:11px;background:#174f72;color:white;padding:11px 16px;font-weight:800;min-height:44px}.kc-explain-status{font-size:.76rem;font-weight:800;color:#52616a}.kc-explain-model{border-left:4px solid #4b9667;background:#edf7f0;border-radius:9px;padding:9px 11px;font-size:.78rem;line-height:1.4}
  @media(max-width:620px){.kc-confidence-grid{grid-template-columns:1fr}.kc-confidence-btn{min-height:58px}.kc-explain-text{min-height:120px}}
  `;document.head.appendChild(s);
}
function askConfidence({question}={}){
  injectStyles();
  return new Promise(resolve=>{
    document.querySelector('.kc-confidence-backdrop')?.remove();
    const root=document.createElement('div');root.className='kc-confidence-backdrop';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-labelledby','kcConfidenceTitle');
    root.innerHTML=`<section class="kc-confidence-card"><h3 id="kcConfidenceTitle">Wie sicher warst du?</h3><p>${esc(question?.title||'Diese Antwort')} · Das beeinflusst nur deinen Lernplan, nicht die bereits erzielten Punkte.</p><div class="kc-confidence-grid">${CONFIDENCE.map(c=>`<button type="button" class="kc-confidence-btn" data-confidence="${c.id}"><strong>${c.label}</strong><span>${c.detail}</span></button>`).join('')}</div></section>`;
    const finish=id=>{root.remove();resolve(id)};
    root.querySelectorAll('[data-confidence]').forEach(b=>b.addEventListener('click',()=>finish(b.dataset.confidence),{once:true}));
    root.addEventListener('keydown',e=>{if(e.key==='Escape')finish('unsicher')});
    document.body.appendChild(root);setTimeout(()=>root.querySelector('button')?.focus(),0);
  });
}
function renderExplain(q,{area,state,resolve}={}){
  injectStyles();if(!area)throw new Error('didaktik explain: question area fehlt');
  const rubric=q.rubric||{};
  const w=document.createElement('div');w.className='kc-explain-wrap';
  w.innerHTML=`<section class="kc-explain-card"><h3>Erklär es einem Azubi</h3><p>${esc(q.explainInstruction||'Formuliere die fachlich entscheidenden Punkte in eigenen Worten. Stichpunkte sind erlaubt.')}</p><textarea class="kc-explain-text" maxlength="1200" aria-label="Freie Erklärung" placeholder="Deine Erklärung …"></textarea><div class="kc-explain-actions"><button type="button" class="kc-explain-check">Antwort prüfen</button><span class="kc-explain-status" aria-live="polite">Noch nicht bewertet</span></div><div class="kc-explain-model" hidden></div></section>`;
  const text=w.querySelector('textarea'),btn=w.querySelector('.kc-explain-check'),status=w.querySelector('.kc-explain-status'),model=w.querySelector('.kc-explain-model');
  btn.onclick=()=>{
    if(state?.answered)return;
    const value=text.value.trim();if(value.length<18){status.textContent='Bitte etwas ausführlicher erklären.';text.focus();return}
    const score=scoreExplanation(value,rubric);status.textContent=`${score.matched} von ${score.total} Kernpunkten erkannt · benötigt: ${score.minGroups}`;
    model.hidden=false;model.innerHTML=`<strong>Fachlicher Sollkern:</strong> ${esc(q.modelAnswer||q.explain||'Die wesentlichen Fachpunkte müssen korrekt benannt und miteinander verknüpft werden.')}`;
    text.disabled=true;btn.disabled=true;if(state)state.answered=true;
    resolve?.(score.ok);
  };
  area.appendChild(w);
}
function selfTest(){
  const a=scoreExplanation('Ei mit Pecorino verrühren. Mit Pastawasser emulgieren und nicht zu Rührei stocken lassen.',{groups:[['ei'],['pecorino'],['pastawasser','emulgieren'],['nicht stocken','rührei']],minGroups:3});
  const b=needsConsolidation(true,'geraten')===true&&needsConsolidation(true,'sicher')===false&&needsConsolidation(false,'sicher')===true;
  return {ok:a.ok&&a.matched>=3&&b,version:VERSION,confidence:CONFIDENCE.length,explainScore:a};
}
window.KarriereDidaktik={version:VERSION,marker:MARKER,confidenceOptions:CONFIDENCE,askConfidence,scoreExplanation,needsConsolidation,resultMeta,renderExplain,selfTest};
})();
