import {GoogleBridge} from '../shared/network.js';
import {CONFIG} from '../shared/config.js';
const prefixes=['dino-island-open-day-20260913:','dino-island-20260913:'];
const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const settings=read(prefixes[1]+'settings',{}),bridge=new GoogleBridge(settings.appScriptUrl||CONFIG.appScriptUrl);
const status=document.querySelector('#status'),players=document.querySelector('#players');
const zoneIds=['chinese','english','mandarin','math','general','science','humanities','art','music','pe','computing'];
let busy=false;
function show(prefix,p){
 const zones=Object.fromEntries(Object.entries(p.zones||{}).filter(([id,v])=>zoneIds.includes(id)&&v?.complete).slice(0,10).map(([id,v])=>[id,Math.min(240000,Math.max(0,Math.round(v.ms||0)))]));
 const count=Object.keys(zones).length,total=Object.values(zones).reduce((a,b)=>a+b,0);
 const section=document.createElement('section'),title=document.createElement('h2');title.textContent=p.name+' · '+count+'／10 分';section.append(title);
 const detail=document.createElement('p');detail.textContent='有效時間 '+String(Math.floor(total/60000)).padStart(2,'0')+':'+String(Math.floor(total/1000)%60).padStart(2,'0')+' · '+(settings.guideNumber||'未標示')+' 號小導師';section.append(detail);
 const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode(' 老師確認：呢份係今日現場小朋友嘅真實成績，唔係之前嘅測試。'));section.append(label);
 const button=document.createElement('button');button.textContent='補傳呢位成績';button.disabled=true;check.onchange=()=>button.disabled=!check.checked||busy;section.append(button);
 button.onclick=async()=>{
  if(busy||!check.checked)return;busy=true;button.disabled=true;
  try{
   if(!navigator.onLine)throw Error('請先連接 Wi-Fi');
   if(!settings.deviceToken)throw Error('本機未有裝置連接設定，請老師處理');
   if(!Number.isSafeInteger(p.version)||p.version<1)throw Error('本機紀錄版本不完整');
   // One explicit recovery, same ID and exact completed-zone times. Never replay
   // old outboxes, invent completion, change device ownership or erase local data.
   const player={id:p.id,name:p.name,version:p.version+1,zones,epoch:'open-day-20260913'};
   status.textContent='正在補傳原有成績，唔使重玩…';
   const accepted=await bridge.call('savePlayer',{deviceToken:settings.deviceToken,player,requestId:p.id+':'+player.version});
   if(accepted?.resetRequired||!Number.isSafeInteger(accepted?.acceptedVersion)||accepted.acceptedVersion<player.version)throw Error('後台未確認收到成績，請保留本機紀錄');
   status.textContent='後台已接收，正在核對排行榜…';
   const data=await bridge.call('getBoard');
   const index=(data.players||[]).findIndex(row=>row.id===p.id&&row.zonesCompleted===10);
   if(count===10&&index<0&&!(data.others>0))throw Error('後台已接收，但排行榜未確認顯示，請再試一次');
   localStorage.setItem(prefix+'rankingRescue:'+p.id,JSON.stringify({version:player.version,confirmedAt:Date.now()}));
   status.textContent=index>=0?'已確認上榜！'+p.name+' · 10 分 · 目前第 '+(index+1)+' 位。電視約 30 秒內更新。':count===10?'成績已接收；排行榜只顯示前十位。':'已補傳 '+count+' 分；完成 10 分先上榜。';
   const next=document.createElement('p');next.textContent='完成本位證書交收後，請用下方「正式遊戲更新入口」開新一位，避免繼續用舊版。';section.append(next);
  }catch(e){status.textContent=e.message+'。原成績及相片仍保留，可以再試。';}
  finally{busy=false;button.disabled=!check.checked;}
 };
 players.append(section);
}
let found=0;for(const prefix of prefixes){const p=read(prefix+'player');if(p?.id){found++;show(prefix,p);}}
status.textContent=found?'核對暱稱、分數及時間，再勾選確認補傳。毋須拍照。':'呢個瀏覽器冇本機紀錄，請喺玩到 10 分嗰部 iPad 原本嘅 Safari 開呢條連結。';
const links=document.createElement('p');
for(const [text,href] of [['開啟正式排行榜','../board/'],['補領相片證書','./rescue.html'],['正式遊戲更新入口（交收後用）','./open-day.html']]){const a=document.createElement('a');a.textContent=text;a.href=href;a.style.display='block';links.append(a);}
document.body.append(links);
