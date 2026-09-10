import {chromium,expect} from '@playwright/test';
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1194,height:834},hasTouch:true,serviceWorkers:'block'}),page=await context.newPage();
 await context.route('https://**',r=>r.abort());await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('觸控測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/math');
 for(const fruit of ['apple','banana','strawberry'])await page.locator(`[data-food="${fruit}"]:not(:disabled)`).first().tap();
 const touch=await context.newCDPSession(page);
 async function drag(fruit,cancel=false){const from=page.locator(`[data-food="${fruit}"]:not(:disabled)`).first();await from.scrollIntoViewIfNeeded();const a=await from.boundingBox(),b=await page.locator('[data-dino]').boundingBox(),start={x:a.x+a.width/2,y:a.y+a.height/2},end={x:b.x+b.width/2,y:b.y+b.height/2};await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...start,id:1}]});for(let i=1;i<=8;i++)await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8,id:1}]});await touch.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});}
 await drag('banana',true);await expect(page.locator('.feeding-count')).toHaveText('已餵 0 件水果');await expect(page.locator('.drag-ghost')).toHaveCount(0);
 await drag('banana');await drag('banana');await expect(page.locator('[data-order="banana"] .fruit-tally')).toHaveText('1／1');
 await drag('apple');await drag('strawberry');await expect(page.locator('#feeding-next')).toBeVisible();await page.locator('#feeding-next').tap();
 for(const [fruit,n] of [['apple',2],['banana',1],['strawberry',3]])for(let i=0;i<n;i++)await drag(fruit);
 await expect(page.locator('.feeding-count')).toHaveText('三種水果都夠數啦！');
 console.log('PASS real emulated touch events: each fruit increments separately, cancel adds nothing and excess fruit does not count');
}finally{await browser.close();}
