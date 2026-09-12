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
 const pending=r.record();await new Promise(resolve=>setImmediate(resolve));r.stop();const blob=await pending;
 assert.equal(await blob.text(),'voice');assert.equal(blob.type,'audio/mp4');assert.equal(f.stopped(),1);assert.equal(r.stream,null);
});
test('Leaving during permission request releases late stream and never starts capture',async()=>{
 const f=fixture();let grant;const r=new LocalRecorder({mediaDevices:{getUserMedia:()=>new Promise(resolve=>grant=resolve)},Recorder:f.Recorder});
 const pending=r.record();r.cancel();grant(f.stream);assert.equal(await pending,null);assert.equal(f.stopped(),1);assert.equal(f.instance(),undefined);
});
test('Cancel discards captured audio and finishes pending promise',async()=>{
 const f=fixture(),r=new LocalRecorder({mediaDevices:{getUserMedia:async()=>f.stream},Recorder:f.Recorder});
 const pending=r.record();await new Promise(resolve=>setImmediate(resolve));r.cancel();assert.equal(await pending,null);assert.equal(f.stopped(),1);
});
test('Automatic stop limits recording duration',async()=>{
 const f=fixture(),r=new LocalRecorder({mediaDevices:{getUserMedia:async()=>f.stream},Recorder:f.Recorder,maxMs:10});
 assert((await r.record()).size>0);assert.equal(f.stopped(),1);
});

test('Cancel settles a pending permission immediately, without an OS response',async()=>{
 const f=fixture();let grant;const r=new LocalRecorder({mediaDevices:{getUserMedia:()=>new Promise(resolve=>grant=resolve)},Recorder:f.Recorder});
 const pending=r.record();r.cancel();assert.equal(await pending,null);assert.equal(f.instance(),undefined);
 grant(f.stream);await new Promise(resolve=>setImmediate(resolve));assert.equal(f.stopped(),1);
});
test('Stop during permission wait returns immediately and late denial is handled',async()=>{
 const f=fixture();let deny;const r=new LocalRecorder({mediaDevices:{getUserMedia:()=>new Promise((_resolve,reject)=>deny=reject)},Recorder:f.Recorder});
 const pending=r.record();r.stop();assert.equal(await pending,null);deny(Error('Late denial'));await new Promise(resolve=>setImmediate(resolve));assert.equal(f.instance(),undefined);
});
test('A late old grant cannot release the microphone of a new recording',async()=>{
 const first=fixture(),second=fixture();let grant,calls=0;
 const r=new LocalRecorder({mediaDevices:{getUserMedia:()=>++calls===1?new Promise(resolve=>grant=resolve):Promise.resolve(second.stream)},Recorder:second.Recorder});
 const old=r.record();r.cancel();assert.equal(await old,null);const current=r.record();await new Promise(resolve=>setImmediate(resolve));
 grant(first.stream);await new Promise(resolve=>setImmediate(resolve));assert.equal(first.stopped(),1);assert.equal(second.stopped(),0);r.stop();assert((await current).size>0);assert.equal(second.stopped(),1);
});
