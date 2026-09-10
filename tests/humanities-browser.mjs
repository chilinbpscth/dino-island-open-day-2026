import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
const guide=async name=>{const image=page.locator('.expedition-guide');assert.equal(await image.getAttribute('src'),`img/games/humanities/${name}-explorer.png`);await image.evaluate(i=>i.decode());assert.equal(await page.locator('.expedition-camp>.character').count(),2);};
const pick=id=>page.locator(`[data-expedition="${id}"]`).click();
try{
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('營地測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/humanities');
 assert.match(await page.locator('.expedition-intro').innerText(),/想像遊戲/);await page.locator('#expedition-start').click();await page.waitForFunction(()=>[...document.querySelectorAll('.expedition-landscape')].every(i=>i.complete&&i.naturalWidth));assert.equal(await page.locator('.expedition-landscape').count(),3);await guide('xiaolian');await page.locator('.expedition-camp').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(a=>a.finished)));await page.screenshot({path:'docs/screenshots/humanities-options-v2.png',fullPage:true});
 for(let i=0;i<3;i++)await pick('volcano');assert.equal((await player()).zones.humanities.game.roundDone,false);await page.locator('#expedition-help').click();assert.equal(await page.locator('[data-expedition="forest"].expedition-hint').count(),1);
 await pick('forest');assert.equal(await page.locator('.expedition-improvements>span').count(),1);await page.reload();await page.locator('#expedition-next').click();
 await guide('xiaozhi');await pick('mud');assert.equal((await player()).zones.humanities.game.roundDone,false);await pick('bottle');assert.equal(await page.locator('.expedition-improvements>span').count(),2);await page.locator('#expedition-next').click();
 await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.goto('http://127.0.0.1:4173/hub/#/play/humanities');assert.equal((await player()).zones.humanities.game.round,2);await guide('xiaolian');
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await pick('forest');assert.equal(await page.locator('.expedition-improvements>span').count(),3);await page.waitForFunction(()=>getComputedStyle(document.querySelector('.camp-added')).opacity==='1');await page.screenshot({path:'docs/screenshots/humanities-mobile-v2.png',fullPage:true});
 await page.setViewportSize({width:1194,height:834});await page.waitForFunction(()=>getComputedStyle(document.querySelector('.camp-added')).opacity==='1');await page.screenshot({path:'docs/screenshots/humanities-v2.png',fullPage:true});assert.equal((await player()).zones.humanities.complete,false);await page.locator('#expedition-next').click();assert.equal((await player()).zones.humanities.complete,true);
 await page.reload();await page.waitForURL('**/#/map');assert.deepEqual(errors,[]);
 console.log('PASS humanities: imagination intro, three environment choices, wrong answers and hints, cumulative camp, reload/re-entry, mobile width, completion and replay lock');
}finally{await browser.close();}
