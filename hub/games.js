import {mountArt} from './modules/art.js';
import {mountMusic} from './modules/music.js';
import {mountHumanities} from './modules/humanities.js';
import {mountGeneral} from './modules/general.js';
import {mountMath} from './modules/math.js';
import {mountComputing} from './modules/computing.js';
import {mountMandarin} from './modules/mandarin.js';
import {prepareGameState} from '../shared/game-state.js';
import {CHARACTERS,tracePass} from '../shared/core.js';
import {icon,escapeHTML} from '../shared/icons.js';
import {CONFIG} from '../shared/config.js';
const items={water:'水',apple:'蘋果',leaf:'菜葉',sleep:'枕頭',umbrella:'傘',hat:'帽',coat:'外套',bath:'浴盆',circle:'圓形',square:'正方形',triangle:'三角形'};
const char=(name,cls='companion')=>`<img class="character ${cls}" src="img/chars/${name}.png" alt="${name.startsWith('xiaolian')?'小蓮':name.startsWith('xiaozhi')?'小志':'小龍'}">`;
export function mountGame(root,zone,state,save,finish,lifecycle={}){
 if(['mandarin','computing','math','general','humanities','music','art'].includes(zone.id)){
  const prepared=prepareGameState({game:state,complete:false},2);
  if(prepared.state!==state){for(const key of Object.keys(state))delete state[key];Object.assign(state,prepared.state);save();}
  const mount={mandarin:mountMandarin,computing:mountComputing,math:mountMath,general:mountGeneral,humanities:mountHumanities,music:mountMusic,art:mountArt}[zone.id];
  const cleanup=mount(root,state,save,finish,lifecycle);
  if(prepared.reset){const note=document.createElement('p');note.className='notice';note.textContent='呢科已更新玩法，今次由第一回合開始，之前累積時間已保留。';root.prepend(note);}
  return cleanup;
 }
 let active=true,selected=null,ghost=null,cancelAnimation=()=>{},timers=[],listeners=[],audioContext=null,currentAudio=null;
 const later=(fn,ms)=>{let t=setTimeout(()=>{if(active)fn();},ms);timers.push(t);return t;};
 const on=(node,event,fn,opts)=>{if(!node)return;node.addEventListener(event,fn,opts);listeners.push(()=>node.removeEventListener(event,fn,opts));};
 const cleanupView=()=>{timers.forEach(clearTimeout);timers=[];listeners.forEach(f=>f());listeners=[];cancelAnimation();ghost?.remove();ghost=null;currentAudio?.pause();};
 const feedback=text=>{const n=root.querySelector('.feedback');if(n)n.textContent=text;};
 const rounds=zone.id==='humanities'||zone.id==='computing'?2:3;
 state.round??=0;state.step??=0;
 if(zone.id==='science'&&!state.scenarios){state.scenarios=['thirst','hungry','tired','mud'].sort(()=>Math.random()-.5).slice(0,3);save();}
 const dots=()=>`<div class="rounds" aria-label="第 ${state.round+1} 回合，共 ${rounds} 回合">${Array.from({length:rounds},(_,i)=>`<span class="round-dot ${i<=state.round?'done':''}"></span>`).join('')}</div>`;
 function frame(title,content){cleanupView();selected=null;root.innerHTML=`${dots()}<div class="game-instruction">${title}</div>${content}<p class="feedback" role="status" aria-live="polite"></p>`;}
 function scene({need='',pose='dino-baby',companion=zone.companion,props=[],extra=''}={}){return `<div class="stage">${companion?char(companion):''}<button class="dino-target" data-target="dino" aria-label="照顧小龍">${char(pose,'dino')}${need?`<span class="need">${need}</span>`:''}<span class="props">${props.map(p=>icon(p,p==='hat'?'hat-prop':'')).join('')}</span></button>${extra}</div>`;}
 const choices=(list)=>`<div class="choices">${list.map((item,i)=>`<button class="choice" data-item="${item}" data-index="${i}" aria-label="${items[item]||item}">${icon(item)}</button>`).join('')}</div>`;
 function bindChoices(accept,target='dino'){
 const targetNode=root.querySelector(`[data-target="${target}"]`);let suppressClick=false;
 for(const btn of root.querySelectorAll('[data-item]')){
 const choose=()=>{selected={item:btn.dataset.item,index:Number(btn.dataset.index),btn};root.querySelectorAll('.choice').forEach(n=>n.classList.remove('chosen'));btn.classList.add('chosen');targetNode?.classList.add('selected-target');};
 on(btn,'click',()=>{if(suppressClick){suppressClick=false;return;}choose();});
 let start=null,moved=false;
 on(btn,'pointerdown',e=>{if(e.button!==0)return;choose();start=[e.clientX,e.clientY];moved=false;btn.setPointerCapture(e.pointerId);});
 on(btn,'pointermove',e=>{if(!start)return;if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>9){moved=true;if(!ghost){ghost=document.createElement('div');ghost.className='drag-ghost';ghost.innerHTML=icon(btn.dataset.item);document.body.append(ghost);}ghost.style.left=e.clientX+'px';ghost.style.top=e.clientY+'px';}});
 on(btn,'pointerup',e=>{if(!start)return;start=null;ghost?.remove();ghost=null;if(moved){suppressClick=true;const hit=document.elementFromPoint(e.clientX,e.clientY);if(hit?.closest(`[data-target="${target}"]`))deliver();}});
 on(btn,'pointercancel',()=>{start=null;ghost?.remove();ghost=null;selected=null;btn.classList.remove('chosen');targetNode?.classList.remove('selected-target');});
 }
 function deliver(){if(!selected){feedback('先揀一樣，再點小龍。');return;}const s=selected;selected=null;s.btn.classList.remove('chosen');targetNode?.classList.remove('selected-target');accept(s.item,s.index,s.btn);}
 on(targetNode,'click',deliver);
 }
 function roundDone(message,pose='dino-baby',extra=''){
 state.roundDone=true;state.message=message;save();
 frame('照顧好小龍啦！',`<div class="round-celebrate">${scene({pose,extra})}<p class="game-instruction">${escapeHTML(message)}</p><div class="actions"><button class="primary" id="next-round">${state.round===rounds-1?'完成照顧任務':'繼續照顧'}</button></div></div>`);
 root.querySelector('.dino-target')?.classList.add('is-happy');
 if(zone.id==='art'&&state.round===2){const stage=root.querySelector('.round-celebrate');stage.classList.add('bridge-complete');stage.insertAdjacentHTML('afterbegin',`<div class="finished-stones" aria-label="彩色踏石橋">${(state.colors||[]).map(c=>`<span style="background:${c}"></span>`).join('')}</div>`);root.querySelector('.dino-target')?.classList.add('crossing-home');}
 on(root.querySelector('#next-round'),'click',()=>{if(state.round===rounds-1){finish();return;}state.round++;state.step=0;state.roundDone=false;delete state.used;delete state.observed;delete state.painted;delete state.stroke;delete state.peWait;delete state.paintCells;save();render();});
 }
 function careGame(){
 let expected,need,title,options,props=[],pose='dino-baby';
 if(zone.id==='english'||zone.id==='mandarin'){
 const list=zone.id==='english'?['water','apple','sleep']:['umbrella','apple','sleep'];expected=list[state.round];need=icon(expected);title='聽一聽，再照顧小龍';options=list;pose=expected==='apple'?'dino-baby-eat':'dino-baby';
 }else if(zone.id==='general'){
 const actions=[['hat','water'],['umbrella'],['coat']][state.round];expected=actions[state.step];props=actions.slice(0,state.step);need=icon(['sun','rain','cold'][state.round]);title=['太陽出嚟，點樣照顧小龍？','落雨啦，幫小龍避雨。','凍風吹，幫小龍保暖。'][state.round];options=['hat','umbrella','water','coat'];
 }else if(zone.id==='science'){
 const sc=state.scenarios[state.round];expected={thirst:'water',hungry:'apple',tired:'sleep',mud:'bath'}[sc];need=icon({thirst:'water',hungry:'apple',tired:'sleep',mud:'mud'}[sc]);title={thirst:'小龍喘氣，點一點睇清楚。',hungry:'小龍肚仔叫，點一點睇清楚。',tired:'小龍打呵欠，點一點睇清楚。',mud:'小龍沾咗泥，點一點睇清楚。'}[sc];options=['water','apple','sleep','bath'];
 }else if(zone.id==='computing'){
 expected=state.round===0?'water':['water','leaf'][state.step];need=state.round===0?icon('water'):`${icon('water')}${state.step===0?' → ': ' ✓ → '}${icon('leaf')}`;title=state.round===0?'小龍口渴，先幫佢飲水。':'先飲水，再食菜。';options=['water','leaf','sleep'];props=state.step?['water']:[];
 }
 frame(title,scene({need,pose,props})+choices(options)+(zone.id==='english'||zone.id==='mandarin'?'<div class="sound-row"><button id="listen">'+icon('ear')+' 再聽一次</button><p class="subtle">睇圖提示，都可以照顧小龍。</p></div>':''));
 if(zone.id==='science'){
 const clue=root.querySelector('.need');clue.setAttribute('role','button');clue.setAttribute('tabindex','0');clue.setAttribute('aria-label','觀察線索');if(state.observed)clue.classList.add('observed');
 const observe=e=>{e.stopPropagation();state.observed=true;clue.classList.add('observed');save();feedback('睇清楚啦，揀一樣幫小龍。');};on(clue,'click',observe);on(clue,'keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();observe(e);}});
 }
 bindChoices(item=>{
 if(zone.id==='science'&&!state.observed){feedback('先點小龍旁邊嘅線索，睇清楚先。');return;}
 if(item!==expected){feedback('再睇一睇小龍需要咩，試多次。');return;}
 state.step++;save();if(zone.id==='general'&&state.round===0&&state.step<2||zone.id==='computing'&&state.round===1&&state.step<2){careGame();feedback(zone.id==='general'?'戴好帽啦，再飲啲水。':'飲咗水，輪到食菜啦！');return;}
 let message={water:'飲到清水，小龍唔口渴啦！',apple:'食到水果，小龍精神返！',sleep:'有枕頭，小龍安心休息。',umbrella:'有傘遮雨，小龍保持乾爽！',hat:'戴好帽，小龍涼快啦！',coat:'着好外套，小龍暖笠笠！',bath:'沖乾淨，小龍舒服晒！',leaf:'先飲水後食菜，小龍學識次序！'}[expected];
 if(zone.id==='general'&&state.round===0)message='戴好帽、飲過水，小龍涼快啦！';roundDone(message,expected==='sleep'?'dino-baby-sleep':expected==='apple'?'dino-baby-eat':'dino-baby');
 });
 if(zone.id==='english'||zone.id==='mandarin'){
 const play=()=>{if(!CONFIG.audioApproved){feedback('跟住圖示，幫小龍揀需要嘅嘢。');return;}let lang=zone.id==='english'?'en':'zh-CN';currentAudio=new Audio(`audio/${lang}/${expected}.mp3`);currentAudio.play().catch(()=>feedback('暫時未能播放，請跟圖示繼續。'));};on(root.querySelector('#listen'),'click',play);if(CONFIG.audioApproved)later(play,200);
 }
 }
 function mathGame(){let count=[1,3,5][state.round];state.used??=[];const all=['apple','leaf','apple','apple','leaf','apple','apple'];
 frame(`要 ${count} 個蘋果，逐粒餵小龍。`,scene({pose:'dino-baby-eat',need:`${icon('apple')}<strong>${state.used.length}／${count}</strong>`})+choices(all));
 root.querySelectorAll('[data-index]').forEach(b=>{if(state.used.includes(Number(b.dataset.index))){b.classList.add('used');b.disabled=true;}});
 bindChoices((item,index)=>{if(state.used.includes(index))return;if(item!=='apple'){feedback('今次小龍想食蘋果，再揀一揀。');return;}state.used.push(index);save();if(state.used.length===count)roundDone(`數到 ${count} 個，份量啱啱好！`,'dino-baby-eat');else{mathGame();feedback(String(state.used.length)+'，再餵一粒。');}});
 }
 function chineseGame(){const c=CHARACTERS[state.round];state.stroke??=0;const path=c.paths[state.stroke];
 frame(`跟住金色筆順寫「${c.char}」`,`<div class="trace-layout"><div class="trace-side">${char('xiaolian-write')}<p>由綠點出發<br>跟金線慢慢寫</p></div><svg class="trace-board" viewBox="0 0 300 300" aria-label="描寫${c.char}，第${state.stroke+1}筆"><path class="gridline" d="M150 0V300M0 150H300M0 0L300 300M300 0L0 300"/>${c.paths.map((p,i)=>`<polyline class="guide ${i<state.stroke?'passed':i===state.stroke?'current':''}" points="${p.map(q=>q.join(',')).join(' ')}"/>`).join('')}<circle class="start" cx="${path[0][0]}" cy="${path[0][1]}" r="10"/><polyline class="ink" points=""/><circle class="demonstrator" r="8"/></svg><div class="trace-side">${char('dino-baby','character')}<p>第 ${state.stroke+1} 筆／${c.paths.length} 筆</p></div></div><div class="sound-row"><button id="stroke-demo">再睇一次筆順</button></div>`);
 const svg=root.querySelector('svg.trace-board'),ink=svg.querySelector('.ink'),dot=svg.querySelector('.demonstrator');let points=null,pointer=null;
 const pos=e=>{let r=svg.getBoundingClientRect();return [(e.clientX-r.left)/r.width*300,(e.clientY-r.top)/r.height*300];};
 const demo=()=>{cancelAnimation();let start=performance.now(),lengths=[0];for(let i=1;i<path.length;i++)lengths.push(lengths.at(-1)+Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]));let raf;dot.style.display='';const tick=t=>{let n=Math.min(1,(t-start)/1800)*lengths.at(-1),i=1;while(i<lengths.length-1&&n>lengths[i])i++;let f=(n-lengths[i-1])/(lengths[i]-lengths[i-1]);dot.setAttribute('cx',path[i-1][0]+(path[i][0]-path[i-1][0])*f);dot.setAttribute('cy',path[i-1][1]+(path[i][1]-path[i-1][1])*f);if(n<lengths.at(-1))raf=requestAnimationFrame(tick);else dot.style.display='none';};raf=requestAnimationFrame(tick);cancelAnimation=()=>{cancelAnimationFrame(raf);dot.style.display='none';};};
 on(root.querySelector('#stroke-demo'),'click',demo);demo();
 on(svg,'pointerdown',e=>{if(pointer!==null)return;pointer=e.pointerId;svg.setPointerCapture(pointer);cancelAnimation();points=[pos(e)];ink.setAttribute('points',points.map(p=>p.join(',')).join(' '));});
 on(svg,'pointermove',e=>{if(pointer!==e.pointerId||!points)return;for(const ev of e.getCoalescedEvents?.()||[e])points.push(pos(ev));ink.setAttribute('points',points.map(p=>p.join(',')).join(' '));});
 on(svg,'pointerup',e=>{if(pointer!==e.pointerId||!points)return;points.push(pos(e));pointer=null;if(tracePass(points,path)){state.stroke++;save();if(state.stroke===c.paths.length)roundDone(c.reward);else chineseGame();}else{points=null;ink.setAttribute('points','');feedback('由綠點開始，跟住金線方向，試多次。');demo();}});on(svg,'pointercancel',()=>{pointer=null;points=null;ink.setAttribute('points','');});
 }
 function humanitiesGame(){
 const turn=state.round===0?'dino':state.step===0?'child':'dino';
 frame(state.round===0?'小龍未有水果，分享一個畀佢。':state.step===0?'輪流攞水果：今次先畀小蓮。':'輪到小龍啦，遞個水果畀佢。',`<div class="stage"><button class="dino-target" data-target="child" aria-label="分享給小蓮">${char('xiaolian-highfive')}${state.round===0||state.step===1?'<span class="need">'+icon('apple')+'</span>':''}</button><button class="dino-target" data-target="dino" aria-label="分享給小龍">${char('dino-baby')}</button></div>`+choices(['apple','leaf']));
 bindChoices(item=>{if(item!=='apple'){feedback('分享水果，試下揀蘋果。');return;}if(state.round===1&&state.step===0){state.step=1;save();humanitiesGame();return;}roundDone(state.round===0?'小龍有水果啦，多謝你分享！':'一人一個，輪流分享，大家都開心！');},turn);
 on(root.querySelector(`[data-target="${turn==='dino'?'child':'dino'}"]`),'click',()=>feedback(turn==='dino'?'今次輪到小龍。':'今次輪到小蓮。'));
 }
 function artGame(){state.color??='#e5bc5d';state.paintCells??=[];const shape=['circle','square','triangle'][state.round];
 frame(state.painted?'揀返一樣形狀，鋪入河上缺口。':'揀隻顏色，用手指搽踏石。',`<div class="stage">${char('xiaolian-color')}<div class="paint-stone" aria-label="手指塗色踏石"><svg viewBox="0 0 100 100"><defs><clipPath id="paint-clip">${shape==='circle'?'<circle cx="50" cy="50" r="43"/>':shape==='square'?'<rect x="8" y="8" width="84" height="84" rx="8"/>':'<path d="M50 7L94 90H6Z"/>'}</clipPath></defs><g clip-path="url(#paint-clip)"><rect width="100" height="100" fill="#e5e5d5"/><g id="paint-dots">${state.paintCells.map(c=>`<rect x="${c%5*20}" y="${Math.floor(c/5)*20}" width="21" height="21" fill="${state.color}"/>`).join('')}</g></g></svg></div><div class="river">${[0,1,2].map((n)=>`<div class="bridge-slot ${n<state.round?'filled':''}" ${n===state.round?'data-target="bridge"':''} style="--stone-color:${state.colors?.[n]||'#e5bc5d'}">${icon(['circle','square','triangle'][n])}</div>`).join('')}</div></div>${state.painted?choices(['triangle','circle','square']):'<div class="choices">'+['#e5bc5d','#78a572','#dc927c'].map(c=>`<button class="swatch ${c===state.color?'chosen':''}" data-color="${c}" style="background:${c}" aria-label="${c==='#e5bc5d'?'金黃色':c==='#78a572'?'綠色':'珊瑚色'}"></button>`).join('')+'</div>'}`);
 if(state.painted){bindChoices(item=>{if(item!==shape){feedback('睇清楚個缺口，揀一樣嘅形狀。');return;}state.colors??=[];state.colors[state.round]=state.color;save();roundDone(state.round===2?'彩色石橋鋪好，小龍安全返屋企！':'鋪好一粒，條路更安全啦！');},'bridge');return;}
 for(const b of root.querySelectorAll('[data-color]'))on(b,'click',()=>{state.color=b.dataset.color;save();artGame();});
 let pointer=null;const box=root.querySelector('.paint-stone');const paint=e=>{let r=box.getBoundingClientRect(),x=Math.max(0,Math.min(4,Math.floor((e.clientX-r.left)/r.width*5))),y=Math.max(0,Math.min(4,Math.floor((e.clientY-r.top)/r.height*5))),cell=y*5+x;if(!state.paintCells.includes(cell)){state.paintCells.push(cell);root.querySelector('#paint-dots').insertAdjacentHTML('beforeend',`<rect x="${x*20}" y="${y*20}" width="21" height="21" fill="${state.color}"/>`);save();}};
 on(box,'pointerdown',e=>{pointer=e.pointerId;box.setPointerCapture(pointer);paint(e);});on(box,'pointermove',e=>{if(pointer===e.pointerId)paint(e);});on(box,'pointerup',()=>{pointer=null;if(state.paintCells.length>=8){state.painted=true;save();artGame();}else feedback('再搽多啲，幫踏石着靚衫。');});on(box,'pointercancel',()=>{pointer=null;});
 }
 function musicGame(){let sequence=[[0,1],[1,0],[0,2,1]][state.round],expected=0,listening=true;
 frame('先睇燈，再跟住拍。',scene()+`<div class="choices">${Array.from({length:state.round===2?3:2},(_,i)=>`<button class="drum" data-drum="${i}" aria-label="第${i+1}面鼓">${icon('drum')}</button>`).join('')}</div><div class="sound-row"><button id="replay-rhythm">再睇一次</button><button id="mute-rhythm" aria-pressed="${!!state.muted}">${state.muted?'開聲':'靜音'}</button></div>`);
 const drums=[...root.querySelectorAll('[data-drum]')];
 const tone=i=>{if(state.muted)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.frequency.setValueAtTime([180,240,320][i],audioContext.currentTime);g.gain.setValueAtTime(.15,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.18);o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+.2);}catch{}};
 const flash=i=>{drums[i].classList.add('lit');tone(i);later(()=>drums[i]?.classList.remove('lit'),400);};
 const play=()=>{timers.forEach(clearTimeout);timers=[];expected=0;listening=true;drums.forEach(b=>{b.disabled=true;b.classList.remove('lit');});feedback('望住邊面鼓發光。');sequence.forEach((v,i)=>later(()=>flash(v),450+i*750));later(()=>{listening=false;drums.forEach(b=>b.disabled=false);feedback('輪到你啦！');},sequence.length*750+500);};
 drums.forEach((b,i)=>on(b,'click',()=>{if(listening)return;flash(i);if(i!==sequence[expected]){feedback('唔緊要，再睇一次。');listening=true;later(play,800);return;}expected++;if(expected===sequence.length){listening=true;later(()=>roundDone('跟住節奏，小龍安心啦！'),500);}}));
 on(root.querySelector('#replay-rhythm'),'click',play);on(root.querySelector('#mute-rhythm'),'click',()=>{state.muted=!state.muted;save();let b=root.querySelector('#mute-rhythm');b.textContent=state.muted?'開聲':'靜音';b.setAttribute('aria-pressed',String(state.muted));});on(document,'visibilitychange',()=>{if(document.hidden){timers.forEach(clearTimeout);timers=[];listening=true;drums.forEach(b=>b.disabled=true);}else play();});play();
 }
 function peGame(){const names=['伸懶腰','原地踏步','輕輕跳'],poses=['xiaozhi-stretch','xiaozhi-step','xiaozhi-jump'];let remaining=5,holdStart=null,raf=0,last=performance.now();
 frame(`一齊${names[state.round]}，先做 5 秒。`,scene({companion:poses[state.round],extra:'<strong class="countdown" aria-live="polite">5</strong>'})+'<div class="actions"><button class="hold-button" disabled>倒數完，再長按「做到啦」</button></div><p class="subtle" style="text-align:center;margin-top:14px">iPad 放穩，家長陪住郁一郁。</p>');
 const button=root.querySelector('.hold-button'),count=root.querySelector('.countdown');
 const release=()=>{holdStart=null;button.style.setProperty('--hold','0%');};
 const tick=t=>{const dt=document.hidden?0:Math.min(t-last,250);last=t;if(remaining>0){remaining=Math.max(0,remaining-dt/1000);count.textContent=String(Math.ceil(remaining));if(!remaining){button.disabled=false;button.textContent='做到啦 · 長按 3 秒';count.textContent='好！';}}if(holdStart!==null&&!document.hidden){let elapsed=t-holdStart;button.style.setProperty('--hold',Math.min(100,elapsed/30)+'%');if(elapsed>=3000){release();roundDone('一齊郁身，小龍有氣力啦！');return;}}raf=requestAnimationFrame(tick);};raf=requestAnimationFrame(tick);cancelAnimation=()=>cancelAnimationFrame(raf);
 on(button,'pointerdown',e=>{if(button.disabled||e.button!==0)return;button.setPointerCapture(e.pointerId);holdStart=performance.now();});on(button,'pointerup',release);on(button,'pointercancel',release);on(button,'lostpointercapture',release);on(button,'keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat&&!button.disabled){e.preventDefault();holdStart=performance.now();}});on(button,'keyup',release);on(button,'blur',release);on(document,'visibilitychange',release);
 }
 function render(){if(state.roundDone){roundDone(state.message||'小龍得到照顧啦！');return;}switch(zone.id){case'chinese':chineseGame();break;case'math':mathGame();break;case'humanities':humanitiesGame();break;case'art':artGame();break;case'music':musicGame();break;case'pe':peGame();break;default:careGame();}}
 render();return ()=>{active=false;cleanupView();audioContext?.close();};
}
