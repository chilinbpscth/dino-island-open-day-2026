import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
const feed=async fruit=>{await page.locator(`[data-food="${fruit}"]`).click();await page.locator('[data-dino]').click();};
try{
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('水果測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/math');
 await page.locator('[data-food="banana"]').click();assert.equal((await player()).zones.math.game.recognized,0);
 for(const fruit of ['apple','banana','strawberry'])await page.locator(`[data-food="${fruit}"]`).click();
 await expect(page.locator('[data-dino]')).toHaveCount(1);await expect(page.locator('[data-order]')).toHaveCount(3);
 await feed('strawberry');await feed('strawberry');await feed('strawberry');await feed('strawberry');
 assert.deepEqual((await player()).zones.math.game.served,[0,0,1]);await page.locator('#feeding-help').click();await expect(page.locator('[data-food="apple"]')).toHaveClass(/feeding-hint/);
 await page.reload();await page.locator('[data-order]').first().waitFor();assert.deepEqual((await player()).zones.math.game.served,[0,0,1]);
 await feed('banana');await feed('apple');await page.locator('#feeding-next').click();
 for(const [fruit,n] of [['banana',1],['strawberry',3],['apple',2]])for(let i=0;i<n;i++)await feed(fruit);
 await page.locator('#feeding-next').click();
 await page.screenshot({path:'docs/screenshots/math-fruit-order.png',fullPage:true});
 await page.setViewportSize({width:768,height:1024});await page.screenshot({path:'docs/screenshots/math-fruit-portrait.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 for(const [fruit,n] of [['apple',3],['banana',2],['strawberry',1]])for(let i=0;i<n;i++)await feed(fruit);
 await page.locator('#feeding-next').click();assert.equal((await player()).zones.math.complete,true);
 await page.reload();await page.waitForURL('**/#/map');assert.deepEqual(errors,[]);
 console.log('PASS recognition, separate fruit counts, arbitrary order, overfeeding rejection, hints, reload, portrait and completion lock');
}finally{await browser.close();}
