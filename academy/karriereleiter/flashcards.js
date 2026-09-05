(function(){
'use strict';
const KEY='karriereleiter_flashcards_v20';
const PURPOSE='flashcards:leitner-v1';
const MAX=1200;
async function localLoad(){try{const raw=localStorage.getItem(KEY);if(!raw)return[];const enc=JSON.parse(raw);const value=await window.KarriereCrypto.decrypt(enc,PURPOSE);return Array.isArray(value)?value:[]}catch(e){return[]}}
async function localSave(items){try{const enc=await window.KarriereCrypto.encrypt(items.slice(0,MAX),PURPOSE);localStorage.setItem(KEY,JSON.stringify(enc));return true}catch(e){return false}}
function futuraStore(){const s=window.KCFutura?.learningStore;return s&&typeof s.get==='function'&&typeof s.set==='function'?s:null}
async function list(){const fs=futuraStore();if(fs){try{const v=await fs.get('karriereleiter.flashcards');if(Array.isArray(v))return v}catch(e){}}return localLoad()}
async function save(items){items=Array.isArray(items)?items.slice(0,MAX):[];const local=await localSave(items);const fs=futuraStore();if(fs){try{await fs.set('karriereleiter.flashcards',items)}catch(e){}}return local}
async function upsert(card){if(!card?.id)return false;let items=await list();const prev=items.find(x=>x.id===card.id)||{};const merged={box:1,reps:0,correctStreak:0,createdAt:new Date().toISOString(),dueAt:new Date().toISOString(),...prev,...card,updatedAt:new Date().toISOString()};items=[merged,...items.filter(x=>x.id!==card.id)].slice(0,MAX);return save(items)}
async function remove(id){return save((await list()).filter(x=>x.id!==id))}
window.KarriereFlashcardsStore={list,save,upsert,remove,mode:()=>futuraStore()?'futura-learning-store':'encrypted-local'};
})();
