import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {CHARACTERS,pathSamples} from '../shared/core.js';
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1024,height:768},serviceWorkers:'block',hasTouch:true});
await context.route('https://**',r=>r.abort());
await context.addInitScript(()=>{localStorage.setItem('dino-island-20260913:settings',JSON.stringify({appScriptUrl:'',deviceToken:''}));Object.defineProperty(navigator.mediaDevices,'getUserMedia',{value:()=>Promise.reject(new DOMException('Denied','NotAllowedError'))});});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.clock.install();
const go=async id=>{await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/'+id);await page.locator('#game').waitFor();};
const trace=async(path,reverse=false)=>{const svg=page.locator('.trace-board');await svg.scrollIntoViewIfNeeded();const b=await svg.boundingBox();let points=pathSamples(path,5);if(reverse)points=points.reverse();await page.mouse.move(b.x+points[0][0]/300*b.width,b.y+points[0][1]/300*b.height);await page.mouse.down();for(const p of points.slice(1))await page.mouse.move(b.x+p[0]/300*b.width,b.y+p[1]/300*b.height);await page.mouse.up();};
try{
await go('chinese');await trace(CHARACTERS[0].paths[0],true);assert.match(await page.locator('.trace-board').getAttribute('aria-label'),/第1筆/);await trace(CHARACTERS[0].paths[0]);await page.reload();await page.locator('.trace-board').waitFor();assert.match(await page.locator('.trace-board').getAttribute('aria-label'),/第2筆/);
await page.screenshot({path:'docs/screenshots/language-audit-chinese.png',fullPage:true});
for(const [ci,c] of CHARACTERS.entries()){for(const [si,path] of c.paths.entries()){if(ci===0&&si===0)continue;await trace(path);}await page.locator('#next-round').click();}await page.locator('#return-map').waitFor();console.log('PASS Chinese six characters: reversed rejected, reload retained first stroke, all completed');
await go('mandarin');assert(await page.locator('#greeting-next').isDisabled());await page.locator('#greeting-record').click();await page.waitForFunction(()=>!document.querySelector('#greeting-record').disabled);assert.match(await page.locator('.feedback').innerText(),/未能使用/);assert(await page.locator('#greeting-next').isDisabled());await page.locator('#greeting-family').click();await page.locator('#greeting-next').click();await page.reload();await page.locator('.speech-bubble').waitFor();assert.match(await page.locator('.speech-bubble').innerText(),/早上好/);await page.screenshot({path:'docs/screenshots/language-audit-mandarin.png',fullPage:true});
for(let i=1;i<6;i++){await page.locator('#greeting-family').click();await page.locator('#greeting-next').click();}await page.locator('#return-map').waitFor();console.log('PASS Mandarin microphone rejection + family fallback, six phrases, reload');
await go('english');await page.locator('#motion-camera-start').click();await page.locator('#motion-camera-start').waitFor();assert.match(await page.locator('.feedback').innerText(),/未能使用鏡頭/);await page.locator('#motion-family').click();assert(await page.locator('#motion-hold').isDisabled());await page.clock.runFor(5300);
let hold=page.locator('#motion-hold');await hold.scrollIntoViewIfNeeded();let b=await hold.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(1200);await page.mouse.up();assert.equal(await page.locator('#motion-next').count(),0);
await page.screenshot({path:'docs/screenshots/language-audit-english.png',fullPage:true});
for(let i=0;i<7;i++){assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));await page.clock.runFor(5300);hold=page.locator('#motion-hold');await hold.scrollIntoViewIfNeeded();b=await hold.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(3200);await page.mouse.up();await page.locator('#motion-next').click();}await page.locator('#return-map').waitFor();assert.deepEqual(errors,[]);console.log('PASS English seven commands: camera rejection, countdown, interrupted hold rejected, family complete, zero visible English, no page errors');
}finally{await browser.close();}
