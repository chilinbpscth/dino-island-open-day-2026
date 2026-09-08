import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4190'},stdio:['ignore','pipe','inherit']});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('server exit '+code)));});
const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const page=await browser.newPage({permissions:['camera'],serviceWorkers:'block'});const external=[];
await page.route('**/*',route=>{if(!route.request().url().startsWith('http://127.0.0.1:4190/')){external.push(route.request().url());return route.abort();}return route.continue();});
try{
 await page.goto('http://127.0.0.1:4190/school/hub/');
 const outcome=await page.evaluate(async()=>{
  const {loadPoseModel,poseCamera}=await import('/school/shared/pose-camera.js');
  const first=await loadPoseModel(),second=await loadPoseModel();
  const video=document.createElement('video');document.body.append(video);
  let count=0,error=null;await poseCamera.start(video,()=>count++,e=>error=String(e));
  const tracks=video.srcObject.getTracks();
  const until=performance.now()+15000;while(count<2&&!error&&performance.now()<until)await new Promise(r=>setTimeout(r,100));
  poseCamera.stop();const after=count;await new Promise(r=>setTimeout(r,400));
  return {shared:first===second,count,after,error,ended:tracks.every(t=>t.readyState==='ended'),detached:video.srcObject===null};
 });
 assert(outcome.shared);assert(outcome.count>=2);assert.equal(outcome.count,outcome.after);assert.equal(outcome.error,null);assert(outcome.ended);assert(outcome.detached);assert.deepEqual(external,[]);
 const cancellation=await page.evaluate(async()=>{
  const {PoseCamera}=await import('/school/shared/pose-camera.js');let resolveModel,calls=0;
  const original=navigator.mediaDevices.getUserMedia;navigator.mediaDevices.getUserMedia=()=>{calls++;return original.call(navigator.mediaDevices,{video:true});};
  const camera=new PoseCamera({loadModel:()=>new Promise(resolve=>resolveModel=resolve)});
  const pending=camera.start(document.createElement('video'),()=>{});camera.stop();resolveModel({});const started=await pending;
  navigator.mediaDevices.getUserMedia=original;return {started,calls};
 });
 assert.deepEqual(cancellation,{started:false,calls:0});
 console.log('PASS real local Pose Landmarker: shared instance, inference on fake camera, no external requests, stop cancels inference and ends tracks',outcome);
}finally{await browser.close();server.kill();}
