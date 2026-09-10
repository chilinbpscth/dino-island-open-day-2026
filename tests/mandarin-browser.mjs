import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
try{
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/mandarin');
 await page.waitForFunction(()=>[...document.querySelectorAll('.greeting-village img')].every(i=>i.complete&&i.naturalWidth));
 assert.equal(await page.locator('.greeting-village>.character').count(),2);assert.equal(await page.locator('#greeting-record svg').count(),1);assert.equal(await page.locator('.speech-bubble').count(),1);
 assert(await page.locator('#greeting-next').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),'Tablet next button remains within the viewport');
 await page.screenshot({path:'docs/screenshots/mandarin-village.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const bounds=await page.locator('.greeting-village').evaluate(el=>{const r=el.getBoundingClientRect();return [...el.querySelectorAll('.character')].every(img=>{const b=img.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom;});});assert(bounds);
 await page.screenshot({path:'docs/screenshots/mandarin-village-mobile.png',fullPage:true});
 let round=0;for(const phrase of ['你好','早上好','謝謝','不客氣','請','再見']){
  assert((await page.locator('.greeting-village>.companion').getAttribute('src')).endsWith(round%2===0?'xiaolian-welcome.png':'xiaozhi-welcome.png'));round++;
  assert((await page.locator('#game').innerText()).includes('「'+phrase+'」'));assert(await page.locator('#greeting-next').isDisabled());
  await page.locator('#greeting-family').click();await page.locator('#greeting-next').click();
 }
 await page.locator('#return-map').waitFor();assert.deepEqual(errors,[]);
 await writeFile('docs/mandarin-test-results.json',JSON.stringify({testedAt:new Date().toISOString(),environment:'Desktop Chromium and 390px simulated phone; parent-assisted reading, not speech evaluation',passed:['Village image loaded and exactly one guide plus baby','Sprites remain inside scene at phone width; no horizontal overflow','All six phrases require recording replay or explicit parent-assisted reading','Six parent-assisted phrases reach completion']},null,2));
 console.log('PASS Mandarin village desktop/mobile and all six parent-assisted greetings');
}finally{await browser.close();}
