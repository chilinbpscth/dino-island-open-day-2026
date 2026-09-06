export const DEMO=new URLSearchParams(location.search).get('demo')==='1';
const PREFIX=DEMO?'dino-island-demo:':'dino-island-20260913:';
export function read(key,fallback=null){try{return JSON.parse(localStorage.getItem(PREFIX+key))??fallback;}catch{return fallback;}}
export function write(key,value){localStorage.setItem(PREFIX+key,JSON.stringify(value));}
export function remove(key){localStorage.removeItem(PREFIX+key);}
const db=()=>new Promise((resolve,reject)=>{let r=indexedDB.open(PREFIX+'photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('pending');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
export async function photoStore(action,key,value){let d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('pending',action==='get'?'readonly':'readwrite'),s=tx.objectStore('pending');let r=action==='get'?s.get(key):action==='put'?s.put(value,key):s.delete(key);tx.oncomplete=()=>{d.close();resolve(r.result);};tx.onerror=()=>{d.close();reject(tx.error);};});}
