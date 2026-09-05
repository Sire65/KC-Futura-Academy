export const EDITIONS = Object.freeze({
  'modern-casino': {id:'modern-casino',label:'Modern Casino Edition',short:'MODERN CASINO EDITION'},
  'kc-weihnachtsmarkt': {id:'kc-weihnachtsmarkt',label:'Weihnachtsmarkt Edition',short:'WEIHNACHTSMARKT EDITION'}
});

const A='../..';
const clubMembers=Array.from({length:10},(_,i)=>({
  id:`member-${i+1}`,label:`Köcheclub-Mitglied ${i+1}`,src:`../assets/club-members/mitglied-${String(i+1).padStart(2,'0')}.jpg`,symbol:'KC'
}));
const people=['detlef','dr_brinkmann','eugen','frau_schmitt','gisela','hannes','herr_becker','herr_koslowski','julia','kalle','laura','leo','lukas','marc','michael','sabrina'].map(id=>({
  id:`person-${id}`,label:id[0].toUpperCase()+id.slice(1),src:`${A}/academy/assets/avatars_clean/${id}.png`,symbol:'👨‍🍳'
}));
people.push(
  {id:'chef-male',label:'KC Koch',src:`${A}/avatar-core/assets/chef/chef_male_smile.png`,symbol:'👨‍🍳'},
  {id:'chef-female',label:'KC Köchin',src:`${A}/avatar-core/assets/chef/chef_female_neutral.png`,symbol:'👩‍🍳'}
);
const market=[
  ['chefhat','Kochmütze','👨‍🍳'],['eggnog','Eierlikörpunsch','🥛'],['mulled','Glühwein','🍷'],
  ['fire','Feuerzangenbowle','🔥'],['tree','Tannenbaum','🎄'],['star','Stern','⭐'],
  ['snow','Schneeflocke','❄️'],['lights','Lichterkette','💡'],['sausage','Mettwurst','🌭'],
  ['potato','Kartoffelknirpse','🥔'],['stew','Grünkohl-Eintopf','🥘'],['bell','Glocke','🔔']
].map(([id,label,symbol])=>({id,label,symbol,src:null}));
const numbers=Array.from({length:10},(_,i)=>({id:`number-${i+1}`,label:`Zahl ${i+1}`,symbol:String(i+1),src:null}));
const objects=[['pan','Bratpfanne','🍳'],['plate','Teller','🍽️'],['cutlery','Besteck','🍴'],['pot','Kochtopf','🥘'],['glass','Sektglas','🥂'],['knife','Kochmesser','🔪'],['gift','Geschenk','🎁'],['bell','Glocke','🔔'],['hat','Kochmütze','👨‍🍳'],['fire-tongs','Feuerzange','🔥']].map(([id,label,symbol])=>({id:`object-${id}`,label,symbol,src:null}));

export const ASSET_SETS=Object.freeze({
  'all-assets':{id:'all-assets',label:'Gesamter KC-Motivkatalog',editions:['modern-casino','kc-weihnachtsmarkt'],items:[...clubMembers,...people,...objects,...market,...numbers]},
  'club-members':{id:'club-members',label:'Echte Köcheclub-Mitglieder',editions:['modern-casino','kc-weihnachtsmarkt'],items:clubMembers},
  'kc-objects':{id:'kc-objects',label:'Küche & Gegenstände',editions:['modern-casino','kc-weihnachtsmarkt'],items:objects},
  'numbers':{id:'numbers',label:'Klassische Zahlen',editions:['modern-casino','kc-weihnachtsmarkt'],items:numbers},
  'kc-people':{id:'kc-people',label:'Academy-Avatare & KC-Figuren',editions:['modern-casino','kc-weihnachtsmarkt'],items:people},
  'market-mixed':{id:'market-mixed',label:'Weihnachtsmarkt gemischt',editions:['kc-weihnachtsmarkt'],items:market},
  'market-drinks':{id:'market-drinks',label:'Getränke & Markt',editions:['kc-weihnachtsmarkt'],items:market.slice(0,10)},
  'market-food':{id:'market-food',label:'Speisen & Winter',editions:['kc-weihnachtsmarkt'],items:market.slice(2,12)}
});

export const GAMES=Object.freeze({
  memory:{id:'memory',title:'KC Memory',icon:'🃏',unlock:'open',description:'Bildpaare mit möglichst wenigen Versuchen finden.'},
  lights:{id:'lights',title:'KC Küchenlicht',icon:'💡',unlock:'open',description:'Eine immer längere Lichtfolge richtig wiederholen.'},
  ttt:{id:'ttt',title:'KC Tic-Tac-Toe',icon:'❎',unlock:'open',description:'Gegen den Computer drei oder vier Felder verbinden.'},
  slot:{id:'slot',title:'KC Einarmiger Bandit',icon:'🎰',unlock:'training-complete',description:'Das Belohnungsspiel nach bestandener Pflichtschulung.'},
  dice:{id:'dice',title:'KC Würfelbecher',icon:'🎲',unlock:'training-complete',description:'Fünf Würfel, drei Würfe und frei wählbare Würfel behalten.'},
  connect4:{id:'connect4',title:'KC Vier gewinnt',icon:'🔴',unlock:'dice-achievement',description:'Vier Chips waagerecht, senkrecht oder diagonal verbinden.'},
  glass:{id:'glass',title:'KC Balance-Duell',icon:'🥂',unlock:'connect4-achievement',description:'Statik, Wippe und Flüssigkeit beherrschen – solo oder gegen den Computer.'},
  kitchen:{id:'kitchen',title:'KC Küchenbrigade',icon:'👨‍🍳',unlock:'training-complete',description:'Kurze Küchenabläufe in die fachlich richtige Reihenfolge bringen.'},
  maze:{id:'maze',title:'KC Labyrinth',icon:'🧭',unlock:'open',description:'Zehn wechselnde Labyrinthe allein oder gegen den Computer lösen.'},
  service:{id:'service',title:'KC Serviertablett',icon:'🍽️',unlock:'open',description:'Balance halten und Bestellungen in kluger Reihenfolge ausliefern.'},
  vault:{id:'vault',title:'KC Küchen-Tresor',icon:'🔐',unlock:'open',description:'Verdeckte Kombinationen mit präzisen Logikhinweisen entschlüsseln.'},
  auction:{id:'auction',title:'KC Privatauktion',icon:'🔨',unlock:'open',description:'Gegen den Computer bieten, Werte einschätzen und Sammlungen bilden.'},
  roulette:{id:'roulette',title:'KC Küchen-Roulette',icon:'🎡',unlock:'open',description:'Zutat und Zubereitung kombinieren – mit freiwilliger Risikooption.'}
});

export const DIFFICULTIES=Object.freeze({
  easy:{id:'easy',label:'Leicht'},normal:{id:'normal',label:'Normal'},pro:{id:'pro',label:'Profi'}
});

export function assetsFor(edition,setId){
  const allowed=Object.values(ASSET_SETS).filter(s=>s.editions.includes(edition));
  return (ASSET_SETS[setId]?.editions.includes(edition)?ASSET_SETS[setId]:allowed[0]).items;
}
