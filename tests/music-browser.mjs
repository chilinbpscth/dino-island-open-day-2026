import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
await page.addInitScript(()=>{const Native=window.AudioContext;window.testAudioContexts=[];window.AudioContext=class extends Native{constructor(...args){super(...args);window.testAudioContexts.push(this);}};});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
const tap=i=>page.locator(`[data-band="${i}"]`).click();
const demo=async()=>{await page.locator('#band-demo').click();assert(await page.locator('[data-band="0"]').isDisabled());await page.waitForFunction(()=>!document.querySelector('[data-band="0"]').disabled);};
try{
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('樂隊測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/music');
 assert(await page.locator('[data-band="0"]').isDisabled());await page.locator('#band-demo').click();await page.waitForFunction(()=>window.testAudioContexts.length===1&&window.testAudioContexts[0].state==='running');await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.waitForFunction(()=>window.testAudioContexts.every(c=>c.state==='closed'));await page.goto('http://127.0.0.1:4173/hub/#/play/music');await page.locator('#band-mute').click();
 for(let i=0;i<3;i++){await demo();await tap(2);}assert.equal((await player()).zones.music.game.attempts,3);
 await page.locator('#band-help').click();await page.waitForFunction(()=>!document.querySelector('[data-band="0"]').disabled);assert.equal(await page.locator('[data-band="0"].band-hint').count(),1);await tap(0);assert.equal(await page.locator('[data-band="1"].band-hint').count(),1);await tap(1);await page.locator('#band-next').click();
 assert.equal(await page.locator('[data-beat]').count(),3);await demo();await tap(1);await tap(0);await tap(2);await page.locator('#band-next').click();
 assert.equal(await page.locator('[data-beat]').count(),4);await page.locator('#band-demo').click();await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.waitForTimeout(3000);assert.equal(await page.locator('.band-lit').count(),0);
 await page.goto('http://127.0.0.1:4173/hub/#/play/music');assert.equal((await player()).zones.music.game.round,2);assert(await page.locator('[data-band="0"]').isDisabled());await demo();for(const i of [0,2,1,2])await tap(i);
 await page.reload();await page.locator('#band-next').waitFor();assert.equal((await player()).zones.music.complete,false);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.setViewportSize({width:1194,height:834});await page.screenshot({path:'docs/screenshots/music-v2.png',fullPage:true});await page.locator('#band-next').click();assert.equal((await player()).zones.music.complete,true);assert.deepEqual(errors,[]);
 console.log('PASS music: mute-only 2/3/4 beats, disabled during demo, wrong order, guided lights, leave during demo, reload outcome, mobile width and completion');
}finally{await browser.close();}
