import {CONFIG} from './config.js';
import {read,write,DEMO} from './storage.js';
export const networkSettings=()=>({...CONFIG,...read('settings',{}),...(DEMO?{appScriptUrl:'',deviceToken:''}:{})});
export class GoogleBridge{
 constructor(appScriptUrl=null){this.pending=new Map();this.channel=crypto.randomUUID();this.ready=null;this.receiver=null;this.appScriptUrl=appScriptUrl;}
 connect(){if(this.ready)return this.ready;const url=this.appScriptUrl??networkSettings().appScriptUrl;if(!url)return Promise.reject(Error('尚未設定活動連線'));if(!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/.test(url))return Promise.reject(Error('活動連線網址不正確'));
 this.ready=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.destroy();reject(Error('連線暫時未完成'));},20000);this.listener=e=>{
 const m=e.data;if(!m||m.channel!==this.channel||!/^https:\/\/(?:[a-z0-9-]+-)?script\.googleusercontent\.com$/.test(e.origin))return;
 if(m.kind==='ready'&&!this.receiver){this.receiver=e.source;this.origin=e.origin;clearTimeout(timer);resolve();return;}
 if(e.source!==this.receiver||m.kind!=='response')return;const p=this.pending.get(m.id);if(!p)return;clearTimeout(p.timer);this.pending.delete(m.id);m.ok?p.resolve(m.data):p.reject(Error(m.error||'更新暫時未完成'));
 };window.addEventListener('message',this.listener);this.frame=document.createElement('iframe');this.frame.hidden=true;this.frame.title='活動連線';this.frame.src=url+'?view=bridge&parentOrigin='+encodeURIComponent(location.origin)+'&channel='+this.channel;document.body.append(this.frame);});return this.ready;}
 async call(method,payload={},timeout=30000){await this.connect();const id=crypto.randomUUID();return new Promise((resolve,reject)=>{let timer=setTimeout(()=>{this.pending.delete(id);reject(Error('更新暫時未完成，稍後再試'));},timeout);this.pending.set(id,{resolve,reject,timer});this.receiver.postMessage({kind:'request',channel:this.channel,id,method,payload},this.origin);});}
 destroy(){this.frame?.remove();if(this.listener)window.removeEventListener('message',this.listener);this.receiver=null;this.ready=null;for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(Error('連線已重設'));}this.pending.clear();}
}
export const bridge=new GoogleBridge();
export function queuePlayer(snapshot){let q=read('outbox',{});q[snapshot.id]=snapshot;write('outbox',q);}
let flushing=false;
export async function flushPlayers(){if(flushing)return;let settings=networkSettings();if(!navigator.onLine||!settings.appScriptUrl||!settings.deviceToken)return;flushing=true;window.dispatchEvent(new CustomEvent('syncstatus',{detail:'正在同步…'}));try{let q=read('outbox',{});for(const item of Object.values(q)){await bridge.call('savePlayer',{deviceToken:settings.deviceToken,player:item,requestId:item.id+':'+item.version});let latest=read('outbox',{});if(latest[item.id]?.version===item.version)delete latest[item.id];write('outbox',latest);}window.dispatchEvent(new CustomEvent('syncstatus',{detail:'進度已同步'}));}catch(e){window.dispatchEvent(new CustomEvent('syncstatus',{detail:'進度已存本機，等待同步'}));}finally{flushing=false;}}
