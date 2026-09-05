import {readFileSync,writeFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const training=readFileSync(new URL('training-video/app.js',root),'utf8');
const academy=readFileSync(new URL('academy/app.js',root),'utf8');
const between=(source,start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));

const trainingContext={};
vm.runInNewContext(`${between(training,'const quick=[','window.KCFuturaGlobalSearchItems=')}globalThis.result={quick,advanced,tasks}`,trainingContext);
const academyContext={};
vm.runInNewContext(`${between(academy,'const chars={','const characterOverrides=')}\n${between(academy,'const modules={','const academySearchText=')}globalThis.result={chars,modules}`,academyContext);

const text=value=>{try{return typeof value==='function'?value('Teilnehmer'):String(value||'')}catch{return''}};
const trainingItems=[
 ...trainingContext.result.quick.map((item,index)=>({kind:'training',module:'quick',targetIndex:index,part:'Teil 1',section:'Grundlagen und Verkauf',chapter:index+1,title:item.title,text:`${item.text} ${item.quiz?.question||''} ${(item.quiz?.answers||[]).join(' ')} ${item.quiz?.repeat||''}`,tip:item.tip||''})),
 ...trainingContext.result.advanced.map((item,index)=>({kind:'training',module:'advanced',targetIndex:index,part:'Teil 1',section:'Sonderfunktionen',chapter:index+1,title:item.title,text:`${item.text} ${item.quiz?.question||''} ${(item.quiz?.answers||[]).join(' ')} ${item.quiz?.repeat||''}`,tip:item.tip||''})),
 ...trainingContext.result.tasks.map((item,index)=>({kind:'training',module:'practice',targetIndex:index,part:'Teil 1',section:'Praxisprüfung',chapter:index+1,title:item.title,text:item.text,tip:''}))
];
const academyItems=Object.entries(academyContext.result.modules).map(([id,item])=>({kind:'academy',module:id,part:'Teil 2',section:`Folge ${item.episode||''}`,chapter:item.episode||0,title:item.title,text:`${item.subtitle||''} ${item.learning||''} ${(item.cast||[]).join(' ')} ${(item.scenes||[]).map(scene=>[scene.who,text(scene.text),scene.question,(scene.choices||[]).map(choice=>choice[0]).join(' '),scene.good,scene.guest].filter(Boolean).join(' ')).join(' ')}`,tip:(item.scenes||[]).map(scene=>scene.tip||'').filter(Boolean).join(' ')}));
const characterItems=Object.entries(academyContext.result.chars).map(([id,item])=>({kind:'academy',module:'',part:'Teil 2',section:'Figuren und Avatare',chapter:0,title:item.name||id,text:`${item.role||''} ${text(item.intro)} Avatar Figur Begleitung`,tip:''}));
const output=`/* Automatisch erzeugter Offline-Suchkatalog · Beta 2.6.15 */\nwindow.KCFuturaBundledSearchCatalog=${JSON.stringify([...trainingItems,...academyItems,...characterItems])};\n`;
writeFileSync(new URL('shared/global-search-catalog.js',root),output,'utf8');
console.log(`Globaler Suchkatalog: ${trainingItems.length+academyItems.length+characterItems.length} Einträge`);
