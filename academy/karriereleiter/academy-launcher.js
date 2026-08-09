(()=>{
'use strict';
const VERSION='1.3.0';
const MODULE_ID='karriereleiter';
const MODULE_URL='karriereleiter/index.html';
let overlay=null;
const enc=new TextEncoder(),dec=new TextDecoder();
const parse=(v,f=null)=>{try{return JSON.parse(v)||f}catch{return f}};
function secure(){return window.KCSecureStorage||null}
async function profile(){
  try{await secure()?.ready}catch{}
  const p=parse(secure()?.getItem('kcAcademyParticipantProfileV1'),{})||{};
  const name=p.displayName||secure()?.getItem('kcAcademyName')||sessionStorage.getItem('kcAcademyName')||'Teilnehmer/in';
  return {id:p.id||null,name,professions:Array.isArray(p.professions)&&p.professions.length?p.professions:['Küche']};
}
function roles(){
  const raw=window.KC_FUTURA_ROLES||window.KCFuturaCurrentUser?.roles||window.KCFuturaCurrentUser?.role||['user'];
  return (Array.isArray(raw)?raw:[raw]).filter(Boolean).map(x=>String(x).toLowerCase());
}
const cryptoAdapter={
  async encryptJson(value,meta={}){
    const s=secure();if(!s?.encryptBytes)throw new Error('KC Secure Storage nicht bereit');
    await s.ready;const context=`KARRIERELEITER-${String(meta.purpose||'data').toUpperCase().replace(/[^A-Z0-9:_-]/g,'-')}`;
    return {__kc_futura_secure:1,...await s.encryptBytes(enc.encode(JSON.stringify(value)),context)};
  },
  async decryptJson(envelope){
    if(envelope==null)return envelope;if(!envelope?.cipher)return envelope;
    const s=secure();if(!s?.decryptBytes)throw new Error('KC Secure Storage nicht bereit');
    await s.ready;const buf=await s.decryptBytes(envelope);return JSON.parse(dec.decode(buf));
  }
};
const speechAdapter={
  speak(text,opts={}){
    if(window.KCVoiceProvider?.speak){try{return window.KCVoiceProvider.speak(text,opts)}catch{}}
    if(!('speechSynthesis'in window)){opts.onend?.();return Promise.resolve()}
    return new Promise(resolve=>{try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(String(text||''));u.lang=opts.lang||'de-DE';u.rate=1;u.onend=()=>{opts.onend?.();resolve()};u.onerror=()=>{opts.onend?.();resolve()};speechSynthesis.speak(u)}catch{opts.onend?.();resolve()}});
  },
  stop(){try{window.KCVoiceProvider?.stop?.()}catch{}try{speechSynthesis.cancel()}catch{}}
};
const learningStore={
  async get(key){try{await secure()?.ready;return parse(secure()?.getItem(`kcKarriereleiterLearning:${key}`),null)}catch{return null}},
  async set(key,value){try{await secure()?.ready;secure()?.setItem(`kcKarriereleiterLearning:${key}`,JSON.stringify(value));window.KCSupabaseAdapter?.uploadSnapshot?.('karriereleiter_learning',{key,value},{participantName:(await profile()).name,module:MODULE_ID}).catch(()=>{});return true}catch{return false}}
};
async function context(){const p=await profile();const r=roles();return {moduleId:MODULE_ID,version:VERSION,user:{id:p.id,name:p.name,professions:p.professions,roles:r},profile:p,roles:r,cryptoAdapter,speechAdapter,learningStore,exitModule:closeModule}}
function ensureStyle(){if(document.querySelector('#kcKarriereleiterLauncherStyle'))return;const s=document.createElement('style');s.id='kcKarriereleiterLauncherStyle';s.textContent=`.kc-kl-launch{margin:14px 0 18px;border:1px solid #d8b56a;border-radius:18px;background:linear-gradient(135deg,#102d4c,#153f61);color:#fff;padding:16px 18px;display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;box-shadow:0 12px 28px #07152333}.kc-kl-launch-icon{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:#f0bd57;color:#10243a;font-size:30px}.kc-kl-launch h3{margin:0 0 4px;font-size:1.18rem}.kc-kl-launch p{margin:0;color:#dbe8f1;line-height:1.35}.kc-kl-launch small{display:block;margin-top:6px;color:#f3ce85}.kc-kl-launch button{border:0;border-radius:12px;background:#efb13c;color:#152132;font-weight:900;padding:12px 16px;cursor:pointer}.kc-kl-overlay{position:fixed;inset:0;z-index:100000;background:#06111ddd;display:grid;grid-template-rows:auto 1fr}.kc-kl-overlay[hidden]{display:none}.kc-kl-bar{display:flex;align-items:center;gap:12px;padding:8px 12px;background:#10243a;color:#fff;border-bottom:1px solid #5e7890}.kc-kl-bar b{flex:1}.kc-kl-bar button{border:1px solid #71879a;background:#17344e;color:#fff;border-radius:10px;padding:8px 12px;cursor:pointer}.kc-kl-frame{width:100%;height:100%;border:0;background:#071523}@media(max-width:760px){.kc-kl-launch{grid-template-columns:auto 1fr}.kc-kl-launch button{grid-column:1/-1;width:100%}.kc-kl-launch-icon{width:48px;height:48px}}`;document.head.appendChild(s)}
function makeOverlay(){if(overlay)return overlay;ensureStyle();overlay=document.createElement('div');overlay.className='kc-kl-overlay';overlay.hidden=true;overlay.innerHTML=`<div class="kc-kl-bar"><b>🎓 KC FUTURA · Karriereleiter</b><span>Fachwissen · Prüfung · Lernkarten</span><button type="button" data-kl-close>Zur Academy</button></div><iframe class="kc-kl-frame" title="KC FUTURA Karriereleiter" allow="autoplay"></iframe>`;document.body.appendChild(overlay);overlay.querySelector('[data-kl-close]').onclick=closeModule;return overlay}
async function openModule(){const o=makeOverlay(),frame=o.querySelector('iframe');window.KCFuturaModuleContext=await context();o.hidden=false;document.body.classList.add('modal-open');frame.src=`${MODULE_URL}?futura=1&v=${encodeURIComponent(VERSION)}&t=${Date.now()}`;try{speechAdapter.stop()}catch{}}
function closeModule(){if(!overlay)return true;const frame=overlay.querySelector('iframe');frame.src='about:blank';overlay.hidden=true;document.body.classList.remove('modal-open');return true}
function injectCard(){const home=document.querySelector('#screen .academy-home');if(!home||home.querySelector('[data-karriereleiter-launch]'))return;ensureStyle();const card=document.createElement('section');card.className='kc-kl-launch';card.dataset.karriereleiterLaunch='1';card.innerHTML=`<div class="kc-kl-launch-icon">🎓</div><div><h3>Karriereleiter · Fachwissen & Prüfung</h3><p>Interaktives Fachtraining mit 400 Fragen, Prüfungsvorbereitung, Lernkarten, Teilstücke-Puzzles und QUICK-Challenges.</p><small>Fortschritt und Lernkarten werden über FUTURA sicher gespeichert.</small></div><button type="button">Karriereleiter starten</button>`;card.querySelector('button').onclick=openModule;const intro=home.querySelector('.home-intro');(intro||home.firstElementChild)?.insertAdjacentElement('afterend',card)}
function injectTopButton(){const host=document.querySelector('.top-actions');if(!host||host.querySelector('[data-karriereleiter-top]'))return;const b=document.createElement('button');b.type='button';b.className='icon-btn';b.dataset.karriereleiterTop='1';b.title='Karriereleiter öffnen';b.setAttribute('aria-label','Karriereleiter öffnen');b.textContent='🎓';b.onclick=openModule;const dash=document.querySelector('#dashboardBtn');host.insertBefore(b,dash||host.firstChild)}
function scan(){injectTopButton();injectCard()}
new MutationObserver(scan).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('message',e=>{if(e?.data?.type==='KC_FUTURA_EXIT_MODULE'&&e.data.module===MODULE_ID)closeModule()});
window.KCFuturaKarriereleiter={version:VERSION,open:openModule,close:closeModule,context};scan();
})();
