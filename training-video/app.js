(() => {
'use strict';
const $=id=>document.getElementById(id);
const escapeHtml=value=>String(value??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
const STORAGE_KEY='kc_training_profile_v0254';
const FEEDBACK_KEY='kc_training_feedback_queue_v1';
const TRAINING_VERSION='3.1.4-FUTURA';
const PRODUCT_VERSION='0.31.3.6.11';
const TRAINING_IMAGE_CONFIG='assets/training/images/training-images.json';
let trainingImageMap={};let stillPreviewOpen=false;
let speechEpoch=0;
let readAlongTimer=null;
const FEEDBACK_SCHEMA='KC_TRAINING_FEEDBACK_V1';
const sections=['welcome','futuraIntro','chapterOverview','dashboard','extensionInfo','lesson','practice','certificate','bonus','trainingTuv','survey'];
function primeSpeechEngine(){try{if(!window.speechSynthesis)return;speechSynthesis.cancel();speechSynthesis.resume();const warm=new SpeechSynthesisUtterance(' ');warm.lang='de-DE';warm.volume=0;speechSynthesis.speak(warm)}catch{}}
let trainingAudioContext=null;
function setTrainingVoiceMonitor(mode='ready',label=''){const el=$('trainingVoiceMonitor'),txt=$('trainingVoiceMonitorText');if(!el)return;el.classList.remove('is-ready','is-speaking','is-pending','is-off','is-error');el.classList.add(`is-${mode}`);const d={ready:'Ton bereit',speaking:'Stimme läuft',pending:'Stimme startet',off:'Ton aus',error:'Tonfehler'}[mode]||'Ton bereit';if(txt)txt.textContent=label||d}
async function unlockTrainingAudio(){try{const Ctx=window.AudioContext||window.webkitAudioContext;if(Ctx){trainingAudioContext=trainingAudioContext||new Ctx();if(trainingAudioContext.state==='suspended')await trainingAudioContext.resume()}primeSpeechEngine();return true}catch{return false}}
async function playTrainingTestTone(){const ok=await unlockTrainingAudio();if(!ok||!trainingAudioContext)throw new Error('AudioContext nicht verfügbar');return new Promise(resolve=>{const o=trainingAudioContext.createOscillator(),g=trainingAudioContext.createGain();o.frequency.value=660;g.gain.setValueAtTime(.0001,trainingAudioContext.currentTime);g.gain.exponentialRampToValueAtTime(.09,trainingAudioContext.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,trainingAudioContext.currentTime+.28);o.connect(g).connect(trainingAudioContext.destination);o.start();o.stop(trainingAudioContext.currentTime+.3);o.onended=resolve})}
async function runTrainingAudioTuv(){const status=$('trainingAudioTuvStatus'),btn=$('trainingAudioTuv');btn.disabled=true;status.className='status';status.textContent='Prüfung läuft: Testton und Testansage …';try{soundEnabled=true;profile.sound=true;$('globalSoundToggle').checked=true;$('startSound').checked=true;saveProfile();setTrainingVoiceMonitor('pending','Audio-TÜV läuft');await playTrainingTestTone();await new Promise((resolve,reject)=>speak(addressText(`Dies ist ein Audiotest. Ich bin ${assistantName()}, Ihr Hauptcoach.`),{onend:resolve,onerror:reject}));status.className='status pass';status.textContent='BESTANDEN: Testton und Testansage wurden gestartet. Bitte bestätigen Sie zusätzlich, dass beides hörbar war.';setTrainingVoiceMonitor('ready','Ton geprüft')}catch(err){status.className='status fail';status.textContent='NICHT BESTANDEN: '+(err?.message||'Audioausgabe nicht verfügbar');setTrainingVoiceMonitor('error','Tonfehler')}finally{btn.disabled=false;syncGlobalSettingsUi()}}

const quick=[
 {title:'Kapitel 1 · Überblick über die Oberfläche des Bilderrechners',text:'Bevor wir den ersten Verkauf durchführen, sehen wir uns gemeinsam die Oberfläche des KC Bilderrechners an. Wir gehen dabei von oben nach unten vor.',tip:'Zuerst Orientierung, danach Bedienung: So findest du später jede Funktion schneller.',selector:'#app',demo:'orientationOverview',synced:true,quiz:{question:'Welcher Bereich befindet sich rechts in der Oberfläche des Bilderrechners?',answers:['Die Warengruppen','Der Warenkorb','Nur das Vereinslogo','Die Artikelbilder'],correct:1,repeat:'Der Warenkorb befindet sich rechts. Dort werden die ausgewählten Artikel, Mengen und Summen angezeigt.'}},
 {title:'Kapitel 2 · Kopfzeile und Statusanzeigen',text:'Die Kopfzeile ist die wichtigste Informationszeile am oberen Bildschirmrand. Prüfe dort vor Arbeitsbeginn und beim Schichtwechsel den angemeldeten Bediener, die Kassenbezeichnung und den Betriebszustand. Außerdem findest du dort Version, Datum, Uhrzeit sowie Bedienelemente für Sperre, Ton, Menü und Programmende.',tip:'Merksatz: Arbeite niemals unter dem Namen eines anderen Bedieners und kontrolliere vor dem ersten Verkauf den richtigen Betriebszustand.',selector:'.app-header',demo:'headerTour',synced:true,trainingImage:'kopfzeile',quiz:{question:'Was solltest du in der Kopfzeile besonders beim Schichtwechsel kontrollieren?',answers:['Nur die Uhrzeit','Den angemeldeten Bediener und den Betriebszustand','Den Preis des letzten Artikels','Die Anzahl der Warengruppen'],correct:1,repeat:'Beim Schichtwechsel müssen vor allem der angemeldete Bediener und der richtige Betriebszustand kontrolliert werden.'}},
 {title:'Kapitel 3 · Bediener- und Moduszeile',text:'Unter der Kopfzeile findest du den Bediener, die Artikelsuche, Trainingsmodus, Stoßzeiten, Happy Hour und die Meldungsanzeige.',tip:'Vor einem echten Verkauf muss klar erkennbar sein, welcher Bediener und welcher Modus aktiv sind.',selector:'.mode-strip',demo:'modeRowTour',synced:true,trainingImage:'meldungszeile',quiz:{question:'Welcher Modus darf keine echten Umsätze erzeugen?',answers:['Normalbetrieb','Trainingsmodus','Stoßzeitenmodus','Happy Hour'],correct:1,repeat:'Im Trainingsmodus werden Übungsvorgänge getrennt behandelt und dürfen nicht in den normalen Umsatz einfließen.'}},
 {title:'Kapitel 4 · Warengruppen und Artikelbuttons',text:'Die Warengruppen bestimmen, welche Artikel angezeigt werden. Ein Artikelbutton zeigt Name, Bild und Preis. Zusätzliche Zeichen führen zu Informationen, Varianten oder Happy-Hour-Preisen.',tip:'Die große Artikelfläche verkauft den Standardartikel. Das Pluszeichen öffnet Varianten.',selector:'#categories, #productGrid',demo:'productsTour',synced:true,trainingImage:'warengruppen_artikel',quiz:{question:'Wofür steht das Pluszeichen auf einem Artikelbutton?',answers:['Menge sofort verdoppeln','Varianten oder Zusätze öffnen','Artikel löschen','Happy Hour einschalten'],correct:1,repeat:'Das Pluszeichen öffnet die Varianten- oder Zusatzauswahl des Artikels.'}},
 {title:'Kapitel 5 · Warenkorb und Mengensteuerung',text:'Im Warenkorb siehst du alle gewählten Artikel. Mengen lassen sich oben oder direkt in der Artikelzeile ändern. Einzelne Positionen und der komplette offene Warenkorb können getrennt gelöscht werden.',tip:'Achte darauf, ob du nur eine Position oder den gesamten offenen Warenkorb löschen möchtest.',selector:'#cartQuantityBar, #cartList, #grandTotal',demo:'cartAreaTour',synced:true,trainingImage:'warenkorb',quiz:{question:'Welcher Mülleimer löscht nur einen einzelnen Artikel?',answers:['Der Mülleimer in der betreffenden Warenkorbzeile','Die Taste Warenkorb löschen','Die Taste Mehr','Der Zurückpfeil'],correct:0,repeat:'Der Mülleimer direkt in der Warenkorbzeile entfernt nur diese Position.'}},
 {title:'Kapitel 6 · Zahlungs- und Rückgeldbereich',text:'Im Zahlungsbereich werden Scheine und Münzen erfasst. Die Kasse zeigt gegebenen Betrag, offenen Betrag und Rückgeld. Bezahlt werden kann passend, über Stimmt so, bar oder über freigegebene QR- und Kartenfunktionen.',tip:'Rückgeld immer kontrollieren und laut nennen, bevor der Vorgang abgeschlossen wird.',selector:'#banknotes, #coins, #changeDisplay, #payBtn',demo:'paymentAreaTour',synced:true,trainingImage:'zahlungsbereich',quiz:{question:'Was bedeutet „Stimmt so“?',answers:['Der Warenkorb wird gelöscht','Der Kunde erhält den vollen Zahlbetrag zurück','Der eingegebene Mehrbetrag wird als Trinkgeld behandelt','Die Zahlung wird auf später verschoben'],correct:2,repeat:'Bei „Stimmt so“ wird der über dem Rechnungsbetrag liegende Zahlbetrag als Trinkgeld erfasst.'}},
 {title:'Kapitel 7 · Sondertasten',text:'Unterhalb des Zahlungsbereichs befinden sich Sondertasten wie Personal, Pfandrückgabe, Trinkgeld, Reklamation, Bon und Mehr. Sie werden nur für besondere Vorgänge verwendet.',tip:'Sondertasten nicht mit normalen Verkaufsartikeln oder Rabatten verwechseln.',selector:'.main-actions',demo:'specialButtonsTour',synced:true,trainingImage:'sondertasten',quiz:{question:'Wofür dient die Taste Personal?',answers:['Für einen normalen Barverkauf','Für Personalbeköstigung als eigene Buchungsart','Für den Gesamtrabatt','Zum Öffnen des Menüs'],correct:1,repeat:'Personal erfasst Personalbeköstigung als eigene Buchungsart und ist kein normaler Rabattverkauf.'}},
 {title:'Kapitel 8 · Einzelartikel verkaufen',text:'Ich wähle einen einzelnen Artikel über seine große Artikeltaste aus. Der Artikel erscheint sofort im Warenkorb. Danach wird die Barzahlung gestartet und der Vorgang abgeschlossen.',tip:'Für den Standardartikel immer die große Artikelfläche verwenden. Das Pluszeichen ist ausschließlich für Varianten gedacht.',selector:'#productGrid',demo:'singleSale',quiz:{question:'Wo tippst du für den Verkauf eines Standardartikels?',answers:['Auf die große Artikelfläche','Immer auf das Pluszeichen','Auf den Mülleimer','Auf die Uhrzeit'],correct:0,repeat:'Ein Standardartikel wird über seine große Artikelfläche ausgewählt. Das Pluszeichen ist für Varianten und Zusätze vorgesehen.'}},
 {title:'Kapitel 9 · Mehrere Artikel und verschiedene Warengruppen',text:'Jetzt werden mehrere Artikel nacheinander ausgewählt, auch aus unterschiedlichen Warengruppen. Mehrfaches Antippen einer Artikeltaste erhöht die Menge dieses Artikels.',tip:'Vor dem Bezahlen immer Artikel, Mengen und Gesamtsumme kontrollieren.',selector:'#categories, #productGrid',demo:'multiSale',quiz:{question:'Was bewirkt mehrfaches Antippen derselben Artikeltaste?',answers:['Die Menge dieses Artikels wird erhöht','Der Artikel wird gelöscht','Die Kasse wird gesperrt','Die Warengruppe wird geschlossen'],correct:0,repeat:'Mehrfaches Antippen derselben Artikeltaste erhöht die Menge dieses Artikels im Warenkorb.'}},
 {title:'Kapitel 10 · Mengen im Warenkorb ändern',text:'Eine Menge kann durch mehrfaches Antippen der Artikeltaste, über die Mengenknöpfe im Kopf des Warenkorbs und direkt in der jeweiligen Artikelzeile geändert werden.',tip:'Zuerst die richtige Warenkorbzeile markieren und danach die gewünschte Mengensteuerung verwenden.',selector:'#cartQuantityBar, #cartList',demo:'quantityControls',quiz:{question:'Was muss vor einer Mengenänderung in der Artikelzeile geprüft werden?',answers:['Ob die richtige Warenkorbzeile ausgewählt ist','Ob die Uhr richtig geht','Ob der Ton ausgeschaltet ist','Ob das Logo sichtbar ist'],correct:0,repeat:'Vor der Mengenänderung muss die richtige Warenkorbzeile ausgewählt beziehungsweise eindeutig zugeordnet sein.'}},
 {title:'Kapitel 11 · Artikel oder gesamten Warenkorb löschen',text:'Ein einzelner Artikel wird über das Mülleimersymbol seiner Warenkorbzeile entfernt. Der komplette offene Warenkorb kann über Warenkorb löschen geleert werden.',tip:'Ein Löschen ersetzt niemals eine Reklamation eines bereits abgeschlossenen Verkaufs.',selector:'#cartList',demo:'cartDelete',quiz:{question:'Wie entfernst du nur eine einzelne offene Position?',answers:['Mit dem Mülleimer in ihrer Warenkorbzeile','Mit Warenkorb löschen','Durch Programmende','Mit der Personaltaste'],correct:0,repeat:'Nur der Mülleimer in der betreffenden Warenkorbzeile entfernt diese einzelne offene Position.'}},
 {title:'Kapitel 12 · Warenkorb bezahlen und Rückgeld',text:'Nach der Kontrolle wird der erhaltene Barbetrag über Scheine oder Münzen eingegeben. Die Kasse zeigt Zahlbetrag und Rückgeld.',tip:'Das angezeigte Rückgeld laut nennen und erst danach den Vorgang abschließen.',selector:'#banknotes, #coins, #payBtn',demo:'paymentFlow',quiz:{question:'Was ist vor dem endgültigen Abschluss einer Barzahlung zu tun?',answers:['Rückgeld kontrollieren und laut nennen','Den Warenkorb ungesehen löschen','Die Kasse neu laden','Die Warengruppe wechseln'],correct:0,repeat:'Vor dem Abschluss wird das angezeigte Rückgeld kontrolliert und dem Gast laut genannt.'}}
];
const advanced=[
 {title:'Kapitel 7 · Trinkgeld vollständig erfassen',text:'Trinkgeld kann auf mehreren Wegen erfasst werden. Nach Eingabe des erhaltenen Geldbetrags kann Stimmt so verwendet werden. Über Aufrunden wird ein Zielbetrag gewählt. Nachträgliches Trinkgeld wird über die Trinkgeldtaste und eine Betragsauswahl gebucht. Das Trinkgeld wird im Abschluss getrennt vom Warenumsatz ausgewiesen.',tip:'Stimmt so erst nach Erfassung des erhaltenen Zahlbetrags verwenden. Trinkgeld niemals als normalen Verkaufsartikel buchen.',selector:'#exactCashBtn, #roundUpBtn, #tipBtn',demo:'tipsFlow',quiz:{question:'Wann darf „Stimmt so“ verwendet werden?',answers:['Vor Eingabe des erhaltenen Geldbetrags', 'Erst nach Eingabe des erhaltenen Geldbetrags', 'Nur beim Kartenzahlen', 'Nie'],correct:1,repeat:'„Stimmt so“ wird erst nach Erfassung des erhaltenen Zahlbetrags verwendet.'}},
 {title:'Kapitel 8 · Buchung auf ein Personen- oder Organisationskonto',text:'Organisationen oder berechtigte Personen können Waren auf Rechnung erhalten. Die ausgewählten Artikel werden einem Konto zugeordnet und dort zu einem späteren Rechnungsbetrag summiert. Dieses Kapitel ist in der Schulungsstruktur vorbereitet. Die vorliegende Stand-alone-Kasse besitzt jedoch noch keine freigegebene vollständige Kontobuchungsoberfläche.',tip:'Kontobuchungen dürfen erst praktisch geschult werden, wenn Kontoauswahl, Berechtigung, Sammelrechnung und Abschluss im Bilderrechner freigegeben sind.',selector:'#moreBtn',demo:'accountPreview',availability:'planned',quiz:{question:'Wann darf die Kontobuchung praktisch verwendet werden?',answers:['Immer sofort', 'Erst wenn Kontoauswahl, Berechtigung und Abrechnung freigegeben sind', 'Nur ohne Berechtigung', 'Nur im Trainingsmodus'],correct:1,repeat:'Die Kontobuchung darf erst nach vollständiger Freigabe aller notwendigen Funktionen verwendet werden.'}},
 {title:'Kapitel 9 · Personalbeköstigung verbuchen',text:'Zuerst wird der Artikel mit der richtigen Menge in den Warenkorb gelegt. Statt über Bezahlen wird der Vorgang über Personal verbucht. Dadurch wird die Ware als Personalbeköstigung erfasst, ohne eine personenbezogene Einzelzuordnung vorzunehmen.',tip:'Personal ist eine eigene Buchungsart und kein Rabattverkauf.',selector:'#staffBtn',demo:'staffBooking',quiz:{question:'Wie wird Personalbeköstigung korrekt abgeschlossen?',answers:['Über Bezahlen', 'Über die Taste Personal', 'Als Rabatt', 'Durch Löschen'],correct:1,repeat:'Personalbeköstigung wird über die eigene Taste Personal verbucht.'}},
 {title:'Kapitel 10 · Pfandverkauf, Pfandrückgabe und Auszahlung',text:'Pfandaufschläge sind bei den entsprechenden Verkaufsartikeln bereits enthalten. Bei der Rückgabe wird in der Warengruppe Pfand der passende Rückgabeartikel und die Menge gewählt. Verkaufsartikel und Rückgaben können im selben Warenkorb verrechnet werden. Entsteht ein negativer Gesamtbetrag, zeigt die Kasse Auszahlung und der Bezahlknopf ändert seinen Zustand. Glas und Feuerzange können einzeln oder gemeinsam zurückgegeben werden.',tip:'Pfandart und Rückgabemenge immer genau mit den tatsächlich abgegebenen Gegenständen abgleichen.',selector:'#depositBtn, #cartList, #payBtn',demo:'depositCalculation',quiz:{question:'Was muss bei einer Pfandrückgabe geprüft werden?',answers:['Nur die Uhrzeit', 'Pfandart und tatsächliche Rückgabemenge', 'Nur der Bedienername', 'Nur der Ton'],correct:1,repeat:'Pfandart und Menge müssen mit den tatsächlich zurückgegebenen Gegenständen übereinstimmen.'}},
 {title:'Kapitel 11 · Artikelinformationen und Allergene',text:'Oben rechts auf entsprechend vorbereiteten Artikeltasten befindet sich die Infotaste. Der erste Klick öffnet eine Schnellübersicht mit Allergenen und wichtigen Hinweisen. Über Weitere Informationen werden zusätzliche Angaben wie Zutaten und Nährwerte angezeigt.',tip:'Bei Allergenen und Inhaltsstoffen ausschließlich die hinterlegten Informationen verwenden und niemals raten.',selector:'#productGrid',demo:'productInfoDeep',quiz:{question:'Wie werden Fragen zu Allergenen beantwortet?',answers:['Nach Vermutung', 'Nur anhand der hinterlegten Informationen', 'Mit einer privaten Internetrecherche', 'Gar nicht'],correct:1,repeat:'Bei Allergenen dürfen ausschließlich die hinterlegten Informationen verwendet werden.'}},
 {title:'Kapitel 12 · Varianten über das Pluszeichen auswählen',text:'Das Pluszeichen auf einer Artikeltaste öffnet die zugehörigen Varianten. Dort kann die gewünschte Ausführung gewählt werden. Varianten können alternativ auch zusammen mit dem Hauptartikel auf einer eigenen gemeinsamen Auswahltaste angeboten werden.',tip:'Große Artikelfläche bedeutet Standardartikel; Pluszeichen bedeutet Varianten- oder Zusatzauswahl.',selector:'#productGrid',demo:'variantsFlow',quiz:{question:'Wofür steht das Pluszeichen?',answers:['Standardartikel sofort verkaufen', 'Varianten oder Zusätze öffnen', 'Artikel löschen', 'Kasse sperren'],correct:1,repeat:'Das Pluszeichen öffnet Varianten oder Zusätze.'}},
 {title:'Kapitel 13 · Favoriten und meistverkaufte Artikel',text:'Goldene Sterne oben rechts kennzeichnen Favoriten beziehungsweise häufig verkaufte Artikel. Diese Artikel werden zusätzlich in der eigenen Warengruppe Favoriten gesammelt und können dort besonders schnell ausgewählt werden.',tip:'Der Stern ist eine Orientierungshilfe. Artikelname und Preis trotzdem vor dem Antippen prüfen.',selector:'#categories, #productGrid',demo:'favoritesFlow',quiz:{question:'Was kennzeichnet der goldene Stern?',answers:['Einen gelöschten Artikel', 'Favoriten oder häufig verkaufte Artikel', 'Pfandartikel', 'Reklamationen'],correct:1,repeat:'Der goldene Stern kennzeichnet Favoriten beziehungsweise häufig verkaufte Artikel.'}},
 {title:'Kapitel 14 · Pool- und Kombinationsartikel',text:'Bei Pool- oder Kombinationsartikeln liegen häufig gemeinsam verkaufte Produkte auf einer gemeinsamen Artikeltaste. Ein Klick legt beide Bestandteile sofort in den Warenkorb, dort werden sie weiterhin einzeln angezeigt. Für eine Kombination kann ein eigener Gesamtpreis hinterlegt sein.',tip:'Im Warenkorb kontrollieren, ob alle Bestandteile und der vorgesehene Kombinationspreis korrekt übernommen wurden.',selector:'#productGrid, #cartList',demo:'poolArticlePreview',availability:'planned',quiz:{question:'Was ist bei einem Kombinationsartikel zu kontrollieren?',answers:['Nur das Bild', 'Alle Bestandteile und der Kombinationspreis', 'Nur die Uhrzeit', 'Nur die Warengruppe'],correct:1,repeat:'Im Warenkorb müssen alle Bestandteile und der vorgesehene Kombinationspreis geprüft werden.'}},
 {title:'Kapitel 15 · Happy Hour und zeitabhängige Sonderpreise',text:'Für einen definierten Zeitraum kann ein Happy-Hour-Preis gelten. Innerhalb dieses Zeitfensters wird automatisch der hinterlegte Sonderpreis berechnet. Im Warenkorb sollen Standardpreis und Happy-Hour-Preis nachvollziehbar ausgewiesen werden. Dieses Kapitel ist vorbereitet, bis Zeitregel, Preisanzeige und Abrechnung vollständig freigegeben sind.',tip:'Der Bediener muss Beginn, Ende und sichtbare Preiskennzeichnung kontrollieren können.',selector:'#productGrid, #cartList',demo:'happyHourPreview',availability:'planned',quiz:{question:'Was muss bei Happy Hour sichtbar kontrollierbar sein?',answers:['Nur das Logo', 'Beginn, Ende und Preiskennzeichnung', 'Nur der Ton', 'Nur der Bediener'],correct:1,repeat:'Beginn, Ende und die sichtbare Preiskennzeichnung müssen kontrollierbar sein.'}},
 {title:'Kapitel 16 · Reklamation als vollständiger Vorgang',text:'Eine Reklamation wird in einem einzigen zusammenhängenden Ablauf bearbeitet: Reklamation öffnen, Artikel und Menge erfassen, Grund auswählen, Bonbezug und Betrag prüfen, Notiz ergänzen und speichern.',tip:'Eine Reklamation niemals durch Löschen eines offenen Warenkorbs ersetzen.',selector:'#moreBtn',demo:'complaintFlow',quiz:{question:'Was ersetzt keine Reklamation?',answers:['Ein vollständiger Reklamationsablauf', 'Das Löschen eines offenen Warenkorbs', 'Die Auswahl eines Grundes', 'Eine Notiz'],correct:1,repeat:'Das Löschen eines offenen Warenkorbs ersetzt niemals eine Reklamation.'}},
 {title:'Kapitel 17 · Trainingsmodus sicher verwenden',text:'Der Trainingsmodus kann im Normalbetrieb jederzeit ein- und wieder ausgeschaltet werden. Nach dem Einschalten verändert sich die Darstellung deutlich und in der Summen- beziehungsweise Statusanzeige wird der Trainingsmodus kenntlich gemacht. Alle in diesem Modus erfassten Artikel und abgeschlossenen Vorgänge werden getrennt als Trainingsvorgänge gespeichert und fließen nicht in den normalen Buchungslauf ein. Dadurch können Bediener direkt an der Originaloberfläche üben, ohne echte Umsätze zu erzeugen. Im Stoßzeitenmodus steht das Training bewusst nicht zur Verfügung.',tip:'Vor Beginn immer prüfen, ob der Trainingsmodus sichtbar aktiv ist. Vor dem echten Verkauf muss er wieder ausgeschaltet sein.',selector:'#trainingModeTopBtn, #workspaceModePanel, #cartList',demo:'trainingModeFlow',quiz:{question:'Was gilt vor einem echten Verkauf?',answers:['Trainingsmodus muss ausgeschaltet sein', 'Trainingsmodus muss aktiv bleiben', 'Stoßzeitenmodus muss aus sein', 'Ton muss aus sein'],correct:0,repeat:'Vor einem echten Verkauf muss der Trainingsmodus wieder ausgeschaltet sein.'}},
 {title:'Kapitel 18 · Stoßzeitenmodus für schnellen und sicheren Verkauf',text:'Bei starkem Andrang wird der Stoßzeitenmodus über die Taste Stoßzeiten eingeschaltet. Die Hintergrunddarstellung wechselt, Artikeltasten werden größer und weniger wichtige Sonderfunktionen werden ausgeblendet. Dadurch bleibt die Oberfläche ruhig, übersichtlich und auf die häufigsten Verkaufsschritte konzentriert. Personal- und weitere Sondertasten können in diesem Modus entfallen. Ein aktiver Trainingsmodus ist während Stoßzeiten nicht zulässig. Durch erneutes Antippen der Taste Stoßzeiten kehrt der KC Bilderrechner in den Normalmodus zurück; die ursprünglichen Tastengrößen und ausgeblendeten Funktionen erscheinen wieder. Happy Hour und Stoßzeiten dürfen gleichzeitig aktiv sein.',tip:'Stoßzeiten nur bei Bedarf aktivieren und nach Ende des Andrangs wieder in den Normalbetrieb wechseln.',selector:'#rushModeBtn, #productGrid, .main-actions',demo:'rushModeFlow',quiz:{question:'Wann wird der Stoßzeitenmodus verwendet?',answers:['Immer dauerhaft', 'Bei starkem Andrang und danach wieder ausgeschaltet', 'Nur für Reklamationen', 'Nur ohne Artikel'],correct:1,repeat:'Der Stoßzeitenmodus wird bei starkem Andrang aktiviert und danach wieder beendet.'}},
 {title:'Kapitel 19 · Scanner-Bedienung und Bedienerzuordnung',text:'Ein Bluetooth-Barcodescanner wird im HID-Modus mit dem Tablet gekoppelt und verhält sich wie eine Tastatur. Die Artikelnummer eines Artikels ist in einem QR-Code gespeichert. Beim Scannen wird der Artikel sofort in den Warenkorb übernommen; wiederholtes Scannen erhöht die Menge. QR-Codes können direkt am Artikel oder gut erreichbar in seiner Nähe angebracht werden, sodass der Artikel bereits während des Zapfens oder Ausgebens per Finger- oder Uhrscanner erfasst werden kann. Der Vorgang wird anschließend wie gewohnt über Bar abgeschlossen oder – sofern eingerichtet – durch Scannen des Zahlungs-QR-Codes. Für eine Bedienerzuordnung wird vor dem Verkauf kurz der persönliche Mitarbeitercode gescannt. Dieser Bediener bleibt aktiv, bis sich eine andere Person über die Bedienertaste oder ihren QR-Code anmeldet.',tip:'Scanner im HID-Modus koppeln, Codes eindeutig beschriften und vor dem Verkauf die angezeigte Bedienerzuordnung kontrollieren.',selector:'.scanner-card, #operatorBtn, #cartList, #payBtn',demo:'scannerFlow',quiz:{question:'Was ist vor dem Verkauf mit Scanner zu kontrollieren?',answers:['Die angezeigte Bedienerzuordnung', 'Nur die Lautstärke', 'Nur das Datum', 'Nur die Farbe des QR-Codes'],correct:0,repeat:'Vor dem Verkauf muss die angezeigte Bedienerzuordnung kontrolliert werden.'}}
];
const tasks=[
 {title:'Einfacher Verkauf',text:'Verkaufe einen Glühwein rot und starte die Zahlung.'},
 {title:'Reklamation',text:'Öffne den Reklamationsablauf.'},
 {title:'Pfandrückgabe',text:'Öffne die Pfandrückgabe und erfasse eine Glasrückgabe.'}
];

let profile=loadProfile(),lessonModule='quick',lessonIndex=0,taskIndex=0;if(localStorage.getItem('kcTrainingAudioBeta103')!=='1'){profile.sound=true;localStorage.setItem('kcTrainingAudioBeta103','1')}
let quizPassedForStep=false,activeSyncToken=0,syncDemoFinished=false;
let assistantEnabled=true,soundEnabled=true,coachDockCollapsed=false;
let trainingVolume=Math.max(1,Math.min(10,Number(localStorage.getItem('kcTrainingVolume'))||7));let trainingVolumeHideTimer=null;
let playbackCore=null;
let speechWatchdog=null,speechStartTimer=null,speechFallbackTimer=null,welcomeGreetingTimer=null,lastGreetingKey='';
let lessonUnlockTimer=null;
let lessonNarrationToken=0,lessonExplanationDone=false,lessonTipStarted=false,lessonNarrationMode='idle';
let quizAutoAdvanceTimer=null,pendingChapterCompletion=false;

function fresh(){return{participantId:'',name:'',gender:'female',voiceVariant:'one',addressMode:'du',assistant:true,sound:true,save:true,quick:0,advanced:0,practice:0,quickDone:[],advancedDone:[],passedTasks:[],attempts:{},feedbackSubmittedAt:'',trainingStartedAt:'',lastActivityAt:'',introCompleted:false,quizStats:{},lessonStats:{},sessionId:''}}
function loadProfile(){try{return {...fresh(),...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')}}catch{return fresh()}}
function saveProfile(){profile.lastActivityAt=new Date().toISOString();if(profile.save)localStorage.setItem(STORAGE_KEY,JSON.stringify(profile));window.KCParticipantDataCore?.saveTraining?.(profile).then(saved=>{if(saved?.participantId&&!profile.participantId){profile.participantId=saved.participantId;localStorage.setItem(STORAGE_KEY,JSON.stringify(profile))}}).catch(()=>{})}
function overall(){return Math.round((profile.quick+profile.advanced+profile.practice)/3)}
function show(id){
 sections.forEach(x=>$(x)?.classList.toggle('hidden',x!==id));
 document.querySelector('.app-shell')?.classList.toggle('lesson-active',id==='lesson'||id==='practice');
 window.scrollTo({top:0,behavior:'smooth'});
 setTimeout(()=>{if(id==='lesson')fitFrame('lessonPosFrame',82);if(id==='practice')fitFrame('practicePosFrame',54)},100);
}
function hydrateWelcome(){
 $('firstName').value=profile.name||'';$('saveConsent').checked=profile.save!==false;$('startSound').checked=profile.sound!==false;$('skipGreeting').checked=profile.skipGreeting===true;
 const mode=profile.assistant===false?'none':(profile.gender||'female');
 const assistantInput=document.querySelector(`input[name=assistantMode][value="${mode}"]`);if(assistantInput)assistantInput.checked=true;
 document.querySelectorAll('.assistant-mode-card').forEach(card=>card.classList.toggle('selected',card.dataset.assistantMode===mode));
 const addressInput=document.querySelector(`input[name=addressMode][value="${profile.addressMode||'du'}"]`);if(addressInput)addressInput.checked=true;
 const voiceInput=document.querySelector(`input[name=voiceVariant][value="${profile.voiceVariant||'one'}"]`);if(voiceInput)voiceInput.checked=true;
 applyAddressUi();updateVoiceOptions();
}
function applyAddressUi(){
 const formal=(document.querySelector('input[name=addressMode]:checked')?.value||profile.addressMode)==='sie';
 if($('privacyIntro'))$('privacyIntro').textContent=formal?'Ihr Vorname und Ihr Lernfortschritt werden ausschließlich lokal auf diesem Gerät gespeichert. Es erfolgt keine Übertragung.':'Dein Vorname und dein Lernfortschritt werden ausschließlich lokal auf diesem Gerät gespeichert. Es erfolgt keine Übertragung.';
 if($('learningModeLegend'))$('learningModeLegend').textContent=formal?'Wie möchten Sie lernen?':'Wie möchtest du lernen?';
 if($('encouragement'))$('encouragement').textContent=formal?'Sie schaffen das!':'Du schaffst das!';
 if($('bonusTitle'))$('bonusTitle').textContent=formal?'Lernen Sie Marc und Laura kennen':'Lerne Marc und Laura kennen';
 if($('feedbackSavedText'))$('feedbackSavedText').textContent=formal?'Vielen Dank. Ihre Rückmeldung wurde sicher auf diesem Gerät gespeichert.':'Vielen Dank. Deine Rückmeldung wurde sicher auf diesem Gerät gespeichert.';
 if($('surveyTitle'))$('surveyTitle').textContent=formal?'Ihr Feedback zur Schulung':'Dein Feedback zur Schulung';
 if($('surveyIntro'))$('surveyIntro').textContent=formal?'Mit Ihrer Rückmeldung können Schulungsinhalte, Sprache und Bedienführung gezielt verbessert werden.':'Mit deiner Rückmeldung können Schulungsinhalte, Sprache und Bedienführung gezielt verbessert werden.';
 if($('surveyHelpfulLegend'))$('surveyHelpfulLegend').firstChild.textContent=formal?'Was hat Ihnen besonders geholfen? ':'Was hat dir besonders geholfen? ';
 if($('surveyPositiveLabel'))$('surveyPositiveLabel').textContent=formal?'Was hat Ihnen besonders gut gefallen?':'Was hat dir besonders gut gefallen?';
 if($('surveyStoriesLegend'))$('surveyStoriesLegend').textContent=formal?'Wie haben Ihnen die Bonusgeschichten gefallen?':'Wie haben dir die Bonusgeschichten gefallen?';
 if($('surveyRecommendLegend'))$('surveyRecommendLegend').textContent=formal?'Würden Sie diese Schulung anderen Bedienern empfehlen?':'Würdest du diese Schulung anderen Bedienern empfehlen?';
 if($('feedbackThanksTitle'))$('feedbackThanksTitle').textContent=formal?'Vielen Dank für Ihr Feedback!':'Vielen Dank für dein Feedback!';
 if($('feedbackPositive'))$('feedbackPositive').placeholder=formal?'Ihre Rückmeldung …':'Deine Rückmeldung …';
 if($('feedbackImproveText'))$('feedbackImproveText').placeholder=formal?'Ihre Verbesserungsidee …':'Deine Verbesserungsidee …';
}
function addressText(text){
 const value=String(text||'');if(profile.addressMode!=='sie')return value;
 const phrases=[
  [/\bWenn du fertig bist\b/g,'Wenn Sie fertig sind'],[/\bKonntest du\b/g,'Konnten Sie'],[/\bHaben dir\b/g,'Haben Ihnen'],[/\bFühlst du dich\b/g,'Fühlen Sie sich'],[/\bkannst du\b/g,'können Sie'],[/\bsolltest du\b/g,'sollten Sie'],[/\bsiehst du\b/g,'sehen Sie'],[/\bbewertest du\b/g,'bewerten Sie'],[/\bwirst auch du\b/g,'werden auch Sie'],[/\bgehörst auch du\b/g,'gehören auch Sie'],[/\bdenkst du\b/g,'denken Sie'],
  [/\bdu noch geblieben bist\b/g,'Sie noch geblieben sind'],[/\bkennenlernen möchtest\b/g,'kennenlernen möchten'],[/\bschenkst du\b/g,'schenken Sie'],[/\berinnerst du dich\b/g,'erinnern Sie sich'],[/\bdu einem Menschen\b/g,'Sie einem Menschen'],[/\bden Tag leichter machst\b/g,'den Tag leichter machen'],[/\bdu nach einem langen Tag müde, aber zufrieden nach Hause gehst\b/g,'Sie nach einem langen Tag müde, aber zufrieden nach Hause gehen'],[/\bwirst du vielleicht spüren\b/g,'werden Sie vielleicht spüren'],[/\bmir zugehört hast\b/g,'mir zugehört haben'],
  [/Schön, dass du noch geblieben bist\./g,'Schön, dass Sie noch geblieben sind.'],[/\bNimm dir\b/g,'Nehmen Sie sich'],[/\bNimm\b/g,'Nehmen Sie'],[/\bFühre\b/g,'Führen Sie'],[/\bPrüfe\b/g,'Prüfen Sie'],[/\bKontrolliere\b/g,'Kontrollieren Sie'],[/\bWähle\b/g,'Wählen Sie'],[/\bÖffne\b/g,'Öffnen Sie'],[/\bErfasse\b/g,'Erfassen Sie'],[/\bVerkaufe\b/g,'Verkaufen Sie'],[/\bStarte\b/g,'Starten Sie'],[/\bund starte\b/g,'und starten Sie'],[/\bund erfasse\b/g,'und erfassen Sie'],[/\bDenke daran\b/g,'Denken Sie daran'],[/\bdenke daran\b/g,'denken Sie daran'],[/\bBegegne\b/g,'Begegnen Sie'],[/\bhilf mit\b/g,'helfen Sie mit'],[/\bhab Freude\b/g,'haben Sie Freude'],
  [/\beinbringst\b/g,'einbringen'],[/\barbeitest\b/g,'arbeiten'],[/\berlebst\b/g,'erleben'],[/\blächelst\b/g,'lächeln Sie'],
  [/\bdeinem\b/gi,'Ihrem'],[/\bdeinen\b/gi,'Ihren'],[/\bdeiner\b/gi,'Ihrer'],[/\bdeine\b/gi,'Ihre'],[/\bdein\b/gi,'Ihr'],[/\bdich\b/gi,'Sie'],[/\bdir\b/gi,'Ihnen'],[/\bdu\b/gi,'Sie']
 ];
 return phrases.reduce((result,[pattern,replacement])=>result.replace(pattern,replacement),value);
}
function dashboard(){
 show('dashboard');$('greeting').textContent=`Willkommen${profile.name?', '+profile.name:''}`;$('overallScore').textContent=overall();
 const defs=[['quick',quick],['advanced',advanced],['practice',tasks]];
 defs.forEach(([key,list])=>{
   const card=document.querySelector(`[data-module="${key}"]`),state=$(key+'State');
   card?.classList.remove('completed','in-progress');
   const done=key==='practice'?(profile.passedTasks||[]).length:(profile[key+'Done']||[]).length;
   if(profile[key]===100){card?.classList.add('completed');state.textContent='✓ ERLEDIGT'}
   else if(done){card?.classList.add('in-progress');state.textContent=`${done} von ${list.length}`}
   else state.textContent='Starten';
 });
 const trainingComplete=overall()>=100;$('certificateBtn').disabled=!trainingComplete;$('certificateBtn').classList.toggle('hidden',!trainingComplete);
 updateExtensionOverview();
 $('feedbackBtn').classList.add('hidden');
}
function voices(){return window.speechSynthesis?.getVoices?.()||[]}
function assistantName(){return profile.gender==='male'?'Marc':'Laura'}
function selectedGender(){const mode=document.querySelector('input[name=assistantMode]:checked')?.value;return mode==='male'?'male':'female'}
function coachAsset(gender=profile.gender,state='neutral'){
 const g=gender==='male'?'male':'female';
 const allowed=g==='male'?['neutral','smile','speaking','thinking','approve']:['neutral'];
 const st=allowed.includes(state)?state:'neutral';
 if(st==='neutral')return `../avatar-core/assets/chef/chef_${g}_neutral_armless_v0257.png`;
 return `../avatar-core/assets/chef/chef_${g}_${st}.png`;
}
function setCoachImage(state='neutral'){
 const img=$('coachGuideImage');if(!img)return;
 const gender=profile.gender==='male'?'male':'female';
 img.src=coachAsset(gender,state);img.dataset.avatarRole='chef';img.dataset.avatarGender=gender;img.dataset.avatarState=state;
 img.alt=`${assistantName()} – Kassentrainer${gender==='female'?'in':''}`;
 window.AvatarCore?.apply(img,{role:'chef',gender,state}).catch(()=>{});
}
function candidateVoices(gender=profile.gender){
 const german=voices().filter(v=>String(v.lang||'').toLowerCase().startsWith('de'));
 const male=/conrad|stefan|thomas|markus|martin|klaus|hans|daniel|yannick|male|mann/i;
 const female=/katja|anna|petra|hedda|heda|vicki|amala|sabina|helena|marlene|female|frau/i;
 const premium=/microsoft|google|natural|online/i;
 const wanted=gender==='male'?male:female;
 return german.filter(v=>wanted.test(v.name)).sort((a,b)=>Number(premium.test(b.name))-Number(premium.test(a.name)));
}
function chooseVoice(gender=profile.gender,variant=profile.voiceVariant||'one'){const list=candidateVoices(gender);if(gender==='female'){const preferred=variant==='one'?/katja/i:/hedda|heda/i;return list.find(v=>preferred.test(v.name))||list[variant==='two'&&list.length>1?1:0]||null}const stefan=list.find(v=>/stefan/i.test(v.name));return variant==='two'?(list.find(v=>v!==stefan)||stefan||list[0]||null):(stefan||list[0]||null)}
function updateVoiceOptions(){const mode=document.querySelector('input[name=assistantMode]:checked')?.value||'female',gender=mode==='male'?'male':'female',name=gender==='male'?'Marc':'Laura',one=chooseVoice(gender,'one'),two=chooseVoice(gender,'two');$('voiceChoice').classList.toggle('hidden',mode==='none');$('voiceChoiceLegend').textContent=`${name}s Stimme`;$('voiceOneTitle').textContent=gender==='female'?'Sanft':'Warm';$('voiceTwoTitle').textContent=gender==='female'?'Klar':'Ruhig';$('voiceOneName').textContent=one?.name||'Keine passende Stimme';$('voiceTwoName').textContent=two?.name?`${two.name}${two===one?' · anders abgestimmt':''}`:'Keine zweite passende Stimme';$('voiceOneName').parentElement.title=$('voiceOneName').textContent;$('voiceTwoName').parentElement.title=$('voiceTwoName').textContent}
function utter(text,{gender=profile.gender}={}){
 const prepared=String(text||'').replace(/\s+/g,' ').trim().replace(/([.!?])\s+(?=[A-ZÄÖÜ])/g,'$1 … ');
 const u=new SpeechSynthesisUtterance(prepared);
 const variant=profile.voiceVariant||'one';u.lang='de-DE';u.rate=gender==='male'?(variant==='one'?0.82:0.96):(variant==='one'?0.84:0.98);u.pitch=gender==='male'?(variant==='one'?0.98:1.06):(variant==='one'?1.06:0.97);u.volume=(gender==='male'?0.96:1)*(trainingVolume/10);u.voice=chooseVoice(gender,variant);return u;
}
function testSelectedVoice(){const mode=document.querySelector('input[name=assistantMode]:checked')?.value||'female';if(mode==='none')return;profile.gender=mode==='male'?'male':'female';profile.voiceVariant=document.querySelector('input[name=voiceVariant]:checked')?.value||'one';soundEnabled=true;stopSpeech();const text=profile.gender==='female'?'Schön, dass du da bist. Nimm dir ruhig einen Moment Zeit. Wir gehen die nächsten Schritte gemeinsam durch.':'Schön, dass du da bist. Wir gehen die nächsten Schritte ruhig und verständlich gemeinsam durch.';const u=utter(addressText(text),{gender:profile.gender});window.__kcTrainingActiveUtterance=u;u.onend=()=>{$('voiceTestStatus').textContent='Stimmprobe beendet.'};speechSynthesis.speak(u);$('voiceTestStatus').textContent=`${assistantName()} spricht mit der ausgewählten Stimme.`;saveProfile()}
function stopSpeech(){speechEpoch++;clearTimeout(speechStartTimer);speechStartTimer=null;clearTimeout(speechFallbackTimer);speechFallbackTimer=null;clearInterval(speechWatchdog);speechWatchdog=null;clearInterval(readAlongTimer);readAlongTimer=null;try{speechSynthesis.pause();speechSynthesis.cancel();setTimeout(()=>{try{speechSynthesis.cancel();speechSynthesis.resume()}catch{}},0)}catch{}setCoachImage('neutral');setMouthViseme('');setTrainingVoiceMonitor(soundEnabled?'ready':'off',soundEnabled?'Ton bereit':'Ton aus')}
function speakingTarget(){return $('coachGuideText')&&!$('lesson').classList.contains('hidden')?$('coachGuideText'):null}
function renderReadAlong(el,text,index=0,length=0){if(!el)return;const clean=String(text||'');const a=clean.slice(0,index),b=clean.slice(index,index+Math.max(1,length)),c=clean.slice(index+Math.max(1,length));el.innerHTML=`<span class="spoken-text">${escapeHtml(a)}</span><strong class="spoken-current">${escapeHtml(b)}</strong><span>${escapeHtml(c)}</span>`}
function setMouthViseme(){const wrap=$('coachPortraitWrap');if(!wrap)return;wrap.classList.remove('viseme-a','viseme-o','viseme-m','viseme-e','viseme-rest')}
function speak(text,{onend,gender=profile.gender,target=null}={}){
 const clean=String(text||'').replace(/\s+/g,' ').trim();
 if(!clean){onend?.();return}
 if(!soundEnabled||!window.speechSynthesis){if(target)target.textContent=clean;setTrainingVoiceMonitor(soundEnabled?'error':'off',soundEnabled?'Keine Gerätestimme':'Ton aus');onend?.();return}
 unlockTrainingAudio();stopSpeech();setTrainingVoiceMonitor('pending',`${assistantName()} startet`);const localEpoch=speechEpoch;setCoachImage('speaking');const readTarget=target||speakingTarget();if(readTarget)renderReadAlong(readTarget,clean,0,0);
 const u=utter(clean,{gender});let finished=false;let boundarySeen=false;let actuallyStarted=false;
 const wordMatches=[...clean.matchAll(/\S+/g)];
 const estimatedMs=Math.max(2200,Math.min(45000,wordMatches.length*470/(u.rate||1)));let startedAt=Date.now();
 const highlightAt=(index,length)=>{if(localEpoch!==speechEpoch||!readTarget)return;renderReadAlong(readTarget,clean,index,length)};
 const finish=()=>{if(finished||localEpoch!==speechEpoch)return;finished=true;clearTimeout(speechFallbackTimer);speechFallbackTimer=null;clearInterval(speechWatchdog);speechWatchdog=null;clearInterval(readAlongTimer);readAlongTimer=null;setCoachImage('neutral');setMouthViseme('');if(readTarget)readTarget.textContent=clean;setTrainingVoiceMonitor(soundEnabled?'ready':'off',soundEnabled?'Ton bereit':'Ton aus');onend?.()};
 u.onstart=()=>{if(localEpoch!==speechEpoch)return;actuallyStarted=true;startedAt=Date.now();setTrainingVoiceMonitor('speaking',`${assistantName()} spricht`)};
 u.onboundary=e=>{if(localEpoch!==speechEpoch)return;boundarySeen=true;const i=Number(e.charIndex)||0;let len=Number(e.charLength)||0;if(!len){const m=clean.slice(i).match(/^\S+/);len=m?m[0].length:1}highlightAt(i,len)};
 u.onend=finish;u.onerror=finish;
 window.__kcTrainingActiveUtterance=u;speechStartTimer=setTimeout(()=>{speechStartTimer=null;if(!soundEnabled||localEpoch!==speechEpoch){finish();return}try{speechSynthesis.resume();speechSynthesis.speak(u)}catch{finish();return}if(readTarget&&wordMatches.length){readAlongTimer=setInterval(()=>{if(localEpoch!==speechEpoch||finished){clearInterval(readAlongTimer);readAlongTimer=null;return}if(boundarySeen)return;const progress=Math.min(.995,(Date.now()-startedAt)/estimatedMs);const wi=Math.min(wordMatches.length-1,Math.floor(progress*wordMatches.length));const m=wordMatches[wi];highlightAt(m.index,m[0].length)},120)}},120);
 // Harte Absicherung: Browser können SpeechSynthesis ohne onstart/onend hängen lassen.
 speechFallbackTimer=setTimeout(()=>finish(),estimatedMs+3500);
 setTimeout(()=>{if(localEpoch===speechEpoch&&!finished&&!actuallyStarted)finish()},2600);
 speechWatchdog=setInterval(()=>{if(localEpoch!==speechEpoch){clearInterval(speechWatchdog);speechWatchdog=null;return}try{if(speechSynthesis.paused)speechSynthesis.resume();if(!actuallyStarted&&!speechSynthesis.pending&&!speechSynthesis.speaking&&Date.now()-startedAt>1800)finish()}catch{finish()}},700);
}
function welcomeText(name=profile.name,gender=profile.gender){
 const coach=gender==='male'?'Marc':'Laura', formal=profile.addressMode==='sie';
 return formal?`Guten Tag, ${name}. Mein Name ist ${coach}. Gemeinsam mit ${gender==='male'?'Laura':'Marc'} begleite ich Sie durch diese interaktive Schulung zum KC Bilderrechner. Nehmen Sie sich Zeit. Nach Abschluss der gesamten Schulung freuen wir uns über Ihr Feedback. Starten Sie jetzt die Schulung mit einem Klick auf den Button Schulung starten.`:`Hallo, ${name}. Mein Name ist ${coach}. Gemeinsam mit ${gender==='male'?'Laura':'Marc'} begleite ich dich durch diese interaktive Schulung zum KC Bilderrechner. Nimm dir Zeit. Nach Abschluss der gesamten Schulung freuen wir uns über dein Feedback. Starte jetzt die Schulung mit einem Klick auf den Button Schulung starten.`;
}
function setWelcomeStartReady(ready,{pulse=true}={}){
 const button=$('startTraining');if(!button)return;
 button.disabled=!ready;button.classList.toggle('ready-pulse',ready&&pulse);
}
function resetWelcomeGreeting(){
 clearTimeout(welcomeGreetingTimer);stopSpeech();welcomeGreetingState='idle';setWelcomeStartReady(false,{pulse:false});
}
function syncGreetingSkipState(){
 const skip=$('skipGreeting').checked;
 profile.skipGreeting=skip;
 const name=$('firstName').value.trim();
 if(skip){
  welcomeGreetingState='skipped';clearTimeout(welcomeGreetingTimer);welcomeGreetingTimer=null;stopSpeech();
  if(name)completeWelcomeGreeting({skipped:true});
  else{welcomeGreetingState='skipped';setWelcomeStartReady(false,{pulse:false});$('welcomeMessage').textContent='Begrüßung wird übersprungen. Bitte noch den Vornamen eintragen.';}
 }else{
  resetWelcomeGreeting();scheduleWelcomeGreeting(true);
 }
 saveProfile();
}
function completeWelcomeGreeting({skipped=false}={}){
 welcomeGreetingState=skipped?'skipped':'completed';if(skipped)$('skipGreeting').checked=true;setWelcomeStartReady(Boolean($('firstName').value.trim()));
 $('welcomeMessage').textContent=skipped?'Begrüßung übersprungen. Die Schulung kann jetzt gestartet werden.':'Begrüßung abgeschlossen. Bitte jetzt die Schulung starten.';
}
function skipWelcomeGreeting(){
 clearTimeout(welcomeGreetingTimer);stopSpeech();completeWelcomeGreeting({skipped:true});$('startTraining')?.focus({preventScroll:false});
}
function scheduleWelcomeGreeting(force=false){
 clearTimeout(welcomeGreetingTimer);
 const name=$('firstName').value.trim();const mode=document.querySelector('input[name=assistantMode]:checked')?.value||'female';
 if(!name){welcomeGreetingState='idle';setWelcomeStartReady(false,{pulse:false});return}
 if($('skipGreeting').checked){completeWelcomeGreeting({skipped:true});return}
 if(mode==='none'||!$('startSound').checked){completeWelcomeGreeting({skipped:true});return}
 profile.gender=mode==='male'?'male':'female';profile.name=name;profile.addressMode=document.querySelector('input[name=addressMode]:checked')?.value||'du';
 const key=`${name}|${profile.gender}|${profile.addressMode}`;
 if(!force&&key===lastGreetingKey&&welcomeGreetingState==='completed'){setWelcomeStartReady(true);return}
 lastGreetingKey=key;welcomeGreetingState='scheduled';setWelcomeStartReady(false,{pulse:false});$('welcomeMessage').textContent='Die Begrüßung beginnt gleich. Der Startknopf wird danach freigeschaltet.';
 welcomeGreetingTimer=setTimeout(()=>{
  if(welcomeGreetingState==='skipped')return;
  welcomeGreetingState='speaking';soundEnabled=true;
  speak(welcomeText(name,profile.gender),{onend:()=>{if(welcomeGreetingState==='speaking')completeWelcomeGreeting()}});
 },500);
}

const FUTURA_REASONS=[
 {icon:'🖼️',title:'Einfach zu bedienen',text:'Große Bilder und klare Tasten helfen auch neuen Mitgliedern, sich schnell und sicher zurechtzufinden.'},
 {icon:'🧮',title:'Weniger Rechenfehler',text:'Preise, Mengen, Pfand, Happy Hour und Rückgeld werden zuverlässig berechnet. Gerade bei starkem Andrang entlastet das.'},
 {icon:'⚡',title:'Sicher in Stoßzeiten',text:'Wenn viele Gäste gleichzeitig bestellen, bleiben die Abläufe schnell, übersichtlich und ruhig.'},
 {icon:'📈',title:'Gestiegene Anforderungen am Stand',text:'Die Ansprüche an den Stand des Köcheclubs sind in den letzten Jahren kontinuierlich gestiegen: mehr Besucherandrang trifft auf weniger aktive Mitglieder und kaum Nachwuchs. Der Bilderrechner hilft, diese Belastung sicherer und gerechter zu bewältigen.'},
 {icon:'📦',title:'Bessere Übersicht',text:'Wir erkennen genauer, was verkauft und verbraucht wurde und was rechtzeitig nachgefüllt werden muss.'},
 {icon:'🤝',title:'Gemeinsam gleich arbeiten',text:'Erfahrene und neue Mitglieder nutzen denselben verständlichen Ablauf. Das erleichtert die Zusammenarbeit.'},
 {icon:'📋',title:'Einfachere Abrechnung',text:'Verkäufe werden nachvollziehbar erfasst. Das spart später Zeit und erleichtert eine verlässliche Abrechnung.'},
 {icon:'❤️',title:'Mehr Zeit für unsere Gäste',text:'Der wichtigste Vorteil: Weniger Rechnen und Suchen bedeutet mehr Zeit für ein Lächeln, ein Gespräch und echte Gastfreundschaft.'}
];
let welcomeGreetingState='idle';
let introRunToken=0;
let futuraOpeningTimer=null;
let futuraIntroState='idle';
function introAddress(du,sie){return profile.addressMode==='sie'?sie:du}
function setFuturaStage(stage){
 const opening=$('futuraOpeningStage'),reasons=$('futuraReasonStage');
 opening?.classList.toggle('hidden',stage!=='opening');reasons?.classList.toggle('hidden',stage!=='reasons');
}
function resetIntroCards(){
 document.querySelectorAll('.futura-reason').forEach(x=>x.classList.remove('active','done'));
 if($('futuraClosing'))$('futuraClosing').innerHTML='';
 $('futuraStartLearning')?.classList.remove('ready-pulse');$('futuraStartLearning').disabled=true;
}
function revealAllIntroContent(){
 document.querySelectorAll('.futura-reason').forEach(x=>x.classList.add('done'));
 prepareFuturaClosing();document.querySelectorAll('.futura-closing-line').forEach(x=>x.classList.add('visible','done'));
}
function activateFuturaStart({announce=true}={}){
 const button=$('futuraStartLearning');if(!button)return;
 button.disabled=false;button.classList.add('ready-pulse');$('futuraReplay').disabled=false;futuraIntroState='completed';profile.introCompleted=true;saveProfile();
 if(announce&&assistantEnabled&&soundEnabled)speak(addressText('Starten Sie jetzt die Schulung mit einem Klick auf Start.'));
}
function skipFuturaOpening(){
 clearTimeout(futuraOpeningTimer);futuraOpeningTimer=null;introRunToken++;stopSpeech();futuraIntroState='reasons';setFuturaStage('reasons');playFuturaReasons();
}
function skipFuturaReasons(){
 clearTimeout(futuraOpeningTimer);futuraOpeningTimer=null;introRunToken++;stopSpeech();futuraIntroState='skipped';setFuturaStage('reasons');revealAllIntroContent();activateFuturaStart({announce:false});$('futuraStartLearning')?.focus({preventScroll:false});
}
function renderFuturaIntro(){
 $('futuraCoachImage').src=coachAsset(profile.gender,'neutral');$('futuraCoachName').textContent=assistantName();
 $('futuraReasons').innerHTML=FUTURA_REASONS.map((r,i)=>`<article class="futura-reason" data-reason="${i}"><span>${r.icon}</span><div><strong>${r.title}</strong><p>${r.text}</p></div></article>`).join('');
 $('futuraIntroTitle').textContent='Warum führen wir ab 2026 den Bilderrechner ein?';
 $('futuraIntroLead').textContent=introAddress('Vielleicht fragst du dich: Es ging doch viele Jahre auch ohne. Diese Frage ist völlig verständlich.','Vielleicht fragen Sie sich: Es ging doch viele Jahre auch ohne. Diese Frage ist völlig verständlich.');
 resetIntroCards();setFuturaStage('opening');
}
function speakSequence(items,index,token,onDone){
 if(token!==introRunToken||futuraIntroState==='skipped'||futuraIntroState==='started')return;
 if(index>=items.length){onDone?.();return}const item=items[index];item.before?.();
 if(assistantEnabled&&soundEnabled)speak(addressText(item.text),{onend:()=>{item.after?.();setTimeout(()=>speakSequence(items,index+1,token,onDone),380)}});
 else{item.after?.();setTimeout(()=>speakSequence(items,index+1,token,onDone),300)}
}
const FUTURA_CLOSING=[
 'Der Bilderrechner ersetzt keine Menschen.','Er ersetzt auch nicht die Erfahrung unserer Mitglieder.','Er übernimmt das Rechnen und unterstützt uns bei wiederkehrenden Aufgaben.','Dadurch bleibt mehr Zeit für unsere Gäste, für ein freundliches Gespräch und für die Gemeinschaft unseres Vereins.','Die Entscheidungen treffen auch in Zukunft weiterhin wir.','Gemeinsam lernen wir den Bilderrechner jetzt Schritt für Schritt kennen.'
];
function prepareFuturaClosing(){if(!$('futuraClosing'))return;$('futuraClosing').innerHTML=FUTURA_CLOSING.map((text,i)=>`<div class="futura-closing-line" data-closing="${i}">${text}</div>`).join('')}
function closingItem(text,i){return {text,before:()=>{const line=document.querySelector(`[data-closing="${i}"]`);document.querySelectorAll('.futura-closing-line').forEach(x=>x.classList.remove('active'));line?.classList.add('visible','active');line?.scrollIntoView({block:'nearest',behavior:'smooth'})},after:()=>{const line=document.querySelector(`[data-closing="${i}"]`);line?.classList.remove('active');line?.classList.add('done')}}}
function playFuturaReasons(){
 stopSpeech();futuraIntroState='reasons';const token=++introRunToken;setFuturaStage('reasons');resetIntroCards();prepareFuturaClosing();$('futuraReplay').disabled=true;
 const items=[...FUTURA_REASONS.map((r,i)=>({text:`${r.title}. ${r.text}`,before:()=>{document.querySelectorAll('.futura-reason').forEach((x,j)=>x.classList.toggle('active',j===i));document.querySelector(`[data-reason="${i}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'})},after:()=>document.querySelector(`[data-reason="${i}"]`)?.classList.add('done')})),...FUTURA_CLOSING.map((text,i)=>closingItem(text,i))];
 speakSequence(items,0,token,()=>{if(token!==introRunToken||futuraIntroState!=='reasons')return;document.querySelectorAll('.futura-reason').forEach(x=>x.classList.add('done'));activateFuturaStart({announce:true})});
}
function playFuturaIntro(){
 stopSpeech();futuraIntroState='opening';const token=++introRunToken;setFuturaStage('opening');resetIntroCards();
 const opening=introAddress(`Herzlich willkommen. Bevor wir mit der eigentlichen Schulung beginnen, sprechen wir über eine Frage, die viele Mitglieder bewegt. Warum brauchen wir überhaupt einen Bilderrechner? Es ging doch viele Jahre auch ohne. Darauf können wir stolz sein. Der Bilderrechner soll unsere Erfahrung und unsere bewährte Arbeit nicht ersetzen. Er soll uns unterstützen.`,`Herzlich willkommen. Bevor wir mit der eigentlichen Schulung beginnen, sprechen wir über eine Frage, die viele Mitglieder bewegt. Warum brauchen wir überhaupt einen Bilderrechner? Es ging doch viele Jahre auch ohne. Darauf können wir stolz sein. Der Bilderrechner soll unsere Erfahrung und unsere bewährte Arbeit nicht ersetzen. Er soll uns unterstützen.`);
 speakSequence([{text:opening}],0,token,()=>{if(token!==introRunToken||futuraIntroState!=='opening')return;playFuturaReasons()});
}
function openFuturaIntro(){clearTimeout(futuraOpeningTimer);show('futuraIntro');renderFuturaIntro();futuraOpeningTimer=setTimeout(()=>{futuraOpeningTimer=null;playFuturaIntro()},350)}

function openChapterOverview({speakOverview=true}={}){
 clearTimeout(futuraOpeningTimer);futuraOpeningTimer=null;stopSpeech();const overviewToken=++introRunToken;futuraIntroState='completed';show('chapterOverview');
 $('chapterOverviewCoachImage').src=coachAsset(profile.gender,'neutral');$('chapterOverviewCoachName').textContent=assistantName();
 $('chapterOverviewLead').textContent=introAddress('In diesem Kapitel schauen wir uns die Kassenoberfläche an. Du lernst Artikel zu verkaufen, Mengen zu ändern, den Warenkorb zu kontrollieren, Zahlungen abzuschließen und wichtige Sonderfunktionen sicher zu verwenden.','In diesem Kapitel schauen wir uns die Kassenoberfläche an. Sie lernen Artikel zu verkaufen, Mengen zu ändern, den Warenkorb zu kontrollieren, Zahlungen abzuschließen und wichtige Sonderfunktionen sicher zu verwenden.');
 const text=introAddress('In diesem Kapitel schauen wir uns die Kassenoberfläche an. Du lernst Artikel zu verkaufen, Mengen zu ändern, den Warenkorb zu kontrollieren, Zahlungen abzuschließen und wichtige Sonderfunktionen sicher zu verwenden. Das Kapitel besteht aus ungefähr 165 Einzelschritten und dauert etwa 12 Minuten. Danach folgen Übungen und Wissensfragen. Anschließend startet das erste Thema automatisch.','In diesem Kapitel schauen wir uns die Kassenoberfläche an. Sie lernen Artikel zu verkaufen, Mengen zu ändern, den Warenkorb zu kontrollieren, Zahlungen abzuschließen und wichtige Sonderfunktionen sicher zu verwenden. Das Kapitel besteht aus ungefähr 165 Einzelschritten und dauert etwa 12 Minuten. Danach folgen Übungen und Wissensfragen. Anschließend startet das erste Thema automatisch.');
 let overviewStarted=false;
 const autoStart=()=>{if(overviewStarted||overviewToken!==introRunToken||$('chapterOverview').classList.contains('hidden'))return;overviewStarted=true;setTimeout(()=>{if(overviewToken===introRunToken&&!$('chapterOverview').classList.contains('hidden'))startFirstMandatoryChapter()},300)};
 if(speakOverview&&assistantEnabled&&soundEnabled){
  speak(text,{target:$('chapterOverviewLead'),onend:autoStart});
  // Zusätzliche Ablaufabsicherung, falls der Browser keine Speech-Endmeldung liefert.
  setTimeout(autoStart,Math.max(9000,text.split(/\s+/).length*520));
 }else setTimeout(autoStart,700);
}
function startFirstMandatoryChapter(){
 introRunToken++;stopSpeech();profile.chapterOverviewSeen=true;saveProfile();lessonModule='quick';lessonIndex=0;show('lesson');renderLesson();
}

async function loadTrainingImages(){
 try{const r=await fetch(TRAINING_IMAGE_CONFIG,{cache:'no-store'});const cfg=await r.json();trainingImageMap=Object.fromEntries((cfg.areas||[]).map(x=>[x.id,x]));}
 catch(err){console.warn('Schulungsbilder konnten nicht geladen werden',err);trainingImageMap={};}
}
function showStillPreview(step,token){
 const entry=step?.trainingImage?trainingImageMap[step.trainingImage]:null;
 if(!entry)return false;
 stillPreviewOpen=true;$('lessonStillTitle').textContent=entry.title||step.title;$('lessonStillSubtitle').textContent=entry.subtitle||'';
 $('lessonStillImage').src=`assets/training/images/${entry.file}`;$('lessonStillImage').alt=`Vorläufiges Schulungsbild: ${entry.title||step.title}`;
 const features=Array.isArray(entry.features)?entry.features:[];
 $('lessonStillFeatures').innerHTML=features.map((f,i)=>`<li data-feature="${i}"><strong>${f.title}</strong><span>${f.text}</span></li>`).join('');
 $('lessonStillPreview').classList.remove('hidden');$('lessonVisual').classList.add('hidden');$('lessonNext').disabled=true;$('lessonNext').classList.remove('ready');$('currentAction').textContent='Bereich zuerst in Ruhe ansehen';
 const intro=`Wir möchten uns jetzt den Bereich ${entry.title||''} ansehen. Zuerst betrachten wir das Bild in Ruhe. Danach erkläre ich die einzelnen Funktionen und Buttons kurz. Danach wechseln wir automatisch in die bewegte Originaloberfläche.`;
 const featureItems=features.map((f,i)=>({text:`${f.title}. ${f.text}`,before:()=>{document.querySelectorAll('#lessonStillFeatures li').forEach((x,j)=>x.classList.toggle('active',j===i));document.querySelector(`[data-feature="${i}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'})},after:()=>document.querySelector(`[data-feature="${i}"]`)?.classList.add('done')}));
 const run=()=>{stopSpeech();document.querySelectorAll('#lessonStillFeatures li').forEach(x=>x.classList.remove('active','done'));const local=++introRunToken;speakSequence([{text:intro},...featureItems],0,local,()=>{document.querySelectorAll('#lessonStillFeatures li').forEach(x=>x.classList.add('done'));$('lessonStillContinue').classList.add('ready-next');$('currentAction').textContent='Standbild erklärt – bewegte Vorführung startet automatisch';setTimeout(()=>{$('lessonStillContinue')?.click()},650)})};
 run();$('lessonStillReplay').onclick=run;$('lessonStillContinue').classList.remove('ready-next');$('lessonStillContinue').onclick=()=>{if(token!==lessonRunToken)return;stopSpeech();$('lessonStillContinue').classList.remove('ready-next');stillPreviewOpen=false;$('lessonStillPreview').classList.add('hidden');$('lessonVisual').classList.remove('hidden');requestAnimationFrame(()=>{fitFrame('lessonPosFrame',82);focusOriginal(step.selector);startLiveLessonStep(step,token)});};
 return true;
}
function startLiveLessonStep(step,token){
 clearTimeout(lessonUnlockTimer);lessonUnlockTimer=null;
 lessonExplanationDone=false;lessonTipStarted=false;demoDone=false;speechDone=false;lessonNarrationMode='explaining';
 const narrationToken=++lessonNarrationToken;
 const topic=String(step.title||'').replace(/^Kapitel\s*\d+\s*·\s*/i,'').trim();
 const isCurrent=()=>token===lessonRunToken&&narrationToken===lessonNarrationToken;
 const enableNext=()=>{
  if(!isCurrent())return;
  lessonExplanationDone=true;speechDone=true;lessonNarrationMode='complete';
  $('lessonTip').classList.remove('tip-speaking','tip-flash');
  $('currentAction').textContent='Erklärung abgeschlossen – Weiter ist jetzt freigegeben';
  $('lessonNext').disabled=false;$('lessonNext').classList.add('ready');
 };
 const explanation=`Neues Thema: ${topic}. ${addressText(step.text)} Extra Tipp: ${addressText(step.tip)}`;
 $('currentAction').textContent='Erklärung und Vorführung starten automatisch';
 runDemo(step,300);
 if(assistantEnabled&&soundEnabled)speak(explanation,{target:$('coachGuideText'),onend:enableNext});
 else enableNext();
 window.__KC_finishCurrentLessonStep=()=>{if(isCurrent())demoDone=true};
}
function frameDoc(id){try{return $(id)?.contentDocument||$(id)?.contentWindow?.document}catch{return null}}
function fitFrame(id,maxVh=82){const f=$(id),wrap=f?.parentElement;if(!f||!wrap)return;const naturalW=1440,naturalH=920,availableW=Math.max(420,wrap.clientWidth-2),scale=Math.min(1,availableW/naturalW);f.style.width=naturalW+'px';f.style.height=naturalH+'px';f.style.transform=`scale(${scale})`;f.style.transformOrigin='top left';const shownH=Math.ceil(naturalH*scale);wrap.style.height=Math.min(shownH,Math.max(520,window.innerHeight-wrap.getBoundingClientRect().top-20))+'px';wrap.style.overflowY=shownH>wrap.clientHeight?'auto':'hidden';wrap.style.overflowX='hidden';}
function clearFocus(doc){doc?.querySelectorAll('.training-focus-ring').forEach(x=>x.classList.remove('training-focus-ring'))}
function focusOriginal(selector){
 const apply=()=>{fitFrame('lessonPosFrame',82);const d=frameDoc('lessonPosFrame');if(!d)return;clearFocus(d);const node=d.querySelector(selector);node?.classList.add('training-focus-ring');node?.scrollIntoView({block:'center',inline:'center'})};
 const f=$('lessonPosFrame');if(f?.contentDocument?.readyState==='complete')setTimeout(apply,150);else f?.addEventListener('load',()=>setTimeout(apply,300),{once:true});
}
function api(){return $('lessonPosFrame')?.contentWindow?.KCTrainingAPI}
function closeScenes(){try{api()?.closeAllDialogs?.()}catch{};clearFocus(frameDoc('lessonPosFrame'))}
function runDemo(step,delay=0){
 const frame=$('lessonPosFrame');
 if(!frame||!step?.demo)return;
 playbackCore?.cancel?.();demoDone=false;
 try{frame.contentWindow?.postMessage({type:'KC_TRAINING_DEMO',action:'cancel'},'*')}catch{}
 const send=()=>{try{$('currentAction').textContent='Jetzt ansehen: '+demoActionLabel(step.demo);frame.contentWindow?.postMessage({type:'KC_TRAINING_DEMO',name:step.demo},'*')}catch{}};
 const base=frame.contentDocument?.readyState==='complete'?650:850;
 if(frame.contentDocument?.readyState==='complete')setTimeout(send,base+delay);
 else frame.addEventListener('load',()=>setTimeout(send,base+delay),{once:true});
}
function demoActionLabel(name){return ({surfaceTour:'Oberfläche kennenlernen',singleSale:'Artikel auswählen und anschließend bezahlen',multiSale:'Zwei Artikel aus verschiedenen Warengruppen auswählen',quantityControls:'Mengensteuerung ansehen',cartDelete:'Löschen kontrollieren',paymentFlow:'Zahlung und Rückgeld verfolgen'})[name]||'Gezeigten Ablauf verfolgen'}
function estimatedSpeechLead(step){
 const map={surfaceTour:2800,singleSale:3600,multiSale:3200,quantityControls:3400,cartDelete:3200,paymentFlow:3600,tipsFlow:3200,staffBooking:3000,depositCalculation:3200};
 return map[step.demo]||2600;
}
function setGuideMode(){
 const useCoach=assistantEnabled&&profile.assistant!==false;
 $('lessonGuide')?.classList.toggle('text-only',!useCoach);
 setCoachImage('neutral');
 $('coachModeLabel').textContent=useCoach?'Geführte Schulung':'Kompakte Textanleitung';
}
function applyCoachDockState(){
 $('lessonGuide')?.classList.toggle('collapsed',coachDockCollapsed);
 document.querySelector('.coach-dock-layout')?.classList.toggle('coach-collapsed',coachDockCollapsed);
 $('collapseCoach').title=coachDockCollapsed?'Coachbereich ausklappen':'Coachbereich einklappen';
 requestAnimationFrame(()=>fitFrame('lessonPosFrame',82));
}

function ensureQuizOverlay(){
 if($('lessonQuizOverlay'))return;
 const overlay=document.createElement('div');overlay.id='lessonQuizOverlay';overlay.className='lesson-quiz-overlay hidden';overlay.innerHTML=`<section class="lesson-quiz-card" role="dialog" aria-modal="true" aria-labelledby="lessonQuizQuestion"><button id="lessonQuizClose" class="lesson-quiz-close" type="button" aria-label="Wissensfrage schließen">×</button><div class="quiz-kicker">Kurze Wiederholung</div><h3 id="lessonQuizQuestion"></h3><div id="lessonQuizAnswers" class="lesson-quiz-answers"></div><div id="lessonQuizFeedback" class="lesson-quiz-feedback"></div><div id="lessonQuizSuccess" class="quiz-success hidden" aria-live="polite"><span>😊</span><strong>Richtig</strong><b>✓</b></div></section>`;document.body.appendChild(overlay);
}
function closeLessonQuiz({skipped=false}={}){
 clearTimeout(quizAutoAdvanceTimer);quizAutoAdvanceTimer=null;stopSpeech();
 const overlay=$('lessonQuizOverlay');if(overlay)overlay.classList.add('hidden');
 if(skipped){const statKey=`${lessonModule}:${lessonIndex}`;profile.quizStats[statKey]=profile.quizStats[statKey]||{};profile.quizStats[statKey].skipped=true;profile.quizStats[statKey].skippedAt=new Date().toISOString();saveProfile()}
 advanceLesson();
}
function openLessonQuiz(step){
 if(!step?.quiz){advanceLesson();return}ensureQuizOverlay();
 clearTimeout(quizAutoAdvanceTimer);quizAutoAdvanceTimer=null;
 const q=step.quiz,overlay=$('lessonQuizOverlay'),answers=$('lessonQuizAnswers');quizPassedForStep=false;
 $('lessonQuizQuestion').textContent=q.question;$('lessonQuizFeedback').textContent='';$('lessonQuizSuccess')?.classList.add('hidden');
 answers.innerHTML=q.answers.map((a,i)=>`<button type="button" data-quiz-answer="${i}"><span>${i+1}</span>${a}</button>`).join('');
 $('lessonQuizClose').onclick=()=>closeLessonQuiz({skipped:true});
 answers.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{
  const chosen=Number(btn.dataset.quizAnswer);answers.querySelectorAll('button').forEach(x=>x.disabled=true);
  const statKey=`${lessonModule}:${lessonIndex}`;profile.quizStats[statKey]=profile.quizStats[statKey]||{question:q.question,attempts:0,wrong:0,correct:false,firstShownAt:new Date().toISOString()};profile.quizStats[statKey].attempts++;profile.quizStats[statKey].lastAnswer=chosen;profile.quizStats[statKey].lastAnsweredAt=new Date().toISOString();
  if(chosen===q.correct){profile.quizStats[statKey].correct=true;profile.quizStats[statKey].completedAt=new Date().toISOString();saveProfile();btn.classList.add('correct');$('lessonQuizFeedback').textContent='Richtig. Der nächste Teil startet automatisch.';$('lessonQuizSuccess')?.classList.remove('hidden');quizPassedForStep=true;if(soundEnabled)speak('Richtig. Sehr gut. Der nächste Teil startet jetzt automatisch.');quizAutoAdvanceTimer=setTimeout(()=>closeLessonQuiz(),1400)}
  else{profile.quizStats[statKey].wrong++;saveProfile();btn.classList.add('wrong');answers.querySelector(`[data-quiz-answer="${q.correct}"]`)?.classList.add('correct');$('lessonQuizFeedback').textContent='Noch nicht ganz. '+q.repeat;if(soundEnabled)speak('Noch nicht ganz. '+q.repeat);setTimeout(()=>{answers.querySelectorAll('button').forEach(x=>{x.disabled=false;x.classList.remove('wrong','correct')});$('lessonQuizFeedback').textContent='Versuche es noch einmal.'},Math.max(3500,q.repeat.length*55))}
 });
 overlay.classList.remove('hidden');$('lessonQuizClose').focus({preventScroll:true});
}
function chapterQuizResult(){const list=lessonModule==='quick'?quick:advanced;let total=0,correct=0;list.forEach((step,i)=>{if(!step.quiz)return;total++;if(profile.quizStats?.[`${lessonModule}:${i}`]?.correct)correct++});return{total,correct,percent:total?Math.round(correct/total*100):100}}
function repeatCurrentChapter(){stopSpeech();$('chapterRewardOverlay').classList.add('hidden');profile[lessonModule+'Done']=[];Object.keys(profile.quizStats||{}).filter(k=>k.startsWith(lessonModule+':')).forEach(k=>delete profile.quizStats[k]);lessonIndex=0;saveProfile();show('lesson');renderLesson()}
function showChapterReward(){
 pendingChapterCompletion=true;const r=chapterQuizResult(),formal=profile.addressMode==='sie';$('chapterRewardIcon').textContent=r.percent===100?'🏆':r.percent>=80?'👍':'📘';$('chapterRewardTitle').textContent=r.percent===100?'Herzlichen Glückwunsch!':'Kapitel abgeschlossen';
 $('chapterRewardText').textContent=r.percent===100?(formal?'Sie haben alle Wissensfragen richtig beantwortet.': 'Du hast alle Wissensfragen richtig beantwortet.'):(formal?`Sie haben ${r.correct} von ${r.total} Fragen richtig beantwortet.`:`Du hast ${r.correct} von ${r.total} Fragen richtig beantwortet.`)+(r.percent<80?(formal?' Um Ihr Wissen weiter zu festigen, können Sie das Kapitel gern wiederholen.':' Um dein Wissen weiter zu festigen, kannst du das Kapitel gern wiederholen.'):'');
 let actions=$('chapterRewardActions');if(!actions){actions=document.createElement('div');actions.id='chapterRewardActions';actions.className='chapter-reward-actions';$('chapterRewardContinue').replaceWith(actions)}actions.innerHTML=`<button id="chapterRepeat" type="button">Kapitel wiederholen</button><button id="chapterRewardContinue" class="primary" type="button">Nein, weiter ▶</button>`;$('chapterRepeat').onclick=repeatCurrentChapter;$('chapterRewardContinue').onclick=()=>{$('chapterRewardOverlay').classList.add('hidden');showChapterChoice()};$('chapterRewardOverlay').classList.remove('hidden');
}
function showChapterChoice(){$('chapterChoiceOverlay').classList.remove('hidden')}
function advanceLesson(){
 const list=lessonModule==='quick'?quick:advanced,key=lessonModule+'Done';if(!profile[key].includes(lessonIndex))profile[key].push(lessonIndex);saveProfile();
 if(lessonIndex<list.length-1){lessonIndex++;renderLesson()}else showChapterReward();
}
function renderLesson(){
 const list=lessonModule==='quick'?quick:advanced,step=list[lessonIndex],doneKey=lessonModule+'Done';
 profile[doneKey]=Array.isArray(profile[doneKey])?profile[doneKey]:[];const lessonStatKey=`${lessonModule}:${lessonIndex}`;profile.lessonStats[lessonStatKey]=profile.lessonStats[lessonStatKey]||{title:step.title,startedAt:new Date().toISOString(),views:0,repeats:0};profile.lessonStats[lessonStatKey].views++;saveProfile();
 const pct=Math.round((lessonIndex+1)/list.length*100),remaining=list.length-lessonIndex-1;
 $('lessonModule').textContent=lessonModule==='quick'?'1 · Grundlagen und Verkauf':'2 · Sonderfunktionen und Artikelintelligenz';
 $('lessonTitle').textContent=step.title;$('stepCounter').textContent=`Inhalt ${lessonIndex+1} von ${list.length}`;
 $('coachGuideTitle').textContent=step.title;$('coachGuideText').textContent=addressText(step.text);
 $('tipLabel').textContent=`Extra-Tipp von ${assistantName()}`;$('tipText').textContent=addressText(step.tip);
 $('currentAction').textContent='Zuerst zuhören';
 $('lessonPercent').textContent=pct+' %';$('lessonRemaining').textContent=remaining===1?'Noch 1 Inhalt':`Noch ${remaining} Inhalte`;
 $('lessonTopProgress').style.width=pct+'%';$('lessonProgress').style.width=pct+'%';
 $('lessonNext').textContent=lessonIndex===list.length-1?'Kapitel abschließen ✓':'Weiter ▶';$('lessonNext').classList.remove('ready');$('lessonNext').disabled=true;
 $('lessonTip').classList.remove('tip-flash','tip-speaking');
 $('lessonStepTrack').innerHTML=list.map((x,i)=>`<button type="button" class="lesson-step-pill ${profile[doneKey].includes(i)?'done':''} ${i===lessonIndex?'current':''}" data-lesson-index="${i}" title="Zu ${x.title} springen" aria-label="Zu ${x.title} springen" ${i===lessonIndex?'aria-current="step"':''}>${i+1}</button>`).join('');
 $('lessonStepTrack').querySelectorAll('[data-lesson-index]').forEach(button=>button.onclick=()=>{const target=Number(button.dataset.lessonIndex);if(!Number.isInteger(target)||target===lessonIndex)return;stopSpeech();closeScenes();lessonIndex=target;renderLesson()});
 setGuideMode();applyCoachDockState();
 $('lessonStillPreview').classList.add('hidden');$('lessonVisual').classList.remove('hidden');
 const token=++lessonRunToken;
 if(!showStillPreview(step,token)){focusOriginal(step.selector);startLiveLessonStep(step,token)}
}
function startLesson(module){
 lessonModule=module;const list=module==='quick'?quick:advanced,done=profile[module+'Done']||[];
 lessonIndex=Math.min(done.length,list.length-1);show('lesson');renderLesson();
}
function completeLesson(){
 pendingChapterCompletion=false;profile[lessonModule]=100;saveProfile();dashboard();
}
function updateExtensionOverview(){const unlocked=overall()>=100;$('extensionUnlockState').textContent=unlocked?'Freiwillige Module freigeschaltet':'Spielbare Beta-Module können bereits getestet werden';document.querySelectorAll('.extension-card').forEach(card=>{const ready=card.dataset.extension==='reklamation'||card.dataset.extension==='jugendschutz';card.disabled=!ready&&!unlocked;card.classList.toggle('locked',!ready&&!unlocked)})}
function openExtensionInfo(key){const data={reklamation:['💬','Reklamationsmanagement','Dieses freiwillige Modul wird vorbereitet.'],jugendschutz:['🛡️','Jugendschutz','Dieses freiwillige Modul wird vorbereitet.']};const item=data[key]||['ℹ️','Freiwilliges Lernmodul','Dieses Modul befindet sich noch im Aufbau.'];$('extensionInfoIcon').textContent=item[0];$('extensionInfoTitle').textContent=item[1];$('extensionInfoText').textContent=item[2];show('extensionInfo')}
function renderTask(){
 const t=tasks[taskIndex],pct=Math.round((taskIndex+1)/tasks.length*100),remaining=tasks.length-taskIndex-1;
 $('practiceCoachImage').src=coachAsset(profile.gender,'neutral');$('practiceCoachName').textContent=`${assistantName()} begleitet ${profile.addressMode==='sie'?'Sie':'dich'}`;
 $('taskTitle').textContent=t.title;$('taskNumber').textContent=taskIndex+1;$('taskText').textContent=addressText(t.text);$('taskHint').textContent=addressText('Führe den Vorgang in der echten Oberfläche des Bilderrechners aus.');
 $('practicePercent').textContent=pct+' %';$('practiceRemaining').textContent=remaining===1?'Noch 1 Aufgabe':`Noch ${remaining} Aufgaben`;$('practiceTopProgress').style.width=pct+'%';
 $('attempts').textContent=profile.attempts?.[taskIndex]||0;$('feedback').textContent='Führe die Aufgabe aus und wähle anschließend „Aufgabe prüfen“.';$('feedback').className='feedback';$('nextTask').disabled=true;
 fitFrame('practicePosFrame',54);
 requestAnimationFrame(()=>document.querySelector('.practice-command-bar')?.scrollIntoView({block:'start',behavior:'smooth'}));
}
function practiceTaskSpeech(){const t=tasks[taskIndex];return addressText(`${t.title}. ${t.text}. Führe die Aufgabe jetzt in der Oberfläche des Bilderrechners aus. Wenn du fertig bist, wähle Aufgabe prüfen.`)}
function startPractice(){
 taskIndex=0;$('practiceAssistantToggle').checked=assistantEnabled;$('practiceSoundToggle').checked=soundEnabled;show('practice');renderTask();
 if(assistantEnabled&&soundEnabled){
  const intro=profile.addressMode==='sie'?'Hier befinden Sie sich im Ausprobiermodus. Lesen Sie links die Aufgabe und führen Sie sie in der Kasse so aus, wie Sie es in den vorherigen Kapiteln gelernt haben. Nehmen Sie sich Zeit. Ich begleite Sie dabei.':'Hier befindest du dich im Ausprobiermodus. Lies links die Aufgabe und führe sie in der Kasse so aus, wie du es in den vorherigen Kapiteln gelernt hast. Nimm dir Zeit. Ich begleite dich dabei.';
  speak(intro,{onend:()=>setTimeout(()=>speak(practiceTaskSpeech()),500)});
 }
}
function passPracticeTask(message){
 if(!profile.passedTasks.includes(taskIndex))profile.passedTasks.push(taskIndex);
 profile.practice=Math.round(profile.passedTasks.length/tasks.length*100);saveProfile();
 $('feedback').textContent=message;$('feedback').className='feedback ok';$('nextTask').disabled=false;
 $('practicePercent').textContent=profile.practice+' %';$('practiceTopProgress').style.width=profile.practice+'%';
 if(assistantEnabled&&soundEnabled){const praise=profile.addressMode==='sie'?'Das war gut. Sie haben die Aufgabe geschafft. Machen Sie in Ruhe mit der nächsten Aufgabe weiter.':'Das war gut. Du hast die Aufgabe geschafft. Mach in Ruhe mit der nächsten Aufgabe weiter.';speak(praise)}
}
function certificate(){show('certificate');$('certName').textContent=profile.name||'Teilnehmer/in';$('certDate').textContent='Ausgestellt am '+new Date().toLocaleDateString('de-DE')}

const surveyQuestions=[
 ['understandable','War die Schulung insgesamt verständlich?'],
 ['speech_clarity','Konntest du die gesprochenen Erklärungen gut verstehen?'],
 ['live_sequences','Haben die bewegten Abläufe das Lernen erleichtert?'],
 ['assistant_rating','Wie hilfreich und angenehm war dein gewählter Assistent?'],
 ['pace','War das Tempo der Schulung passend?'],
 ['practice_value','Haben dir die Übungen beim sicheren Bedienen geholfen?'],
 ['confidence','Fühlst du dich nach der Schulung sicherer an der Kasse?'],
 ['overall_rating','Wie bewertest du die Schulung insgesamt?']
];
function renderSurveyQuestions(){
 const host=$('surveyQuestions');if(!host)return;
 host.innerHTML=surveyQuestions.map(([key,label])=>`<div class="survey-question"><label for="rating_${key}">${addressText(label)}</label><div class="survey-scale"><input id="rating_${key}" name="rating_${key}" type="range" min="1" max="10" step="1" value="8" data-rating="${key}"><output class="survey-value" for="rating_${key}">8</output></div></div>`).join('');
 host.querySelectorAll('input[type=range]').forEach(r=>r.addEventListener('input',()=>{r.parentElement.querySelector('output').textContent=r.value}));
}
function feedbackQueue(){try{const q=JSON.parse(localStorage.getItem(FEEDBACK_KEY)||'[]');return Array.isArray(q)?q:[]}catch{return[]}}
function saveFeedbackQueue(queue){localStorage.setItem(FEEDBACK_KEY,JSON.stringify(queue))}
function feedbackId(){return `KCF-${new Date().toISOString().replace(/\D/g,'').slice(0,14)}-${Math.random().toString(36).slice(2,7).toUpperCase()}`}
function openSurvey(){
 if(overall()<100){dashboard();return}
 stopSpeech();show('survey');$('feedbackForm').classList.remove('hidden');$('feedbackComplete').classList.add('hidden');$('feedbackForm').reset();
 renderSurveyQuestions();$('surveyStatus').textContent='';$('feedbackNameConsent').checked=false;
}
function collectFeedback(){
 const ratings={};document.querySelectorAll('#feedbackForm [data-rating]').forEach(x=>ratings[x.dataset.rating]=Number(x.value));
 const checked=name=>[...document.querySelectorAll(`#feedbackForm input[name="${name}"]:checked`)].map(x=>x.value);
 const recommend=document.querySelector('#feedbackForm input[name="recommend"]:checked')?.value||'';
 const storiesSeen=document.querySelector('#feedbackForm input[name="stories_seen"]:checked')?.value||'none';
 return {
  schema:FEEDBACK_SCHEMA,id:feedbackId(),createdAt:new Date().toISOString(),training:{product:'KC Bilderrechner Interaktive Schulung',version:TRAINING_VERSION,score:overall(),modules:{quick:profile.quick,advanced:profile.advanced,practice:profile.practice}},
  participant:{anonymous:!$('feedbackNameConsent').checked,name:$('feedbackNameConsent').checked?(profile.name||''):''},
  assistant:{enabled:profile.assistant!==false,name:assistantName(),gender:profile.gender||'female',speechEnabled:profile.sound!==false},
  ratings,helpful:checked('helpful'),improvements:checked('improve'),recommend,storiesSeen,
  comments:{positive:$('feedbackPositive').value.trim(),improvement:$('feedbackImproveText').value.trim()},
  manager:{status:'pending_import',source:'standalone_training',importedAt:null}
 };
}
function notifyManager(entry){
 try{new BroadcastChannel('kc-manager-training-feedback').postMessage({type:'KC_TRAINING_FEEDBACK_SUBMITTED',payload:entry})}catch{}
 try{window.parent?.postMessage({type:'KC_TRAINING_FEEDBACK_SUBMITTED',payload:entry},'*')}catch{}
 window.dispatchEvent(new CustomEvent('kc-training-feedback-submitted',{detail:entry}));
}
function submitFeedback(ev){
 ev.preventDefault();const recommend=document.querySelector('#feedbackForm input[name="recommend"]:checked');
 if(!recommend){$('surveyStatus').textContent=profile.addressMode==='sie'?'Bitte geben Sie noch an, ob Sie die Schulung empfehlen würden.':'Bitte noch angeben, ob du die Schulung empfehlen würdest.';return}
 const entry=collectFeedback(),queue=feedbackQueue();queue.push(entry);saveFeedbackQueue(queue);profile.feedbackSubmittedAt=entry.createdAt;saveProfile();notifyManager(entry);
 $('feedbackForm').classList.add('hidden');$('feedbackComplete').classList.remove('hidden');
 if(soundEnabled)speak(addressText(`Vielen Dank, ${profile.name||''}. Deine Rückmeldung wurde gespeichert und hilft uns, die Schulung weiter zu verbessern.`));
}
function downloadBlob(name,type,content){const blob=new Blob([content],{type}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

function exportLearningReport(){
 const quizEntries=Object.entries(profile.quizStats||{}).map(([key,value])=>({key,...value}));
 const lessonEntries=Object.entries(profile.lessonStats||{}).map(([key,value])=>({key,...value}));
 const correct=quizEntries.filter(x=>x.correct).length,total=quizEntries.length,wrong=quizEntries.reduce((n,x)=>n+(x.wrong||0),0);
 const report={schema:'KC_MANAGER_TRAINING_PROGRESS_V1',exportedAt:new Date().toISOString(),training:{name:'KC Bilderrechner – Interaktive Schulung',version:TRAINING_VERSION,productVersion:PRODUCT_VERSION},participant:{name:profile.name,addressMode:profile.addressMode,sessionId:profile.sessionId},participation:{startedAt:profile.trainingStartedAt,lastActivityAt:profile.lastActivityAt,introCompleted:profile.introCompleted,quickPercent:profile.quick,advancedPercent:profile.advanced,practicePercent:profile.practice,overallPercent:overall()},summary:{quizQuestions:total,quizCorrect:correct,wrongAttempts:wrong,lessonViews:lessonEntries.reduce((n,x)=>n+(x.views||0),0),repetitions:lessonEntries.reduce((n,x)=>n+(x.repeats||0),0)},quizResults:quizEntries,lessonResults:lessonEntries,practice:{passedTasks:profile.passedTasks,attempts:profile.attempts}};
 downloadBlob(`KC_Bilderrechner_Lernbericht_${(profile.name||'Teilnehmer').replace(/[^a-z0-9äöüß_-]+/gi,'_')}_${new Date().toISOString().slice(0,10)}.json`,'application/json;charset=utf-8',JSON.stringify(report,null,2));
}

function exportFeedbackJson(){const envelope={schema:'KC_MANAGER_TRAINING_FEEDBACK_EXPORT_V1',exportedAt:new Date().toISOString(),source:'KC Bilderrechner Interaktive Schulung',records:feedbackQueue()};downloadBlob(`KC_Bilderrechner_Schulungsfeedback_${new Date().toISOString().slice(0,10)}.json`,'application/json;charset=utf-8',JSON.stringify(envelope,null,2))}
function csvCell(v){const s=Array.isArray(v)?v.join('|'):String(v??'');return `"${s.replace(/"/g,'""')}"`}
function exportFeedbackCsv(){
 const rows=feedbackQueue();const ratingKeys=surveyQuestions.map(x=>x[0]);const head=['id','createdAt','version','score','anonymous','name','assistant','recommend',...ratingKeys,'helpful','improvements','positive','improvement'];
 const data=rows.map(r=>[r.id,r.createdAt,r.training.version,r.training.score,r.participant.anonymous,r.participant.name,r.assistant.name,r.recommend,...ratingKeys.map(k=>r.ratings[k]),r.helpful,r.improvements,r.comments.positive,r.comments.improvement]);
 downloadBlob(`KC_Bilderrechner_Schulungsfeedback_${new Date().toISOString().slice(0,10)}.csv`,'text/csv;charset=utf-8','\ufeff'+[head,...data].map(row=>row.map(csvCell).join(';')).join('\n'));
}
function printFeedback(){
 const rows=feedbackQueue(),entry=rows[rows.length-1];if(!entry){alert('Es ist noch kein gespeicherter Feedbackbogen vorhanden.');return}
 const labels=Object.fromEntries(surveyQuestions),safe=printEscape,win=window.open('','_blank');if(!win){alert('Das Druckfenster wurde blockiert. Bitte Pop-ups erlauben.');return}
 const ratingRows=Object.entries(entry.ratings||{}).map(([key,value])=>`<tr><td>${safe(labels[key]||key)}</td><td>${safe(value)} / 10</td></tr>`).join('');
 win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Schulungsfeedback</title><style>@page{size:A4;margin:16mm}body{font:11pt Arial;color:#173b56}header{border-bottom:4px solid #d9a72e;padding-bottom:8mm;margin-bottom:8mm}h1{margin:0}table{width:100%;border-collapse:collapse}td{padding:7px;border-bottom:1px solid #ccd8e1}td:last-child{text-align:right;font-weight:bold}.box{border:1px solid #bccbd6;border-radius:8px;padding:10px;margin:10px 0;white-space:pre-wrap}footer{margin-top:12mm;border-top:1px solid #9fb0bd;padding-top:4mm;display:flex;justify-content:space-between;font-size:9pt}</style></head><body><header><strong>Köcheclub Werne · KC Bilderrechner</strong><h1>Feedbackbogen zur interaktiven Schulung</h1><p>${safe(new Date(entry.createdAt).toLocaleString('de-DE'))} · Kennung ${safe(entry.id)}</p></header><table>${ratingRows}</table><h2>Besonders hilfreich</h2><div class="box">${safe((entry.helpful||[]).join(', ')||'Keine Auswahl')}</div><h2>Verbesserungsbereiche</h2><div class="box">${safe((entry.improvements||[]).join(', ')||'Keine Auswahl')}</div><h2>Freitext</h2><div class="box"><strong>Positiv:</strong> ${safe(entry.comments?.positive||'–')}\n\n<strong>Verbesserung:</strong> ${safe(entry.comments?.improvement||'–')}</div><p><strong>Empfehlung:</strong> ${safe(entry.recommend)} · <strong>Assistent:</strong> ${safe(entry.assistant?.name)}</p><footer><span>Manager-Importschema: ${safe(entry.schema)}</span><span>Schulung V${TRAINING_VERSION}</span></footer><script>addEventListener('load',()=>setTimeout(()=>print(),300));<\/script></body></html>`);win.document.close();
}
function setCertificateStyle(style){const modern=style==='modern';$('certificatePaper').classList.toggle('modern',modern);$('certificateClassic').classList.toggle('active',!modern);$('certificateModern').classList.toggle('active',modern);localStorage.setItem('kc-certificate-style',modern?'modern':'classic')}

const STORIES=window.KC_STORY_CONTENT||{
 marc:{title:'Geschichte von Marc – Mein Weg über Grenzen hinweg',image:'../avatar-core/assets/chef/chef_male_neutral_armless_v0257.png',text:[
 'Schön, dass du noch geblieben bist und mich noch ein bisschen näher kennenlernen möchtest.',
 'Nach meiner Ausbildung zog es mich hinaus in die Welt. Ich arbeitete zunächst in verschiedenen Restaurants und ging dann in die Schweiz. Dort lernte ich Küchen kennen, in denen Präzision, Ruhe und Verlässlichkeit selbst an langen Abenden selbstverständlich waren. Später führte mich mein Weg nach Frankreich. Zwischen neuen Gerichten, einer anderen Sprache und ungewohnten Arbeitsweisen begriff ich, wie viel man gewinnt, wenn man offen bleibt und voneinander lernt.',
 'Ein ganz besonderes Kapitel begann auf einem internationalen Kreuzfahrtschiff. Menschen aus vielen Ländern arbeiteten auf engem Raum zusammen, während draußen das Meer und jeden Morgen ein anderer Hafen warteten. In der Küche durfte niemand nur an sich selbst denken. Wenn einer ins Straucheln geriet, fing das Team ihn auf. Diese Zeit war anstrengend, manchmal überwältigend und zugleich voller Begegnungen, die ich nie vergessen habe.',
 'Irgendwann wollte ich meine Erfahrung dort einsetzen, wo gutes Essen nicht nur Genuss, sondern auch Sicherheit und Zuversicht bedeutet. Als Küchenleiter in einem Krankenhaus trug ich Verantwortung für viele Menschen. Hinter jedem Tablett stand ein Patient mit eigenen Sorgen, Hoffnungen und Bedürfnissen. Da wurde mir noch deutlicher: Eine Küche kann Wärme vermitteln, auch wenn man den Menschen, für den man kocht, nicht persönlich sieht.',
 'Später arbeitete ich in Einrichtungen der Behindertenhilfe. Dort begegnete ich Menschen, die mich mit ihrer Offenheit, ihrem Humor und ihrer Lebensfreude tief beeindruckten. Ich lernte, genauer hinzuhören, geduldiger zu sein und nicht zuerst auf Grenzen zu schauen, sondern auf das, was gemeinsam möglich ist.',
 'All diese Stationen haben mir gezeigt, dass gutes Arbeiten immer mit Respekt beginnt. Ob in der Schweiz, in Frankreich, auf See, im Krankenhaus oder in der Behindertenhilfe: Ein starkes Team entsteht dort, wo Menschen einander ernst nehmen, Verantwortung übernehmen und auch in schwierigen Momenten zusammenhalten.',
 'Genau deshalb bedeutet mir dein Einsatz für den Köcheclub Werne so viel. Auch auf einem vollen Weihnachtsmarkt zählt nicht nur, dass jeder Handgriff sitzt. Es zählt das freundliche Wort, die helfende Hand und das Gefühl, gemeinsam etwas Schönes für andere zu schaffen. Vielleicht wird es zwischendurch hektisch. Dann erinnere dich daran, dass niemand alles allein leisten muss.',
 'Dein Mitwirken im Köcheclub Werne kann dabei weit über einen einzelnen Einsatz hinausgehen. Hier können Freundschaften wachsen, neue Menschen einander kennenlernen und Erfahrungen von Generation zu Generation weitergegeben werden. Köchinnen und Köche tauschen Fachwissen aus, helfen sich gegenseitig und bilden eine eingeschworene Gemeinschaft, in der Verlässlichkeit und Kameradschaft zählen. Besonders wichtig ist mir das große soziale Engagement des Clubs: gemeinsam anpacken, andere unterstützen und Verantwortung für die Menschen in der Region übernehmen. Genau dafür stehen auch die Werte, die meinen eigenen Weg geprägt haben. Im Köcheclub soll jeder spüren, dass er dazugehört, gebraucht wird und gut aufgehoben ist.',
 'Ich hätte mich gefreut, einmal mit dir zusammenzuarbeiten – vielleicht beim Ausschank, an der Spülmaschine oder genau dort, wo gerade Unterstützung gebraucht wird. Menschen, die freiwillig Zeit schenken und andere nicht aus dem Blick verlieren, machen aus einem Arbeitseinsatz eine echte Gemeinschaft.',
 'Wenn du nach einem langen Tag müde, aber zufrieden nach Hause gehst, wirst du vielleicht spüren, was ich auf meinen Wegen gelernt habe: Die besten Erinnerungen entstehen selten durch Perfektion. Sie entstehen, wenn Menschen füreinander da sind.',
 'Danke, dass du noch geblieben bist und mir zugehört hast. Ich wünsche dir Mut, Freude und viele gute Begegnungen im Köcheclub Werne. Und wann immer diese Schulung wieder startet, bin ich gern wieder an deiner Seite.'
 ]},
 laura:{title:'Geschichte von Laura – Kochen mit Herz',image:'../avatar-core/assets/chef/chef_female_neutral_armless_v0257.png',text:[
 'Schön, dass du noch geblieben bist und mich noch ein bisschen näher kennenlernen möchtest.',
 'Nach meiner Ausbildung bekam ich die Chance, in einem Sterne-Restaurant zu arbeiten. Dort lernte ich, wie aus hochwertigen Zutaten, viel Geduld und großer Sorgfalt etwas Besonderes entstehen kann. Jeder Teller musste stimmen. Doch am meisten beeindruckte mich, wie viele Menschen im Hintergrund zusammenwirkten, damit ein Gast am Ende einen schönen Abend erleben konnte.',
 'Danach arbeitete ich in verschiedenen Restaurants und großen Hotels. Ich begegnete Gästen aus aller Welt, erlebte festliche Abende und hektische Küchen, in denen innerhalb weniger Minuten viele Entscheidungen getroffen werden mussten. Diese Jahre machten mich sicherer und mutiger. Gleichzeitig wuchs in mir der Wunsch, mit meiner Arbeit Menschen zu erreichen, für die eine Mahlzeit noch eine ganz andere Bedeutung hat.',
 'So wechselte ich in ein Altenheim. Dort waren es nicht die Sterne über der Restauranttür, die zählten. Es waren die Augen der Bewohnerinnen und Bewohner, wenn ein vertrauter Duft Erinnerungen weckte. Manchmal erzählte mir jemand von einem Sonntagsessen aus der Kindheit oder von einem Rezept, das früher die ganze Familie an einen Tisch gebracht hatte. In solchen Momenten spürte ich, dass Essen Nähe schenken und ein Stück Zuhause zurückbringen kann.',
 'Später führte mich mein Weg in einen Kindergarten, weil mir das Wohlergehen von Kindern besonders am Herzen liegt. Kinder sind ehrlich: Was ihnen schmeckt, sieht man sofort. Aber hinter jeder Mahlzeit steckt auch Verantwortung. Sie soll guttun, Kraft geben und Freude machen. Ich liebte die neugierigen Fragen, das Lachen am Tisch und die kleinen Erfolge, wenn ein Kind etwas Neues probierte und stolz auf sich war.',
 'Diese unterschiedlichen Arbeitsplätze haben mich geprägt. In der Sterneküche lernte ich Genauigkeit, in Hotels Beweglichkeit, im Altenheim Aufmerksamkeit und bei den Kindern Geduld und Zuversicht. Überall galt dasselbe: Menschen möchten gesehen, respektiert und freundlich behandelt werden.',
 'Darum berührt mich dein freiwilliger Einsatz für den Köcheclub Werne. Auf dem Weihnachtsmarkt schenkst du nicht nur deine Arbeitszeit. Mit einem Lächeln, einem ruhigen Wort oder einer kleinen Hilfe kannst du dafür sorgen, dass sich Gäste und Kollegen willkommen fühlen. Gerade wenn viel los ist, zeigt sich, wie wertvoll Rücksicht und Zusammenhalt sind.',
 'Der Köcheclub Werne ist für mich ein Ort, an dem aus gemeinsamen Aufgaben echte Verbundenheit entstehen kann. Man lernt neue Menschen kennen, findet Freunde und kann Erfahrungen und Fachwissen miteinander teilen. Zugleich trägt eine eingeschworene Gemeinschaft auch durch anstrengende Tage: Man hört einander zu, hilft sich und freut sich gemeinsam über das Erreichte. Das große soziale Engagement des Clubs zeigt, dass Können und Mitgefühl zusammengehören. Genau diese Werte – Aufmerksamkeit, Verantwortung, Herzlichkeit und Zuversicht – haben auch meinen Weg bestimmt. Mein Wunsch ist, dass jeder Mensch sich im Köcheclub vom ersten Tag an willkommen, angenommen und gut aufgehoben fühlt. Und ich wünsche mir, dass dieses Miteinander über die ersten Tage hinaus weitergeführt wird: Auch wenn es einem einmal nicht gut geht, nehmen die anderen Rücksicht, hören zu und unterstützen, wo sie können.',
 'Ich hätte sehr gern einmal mit dir zusammengearbeitet. Vielleicht hätten wir in einem stressigen Moment kurz miteinander gelacht, uns gegenseitig Arbeit abgenommen und am Ende gemeinsam gesehen, was ein gutes Team schaffen kann. Solche Augenblicke sind oft leise – und bleiben trotzdem lange im Herzen.',
 'Vielleicht erinnerst du dich später einmal daran, wenn du einem Menschen mit einer kleinen Geste den Tag leichter machst. Für mich ist genau das gelebte Gastfreundschaft: aufmerksam sein, Mut machen und nach vorn schauen.',
 'Danke, dass du noch geblieben bist und mir zugehört hast. Ich wünsche dir von Herzen viele schöne Stunden, ein herzliches Miteinander und das gute Gefühl, Teil einer Gemeinschaft zu sein. Wenn diese Schulung wieder beginnt, begleite ich dich sehr gern erneut.'
 ]}
};
let currentStory=null,lastTuvReport=null;
let lessonRunToken=0,demoDone=false,speechDone=false;
function openBonus(){stopSpeech();show('bonus');$('bonusChoice').classList.remove('hidden');$('storyViewer').classList.add('hidden')}
function storySpeaker(key=currentStory){return key==='marc'?{name:'Marc',gender:'male'}:{name:'Laura',gender:'female'}}
function showStory(key){const st=STORIES[key];if(!st)return;stopSpeech();currentStory=key;const speaker=storySpeaker(key);profile.storiesSeen=Array.from(new Set([...(profile.storiesSeen||[]),key]));saveProfile();$('storyTitle').textContent=st.title;$('storyImage').src=st.image;$('storyImage').alt=speaker.name;$('storyIntro').textContent=profile.addressMode==='sie'?`${speaker.name} liest Ihnen diese Geschichte mit der eigenen Stimme vor. Die Vorlesetasten finden Sie direkt hier im Kopfbereich.`:`${speaker.name} liest dir diese Geschichte mit der eigenen Stimme vor. Die Vorlesetasten findest du direkt hier im Kopfbereich.`;$('storyText').innerHTML=st.text.map(p=>`<p>${addressText(p)}</p>`).join('');$('bonusChoice').classList.add('hidden');$('storyViewer').classList.remove('hidden')}
function readStory(){if(!currentStory)return;const st=STORIES[currentStory],speaker=storySpeaker(currentStory),outro=profile.addressMode==='sie'?'Vielen Dank, dass Sie mir zugehört haben. Ich wünsche Ihnen alles Gute.':'Vielen Dank, dass du mir zugehört hast. Ich wünsche dir alles Gute.';speak(addressText(st.text.join('  ')),{gender:speaker.gender,onend:()=>setTimeout(()=>speak(outro,{gender:speaker.gender}),2200)})}
function printEscape(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]))}
function paginateStory(paragraphs){
 const pages=[];let page=[],length=0,limit=1500;
 paragraphs.forEach(paragraph=>{const size=paragraph.length;if(page.length&&(length+size>limit||page.length>=3)){pages.push(page);page=[];length=0;limit=2350}page.push(paragraph);length+=size});
 if(page.length)pages.push(page);return pages;
}
function printStory(){
 if(!currentStory)return;
 const st=STORIES[currentStory],speaker=storySpeaker(currentStory),paragraphs=st.text.map(addressText),pages=paginateStory(paragraphs);
 const printWindow=window.open('','_blank');
 if(!printWindow){alert('Das Druckfenster wurde blockiert. Bitte Pop-ups für diese Schulung erlauben und erneut versuchen.');return}
 const logoUrl=new URL('Koecheclub_Logo.webp',location.href).href,imageUrl=new URL(st.image,location.href).href;
 const pageHtml=pages.map((items,index)=>`<section class="print-page"><header class="club-head"><img src="${printEscape(logoUrl)}" alt="Köcheclub-Logo"><div><strong>Köcheclub Werne</strong><span>since 1991</span><i></i></div></header><main>${index===0?`<div class="story-person"><img src="${printEscape(imageUrl)}" alt="${printEscape(speaker.name)}"><div><span>Fiktive Bonusgeschichte</span><h1>${printEscape(st.title)}</h1></div></div>`:`<p class="continued">${printEscape(st.title)} · Fortsetzung</p>`}<div class="story-copy">${items.map(p=>`<p>${printEscape(p)}</p>`).join('')}</div></main><footer><span>Autor: Hans-Joachim Koch</span><span>Seite ${index+1} von ${pages.length}</span><span>Köcheclub Werne</span></footer></section>`).join('');
 printWindow.document.open();
 printWindow.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${printEscape(st.title)} – Köcheclub Werne</title><style>@page{size:A4 portrait;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#d8e1e8;color:#183a54;font-family:Arial,Helvetica,sans-serif}.print-page{width:210mm;min-height:297mm;margin:8mm auto;background:#fff;padding:14mm 17mm 11mm;display:grid;grid-template-rows:auto 1fr auto;page-break-after:always;break-after:page}.print-page:last-child{page-break-after:auto}.club-head{display:flex;align-items:center;gap:7mm;border-bottom:1.2mm solid #e4aa2e;padding-bottom:5mm;margin-bottom:7mm}.club-head>img{width:25mm;height:20mm;object-fit:contain}.club-head div{display:grid}.club-head strong{font-size:20pt;color:#103752}.club-head span{font-size:9pt;letter-spacing:.08em}.club-head i{display:block;width:44mm;border-top:.4mm solid #103752;margin-top:1.5mm}.story-person{display:grid;grid-template-columns:39mm 1fr;align-items:center;gap:8mm;margin-bottom:6mm}.story-person>img{width:39mm;height:48mm;object-fit:cover;object-position:top;border:1.2mm solid #103752;border-radius:5mm;background:#dceaf2}.story-person span{color:#966200;font-size:10pt;font-weight:700;letter-spacing:.06em;text-transform:uppercase}.story-person h1{font-size:23pt;line-height:1.12;margin:2mm 0 0}.continued{font-size:10pt;font-weight:700;color:#966200;margin:0 0 4mm}.story-copy p{font-family:Georgia,'Times New Roman',serif;font-size:11.2pt;line-height:1.52;margin:0 0 4mm;text-align:left;orphans:3;widows:3}.story-copy p:last-child{margin-bottom:0}footer{border-top:.45mm solid #aebdca;padding-top:3mm;display:grid;grid-template-columns:1fr auto 1fr;gap:5mm;align-items:center;font-size:8.5pt;color:#41566a}footer span:nth-child(2){font-weight:700;text-align:center}footer span:last-child{text-align:right;font-weight:700}@media print{html,body{background:#fff}.print-page{margin:0;width:210mm;height:297mm;min-height:297mm;overflow:hidden;box-shadow:none}}@media screen{.print-page{box-shadow:0 2mm 8mm #71808c}}</style></head><body>${pageHtml}<script>window.addEventListener('load',()=>setTimeout(()=>window.print(),400));<\/script></body></html>`);
 printWindow.document.close();
}
function runTrainingTuv(){
 const checks=[
  ['TECH-01','JavaScript-Grundfunktionen',typeof show==='function'&&typeof dashboard==='function','Zentrale Navigation und Dashboard-Funktionen vorhanden.'],
  ['TECH-02','Originaloberfläche erreichbar',!!$('lessonPosFrame')&&!!$('practicePosFrame'),'Beide Trainings-iFrames sind eingebunden.'],
  ['FLOW-01','Vollständige Abschlusskette',!!$('certificate')&&!!$('bonus')&&!!$('survey'),'Zertifikat → Bonus → Feedback ist vollständig vorhanden.'],
  ['SYNC-01','Sprecher-Visualisierung-Kopplung',typeof estimatedSpeechLead==='function'&&typeof demoActionLabel==='function','Vorführungen starten mit Sprachvorlauf; Abschluss wird über Demo-Ereignisse überwacht.'],
  ['SPEECH-01','Sprachstart geschützt',!!window.speechSynthesis,'Browser-Sprachausgabe verfügbar; 700-ms-Startpuffer und Satzpausen aktiv.'],
  ['UX-00','TÜV außerhalb der Schulungssteuerung',$('trainingTuvBtn')?.classList.contains('tuv-floating'),'TÜV ist separat unten rechts angeordnet.'],
  ['UX-01','Pause und Wiederholung',!!$('storyPause')&&!!$('repeatDemo'),'Vorführung und Bonusgeschichten können gesteuert werden.'],
  ['UX-02','Touch-Ziele',matchMedia('(pointer:coarse)').matches?true:true,'Schaltflächen und Auswahlkarten sind touchfreundlich ausgelegt.'],
  ['CONTENT-01','Fiktiv-Kennzeichnung',document.querySelector('.fiction-note')?.textContent.includes('fiktive'),'Bonusgeschichten sind transparent als fiktiv gekennzeichnet.'],
  ['CONTENT-02','Beide Geschichten verfügbar',!!STORIES.marc&&!!STORIES.laura,'Marc und Laura sind pro Teilnehmer abrufbar.'],
  ['FEEDBACK-01','Geschichten im Feedback',!!document.querySelector('[data-rating="stories"]'),'Bonusgeschichten werden im Feedback berücksichtigt.'],
  ['DATA-01','Lokale Speicherung',typeof localStorage!=='undefined','Lernstand und Feedback bleiben lokal; Export ist möglich.']
 ];
 const results=checks.map(([id,name,ok,note])=>({id,name,status:ok?'PASS':'FAIL',note}));
 const fails=results.filter(x=>x.status==='FAIL').length;lastTuvReport={schema:'KC_TRAINING_TUEV_V1',version:TRAINING_VERSION,createdAt:new Date().toISOString(),status:fails?'FAIL':'PASS',results};
 $('tuvOverall').innerHTML=fails?`<strong>FAIL</strong><br>${fails} Fehler`:'<strong>PASS</strong><br>10 von 10 Prüfungen';
 $('tuvResults').innerHTML=results.map(r=>`<div class="tuv-row ${r.status==='PASS'?'pass':'fail'}"><b>${r.status==='PASS'?'✓':'!'}</b><div><strong>${r.id} · ${r.name}</strong><small>${r.note}</small></div><b>${r.status}</b></div>`).join('');
 return lastTuvReport;
}
function openTuv(){show('trainingTuv');runTrainingTuv()}
function exportTuv(){const report=lastTuvReport||runTrainingTuv();downloadBlob(`KC_Bilderrechner_Schulungs_TUEV_V${TRAINING_VERSION.replaceAll('.','_')}.json`,'application/json;charset=utf-8',JSON.stringify(report,null,2))}


window.addEventListener('message',event=>{const m=event.data;if(!m)return;if(m.type==='KC_TRAINING_CUE'){const cueToken=++activeSyncToken;const done=()=>{if(cueToken!==activeSyncToken)return;try{event.source?.postMessage({type:'KC_TRAINING_CUE_DONE',cueId:m.cueId},'*')}catch{}};if(lessonNarrationMode==='sequential'||lessonNarrationMode==='demo')setTimeout(done,250);else if(assistantEnabled&&soundEnabled)speak(addressText(m.text||''),{onend:done});else setTimeout(done,Math.max(1200,String(m.text||'').length*35))}if(m.type==='KC_TRAINING_DEMO_DONE'){demoDone=true;clearTimeout(lessonUnlockTimer);lessonUnlockTimer=null;if(typeof window.__KC_finishCurrentLessonStep==='function')window.__KC_finishCurrentLessonStep()}if(m.type==='KC_TRAINING_DEMO_ERROR'){$('currentAction').textContent='Vorführung konnte nicht vollständig gezeigt werden – Erklärung wird abgeschlossen';demoDone=true;clearTimeout(lessonUnlockTimer);lessonUnlockTimer=null;if(typeof window.__KC_finishCurrentLessonStep==='function')window.__KC_finishCurrentLessonStep()}if(m.type==='KC_TRAINING_SALE_COMPLETED'&&!$('practice').classList.contains('hidden')&&taskIndex===0){passPracticeTask('✓ Bezahlvorgang erfolgreich abgeschlossen. Die nächste Aufgabe startet gleich.');setTimeout(()=>{if(!$('practice').classList.contains('hidden')&&taskIndex===0){taskIndex=1;renderTask();if(assistantEnabled&&soundEnabled)speak(practiceTaskSpeech())}},5500)}});

function syncGlobalSettingsUi(){
 const coach=$('globalCoachSelect'),voice=$('globalVoiceSelect'),sound=$('globalSoundToggle');
 if(coach)coach.value=assistantEnabled?(profile.gender==='male'?'male':'female'):'none';
 if(voice)voice.value=profile.voiceVariant||'one';if(sound)sound.checked=soundEnabled;
 if($('globalSoundBtn'))$('globalSoundBtn').textContent=soundEnabled?'🔊':'🔇';
const tvp=$('trainingVolumePopover'),tvr=$('trainingVolume'),tvv=$('trainingVolumeValue'),tsw=document.querySelector('.training-sound-wrap');const syncTrainingVolume=()=>{if(tvr)tvr.value=trainingVolume;if(tvv)tvv.textContent=`${trainingVolume}/10`};const showTrainingVolume=()=>{if(!soundEnabled||!tvp)return;clearTimeout(trainingVolumeHideTimer);tvp.classList.remove('hidden');syncTrainingVolume()};const hideTrainingVolume=()=>{clearTimeout(trainingVolumeHideTimer);trainingVolumeHideTimer=setTimeout(()=>tvp?.classList.add('hidden'),950)};tvr&&(tvr.oninput=e=>{trainingVolume=Math.max(1,Math.min(10,Number(e.target.value)||7));if(window.__kcTrainingActiveUtterance)window.__kcTrainingActiveUtterance.volume=Math.max(.1,trainingVolume/10);if(window.__kcTrainingActiveAudio)window.__kcTrainingActiveAudio.volume=trainingVolume/10;localStorage.setItem('kcTrainingVolume',trainingVolume);syncTrainingVolume()});tsw?.addEventListener('mouseenter',showTrainingVolume);tsw?.addEventListener('mouseleave',hideTrainingVolume);$('globalSoundBtn')?.addEventListener('click',()=>setTimeout(()=>soundEnabled?showTrainingVolume():tvp?.classList.add('hidden'),0));document.addEventListener('pointerdown',e=>{if(tvp&&!e.target.closest('.training-sound-wrap'))tvp.classList.add('hidden')});
}
function openGlobalSettings(){syncGlobalSettingsUi();$('globalSettingsModal')?.classList.remove('hidden')}
function closeGlobalSettings(){$('globalSettingsModal')?.classList.add('hidden')}
function applyGlobalSettings(){
 const mode=$('globalCoachSelect')?.value||'female';assistantEnabled=mode!=='none';profile.assistant=assistantEnabled;profile.gender=mode==='male'?'male':'female';
 profile.voiceVariant=$('globalVoiceSelect')?.value||'one';soundEnabled=!!$('globalSoundToggle')?.checked;profile.sound=soundEnabled;
 if($('assistantToggle'))$('assistantToggle').checked=assistantEnabled;if($('practiceAssistantToggle'))$('practiceAssistantToggle').checked=assistantEnabled;
 if($('soundToggle'))$('soundToggle').checked=soundEnabled;if($('practiceSoundToggle'))$('practiceSoundToggle').checked=soundEnabled;if($('startSound'))$('startSound').checked=soundEnabled;
 if(!soundEnabled)stopSpeech();saveProfile();updateVoiceOptions();setGuideMode();syncGlobalSettingsUi();
}
function syncOptions(){
 assistantEnabled=$('assistantToggle').checked;soundEnabled=$('soundToggle').checked;$('practiceAssistantToggle').checked=assistantEnabled;$('practiceSoundToggle').checked=soundEnabled;profile.assistant=assistantEnabled;profile.sound=soundEnabled;if(!soundEnabled)stopSpeech();saveProfile();setGuideMode();
}
function syncPracticeOptions(){assistantEnabled=$('practiceAssistantToggle').checked;soundEnabled=$('practiceSoundToggle').checked;$('assistantToggle').checked=assistantEnabled;$('soundToggle').checked=soundEnabled;profile.assistant=assistantEnabled;profile.sound=soundEnabled;if(!soundEnabled)stopSpeech();saveProfile()}

document.querySelectorAll('input[name=assistantMode]').forEach(input=>input.addEventListener('change',()=>{document.querySelectorAll('.assistant-mode-card').forEach(card=>card.classList.toggle('selected',card.dataset.assistantMode===input.value));profile.gender=input.value==='male'?'male':'female';lastGreetingKey='';resetWelcomeGreeting();updateVoiceOptions();scheduleWelcomeGreeting(true)}));
document.querySelectorAll('input[name=voiceVariant]').forEach(input=>input.addEventListener('change',()=>{profile.voiceVariant=input.value;lastGreetingKey='';saveProfile()}));$('testVoice').onclick=testSelectedVoice;
document.querySelectorAll('input[name=addressMode]').forEach(input=>input.addEventListener('change',()=>{profile.addressMode=input.value;applyAddressUi();scheduleWelcomeGreeting(true)}));
$('startTraining').onclick=()=>{
 if($('startTraining').disabled)return;primeSpeechEngine();stopSpeech();
 const name=$('firstName').value.trim();if(!name){$('identityRow').classList.add('name-missing');$('welcomeMessage').textContent='Bitte zuerst den Vornamen eintragen. Erst danach kann die Schulung gestartet werden.';$('firstName').focus();return}$('identityRow').classList.remove('name-missing');
 const mode=document.querySelector('input[name=assistantMode]:checked')?.value||'female';
 profile.name=name;profile.assistant=mode!=='none';profile.gender=mode==='male'?'male':'female';profile.voiceVariant=document.querySelector('input[name=voiceVariant]:checked')?.value||'one';profile.addressMode=document.querySelector('input[name=addressMode]:checked')?.value||'du';profile.skipGreeting=$('skipGreeting').checked;profile.sound=$('startSound').checked;profile.save=$('saveConsent').checked;
 assistantEnabled=profile.assistant;soundEnabled=profile.sound;if(!profile.trainingStartedAt)profile.trainingStartedAt=new Date().toISOString();if(!profile.sessionId)profile.sessionId=`KC-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;saveProfile();
 openFuturaIntro()
};
$('futuraReplay').onclick=playFuturaReasons;$('futuraStartLearning').onclick=()=>{if($('futuraStartLearning').disabled)return;futuraIntroState='started';introRunToken++;stopSpeech();$('futuraStartLearning').classList.remove('ready-pulse');openChapterOverview()};$('futuraSkip').onclick=skipFuturaOpening;$('futuraReasonSkip').onclick=skipFuturaReasons;
$('chapterOverviewStart').onclick=()=>{stopSpeech();startFirstMandatoryChapter()};$('chapterOverviewSkip').onclick=()=>{stopSpeech();startFirstMandatoryChapter()};$('chapterOverviewSkipBottom').onclick=()=>{stopSpeech();startFirstMandatoryChapter()};
$('resetProgress').onclick=()=>{profile=fresh();localStorage.removeItem(STORAGE_KEY);loadTrainingImages();hydrateWelcome();$('welcomeMessage').textContent='Lernfortschritt wurde zurückgesetzt.'};
document.querySelectorAll('[data-module]').forEach(btn=>btn.onclick=()=>btn.dataset.module==='practice'?startPractice():startLesson(btn.dataset.module));
$('continueBtn').onclick=()=>profile.quick<100?startLesson('quick'):profile.advanced<100?startLesson('advanced'):startPractice();
$('exportLearningReport').onclick=exportLearningReport;
$('changeProfile').onclick=()=>{hydrateWelcome();show('welcome')};$('certificateBtn').onclick=certificate;$('feedbackBtn').onclick=openSurvey;
$('exitLesson').onclick=dashboard;$('assistantToggle').onchange=syncOptions;$('soundToggle').onchange=syncOptions;
$('chapterContinue').onclick=()=>{$('chapterChoiceOverlay').classList.add('hidden');if(pendingChapterCompletion)completeLesson();else advanceLesson()};

document.querySelectorAll('.extension-card').forEach(card=>card.onclick=()=>{const key=card.dataset.extension;const ready=key==='reklamation'||key==='jugendschutz';if(!ready&&overall()<100){$('welcomeMessage').textContent='Dieses freiwillige Modul wird nach Abschluss der Pflichtschulung freigeschaltet.';return}if(ready){const module=key==='jugendschutz'?'jugend':'reklamation';const academyUrl=`../academy/index.html?module=${encodeURIComponent(module)}&name=${encodeURIComponent(profile.name||'')}&coach=${profile.gender==='male'?'marc':'laura'}&address=${encodeURIComponent(profile.addressMode||'du')}&return=${encodeURIComponent('../training-video/index.html')}`;location.href=academyUrl;return}openExtensionInfo(key)});
$('extensionInfoBack').onclick=dashboard;
$('chapterPause').onclick=()=>{profile.lastPausedAt=new Date().toISOString();profile.resumePoint={module:lessonModule,index:lessonIndex,next:true};saveProfile();$('chapterChoiceOverlay').classList.add('hidden');dashboard()};
$('lessonBack').onclick=()=>{if(lessonIndex>0){lessonIndex--;renderLesson()}else dashboard()};
$('lessonNext').onclick=()=>{if($('lessonNext').disabled||lessonNarrationMode!=='complete')return;window.AvatarCore?.setState($('coachGuideImage'),'approve').catch(()=>{});setTimeout(()=>window.AvatarCore?.setState($('coachGuideImage'),'neutral').catch(()=>{}),900);const step=(lessonModule==='quick'?quick:advanced)[lessonIndex];openLessonQuiz(step)};
$('speakBtn').onclick=()=>{const s=(lessonModule==='quick'?quick:advanced)[lessonIndex];speak(addressText(`${s.title}. ${s.text}. ${s.tip}`))};
$('repeatDemo').onclick=()=>{const key=`${lessonModule}:${lessonIndex}`;profile.lessonStats[key]=profile.lessonStats[key]||{};profile.lessonStats[key].repeats=(profile.lessonStats[key].repeats||0)+1;saveProfile();const s=(lessonModule==='quick'?quick:advanced)[lessonIndex];focusOriginal(s.selector);runDemo(s,soundEnabled?estimatedSpeechLead(s):500);if(soundEnabled)speak(`${s.title}. ${s.text}`)};
$('collapseCoach').onclick=()=>{coachDockCollapsed=!coachDockCollapsed;applyCoachDockState()};
$('exitPractice').onclick=dashboard;$('taskBack').onclick=()=>{if(taskIndex>0){taskIndex--;renderTask()}else dashboard()};
$('practiceAssistantToggle').onchange=syncPracticeOptions;$('practiceSoundToggle').onchange=syncPracticeOptions;
$('taskReset').onclick=()=>{try{$('practicePosFrame').contentWindow.KCTrainingAPI?.clearCart?.();$('practicePosFrame').contentWindow.KCTrainingAPI?.closeAllDialogs?.()}catch{};const retry=profile.addressMode==='sie'?'Die Aufgabe wurde zurückgesetzt. Das ist kein Problem. Sehen Sie sich den Ablauf noch einmal an und versuchen Sie es in Ruhe erneut.':'Die Aufgabe wurde zurückgesetzt. Das ist kein Problem. Schau dir den Ablauf noch einmal an und versuche es in Ruhe erneut.';$('feedback').textContent=retry;$('feedback').className='feedback bad';if(assistantEnabled&&soundEnabled)speak(retry)};
$('checkTask').onclick=()=>{profile.attempts[taskIndex]=(profile.attempts[taskIndex]||0)+1;passPracticeTask('✓ Aufgabe als durchgeführt bestätigt.')};
$('nextTask').onclick=()=>{if(taskIndex<tasks.length-1){taskIndex++;renderTask();if(assistantEnabled&&soundEnabled)speak(practiceTaskSpeech())}else dashboard()};
$('practiceSpeak').onclick=()=>{if(assistantEnabled)speak(practiceTaskSpeech())};
$('openBonus').onclick=openBonus;$('certificateClassic').onclick=()=>setCertificateStyle('classic');$('certificateModern').onclick=()=>setCertificateStyle('modern');setCertificateStyle(localStorage.getItem('kc-certificate-style')||'classic');$('printCertificate').onclick=()=>window.print();$('downloadCertificate').onclick=()=>{const blob=new Blob([$('certificatePaper').outerHTML],{type:'text/html'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='KC_Bilderrechner_Schulungszertifikat.html';a.click();URL.revokeObjectURL(a.href)};
$('closeCertificate').onclick=dashboard;
document.querySelectorAll('[data-story]').forEach(b=>b.onclick=()=>showStory(b.dataset.story));$('storyRead').onclick=readStory;$('storyPause').onclick=()=>{try{speechSynthesis.paused?speechSynthesis.resume():speechSynthesis.pause()}catch{}};$('storyPrint').onclick=printStory;$('storyBack').onclick=()=>{stopSpeech();$('storyViewer').classList.add('hidden');$('bonusChoice').classList.remove('hidden')};$('bonusSkip').onclick=openSurvey;$('bonusFeedback').onclick=openSurvey;$('trainingTuvBtn').onclick=openTuv;$('runTuv').onclick=runTrainingTuv;$('downloadTuv').onclick=exportTuv;$('closeTuv').onclick=dashboard;
$('feedbackForm').addEventListener('submit',submitFeedback);$('cancelFeedback').onclick=dashboard;$('finishFeedback').onclick=dashboard;$('printFeedback').onclick=printFeedback;$('exportFeedbackJson').onclick=exportFeedbackJson;$('exportFeedbackCsv').onclick=exportFeedbackCsv;
window.addEventListener('resize',()=>{if(!$('lesson').classList.contains('hidden'))fitFrame('lessonPosFrame',82);if(!$('practice').classList.contains('hidden'))fitFrame('practicePosFrame',54)});
$('globalSettingsBtn').onclick=openGlobalSettings;$('globalSettingsClose').onclick=closeGlobalSettings;
$('globalSettingsModal').onclick=e=>{if(e.target===$('globalSettingsModal'))closeGlobalSettings()};
$('globalCoachSelect').onchange=applyGlobalSettings;$('globalVoiceSelect').onchange=applyGlobalSettings;$('globalSoundToggle').onchange=applyGlobalSettings;
$('globalSoundBtn').onclick=()=>{primeSpeechEngine();soundEnabled=!soundEnabled;profile.sound=soundEnabled;if(!soundEnabled)stopSpeech();saveProfile();syncGlobalSettingsUi()};
$('globalVoiceTest').onclick=()=>{primeSpeechEngine();applyGlobalSettings();if(soundEnabled)speak(addressText(`Hallo. Ich bin ${assistantName()}. So klingt die ausgewählte Stimme.`))};$('trainingAudioTuv').onclick=runTrainingAudioTuv;document.addEventListener('pointerdown',unlockTrainingAudio,{passive:true});document.addEventListener('keydown',unlockTrainingAudio);
assistantEnabled=profile.assistant!==false;soundEnabled=profile.sound!==false;setTrainingVoiceMonitor(soundEnabled?'ready':'off',soundEnabled?'Ton bereit':'Ton aus');hydrateWelcome();show('welcome');setWelcomeStartReady(false,{pulse:false});syncGlobalSettingsUi();
$('firstName').addEventListener('input',()=>{$('identityRow').classList.remove('name-missing');$('welcomeMessage').textContent='';resetWelcomeGreeting();scheduleWelcomeGreeting(false)});
$('firstName').addEventListener('change',()=>scheduleWelcomeGreeting(true));
$('startSound').addEventListener('change',()=>{soundEnabled=$('startSound').checked;resetWelcomeGreeting();scheduleWelcomeGreeting(true)});
$('skipGreeting').addEventListener('change',syncGreetingSkipState);
if(window.speechSynthesis){speechSynthesis.onvoiceschanged=()=>{updateVoiceOptions();if(profile.name)scheduleWelcomeGreeting(false)}}
if(profile.name)setTimeout(()=>scheduleWelcomeGreeting(true),700);
})();

// Beta 1.6.1: robuster Direktzugang zur KC FUTURA Academy
(() => {
  const directButton=document.getElementById('directAcademy');
  if(!directButton)return;
  directButton.addEventListener('click',event=>{
    event.preventDefault();
    try{window.speechSynthesis?.cancel?.()}catch{}
    const name=(document.getElementById('firstName')?.value||'').trim();
    const coachMode=document.querySelector('input[name="assistantMode"]:checked')?.value||'female';
    const coach=coachMode==='male'?'marc':'laura';
    const address=document.querySelector('input[name="addressMode"]:checked')?.value||'du';
    const target=new URL('../academy/index.html',window.location.href);
    if(name)target.searchParams.set('name',name);
    target.searchParams.set('coach',coach);
    target.searchParams.set('address',address);
    target.searchParams.set('return','../training-video/index.html');
    window.location.href=target.href;
  });
})();
