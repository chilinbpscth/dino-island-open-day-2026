import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{
 window.testHidden=false;Object.defineProperty(document,'hidden',{get:()=>window.testHidden});
 navigator.mediaDevices.getUserMedia=()=>new Promise((_resolve,reject)=>{window.rejectTestPermission=()=>reject(new DOMException('Test denied','NotAllowedError'));});
});
const time=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')).zones.mandarin.ms);
try{
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('計時測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/mandarin');await page.locator('#greeting-record').click();
 const before=await time();await page.waitForTimeout(1100);assert.equal(await time(),before);
 await page.evaluate(()=>{window.dispatchEvent(new Event('pageshow'));});
 await page.waitForTimeout(1100);assert.equal(await time(),before);
 await page.evaluate(()=>window.rejectTestPermission());await page.locator('#greeting-record:not([disabled])').waitFor();await page.waitForTimeout(1200);assert((await time())>before+500);
 await page.locator('#greeting-record').click();await page.evaluate(()=>{window.testHidden=true;document.dispatchEvent(new Event('visibilitychange'));});await page.locator('#greeting-record:not([disabled])').waitFor();
 const hiddenTime=await time();await page.waitForTimeout(1100);assert.equal(await time(),hiddenTime);
 await page.evaluate(()=>{window.testHidden=false;document.dispatchEvent(new Event('visibilitychange'));});await page.locator('#greeting-family').click();assert(!(await page.locator('#greeting-next').isDisabled()));
 await page.evaluate(()=>window.rejectTestPermission());assert(!(await page.locator('#greeting-next').isDisabled()));
 await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.locator('.stone').first().waitFor();const onMap=await time();await page.waitForTimeout(1100);assert.equal(await time(),onMap);assert.deepEqual(errors,[]);
 console.log('PASS permission clock: unresolved permission/pageshow excluded, denial resumes, hide cancels pending prompt, family mode works before late denial, map stays paused');
}finally{await browser.close();}
