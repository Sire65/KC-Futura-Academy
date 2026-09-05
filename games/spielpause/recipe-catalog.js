export const RECIPE_CATALOG_VERSION='0.1.0-editorial-candidate';

export const RECIPES=Object.freeze([
  {id:'scrambled-eggs',title:'Rührei',difficulty:'easy',icon:'🍳',minutes:2,steps:[
    ['prepare','Zutaten und Arbeitsmittel bereitstellen','🥚'],['crack','Eier in eine Schüssel aufschlagen','🥣'],['mix','Eier würzen und verquirlen','🥄'],['heat','Pfanne erhitzen und etwas Fett hineingeben','🔥'],['cook','Eimasse hineingeben und schonend stocken lassen','🍳']
  ]},
  {id:'salad',title:'Einfacher Salat',difficulty:'easy',icon:'🥗',minutes:2,steps:[
    ['prepare','Zutaten und Geräte bereitstellen','🧺'],['wash','Salat und Gemüse gründlich waschen','💧'],['cut','Gemüse und Salat passend schneiden','🔪'],['dress','Dressing zubereiten','🥣'],['finish','Erst kurz vor dem Servieren mischen','🥗']
  ]},
  {id:'spaghetti',title:'Spaghetti kochen',difficulty:'easy',icon:'🍝',minutes:2,steps:[
    ['prepare','Topf, Wasser und Zutaten bereitstellen','🫕'],['water','Topf mit ausreichend Wasser füllen','💧'],['boil','Wasser erhitzen und zum Kochen bringen','🔥'],['salt','Kochendes Wasser salzen','🧂'],['pasta','Spaghetti hineingeben und umrühren','🍝'],['test','Garzeit beachten und Garprobe machen','⏱️'],['drain','Spaghetti sicher abgießen und anrichten','🍽️']
  ]},
  {id:'meatballs',title:'Frikadellen',difficulty:'normal',icon:'🥩',minutes:3,steps:[
    ['prepare','Arbeitsplatz und Zutaten vorbereiten','🧺'],['soak','Brötchen einweichen','🥖'],['onion','Zwiebel schälen und fein würfeln','🧅'],['bowl','Hackfleisch in eine Schüssel geben','🥩'],['mix','Brötchen ausdrücken und Masse nach Rezept mischen','🥣'],['shape','Gleich große Frikadellen formen','👐'],['clean','Hände und Kontaktflächen gründlich reinigen','🧼'],['cook','Frikadellen vollständig durchgaren','🍳'],['check','Garzustand prüfen und sicher anrichten','🌡️']
  ]},
  {id:'fried-egg',title:'Spiegelei',difficulty:'easy',icon:'🍳',minutes:2,steps:[
    ['prepare','Ei, Pfanne, Fett und Gewürze bereitstellen','🥚'],['heat','Pfanne bei mittlerer Hitze erwärmen','🔥'],['fat','Wenig Fett in die Pfanne geben','🧈'],['crack','Ei vorsichtig aufschlagen und hineingleiten lassen','🥚'],['cook','Eiweiß stocken lassen, Eigelb flüssig halten','🍳'],['season','Zum Schluss würzen und sofort anrichten','🧂']
  ]},
  {id:'pancakes',title:'Mehlpfannkuchen mit Zimt & Zucker',difficulty:'normal',icon:'🥞',minutes:3,steps:[
    ['prepare','Mehl, Eier, Milch und Arbeitsmittel bereitstellen','🧺'],['batter','Mehl, Eier und Milch zu glattem Teig verrühren','🥣'],['rest','Teig kurz quellen lassen','⏱️'],['sugar','Zimt und Zucker getrennt vermischen','✨'],['heat','Pfanne erhitzen und dünn fetten','🔥'],['portion','Teig dünn und gleichmäßig in die Pfanne geben','🥄'],['turn','Pfannkuchen goldbraun wenden und fertig backen','🥞'],['finish','Mit Zimt und Zucker bestreuen und servieren','🍽️']
  ]},
  {id:'fried-potatoes',title:'Bratkartoffeln mit Speck',difficulty:'normal',icon:'🥔',minutes:3,steps:[
    ['prepare','Kartoffeln, Speck, Zwiebeln und Petersilie bereitstellen','🧺'],['potatoes','Gekochte Kartoffeln pellen und in Scheiben schneiden','🥔'],['dice','Speck würfeln, Zwiebeln schneiden und Petersilie hacken','🔪'],['bacon','Speck in der Pfanne langsam auslassen','🥓'],['onion','Zwiebeln im Speck glasig anschwitzen','🧅'],['fry','Kartoffelscheiben zugeben und goldbraun braten','🍳'],['turn','Kartoffeln erst nach guter Bräunung vorsichtig wenden','🥄'],['finish','Abschmecken und gehackte Petersilie darübergeben','🌿']
  ]},
  {id:'chicken-ragout',title:'Hähnchengeschnetzeltes',difficulty:'normal',icon:'🍲',minutes:3,steps:[
    ['prepare','Zutaten, zwei Bretter und Geräte bereitstellen','🧺'],['cut-meat','Hähnchenfleisch hygienisch getrennt schneiden','🔪'],['clean','Hände, Messer und Kontaktfläche gründlich reinigen','🧼'],['vegetables','Champignons und Zwiebeln vorbereiten','🍄'],['sear','Fleisch portionsweise kräftig anbraten','🔥'],['sauce','Zwiebeln und Pilze anschwitzen, Sauce ansetzen','🥣'],['cook','Fleisch zurückgeben und vollständig durchgaren','🌡️'],['finish','Abschmecken, garnieren und heiß anrichten','🍽️']
  ]},
  {id:'three-course',title:'Einfaches Drei-Gänge-Menü',difficulty:'pro',icon:'👨‍🍳',minutes:4,steps:[
    ['plan','Menü, Zeiten und Arbeitsstationen planen','📝'],['dessert','Dessert zuerst vorbereiten und kühl stellen','🍮'],['starter-prep','Vorspeise vorbereiten','🥗'],['main-prep','Hauptgang und Beilagen vorbereiten','🔪'],['starter-finish','Vorspeise fertigstellen und anrichten','🍽️'],['main-cook','Hauptgang und Beilagen abgestimmt garen','🔥'],['main-serve','Hauptgang gemeinsam heiß anrichten','🍽️'],['dessert-finish','Dessert abschließend garnieren und servieren','✨']
  ]}
]);

export function recipesForDifficulty(difficulty){
  const allowed={easy:['easy'],normal:['easy','normal'],pro:['easy','normal','pro']}[difficulty]||['easy'];
  return RECIPES.filter(recipe=>allowed.includes(recipe.difficulty));
}
