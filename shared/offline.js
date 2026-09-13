export function inspectOfflineCache(worker,timeoutMs=5000){
 return new Promise((resolve,reject)=>{
  const channel=new MessageChannel();const timer=setTimeout(()=>{channel.port1.close();reject(Error('離線檢查逾時'));},timeoutMs);
  channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();const result=event.data;if(result?.type==='OFFLINE_STATUS'&&typeof result.complete==='boolean')resolve(result);else reject(Error('離線檢查未完成'));};
  worker.postMessage({type:'CHECK_OFFLINE'},[channel.port2]);
 });
}
export function watchOfflineStatus(onStatus){
 if(!('serviceWorker'in navigator)){onStatus('呢個瀏覽器未支援離線準備。');return;}
 let checking=0;
 const check=async worker=>{if(!worker)return;const current=++checking;onStatus('正在檢查本機遊戲素材…');try{const result=await inspectOfflineCache(worker);if(current===checking)onStatus(result.complete?'本機遊戲版本已可離線使用':`離線素材未齊（欠 ${result.missing} 項），請保持連線。`);}catch{if(current===checking)onStatus('離線準備未能確認，請保持連線。');}};
 const current=()=>{if(navigator.serviceWorker.controller)check(navigator.serviceWorker.controller);};
 navigator.serviceWorker.addEventListener('controllerchange',current);window.addEventListener('online',current);
 navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).then(reg=>{
  const observe=worker=>{if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='activated')check(navigator.serviceWorker.controller||worker);else if(worker.state==='redundant'&&!reg.active)onStatus('離線下載未完成，請保持連線再重開。');});};
  observe(reg.installing);reg.addEventListener('updatefound',()=>observe(reg.installing));if(reg.active)check(navigator.serviceWorker.controller||reg.active);
 }).catch(()=>onStatus('離線準備未完成，請保持連線。'));
}
