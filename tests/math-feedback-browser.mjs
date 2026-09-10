import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});
try{
 await page.addInitScript(()=>{const Native=window.AudioContext;window.effects=[];window.effectContexts=[];window.AudioContext=function(...args){const ctx=new Native(...args);window.effectContexts.push(ctx);const create=ctx.createOscillator.bind(ctx);ctx.createOscillator=()=>{const o=create(),start=o.start.bind(o);o.start=(...a)=>{window.effects.push(o.frequency.value);return start(...a);};return o;};return ctx;};});
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/math');
 for(const fruit of ['apple','banana','strawberry'])await page.locator(`[data-food="${fruit}"]`).first().click();
 for(const fruit of ['apple','banana','strawberry'])await expect(page.locator(`[data-food="${fruit}"]`)).toHaveCount(5);
 const feed=async(id,piece)=>{await page.locator(`[data-food="${id}"][data-piece="${piece}"]`).click();await page.locator('[data-dino]').click();};
 await feed('apple',3);await expect(page.locator('.fruit-munch')).toHaveCount(1);await expect(page.locator('[data-food="apple"][data-piece="3"]')).toBeHidden();await expect(page.locator('[data-food="apple"][data-piece="0"]')).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.effects.length)).toBe(2);
 await feed('apple',0);await expect(page.locator('[data-food="apple"][data-piece="0"]')).toBeVisible();await expect.poll(()=>page.evaluate(()=>window.effects.length)).toBe(3);
 await page.reload();await expect(page.locator('[data-food="apple"][data-piece="3"]')).toBeHidden();await expect(page.locator('[data-food="apple"][data-piece="0"]')).toBeVisible();
 await page.locator('#fruit-sound').click();await feed('banana',4);assert.equal(await page.evaluate(()=>window.effects.length),0);
 await page.locator('#fruit-sound').click();await feed('strawberry',1);await expect.poll(()=>page.evaluate(()=>window.effects.length)).toBe(3);
 await page.locator('#feeding-next').click();await expect(page.locator('.fruit-piece:visible')).toHaveCount(15);
 await page.screenshot({path:'docs/screenshots/math-individual-fruits.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#back-map').click();await expect.poll(()=>page.evaluate(()=>window.effectContexts.every(c=>c.state==='closed'))).toBe(true);
 console.log('PASS 15 individual fruit buttons; exact selected slot disappears and survives reload; excess stays; refill, sound, mute and cleanup');
}finally{await browser.close();}
