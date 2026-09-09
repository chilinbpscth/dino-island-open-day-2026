import {icon} from '../../shared/icons.js';
import {hintLevel} from '../../shared/game-state.js';
const patterns=[[0,1],[1,0,2],[0,2,1,2]];
const names=['小龍打鼓','小蓮搖鈴','小志拍手'];
const instrument=i=>i===0?icon('drum'):`<svg class="icon" viewBox="0 0 90 90" fill="none" stroke="#203b2e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${i===1?'<path fill="#e5bc5d" d="M17 65q10-11 10-29a18 18 0 0136 0q0 18 10 29Z"/><path d="M36 73q9 13 18 0M45 9v10"/>':'<path fill="#ead1a2" d="M16 66L10 40q-1-8 7-6l7 14-2-27q1-8 8-2l7 28 2-29q4-9 9 0l1 29 9-22q7-5 8 3l-4 25 9-9q10-2 7 7L60 76H27Z"/><path d="M8 14l9 7M62 7l-4 10M78 22l-9 5"/>'}</svg>`;
export function mountMusic(root,state,save,finish){
 state.round??=0;state.attempts??=0;state.roundDone??=false;state.muted??=false;
 let live=true,listening=false,ready=false,index=0,serial=0,context=null,timers=new Set();
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(live)fn();},ms);timers.add(id);};
 function cancel(){serial++;timers.forEach(clearTimeout);timers.clear();listening=false;ready=false;index=0;}
 function tone(i){
  if(state.muted)return;
  try{context??=new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});const now=context.currentTime;
   const gain=context.createGain();gain.gain.setValueAtTime(.12,now);gain.gain.exponentialRampToValueAtTime(.001,now+.28);gain.connect(context.destination);
   if(i===2){const buffer=context.createBuffer(1,Math.floor(context.sampleRate*.12),context.sampleRate),data=buffer.getChannelData(0);for(let n=0;n<data.length;n++)data[n]=(Math.random()*2-1)*(1-n/data.length);const source=context.createBufferSource();source.buffer=buffer;source.connect(gain);source.start();source.onended=()=>{source.disconnect();gain.disconnect();};}
   else{const source=context.createOscillator();source.type='sine';source.frequency.setValueAtTime(i===0?180:880,now);source.frequency.exponentialRampToValueAtTime(i===0?65:700,now+.25);source.connect(gain);source.start();source.stop(now+.3);source.onended=()=>{source.disconnect();gain.disconnect();};}
  }catch{}
 }
 function flash(i){const button=root.querySelector(`[data-band="${i}"]`);button?.classList.add('band-lit');tone(i);later(()=>button?.classList.remove('band-lit'),400);}
 function render(){
  const pattern=patterns[state.round];
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共三回合">${patterns.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">恐龍小樂隊</h2><p class="game-instruction">${state.roundDone?`你同小樂隊一齊奏出 ${pattern.length} 拍啦！`:`先睇燈、聽 ${pattern.length} 拍，再輪到你。`}</p><div class="band-stage ${state.roundDone?'band-celebrating':''}">${['dino-baby','xiaolian-clap','xiaozhi-highfive'].map((file,i)=>`<button class="band-player" data-band="${i}" aria-label="${names[i]}" disabled><img class="character" src="img/chars/${file}.png" alt="${names[i]}"><span class="band-instrument">${instrument(i)}</span><span>${names[i]}</span></button>`).join('')}</div><div class="band-progress" aria-label="跟拍進度">${pattern.map((_,i)=>`<span data-beat="${i}" class="${state.roundDone?'done':''}">${i+1}</span>`).join('')}</div><p class="feedback" role="status">${state.roundDone?'大家一齊奏出音樂，小龍安心又開心！':'按示範開始，燈光會話你知輪到邊個。'}</p><div class="actions"><button id="band-demo" ${state.roundDone?'hidden':''}>睇燈聽示範</button><button id="band-mute" aria-pressed="${state.muted}">${state.muted?'開聲':'關聲'}</button>${!state.roundDone&&hintLevel(state.attempts)==='guided'?'<button id="band-help">一步一步跟燈</button>':''}${state.roundDone?`<button class="primary" id="band-next">${state.round===2?'完成照顧任務':'下一段音樂'}</button>`:''}</div>`;
  root.querySelector('#band-mute').onclick=()=>{state.muted=!state.muted;save();if(state.muted)context?.suspend().catch(()=>{});const b=root.querySelector('#band-mute');b.textContent=state.muted?'開聲':'關聲';b.setAttribute('aria-pressed',String(state.muted));};
  root.querySelector('#band-demo').onclick=()=>demo();
  root.querySelector('#band-help')?.addEventListener('click',()=>demo(true));
  root.querySelectorAll('[data-band]').forEach(button=>button.onclick=()=>{
   if(!live||!ready||listening||state.roundDone)return;
   const i=Number(button.dataset.band);flash(i);
   if(i!==pattern[index]){state.attempts++;save();cancel();render();root.querySelector('.feedback').textContent=state.attempts>=2?'睇清楚發光次序，可以再聽一次，慢慢跟。':'再聽一次，一齊試多次。';return;}
   root.querySelector(`[data-beat="${index}"]`).classList.add('done');index++;
   if(index===pattern.length){state.roundDone=true;save();cancel();render();return;}
   if(root.dataset.guided==='true'){root.querySelectorAll('.band-hint').forEach(n=>n.classList.remove('band-hint'));root.querySelector(`[data-band="${pattern[index]}"]`).classList.add('band-hint');}
  });
  root.querySelector('#band-next')?.addEventListener('click',()=>{if(!live)return;if(state.round===2){finish();return;}cancel();state.round++;state.attempts=0;state.roundDone=false;save();render();});
 }
 function demo(guided=false){
  if(listening||state.roundDone||document.hidden)return;cancel();const run=serial,pattern=patterns[state.round];listening=true;root.dataset.guided=String(guided);root.querySelectorAll('[data-band],#band-demo,#band-help').forEach(b=>b.disabled=true);root.querySelectorAll('[data-beat]').forEach(n=>n.classList.remove('done'));root.querySelectorAll('.band-hint').forEach(n=>n.classList.remove('band-hint'));root.querySelector('.feedback').textContent='先睇住小樂隊發光。';
  pattern.forEach((i,n)=>later(()=>{if(run===serial)flash(i);},250+n*650));
  later(()=>{if(run!==serial)return;listening=false;ready=true;root.querySelectorAll('[data-band],#band-demo,#band-help').forEach(b=>b.disabled=false);root.querySelector('.feedback').textContent='輪到你，照次序撳，唔使趕。';if(guided)root.querySelector(`[data-band="${pattern[0]}"]`).classList.add('band-hint');},250+pattern.length*650);
 }
 const background=()=>{if(document.hidden){cancel();context?.suspend().catch(()=>{});if(live)render();}};
 document.addEventListener('visibilitychange',background);render();
 return()=>{live=false;cancel();context?.close().catch(()=>{});document.addEventListener('visibilitychange',background);delete root.dataset.guided;};
}
