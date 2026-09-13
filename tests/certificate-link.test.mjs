import {test} from 'node:test';
import assert from 'node:assert/strict';
import {certificateLink} from '../shared/certificate-link.js';
const base='https://script.google.com/macros/s/TEST_DEPLOYMENT/exec',token='a'.repeat(43),query='?view=certificate&token='+token;
const valid=url=>({url,expiresAt:2000});
test('certificate links use the same deployment public route for both Google URL forms',()=>{
 for(const url of [base+query,base.replace('/macros/','/a/chilinbps.edu.hk/macros/')+query,base+'?token='+token+'&view=certificate'])assert.equal(certificateLink(valid(url),base,1000),base+query);
});
test('certificate links reject wrong deployment, origin, route, token or additional parameters',()=>{
 for(const url of [base.replace('TEST_DEPLOYMENT','OTHER')+query,base.replace('script.google.com','script.google.com.evil.test')+query,base.replace('https:','http:')+query,base.replace('/exec','/dev')+query,base+query+'#x',base+query+'&token='+token,base+query+'&view=certificate',base+query+'&redirect=https://example.com',base+'?view=certificate&token=short',base.replace('https://','https://user@')+query,'javascript:alert(1)'])assert.throws(()=>certificateLink(valid(url),base,1000));
 assert.throws(()=>certificateLink(valid(base+query),'',1000));
});
test('expired and malformed certificate acknowledgements cannot clear a pending upload',()=>{
 for(const expiresAt of [1000,999,null,'2000',NaN,Infinity])assert.throws(()=>certificateLink({url:base+query,expiresAt},base,1000));
 assert.throws(()=>certificateLink(null,base,1000));
});
