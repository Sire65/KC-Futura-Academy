(()=>{
'use strict';
const STORAGE_KEY='kcFuturaSpokenTextOverridesV1';
const REGISTRY_KEY='kcFuturaSpokenTextRegistryV1';
const safeParse=(v,f)=>{try{return JSON.parse(v)}catch{return f}};
let overrides=safeParse(localStorage.getItem(STORAGE_KEY)||'{}',{});
let registry=safeParse(localStorage.getItem(REGISTRY_KEY)||'{}',{});
const normalize=v=>String(v??'').replace(/\s+/g,' ').trim();
function hash(value){let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function keyFor(text,key=''){return key||`auto:${hash(normalize(text))}`}
function register({key='',text='',label='',group='Weitere gesprochene Texte',speaker='',source=''}){
 const resolvedKey=keyFor(text,key);const clean=String(text??'');
 if(!registry[resolvedKey]||registry[resolvedKey].defaultText!==clean){registry[resolvedKey]={key:resolvedKey,label:label||resolvedKey,group,speaker,source,defaultText:clean,updatedAt:new Date().toISOString()};localStorage.setItem(REGISTRY_KEY,JSON.stringify(registry))}
 return resolvedKey;
}
function resolve(text,meta={}){const key=register({...meta,text});return Object.prototype.hasOwnProperty.call(overrides,key)?String(overrides[key]):String(text??'')}
function set(key,value){overrides[key]=String(value??'');localStorage.setItem(STORAGE_KEY,JSON.stringify(overrides));return overrides[key]}
function reset(key){delete overrides[key];localStorage.setItem(STORAGE_KEY,JSON.stringify(overrides))}
function resetAll(){overrides={};localStorage.setItem(STORAGE_KEY,'{}')}
function list(){return Object.values(registry).map(item=>({...item,text:Object.prototype.hasOwnProperty.call(overrides,item.key)?overrides[item.key]:item.defaultText,changed:Object.prototype.hasOwnProperty.call(overrides,item.key)})).sort((a,b)=>a.group.localeCompare(b.group,'de')||a.label.localeCompare(b.label,'de'))}
function seed(rows=[]){rows.forEach(register);return list()}
window.KCSpokenTextCore={version:'1.0.0',register,resolve,set,reset,resetAll,list,seed,keyFor};
})();
