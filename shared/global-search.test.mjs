import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const header=readFileSync(new URL('shared/unified-header.js',root),'utf8');
const css=readFileSync(new URL('shared/unified-header.css',root),'utf8');
const training=readFileSync(new URL('training-video/app.js',root),'utf8');
const academy=readFileSync(new URL('academy/app.js',root),'utf8');
const bundled=readFileSync(new URL('shared/global-search-catalog.js',root),'utf8');

test('globale Suche ist syntaktisch gültig und in der Kopfzeile erreichbar',()=>{
 new vm.Script(header,{filename:'unified-header.js'});
 assert.match(header,/id="kcGlobalSearch"/);
 assert.match(header,/function openGlobalSearch\(\)/);
 assert.match(header,/term\.length<2/);
});

test('rotes X löscht Suchtext und behält den Eingabefokus',()=>{
 assert.match(header,/id="kcGlobalSearchClear"/);
 assert.match(header,/clear\.onclick=\(\)=>\{input\.value='';render\(\);input\.focus/);
 assert.match(css,/#kcGlobalSearchClear\{border:2px solid #a71414;background:#d92222/);
});

test('Teil 1 und Teil 2 liefern durchsuchbare Kataloge und direkte Sprungziele',()=>{
 assert.match(training,/KCFuturaGlobalSearchItems/);
 assert.match(training,/kind:'training'/);
 assert.match(academy,/kind:'academy'/);
 assert.match(header,/function searchItemUrl\(item\)/);
 assert.match(header,/kcFuturaSearchCatalogPart1/);
 assert.match(header,/kcFuturaSearchCatalogPart2/);
 assert.match(header,/Frau Schmitt/);
 assert.match(header,/Hygiene[\s\S]*hyg/);
 assert.match(header,/Integrierter Schulungs-TÜV/);
 assert.match(training,/item\.quiz\?\.question/);
 assert.match(academy,/academySearchText/);
 assert.match(academy,/Figuren und Avatare/);
 assert.match(header,/KCFuturaBundledSearchCatalog/);
 assert.match(bundled,/Frau Schmitt/);
 assert.match(bundled,/Hygiene/);
});

test('Tablet-Eingabe ist tastaturfreundlich und platzsparend',()=>{
 assert.match(header,/inputmode="search"/);
 assert.match(header,/enterkeyhint="search"/);
 assert.match(css,/@media\(max-width:720px\),\(pointer:coarse\)/);
 assert.match(css,/font-size:16px/);
});

test('verpflichtender Darstellungshinweis blockiert bis zur versionsbezogenen Bestätigung',()=>{
 assert.match(header,/DISCLAIMER_VERSION='2\.6\.15'/);
 assert.match(header,/Wichtiger Hinweis zur Schulungsdarstellung/);
 assert.match(header,/Ich habe den Hinweis verstanden/);
 assert.match(header,/Erweiterte Hinweise und Regeln anzeigen/);
 assert.match(header,/Zurück zur Kurzfassung/);
 assert.match(header,/Gesetzlich zwingende Haftungsansprüche bleiben unberührt/);
 assert.match(header,/acceptedAt:new Date\(\)\.toISOString\(\)/);
 assert.match(css,/\.kc-disclaimer-shell/);
});
