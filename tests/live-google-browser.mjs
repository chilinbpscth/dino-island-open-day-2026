import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({serviceWorkers:'block'});
await context.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4173'?route.continue():route.abort());
const page=await context.newPage();
await page.goto('http://127.0.0.1:4173/tests/live-google.html');
await page.evaluate(async()=>{
  const network=await import('/shared/network.js');
  window.__rpcCalls=[];
  network.GoogleBridge.prototype.call=async function(method,payload){
    window.__rpcCalls.push({method,payload});
    if(window.__rpcFail)throw Error('mock RPC failure');
    if(method==='getBoard')return {players:[],others:0,exploring:0,serverTime:Date.now()};
    throw Error('unexpected method in UI wiring test');
  };
});
await page.locator('#url').fill('https://script.google.com/macros/s/TEST_DEPLOYMENT/exec');
await page.locator('#token').fill('secret-device-token-123456789');
assert.deepEqual(await page.evaluate(()=>window.__rpcCalls),[],'no RPC before clicking');
await page.locator('#board').click();
assert.deepEqual(await page.evaluate(()=>window.__rpcCalls.map(x=>x.method)),['getBoard'],'read board only calls getBoard');
assert.deepEqual(await page.evaluate(()=>window.__rpcCalls[0].payload),{},'public board request does not include token');
assert.equal(await page.evaluate(()=>localStorage.length),0,'device token is not stored');
assert.equal(await page.evaluate(()=>sessionStorage.length),0,'device token is not stored in sessionStorage');
await page.evaluate(()=>{window.__rpcFail=true;});
await page.locator('#run').click();
await expect(page.locator('#status')).toContainText('mock RPC failure');
assert.equal(await page.locator('#run').isEnabled(),true,'run button restored after error');
assert.equal(await page.locator('#board').isEnabled(),true,'board button restored after error');
await page.locator('#saved').click();
await expect(page.locator('#status')).toContainText('本機未設定裝置憑證');
assert.equal(await page.locator('#saved').isEnabled(),true,'saved settings button restored after missing credential');
await page.evaluate(()=>localStorage.setItem('dino-island-20260913:settings',JSON.stringify({appScriptUrl:'https://script.google.com/macros/s/SAVED_DEVICE/exec',deviceToken:'saved-device-token-for-ui-test'})));
await page.locator('#saved').click();
await expect(page.locator('#status')).toContainText('mock RPC failure');
assert.equal(await page.evaluate(()=>window.__rpcCalls.at(-1).payload.deviceToken),'saved-device-token-for-ui-test');
assert.equal(await page.evaluate(()=>localStorage.length),1,'existing settings are reused without creating new stored data');
assert.equal(await page.locator('#token').inputValue(),'secret-device-token-123456789','saved credential is not copied into visible form');
await page.evaluate(async()=>{
 const {GoogleBridge}=await import('/shared/network.js');
 window.__certRequests=[];window.__failDownload=true;
 GoogleBridge.prototype.call=async function(method,payload){
  window.__certRequests.push({method,payload});
  if(method==='uploadCertificate'){
   window.__uploaded=payload.image;
   return {url:'https://script.google.com/macros/s/SAVED_DEVICE/exec?view=certificate&token='+'a'.repeat(48),expiresAt:2000000000000};
  }
  if(method==='getCertificate'){
   if(window.__failDownload)throw Error('response lost');
   return {image:window.__wrongImage?'data:image/jpeg;base64,bad':window.__uploaded,expiresAt:2000000000000};
  }
  throw Error('unexpected method');
 };
});
await page.locator('#player').fill('live-11111111-1111-4111-8111-111111111111');
await page.locator('#cert').click();
await expect(page.locator('#status')).toContainText('response lost');
const firstId=await page.evaluate(()=>window.__certRequests[0].payload.requestId);
await page.evaluate(()=>{window.__failDownload=false;window.__wrongImage=true;});
await page.locator('#cert').click();
await expect(page.locator('#status')).toContainText('下載圖片與上傳內容不一致');
await page.evaluate(()=>{window.__wrongImage=false;});
await page.locator('#cert').click();
await expect(page.locator('#status')).toContainText('圖片傳輸核對通過');
const report=JSON.parse(await page.locator('#result').textContent());
assert.equal(report.width,1600);assert.equal(report.height,2000);
assert.ok(report.unverified.includes('家長手機免登入下載頁'));
const calls=await page.evaluate(()=>window.__certRequests);
assert.ok(calls.filter(c=>c.method==='uploadCertificate').every(c=>c.payload.requestId===firstId),'response-loss retries reuse request ID');
assert.ok(calls.filter(c=>c.method==='getCertificate').every(c=>!('deviceToken' in c.payload)),'downloads omit device credentials');
await browser.close();
console.log('PASS local-only live Google page wiring; no real Google requests');
