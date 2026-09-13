import test from 'node:test';import assert from 'node:assert/strict';
test('Official progress starts empty, device enrollment remains and repeated entry keeps progress',async()=>{
 globalThis.location={search:''};const data=new Map([['dino-island-20260913:settings',JSON.stringify({deviceToken:'existing',guideNumber:25})],['dino-island-20260913:player',JSON.stringify({id:'old-test'})],['dino-island-20260913:outbox',JSON.stringify({old:{id:'old-test'}})]]);
 globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
 try{const s=await import('../shared/storage.js');assert.equal(s.read('player'),null);assert.deepEqual(s.read('outbox',{}),{});assert.equal(s.read('settings').guideNumber,25);s.write('player',{id:'new'});assert.equal(s.read('player').id,'new');s.remove('player');assert.equal(s.read('settings').deviceToken,'existing');assert.ok(data.has('dino-island-20260913:player'));}finally{delete globalThis.location;delete globalThis.localStorage;}
});
