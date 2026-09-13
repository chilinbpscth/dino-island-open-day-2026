let current=null;
export function stopVoice(){current?.pause();current=null;}
export async function playVoice(url,onEnded=()=>{}){
 stopVoice();const audio=new Audio(url);current=audio;audio.onended=()=>{if(current===audio){current=null;onEnded();}};
 try{await audio.play();return current===audio;}catch{return false;}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();});
window.addEventListener('pagehide',stopVoice);
