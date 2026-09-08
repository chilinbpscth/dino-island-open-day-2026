import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {CHARACTERS,pathSamples} from '../shared/core.js';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const player=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:player')));
async function trace(path,cancel=false){const box=await page.locator('.trace-board').boundingBox(),points=pathSamples(path,8);await page.mouse.move(box.x+points[0][0]*box.width/300,box.y+points[0][1]*box.height/300);await page.mouse.down();for(const [x,y]of points.slice(1))await page.mouse.move(box.x+x*box.width/300,box.y+y*box.height/300);if(cancel)await page.locator('.trace-board').dispatchEvent('pointercancel',{pointerId:1});await page.mouse.up();}
try{
 assert.equal(CHARACTERS.map(c=>c.char).join(''),'山水火木日月');assert.deepEqual(CHARACTERS.map(c=>c.paths.length),[3,4,4,4,4,4]);
 await page.goto('http://127.0.0.1:4173/hub/');await page.locator('#nickname').fill('六字測試');await page.getByRole('button',{name:'出發去島上'}).click();await page.goto('http://127.0.0.1:4173/hub/#/play/chinese');
 for(let i=0;i<3;i++)await trace([...CHARACTERS[0].paths[0]].reverse());assert.equal((await player()).zones.chinese.game.stroke,0);await page.locator('#stroke-help').click();assert.equal(await page.locator('.trace-assisted').count(),1);
 await trace(CHARACTERS[0].paths[0],true);assert.equal((await player()).zones.chinese.game.stroke,0);
 for(let round=0;round<6;round++){
  assert.equal(await page.locator('.round-dot').count(),6);
  for(let stroke=0;stroke<CHARACTERS[round].paths.length;stroke++){
   await trace(CHARACTERS[round].paths[stroke]);
   if(round===1&&stroke===0){await page.reload();await page.locator('.trace-board').waitFor();assert.equal((await player()).zones.chinese.game.stroke,1);}
  }
  assert.equal((await player()).zones.chinese.complete,false);
  if(round===2)assert.match(await page.locator('.scene-complete').innerText(),/遠遠觀察/);
  if(round===5)await page.screenshot({path:'docs/screenshots/chinese-v2.png',fullPage:true,animations:'disabled'});
  await page.locator('#next-round').click();
 }
 assert.equal((await player()).zones.chinese.complete,true);assert.deepEqual(errors,[]);console.log('PASS Chinese: six words/23 strokes, reverse rejected, guided demo, pointer cancellation, mid-stroke progress reload, safe volcano scene, finish only after six words');
}finally{await browser.close();}
