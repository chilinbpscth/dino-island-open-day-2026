// Learner speech lives only in memory. Never persist or upload these blobs.
export class LocalRecorder{
 constructor({mediaDevices=navigator.mediaDevices,Recorder=globalThis.MediaRecorder,maxMs=5000}={}){
  this.mediaDevices=mediaDevices;this.Recorder=Recorder;this.maxMs=maxMs;this.generation=0;this.stream=null;this.recorder=null;this.timer=null;this.resolve=null;
 }
 async record(){
  this.cancel();const generation=this.generation;
  if(!this.mediaDevices?.getUserMedia||!this.Recorder)throw Error('呢部設備未能錄音，可以跟住示範讀。');
  const stream=await this.mediaDevices.getUserMedia({audio:true,video:false});
  if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return null;}
  this.stream=stream;
  try{
   const mimeType=['audio/mp4','audio/webm;codecs=opus','audio/webm'].find(t=>this.Recorder.isTypeSupported(t));
   const recorder=new this.Recorder(stream,mimeType?{mimeType}:{});this.recorder=recorder;
   return await new Promise((resolve,reject)=>{
    this.resolve=resolve;const chunks=[];
    recorder.ondataavailable=e=>{if(generation===this.generation&&e.data.size)chunks.push(e.data);};
    recorder.onstop=()=>{
     if(generation!==this.generation)return;
     this.release();this.resolve=null;
     resolve(chunks.length?new Blob(chunks,{type:recorder.mimeType||chunks[0].type}):null);
    };
    recorder.onerror=()=>{this.resolve=null;reject(Error('錄音未完成，可以再試一次。'));this.cancel();};
    recorder.start();this.timer=setTimeout(()=>this.stop(),this.maxMs);
   });
  }catch(error){this.cancel();throw error;}
 }
 stop(){if(this.recorder?.state==='recording')this.recorder.stop();}
 release(){clearTimeout(this.timer);this.timer=null;this.stream?.getTracks().forEach(t=>t.stop());this.stream=null;this.recorder=null;}
 cancel(){
  this.generation++;const recorder=this.recorder;
  if(recorder){recorder.ondataavailable=null;recorder.onstop=null;recorder.onerror=null;if(recorder.state==='recording')recorder.stop();}
  this.release();this.resolve?.(null);this.resolve=null;
 }
}
