import {chromium,expect} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

// Provide a synthetic test certificate URL through the environment, never commit its token.
const target=new URL(process.env.DINO_CERT_URL||'about:blank');
assert.equal(target.origin,'https://script.google.com');assert.match(target.pathname,/^\/macros\/s\/[^/]+\/exec$/);
assert.equal(target.searchParams.get('view'),'certificate');assert.match(target.searchParams.get('token')||'',/^[\w-]{40,100}$/);
const browser=await chromium.launch(),context=await browser.newContext({acceptDownloads:true,serviceWorkers:'block',viewport:{width:900,height:1100}});
try{
 const initialCookies=await context.cookies();assert.equal(initialCookies.length,0);
 const page=await context.newPage();await page.goto(target.href,{waitUntil:'domcontentloaded',timeout:60000});
 let certificateFrame;
 await expect.poll(async()=>{for(const frame of page.frames()){if(await frame.locator('#photo').isVisible().catch(()=>false)){certificateFrame=frame;return true;}}return false;},{timeout:60000}).toBe(true);
 const img=certificateFrame.locator('#photo');await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth===1600&&i.naturalHeight===2000)).toBe(true);
 const expected=Buffer.from((await img.getAttribute('src')).split(',')[1],'base64');
 const pending=page.waitForEvent('download',{timeout:20000});await certificateFrame.locator('#save').click();const download=await pending;
 assert.equal(await download.failure(),null);const bytes=await readFile(await download.path());assert.deepEqual(bytes,expected);
 assert.equal(page.frames().some(f=>new URL(f.url()||'about:blank').hostname==='accounts.google.com'),false);
 await page.screenshot({path:new URL('../docs/screenshots/anonymous-certificate.png',import.meta.url).pathname,fullPage:true});
 const result={testedAt:new Date().toISOString(),environment:'Fresh desktop Chromium context, no imported cookies or storage; real public Apps Script certificate page',initialCookieCount:initialCookies.length,passed:['Certificate rendered without signing in','1600×2000 JPEG decoded','Save button triggered a browser download','Downloaded bytes exactly match the displayed certificate'],bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),limitations:['Synthetic certificate only, no visitor photograph','Desktop download does not verify iPhone/Android photo saving or QR camera scanning','No physical iPad testing']};
 await writeFile(new URL('../docs/anonymous-certificate-test-results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();}
