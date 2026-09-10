import {icon} from '../../shared/icons.js';
import {hintLevel} from '../../shared/game-state.js';

const labels={wake:'起床',breakfast:'食早餐',play:'玩耍',bath:'沖涼',sleep:'瞓覺',morning:'早上',day:'日間',night:'夜晚'};
const custom={
 wake:'<path d="M12 63V40h66v23M12 54h66M20 64v12m50-12v12"/><rect x="19" y="32" width="24" height="18" rx="6" fill="#fff"/><path d="M50 17l7-10m7 19 13-3"/>',
 breakfast:'<ellipse cx="45" cy="62" rx="35" ry="17" fill="#fff"/><path d="M22 57V25q23-16 46 0v32Z" fill="#e5bc5d"/><path d="M32 31h25m-25 9h25"/>',
 play:'<circle cx="45" cy="45" r="32" fill="#e5bc5d"/><path d="M16 33q30 22 58 0M27 71q9-30 0-51m36 50q-9-30 0-50"/>',
 morning:'<path d="M8 62h74"/><path d="M20 61a25 25 0 0150 0" fill="#e5bc5d"/><path d="M45 15v12M12 34l10 8m56-8-10 8"/>',
 night:'<path d="M56 10a34 34 0 1030 46C51 67 32 35 56 10Z" fill="#e5bc5d"/><path d="M68 16v14m-7-7h14"/>'
};
const visual=id=>custom[id]?`<svg class="icon" viewBox="0 0 90 90" aria-hidden="true" fill="none" stroke="#203b2e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${custom[id]}</svg>`:icon(id==='day'?'sun':id);
const rounds=[
 {title:'小龍起床啦，跟住做咩？',steps:['breakfast'],options:['sleep','breakfast','bath'],scene:'morning',start:['wake'],reward:'起床食早餐，小龍有精神開始新一日！'},
 {title:'玩完一身汗，先沖涼，再瞓覺。',steps:['bath','sleep'],options:['breakfast','sleep','bath'],scene:'night',start:['play'],reward:'玩完沖乾淨，再好好休息，小龍舒服又安心！'},
 {title:'幫小龍搵返早上、日間同夜晚。',steps:['morning','day','night'],options:['night','morning','day'],scene:'morning',start:[],reward:'早上食早餐、日間玩耍、夜晚休息，小龍學識安排生活！'}
];
export function mountGeneral(root,state,save,finish){
 state.round??=0;state.step??=0;state.attempts??=0;let live=true;
 function render(){
  const round=rounds[state.round],done=state.step===round.steps.length,expected=round.steps[state.step],matching=state.round===2;
  const action=matching?['breakfast','play','sleep'][Math.min(state.step,2)]:state.step?round.steps[state.step-1]:round.start[0];
  const scene=matching?round.steps[Math.min(state.step,2)]:round.scene;
  const sequence=[...round.start,...round.steps.slice(0,state.step)];
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共三回合">${rounds.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">小龍嘅一日</h2><p class="game-instruction">${round.title}</p><div class="routine-scene routine-${scene}"><div class="routine-window" aria-label="${labels[scene]}景色">${visual(scene)}</div><img class="character routine-guide" src="img/chars/xiaozhi-welcome.png" alt="小志陪小龍安排生活"><div class="routine-dino"><img class="character" src="img/chars/${action==='sleep'?'dino-baby-sleep':action==='breakfast'?'dino-baby-eat':'dino-baby'}.png" alt="小龍${labels[action]}"><span class="routine-action">${visual(action)}<span>${labels[action]}</span></span></div></div><div class="routine-sequence" aria-label="已完成生活步驟">${matching?round.steps.slice(0,state.step).map(id=>`<span>${visual(id)}${labels[id]} ✓</span>`).join(''):sequence.map((id,i)=>`${i?'<b aria-hidden="true">→</b>':''}<span>${visual(id)}${labels[id]}</span>`).join('')}</div><p class="feedback" role="status">${done?round.reward:matching?`小龍${labels[action]}，係一日嘅邊個時候？`:state.step?'沖乾淨啦，下一步做咩？':'望一望小龍做緊咩，再揀下一步。'}</p><div class="choices routine-choices">${done?'':round.options.map(id=>`<button class="choice" data-routine="${id}" aria-label="${labels[id]}">${visual(id)}<span>${labels[id]}</span></button>`).join('')}</div><div class="actions">${!done&&hintLevel(state.attempts)==='guided'?'<button id="routine-help">一齊睇下一步</button>':''}${done?`<button class="primary" id="routine-next">${state.round===2?'完成照顧任務':'繼續照顧'}</button>`:''}</div>`;
  for(const button of root.querySelectorAll('[data-routine]'))button.onclick=()=>{
   if(!live)return;
   if(button.dataset.routine!==expected){state.attempts++;save();render();root.querySelector('.feedback').textContent=hintLevel(state.attempts)==='retry'?'慢慢諗，再揀一次。':`睇提示：${labels[action]}${matching?'係'+labels[expected]+'嘅活動。':'之後，'+labels[expected]+'。'}`;return;}
   state.step++;state.attempts=0;save();render();
  };
  root.querySelector('#routine-help')?.addEventListener('click',()=>{const button=root.querySelector(`[data-routine="${expected}"]`);button.classList.add('routine-hint');button.focus();root.querySelector('.feedback').textContent=`一齊點「${labels[expected]}」，幫小龍安排好生活。`;});
  root.querySelector('#routine-next')?.addEventListener('click',()=>{if(!live)return;if(state.round===2){live=false;finish();return;}state.round++;state.step=0;state.attempts=0;save();render();});
 }
 render();return()=>{live=false;};
}
