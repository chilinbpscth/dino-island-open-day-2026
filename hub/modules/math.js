import {icon} from '../../shared/icons.js';
import {hintLevel} from '../../shared/game-state.js';

const counts=[1,3,5];
export function mountMath(root,state,save,finish){
 state.round??=0;state.fed??=[];state.used??=[];state.attempts??=0;
 let selected=null,drag=null,ghost=null,live=true,suppressClick=false;
 const feedback=text=>{root.querySelector('.feedback').textContent=text;};
 function cancel(){drag=null;ghost?.remove();ghost=null;selected=null;root.querySelectorAll('.chosen').forEach(n=>n.classList.remove('chosen'));}
 function render(){
  cancel();const count=counts[state.round],done=state.fed.length===count;
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共三回合">${counts.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">恐龍開餐啦</h2><p class="game-instruction">有 ${count} 隻恐龍，每隻一份，大家都食飽。</p><div class="feeding-garden" style="--dinosaurs:${count}">${Array.from({length:count},(_,i)=>`<button class="feeding-dino ${state.fed.includes(i)?'is-fed':''}" data-dino="${i}" aria-label="第 ${i+1} 隻恐龍${state.fed.includes(i)?'已食飽':''}"><img class="character" src="img/${i===0?(state.fed.includes(i)?'chars/dino-baby-eat':'games/math/dino-hungry'):`games/math/friend-${i%2?'longneck':'triceratops'}`}.png" alt="${i===0?'小龍':i%2?'長頸龍朋友':'三角龍朋友'}"><span class="feeding-plate">${state.fed.includes(i)?icon('apple'):'<span aria-hidden="true">？</span>'}</span><span>${state.fed.includes(i)?'食飽啦':'未有食物'}</span></button>`).join('')}</div><p class="feeding-count" aria-live="polite">${state.fed.length}／${count} 隻食飽啦</p><div class="choices feeding-food" aria-label="食物盤，有多餘食物">${Array.from({length:count+2},(_,i)=>`<button class="choice" data-food="${i}" aria-label="第 ${i+1} 份蘋果" ${state.used.includes(i)||done?'disabled':''}>${icon('apple')}</button>`).join('')}</div><p class="feedback" role="status">${done?'每隻都有一份，冇人餓肚，亦唔使食多咗！':hintLevel(state.attempts)==='retry'?'拖一份食物去小龍；亦可以先點食物，再點小龍。':'留意空碟，搵未有食物嘅小龍。'}</p><div class="actions">${!done&&hintLevel(state.attempts)==='guided'?'<button id="feeding-help">一齊搵空碟</button>':''}${done?`<button class="primary" id="feeding-next">${state.round===2?'完成照顧任務':'繼續照顧'}</button>`:''}</div>`;
  for(const button of root.querySelectorAll('[data-food]')){
   const choose=()=>{if(button.disabled)return;selected=Number(button.dataset.food);root.querySelectorAll('.chosen').forEach(n=>n.classList.remove('chosen'));button.classList.add('chosen');};
   button.onclick=()=>{if(suppressClick){suppressClick=false;return;}choose();};
   button.onpointerdown=e=>{if(e.button!==0||button.disabled||drag)return;suppressClick=false;choose();drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};button.setPointerCapture(e.pointerId);};
   button.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>9){drag.moved=true;if(!ghost){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=icon('apple');document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}};
   button.onpointerup=e=>{if(!drag||drag.id!==e.pointerId)return;const moved=drag.moved;drag=null;ghost?.remove();ghost=null;if(moved){suppressClick=true;const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-dino]');if(target&&root.contains(target))feed(Number(target.dataset.dino));else cancel();}};
   button.onpointercancel=()=>{suppressClick=true;cancel();};
  }
  for(const button of root.querySelectorAll('[data-dino]'))button.onclick=()=>feed(Number(button.dataset.dino));
  root.querySelector('#feeding-help')?.addEventListener('click',()=>{const target=root.querySelector('[data-dino]:not(.is-fed)');target?.classList.add('feeding-hint');target?.focus();feedback('發光嘅空碟仲未有食物，揀一份放入去。');});
  root.querySelector('#feeding-next')?.addEventListener('click',()=>{if(!live)return;if(state.round===2){live=false;finish();return;}state.round++;state.fed=[];state.used=[];state.attempts=0;save();render();});
 }
 function feed(index){
  if(!live||state.fed.length===counts[state.round])return;
  if(selected===null){feedback('先點一份食物，再點未食飽嘅小龍。');return;}
  if(state.fed.includes(index)){state.attempts++;save();render();feedback(state.attempts>=2?'呢隻已經有一份，留意空碟，輪到其他小龍。':'呢隻食飽啦，試下餵另一隻。');return;}
  if(state.used.includes(selected))return;
  state.fed.push(index);state.used.push(selected);save();render();
 }
 const background=()=>{if(document.hidden)cancel();};
 document.addEventListener('visibilitychange',background);render();
 return()=>{live=false;cancel();document.removeEventListener('visibilitychange',background);};
}
