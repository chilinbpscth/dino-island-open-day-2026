import {playVoice,stopVoice} from '../../shared/voice.js';
import {LocalRecorder} from '../../shared/recorder.js';
import {icon} from '../../shared/icons.js';

export const greetings=[
 ['hello','你好','見到朋友，點樣打招呼？'],
 ['morning','早上好','朝早見面，一齊打招呼。'],
 ['thanks','謝謝','小龍收到水果，點樣多謝？'],
 ['welcome','不客氣','朋友多謝你，可以點答？'],
 ['please','請','請朋友坐低，一齊休息。'],
 ['goodbye','再見','要返屋企啦，同朋友講再見。']
];

export function mountMandarin(root,state,save,finish,{pause=()=>{},resume=()=>{}}={}){
 let live=true,busy=false,previewUrl=null;
 const recorder=new LocalRecorder();state.round??=0;
 function clearAudio(){if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=null;stopVoice();}
 const status=text=>{if(live)root.querySelector('.feedback').textContent=text;};
 function render(){
  clearAudio();const [id,phrase,prompt]=greetings[state.round];
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 句，共六句">${greetings.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">恐龍打招呼</h2><div class="stage"><img class="character companion" src="img/chars/xiaolian-welcome.png" alt="小蓮打招呼"><img class="character dino" src="img/chars/dino-baby.png" alt="小龍留心聽"></div><p class="game-instruction">${prompt}</p><p class="game-instruction">「${phrase}」</p><div class="actions"><button id="greeting-listen">${icon('ear')}聽示範</button><button id="greeting-record" class="primary">跟住講 · 錄五秒</button><button id="greeting-stop" hidden>講完啦</button><button id="greeting-play" hidden>聽返自己把聲</button></div><p class="feedback" role="status">錄音只喺呢部機即時回播，離開就清除。</p><div class="actions"><button id="greeting-family">同家長一齊跟讀</button><button id="greeting-next" class="primary" disabled>${state.round===5?'完成打招呼':'下一句'}</button></div>`;
  const record=root.querySelector('#greeting-record'),stop=root.querySelector('#greeting-stop'),play=root.querySelector('#greeting-play'),next=root.querySelector('#greeting-next');
  root.querySelector('#greeting-listen').onclick=async()=>{
   if(busy)return;const ok=await playVoice(new URL(`../audio/zh-CN/greetings/${id}.wav`,import.meta.url));if(!ok)status('示範聲音未能播放，請家長陪同讀出呢句。');
  };
  record.onclick=async()=>{
   if(busy)return;busy=true;clearAudio();next.disabled=true;play.hidden=true;record.disabled=true;stop.hidden=false;
   pause();status('請允許咪高峰，跟住講。');
   // Clock resumes when the microphone is actually acquired, not during permission prompts.
   const pending=recorder.record();
   let watcher=setInterval(()=>{if(live&&recorder.stream){resume();status('慢慢講，我哋聽緊。');clearInterval(watcher);}},100);
   try{
    const blob=await pending;if(!live)return;
    if(blob?.size){previewUrl=URL.createObjectURL(blob);play.hidden=false;status('錄好啦！聽返自己把聲。');}
    else status('未收到錄音，再試或者同家長跟讀。');
   }catch{status('未能使用咪高峰，可以同家長一齊跟讀。');}
   finally{clearInterval(watcher);busy=false;if(live){record.disabled=false;stop.hidden=true;resume();}}
  };
  stop.onclick=()=>recorder.stop();
  play.onclick=async()=>{if(!previewUrl)return;const ok=await playVoice(previewUrl,()=>{if(live){next.disabled=false;status('多謝你用普通話打招呼！');}});if(!ok)status('未能回播，可以同家長一齊跟讀。');};
  root.querySelector('#greeting-family').onclick=()=>{if(busy)return;next.disabled=false;status('請家長陪小朋友跟讀，再一齊去下一句。');};
  next.onclick=()=>{if(next.disabled||busy)return;next.disabled=true;clearAudio();if(state.round===5){finish();return;}state.round++;save();render();};
 }
 const background=()=>{if(document.hidden){recorder.cancel();clearAudio();if(live)status('返嚟後可以再錄，或者同家長一齊讀。');}};
 document.addEventListener('visibilitychange',background);render();
 return ()=>{live=false;recorder.cancel();clearAudio();document.removeEventListener('visibilitychange',background);};
}
