import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),page=await browser.newPage({serviceWorkers:'block'});
await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4173'?route.continue():route.abort());
try{
 await page.goto('http://127.0.0.1:4173/tests/live-load.html');
 await page.evaluate(async()=>{
  const {GoogleBridge}=await import('/shared/network.js');window.calls=[];window.records={};window.images={};window.active=0;window.maxActive=0;
  localStorage.setItem('dino-island-20260913:settings',JSON.stringify({appScriptUrl:'https://script.google.com/macros/s/TEST/exec',deviceToken:'test-private-device-credential'}));
  GoogleBridge.prototype.call=async function(method,payload){
   window.calls.push({method,payload});window.active++;window.maxActive=Math.max(window.maxActive,window.active);await Promise.resolve();window.active--;
   if(method==='savePlayer'){if(window.failPreparation&&payload.player.version===1)throw Error('setup unavailable');const p=payload.player;window.records[p.id]={...p,zonesCompleted:Object.keys(p.zones).length,totalMs:Object.values(p.zones).reduce((a,b)=>a+b,0)};return {acceptedVersion:p.version};}
   if(method==='getBoard')return {players:Object.values(window.records).filter(p=>p.zonesCompleted===10)};
   if(method==='uploadCertificate'){if(window.failOne&&payload.requestId.endsWith('-5'))throw Error('upload unavailable');const token='a'.repeat(42)+payload.requestId.slice(-2).replace('-','a');window.images[token]=payload.image;return {url:'https://script.google.com/macros/s/TEST/exec?view=certificate&token='+token,expiresAt:Date.now()+86400000};}
   if(method==='getCertificate')return {image:window.images[payload.token],expiresAt:window.expiry};
  };
  const original=GoogleBridge.prototype.call;GoogleBridge.prototype.call=async function(method,payload){const result=await original.call(this,method,payload);if(method==='uploadCertificate'){window.expiries??={};window.expiries[new URL(result.url).searchParams.get('token')]=result.expiresAt;}if(method==='getCertificate')result.expiresAt=window.expiries[payload.token];return result;};
 });
 assert.equal(await page.evaluate(()=>window.calls.length),0);
 await page.locator('#batch').fill('invalid');await page.locator('#run').click();await expect(page.locator('#status')).toContainText('批次 ID');assert.equal(await page.evaluate(()=>window.calls.length),0);
 await page.locator('#batch').fill('');await page.locator('#run').click();await expect(page.locator('#status')).toHaveText('complete',{timeout:15000});
 let report=JSON.parse(await page.locator('#result').innerText());assert.equal(report.summary.verified,10);assert.equal(report.summary.passed,true);assert.equal(new Set(report.clients.map(c=>c.id)).size,10);assert(await page.evaluate(()=>window.maxActive>=10));
 const batch=report.batchId;assert.equal(await page.locator('#batch').inputValue(),batch);assert(!JSON.stringify(report).includes('test-private-device-credential'));assert(!JSON.stringify(report).includes('data:image'));assert(!JSON.stringify(report).includes('token='));
 assert(await page.evaluate(()=>window.calls.filter(c=>['getBoard','getCertificate'].includes(c.method)).every(c=>!('deviceToken' in c.payload))));
 await page.evaluate(()=>{window.failOne=true;});await page.locator('#run').click();await expect(page.locator('#status')).toHaveText('complete',{timeout:15000});report=JSON.parse(await page.locator('#result').innerText());assert.equal(report.batchId,batch);assert.equal(report.summary.verified,9);assert.equal(report.summary.passed,false);assert.equal(report.clients[4].error,'upload unavailable');
 await page.evaluate(()=>{window.failPreparation=true;window.calls=[];});await page.locator('#run').click();await expect(page.locator('#status')).toHaveText('preparation-failed');assert(await page.evaluate(()=>window.calls.every(c=>c.method==='savePlayer')));assert(await page.locator('#run').isEnabled());
 console.log('PASS load harness: explicit start, ten concurrent clients, credential-free public reads, private report, reused batch IDs, upload failure and preparation failure');
}finally{await browser.close();}
