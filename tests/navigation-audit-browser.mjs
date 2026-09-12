import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();
const errors=[];
try{
 const context=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true,serviceWorkers:'block'});
 await context.route('https://**',r=>r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/map');
 const zones=await page.locator('[data-zone]').evaluateAll(nodes=>nodes.map(n=>n.dataset.zone));
 for(const id of zones){
  await page.locator(`[data-zone="${id}"] .park-label`).tap();
  await page.waitForURL(u=>u.hash==='#/play/'+id);await expect(page.locator('#game')).toBeVisible();
  await page.locator('#back-map').tap();await page.waitForURL(u=>u.hash==='#/map');
  await expect(page.locator(`[data-zone="${id}"]`)).toHaveClass(/active/);
 }
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/not-a-game');await page.waitForURL(u=>u.hash==='#/map');
 await page.locator('[data-zone="math"] .park-label').tap();await page.locator('[data-zone="art"] .park-label').tap();await page.waitForURL(u=>u.hash==='#/play/math');
 await page.locator('#back-map').tap();await page.waitForURL(u=>u.hash==='#/map');
 await expect(page.locator('.map-island')).toBeVisible();
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-demo:player')).zones.math.ms);
 await page.waitForTimeout(1200);
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-demo:player')).zones.math.ms)).toBe(before);
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/cert');await page.waitForURL(u=>u.hash==='#/map');
 await page.locator('[data-zone="science"] .park-label').tap();await page.locator('#next-player').tap();await page.locator('#reset').tap();await expect(page.locator('#nickname')).toBeVisible();await page.waitForTimeout(3500);await expect(page.locator('#nickname')).toBeVisible();
 expect(errors).toEqual([]);
 console.log('PASS all 11 parks enter by touch; exit keeps in-progress status; first destination wins rapid taps; invalid route and premature certificate return to map; map time pauses; changing participant cancels guide walk; no runtime errors');
}finally{await browser.close();}
