import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
async function hold(ms){const b=await page.locator('#motion-hold').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.clock.runFor(ms);await page.mouse.up();}
try{
 await page.clock.install();await page.clock.pauseAt(new Date());await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('動作測試');await page.getByRole('button',{name:'出發去島上'}).click();
 for(const [id,rounds]of [['english',7],['pe',5]]){
  await page.goto('http://127.0.0.1:4173/hub/#/play/'+id);await page.locator('#motion-family').click();
  for(let i=0;i<rounds;i++){
   if(id==='english'){
    assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));
    if([1,3,4,5].includes(i)){const sprite=page.locator('.motion-guide');assert((await sprite.getAttribute('src')).endsWith({1:'dino-squat.png',3:'dino-hands-up.png',4:'dino-left.png',5:'dino-right.png'}[i]));await sprite.evaluate(image=>image.decode());assert.equal(await sprite.evaluate(image=>image.naturalWidth),1024);await page.screenshot({path:`docs/screenshots/english-action-${i}.png`,fullPage:true,animations:'disabled'});}
   }
   if(id==='pe'){
    await page.waitForFunction(()=>[...document.querySelectorAll('.pe-scene img')].every(i=>i.complete&&i.naturalWidth));
    assert.equal(await page.locator('.pe-egg').count(),1);
    assert.equal(await page.locator('.pe-obstacle').count(),i<3?1:0);
    assert((await page.locator('.pe-backdrop').getAttribute('src')).endsWith(i===4?'forest-visitor.png':'forest-arena.png'));
    await page.screenshot({path:`docs/screenshots/pe-scene-${i}.png`,fullPage:true,animations:'disabled'});
    if(i===0){
     assert.equal(await page.locator('.pe-rock').evaluate(el=>getComputedStyle(el).animationName),'pe-rock-pass');
     await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.pe-rock').evaluate(el=>getComputedStyle(el).animationName),'none');await page.emulateMedia({reducedMotion:'no-preference'});
     await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:'docs/screenshots/pe-scene-mobile.png',fullPage:true,animations:'disabled'});await page.setViewportSize({width:1194,height:834});
    }
   }

   assert(await page.locator('#motion-hold').isDisabled());await page.clock.runFor(4900);assert(await page.locator('#motion-hold').isDisabled());await page.clock.runFor(300);assert(!(await page.locator('#motion-hold').isDisabled()));
   if(i===0){await hold(2000);assert.equal(await page.locator('#motion-next').count(),0);}
   await hold(3100);await page.locator('#motion-next').waitFor();if(id==='english'){const image=page.locator('.motion-guide');assert((await image.getAttribute('src')).endsWith('dino-celebrate.png'));await image.evaluate(i=>i.decode());assert.equal(await image.evaluate(i=>getComputedStyle(i).animationName),'none');assert.equal(await page.locator('.motion-cue').count(),0);}if(id==='pe'){assert((await page.locator('.motion-guide').getAttribute('src')).endsWith('games/pe/dino-coach.png'));await page.locator('.motion-guide').evaluate(i=>i.decode());assert.equal(await page.locator('.pe-cheer').count(),1);await page.locator('.pe-cheer').evaluate(i=>i.decode());assert.equal(await page.locator('.motion-cue').count(),0);assert.equal(await page.locator('.motion-guide').evaluate(i=>getComputedStyle(i).animationName),'none');assert.equal(await page.locator('.pe-obstacle').count(),0);assert(!/慢慢蹲低避|移一步|舉高雙手接住|企定定守住/.test(await page.locator('.game-instruction').last().innerText()));assert((await page.locator('.pe-backdrop').getAttribute('src')).endsWith('forest-arena.png'));}assert.equal((await player()).zones[id].complete,false);
   if(i===rounds-1)await page.screenshot({path:`docs/screenshots/${id}-v2-family.png`,fullPage:true,animations:'disabled'});
   await page.locator('#motion-next').click();
  }
  assert.equal((await player()).zones[id].complete,true);
 }
 assert.deepEqual(errors,[]);console.log('PASS motion family: English 7 / PE 5 rounds, five-second gate, interrupted hold resets, three-second hold, no English visible text, completion after all rounds');
}finally{await browser.close();}
