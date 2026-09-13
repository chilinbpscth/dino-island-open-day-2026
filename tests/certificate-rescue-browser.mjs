import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
try{
 await page.goto('http://127.0.0.1:4173/setup/');
 await page.evaluate(async()=>{
  const prefix='dino-island-20260913:',zones=Object.fromEntries(['chinese','english','mandarin','math','general','science'].map(id=>[id,{complete:true,ms:1234}]));
  localStorage.setItem(prefix+'settings',JSON.stringify({guideNumber:1,deviceToken:'only-a-local-test-device-token',appScriptUrl:'https://script.google.com/macros/s/TEST/exec'}));
  localStorage.setItem(prefix+'player',JSON.stringify({id:'rescue-player-01',name:'修復測試',version:7,zones}));
  localStorage.setItem(prefix+'outbox',JSON.stringify({unrelated:{id:'old-test'}}));
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open(prefix+'photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  const canvas=document.createElement('canvas');canvas.width=20;canvas.height=20;const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg'));
  await new Promise(r=>{const tx=db.transaction('pending','readwrite');tx.objectStore('pending').put({playerId:'rescue-player-01',requestId:'rescue-cert-001',version:7,blob},'rescue-player-01');tx.oncomplete=r;});db.close();
 });
 // Instrument only the locally served app. No live Google calls or data writes.
 await page.route('**/shared/network.js',async route=>{
  const response=await route.fetch();let source=await response.text();
  source+=`\nGoogleBridge.prototype.call=async function(method,payload){window.calls??=[];window.calls.push({method,payload});if(method==='savePlayer')return window.rejectScore?{acceptedVersion:payload.player.version,resetRequired:true}:{acceptedVersion:payload.player.version};return {url:'https://script.google.com/macros/s/TEST/exec?view=certificate&token='+ 'a'.repeat(43),expiresAt:Date.now()+86400000};};`;
  await route.fulfill({response,body:source});
 });
 await page.goto('http://127.0.0.1:4173/setup/rescue.html');
 await expect(page.locator('h2')).toHaveText('修復測試 · 6／10 分');
 await expect(page.getByRole('button',{name:'補傳成績並產生下載碼'})).toBeDisabled();
 assert.equal(await page.evaluate(()=>window.calls?.length||0),0);
 await page.evaluate(()=>window.rejectScore=true);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'補傳成績並產生下載碼'}).click();
 await expect(page.locator('#status')).toContainText('後台未確認');
 assert.equal(await page.evaluate(()=>window.calls.length),1);
 await page.evaluate(()=>window.rejectScore=false);
 await page.getByRole('button',{name:'補傳成績並產生下載碼'}).click();
 await expect(page.locator('#status')).toContainText('已補領成功');await expect(page.locator('#qr svg')).toBeVisible();
 const state=await page.evaluate(()=>({calls:window.calls,player:JSON.parse(localStorage.getItem('dino-island-20260913:player')),outbox:JSON.parse(localStorage.getItem('dino-island-20260913:outbox')),settings:JSON.parse(localStorage.getItem('dino-island-20260913:settings'))}));
 assert.equal(state.calls[1].payload.player.epoch,'open-day-20260913');assert.equal(state.calls[1].payload.player.zones.math,1234);
 assert.equal(state.calls[2].method,'uploadCertificate');assert.equal(state.calls[2].payload.requestId,'rescue-cert-001');assert.equal(state.calls[2].payload.recover,true);
 assert.equal(state.player.epoch,undefined);assert.equal(state.settings.guideNumber,1);assert.deepEqual(state.outbox,{unrelated:{id:'old-test'}});
 // A reset rejection cannot drain the official outbox or report success.
 assert.equal(await page.evaluate(async()=>{const n=await import('/shared/network.js');window.rejectScore=true;n.queuePlayer({id:'old-snapshot',version:1});return n.flushPlayers();}),false);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-open-day-20260913:outbox'))['old-snapshot'].version),1);
 await page.evaluate(async()=>{
  window.rejectScore=false;window.calls=[];localStorage.removeItem('dino-island-open-day-20260913:outbox');
  const p=JSON.parse(localStorage.getItem('dino-island-20260913:player'));p.epoch='open-day-20260913';
  const {photoStore}=await import('/shared/storage.js'),{mountCertificate}=await import('/hub/certificate.js');
  const canvas=document.createElement('canvas');canvas.width=20;canvas.height=20;const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg'));
  await photoStore('put',p.id,{requestId:'cert-empty-outbox',playerId:p.id,version:p.version,blob});
  document.body.innerHTML='<main></main>';mountCertificate(document.querySelector('main'),p,()=>{});
 });
 await expect(page.locator('#cert-status')).toContainText('待傳證書');await page.locator('#upload').click();
 await expect(page.locator('#cert-status')).toContainText('證書已上傳');
 assert.deepEqual(await page.evaluate(()=>window.calls.map(c=>c.method)),['savePlayer','uploadCertificate']);
 console.log('PASS: teacher confirmation required; only selected real score submitted; reset refusal prevents upload; receipt retry stable; original photo/player/settings/unrelated outbox preserved; false sync acknowledgment rejected.');
}finally{await browser.close();}
