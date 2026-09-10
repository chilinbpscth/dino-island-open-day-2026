import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1194,height:834},serviceWorkers:'block'});
 await context.route('https://**',r=>r.abort());
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/hub/');
 await page.evaluate(async()=>{
  const {newPlayer,ZONES,completeZone}=await import('/shared/core.js');
  const p=newPlayer('地圖測試');
  for(const z of ZONES.slice(0,10)){p.zones[z.id]={ms:1000,complete:false,game:{}};completeZone(p,z.id);}
  localStorage.setItem('dino-island-20260913:player',JSON.stringify(p));
  localStorage.setItem('dino-island-20260913:settings',JSON.stringify({appScriptUrl:'',deviceToken:''}));
 });
 await page.goto('http://127.0.0.1:4173/hub/#/map');await page.reload();
 await expect(page.locator('.stone.done')).toHaveCount(10);
 await expect(page.locator('.stone.locked')).toHaveCount(1);
 await expect(page.locator('.map-progress')).toContainText('已取得探險榜排名資格');
 await expect(page.locator('.map-progress')).not.toContainText('已登上探險榜');
 await context.setOffline(true);
 await expect(page.locator('#sync-state')).toContainText('暫時離線');
 const labels=await page.locator('.stone.done').evaluateAll(nodes=>nodes.map(n=>({disabled:n.disabled,opacity:getComputedStyle(n).opacity,text:n.querySelector('.park-status').textContent,fg:getComputedStyle(n.querySelector('.park-status')).color,bg:getComputedStyle(n.querySelector('.park-status')).backgroundColor})));
 assert.ok(labels.every(x=>x.disabled&&x.opacity==='1'&&x.text.includes('完成')&&x.fg==='rgb(255, 255, 255)'&&x.bg==='rgb(20, 107, 77)'));
 console.log('PASS full-score map shows eligibility without claiming upload; completed tags remain opaque and legible while disabled');
}finally{await browser.close();}
