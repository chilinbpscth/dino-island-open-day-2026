import {GoogleBridge} from '../shared/network.js';
import {CONFIG} from '../shared/config.js';
import {certificateLink} from '../shared/certificate-link.js';
// Deliberately read both generations without updating or deleting either one.
// Only the visible participant explicitly confirmed by the teacher is submitted.
const prefixes=['dino-island-open-day-20260913:','dino-island-20260913:'];
const read=(key,fallback=null)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const settings=read(prefixes[1]+'settings',{}),bridge=new GoogleBridge(settings.appScriptUrl||CONFIG.appScriptUrl);
const status=document.querySelector('#status'),players=document.querySelector('#players'),qr=document.querySelector('#qr');
const zoneIds=['chinese','english','mandarin','math','general','science','humanities','art','music','pe','computing'];
function photo(prefix,id){return new Promise((resolve,reject)=>{const r=indexedDB.open(prefix+'photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending');r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction('pending'),get=tx.objectStore('pending').get(id);tx.oncomplete=()=>{db.close();resolve(get.result);};tx.onerror=()=>{db.close();reject(tx.error);};};});}
const dataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob);});
let busy=false;
async function show(prefix,p){
 const zones=Object.fromEntries(Object.entries(p.zones||{}).filter(([id,v])=>zoneIds.includes(id)&&v?.complete).slice(0,10).map(([id,v])=>[id,Math.min(240000,Math.max(0,Math.round(v.ms||0)))]));
 const pending=await photo(prefix,p.id),section=document.createElement('section');
 const title=document.createElement('h2');title.textContent=p.name+' · '+Object.keys(zones).length+'／10 分';section.append(title);
 const detail=document.createElement('p');detail.textContent='本機設定：'+(settings.guideNumber||'未標示')+' 號小導師。補領時沿用原有連接，避免將成績轉到另一部設備。';section.append(detail);
 if(!pending?.blob){const note=document.createElement('p');note.textContent='未讀到呢位嘅待傳相片。請保留原遊戲頁，先用「儲存相片證書」保存，唔好清除瀏覽資料。';section.append(note);players.append(section);return;}
 const preview=document.createElement('img');preview.src=URL.createObjectURL(pending.blob);preview.alt='原本待傳嘅相片證書';section.append(preview);
 const save=document.createElement('a');save.href=preview.src;save.download='恐龍島照顧證書.jpg';save.textContent='先儲存呢張證書';section.append(save);
 const label=document.createElement('label'),check=document.createElement('input');check.type='checkbox';label.append(check,document.createTextNode(' 老師確認：以上係今日現場呢位小朋友嘅成績及相片，家長同意上傳合成證書。'));section.append(label);
 const button=document.createElement('button');button.textContent='補傳成績並產生下載碼';button.disabled=true;check.onchange=()=>button.disabled=!check.checked||busy||Object.keys(zones).length<6;section.append(button);
 if(Object.keys(zones).length<6){const note=document.createElement('p');note.textContent='本機未滿 6 分，唔會補加分數。請先完成六科。';section.append(note);}
 button.onclick=async()=>{
  if(busy||!check.checked)return;busy=true;button.disabled=true;qr.replaceChildren();
  try{
   if(!navigator.onLine)throw Error('請先連接 Wi-Fi');
   if(!settings.deviceToken)throw Error('本機未有裝置連接設定，請老師處理');
   if(!Number.isSafeInteger(p.version)||p.version<1)throw Error('本機紀錄版本不完整，請保留原證書');
   status.textContent='正在補傳呢位小朋友嘅完成紀錄…';
   const player={id:p.id,name:p.name,version:p.version,zones,epoch:'open-day-20260913'};
   const accepted=await bridge.call('savePlayer',{deviceToken:settings.deviceToken,player,requestId:p.id+':'+p.version});
   if(accepted?.resetRequired||!Number.isSafeInteger(accepted?.acceptedVersion)||accepted.acceptedVersion<p.version)throw Error('後台未確認完成紀錄，原相片仍保留');
   status.textContent='成績已接收，正在產生下載碼…';
   const receiptKey=prefix+'rescueReceipt:'+p.id;
   let receipt=read(receiptKey);
   if(!receipt){receipt={requestId:pending.requestId||crypto.randomUUID()};localStorage.setItem(receiptKey,JSON.stringify(receipt));}
   const result=await bridge.call('uploadCertificate',{deviceToken:settings.deviceToken,playerId:p.id,version:pending.version||p.version,requestId:receipt.requestId,image:await dataURL(pending.blob),recover:true},60000);
   const link=certificateLink(result,settings.appScriptUrl||CONFIG.appScriptUrl);
   localStorage.setItem(receiptKey,JSON.stringify({...receipt,result}));
   const code=window.qrcode(0,'M');code.addData(link);code.make();qr.innerHTML=code.createSvgTag({cellSize:5,margin:4,scalable:true});
   const caption=document.createElement('p');caption.textContent='家長掃碼儲存證書 · 有效至 '+new Date(result.expiresAt).toLocaleString('zh-HK');qr.append(caption);
   const open=document.createElement('a');open.href=link;open.target='_blank';open.rel='noopener';open.textContent='開啟下載頁';qr.append(open);
   status.textContent='已補領成功。請家長確認手機已儲存證書。原本本機相片及成績仍保留。';
  }catch(e){status.textContent=e.message+'。唔使重玩；原相片仍保留，可以再試。';}
  finally{busy=false;button.disabled=!check.checked;}
 };
 players.append(section);
}
try{let found=0;for(const prefix of prefixes){const p=read(prefix+'player');if(p?.id){found++;await show(prefix,p);}}status.textContent=found?'請核對暱稱、分數及相片，再由老師確認。':'呢個瀏覽器未有本機遊戲紀錄。請喺出錯嗰部 iPad 原本嘅 Safari 開呢條連結。';}catch{status.textContent='未能讀取本機紀錄，請保留原遊戲頁，先儲存證書。';}
