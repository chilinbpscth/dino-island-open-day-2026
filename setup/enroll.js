import {read,write} from '../shared/storage.js';
import {bridge} from '../shared/network.js';
import {CONFIG} from '../shared/config.js';
const params=new URLSearchParams(location.hash.slice(1)),deviceToken=params.get('deviceToken'),guide=params.get('guide');
if(deviceToken){
 history.replaceState(null,'',location.pathname+location.search);
 const main=document.querySelector('main');
 main.innerHTML='<p class="eyebrow">佛教志蓮小學 · 智取恐龍島</p><h1>小導師設備準備</h1><p id="enroll-status" role="status"></p><button id="enroll-retry" hidden>再試連接</button><p><a href="../hub/">先入遊戲（未接通時只存本機）</a></p>';
 const status=document.querySelector('#enroll-status'),retry=document.querySelector('#enroll-retry');
 const current=read('settings',{});
 async function enroll(){
  retry.hidden=true;
  if(!/^[\w-]{24,160}$/.test(deviceToken)||!/^([1-9]|1[0-9]|2[0-5])$/.test(guide||'')){status.textContent='準備連結不完整，請重新開老師提供嘅入口。';return;}
  if(current.deviceToken&&current.deviceToken!==deviceToken){status.textContent='呢部 iPad 已有連接設定'+(current.guideNumber?'（'+current.guideNumber+' 號小導師）':'')+'。請沿用本機設定入遊戲；如揀錯學號，請老師處理。';return;}
  status.textContent=guide+' 號小導師，正在確認後台連接…';
  try{
   const result=await bridge.call('verifyDevice',{deviceToken});if(result?.ok!==true)throw Error('未收到確認');
   write('settings',{...current,appScriptUrl:CONFIG.appScriptUrl,deviceToken,guideNumber:Number(guide)});
   status.textContent=guide+' 號已接通，正在開遊戲…';location.replace('../hub/');
  }catch{status.textContent='連接未完成，請保持上網，再撳一次。原有遊戲進度仍保留。';retry.hidden=false;bridge.destroy();}
 }
 retry.onclick=enroll;enroll();
}
