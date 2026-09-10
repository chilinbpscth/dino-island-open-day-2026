import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';

const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1194,height:834},hasTouch:true,serviceWorkers:'block'});
 await context.route('https://**',r=>r.abort());
 const page=await context.newPage();
 await page.goto('http://127.0.0.1:4173/hub/');
 await page.locator('#nickname').fill('觸控測試');await page.getByRole('button',{name:'出發去島上'}).click();
 await page.goto('http://127.0.0.1:4173/hub/#/play/math');await page.locator('[data-food="0"]').waitFor();
 const touch=await context.newCDPSession(page);
 async function drag(food,dino,cancel=false){
  const from=page.locator(`[data-food="${food}"]`),to=page.locator(`[data-dino="${dino}"]`);
  await from.scrollIntoViewIfNeeded();
  const a=await from.boundingBox(),b=await to.boundingBox();
  const start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:b.x+b.width/2,y:b.y+b.height/2};
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});
  for(let i=1;i<=8;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8,id:1}]});
  await touch.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
 }
 await drag(0,0,true);
 await expect(page.locator('.feeding-count')).toHaveText('0／1 隻食飽啦');
 await expect(page.locator('.drag-ghost')).toHaveCount(0);
 await drag(0,0);await expect(page.locator('.feeding-count')).toHaveText('1／1 隻食飽啦');
 await page.locator('#feeding-next').click();
 await drag(0,0);
 await drag(1,0);await drag(1,0);await drag(1,0);
 await expect(page.locator('.feeding-count')).toHaveText('1／3 隻食飽啦');
 await expect(page.locator('[data-food="1"]')).toBeEnabled();
 await page.locator('#feeding-help').click();await expect(page.locator('[data-dino="1"]')).toHaveClass(/feeding-hint/);
 await drag(1,1);await drag(2,2);await page.locator('#feeding-next').click();
 for(let i=0;i<5;i++)await drag(i,i);
 await expect(page.locator('.feeding-count')).toHaveText('5／5 隻食飽啦');
 await page.locator('#feeding-next').click();await page.locator('#return-map').waitFor();
 const player=await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
 assert.equal(player.zones.math.complete,true);
 console.log('PASS emulated touch drag feeds 1/3/5 individually; cancellation does not feed; repeat target preserves food; guided retry completes');
}finally{await browser.close();}
