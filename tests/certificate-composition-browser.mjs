import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
try{
 const context=await browser.newContext({permissions:['camera'],serviceWorkers:'block',viewport:{width:1194,height:834}});
 await context.route('https://**',r=>r.abort());
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/hub/');
 await page.evaluate(async()=>{
  const {newPlayer}=await import('/shared/core.js');const p=newPlayer('合成測試');
  for(const id of ['math','general','science','humanities','art','music'])p.zones[id]={complete:true,ms:1000};
  localStorage.setItem('dino-island-20260913:player',JSON.stringify(p));
  localStorage.setItem('dino-island-20260913:settings',JSON.stringify({appScriptUrl:'',deviceToken:''}));
 });
 await page.reload();await page.goto('http://127.0.0.1:4173/hub/#/cert');
 await expect(page.locator('#save-local')).toBeEnabled();
 // Fail the next composition's frame load after the ordinary certificate is ready.
 await page.evaluate(()=>{
  const NativeImage=window.Image;window.originalImage=NativeImage;
  window.Image=class extends NativeImage{
   set src(value){if(String(value).includes('cert-frame.png'))queueMicrotask(()=>this.onerror?.(new Event('error')));else super.src=value;}
   get src(){return super.src;}
  };
 });
 await page.locator('#camera-start').click();await page.locator('#shutter').click();
 await expect(page.locator('#cert-status')).toContainText('證書圖片未能載入',{timeout:15000});
 await expect(page.locator('#save-local')).toBeDisabled();
 await expect(page.locator('#upload')).toBeDisabled();
 assert.equal(await page.evaluate(async()=>{
  const {read,photoStore}=await import('/shared/storage.js');return !!await photoStore('get',read('player').id);
 }),false,'failed composition must not queue the previous ordinary certificate as a photo');
 await page.evaluate(()=>{window.Image=window.originalImage;});
 await page.locator('#retake').click();await page.locator('#shutter').click();
 await expect(page.locator('#cert-status')).toContainText('先睇清楚相片',{timeout:15000});
 await expect(page.locator('#save-local')).toBeEnabled();await expect(page.locator('#upload')).toBeEnabled();
 await page.waitForFunction(async()=>{const {read,photoStore}=await import('/shared/storage.js');return !!await photoStore('get',read('player').id);});
 const details=await page.evaluate(async()=>{
  const {read,photoStore}=await import('/shared/storage.js');const saved=await photoStore('get',read('player').id);
  const bitmap=await createImageBitmap(saved.blob),result={width:bitmap.width,height:bitmap.height,type:saved.blob.type};bitmap.close();return result;
 });
 assert.deepEqual(details,{width:1600,height:2000,type:'image/jpeg'});
 await expect(page.locator('video')).not.toBeVisible();
 console.log('PASS failed composition cannot queue the previous certificate; retake produces a fresh 1600x2000 JPEG and closes camera');
}finally{await browser.close();}
