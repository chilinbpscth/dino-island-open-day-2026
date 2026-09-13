import {certificateLink} from '../shared/certificate-link.js';
const ZONES=['chinese','english','mandarin','math','general','science','humanities','art','music','pe'];
export function loadBatch(id=crypto.randomUUID(),zoneMs=1000){
 if(!/^[0-9a-f-]{36}$/.test(id))throw Error('批次 ID 格式不正確');
 if(!Number.isSafeInteger(zoneMs)||zoneMs<1||zoneMs>240000)throw Error('測試站時間須為 1 至 240000 毫秒');
 return {batchId:id,zoneMs,clients:Array.from({length:10},(_,i)=>({id:`load-${id}-${i+1}`,requestId:`load-cert-${id}-${i+1}`,name:`負載測試${String(i+1).padStart(2,'0')}`,version:2,status:'pending'}))};
}
export async function runLoad(report,rpcs,publicRpc,image,endpoint,update=()=>{}){
 const zones=n=>Object.fromEntries(ZONES.slice(0,n).map(id=>[id,report.zoneMs]));
 const send=(i,version,count)=>rpcs[i]('savePlayer',{requestId:`${report.clients[i].id}:${version}`,player:{id:report.clients[i].id,name:report.clients[i].name,version,zones:zones(count)}});
 report.phase='preparing';report.startedAt=new Date().toISOString();report.imageBytes=Math.floor(image.split(',')[1].length*3/4);report.pollErrors=[];update(report);
 report.preparationMode='Sequential connection warmup; measured score/photo burst remains parallel';
 for(const [i,client] of report.clients.entries()){try{await send(i,1,9);client.status='prepared';}catch(e){client.status='prepare-failed';client.error=e.message;}update(report);}
 if(report.clients.some(c=>c.status!=='prepared')){report.phase='preparation-failed';update(report);return report;}
 try{const board=await publicRpc('getBoard');if(board.players.some(p=>!report.clients.some(c=>c.id===p.id)&&p.totalMs<=10*report.zoneMs))throw Error('現有名次會遮住測試紀錄，不能量度十行上榜；請先清理測試資料或用更短合成時間建立新批次');}catch(e){report.phase='preparation-failed';report.pollErrors.push(e.message);update(report);return report;}
 const started=performance.now();report.phase='running';update(report);
 const poll=async()=>{
  while(performance.now()-started<60000){
   try{const board=await publicRpc('getBoard');for(const client of report.clients){const row=board.players.find(p=>p.id===client.id);if(row&&row.zonesCompleted===10&&row.totalMs===10*report.zoneMs&&client.boardMs===undefined)client.boardMs=Math.round(performance.now()-started);}}catch(e){report.pollErrors.push(e.message);}
   update(report);if(report.clients.every(c=>c.boardMs!==undefined))return;
   const elapsed=performance.now()-started,nextTick=(Math.floor(elapsed/5000)+1)*5000;
   await new Promise(resolve=>setTimeout(resolve,nextTick-elapsed));
  }
 };
 await Promise.all([poll(),Promise.all(report.clients.map(async(client,i)=>{
  try{
   const accepted=await send(i,2,10);if(accepted.acceptedVersion<2)throw Error('成績未被確認');client.scoreMs=Math.round(performance.now()-started);client.status='score-saved';update(report);
   const uploadStart=performance.now();const result=await rpcs[i]('uploadCertificate',{playerId:client.id,version:2,requestId:client.requestId,image},60000);
   const url=certificateLink(result,endpoint);client.uploadMs=Math.round(performance.now()-uploadStart);client.expiresAt=result.expiresAt;client.status='uploaded';update(report);
   const downloaded=await publicRpc('getCertificate',{token:new URL(url).searchParams.get('token')});
   if(downloaded.image!==image||downloaded.expiresAt!==result.expiresAt)throw Error('下載證書內容或期限不一致');client.status='verified';
  }catch(e){client.status='failed';client.error=e.message;}update(report);
 }))]);
 const within=key=>report.clients.filter(c=>Number.isFinite(c[key])&&c[key]<=10000).length;
 report.phase='complete';report.summary={verified:report.clients.filter(c=>c.status==='verified').length,boardWithin10s:within('boardMs'),uploadWithin10s:within('uploadMs'),sampleCount:10,target:'95% within 10 seconds; with 10 samples this requires all 10',passed:report.clients.every(c=>c.status==='verified')&&within('boardMs')===10&&within('uploadMs')===10};
 report.limitations=['Ten separate browser bridge connections share one saved device credential and one computer/network; not ten physical iPads.','One burst of ten small synthetic certificates is not a statistically representative 95th percentile or maximum-size photo test.','Polling uses five-second intervals with no overlapping board requests; cold bridge preparation is excluded.','No automatic retries in measured burst. Retrying the same batch reuses IDs but is a recovery check, not a new timing sample.'];
 update(report);return report;
}
