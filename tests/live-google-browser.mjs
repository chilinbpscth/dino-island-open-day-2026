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
await browser.close();
console.log('PASS local-only live Google page wiring; no real Google requests');
