import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch(),page=await browser.newPage({serviceWorkers:'block',viewport:{width:1194,height:834}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('https://**',route=>route.abort());
try{
 await page.goto('http://127.0.0.1:4173/hub/');
 await page.evaluate(async()=>{
  const {newPlayer}=await import('/shared/core.js'),{write,photoStore}=await import('/shared/storage.js'),{bridge}=await import('/shared/network.js');
  const player=newPlayer('領證測試');for(const id of ['math','general','science','humanities','art','music'])player.zones[id]={complete:true,ms:1000};write('player',player);
  const endpoint='https://script.google.com/macros/s/TEST_DEPLOYMENT/exec';write('settings',{appScriptUrl:endpoint,deviceToken:'test-only-device-token-not-real'});
  const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16;const blob=await new Promise(r=>canvas.toBlob(r,'image/jpeg'));
  await photoStore('put',player.id,{requestId:'test-certificate-request',playerId:player.id,version:player.version,blob});write('photoPending',player.id);
 });
 await page.reload();
 await page.evaluate(async()=>{
  const {read}=await import('/shared/storage.js'),{bridge}=await import('/shared/network.js'),player=read('player'),endpoint=read('settings').appScriptUrl;
  window.testPlayerId=player.id;window.testUploads=[];window.testResponse={url:endpoint.replace('TEST_DEPLOYMENT','OTHER')+'?view=certificate&token='+'a'.repeat(43),expiresAt:Date.now()+60000};
  bridge.call=async(method,payload)=>{if(method==='savePlayer')return {acceptedVersion:payload.player.version};if(method==='uploadCertificate'){window.testUploads.push(payload.requestId);return window.testResponse;}throw Error('Unexpected test RPC');};
  const original=window.qrcode;window.qrcode=(...args)=>{const qr=original(...args),add=qr.addData.bind(qr);qr.addData=link=>{window.testQRLink=link;add(link);};return qr;};
  location.hash='#/cert';
 });
 await page.locator('#upload').waitFor({state:'visible'});await page.locator('#upload').click();
 await page.waitForFunction(()=>document.querySelector('#cert-status').textContent.includes('下載連結驗證未完成'));
 assert.equal(await page.locator('#qr svg').count(),0);
 assert(await page.evaluate(async()=>!!(await (await import('/shared/storage.js')).photoStore('get',window.testPlayerId))));
 await page.evaluate(()=>{window.testResponse.url=window.testResponse.url.replace('/macros/s/OTHER/','/a/chilinbps.edu.hk/macros/s/TEST_DEPLOYMENT/');});
 await page.locator('#upload').click();await page.locator('#qr svg').waitFor();
 assert.equal(await page.evaluate(()=>window.testQRLink),'https://script.google.com/macros/s/TEST_DEPLOYMENT/exec?view=certificate&token='+'a'.repeat(43));
 assert.deepEqual(await page.evaluate(()=>window.testUploads),['test-certificate-request','test-certificate-request']);
 assert.equal(await page.evaluate(async()=>!!(await (await import('/shared/storage.js')).photoStore('get',window.testPlayerId))),false);
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('dino-island-20260913:photoPending'))),null);
 await page.locator('#back-map').click();await page.waitForURL('**/#/map');await page.evaluate(()=>{location.hash='#/cert';});await page.locator('#qr svg').waitFor();
 assert.equal(await page.evaluate(()=>window.testUploads.length),2);assert.deepEqual(errors,[]);
 const passed=['Invalid acknowledgement keeps IndexedDB photo and shows no QR','School-domain URL yields same-deployment public QR','Retry reuses request ID','Validated acknowledgement clears pending photo','Returning to certificate restores QR without upload'];
 await writeFile(new URL('../docs/certificate-test-results.json',import.meta.url),JSON.stringify({testedAt:new Date().toISOString(),environment:'Chromium, mocked upload acknowledgement; no Google requests or real phone download',passed},null,2));
 console.log('PASS',passed.join('; '));
}finally{await browser.close();}
