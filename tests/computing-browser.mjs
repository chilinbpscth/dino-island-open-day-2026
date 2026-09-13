import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
const enter=()=>page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/computing');
const enqueue=async list=>{for(const command of list)await page.locator(`[data-command="${command}"]`).click();};
const position=()=>page.locator('#coding-robot').evaluate(el=>[el.style.left,el.style.top,el.style.getPropertyValue('--heading')]);
try{
 await enter();await page.waitForFunction(()=>document.querySelector('.coding-backdrop')?.naturalWidth>0);
 assert.equal(await page.locator('.coding-cell').count(),16);assert(await page.locator('#code-go').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),'Go stays within iPad landscape viewport');const before=await position();await enqueue(['forward','forward']);assert.deepEqual(await position(),before);assert.equal(await page.locator('[data-command]:disabled').count(),4);
 await page.screenshot({path:'docs/screenshots/computing-garden.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'docs/screenshots/computing-garden-mobile.png',fullPage:true});await page.setViewportSize({width:1194,height:834});
 // Leaving during execution must cancel the old run instead of completing in a later page.
 await page.locator('#code-go').click();await page.locator('#back-map').click();await page.locator('.stone').first().waitFor();await page.waitForTimeout(2400);assert.equal(await page.locator('#code-next').count(),0);
 await enter();assert.equal(await page.locator('#code-next:visible').count(),0);await page.locator('#code-undo').click();await page.locator('#code-undo').click();
 for(let attempt=0;attempt<3;attempt++){
  await enqueue(['left','left']);await page.locator('#code-go').click();await page.waitForFunction(()=>document.querySelector('#code-undo')?.disabled===false);await page.locator('#code-undo').click();await page.locator('#code-undo').click();
 }
 await page.locator('#code-help').click();await page.locator('#code-help').click();await page.locator('#code-go').click();await page.locator('#code-next').waitFor({state:'visible'});await page.locator('#code-next').click();
 for(const commands of [['forward','right','forward'],['left','jump']]){await enqueue(commands);await page.locator('#code-go').click();await page.locator('#code-next').waitFor({state:'visible'});await page.locator('#code-next').click();}
 await page.locator('#return-map').waitFor();assert.deepEqual(errors,[]);
 await writeFile('docs/computing-test-results.json',JSON.stringify({testedAt:new Date().toISOString(),environment:'Desktop Chromium with simulated 390px phone; demo mode, no backend requests',passed:['Garden loads behind readable 4x4 grid','Queued commands do not move robot before Go','Queue caps at current two/three-command limit','Leaving during execution cancels pending completion','Three wrong attempts offer incremental correct hints','All three actual UI sequences reach egg and finish','No horizontal overflow at 390px; no runtime errors']},null,2));console.log('PASS coding garden, deferred execution, cancellation, hints, three routes, phone layout');
}finally{await browser.close();}
