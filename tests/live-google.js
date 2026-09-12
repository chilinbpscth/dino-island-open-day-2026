import {GoogleBridge} from '../shared/network.js';
export const LIVE_URL_RE=/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/;
const ZONES=['math','chinese','english','mandarin','general','science','humanities','art','music','pe','computing'];
export function createRpc(url,token=''){
 const bridge=new GoogleBridge(url);
 const rpc=(method,payload={},timeout)=>bridge.call(method,['getBoard','getCertificate'].includes(method)?payload:{...payload,deviceToken:token},timeout);
 rpc.destroy=()=>bridge.destroy();return rpc;
}
export async function runAcceptance(rpc,onProgress=()=>{}){
 const playerId=`live-${crypto.randomUUID()}`,name=`測試${Math.floor(Math.random()*10000)}`;
 const report={playerId,name,results:[],passed:false,unverified:false};
 const send=(version,zones)=>rpc('savePlayer',{requestId:`${playerId}:${version}`,player:{id:playerId,name,version,zones}});
 const check=(name,pass,detail)=>{report.results.push({name,status:pass===null?'unverified':pass?'pass':'fail',detail});onProgress(report);};
 const zones=count=>Object.fromEntries(ZONES.slice(0,count).map(id=>[id,id==='math'?240000:1000]));
 onProgress(report); // Show the ID before writing, including when a later request fails.
 let r=await send(1,{math:240000});
 check('240000ms 接受',r.score===1&&r.totalMs===240000,`站數 ${r.score}，時間 ${r.totalMs}ms`);
 let rejected=false;
 try{await send(2,{english:240001});}catch(e){if(!e.message.includes('站點時間不正確'))throw e;rejected=true;}
 check('240001ms 拒絕',rejected,rejected?'收到站點時間驗證錯誤':'後台未拒絕超時紀錄');
 r=await send(3,{math:1});
 check('已完成站時間不可重寫',r.score===1&&r.totalMs===240000,`站數 ${r.score}，時間 ${r.totalMs}ms`);
 r=await send(4,zones(6));const six=await rpc('getBoard');
 check('六站未進排名',r.score===6&&r.totalMs===245000&&six.exploring>=1&&!six.players.some(p=>p.id===playerId),`本人 ${r.score} 站；探索中 ${six.exploring} 位（榜只提供合計人數）`);
 r=await send(5,zones(10));
 check('十站完成紀錄',r.score===10&&r.totalMs===249000,`站數 ${r.score}，時間 ${r.totalMs}ms`);
 const board=await rpc('getBoard'),ranked=board.players.find(p=>p.id===playerId);
 const outside=!ranked&&board.players.length===10&&board.others>0;
 check('十站排名',ranked?ranked.zonesCompleted===10&&ranked.totalMs===249000:outside?null:false,ranked?'測試紀錄已出現在 Top 10':outside?'Top 10 已滿，需在 Sheets 另行確認測試紀錄':'榜上找不到已完成紀錄');
 r=await send(6,zones(11));
 check('第十一科不增加總分',r.score===10&&r.totalMs===249000,`站數 ${r.score}，時間 ${r.totalMs}ms`);
 report.board={ranked:board.players.length,others:board.others,exploring:board.exploring};
 report.unverified=report.results.some(x=>x.status==='unverified');
 report.passed=report.results.every(x=>x.status==='pass');return report;
}
