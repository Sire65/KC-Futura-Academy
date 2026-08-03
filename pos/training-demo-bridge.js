(() => {
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('embeddedTraining')!=='1')return;
let token=0,cursor=null;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
let cueSeq=0,cueWaiters=new Map();
function cue(text,label=''){const cueId='cue-'+(++cueSeq);return new Promise(resolve=>{cueWaiters.set(cueId,resolve);parent.postMessage({type:'KC_TRAINING_CUE',cueId,text,label},'*');setTimeout(()=>{if(cueWaiters.has(cueId)){cueWaiters.delete(cueId);resolve()}},30000)})}
window.addEventListener('message',e=>{const m=e.data;if(m?.type==='KC_TRAINING_CUE_DONE'&&cueWaiters.has(m.cueId)){const done=cueWaiters.get(m.cueId);cueWaiters.delete(m.cueId);done()}});
function inject(){
 if(document.getElementById('kc-live-demo-style'))return;
 const s=document.createElement('style');s.id='kc-live-demo-style';s.textContent=`
 .kc-live-demo-cursor{position:fixed;left:0;top:0;z-index:2147483646;width:46px;height:46px;pointer-events:none;opacity:0;transform:translate(-80px,-80px);transition:transform var(--move,1100ms) cubic-bezier(.2,.8,.25,1),opacity .2s;filter:drop-shadow(0 5px 4px #0009)}
 .kc-live-demo-cursor.show{opacity:1}.kc-live-demo-pointer{display:block;font-size:39px;line-height:1;color:#fff;-webkit-text-stroke:2px #09223c;transform:rotate(-27deg)}
 .kc-live-demo-wave{position:absolute;left:5px;top:5px;width:32px;height:32px;border:4px solid #ffb52e;border-radius:50%;opacity:0}
 .kc-live-demo-cursor.click .kc-live-demo-pointer{animation:kcDemoPress .42s ease}.kc-live-demo-cursor.click .kc-live-demo-wave{animation:kcDemoWave .75s ease-out}
 .kc-demo-focus{position:relative;z-index:2147483000!important;outline:5px solid #ffb52e!important;outline-offset:4px!important;box-shadow:0 0 0 9999px rgba(3,18,32,.48),0 0 22px 8px rgba(255,181,46,.85)!important;transition:outline .2s,box-shadow .2s!important}
 @keyframes kcDemoPress{50%{transform:rotate(-27deg) scale(.68)}}@keyframes kcDemoWave{0%{opacity:1;transform:scale(.2)}100%{opacity:0;transform:scale(2.5)}}`;
 document.head.appendChild(s);
}
 function ensureCursor(){inject();if(cursor?.isConnected)return cursor;cursor=document.createElement('div');cursor.className='kc-live-demo-cursor';cursor.innerHTML='<span class="kc-live-demo-pointer">➤</span><span class="kc-live-demo-wave"></span>';document.body.appendChild(cursor);return cursor}
function clearFocus(){document.querySelectorAll('.kc-demo-focus,.training-focus-ring').forEach(n=>n.classList.remove('kc-demo-focus','training-focus-ring'))}
function find(target){if(typeof target==='function')return target();return document.querySelector(target)}
function tile(name){const wanted=name.toLowerCase();return [...document.querySelectorAll('.product-tile')].find(n=>String(n.getAttribute('aria-label')||n.textContent||'').toLowerCase().includes(wanted))}
function plus(name){return tile(name)?.querySelector('.product-variant-button, .product-plus, [data-product-plus], button[aria-label*=\"Variante\"], button[title*=\"Variante\"]')||null}
async function move(target,duration=1100){const n=find(target);if(!n)return null;n.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});await wait(500);const r=n.getBoundingClientRect(),c=ensureCursor();c.style.setProperty('--move',duration+'ms');c.style.transform=`translate(${Math.round(r.left+r.width*.52)}px,${Math.round(r.top+r.height*.48)}px)`;c.classList.add('show');await wait(duration);return n}
async function click(target,{perform=true,after=850}={}){const n=await move(target);if(!n)return false;const c=ensureCursor();c.classList.remove('click');void c.offsetWidth;c.classList.add('click');await wait(260);if(perform)n.click();await wait(after);return true}
async function focus(target,ms=1200){clearFocus();const n=find(target);if(!n)return;n.scrollIntoView({block:'center',inline:'center',behavior:'smooth'});n.classList.add('kc-demo-focus');await wait(ms);n.classList.remove('kc-demo-focus')}
function reset(){token++;clearFocus();cursor?.remove();cursor=null;try{window.KCTrainingAPI?.closeAllDialogs?.()}catch{}}
async function demo(name){
 reset();const my=token;const alive=()=>my===token;const api=window.KCTrainingAPI;if(!api)return;
 const step=async fn=>{if(!alive())throw new Error('cancelled');return fn()};
 try{

  if(name==='orientationOverview'){
   await step(()=>focus('#app',700));await cue('Wir wollen uns gemeinsam die Oberfläche des KC Bilderrechners ansehen. Sie ist in klar erkennbare Arbeitsbereiche gegliedert.','Gesamtoberfläche');
   await step(()=>move('.app-header',800));await step(()=>focus('.app-header',400));await cue('Ganz oben befindet sich die Kopfzeile.','Kopfzeile');
   await step(()=>move('.mode-strip',800));await step(()=>focus('.mode-strip',400));await cue('Direkt darunter liegt die Bediener- und Moduszeile.','Bediener- und Moduszeile');
   await step(()=>move('#categories',800));await step(()=>focus('#categories, #productGrid',400));await cue('Links findest du die Warengruppen und die dazugehörigen Artikelbuttons.','Warengruppen und Artikel');
   await step(()=>move('#cartList',800));await step(()=>focus('#cartList, #grandTotal',400));await cue('Rechts befindet sich der Warenkorb mit Mengen, Preisen und Gesamtsumme.','Warenkorb');
   await step(()=>move('#payBtn',800));await step(()=>focus('#banknotes, #coins, #payBtn, .main-actions',400));await cue('Im unteren Bereich liegen die Zahlung und die Sonderfunktionen. Diese Bereiche sehen wir uns jetzt einzeln an.','Zahlung und Sonderfunktionen');
  } else if(name==='headerTour'){
   await step(()=>move('#clubName',750));await step(()=>focus('#secretTrigger',350));await cue('Links stehen der Name des Köcheclubs und darunter die aktuelle Veranstaltung.','Vereinsname und Veranstaltung');
   await step(()=>move('#registerName',750));await step(()=>focus('#registerName, #operatorName',350));await cue('Hier siehst du den Namen der Kasse, zum Beispiel Kasse eins, und darunter den aktuell zugeordneten Bediener.','Kasse und Bediener');
   await step(()=>move('#version',700));await step(()=>focus('#version, #dateText, #timeText',350));await cue('Daneben werden Programmversion, Datum und Uhrzeit angezeigt.','Version, Datum und Uhrzeit');
   await step(()=>move('#shiftStatus',700));await step(()=>focus('.operator-mini-dashboard',350));await cue('Diese Statusfelder informieren über Schicht, Wechselgeld und den aktuellen Betriebsmodus.','Statusanzeigen');
   await step(()=>move('#screenLockBtn',650));await step(()=>focus('#screenLockBtn',300));await cue('Mit dem Schloss kann der Bildschirm abgedunkelt und gesperrt werden.','Bildschirmsperre');
   await step(()=>move('#cashSoundBtn',650));await step(()=>focus('#cashSoundBtn',300));await cue('Der Lautsprecher schaltet den Kassenton ein oder aus. Er dient nicht für Durchsagen.','Kassenton');
   await step(()=>move('#menuBtn',650));await step(()=>focus('#menuBtn, #headerExitBtn',300));await cue('Über Menü werden weitere Verwaltungsfunktionen geöffnet. Die Tür beendet beziehungsweise verlässt das Programm.','Menü und Programmende');
  } else if(name==='modeRowTour'){
   await step(()=>move('#operatorBtn',700));await step(()=>focus('#operatorBtn',300));await cue('Links wird der aktive Bediener angezeigt. Über diese Taste kann ein Bedienerwechsel erfolgen.','Bediener');
   await step(()=>move('#productSearchInput',700));await step(()=>focus('.product-search-wrap',300));await cue('Mit der Suche findest du einen Artikel schnell über seinen Namen.','Artikelsuche');
   await step(()=>move('#trainingModeTopBtn',700));await step(()=>focus('#trainingModeTopBtn',300));await cue('Der Trainingsmodus ist zum Üben. Trainingsvorgänge dürfen keine echten Umsätze erzeugen.','Trainingsmodus');
   await step(()=>move('#rushModeBtn',700));await step(()=>focus('#rushModeBtn',300));await cue('Der Stoßzeitenmodus vereinfacht die Oberfläche bei starkem Andrang.','Stoßzeiten');
   await step(()=>move('#happyHourQuickBtn',700));await step(()=>focus('.mode-quick-switches',300));await cue('Eine aktive Happy Hour wird in diesem Bereich sichtbar angezeigt und verwendet automatisch die freigegebenen Sonderpreise.','Happy Hour');
   await step(()=>move('#notificationBar',700));await step(()=>focus('#notificationBar, #messageHistoryBtn',300));await cue('Hier erscheinen Kassenmeldungen. Mit dem gebogenen Pfeil können vorherige Meldungen erneut angezeigt werden.','Meldungszeile');
  } else if(name==='productsTour'){
   await step(()=>move('#categories',700));await step(()=>focus('#categories',300));await cue('Die Warengruppen bestimmen, welche Artikel darunter angezeigt werden. Die aktive Warengruppe ist optisch hervorgehoben.','Warengruppen');
   await step(()=>move(()=>tile('Glühwein rot'),750));await step(()=>focus(()=>tile('Glühwein rot'),350));await cue('Die große Artikelfläche zeigt Bild, Artikelname und Preis. Ein Klick verkauft den Standardartikel.','Artikelbutton');
   await step(()=>move(()=>tile('Glühwein rot')?.closest('.product-tile-wrap')?.querySelector('.product-info-button'),650));await step(()=>focus('.product-info-button',300));await cue('Die kleine Infotaste öffnet hinterlegte Artikelinformationen, zum Beispiel Allergene und Zutaten.','Infotaste');
   await step(()=>move(()=>plus('Glühwein rot'),650));await step(()=>focus('.product-variant-button',300));await cue('Das Pluszeichen öffnet Varianten oder Zusätze. Es erhöht nicht die Menge.','Varianten');
   await step(()=>focus('.offer-badge, .happyhour-tile, #happyHourQuickBtn',300));await cue('Das Zeichen H H kennzeichnet einen Artikel oder Preis, für den eine Happy-Hour-Regel gilt.','Happy-Hour-Kennzeichen');
  } else if(name==='cartAreaTour'){
   api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(600);api.addStandardProduct?.('Glühwein rot');await wait(600);
   await step(()=>move('#voidBonBtn',700));await step(()=>focus('#voidBonBtn',300));await cue('Diese Taste löscht den kompletten offenen Warenkorb. Sie ist nicht zum Löschen einer einzelnen Position gedacht.','Warenkorb löschen');
   await step(()=>move('#cartQuantityBar',700));await step(()=>focus('#cartQuantityBar',300));await cue('In der Mengenzeile kann die Menge des markierten Artikels verändert werden.','Mengenzeile');
   await step(()=>move('.cart-row',700));await step(()=>focus('.cart-row',300));await cue('Jede Warenkorbzeile enthält Artikelname, Menge, Einzelpreis und Zeilensumme.','Warenkorbposition');
   await step(()=>move('.cart-row button[data-a="plus"]',650));await step(()=>focus('.cart-row .qty-box',300));await cue('Mit Plus und Minus in der Zeile wird nur die Menge dieser Position verändert.','Plus und Minus');
   await step(()=>move('.position-discount-button',650));await step(()=>focus('.position-discount-button',300));await cue('Über Positionsrabatt wird ausschließlich diese Artikelposition rabattiert.','Positionsrabatt');
   await step(()=>move('.delete-row',650));await step(()=>focus('.delete-row',300));await cue('Der Mülleimer in der Zeile löscht nur diesen Artikel aus dem offenen Warenkorb.','Position löschen');
   await step(()=>move('#discountBtn',650));await step(()=>focus('#discountBtn, #discountDisplay, #grandTotal',300));await cue('Unter dem Warenkorb befinden sich Gesamtrabatt und Gesamtsumme. Ein Gesamtrabatt wirkt auf den gesamten offenen Vorgang.','Gesamtrabatt und Summe');
  } else if(name==='paymentAreaTour'){
   api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(700);
   await step(()=>move('#banknotes',700));await step(()=>focus('#banknotes, #coins',300));await cue('Über Scheine und Münzen wird der erhaltene Barbetrag eingegeben.','Geldbetrag erfassen');
   await step(()=>move('#changeDisplay',700));await step(()=>focus('#changeDisplay, #givenDisplay, #dueDisplay',300));await cue('Die Anzeigen zeigen gegebenen Betrag, noch offenen Betrag und das errechnete Rückgeld.','Rückgeldanzeige');
   await step(()=>move('#exactCashBtn',650));await step(()=>focus('#exactCashBtn',300));await cue('Stimmt so wird verwendet, wenn der Kunde auf Rückgeld verzichtet. Der Mehrbetrag wird als Trinkgeld behandelt.','Stimmt so');
   await step(()=>move('#cardBtn',650));await step(()=>focus('#cardBtn',300));await cue('Diese Taste ist für eine freigegebene Kartenzahlung vorgesehen.','Kartenzahlung');
   await step(()=>move('#payBtn',650));await step(()=>focus('#payBtn, #checkoutQrMini',300));await cue('Die große Bezahltaste schließt den Vorgang ab. Der eingeblendete QR-Code kann für freigegebene Scanner- oder Zahlungsabläufe verwendet werden.','Bezahlen und QR-Code');
  } else if(name==='specialButtonsTour'){
   await step(()=>move('#staffBtn',650));await step(()=>focus('#staffBtn',300));await cue('Personal verbucht Personalbeköstigung als eigene Buchungsart. Es ist kein normaler Rabatt.','Personal');
   await step(()=>move('#depositBtn',650));await step(()=>focus('#depositBtn',300));await cue('Pfandrückgabe öffnet die Rückgabeartikel für Glas, Feuerzange oder weitere hinterlegte Pfandarten.','Pfandrückgabe');
   await step(()=>move('#tipBtn',650));await step(()=>focus('#tipBtn',300));await cue('Über Trinkgeld kann ein Trinkgeldbetrag gezielt erfasst werden.','Trinkgeld');
   await step(()=>move('#complaintBtn',650));await step(()=>focus('#complaintBtn',300));await cue('Reklamation startet einen kontrollierten Reklamationsvorgang. Ein abgeschlossener Verkauf darf nicht einfach durch Löschen ersetzt werden.','Reklamation');
   await step(()=>move('#printBonBtn',650));await step(()=>focus('#printBonBtn',300));await cue('Bon druckt beziehungsweise öffnet die vorgesehenen Bonfunktionen.','Bon');
   await step(()=>move('#moreBtn',650));await step(()=>focus('#moreBtn',300));await cue('Unter Mehr befinden sich Funktionen, die im normalen Verkauf seltener benötigt werden.','Mehr');
  } else if(name==='surfaceTour'){await step(()=>move('.app-header',850));await step(()=>focus('.app-header',1000));await step(()=>move('#categories',900));await step(()=>focus('#categories',900));await step(()=>move('#productGrid',900));await step(()=>focus('#productGrid',1000));await step(()=>move('#cartQuantityBar',900));await step(()=>focus('#cartQuantityBar',900));await step(()=>move('#cartList',900));await step(()=>focus('#cartList',900));await step(()=>move('#banknotes',900));await step(()=>focus('#banknotes, #coins',900));await step(()=>move('.main-actions',900));await step(()=>focus('.main-actions',1000));
  } else if(name==='singleSale'){api.clearCart?.();await wait(900);await step(()=>move(()=>tile('Glühwein rot'),1250));await step(()=>click(()=>tile('Glühwein rot'),{perform:true,after:900}));await step(()=>focus('#cartList',1700));await wait(900);await step(()=>move('#banknotes button[data-value="10"]',1100));await step(()=>click('#banknotes button[data-value="10"]',{after:1200}));await step(()=>focus('#changeDisplay, #givenDisplay, #dueDisplay',1600));await wait(900);await step(()=>click('#payBtn',{after:1600}));
  } else if(name==='multiSale'){api.clearCart?.();await wait(700);await step(()=>move(()=>tile('Glühwein rot'),1150));await step(()=>click(()=>tile('Glühwein rot'),{perform:true,after:900}));const foodTab=[...document.querySelectorAll('#categories button,.category-tabs button')].find(x=>/essen|speisen|grill/i.test(x.textContent));if(foodTab)await step(()=>click(()=>foodTab,{after:1200}));await step(()=>move(()=>tile('Bratwurst'),1150));await step(()=>click(()=>tile('Bratwurst'),{perform:true,after:900}));await step(()=>focus('#cartList',1900));
  } else if(name==='quantityControls'){api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(1200);await step(()=>move('.cart-row button[data-a="plus"]',950));await step(()=>click('.cart-row button[data-a="plus"]',{after:900}));await step(()=>focus('#cartQuantityBar, #cartList',1400));
  } else if(name==='cartDelete'){api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(700);api.addStandardProduct?.('Bratwurst');await wait(1000);await step(()=>move('.cart-row .delete-row',950));await step(()=>click('.cart-row .delete-row',{after:900}));await step(()=>focus('#cartList',1600));
  } else if(name==='paymentFlow'){api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(1800);await step(()=>focus('#cartList',1500));await wait(700);await step(()=>move('#banknotes button[data-value="10"]',1100));await step(()=>click('#banknotes button[data-value="10"]',{after:1300}));await step(()=>focus('#changeDisplay, #givenDisplay, #dueDisplay',1700));await wait(1000);await step(()=>click('#payBtn',{after:1700}));
  } else if(name==='tipsFlow'){await step(()=>move('#exactCashBtn',850));await step(()=>focus('#exactCashBtn',800));await step(()=>move('#roundUpBtn',850));await step(()=>focus('#roundUpBtn',800));await step(()=>click('#tipBtn',{after:800}));await step(()=>focus('#tipDialog',1300));
  } else if(name==='accountPreview'){await step(()=>move('#moreBtn',900));await step(()=>focus('#moreBtn',1000));
  } else if(name==='staffBooking'){api.clearCart?.();api.addStandardProduct?.('Bratwurst');await wait(1200);await step(()=>click('#staffBtn',{after:1000}));await step(()=>focus('#staffBtn, #cartList',1100));
  } else if(name==='depositCalculation'){api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(900);api.addDepositReturn?.('Glasrückgabe');await wait(1100);await step(()=>focus('#cartList',1400));await step(()=>focus('#payBtn, #grandTotal',1100));
  } else if(name==='productInfoDeep'){api.openProductInfo?.('Glühwein rot');await wait(800);await step(()=>focus('#productInfoDialog',1100));await step(()=>move('#productInfoDetailsBtn',850));await step(()=>focus('#productInfoDetailsBtn',900));
  } else if(name==='variantsFlow'){api.clearCart?.();await step(()=>click(()=>plus('Glühwein rot')||tile('Glühwein rot'),{perform:true,after:800}));await step(()=>focus('dialog[open], .variant-dialog, .product-variants',1300));
  } else if(name==='favoritesFlow'){await step(()=>move('#categories',900));await step(()=>focus('#categories',800));const fav=[...document.querySelectorAll('#categories button, .category-tabs button')].find(x=>x.textContent.includes('Favoriten'));if(fav)await step(()=>click(()=>fav,{after:900}));await step(()=>focus('#productGrid',1300));
  } else if(name==='poolArticlePreview'){await step(()=>focus('#productGrid',1200));await step(()=>focus('#cartList',1000));
  } else if(name==='happyHourPreview'){await step(()=>focus('#productGrid',1000));await step(()=>focus('#cartList, #grandTotal',1200));
  } else if(name==='trainingModeFlow'){
   if(document.body.classList.contains('rush-mode'))await step(()=>click('#rushModeBtn',{after:900}));
   if(document.body.classList.contains('training-mode'))await step(()=>click('#trainingModeTopBtn',{after:700}));
   await step(()=>move('#trainingModeTopBtn',1000));await step(()=>click('#trainingModeTopBtn',{after:1200}));await step(()=>focus('#workspaceModePanel, #trainingBanner',1500));
   api.clearCart?.();api.addStandardProduct?.('Glühwein rot');await wait(900);await step(()=>focus('#cartList, #grandTotal',1300));await step(()=>click('#trainingModeTopBtn',{after:1000}));
  } else if(name==='rushModeFlow'){
   if(document.body.classList.contains('training-mode'))await step(()=>click('#trainingModeTopBtn',{after:800}));
   if(document.body.classList.contains('rush-mode'))await step(()=>click('#rushModeBtn',{after:700}));
   await step(()=>move('#rushModeBtn',1000));await step(()=>click('#rushModeBtn',{after:1400}));await step(()=>focus('#productGrid',1400));await step(()=>focus('.main-actions, #categories',1200));await step(()=>click('#rushModeBtn',{after:1100}));
  } else if(name==='scannerFlow'){
   api.clearCart?.();await step(()=>move('.scanner-card',1000));await step(()=>focus('.scanner-card',1200));await step(()=>move('#operatorBtn',900));await step(()=>focus('#operatorBtn',1000));
   api.addStandardProduct?.('Glühwein rot');await wait(850);api.addStandardProduct?.('Glühwein rot');await wait(900);await step(()=>focus('#cartList',1400));await step(()=>move('#payBtn',1000));await step(()=>focus('#payBtn',1000));
  } else if(name==='overview'){await step(()=>move('#categoryTabs, .category-tabs',900));await step(()=>focus('#categoryTabs, .category-tabs',900));await step(()=>move('#productGrid',1000));await step(()=>focus('#productGrid',900));await step(()=>move('#cartList, .cart-area',1000));await step(()=>focus('#cartList, .cart-area',900));await step(()=>move('#payBtn',1000));await step(()=>focus('#payBtn',1000));
  } else if(name==='standardArticle'){
   api.clearCart?.();await wait(700);await step(()=>move(()=>tile('Glühwein rot'),1250));await step(()=>click(()=>tile('Glühwein rot'),{perform:true,after:900}));await step(()=>focus('#cartList, .cart-area',1600));
  } else if(name==='variants'){api.clearCart?.();await wait(600);await step(()=>move(()=>plus('Glühwein rot')||tile('Glühwein rot'),1100));await step(()=>click(()=>plus('Glühwein rot')||tile('Glühwein rot'),{perform:true,after:900}));await step(()=>focus('dialog[open], .variant-dialog, .product-variants',1500));
  } else if(name==='fullSale'){
   api.clearCart?.();await wait(650);await step(()=>move(()=>tile('Glühwein rot'),1250));await step(()=>click(()=>tile('Glühwein rot'),{perform:true,after:900}));await step(()=>focus('#cartList, .cart-area',1300));await step(()=>click('#banknotes button[data-value="10"]',{after:1200}));await step(()=>focus('#changeDisplay, #givenDisplay, #dueDisplay',1500));await step(()=>click('#payBtn',{after:1700}));
  } else if(name==='modeControls'){await step(()=>move('.mode-quick-switches, #screenLockBtn',1200));await step(()=>focus('.mode-quick-switches, #screenLockBtn',1600));
  } else if(name==='productInfo'){api.openProductInfo?.('Glühwein rot');await wait(700);await step(()=>move('dialog[open]',900));await step(()=>focus('dialog[open]',1700));
  } else if(name==='complaintFlow'){
   await step(()=>click('#moreBtn',{after:700}));await step(()=>move('[data-action="withdraw"]',900));await step(()=>click('[data-action="withdraw"]',{after:900}));
   api.openComplaint?.('reason-mode');await wait(600);await step(()=>move('[data-withdraw-reason="Reklamation"]',900));await step(()=>click('[data-withdraw-reason="Reklamation"]',{perform:false,after:450}));
   api.openComplaint?.('article');await wait(650);await step(()=>focus('#complaintArticleList',1200));
   api.openComplaint?.('specific-reason');await wait(650);await step(()=>move('[data-complaint-reason="Kalt ausgegeben"]',900));await step(()=>focus('[data-complaint-reason="Kalt ausgegeben"]',1100));
   api.openComplaint?.('review');await wait(650);await step(()=>focus('#withdrawAmount, #complaintBonReference, #withdrawNote',1600));
  } else if(name==='depositFlow'){
   api.clearCart?.();await step(()=>click('#depositBtn',{after:900}));await step(()=>move(()=>tile('Glasrückgabe'),1000));await step(()=>click(()=>tile('Glasrückgabe'),{perform:false,after:300}));api.addDepositReturn?.('Glasrückgabe');await wait(900);await step(()=>focus('#cartList, .cart-area',1600));
  } else if(name==='complaintOpen'){await step(()=>click('#moreBtn',{after:800}));await step(()=>move('[data-action="withdraw"]',900));await step(()=>focus('[data-action="withdraw"]',1500));
  } else if(name==='complaintReasonMode'){api.openComplaint?.('reason-mode');await wait(700);await step(()=>move('[data-withdraw-reason="Reklamation"]',900));await step(()=>focus('[data-withdraw-reason="Reklamation"]',1500));
  } else if(name==='complaintArticle'){api.openComplaint?.('article');await wait(800);await step(()=>focus('#complaintArticleList',1600));
  } else if(name==='complaintSpecificReason'){api.openComplaint?.('specific-reason');await wait(800);await step(()=>move('[data-complaint-reason="Kalt ausgegeben"]',900));await step(()=>focus('[data-complaint-reason="Kalt ausgegeben"]',1500));
  } else if(name==='complaintReview'){api.openComplaint?.('review');await wait(900);await step(()=>focus('#withdrawAmount, #complaintBonReference, #withdrawNote',1800));
  } else if(name==='depositOpen'){await step(()=>click('#depositBtn',{after:1000}));await step(()=>focus('#productGrid',1400));
  } else if(name==='depositSelect'){api.openDeposit?.();await wait(700);await step(()=>move(()=>tile('Glasrückgabe'),1100));await step(()=>focus(()=>tile('Glasrückgabe'),1500));
  } else if(name==='depositCart'){api.clearCart?.();api.addDepositReturn?.('Glasrückgabe');await wait(1000);await step(()=>focus('#cartList, .cart-area',1700));
  } else if(name==='staffMode'){await step(()=>click('#staffBtn',{after:900}));await step(()=>focus('#staffBtn, .staff-active',1500));
  } else if(name==='closingOpen'){await step(()=>click('#moreBtn',{after:700}));await step(()=>move('[data-action="closing"]',900));await step(()=>click('[data-action="closing"]',{after:900}));await step(()=>focus('dialog[open]',1600));
  }
  parent.postMessage({type:'KC_TRAINING_DEMO_DONE',name},'*');
 }catch(e){if(e.message!=='cancelled')parent.postMessage({type:'KC_TRAINING_DEMO_ERROR',name,message:e.message},'*')}
}
window.addEventListener('message',e=>{const m=e.data;if(!m||m.type!=='KC_TRAINING_DEMO')return;if(m.action==='cancel')reset();else demo(m.name)});
window.addEventListener('load',()=>{inject();parent.postMessage({type:'KC_TRAINING_DEMO_READY'},'*')});
})();
