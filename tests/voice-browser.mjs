import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile(new URL('../design/audio/voice-manifest.json',import.meta.url)));
const browser=await chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
const page=await browser.newPage({serviceWorkers:'block',permissions:['microphone'],viewport:{width:1194,height:834}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));await page.route('https://**',r=>r.abort());
await page.addInitScript(()=>{const Original=window.Audio;window.testAudio=[];window.Audio=function(...args){const a=new Original(...args);window.testAudio.push(a);return a;};});
const base='http://127.0.0.1:4173';
try{
 await page.goto(base+'/hub/?demo=1#/map');
 const decoded=await page.evaluate(async clips=>{const ctx=new AudioContext(),results=[];try{for(const c of clips){const r=await fetch('/'+c.file);if(!r.ok)throw Error(c.file);const b=await ctx.decodeAudioData(await r.arrayBuffer());results.push({id:c.id,seconds:b.duration});}}finally{await ctx.close();}return results;},manifest.clips);
 assert.equal(decoded.length,45);assert(decoded.every(x=>x.seconds>.2));
 for(const id of ['chinese','english','mandarin','math','general','science','humanities','art','music','pe','computing']){
  await page.goto(base+'/hub/?demo=1#/play/'+id);await page.locator('#game-intro').click();
  await page.waitForFunction(()=>window.testAudio.some(a=>!a.paused&&a.readyState>=2));
  await page.locator('#back-map').click();await page.waitForFunction(()=>location.hash==='#/map');await page.locator('.stone').first().waitFor();assert(await page.evaluate(()=>window.testAudio.every(a=>a.paused)));
 }
 await page.goto(base+'/hub/?demo=1#/play/english');await page.locator('#game-intro').click();await page.locator('#motion-listen').click();
 await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);assert(await page.evaluate(()=>window.testAudio.slice(0,-1).every(a=>a.paused)));assert(!/[a-zA-Z]/.test(await page.locator('#app').innerText()));
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert(await page.evaluate(()=>window.testAudio.every(a=>a.paused)));
 await page.goto(base+'/hub/?demo=1#/play/pe');await page.locator('#motion-listen').click();await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);assert((await page.evaluate(()=>window.testAudio.at(-1).src)).endsWith('/yue/actions/sit.wav'));
 await page.goto(base+'/hub/?demo=1#/play/chinese');await page.locator('#character-listen').click();await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);assert((await page.evaluate(()=>window.testAudio.at(-1).src)).endsWith('/characters/mountain.wav'));
 await page.goto(base+'/hub/?demo=1#/play/mandarin');await page.locator('#greeting-listen').click();await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);
 await page.locator('#greeting-record').click();await page.locator('#greeting-stop').waitFor({state:'visible'});await page.waitForTimeout(1000);
 const count=await page.evaluate(()=>window.testAudio.length);await page.locator('#game-intro').click();assert.equal(await page.evaluate(()=>window.testAudio.length),count);
 await page.locator('#greeting-stop').click();await page.locator('#greeting-play').waitFor({state:'visible'});await page.locator('#greeting-play').click();await page.waitForFunction(()=>!document.querySelector('#greeting-next').disabled);
 await page.locator('#greeting-next').click();assert(await page.locator('#greeting-next').isDisabled());assert(await page.evaluate(()=>window.testAudio.every(a=>a.paused||a.ended)));
 for(let i=1;i<6;i++){await page.locator('#greeting-family').click();await page.locator('#greeting-next').click();}
 await page.locator('#return-map').waitFor();await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);
 assert((await page.evaluate(()=>window.testAudio.at(-1).src)).endsWith('/yue/common/complete.wav'));
 await page.getByRole('button',{name:'聽鼓勵',exact:true}).click();await page.waitForFunction(()=>window.testAudio.at(-1)?.readyState>=2);
 assert((await page.evaluate(()=>window.testAudio.at(-1).src)).endsWith('/yue/common/complete.wav'));
 await page.locator('#return-map').click();await page.locator('.stone').first().waitFor();assert(await page.evaluate(()=>window.testAudio.every(a=>a.paused||a.ended)));
 assert.deepEqual(errors,[]);
 await writeFile(new URL('../docs/voice-test-results.json',import.meta.url),JSON.stringify({testedAt:new Date().toISOString(),environment:'Chromium actual WAV decode/playback, virtual microphone; not pronunciation review or physical iPad',decoded,passed:['Completion encouragement plays, replays and stops when leaving','11 spoken introductions stop on leaving','Command replaces introduction without overlap','Hidden page stops speech','Chinese and PE use corresponding local audio','No visible English letters','Mandarin recording excludes intro, RAM playback enables next and stops on next round']},null,2));
 console.log('PASS 45 WAV files decoded, 11 intros, speech replacement/cleanup, Mandarin virtual recording and replay');
}finally{await browser.close();}
