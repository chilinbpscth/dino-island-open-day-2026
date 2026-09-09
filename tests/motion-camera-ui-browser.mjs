import {chromium} from '@playwright/test';import assert from 'node:assert/strict';
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1194,height:834},serviceWorkers:'block'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
// Controlled landmark delivery tests the real UI and PoseActions, not model accuracy.
await page.route('**/shared/pose-camera.js',route=>route.fulfill({contentType:'text/javascript',body:`export const poseCamera={start:async(video,receive,fail)=>{window.testCamera={receive,fail};return true;},stop:()=>{window.testCamera=null;}};`}));
await page.addInitScript(()=>{
 window.poseTime=0;
 window.sendPose=(kind='stand',frames=1)=>{
  for(let n=0;n<frames;n++){
   const p=Array.from({length:33},()=>({x:.5,y:.3,visibility:1,presence:1}));for(const [i,x,y]of [[0,.5,.1],[11,.43,.3],[12,.57,.3],[15,.35,.52],[16,.65,.52],[23,.45,.5],[24,.55,.5],[25,.45,.7],[26,.55,.7],[27,.45,.9],[28,.55,.9]])Object.assign(p[i],{x,y});
   if(kind==='air')p.forEach(q=>q.y-=.08);
   if(kind==='hands'){p[15].y=.12;p[16].y=.12;}
   if(kind==='left'||kind==='right')p.forEach(q=>q.x+=kind==='left'?.15:-.15);
   if(kind==='sit'){p[23].y=.73;p[24].y=.73;for(const i of [25,26]){p[i].x+=.1;p[i].y=.76;}}
   window.poseTime+=100;window.testCamera?.receive(kind==='none'?[]:kind==='multiple'?[p,p]:[p],window.poseTime);
  }
 };
});
const send=(kind,frames)=>page.evaluate(([kind,frames])=>window.sendPose(kind,frames),[kind,frames]);
try{
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/english');assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));await page.locator('#motion-camera-start').click();
 await send('multiple',12);assert.match(await page.locator('.feedback').innerText(),/一位/);assert.equal(await page.locator('#motion-next').count(),0);
 await send('none',5);assert.equal(await page.locator('#motion-next').count(),0);await send('stand',11);await send('stand',165);assert.match(await page.locator('.feedback').innerText(),/再睇動作提示/);await send('stand',85);assert.equal(await page.locator('#motion-family.motion-help-highlight').count(),1);
 for(const [i,kind]of ['jump','sit','stand','hands','left','right','freeze'].entries()){
  if(i)await send('stand',1);
  if(kind==='jump'){await send('air',2);assert.equal(await page.locator('#motion-next').count(),0);await send('stand',1);}else await send(kind,17);
  await page.locator('#motion-next').waitFor();assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));await page.locator('#motion-next').click();
 }
 assert.match(await page.locator('.complete').innerText(),/得到 1 分/);
 await page.goto('http://127.0.0.1:4173/hub/?demo=1#/play/pe');await page.locator('#motion-camera-start').click();await send('stand',11);await page.evaluate(()=>window.testCamera.fail(Error('Simulated device loss')));await page.locator('#motion-camera-start').waitFor();await page.locator('#motion-family').click();assert(await page.locator('#motion-hold').isDisabled());assert.equal(await page.evaluate(()=>window.testCamera),null);
 await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 console.log('PASS camera UI with controlled landmarks: reject multiple/no person, calibrate, all seven English commands, advance without stale success, zero English, camera failure to family, mobile width');
}finally{await browser.close();}
