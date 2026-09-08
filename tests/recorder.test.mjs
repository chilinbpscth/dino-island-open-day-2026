import test from 'node:test';
import assert from 'node:assert/strict';
import {LocalRecorder} from '../shared/recorder.js';
function fixture(){
 let stopped=0,instance;
 const stream={getTracks:()=>[{stop:()=>stopped++}]};
 class Recorder{
  static isTypeSupported(t){return t==='audio/mp4';}
  constructor(_stream,opts){instance=this;this.mimeType=opts.mimeType;this.state='inactive';}
  start(){this.state='recording';}
  stop(){this.state='inactive';this.ondataavailable?.({data:new Blob(['voice'],{type:this.mimeType})});this.onstop?.();}
 }
 return {stream,Recorder,stopped:()=>stopped,instance:()=>instance};
}
test('Recording returns an in-memory blob and releases microphone',async()=>{
 const f=fixture(),r=new LocalRecorder({mediaDevices:{getUserMedia:async()=>f.stream},Recorder:f.Recorder});
 const pending=r.record();await Promise.resolve();r.stop();const blob=await pending;
 assert.equal(await blob.text(),'voice');assert.equal(blob.type,'audio/mp4');assert.equal(f.stopped(),1);assert.equal(r.stream,null);
});
test('Leaving during permission request releases late stream and never starts capture',async()=>{
 const f=fixture();let grant;const r=new LocalRecorder({mediaDevices:{getUserMedia:()=>new Promise(resolve=>grant=resolve)},Recorder:f.Recorder});
 const pending=r.record();r.cancel();grant(f.stream);assert.equal(await pending,null);assert.equal(f.stopped(),1);assert.equal(f.instance(),undefined);
});
test('Cancel discards captured audio and finishes pending promise',async()=>{
 const f=fixture(),r=new LocalRecorder({mediaDevices:{getUserMedia:async()=>f.stream},Recorder:f.Recorder});
 const pending=r.record();await Promise.resolve();r.cancel();assert.equal(await pending,null);assert.equal(f.stopped(),1);
});
test('Automatic stop limits recording duration',async()=>{
 const f=fixture(),r=new LocalRecorder({mediaDevices:{getUserMedia:async()=>f.stream},Recorder:f.Recorder,maxMs:10});
 assert((await r.record()).size>0);assert.equal(f.stopped(),1);
});
