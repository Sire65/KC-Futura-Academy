import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Koch/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const page=await browser.newPage({viewport:{width:1180,height:800}});
const errors=[];page.on('pageerror',error=>errors.push(String(error)));page.on('console',message=>{if(message.type()==='error'&&!message.text().includes('404'))errors.push(message.text())});
await page.goto('http://127.0.0.1:8765/games/spielpause/index.html');
await page.waitForLoadState('domcontentloaded');
const gameIds=await page.locator('[data-game]').evaluateAll(nodes=>nodes.map(node=>node.dataset.game));
const started=[];
for(const id of gameIds){await page.locator(`[data-game="${id}"]`).click();started.push({id,visible:await page.locator('#gameView').isVisible(),content:(await page.locator('#gameHost').innerHTML()).trim().length>0});await page.locator('#backBtn').click()}
await page.locator('[data-game="maze"]').click();
await page.getByRole('button',{name:'Allein spielen'}).click();
const answers=page.locator('[data-answer]');
const state={title:await page.locator('.maze-cabinet').isVisible(),answers:await answers.count(),message:await page.locator('#message').innerText(),started,errors};
console.log(JSON.stringify(state));
if(!state.title||state.answers!==3||errors.length||started.length!==9||started.some(game=>!game.visible||!game.content))process.exitCode=1;
await browser.close();
