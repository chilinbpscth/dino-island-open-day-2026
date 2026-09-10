import {COMMANDS,SEQUENCE_LEVELS,runSequence} from '../../shared/sequence.js';
import {hintLevel} from '../../shared/game-state.js';

const arrows={forward:'M45 76V15M22 38L45 15L68 38',left:'M70 75V42Q70 25 50 25H17M35 8L17 25L35 42',right:'M20 75V42Q20 25 40 25H73M55 8L73 25L55 42',jump:'M12 72Q45 -10 78 72M58 63L78 72L83 49'};
const commandIcon=command=>`<svg viewBox="0 0 90 90" width="40" height="40" aria-hidden="true"><path d="${arrows[command]}" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const egg='<svg viewBox="0 0 90 90" width="65" height="65" aria-hidden="true"><path d="M45 7C25 7 9 47 12 65C17 92 76 92 79 65C83 47 64 7 45 7Z" fill="#f6f3ec" stroke="#243f31" stroke-width="4"/><path d="M24 52L36 43L47 54L61 41M30 73L43 65L58 76" fill="none" stroke="#b8923a" stroke-width="7"/></svg>';
const rock='<svg viewBox="0 0 90 90" width="60" height="60" aria-hidden="true"><path d="M9 69L19 35L44 19L72 32L82 69Z" fill="#b8b8a1" stroke="#243f31" stroke-width="4"/><path d="M19 35L45 44L44 19M45 44L72 32" fill="none" stroke="#899582" stroke-width="3"/></svg>';

export function mountComputing(root,state,save,finish){
 let live=true,running=false,timer=null,resolveWait=null,runId=0;
 state.round??=0;state.commands??=[];state.attempts??=0;
 const wait=()=>new Promise(resolve=>{resolveWait=resolve;timer=setTimeout(()=>{resolveWait=null;resolve();},700);});
 function cancelRun(){runId++;clearTimeout(timer);resolveWait?.();resolveWait=null;running=false;}
 function render(){
  const level=SEQUENCE_LEVELS[state.round],guided=hintLevel(state.attempts)==='guided';
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共三回合">${SEQUENCE_LEVELS.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">恐龍跟住做</h2><p class="game-instruction">先排指令，再按出發，幫小龍搵到蛋。</p><div class="coding-workspace"><div class="coding-layout"><img class="coding-backdrop" src="img/games/computing/coding-garden.png" alt="恐龍指令花園"><div class="coding-guide"><img class="character" src="img/chars/xiaozhi-tablet.png" alt="小志示範排指令"><p>轉彎跟住小龍面向。<br>三角箭嘴係前面。</p></div><div class="coding-grid" role="img" aria-label="四乘四路線棋盤，機械小龍跟指令行去恐龍蛋">${Array.from({length:16},(_,i)=>{const x=i%4,y=Math.floor(i/4);return `<div class="coding-cell ${level.rocks.some(r=>r.x===x&&r.y===y)?'has-rock':''}" style="grid-column:${x+1};grid-row:${y+1}">${x===level.goal.x&&y===level.goal.y?egg:level.rocks.some(r=>r.x===x&&r.y===y)?rock:''}</div>`;}).join('')}<div class="coding-robot" id="coding-robot"><img class="character" src="img/chars/dino-baby.png" alt="小龍測試姿勢"><span class="robot-panel" aria-hidden="true"></span><svg class="robot-heading" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2L37 34H3Z" fill="#146b4d" stroke="#f6f3ec" stroke-width="3"/></svg></div></div></div><div class="coding-controls"><div class="coding-program" aria-label="已排指令">${Array.from({length:level.solution.length},(_,i)=>`<span class="coding-slot">${state.commands[i]?commandIcon(state.commands[i]):i+1}</span>`).join('')}</div><div class="actions coding-commands">${Object.entries(COMMANDS).map(([id,label])=>`<button data-command="${id}" ${state.commands.length>=level.solution.length?'disabled':''}>${commandIcon(id)}${label}</button>`).join('')}</div><div class="actions"><button id="code-undo" ${state.commands.length?'':'disabled'}>移除最後一步</button><button id="code-go" class="primary" ${state.commands.length===level.solution.length?'':'disabled'}>出發</button>${guided?'<button id="code-help">一齊排下一步</button>':''}</div><p class="feedback" role="status">${state.attempts>=2?'睇住三角箭嘴，轉彎唔會向前行。':'可以慢慢排，排好先出發。'}</p><button id="code-next" class="primary" hidden>${state.round===2?'完成任務':'下一條小路'}</button></div></div>`;
  move(level.start);
  for(const button of root.querySelectorAll('[data-command]'))button.onclick=()=>{if(running||state.commands.length>=level.solution.length)return;state.commands.push(button.dataset.command);save();render();};
  root.querySelector('#code-undo').onclick=()=>{if(running)return;state.commands.pop();save();render();};
  root.querySelector('#code-help')?.addEventListener('click',()=>{if(running)return;let i=state.commands.findIndex((c,i)=>c!==level.solution[i]);if(i<0)i=state.commands.length;state.commands=level.solution.slice(0,Math.min(i+1,level.solution.length));save();render();});
  root.querySelector('#code-go').onclick=async()=>{
   if(running)return;running=true;const currentRun=++runId;root.querySelectorAll('button').forEach(b=>b.disabled=true);
   const result=runSequence(level,state.commands);root.querySelector('.feedback').textContent='小龍照住指令行緊。';
   for(const frame of result.frames){await wait();if(!live||!running||currentRun!==runId)return;move(frame);}
   await wait();if(!live||!running||currentRun!==runId)return;running=false;
   if(result.success){root.querySelector('.feedback').textContent='排啱次序，小龍安全搵到恐龍蛋！';const next=root.querySelector('#code-next');next.hidden=false;next.disabled=false;}
   else{state.attempts++;save();render();root.querySelector('.feedback').textContent=result.blocked?'前面有障礙，再改一改指令。':'仲未到恐龍蛋，試下改一改次序。';}
  };
  root.querySelector('#code-next').onclick=()=>{if(running)return;root.querySelector('#code-next').disabled=true;if(state.round===2){finish();return;}state.round++;state.commands=[];state.attempts=0;save();render();};
 }
 function move(position){const robot=root.querySelector('#coding-robot');robot.classList.remove('is-jumping');if(position.command==='jump')robot.classList.add('is-jumping');robot.style.left=(position.x*25)+'%';robot.style.top=(position.y*25)+'%';robot.style.setProperty('--heading',position.heading*90+'deg');}
 const background=()=>{if(document.hidden&&running){cancelRun();if(live)render();}};
 document.addEventListener('visibilitychange',background);render();
 return ()=>{live=false;cancelRun();document.removeEventListener('visibilitychange',background);};
}
