import { createBoard, evaluateBoard, chooseComputerMove, DIFFICULTIES } from "./tic-tac-toe-core.mjs";

const STATS_KEY = "kcFuturaTicTacToeStatsV1";
const SETTINGS_KEY = "kcFuturaTicTacToeSettingsV4";
const storageGet = key => window.KCSecureStorage?.getItem?.(key) ?? localStorage.getItem(key);
const storageSet = (key,value) => window.KCSecureStorage?.setItem?.(key,value) ?? localStorage.setItem(key,value);

const SYMBOLS = Object.freeze([
  { id: "x", label: "X – klassisch", glyph: "X" },
  { id: "o", label: "O – klassisch", glyph: "O" },
  { id: "chef", label: "Koch / Kochmütze", glyph: "👨‍🍳" },
  { id: "pan", label: "Pfanne", glyph: "🍳" },
  { id: "knife", label: "Messer", glyph: "🔪" },
  { id: "fork", label: "Gabel", glyph: "🍴" },
  { id: "plate", label: "Teller mit Besteck", glyph: "🍽️" },
  { id: "spoon", label: "Kochlöffel", glyph: "🥄" },
  { id: "sausage", label: "Bratwurst", glyph: "🌭" },
  { id: "fire", label: "Grill / Feuer", glyph: "🔥" },
  { id: "tree", label: "Tannenbaum", glyph: "🎄" },
  { id: "star", label: "Stern", glyph: "⭐" },
  { id: "bell", label: "Servierglocke", glyph: "🛎️" },
  { id: "coffee", label: "Kaffeetasse", glyph: "☕" },
  { id: "beer", label: "Bierkrug", glyph: "🍺" },
  { id: "apple", label: "Apfel", glyph: "🍎" },
  { id: "carrot", label: "Karotte", glyph: "🥕" },
  { id: "cupcake", label: "Muffin", glyph: "🧁" },
  { id: "donut", label: "Donut", glyph: "🍩" },
  { id: "smile", label: "Smiley", glyph: "😀" },
  { id: "cool", label: "Cooler Smiley", glyph: "😎" },
  { id: "member01", label: "Mitglied 1", glyph: "👤", image: "../assets/club-members/mitglied-01.jpg", focus:"50% 13%", scale:1.75 },
  { id: "member02", label: "Mitglied 2", glyph: "👤", image: "../assets/club-members/mitglied-02.jpg", focus:"45% 12%", scale:1.75 },
  { id: "member03", label: "Mitglied 3", glyph: "👤", image: "../assets/club-members/mitglied-03.jpg", focus:"56% 13%", scale:1.7 },
  { id: "member04", label: "Mitglied 4", glyph: "👤", image: "../assets/club-members/mitglied-04.jpg", focus:"43% 18%", scale:1.8 },
  { id: "member05", label: "Mitglied 5", glyph: "👤", image: "../assets/club-members/mitglied-05.jpg", focus:"55% 13%", scale:1.8 },
  { id: "member06", label: "Mitglied 6", glyph: "👤", image: "../assets/club-members/mitglied-06.jpg", focus:"54% 11%", scale:1.75 },
  { id: "member07", label: "Mitglied 7", glyph: "👤", image: "../assets/club-members/mitglied-07.jpg", focus:"55% 10%", scale:1.75 },
  { id: "member08", label: "Mitglied 8", glyph: "👤", image: "../assets/club-members/mitglied-08.jpg", focus:"50% 12%", scale:1.75 },
  { id: "member09", label: "Mitglied 9", glyph: "👤", image: "../assets/club-members/mitglied-09.jpg", focus:"52% 10%", scale:1.75 },
  { id: "member10", label: "Mitglied 10", glyph: "👤", image: "../assets/club-members/mitglied-10.jpg", focus:"55% 11%", scale:1.75 },
  { id: "avatarLaura", label: "Avatar Laura", glyph: "👤", image: "../../academy/assets/avatars_clean/laura.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarMarc", label: "Avatar Marc", glyph: "👤", image: "../../academy/assets/avatars_clean/marc.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarMichael", label: "Avatar Michael", glyph: "👤", image: "../../academy/assets/avatars_clean/michael.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarSabrina", label: "Avatar Sabrina", glyph: "👤", image: "../../academy/assets/avatars_clean/sabrina.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarKalle", label: "Avatar Kalle", glyph: "👤", image: "../../academy/assets/avatars_clean/kalle.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarHannes", label: "Avatar Hannes", glyph: "👤", image: "../../academy/assets/avatars_clean/hannes.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarDetlef", label: "Avatar Detlef", glyph: "👤", image: "../../academy/assets/avatars_clean/detlef.png", focus:"50% 20%", scale:1.15 },
  { id: "avatarGisela", label: "Avatar Gisela", glyph: "👤", image: "../../academy/assets/avatars_clean/gisela.png", focus:"50% 20%", scale:1.15 }
]);

const THEMES = Object.freeze([
  { id: "classic", label: "Klassisch – X / O", player: "x", computer: "o" },
  { id: "kitchen", label: "Küche – Koch / Pfanne", player: "chef", computer: "pan" },
  { id: "tools", label: "Werkzeuge – Messer / Gabel", player: "knife", computer: "fork" },
  { id: "table", label: "Restaurant – Teller / Glocke", player: "plate", computer: "bell" },
  { id: "grill", label: "Grillen – Bratwurst / Feuer", player: "sausage", computer: "fire" },
  { id: "christmas", label: "Weihnachten – Baum / Stern", player: "tree", computer: "star" },
  { id: "drinks", label: "Getränke – Kaffee / Bier", player: "coffee", computer: "beer" },
  { id: "healthy", label: "Obst & Gemüse – Apfel / Karotte", player: "apple", computer: "carrot" },
  { id: "sweet", label: "Süßes – Muffin / Donut", player: "cupcake", computer: "donut" },
  { id: "smileys", label: "Smilies – Freundlich / Cool", player: "smile", computer: "cool" },
  { id: "club", label: "Köcheclub – Mitglieder 1 / 2", player: "member01", computer: "member02" },
  { id: "clubteam", label: "Köcheclub – Mitglieder 4 / 7", player: "member04", computer: "member07" },
  { id: "academy", label: "Academy – Laura / Marc", player: "avatarLaura", computer: "avatarMarc" },
  { id: "academyteam", label: "Academy – Sabrina / Michael", player: "avatarSabrina", computer: "avatarMichael" }
]);

function symbolById(id) {
  return SYMBOLS.find(symbol => symbol.id === id) || SYMBOLS[0];
}
function symbolMarkup(symbol,cssClass='game-symbol'){
  return symbol.image?`<span class="${cssClass} face-symbol" role="img" aria-label="${symbol.label}" style="--face-focus:${symbol.focus||'50% 15%'};--face-scale:${symbol.scale||1.75}"><img src="${symbol.image}" alt=""></span>`:`<span class="${cssClass}" aria-label="${symbol.label}">${symbol.glyph}</span>`;
}

class SoundEngine {
  constructor(){ this.enabled = true; this.ctx = null; }
  setEnabled(value){ this.enabled = Boolean(value); }
  tone(freq, duration=.08, type="sine", volume=.08){
    if(!this.enabled) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if(!AudioCtx) return;
    this.ctx ??= new AudioCtx();
    const oscillator = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(.0001, this.ctx.currentTime + duration);
    oscillator.connect(gain).connect(this.ctx.destination);
    oscillator.start();
    oscillator.stop(this.ctx.currentTime + duration);
  }
  move(){ this.tone(520,.07,"sine",.06); }
  win(){ [660,880,1040].forEach((f,i)=>setTimeout(()=>this.tone(f,.13,"triangle",.08),i*110)); }
  lose(){ [390,300,220].forEach((f,i)=>setTimeout(()=>this.tone(f,.16,"sawtooth",.05),i*120)); }
  draw(){ [440,440].forEach((f,i)=>setTimeout(()=>this.tone(f,.09,"square",.04),i*130)); }
}

export class FuturaTicTacToe extends HTMLElement {
  constructor(){
    super();
    this.attachShadow({mode:"open"});
    const settings = this.loadSettings();
    this.size = settings.size;
    this.difficulty = settings.difficulty;
    this.playerSymbolId = settings.playerSymbolId;
    this.computerSymbolId = settings.computerSymbolId;
    this.themeId = settings.themeId;
    this.board = createBoard(this.size);
    this.active = false;
    this.busy = false;
    this.sound = new SoundEngine();
    this.sound.setEnabled(settings.soundEnabled);
    this.stats = this.loadStats();
  }

  connectedCallback(){ this.render(); }

  loadStats(){
    try { return {player:0,computer:0,draws:0,...JSON.parse(storageGet(STATS_KEY)||"{}")}; }
    catch { return {player:0,computer:0,draws:0}; }
  }

  loadSettings(){
    const defaults = {
      size: 4,
      difficulty: DIFFICULTIES.MEDIUM,
      soundEnabled: true,
      playerSymbolId: "member01",
      computerSymbolId: "member02",
      themeId: "club"
    };
    try { return {...defaults, ...JSON.parse(storageGet(SETTINGS_KEY)||"{}")}; }
    catch { return defaults; }
  }

  saveStats(){ storageSet(STATS_KEY, JSON.stringify(this.stats)); }

  saveSettings(){
    storageSet(SETTINGS_KEY, JSON.stringify({
      size: this.size,
      difficulty: this.difficulty,
      soundEnabled: this.sound.enabled,
      playerSymbolId: this.playerSymbolId,
      computerSymbolId: this.computerSymbolId,
      themeId: this.themeId
    }));
  }

  setStatus(text){
    const element = this.shadowRoot.querySelector("[data-status]");
    if(element) element.textContent = text;
  }

  newRound(){
    this.board = createBoard(this.size);
    this.active = true;
    this.busy = false;
    this.render();
    this.setStatus(`Gestartet: Klicke jetzt in ein freies Feld. Du spielst mit ${symbolById(this.playerSymbolId).label}.`);
  }

  resetBoard(){
    this.board = createBoard(this.size);
    this.active = false;
    this.busy = false;
    this.render();
    this.setStatus("Spielbrett zurückgesetzt. Mit „Start“ beginnen.");
  }

  resetStats(){
    if(!confirm("Gewinnstatistik wirklich zurücksetzen?")) return;
    this.stats = {player:0,computer:0,draws:0};
    this.saveStats();
    this.render();
  }

  ensureDifferentSymbols(changedSide){
    if(this.playerSymbolId !== this.computerSymbolId) return;
    const replacement = SYMBOLS.find(item => item.id !== this.playerSymbolId);
    if(changedSide === "player") this.computerSymbolId = replacement.id;
    else this.playerSymbolId = replacement.id;
    this.setStatus("Spieler und Computer benötigen unterschiedliche Figuren. Die zweite Figur wurde angepasst.");
  }

  applyTheme(themeId){
    const theme = THEMES.find(item => item.id === themeId);
    if(!theme) return;
    this.themeId = theme.id;
    this.playerSymbolId = theme.player;
    this.computerSymbolId = theme.computer;
    this.saveSettings();
    this.resetBoard();
  }

  handleCell(index){
    if(!this.active || this.busy || this.board[index]) return;
    this.board[index] = "X";
    this.sound.move();
    this.paintBoard();
    if(this.finishIfNeeded()) return;

    this.busy = true;
    this.setStatus("Computer denkt …");
    setTimeout(()=>{
      const move = chooseComputerMove({
        board:this.board,
        size:this.size,
        difficulty:this.difficulty
      });
      if(move !== null){
        this.board[move] = "O";
        this.sound.move();
      }
      this.busy = false;
      this.paintBoard();
      if(!this.finishIfNeeded()) this.setStatus("Du bist am Zug: Klicke in ein freies Feld.");
    }, this.difficulty === DIFFICULTIES.EXPERT ? 350 : 220);
  }

  finishIfNeeded(){
    const result = evaluateBoard(this.board, this.size);
    if(!result.winner && !result.draw) return false;
    this.active = false;

    if(result.winner === "X"){
      this.stats.player++;
      this.sound.win();
      this.setStatus("Glückwunsch – du hast gewonnen!");
    } else if(result.winner === "O"){
      this.stats.computer++;
      this.sound.lose();
      this.setStatus("Der Computer hat gewonnen. Starte eine neue Runde.");
    } else {
      this.stats.draws++;
      this.sound.draw();
      this.setStatus("Unentschieden.");
    }

    this.saveStats();
    this.paintBoard(result.line);
    this.paintStats();
    this.shadowRoot.querySelector("[data-start]")?.classList.add("attention");
    return true;
  }

  glyphForMark(mark){
    if(mark === "X") return symbolMarkup(symbolById(this.playerSymbolId),"board-symbol");
    if(mark === "O") return symbolMarkup(symbolById(this.computerSymbolId),"board-symbol");
    return "";
  }

  paintBoard(winLine=[]){
    this.shadowRoot.querySelectorAll("[data-cell]").forEach(cell=>{
      const index = Number(cell.dataset.cell);
      const mark = this.board[index];
      cell.innerHTML = this.glyphForMark(mark);
      cell.classList.toggle("player-mark", mark === "X");
      cell.classList.toggle("computer-mark", mark === "O");
      cell.classList.toggle("win", winLine.includes(index));
      cell.disabled = Boolean(mark) || !this.active || this.busy;
    });
  }

  paintStats(){
    this.shadowRoot.querySelector("[data-player]").textContent = this.stats.player;
    this.shadowRoot.querySelector("[data-computer]").textContent = this.stats.computer;
    this.shadowRoot.querySelector("[data-draws]").textContent = this.stats.draws;
  }

  symbolOptions(selectedId, excludedId){
    return SYMBOLS.map(item => `
      <option value="${item.id}" ${item.id === selectedId ? "selected" : ""} ${item.id === excludedId ? "disabled" : ""}>
        ${item.image?'👤':item.glyph} ${item.label}
      </option>`).join("");
  }

  bind(){
    this.shadowRoot.querySelector("[data-start]").onclick = () => this.newRound();
    this.shadowRoot.querySelector("[data-reset]").onclick = () => this.resetBoard();
    this.shadowRoot.querySelector("[data-reset-stats]").onclick = () => this.resetStats();

    this.shadowRoot.querySelector("[data-size]").onclick = () => {
      this.size = this.size === 4 ? 3 : 4;
      this.board = createBoard(this.size);
      this.active = false;
      this.saveSettings();
      this.render();
    };

    this.shadowRoot.querySelector("[data-sound]").onchange = event => {
      this.sound.setEnabled(event.target.checked);
      this.saveSettings();
    };

    this.shadowRoot.querySelector("[data-difficulty]").onchange = event => {
      this.difficulty = event.target.value;
      this.saveSettings();
      this.resetBoard();
    };

    this.shadowRoot.querySelector("[data-theme]").onchange = event => this.applyTheme(event.target.value);

    this.shadowRoot.querySelector("[data-player-symbol]").onchange = event => {
      this.playerSymbolId = event.target.value;
      this.themeId = "custom";
      this.ensureDifferentSymbols("player");
      this.saveSettings();
      this.resetBoard();
    };

    this.shadowRoot.querySelector("[data-computer-symbol]").onchange = event => {
      this.computerSymbolId = event.target.value;
      this.themeId = "custom";
      this.ensureDifferentSymbols("computer");
      this.saveSettings();
      this.resetBoard();
    };

    this.shadowRoot.querySelectorAll("[data-cell]").forEach(cell => {
      cell.onclick = () => this.handleCell(Number(cell.dataset.cell));
    });
  }

  render(){
    const player = symbolById(this.playerSymbolId);
    const computer = symbolById(this.computerSymbolId);

    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="./futura-tic-tac-toe.css">
      <section class="game-shell" aria-label="KC FUTURA Tic-Tac-Toe">
        <header class="game-head">
          <p class="status" data-status>${this.active ? "Du bist am Zug: Klicke in ein freies Feld." : "Drücke Start. Klicke danach in ein freies Feld."}</p>
          <label class="sound">
            <input data-sound type="checkbox" ${this.sound.enabled ? "checked" : ""}>
            Ton
          </label>
        </header>

        <section class="figure-panel" aria-label="Spielfiguren auswählen">
          <label>Themenset
            <select data-theme>
              <option value="custom" ${this.themeId === "custom" ? "selected" : ""}>Eigene Kombination</option>
              ${THEMES.map(theme => `<option value="${theme.id}" ${theme.id === this.themeId ? "selected" : ""}>${theme.label}</option>`).join("")}
            </select>
          </label>

          <label>Deine Spielfigur
            <select data-player-symbol>${this.symbolOptions(this.playerSymbolId, this.computerSymbolId)}</select>
          </label>

          <div class="versus" aria-hidden="true">
            <span>${symbolMarkup(player,"preview-symbol")}</span><b>gegen</b><span>${symbolMarkup(computer,"preview-symbol")}</span>
          </div>

          <label>Computerfigur
            <select data-computer-symbol>${this.symbolOptions(this.computerSymbolId, this.playerSymbolId)}</select>
          </label>
        </section>

        <div class="toolbar">
          <button class="primary ${this.active ? "" : "attention"}" data-start>Start</button>
          <button data-reset>Spielstand zurücksetzen</button>
          <button data-size>Auf ${this.size === 4 ? "3 × 3" : "4 × 4"} umschalten</button>
          <label>Schwierigkeit
            <select data-difficulty>
              <option value="easy" ${this.difficulty === "easy" ? "selected" : ""}>Einfach</option>
              <option value="medium" ${this.difficulty === "medium" ? "selected" : ""}>Mittel</option>
              <option value="expert" ${this.difficulty === "expert" ? "selected" : ""}>Experte</option>
            </select>
          </label>
        </div>

        <div class="content">
          <div>
            <div class="board" style="--size:${this.size}">
              ${this.board.map((mark,index) => `
                <button data-cell="${index}" aria-label="Feld ${index + 1}" ${!this.active || mark ? "disabled" : ""}>
                  ${this.glyphForMark(mark)}
                </button>`).join("")}
            </div>
          </div>

          <aside class="stats">
            <h2>Gewinnstatistik</h2>
            <div class="stat player">
              <span>${symbolMarkup(player,"stat-symbol")} Spieler</span>
              <strong data-player>${this.stats.player}</strong>
            </div>
            <div class="stat computer">
              <span>${symbolMarkup(computer,"stat-symbol")} Computer</span>
              <strong data-computer>${this.stats.computer}</strong>
            </div>
            <div class="stat draws">
              <span>Unentschieden</span>
              <strong data-draws>${this.stats.draws}</strong>
            </div>
            <button class="small" data-reset-stats>Statistik zurücksetzen</button>
          </aside>
        </div>
      </section>`;

    this.bind();
  }
}

if(!customElements.get("futura-tic-tac-toe"))customElements.define("futura-tic-tac-toe", FuturaTicTacToe);
