const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

export class GlassBalanceGame{
  constructor(ctx){Object.assign(this,ctx);this.timers=[]}

  start(){
    this.rules={
      easy:{rows:4,tiltLimit:15,vibrationLimit:105,wetLimit:90,green:62,red:90,computerError:.42},
      normal:{rows:5,tiltLimit:11,vibrationLimit:88,wetLimit:68,green:52,red:80,computerError:.18},
      pro:{rows:6,tiltLimit:8,vibrationLimit:72,wetLimit:52,green:44,red:70,computerError:0}
    }[this.difficulty];
    this.mode=null;this.turn='player';this.removed=new Set();this.selected=null;this.score=0;this.round=1;
    this.tilt=0;this.vibration=0;this.wetness=0;this.pullForce=0;this.playerWins=0;this.computerWins=0;
    this.host.className='game-board balance-game-stage';this.renderModeChooser();
    this.status({score:0,round:1,message:'Wähle Solo oder das taktische Duell gegen den Computer.'});
  }

  allGlasses(){const result=[];for(let row=0;row<this.rules.rows;row++)for(let col=0;col<=row;col++)result.push({id:`${row}-${col}`,row,col});return result}
  bottomRow(){return this.rules.rows-1}
  sideOf(glass){return glass.row?((glass.col-glass.row/2)/Math.max(1,glass.row/2)):0}
  depthValue(glass){return 70+glass.row*85+Math.round((1-Math.abs(this.sideOf(glass)))*55)}
  supports(glass){return glass.row===this.bottomRow()?[]:[`${glass.row+1}-${glass.col}`,`${glass.row+1}-${glass.col+1}`]}

  isSupported(glass,removed,memo=new Map()){
    if(removed.has(glass.id))return false;
    if(glass.row===this.bottomRow())return true;
    if(memo.has(glass.id))return memo.get(glass.id);
    const ok=this.supports(glass).every(id=>{const support=this.allGlasses().find(item=>item.id===id);return support&&!removed.has(id)&&this.isSupported(support,removed,memo)});
    memo.set(glass.id,ok);return ok;
  }

  simulateRemoval(id){
    const removed=new Set(this.removed);removed.add(id);const unsupported=[];
    for(const glass of this.allGlasses())if(!removed.has(glass.id)&&!this.isSupported(glass,removed))unsupported.push(glass);
    const chosen=this.allGlasses().find(glass=>glass.id===id),moment=this.sideOf(chosen)*(chosen.row+1)*1.8;
    const nextTilt=clamp(this.tilt-moment,-18,18),topFalls=unsupported.some(glass=>glass.row===0);
    const collapse=topFalls||unsupported.length>=2||Math.abs(nextTilt)>=this.rules.tiltLimit;
    return{chosen,unsupported,nextTilt,collapse,risk:unsupported.length*35+Math.abs(nextTilt)*4+(topFalls?100:0)};
  }

  renderModeChooser(){
    this.host.innerHTML=`<div class="balance-intro"><small>NEU AUFGESETZTES KC GESCHICKLICHKEITSSPIEL</small><h2>KC Balance-Duell</h2><p>Statik lesen, Flüssigkeit ruhig halten und den Gegner in eine schwierige Lage bringen.</p><div><button data-mode="solo"><b>SOLO</b><span>Höchste Punktzahl erreichen</span></button><button data-mode="computer"><b>GEGEN COMPUTER</b><span>Wer den Turm umwirft, verliert</span></button></div></div>`;
    this.host.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>this.begin(button.dataset.mode));
  }

  begin(mode){this.mode=mode;this.turn='player';this.render();this.status({score:0,round:1,message:mode==='solo'?'Wähle ein Glas und prüfe seine tragende Funktion.':'Du beginnst. Wer den Turm umwirft, verliert.'})}

  forceZone(){return this.pullForce<=this.rules.green?'safe':this.pullForce<this.rules.red?'warning':'danger'}
  spillLevel(){return clamp((Math.abs(this.tilt)/this.rules.tiltLimit*.7+this.vibration/this.rules.vibrationLimit*.45)*100,0,130)}
  liquidFill(glass){return clamp(78-this.wetness*.12-(this.removed.has(glass.id)?78:0),48,78)}

  render(){
    const glasses=this.allGlasses(),selected=this.selected?glasses.find(glass=>glass.id===this.selected):null;
    this.host.innerHTML=`<div class="balance-table" style="--tilt:${this.tilt}deg;--spill:${this.spillLevel()}%" data-force="${this.forceZone()}">
      <header><div><small>${this.mode==='computer'?'DUELL GEGEN COMPUTER':'SOLO-CHALLENGE'}</small><strong>KC BALANCE-DUELL</strong><em class="turn-notice ${this.turn}">${this.turn==='player'?'DU BIST DRAN · GLAS WÄHLEN UND ZIEHEN':'COMPUTER IST DRAN · BITTE WARTEN'}</em></div><div class="balance-score"><span>Punkte <b>${this.score}</b></span><span>Zug <b>${this.turn==='player'?'Du':'Computer'}</b></span><span>Runde <b>${this.round}</b></span></div></header>
      <div class="physics-strip"><span>Wippe <b>${this.tilt.toFixed(1)}°</b></span><span>Erschütterung <b>${Math.round(this.vibration)}/${this.rules.vibrationLimit}</b></span><span>Wippe nass <b>${Math.round(this.wetness)}%</b></span><span>Flüssigkeit <b>${Math.round(this.spillLevel())}% Belastung</b></span></div>
      <section class="balance-arena"><div class="tower-assembly"><div class="new-glass-tower">${Array.from({length:this.rules.rows},(_,row)=>`<div class="new-glass-row">${glasses.filter(glass=>glass.row===row).map(glass=>this.glassMarkup(glass)).join('')}</div>`).join('')}</div><div class="real-seesaw"><span>LINKS</span><i></i><span>RECHTS</span></div></div><div class="fixed-fulcrum"></div><div class="spill-pool"></div></section>
      <section class="skill-console"><div class="selection-info"><b>${selected?`Gewählt: Reihe ${selected.row+1}, Position ${selected.col+1}`:'Glas im Turm antippen'}</b><span>${selected?this.riskHint(selected):'Randgläser sind meist sicherer als tragende Mittelgläser.'}</span></div><input class="balance-pull" type="range" min="-100" max="100" value="0" ${selected&&this.turn==='player'?'':'disabled'} aria-label="Glas behutsam herausziehen"><div class="pull-feedback"><span>← herausziehen</span><b class="pull-zone">Zugkraft ${Math.round(this.pullForce)}%</b><span>herausziehen →</span></div><div class="skill-actions"><button data-back>Anderes Glas</button><button data-calm>Beruhigen</button>${this.mode==='solo'?'<button data-secure class="primary">Punkte sichern</button>':''}</div></section>
    </div>`;
    this.host.querySelectorAll('[data-glass]:not(:disabled)').forEach(button=>button.onclick=()=>this.choose(button.dataset.glass));
    this.host.querySelector('[data-back]').onclick=()=>{this.selected=null;this.render()};
    this.host.querySelector('[data-calm]').onclick=()=>this.calm();
    this.host.querySelector('[data-secure]')?.addEventListener('click',()=>this.finish({score:this.score,message:`${this.score} Punkte clever gesichert.`}));
    const slider=this.host.querySelector('.balance-pull');if(!slider.disabled)this.bindPull(slider);
  }

  glassMarkup(glass){
    const removed=this.removed.has(glass.id);if(removed)return`<span class="balance-glass-space" aria-hidden="true"></span>`;
    const fill=this.liquidFill(glass),risk=this.simulateRemoval(glass.id).risk,selected=this.selected===glass.id;
    return `<button class="balance-glass ${selected?'selected':''} ${selected&&this.turn==='computer'?'computer-choice':''}" data-glass="${glass.id}" ${this.turn!=='player'?'disabled':''} style="--fill:${fill}%;--preview:${Math.min(100,risk)}" aria-label="Glas Reihe ${glass.row+1}, Position ${glass.col+1}"><span class="glass-cup"><i class="liquid"></i><i class="shine"></i></span><span class="glass-stem"></span><span class="glass-foot"></span></button>`;
  }

  riskHint(glass){const result=this.simulateRemoval(glass.id);return result.collapse?'Sehr hohe Gefahr: tragende Struktur!':result.risk>45?'Riskanter Zug – kann eine Kaskade auslösen.':'Statik wirkt derzeit günstig.'}
  choose(id){if(this.turn!=='player'||this.removed.has(id))return;this.selected=id;this.render();this.status({score:this.score,round:this.round,message:`Du bist dran: ${this.riskHint(this.allGlasses().find(glass=>glass.id===id))} Jetzt den Zugregler bewegen.`})}

  bindPull(slider){
    let last=0,lastTime=performance.now(),direction=0,peak=0,done=false,lastSound=0;
    const reset=()=>{if(done)return;slider.value=0;this.pullForce=0;this.renderMeters()};
    slider.oninput=()=>{
      if(done)return;const now=performance.now(),value=Number(slider.value),step=value-last,dt=Math.max(12,now-lastTime),raw=clamp(Math.abs(step)/dt*54,0,100),nextDirection=Math.sign(step)||direction;
      this.pullForce=this.pullForce*.72+raw*.28;peak=Math.max(peak,this.pullForce);this.vibration=clamp(this.vibration+raw*.009+(direction&&nextDirection!==direction?7:0),0,125);direction=nextDirection;last=value;lastTime=now;
      if(now-lastSound>90){this.sound('glass-pull',this.pullForce/100);if(this.pullForce>this.rules.red)this.sound('glass-warning',.65);lastSound=now}
      this.previewPull(value);this.renderMeters();if(Math.abs(value)>=88){done=true;this.executeMove(this.selected,{force:peak,direction:Math.sign(value)||1})}
    };
    slider.onchange=reset;slider.onpointerup=reset;
  }

  previewPull(value){const glass=this.host.querySelector(`[data-glass="${this.selected}"]`);glass?.style.setProperty('--pull-x',`${value*.38}px`)}
  renderMeters(){const root=this.host.querySelector('.balance-table');if(!root)return;root.dataset.force=this.forceZone();root.style.setProperty('--spill',`${this.spillLevel()}%`);const zone=this.host.querySelector('.pull-zone');if(zone)zone.textContent=`Zugkraft ${Math.round(this.pullForce)}%`;const values=this.host.querySelectorAll('.physics-strip b');if(values[1])values[1].textContent=`${Math.round(this.vibration)}/${this.rules.vibrationLimit}`;if(values[3])values[3].textContent=`${Math.round(this.spillLevel())}% Belastung`}

  executeMove(id,gesture,{computer=false}={}){
    const simulation=this.simulateRemoval(id),zone=this.pullForce<=this.rules.green?'safe':this.pullForce<this.rules.red?'warning':'danger';this.removed.add(id);
    const spill=Math.max(0,this.spillLevel()-78);if(spill>0){this.wetness=clamp(this.wetness+spill*.22,0,100);this.sound('liquid-slosh',spill/50)}
    this.tilt=simulation.nextTilt;this.vibration=clamp(this.vibration+(zone==='danger'?18:zone==='warning'?7:2),0,125);
    const slip=this.wetness>=this.rules.wetLimit,collapse=simulation.collapse||this.vibration>=this.rules.vibrationLimit||slip;
    if(collapse)return this.collapse(computer? 'computer':'player',simulation.unsupported.length,slip);
    const clever=Math.round(simulation.risk*2.2),calm=zone==='safe'?80:0;this.score+=this.depthValue(simulation.chosen)+clever+calm;this.sound('glass-safe',.45);this.selected=null;this.round++;
    this.vibration=Math.max(0,this.vibration-8);this.render();
    if(this.mode==='computer'&&!computer){this.turn='computer';this.render();this.status({score:this.score,round:this.round,message:'Computer ist dran und analysiert Statik, Wippe und Flüssigkeit …'});this.timers.push(setTimeout(()=>this.computerMove(),800))}
    else{this.turn='player';this.render();this.status({score:this.score,round:this.round,message:`Du bist dran · Sicherer Zug · ${clever} Cleverness-Punkte.`})}
  }

  computerMove(){
    const candidates=this.allGlasses().filter(glass=>!this.removed.has(glass.id)).map(glass=>({glass,...this.simulateRemoval(glass.id)}));if(!candidates.length)return this.finish({score:this.score,message:'Alle möglichen Gläser wurden gespielt.'});
    const safe=candidates.filter(item=>!item.collapse);let choice;if(Math.random()<this.rules.computerError||!safe.length)choice=candidates[Math.floor(Math.random()*candidates.length)];else choice=[...safe].sort((a,b)=>a.risk-b.risk)[0];
    this.selected=choice.glass.id;this.render();this.status({score:this.score,round:this.round,message:`Computer wählt Reihe ${choice.glass.row+1}, Position ${choice.glass.col+1} und zieht gleich …`});this.timers.push(setTimeout(()=>{this.pullForce=24+Math.random()*18;this.executeMove(choice.glass.id,{force:this.pullForce,direction:this.sideOf(choice.glass)>=0?1:-1},{computer:true})},1400));
  }

  calm(){this.vibration=Math.max(0,this.vibration-22);this.pullForce=0;this.sound('liquid-slosh',.18);this.render();this.status({score:this.score,round:this.round,message:'Flüssigkeit und Turm beruhigen sich.'})}
  collapse(loser,unsupported,slip){this.sound('glass-shatter',1);this.renderCollapse();const playerLost=loser==='player',message=slip?'Die nasse Wippe wurde rutschig.':unsupported?'Eine tragende Stütze fehlt.':'Der Turm hat das Gleichgewicht verloren.';this.status({score:this.score,round:this.round,message:`${message} ${playerLost?'Du verlierst die Runde.':'Der Computer verliert die Runde.'}`});this.timers.push(setTimeout(()=>this.finish({score:this.score,message:`${message} ${playerLost?'Computer gewinnt.':'Du gewinnst!'}`}),1100))}
  renderCollapse(){this.render();this.host.querySelector('.balance-table')?.classList.add('collapsed');const arena=this.host.querySelector('.balance-arena');if(arena)arena.insertAdjacentHTML('beforeend',`<div class="balance-shards">${'<i></i>'.repeat(28)}<b>KLIRR!</b></div>`)}
  sound(name,intensity){window.KCSoundCore?.playEffect?.(name,intensity)}
  destroy(){this.timers.forEach(clearTimeout)}
}
