(function(){
  const VERSION=2;
  const TOPIC_LABELS={Hygiene:'Hygiene',Temperatur:'Temperatur & Messkunde',Geraetekunde:'Gerätekunde',Materialkunde:'Materialkunde',Warenkunde:'Warenkunde',Fischkunde:'Fischkunde',KraeuterGewuerze:'Kräuter & Gewürze',Kalkulation:'Kalkulation',Personal:'Personal & Führung',Gerichte:'Gerichte',Saucen:'Saucen',MenueService:'Menü & Service',Region:'Regionalküche',Welt:'Weltküche',Technik:'Küchentechnik',Fruehstueck:'Frühstück',Sonstiges:'Fachwissen'};
  const FAMILIES=[
    ['temp-kernmessung',/kerntemperatur|einstichthermometer|messfühler|messfuehler|dickste stelle/i],['temp-gefluegel',/geflügel.*72|gefluegel.*72|geflügel.*durchgar|gefluegel.*durchgar/i],['temp-kuehlkette',/kühlkette|kuehlkette|kühlraum.*temperatur|kuehlraum.*temperatur/i],['temp-gargrad',/gargrad|rare|medium|durchgegart/i],['temp-teig',/teigtemperatur|gärtemperatur|gaertemperatur|hefetemperatur/i],['temp-schokolade',/temperier.*schokolade|kuvertüre.*temperatur|kuvertuere.*temperatur/i],
    ['workflow-wareneingang',/wareneingang|kühlware.*kontroll|lieferung.*temperatur/i],['workflow-hollandaise',/hollandaise.*arbeitsfolge|arbeitsablauf.*hollandaise/i],['workflow-jus',/jus.*produktionsfolge|arbeitsablauf.*jus/i],['workflow-allergen',/allergen.*bestellung|allergen.*arbeitsablauf/i],['errorhunt-hygiene',/fehlerbild|arbeitsplatz.*fehler|kühlraum.*fehler|servicebeginn.*führung/i],
    ['hollandaise',/hollandaise/i],['bearnaise',/béarnaise|bearnaise/i],['jus',/grand\s*jus|\bjus\b|demi[- ]?glace|glace de viande|fond brun/i],
    ['messer-ausbeinen',/ausbeinmesser|ausbeinen|knochen.*lösen/i],['messer-pflege',/wetzstahl|messerpflege|schneidkante/i],['messer-brot',/sägemesser|brotmesser|wellenschliff/i],
    ['induktion',/induktion/i],['gasherd',/gasherd|gasflamme/i],['fritteuse',/fritteuse|frittier/i],['mikrowelle',/mikrowelle/i],['backofen',/backofen|umluft|heißluft|ofenbeladung|backstabilität/i],['kombidaempfer',/kombidämpfer|kombidaempfer/i],
    ['caprese',/caprese|tomate.?mozzarella/i],['huehnerfrikassee',/hühnerfrikassee|huehnerfrikassee/i],['wiener-schnitzel',/wiener schnitzel/i],['koenigsberger',/königsberger|koenigsberger/i],
    ['service-franzoesisch',/französischer service|franzoesischer service/i],['service-russisch',/russischer service/i],['menu',/menüfolge|menuefolge|sorbet.*menü|gangfolge/i],
    ['fruehstueck-franzoesisch',/französisches frühstück|franzoesisches fruehstueck/i],['fruehstueck-kontinental',/kontinentales frühstück|kontinentales fruehstueck/i],
    ['teilstuecke-rind',/rind.*teilstück|rind.*teilstueck|rind.*filet|rind.*rücken|rind.*ruecken/i],['teilstuecke-schwein',/schwein.*teilstück|schwein.*teilstueck|schulter.*schinken|schweinefilet/i],['teilstuecke-lamm',/lamm.*teilstück|lamm.*teilstueck|lammrücken|lammruecken/i],['teilstuecke-huhn',/huhn.*teilstück|huhn.*teilstueck|brust.*keule.*flügel|brust.*keule.*fluegel/i],
    ['fisch-frische',/frischer fisch|frische.*fisch|kiemen|klare.*augen/i],['fisch-rund-platt',/rundfisch|plattfisch|seezunge|kabeljau/i],['fisch-filetieren',/filetier|fischkarkasse|fischfond/i],['fisch-lachs',/lachs|fettfisch/i],['kraut-salbei',/salbei|saltimbocca/i],['kraut-estragon',/estragon|fines herbes|béarnaise/i],['gewuerz-kreuzkuemmel',/kreuzkümmel|kreuzkuemmel|hummus|couscous/i],['gewuerz-wacholder',/wacholder|wild.*gewürz|sauerkraut/i],['fleisch-garverfahren',/bindegewebe|schmoren|kurzbraten|filet/i],['kalkulation',/kalkulation|wareneinsatz|portionsmenge|ausbeute|hochrechnen/i],
    ['hygiene',/hygiene|kontamination|allergen|haccp|küchenkühlung|kuechenkuehlung/i]
  ];
  let catalog=[];
  let model=fresh();
  let ready=false;
  function fresh(){return{version:VERSION,total:0,updatedAt:null,topics:{},concepts:{},questions:{}}}
  const clamp=(n,a=5,b=98)=>Math.max(a,Math.min(b,n));
  function topicKey(q){return window.KarriereAdmin?.classify?.(q)||q.section||q.cat||'Sonstiges'}
  function topicLabel(key){return TOPIC_LABELS[key]||key||'Fachwissen'}
  function conceptKey(q){if(!q)return'Sonstiges';if(q.concept)return String(q.concept);const s=`${q.title||''} ${q.prompt||''} ${q.cat||''}`;for(const [k,re] of FAMILIES)if(re.test(s))return k;const words=(q.title||q.cat||'fachwissen').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9äöüß]+/g,' ').split(/\s+/).filter(w=>w.length>3&&!['welche','welcher','welches','richtig','klassisch','klassische','aufgabe'].includes(w));return `${topicKey(q)}:${words.slice(0,2).join('-')||'allgemein'}`}
  function ensure(bucket,key){return bucket[key]||(bucket[key]={score:50,n:0,good:0,wrong:0,avgMs:0,lastSeen:0,lastCorrect:null,dueAt:0,streak:0})}
  function level(score){return score<45?'unsicher':score<68?'solide':score<86?'sicher':'Profi'}
  function apply(stat,result,weight=1){const correct=!!result.correct,ms=Number(result.responseMs||0),joker=!!result.usedJoker,repeat=!!result.repeat;let delta=correct?(stat.score<45?10:stat.score<68?8:6):-14;if(joker&&correct)delta*=.45;if(repeat)delta*=.42;if(correct&&ms>0&&ms<12000)delta+=1.5*weight;if(correct&&ms>45000)delta-=1*weight;stat.score=clamp(stat.score+delta*weight);stat.n++;correct?stat.good++:stat.wrong++;stat.avgMs=stat.n===1?ms:Math.round(stat.avgMs*.78+ms*.22);stat.lastSeen=Date.now();stat.lastCorrect=correct;stat.streak=correct?Math.max(0,stat.streak)+1:0;const interval=!correct?2:stat.score<50?4:stat.score<70?8:stat.score<86?16:32;stat.dueAt=model.total+interval}
  async function init(items=[]){catalog=items||[];try{const loaded=await window.KarriereStorage?.loadLearningModel?.();if(loaded){model={...fresh(),...loaded,version:VERSION,topics:loaded.topics||{},concepts:loaded.concepts||{},questions:loaded.questions||{}};await save()}else{const attempts=await window.KarriereStorage?.allAttempts?.(1200)||[];if(attempts.length){const byId=new Map(catalog.map(q=>[q.id,q]));for(const r of attempts.slice().reverse()){const q=byId.get(r.questionId||r.question_key||r.questionKey);if(q)recordSync(q,r,false)}await save()}}}catch(e){console.warn('Adaptive init',e)}ready=true;return model}
  function recordSync(q,result,persist=true){if(!q||!result)return;model.total++;const t=ensure(model.topics,topicKey(q)),c=ensure(model.concepts,conceptKey(q)),qs=ensure(model.questions,q.id);const w=result.prep?1.1:result.repeat?.55:1;apply(t,result,w);apply(c,result,w);apply(qs,result,w);model.updatedAt=new Date().toISOString();if(persist)save();}
  async function record(q,result){recordSync(q,result,false);await save();return snapshot()}
  let saveTimer=null;function save(){clearTimeout(saveTimer);return new Promise(resolve=>{saveTimer=setTimeout(async()=>{try{await window.KarriereStorage?.saveLearningModel?.(model)}catch(e){}resolve(true)},25)})}
  function scoreForQuestion(q){return model.topics[topicKey(q)]?.score??50}
  function conceptScore(q){return model.concepts[conceptKey(q)]?.score??50}
  function isStretchEligible(q,currentRank){return q.rank===currentRank+1&&scoreForQuestion(q)>=82&&conceptScore(q)>=76}
  function weightedPick(items,weightFn){if(!items.length)return null;const weights=items.map(x=>Math.max(.05,Math.min(30,weightFn(x)||.05))),sum=weights.reduce((a,b)=>a+b,0);let r=Math.random()*sum;for(let i=0;i<items.length;i++){r-=weights[i];if(r<=0)return items[i]}return items[items.length-1]}
  function weight(q,ctx={}){const t=ensure(model.topics,topicKey(q)),c=ensure(model.concepts,conceptKey(q)),qs=ensure(model.questions,q.id);const rank=Number(ctx.rank||0),mode=ctx.mode||'solo';let w=1;
    const weakness=(100-t.score)/18;w+=weakness;
    if(q.rank===rank)w+=2.8;else if(q.rank===rank-1)w+=t.score<55?3.5:1.1;else if(q.rank===rank+1)w+=t.score>=82?3.2:.1;else if(q.rank<rank-1)w*=.45;
    if(c.dueAt&&c.dueAt<=model.total)w+=5.5;if(qs.dueAt&&qs.dueAt<=model.total)w+=3.5;if(qs.lastCorrect===false)w+=2.8;if(!qs.n)w+=1.4;
    if(mode==='prep'){w+=(100-t.score)/10;if(c.dueAt<=model.total)w+=5;if(q.rank>rank)w*=.2}
    if(mode==='exam'){w+=(100-t.score)/32;if(q.rank!==rank&&q.rank!==rank-1)w*=.2}
    return w;
  }
  function choose(pool,ctx={}){return weightedPick(pool,q=>weight(q,ctx))}
  function weakest(limit=3,{professions=null,maxRank=6}={}){const allowed=professions?.length?new Set(professions):null;const seen=new Map();for(const q of catalog){if(q.rank>maxRank||allowed&&!allowed.has(q.profession||'Küche'))continue;const k=topicKey(q);if(!seen.has(k)){const s=model.topics[k]||{score:50,n:0,dueAt:0};seen.set(k,{key:k,label:topicLabel(k),score:s.score??50,n:s.n||0,due:!!s.dueAt&&s.dueAt<=model.total,level:level(s.score??50)})}}return [...seen.values()].sort((a,b)=>(a.score-b.score)||(b.due-a.due)||(a.n-b.n)).slice(0,limit)}
  function prepCandidates(pool,ctx={}){const weak=new Set(weakest(4,{professions:ctx.professions,maxRank:ctx.rank}).map(x=>x.key));let p=pool.filter(q=>q.rank<=ctx.rank&&q.rank>=Math.max(0,ctx.rank-2)&&weak.has(topicKey(q)));if(p.length<8)p=pool.filter(q=>q.rank<=ctx.rank&&q.rank>=Math.max(0,ctx.rank-2));return p}
  function recommendations(limit=3,ctx={}){return weakest(limit,ctx)}
  function questionLevel(q){const s=scoreForQuestion(q);return{score:Math.round(s),level:level(s),topic:topicLabel(topicKey(q)),concept:conceptKey(q)}}
  function snapshot(){return JSON.parse(JSON.stringify(model))}
  function selfTest(){const testQ={id:'t',rank:0,title:'Ausbeinmesser',cat:'Messer',section:'Materialkunde',profession:'Küche'};return{ok:conceptKey(testQ)==='messer-ausbeinen'&&['unsicher','solide','sicher','Profi'].includes(level(50)),version:VERSION,total:model.total,topics:Object.keys(model.topics).length,concepts:Object.keys(model.concepts).length,ready}}
  window.KarriereAdaptive={init,record,choose,weakest,prepCandidates,recommendations,questionLevel,scoreForQuestion,conceptKey,topicKey,topicLabel,isStretchEligible,snapshot,selfTest,isReady:()=>ready};
})();
