import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';import crypto from 'node:crypto';
const src=readFileSync(new URL('../apps-script/Code.gs',import.meta.url),'utf8');
function env(){const tables={Players:[Array(11).fill('header')],Certificates:[Array(9).fill('header')]};const properties={SPREADSHEET_ID:'test',DEVICE_HASHES:JSON.stringify([crypto.createHash('sha256').update('a'.repeat(30)).digest('hex')]),CERT_SECRET:'secret'};const sheets={};for(const [name,rows]of Object.entries(tables))sheets[name]={getLastRow:()=>rows.length,getLastColumn:()=>rows[0].length,getRange:(row,col,num=1,cols=1)=>({getValues:()=>rows.slice(row-1,row-1+num).map(r=>r.slice(col-1,col-1+cols)),setValues:values=>{values.forEach((v,i)=>{rows[row-1+i]??=[];v.forEach((x,j)=>rows[row-1+i][col-1+j]=x);});},setValue:v=>{rows[row-1][col-1]=v;}})};
 const files=new Map();let fileCounter=0;const fileObject=id=>({getId:()=>id,setSharing(){},getBlob:()=>({getBytes:()=>files.get(id)}),getDateCreated:()=>new Date()});const context=vm.createContext({console,Date,Intl,Set,Number,JSON,Error,Utilities:{DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,s)=>[...crypto.createHash('sha256').update(s).digest()],computeHmacSha256Signature:(s,key)=>[...crypto.createHmac('sha256',key).update(s).digest()],base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url'),base64Encode:bytes=>Buffer.from(bytes).toString('base64'),base64Decode:s=>[...Buffer.from(s,'base64')],newBlob:bytes=>bytes},ScriptApp:{getService:()=>({getUrl:()=> 'https://script.google.com/macros/s/TEST/exec'})},Drive:{Files:{remove:id=>files.delete(id)}},DriveApp:{Access:{PRIVATE:'private'},Permission:{VIEW:'view'},getFolderById:()=>({createFile:bytes=>{const id='file-'+(++fileCounter);files.set(id,bytes);return fileObject(id);},getFiles:()=>{let list=[...files.keys()],at=0;return {hasNext:()=>at<list.length,next:()=>fileObject(list[at++])};}}),getFileById:id=>fileObject(id)},PropertiesService:{getScriptProperties:()=>({getProperty:k=>properties[k]})},SpreadsheetApp:{flush(){},openById:()=>({getSheetByName:n=>sheets[n]})},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})}});vm.runInContext(src,context);return {c:context,tables,files};}
const token='a'.repeat(30),player=(id='player-0001',version=1,zones={})=>({id,name:'小晴',version,zones});
test('Sheet handles are reused while rows are freshly read after another write',()=>{const {c,tables}=env(),open=c.SpreadsheetApp.openById;let opens=0;c.SpreadsheetApp.openById=()=>{opens++;return open();};assert.equal(c.rows_('Players').length,0);c.savePlayer_({deviceToken:token,player:player()});assert.equal(c.rows_('Players').length,1);tables.Players.push([...tables.Players[1]]);assert.equal(c.rows_('Players').length,2);assert.equal(opens,1);});
test('Backend recomputes totals, rejects invalid zones and unauthorized device',()=>{const {c,tables}=env();assert.throws(()=>c.savePlayer_({deviceToken:'wrong',player:player()}));assert.throws(()=>c.savePlayer_({deviceToken:token,player:player('player-0001',1,{fake:10})}));assert.throws(()=>c.savePlayer_({deviceToken:token,player:player('player-0001',1,{math:240001})}));c.savePlayer_({deviceToken:token,player:{...player('player-0001',1,{math:2100}),totalMs:1,zonesCompleted:11,certReady:true}});const p=c.playerFromRow_(tables.Players[1]);assert.equal(p.totalMs,2100);assert.equal(p.zonesCompleted,1);assert.equal(p.certReady,false);});
test('Older updates/retries cannot erase completion, alter first time, or duplicate rows',()=>{const {c,tables}=env();const send=p=>c.savePlayer_({deviceToken:token,player:p});send(player('player-0001',2,{math:3000}));send(player('player-0001',1,{}));send(player('player-0001',2,{math:1}));send(player('player-0001',3,{math:1,english:1000}));assert.equal(tables.Players.length,2);let p=c.playerFromRow_(tables.Players[1]);assert.equal(p.zonesCompleted,2);assert.equal(p.totalMs,4000);});
test('Any 10 of 11 become a full-score result; board keeps top 10 by total time',()=>{const {c,tables}=env();for(let i=0;i<12;i++)c.savePlayer_({deviceToken:token,player:player('player-'+String(i).padStart(4,'0'),1,Object.fromEntries(['english','mandarin','math','general','science','humanities','art','music','pe','computing'].map(id=>[id,1000+i])))});let b=c.getBoard_();assert.equal(b.players.length,10);assert.equal(b.others,2);assert.equal(b.players[0].id,'player-0000');assert.equal(c.playerFromRow_(tables.Players[1]).zonesCompleted,10);});
test('Empty board and certificate tokens expiration handled before file retrieval',()=>{const {c,tables}=env();assert.equal(c.getBoard_().players.length,0);assert.throws(()=>c.getCertificate_('bad'));let t=c.certToken_('request-0001');assert.equal(t,c.certToken_('request-0001'));assert.notEqual(t,c.certToken_('request-0002'));tables.Certificates.push(['request-0001','player-0001',6,'private-id',c.hash_(t),1,2,'ready','device']);assert.throws(()=>c.getCertificate_(t),/已到期/);});

test('Photo certificate upload is idempotent, private token download works, expiry deletes file',()=>{const {c,tables,files}=env();const zones=Object.fromEntries(['chinese','english','mandarin','math','general','science'].map(id=>[id,1000]));c.savePlayer_({deviceToken:token,player:player('player-0001',7,zones)});const data={deviceToken:token,playerId:'player-0001',version:7,requestId:'certificate-001',image:'data:image/jpeg;base64,/9j/AA=='};let a=c.uploadCertificate_(data),b=c.uploadCertificate_(data);assert.equal(a.url,b.url);assert.equal(files.size,1);assert.equal(tables.Certificates.length,2);let t=new URL(a.url).searchParams.get('token');assert.equal(c.getCertificate_(t).image,data.image);tables.Certificates[1][6]=Date.now()-1;assert.throws(()=>c.getCertificate_(t),/已到期/);c.cleanupExpired_();assert.equal(files.size,0);assert.equal(tables.Certificates[1][7],'deleted');});
test('Photo certificate rejects under-six, wrong version, wrong owner and oversized input',()=>{const {c}=env();c.savePlayer_({deviceToken:token,player:player()});const data={deviceToken:token,playerId:'player-0001',version:1,requestId:'certificate-002',image:'data:image/jpeg;base64,/9j/AA=='};assert.throws(()=>c.uploadCertificate_(data),/六站/);assert.throws(()=>c.uploadCertificate_({...data,image:'data:image/jpeg;base64,/9j/'+ 'A'.repeat(4500000)}),/JPEG/);});

test('Nine points stay exploring; the tenth point enters the timed board',()=>{const {c}=env(),ids=['chinese','english','mandarin','math','general','science','humanities','art','music','pe'];c.savePlayer_({deviceToken:token,player:player('player-partial',1,Object.fromEntries(ids.slice(0,9).map(id=>[id,1000])))});let b=c.getBoard_();assert.equal(b.players.length,0);assert.equal(b.exploring,1);c.savePlayer_({deviceToken:token,player:player('player-partial',2,Object.fromEntries(ids.map(id=>[id,1000])))});b=c.getBoard_();assert.equal(b.players.length,1);assert.equal(b.players[0].totalMs,10000);assert.equal(b.exploring,0);});

test('Four-minute times accepted, old three-minute records preserved',()=>{const {c,tables}=env();c.savePlayer_({deviceToken:token,player:player('player-timecap',1,{math:180000})});c.savePlayer_({deviceToken:token,player:player('player-timecap',2,{math:240000,english:240000})});assert.equal(c.playerFromRow_(tables.Players[1]).totalMs,420000);assert.throws(()=>c.savePlayer_({deviceToken:token,player:player('player-badtime',1,{math:240001})}));});

test('Live acceptance runner uses the actual backend source with an occupied board',async()=>{
 globalThis.location={search:''};
 try{
  const {runAcceptance}=await import('./live-google.js');
  for(const existing of [1,10]){
   const {c,tables}=env(),zones=Object.fromEntries(['chinese','english','mandarin','math','general','science','humanities','art','music','pe'].map(id=>[id,1000]));
   for(let i=0;i<existing;i++)c.savePlayer_({deviceToken:token,player:player('existing-'+i,1,zones)});
   const report=await runAcceptance(async(method,payload)=>c.dispatch(method,{...payload,deviceToken:token}));
   assert.equal(report.results.some(r=>r.status==='fail'),false);
   assert.equal(report.passed,existing===1);assert.equal(report.unverified,existing===10);
   const row=tables.Players.find(r=>r[0]===report.playerId),p=c.playerFromRow_(row);
   assert.equal(p.zonesCompleted,10);assert.equal(p.totalMs,249000);
   assert.equal(tables.Players.length,existing+2,'one test participant only');
  }
 }finally{delete globalThis.location;}
});

test('Live acceptance does not count a transport failure as time validation',async()=>{
 globalThis.location={search:''};
 try{
  const {runAcceptance}=await import('./live-google.js');const {c}=env();
  await assert.rejects(runAcceptance(async(method,payload)=>{
   if(payload?.player?.version===2)throw Error('更新暫時未完成');
   return c.dispatch(method,{...payload,deviceToken:token});
  }),/更新暫時未完成/);
 }finally{delete globalThis.location;}
});
test('Deleted certificate request cannot revive an expired token, but a new request can issue a new certificate',()=>{
 const {c,tables,files}=env(),zones=Object.fromEntries(['chinese','english','mandarin','math','general','science'].map(id=>[id,1000]));
 c.savePlayer_({deviceToken:token,player:player('player-expired',1,zones)});
 const data={deviceToken:token,playerId:'player-expired',version:1,requestId:'certificate-expired',image:'data:image/jpeg;base64,/9j/AA=='};
 const original=c.uploadCertificate_(data),oldToken=new URL(original.url).searchParams.get('token');
 tables.Certificates[1][5]=Date.now()-8*86400000;tables.Certificates[1][6]=Date.now()-1;c.cleanupExpired_();
 assert.equal(files.size,0);assert.throws(()=>c.uploadCertificate_(data),/已到期/);assert.equal(files.size,0);assert.equal(tables.Certificates[1][7],'deleted');
 const fresh=c.uploadCertificate_({...data,requestId:'certificate-renewed'});
 assert.notEqual(fresh.url,original.url);assert.equal(files.size,1);assert.throws(()=>c.getCertificate_(oldToken),/已到期/);
 assert.equal(c.getCertificate_(new URL(fresh.url).searchParams.get('token')).image,data.image);
});
test('Spreadsheet writes are committed before releasing the shared lock',()=>{
 const {c,tables}=env(),open=c.SpreadsheetApp.openById,pending=[];let held=false;
 c.SpreadsheetApp.openById=()=>({getSheetByName:name=>{const sheet=open().getSheetByName(name);return {...sheet,getRange(...args){const range=sheet.getRange(...args);return {...range,setValues(values){pending.push(()=>range.setValues(values));}};}};}});
 c.SpreadsheetApp.flush=()=>{assert.equal(held,true);pending.splice(0).forEach(commit=>commit());};
 c.LockService.getScriptLock=()=>({tryLock(){held=true;return true;},releaseLock(){assert.equal(pending.length,0,'uncommitted writes must not outlive the lock');held=false;}});
 c.savePlayer_({deviceToken:token,player:player('player-buffered',1,{math:1000})});
 assert.equal(held,false);assert.equal(tables.Players.length,2);assert.equal(c.playerFromRow_(tables.Players[1]).totalMs,1000);
 c.SpreadsheetApp.flush=()=>{throw Error('flush failed');};c.LockService.getScriptLock=()=>({tryLock(){held=true;return true;},releaseLock(){held=false;}});
 assert.throws(()=>c.lock_(()=>{}),/flush failed/);assert.equal(held,false,'release lock even when committing fails');
});
test('An acknowledged certificate retry can recover its original link while the write lock is busy',()=>{
 const {c,tables,files}=env(),zones=Object.fromEntries(['chinese','english','mandarin','math','general','science'].map(id=>[id,1000]));
 c.savePlayer_({deviceToken:token,player:player('player-recover',1,zones)});
 const data={deviceToken:token,playerId:'player-recover',version:1,requestId:'certificate-recover',image:'data:image/jpeg;base64,/9j/AA=='};
 const original=c.uploadCertificate_(data);data.recover=true;
 c.LockService.getScriptLock=()=>({tryLock(){throw Error('must not acquire write lock for a ready receipt');}});
 assert.equal(c.uploadCertificate_(data).url,original.url);assert.equal(files.size,1);
 tables.Certificates[1][8]='different-device';assert.throws(()=>c.uploadCertificate_(data),/紀錄不符/);
 tables.Certificates[1][8]=c.hash_(token);tables.Certificates[1][6]=Date.now()-1;
 assert.throws(()=>c.uploadCertificate_(data),/已到期/);
 tables.Certificates[1][7]='deleted';assert.throws(()=>c.uploadCertificate_(data),/已到期/);
});

test('Reset epoch refuses old queued players and accepts new visitors on the same device',()=>{
 const {c,tables}=env(),props=c.PropertiesService.getScriptProperties();
 c.PropertiesService.getScriptProperties=()=>({...props,getProperty:k=>k==='GAME_EPOCH'?'open-day-20260913':props.getProperty(k)});
 const old=player('old-offline-player',9,{math:1234});
 assert.equal(c.savePlayer_({deviceToken:token,player:old}).resetRequired,true);
 assert.equal(tables.Players.length,1);
 assert.equal(c.savePlayer_({deviceToken:token,player:{...player('fresh-visitor',1,{math:2000}),epoch:'open-day-20260913'}}).score,1);
 assert.equal(tables.Players.length,2);
 c.savePlayer_({deviceToken:token,player:old});assert.equal(tables.Players.length,2);
});
