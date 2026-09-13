import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
try{
 await page.route('**/shared/network.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text())+`\nbridge.call=async()=>({players:window.testPlayers||[],exploring:8,others:0,serverTime:Date.now()});`});});
 await page.goto('http://127.0.0.1:4173/board/');
 await expect(page.locator('.board-row')).toHaveCount(10);await expect(page.locator('.placeholder')).toHaveCount(10);await expect(page.locator('#others')).toContainText('10 個示範席位');await expect(page.locator('#board-status')).toContainText('最近更新');
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-open-day-20260913:boardCache')).players.length),0);
 await page.evaluate(()=>{window.testPlayers=[{id:'real-one',name:'真實小朋友',zonesCompleted:10,zoneIds:['math'],totalMs:182000}];dispatchEvent(new Event('online'));});
 await expect(page.locator('.placeholder')).toHaveCount(9);await expect(page.locator('.board-row').first()).toContainText('真實小朋友');await expect(page.locator('.board-row').first()).toContainText('03:02');await expect(page.locator('.board-row').first()).toHaveClass(/flash/);
 await page.evaluate(()=>{window.testPlayers=Array.from({length:10},(_,i)=>({id:'real-'+i,name:'小朋友'+i,zonesCompleted:10,zoneIds:[],totalMs:100000+i*1000}));dispatchEvent(new Event('online'));});
 await expect(page.locator('.placeholder')).toHaveCount(0);await expect(page.locator('.board-row')).toHaveCount(10);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-open-day-20260913:boardCache')).players.some(p=>p.placeholder)),false);
 console.log('PASS: 10 labelled zero-score slots on empty official board; real player replaces slot immediately with true time; 10 real records remove every slot; placeholders never stored as scores.');
}finally{await browser.close();}
