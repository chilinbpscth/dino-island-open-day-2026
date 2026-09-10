import {icon} from '../../shared/icons.js';
import {hintLevel} from '../../shared/game-state.js';
import {playVoice,stopVoice} from '../../shared/voice.js';

const fruits=[['apple','蘋果','個'],['banana','香蕉','條'],['strawberry','士多啤梨','粒']];
const orders=[[1,1,1],[2,1,3],[3,2,1]];
export function mountMath(root,state,save,finish){
 state.round??=0;state.recognized??=0;state.served??=[0,0,0];state.attempts??=0;
 let selected=null,drag=null,ghost=null,live=true,suppressClick=false,audio=null,effectTimer=null,soundOn=true;
 const feedback=text=>{root.querySelector('.feedback').textContent=text;};
 const recognizing=()=>state.recognized<3;
 const complete=()=>state.served.every((n,i)=>n===orders[state.round][i]);
 function cancel(){drag=null;ghost?.remove();ghost=null;selected=null;root.querySelectorAll('.chosen').forEach(n=>n.classList.remove('chosen'));}
 function listen(){return playVoice(new URL(`../audio/yue/math/${recognizing()?fruits[state.recognized][0]:'order-'+state.round}.wav`,import.meta.url));}
 function sound(kind){
  if(!soundOn||!live||document.hidden)return;
  try{audio??=new (window.AudioContext||window.webkitAudioContext)();const context=audio;context.resume().then(()=>{
   if(!live||!soundOn||document.hidden||audio!==context)return;
   const notes=kind==='full'?[523,659,784]:kind==='enough'?[330]:[659,880];
   notes.forEach((hz,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.09;o.type='sine';o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.18);o.onended=()=>{o.disconnect();g.disconnect();};});
  }).catch(()=>{});}catch{}
 }
 function munch(fruit){
  const target=root.querySelector('[data-dino]'),picture=target.querySelector('img'),prior=picture.src;
  picture.src='img/chars/dino-baby-eat.png';target.classList.add('fruit-munch');
  const bite=document.createElement('span');bite.className='fruit-bite';bite.innerHTML=icon(fruit);target.append(bite);
  clearTimeout(effectTimer);effectTimer=setTimeout(()=>{if(!live)return;bite.remove();target.classList.remove('fruit-munch');picture.src=prior;},480);
 }
 function render(){
  clearTimeout(effectTimer);cancel();const intro=recognizing(),done=!intro&&complete(),order=orders[state.round];
  root.innerHTML=`<div class="rounds" aria-label="${intro?'先認識三種水果':`第 ${state.round+1} 張餐單，共三張`}">${orders.map((_,i)=>`<span class="round-dot ${!intro&&i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">${intro?'認識水果朋友':'小龍嘅水果餐單'}</h2><p class="game-instruction">${intro?`搵一搵：邊個係${fruits[state.recognized][1]}？`:'每次餵一件，三種水果分開數。'}</p><div class="fruit-meal"><button class="feeding-dino" data-dino="0" ${intro?'disabled':''} aria-label="餵小龍一件水果"><img class="character" src="img/${done?'chars/dino-baby-eat':'games/math/dino-hungry'}.png" alt="${done?'小龍食到啱啱好嘅水果':'等緊食水果嘅小龍'}"><span>${intro?'一齊認水果':done?'份量啱啱好！':'揀水果，餵畀我'}</span></button><div class="fruit-order" aria-label="小龍想食嘅水果份量">${intro?`<p>蘋果、香蕉、士多啤梨</p><p>已認識 ${state.recognized}／3 種</p>`:fruits.map(([id,name,unit],i)=>`<div class="fruit-order-row ${state.served[i]===order[i]?'fruit-enough':''}" data-order="${id}">${icon(id)}<div><strong>${order[i]} ${unit}${name}</strong><div class="fruit-dots" aria-hidden="true">${Array.from({length:order[i]},(_,n)=>`<span class="${n<state.served[i]?'filled':''}"></span>`).join('')}</div></div><span class="fruit-tally" aria-label="${name}已餵 ${state.served[i]}，需要 ${order[i]}">${state.served[i]}／${order[i]}</span></div>`).join('')}</div></div><p class="feeding-count" aria-live="polite">${intro?'先認識，再數數':done?'三種水果都夠數啦！':`已餵 ${state.served.reduce((a,b)=>a+b,0)} 件水果`}</p><div class="choices feeding-food fruit-food" aria-label="三種水果，每次取一件">${fruits.map(([id,name],i)=>`<button class="choice" data-food="${id}" aria-label="${name}" ${done?'disabled':''}><span class="fruit-pile" aria-hidden="true">${Array.from({length:intro?5:5-state.served[i]},(_,n)=>icon(id,`pile-piece piece-${n}`)).join('')}</span><span class="fruit-basket-label">${name}</span></button>`).join('')}</div><p class="feedback" role="status">${intro?'聽一聽，點選啱嘅水果。':done?'數清楚每種份量，小龍食得開心又舒服！':'拖一件水果去小龍；亦可以先點水果，再點小龍。'}</p><div class="actions"><button id="fruit-sound" aria-pressed="${soundOn}">${soundOn?'聲效：開':'聲效：關'}</button><button id="fruit-listen">${icon('ear')}聽${intro?'水果名':'餐單'}</button>${!done&&hintLevel(state.attempts)==='guided'?'<button id="feeding-help">一齊睇提示</button>':''}${done?`<button class="primary" id="feeding-next">${state.round===2?'完成照顧任務':'下一張餐單'}</button>`:''}</div>`;
  root.querySelector('#fruit-listen').onclick=listen;
  root.querySelector('#fruit-sound').onclick=()=>{soundOn=!soundOn;if(!soundOn){audio?.close().catch(()=>{});audio=null;}render();};
  for(const button of root.querySelectorAll('[data-food]')){
   const index=fruits.findIndex(f=>f[0]===button.dataset.food);
   const choose=()=>{if(button.disabled)return;selected=index;root.querySelectorAll('.chosen').forEach(n=>n.classList.remove('chosen'));button.classList.add('chosen');};
   button.onclick=()=>{if(suppressClick){suppressClick=false;return;}if(intro){recognize(index);return;}choose();};
   button.onpointerdown=e=>{if(intro||e.button!==0||button.disabled||drag)return;suppressClick=false;choose();drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};button.setPointerCapture(e.pointerId);};
   button.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9){drag.moved=true;if(!ghost){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=icon(fruits[index][0]);document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}};
   button.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;ghost?.remove();ghost=null;if(moved){suppressClick=true;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dino]');if(target&&root.contains(target))feed();else cancel();}};
   button.onpointercancel=()=>{suppressClick=true;cancel();};
  }
  root.querySelector('[data-dino]').onclick=feed;
  root.querySelector('#feeding-help')?.addEventListener('click',()=>{const i=intro?state.recognized:order.findIndex((n,i)=>state.served[i]<n);root.querySelector(`[data-food="${fruits[i][0]}"]`).classList.add('feeding-hint');feedback(intro?`發光嘅係${fruits[i][1]}。`:`${fruits[i][1]}仲欠 ${order[i]-state.served[i]} ${fruits[i][2]}，逐件餵。`);});
  root.querySelector('#feeding-next')?.addEventListener('click',()=>{if(!live)return;stopVoice();if(state.round===2){live=false;finish();return;}state.round++;state.served=[0,0,0];state.attempts=0;save();render();listen();});
 }
 function recognize(index){if(!live)return;if(index!==state.recognized){state.attempts++;save();render();feedback('再聽一聽，搵同名嘅水果。');return;}state.recognized++;state.attempts=0;save();render();listen();}
 function feed(){
  if(!live||recognizing()||complete())return;
  if(selected===null){feedback('先揀一件水果，再點小龍。');return;}
  const i=selected,[,name,unit]=fruits[i];
  if(state.served[i]>=orders[state.round][i]){state.attempts++;save();render();sound('enough');feedback(`${name}已經夠數啦，睇吓另一種仲欠幾多。`);return;}
  state.served[i]++;save();render();sound(complete()?'full':'bite');munch(fruits[i][0]);feedback(complete()?'三種水果都啱啱好，小龍食得開心又舒服！':`${name}：${state.served[i]} ${unit}，要 ${orders[state.round][i]} ${unit}。`);
 }
 const background=()=>{if(document.hidden){cancel();audio?.close().catch(()=>{});audio=null;}};
 document.addEventListener('visibilitychange',background);render();
 return()=>{live=false;clearTimeout(effectTimer);cancel();audio?.close().catch(()=>{});stopVoice();document.removeEventListener('visibilitychange',background);};
}
