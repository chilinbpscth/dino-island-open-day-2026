import {peScene,peSituations,peOutcomes} from './pe-scene.js';
import {playVoice,stopVoice} from '../../shared/voice.js';
import {poseCamera} from '../../shared/pose-camera.js';
import {PoseActions} from '../../shared/pose-actions.js';
const sequences={english:['jump','sit','stand','hands','left','right','freeze'],pe:['sit','left','right','hands','freeze']};
const labels={jump:'輕輕跳起，再企穩',sit:'慢慢蹲低',stand:'企返直',hands:'舉高雙手',left:'向畫面左邊移一步',right:'向畫面右邊移一步',freeze:'停定定'};
const englishSprites={jump:'dino-jump',sit:'dino-squat',hands:'dino-hands-up'};
const cues={jump:'↑',sit:'↓',stand:'↑',hands:'↑ ↑',left:'←',right:'→',freeze:'●'};
const poseMessages={'no-person':'請企喺鏡頭前，讓全身入畫。',multiple:'今次一位小朋友玩，家長可以企喺畫面外陪同。',unclear:'鏡頭未睇清楚，請露出雙手同雙腳。','stand-to-calibrate':'先企直，等小志認一認位置。',calibrating:'企定一陣，準備好就開始。'};
export function mountMotion(root,state,save,finish,lifecycle={},subject='english'){
 const {pause=()=>{},resume=()=>{}}=lifecycle,sequence=sequences[subject],tracker=new PoseActions();state.round??=0;state.motionAttempts??=0;
 let live=true,mode=state.roundDone?'success':'choose',request=0,raf=null,last=null,remaining=5000,holdStart=null,holdPointer=null,commandStarted=false,attemptTime=0,lastPoseTime=null;
 const command=()=>sequence[state.round];
 const status=text=>{if(live&&root.querySelector('.feedback'))root.querySelector('.feedback').textContent=text+(mode==='camera'&&state.motionAttempts>=2?(state.motionAttempts>=3?' 可以同家長逐步做，撳下面親子玩法。':' 再睇動作提示，同家長慢慢試。'):'');};
 function stop(){request++;poseCamera.stop();cancelAnimationFrame(raf);raf=null;holdStart=null;holdPointer=null;last=null;stopVoice();}
 function render(){
  stopVoice();
  root.innerHTML=`<div class="rounds" aria-label="第 ${state.round+1} 回合，共 ${sequence.length} 回合">${sequence.map((_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div><h2 class="game-instruction">${subject==='english'?'小龍講，你跟住做':'恐龍蛋守護隊'}</h2><p class="game-instruction">${subject==='pe'?(mode==='success'?peOutcomes[command()]:peSituations[command()]):labels[command()]}</p><div class="motion-stage action-${command()} ${subject==='pe'?'pe-stage':''} ${mode==='family'?'scene-running':''} ${mode==='success'?'scene-complete':''}">${subject==='pe'?'<div class="pe-scene">'+peScene(command(),mode==='success'):''}<img class="character motion-guide" src="${subject==='english'&&englishSprites[command()]?`img/games/english/${englishSprites[command()]}.png`:`img/chars/${subject==='english'?'dino-baby':'xiaozhi-stretch'}.png`}" alt="動作示範角色"><span class="motion-cue" aria-hidden="true">${cues[command()]}</span>${subject==='pe'?'</div>':''}<video class="motion-camera" autoplay muted playsinline ${mode==='camera'||mode==='loading'?'':'hidden'} aria-label="本機鏡像動作畫面"></video></div><p class="feedback" role="status">${mode==='success'?(subject==='pe'?'你幫恐龍蛋安全留喺窩入面！':'你聽指令同小龍一齊郁身，小龍好開心！'):mode==='choose'?'平板放穩，家長陪住，預留郁身位置。':mode==='paused'?'鏡頭同計時已暫停，返嚟再準備。':mode==='family'?'一齊跟示範做，倒數完再長按確認。':'準備鏡頭同本機辨識，請稍等。'}</p><div class="motion-progress" role="progressbar" aria-label="動作進度" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><div class="actions">${['choose','paused'].includes(mode)?'<button id="motion-camera-start" class="primary">用鏡頭一齊玩</button>':''}${mode!=='success'&&mode!=='family'?'<button id="motion-family" class="'+(state.motionAttempts>=3?'motion-help-highlight':'')+'">同家長一齊做</button>':''}${mode!=='success'?'<button id="motion-listen">聽指令</button>':''}${mode==='family'?'<span class="motion-countdown" aria-live="polite">5</span><button class="primary" id="motion-hold" disabled>準備一齊做</button>':''}${mode==='success'?`<button id="motion-next" class="primary">${state.round===sequence.length-1?'完成照顧任務':'下一個動作'}</button>`:''}</div>`;
  root.querySelector('#motion-camera-start')?.addEventListener('click',launch);
  root.querySelector('#motion-family')?.addEventListener('click',family);
  root.querySelector('#motion-listen')?.addEventListener('click',()=>{playVoice(new URL(`../audio/${subject==='english'?'en':'yue'}/actions/${command()}.wav`,import.meta.url)).then(ok=>{if(!ok)status('指令聲音未能播放，可以跟住圖示同家長一齊做。');});});
  root.querySelector('#motion-next')?.addEventListener('click',()=>{if(!live)return;const wasFamily=state.inputMode==='family';if(state.round===sequence.length-1){live=false;stop();finish();return;}state.round++;state.roundDone=false;state.motionAttempts=0;save();if(wasFamily)family();else launch();});
 }
 function progress(value){const bar=root.querySelector('.motion-progress');bar.setAttribute('aria-valuenow',String(Math.round(value*100)));bar.firstElementChild.style.width=value*100+'%';}
 function success(){if(mode==='success'||!live)return;stop();mode='success';state.roundDone=true;save();pause('motion-transition');render();progress(1);}
 async function launch(){
  stop();const attempt=request;mode='loading';commandStarted=false;attemptTime=0;lastPoseTime=null;tracker.command=null;tracker.clearAction();pause('motion-setup');pause('motion-transition');render();
  try{
   await poseCamera.start(root.querySelector('video'),(poses,time)=>{
    if(!live||attempt!==request)return;const result=tracker.update(poses,time);
    if(!commandStarted&&result.status==='ready'){tracker.setCommand(command());commandStarted=true;mode='camera';root.querySelector('.motion-stage').classList.add('scene-running');state.inputMode='camera';save();resume('motion-setup');resume('motion-transition');status('準備好啦，'+labels[command()]+'。');return;}
    if(!commandStarted){progress(result.progress);status(poseMessages[result.status]||'企定一陣，準備開始。');return;}
    if(result.status==='success'){success();return;}
    // One attempt is eight seconds of visible, confidently tracked movement.
    // Missing people/confidence or long frame gaps never count as a failed attempt.
    if(result.status==='tracking'){
     if(lastPoseTime!==null&&time-lastPoseTime>0&&time-lastPoseTime<=350)attemptTime+=time-lastPoseTime;
     lastPoseTime=time;
     if(attemptTime>=8000){state.motionAttempts++;attemptTime=0;save();if(state.motionAttempts>=3)root.querySelector('#motion-family')?.classList.add('motion-help-highlight');}
    }else{lastPoseTime=null;attemptTime=0;}
    progress(result.progress);status(poseMessages[result.status]||'跟住示範，'+labels[command()]+'。');
   },()=>{if(live&&attempt===request){stop();mode='paused';render();status('鏡頭未能繼續，請再試或同家長一齊做。');pause('motion-setup');}});
  }catch{if(live&&attempt===request){stop();mode='paused';render();status('未能使用鏡頭，可以同家長一齊做。');}}
 }
 function family(){
  stop();mode='family';state.inputMode='family';save();remaining=5000;resume('motion-setup');resume('motion-transition');render();
  const button=root.querySelector('#motion-hold'),count=root.querySelector('.motion-countdown');
  const release=()=>{holdStart=null;holdPointer=null;progress(0);};
  button.onpointerdown=e=>{if(button.disabled||e.button!==0||holdPointer!==null)return;holdPointer=e.pointerId;button.setPointerCapture(e.pointerId);holdStart=performance.now();};
  button.onpointerup=release;button.onpointercancel=release;button.onlostpointercapture=release;button.onblur=release;
  button.onkeydown=e=>{if(!button.disabled&&!e.repeat&&(e.key===' '||e.key==='Enter')){e.preventDefault();holdStart=performance.now();}};button.onkeyup=release;
  const tick=now=>{if(!live||mode!=='family'||document.hidden)return;const elapsed=last===null?0:Math.min(now-last,100);last=now;if(remaining>0){remaining=Math.max(0,remaining-elapsed);count.textContent=String(Math.ceil(remaining/1000));if(!remaining){button.disabled=false;button.textContent='做到啦 · 長按三秒';count.textContent='好！';}}
   if(holdStart!==null){progress(Math.min(1,(now-holdStart)/3000));if(now-holdStart>=3000){success();return;}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);
 }
 const background=()=>{if(document.hidden&&mode!=='success'){stop();tracker.reset();mode='paused';pause('motion-setup');render();}};
 document.addEventListener('visibilitychange',background);pause('motion-setup');render();
 return()=>{live=false;stop();document.removeEventListener('visibilitychange',background);};
}
