import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
try{
 await page.goto('http://127.0.0.1:4173/setup/');
 await page.evaluate(()=>{
  const prefix='dino-island-20260913:';
  localStorage.setItem(prefix+'settings',JSON.stringify({guideNumber:3,deviceToken:'a-local-test-device-token',appScriptUrl:'https://script.google.com/macros/s/TEST/exec'}));
  localStorage.setItem(prefix+'player',JSON.stringify({id:'ranking-player-03',name:'P',version:11,zones:Object.fromEntries(['chinese','mandarin','math','general','science','humanities','art','music','pe','computing'].map(id=>[id,{complete:true,ms:18200}]))}));
  localStorage.setItem(prefix+'outbox',JSON.stringify({unrelated:{id:'prior-test'}}));
 });
 await page.route('**/shared/network.js',async route=>{
  const response=await route.fetch();let source=await response.text();
  source+=`\nGoogleBridge.prototype.call=async function(method,payload){window.calls??=[];window.calls.push({method,payload});if(method==='savePlayer'){window.saved=payload.player;return {acceptedVersion:payload.player.version,resetRequired:window.rejectScore===true};}return {players:window.hideBoard?[]:[{id:window.saved.id,name:window.saved.name,zonesCompleted:Object.keys(window.saved.zones).length}],others:0};};`;
  await route.fulfill({response,body:source});
 });
 await page.goto('http://127.0.0.1:4173/setup/ranking.html');
 await expect(page.locator('h2')).toHaveText('P · 10／10 分');await expect(page.locator('section')).toContainText('03:02');
 const submit=page.getByRole('button',{name:'補傳呢位成績'});await expect(submit).toBeDisabled();assert.equal(await page.evaluate(()=>window.calls?.length||0),0);
 await page.getByRole('checkbox').check();await page.evaluate(()=>window.rejectScore=true);await submit.click();await expect(page.locator('#status')).toContainText('後台未確認');
 assert.equal(await page.evaluate(()=>window.calls.length),1);
 await page.evaluate(()=>{window.rejectScore=false;window.hideBoard=true;});await submit.click();await expect(page.locator('#status')).toContainText('排行榜未確認');
 await page.evaluate(()=>window.hideBoard=false);await submit.click();await expect(page.locator('#status')).toContainText('已確認上榜！P · 10 分 · 目前第 1 位');
 const state=await page.evaluate(()=>({calls:window.calls,saved:window.saved,original:JSON.parse(localStorage.getItem('dino-island-20260913:player')),outbox:JSON.parse(localStorage.getItem('dino-island-20260913:outbox'))}));
 assert.equal(state.saved.epoch,'open-day-20260913');assert.equal(state.saved.version,12);assert.equal(state.saved.zones.math,18200);assert.equal(state.original.version,11);assert.equal(state.original.epoch,undefined);assert.deepEqual(state.outbox,{unrelated:{id:'prior-test'}});assert.ok(state.calls.every(c=>['savePlayer','getBoard'].includes(c.method)));
 console.log('PASS ranking rescue: photo-free 10-score recovery, exact 03:02 time, teacher confirmation, rejected saves retained, board absence never reported successful, actual board ID verified, original data/settings preserved.');
}finally{await browser.close();}
