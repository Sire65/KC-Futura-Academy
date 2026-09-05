(()=>{'use strict';
const $=id=>document.getElementById(id),KEY='kcFuturaDiceKitchenV1';
const symbols=[
 {id:'marc',name:'Marc',img:'../../academy/assets/avatars_clean/marc.png'},
 {id:'laura',name:'Laura',img:'../../academy/assets/avatars_clean/laura.png'},
 {id:'member1',name:'Clubmitglied',img:'../assets/club-members/mitglied-01.jpg'},
 {id:'member2',name:'Clubmitglied',img:'../assets/club-members/mitglied-04.jpg'},
 {id:'member3',name:'Clubmitglied',img:'../assets/club-members/mitglied-07.jpg'},
 {id:'joker',name:'Weihnachts-Joker',img:'../../academy/assets/kc_logo.webp'}
];
const safe=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}},stats={best:0,games:0,...safe()};
let dice=Array(5).fill(0),held=Array(5).fill(false),rolls=0,round=0,total=0,active=false,busy=false;
function unlocked(){return Boolean(window.KCLearningProgressCore?.eligible?.('part2'))}
function leave(){if(history.length>1)history.back();else location.href='../../academy/index.html?source=dice-bonus'}
function render(){const host=$('dice');host.innerHTML='';dice.forEach((value,i)=>{const s=symbols[value],b=document.createElement('button');b.className='die'+(held[i]?' held':'');b.disabled=!active||!rolls||busy;b.innerHTML=`<img src="${s.img}" alt="${s.name}"><span>${s.name}</span>`;b.onclick=()=>{held[i]=!held[i];render()};host.append(b)});$('round').textContent=round;$('rolls').textContent=rolls;$('score').textContent=total;$('best').textContent=stats.best;$('games').textContent=stats.games}
function counts(values){const c={};values.filter(x=>x!==5).forEach(x=>c[x]=(c[x]||0)+1);return c}
function evaluate(values){const jokers=values.filter(x=>x===5).length,c=counts(values),base=Object.values(c).sort((a,b)=>b-a),ids=Object.keys(c).map(Number);if(!base.length)return{name:'Fünf Joker',points:220};base[0]+=jokers;base.sort((a,b)=>b-a);let name='Einzelbilder',points=5;if(base[0]>=5){name='Köcheclub-Meisterwurf';points=200}else if(base[0]===4){name='Vier gleiche';points=120}else if(base[0]===3&&base[1]===2){name='Full House';points=90}else if(base[0]===3){name='Drei gleiche';points=60}else if(base[0]===2&&base[1]===2){name='Zwei Paare';points=40}else if(base[0]===2){name='Ein Paar';points=20}if(ids.includes(0)&&ids.includes(1)){name+=' + Team-Bonus';points+=25}return{name,points}}
async function roll(){if(!active||busy||rolls>=3)return;busy=true;$('roll').disabled=true;document.querySelectorAll('.die').forEach((d,i)=>{if(!held[i])d.classList.add('rolling')});await new Promise(r=>setTimeout(r,420));dice=dice.map((v,i)=>held[i]?v:Math.floor(Math.random()*symbols.length));rolls++;busy=false;const result=evaluate(dice);$('message').textContent=`${result.name}: derzeit ${result.points} Punkte. ${rolls<3?'Bilder festhalten oder erneut würfeln.':'Jetzt werten.'}`;$('combo').textContent=result.name;$('take').disabled=false;$('roll').disabled=rolls>=3;render()}
function begin(){if(round>=6){round=0;total=0}round++;rolls=0;held.fill(false);dice=dice.map(()=>Math.floor(Math.random()*symbols.length));active=true;$('start').classList.remove('pulse');$('start').disabled=true;$('roll').disabled=false;$('take').disabled=true;$('message').textContent='Würfle jetzt. Danach kannst du Bilder festhalten.';render()}
function take(){if(!active||!rolls)return;const result=evaluate(dice);total+=result.points;active=false;$('take').disabled=true;$('roll').disabled=true;$('start').disabled=false;if(round<6){$('start').textContent='Nächste Runde';$('message').textContent=`${result.name}: ${result.points} Punkte erhalten.`}else{stats.games++;stats.best=Math.max(stats.best,total);localStorage.setItem(KEY,JSON.stringify(stats));$('start').textContent='Neues Spiel';$('start').classList.add('pulse');$('message').textContent=`Spiel beendet: ${total} Punkte. ${total>=stats.best?'Neue Bestleistung!':''}`}render()}
function init(){const ok=unlocked();$('locked').hidden=ok;$('game').hidden=!ok;if(ok)render()}
$('exit').onclick=leave;$('lockedExit').onclick=leave;$('start').onclick=begin;$('roll').onclick=roll;$('take').onclick=take;$('rules').onclick=()=>$('help').showModal();$('helpClose').onclick=()=>$('help').close();window.addEventListener('kc-learning-progress-ready',init);setTimeout(init,0);
})();
