import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
const pick=id=>page.locator(`[data-routine="${id}"]`).click();
try{
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('生活測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/general');
 for(let i=0;i<3;i++)await pick('sleep');
 assert.equal((await player()).zones.general.game.step,0);await page.locator('#routine-help').click();assert.equal(await page.locator('[data-routine="breakfast"].routine-hint').count(),1);
 await pick('breakfast');await page.locator('#routine-next').click();
 const sprite=page.locator('.routine-dino .character');assert((await sprite.getAttribute('src')).endsWith('dino-playing.png'));await sprite.evaluate(i=>i.decode());await page.screenshot({path:'docs/screenshots/general-playing.png',fullPage:true});
 await pick('sleep');assert.equal((await player()).zones.general.game.step,0);
 await pick('bath');await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.goto('http://127.0.0.1:4173/hub/#/play/general');
 assert.equal((await player()).zones.general.game.step,1);assert((await sprite.getAttribute('src')).endsWith('dino-washing.png'));await sprite.evaluate(i=>i.decode());await page.screenshot({path:'docs/screenshots/general-washing.png',fullPage:true});await pick('sleep');await page.locator('#routine-next').click();
 await pick('night');assert.equal((await player()).zones.general.game.step,0);
 await pick('morning');await pick('day');await page.reload();await page.locator('[data-routine]').first().waitFor();assert.equal((await player()).zones.general.game.step,2);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.setViewportSize({width:1194,height:834});await pick('night');await page.screenshot({path:'docs/screenshots/general-v2.png',fullPage:true});await page.locator('#routine-next').click();assert.equal((await player()).zones.general.complete,true);
 await page.reload();await page.waitForURL('**/#/map');assert.deepEqual(errors,[]);
 console.log('PASS general: breakfast, wash-before-sleep, three time matches, hints, leave/reload, mobile overflow, completion and replay lock');
}finally{await browser.close();}
