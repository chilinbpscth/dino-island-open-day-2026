// The model and WASM are bundled locally; no image or landmark is uploaded or persisted.
let modelPromise=null;
export function loadPoseModel(){
 if(!modelPromise)modelPromise=(async()=>{
  const {FilesetResolver,PoseLandmarker}=await import('./vendor/mediapipe/vision-bundle.js');
  const files=await FilesetResolver.forVisionTasks(new URL('./vendor/mediapipe/wasm/',import.meta.url).href);
  return PoseLandmarker.createFromOptions(files,{baseOptions:{modelAssetPath:new URL('./models/pose-landmarker-lite-v1.task',import.meta.url).href,delegate:'CPU'},runningMode:'VIDEO',numPoses:2,minPoseDetectionConfidence:.6,minPosePresenceConfidence:.6,minTrackingConfidence:.6,outputSegmentationMasks:false});
 })().catch(error=>{modelPromise=null;throw error;});
 return modelPromise;
}
export class PoseCamera{
 constructor({loadModel=loadPoseModel}={}){this.loadModel=loadModel;this.generation=0;this.stream=null;this.video=null;this.raf=null;this.background=null;}
 async start(video,onResult,onError=()=>{}){
  this.stop();const generation=this.generation;
  this.background=()=>{if(document.hidden)this.stop();};document.addEventListener('visibilitychange',this.background);
  try{
   const model=await this.loadModel();if(generation!==this.generation)return false;
   const stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:'user',width:{ideal:640},height:{ideal:480},frameRate:{ideal:15,max:20}}});
   if(generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return false;}
   this.stream=stream;this.video=video;video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();
   if(generation!==this.generation)return false;
   let previousFrame=-1,lastDetection=-Infinity;
   const tick=now=>{
    if(generation!==this.generation)return;
    try{
     if(video.readyState>=2&&video.currentTime!==previousFrame&&now-lastDetection>=100){previousFrame=video.currentTime;lastDetection=now;const result=model.detectForVideo(video,now);onResult(result.landmarks,now);}
    }catch(error){this.stop();onError(error);return;}
    if(generation===this.generation)this.raf=requestAnimationFrame(tick);
   };
   this.raf=requestAnimationFrame(tick);return true;
  }catch(error){if(generation!==this.generation)return false;this.stop();throw error;}
 }
 stop(){
  this.generation++;if(this.raf!==null)cancelAnimationFrame(this.raf);this.raf=null;
  if(this.background)document.removeEventListener('visibilitychange',this.background);this.background=null;
  this.stream?.getTracks().forEach(track=>track.stop());this.stream=null;
  if(this.video){this.video.pause();this.video.srcObject=null;this.video=null;}
 }
}
export const poseCamera=new PoseCamera();
