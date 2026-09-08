import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
async function hold(ms){const b=await page.locator('#motion-hold').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(ms);await page.mouse.up();}
try{
 await page.clock.install();await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('動作測試');await page.getByRole('button',{name:'出發去島上'}).click();
 for(const [id,rounds]of [['english',7],['pe',5]]){
  await page.goto('http://127.0.0.1:4173/hub/#/play/'+id);await page.locator('#motion-family').click();
  for(let i=0;i<rounds;i++){
   if(id==='english')assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));
   assert(await page.locator('#motion-hold').isDisabled());await page.clock.runFor(4900);assert(await page.locator('#motion-hold').isDisabled());await page.clock.runFor(300);assert(!(await page.locator('#motion-hold').isDisabled()));
   if(i===0){await hold(2000);assert.equal(await page.locator('#motion-next').count(),0);}
   await hold(3100);await page.locator('#motion-next').waitFor();assert.equal((await player()).zones[id].complete,false);
   if(i===rounds-1)await page.screenshot({path:`docs/screenshots/${id}-v2-family.png`,fullPage:true,animations:'disabled'});
   await page.locator('#motion-next').click();
  }
  assert.equal((await player()).zones[id].complete,true);
 }
 assert.deepEqual(errors,[]);console.log('PASS motion family: English 7 / PE 5 rounds, five-second gate, interrupted hold resets, three-second hold, no English visible text, completion after all rounds');
}finally{await browser.close();}
