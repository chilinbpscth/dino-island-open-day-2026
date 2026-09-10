import {icon} from '../../shared/icons.js';
import {hintLevel} from '../../shared/game-state.js';
const shapes={
 forest:'<path fill="#bad1a0" d="M5 80Q40 56 85 80Z"/><path d="M45 75V36"/><path fill="#75a75b" d="M16 39Q8 20 29 18Q39-1 54 17Q83 11 78 37Q93 59 60 59H29Q3 58 16 39Z"/>',
 volcano:'<path fill="#b9ae91" d="M7 79L33 32H57L84 79Z"/><path fill="#e5bc5d" d="M33 32L38 45L45 40L53 45L57 32Z"/><path d="M42 23q-13-9-3-17m16 17q12-8 4-16"/>',
 river:'<path fill="#9bd0db" d="M35 3H65Q25 30 62 43Q96 59 50 87H17Q65 58 36 48Q0 35 35 3Z"/>',
 camp:'<path fill="#e5bc5d" d="M8 77L45 17L82 77Z"/><path fill="#f6f3ec" d="M31 77L45 48L59 77Z"/>',
 bottle:'<path fill="#a6d5df" d="M30 30V17H60V30L69 43V79H21V43Z"/><path fill="#e5bc5d" d="M28 8H62V20H28Z"/><path d="M30 50h30m-30 12h30"/>',
 machine:'<path fill="#f6f3ec" d="M16 78V42Q16 15 45 15T74 42V78Z"/><path fill="#bad1a0" d="M26 76V43Q26 25 45 25T64 43V76Z"/><path fill="#f6f3ec" d="M34 76V47Q34 36 45 36T56 47V76Z"/><path fill="#e5bc5d" d="M10 76H80V84H10Z"/><circle fill="#e5bc5d" cx="24" cy="51" r="4"/><circle fill="#e5bc5d" cx="66" cy="51" r="4"/><circle fill="#146b4d" cx="25" cy="67" r="3"/><circle fill="#146b4d" cx="65" cy="67" r="3"/><path d="M45 7V15"/><circle fill="#e5bc5d" cx="45" cy="5" r="3"/>'
};
const picture=id=>shapes[id]?`<svg class="icon" viewBox="0 0 90 90" fill="none" stroke="#203b2e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[id]}</svg>`:icon(id);
const sceneFiles={forest:'safe-forest',volcano:'volcano-edge',river:'river-centre'};
const optionPicture=id=>sceneFiles[id]?`<img class="expedition-landscape" src="img/games/humanities/${sceneFiles[id]}.png" alt="">`:picture(id);
const tasks=[
 {title:'研究營地起喺邊度好？',options:[['volcano','火山旁'],['forest','平坦林地'],['river','河中央']],answer:'forest',hint:'揀平坦、遠離火山同河水嘅地方。',reward:'營地遠離危險，小龍有安全地方休息。'},
 {title:'小龍口渴，帶邊樣去營地？',options:[['mud','泥水'],['leaf','菜葉'],['bottle','帶來嘅清潔飲用水']],answer:'bottle',hint:'揀探險隊帶來、可以飲用嘅清水。',reward:'有清潔飲用水，小龍解渴又舒服。'},
 {title:'太陽曬住營地，點樣涼快啲？',options:[['sun','直接曬太陽'],['forest','樹蔭下休息'],['volcano','靠近火山']],answer:'forest',hint:'睇吓邊度有樹葉遮住太陽。',reward:'有樹蔭遮陽，小龍涼快又安心。'}
];
export function mountHumanities(root,state,save,finish){
 state.round??=0;state.attempts??=0;state.roundDone??=false;let live=true,arriving=false;
 function render(){
  const task=tasks[state.round],achieved=state.round+(state.roundDone?1:0);
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共三回合">${tasks.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">時光探險營地</h2>${!state.started?`<div class="expedition-intro">${picture('machine')}<p>一齊玩時光機想像遊戲！<br>去恐龍島研究，幫小龍搵安全嘅生活地方。</p><button class="primary" id="expedition-start">出發去研究</button></div>`:`<p class="game-instruction">${task.title}</p><div class="expedition-camp ${arriving?'is-arriving':''}"><img class="character expedition-guide" src="img/games/humanities/${state.round===1?'xiaozhi':'xiaolian'}-explorer.png" alt="${state.round===1?'小志':'小蓮'}帶領探險"><div class="expedition-improvements" aria-label="營地照顧成果">${achieved>=1?`<span class="${state.roundDone&&achieved===1?'camp-added':''}">${picture('camp')}安全營地</span>`:''}${achieved>=2?`<span class="${state.roundDone&&achieved===2?'camp-added':''}">${picture('bottle')}清潔飲用水</span>`:''}${achieved>=3?`<span class="${state.roundDone&&achieved===3?'camp-added':''}">${picture('forest')}樹蔭</span>`:''}</div><img class="character ${state.roundDone?'is-happy':''}" src="img/chars/dino-baby.png" alt="營地小龍"></div><div class="choices expedition-options">${state.roundDone?'':task.options.map(([id,label])=>`<button class="choice" data-expedition="${id}" aria-label="${label}">${optionPicture(id)}<span>${label}</span></button>`).join('')}</div><p class="feedback" role="status">${state.roundDone?task.reward:state.attempts>=2?task.hint:'望清楚環境，揀一樣幫小龍。'}</p><div class="actions">${!state.roundDone&&hintLevel(state.attempts)==='guided'?'<button id="expedition-help">一齊搵安全方法</button>':''}${state.roundDone?`<button class="primary" id="expedition-next">${state.round===2?'完成照顧任務':'繼續建好營地'}</button>`:''}</div>`}`;
  root.querySelector('#expedition-start')?.addEventListener('click',()=>{state.started=true;arriving=true;save();render();arriving=false;});
  for(const button of root.querySelectorAll('[data-expedition]'))button.onclick=()=>{
   if(!live||state.roundDone)return;
   if(button.dataset.expedition!==task.answer){state.attempts++;save();render();if(state.attempts<2)root.querySelector('.feedback').textContent='呢度未夠合適，試下另一個方法。';return;}
   state.roundDone=true;save();render();
  };
  root.querySelector('#expedition-help')?.addEventListener('click',()=>{const target=root.querySelector(`[data-expedition="${task.answer}"]`);target.classList.add('expedition-hint');target.focus();root.querySelector('.feedback').textContent=task.hint;});
  root.querySelector('#expedition-next')?.addEventListener('click',()=>{if(!live)return;if(state.round===2){live=false;finish();return;}state.round++;state.attempts=0;state.roundDone=false;save();render();});
 }
 render();return()=>{live=false;};
}
