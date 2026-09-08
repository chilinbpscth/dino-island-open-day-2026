export const SCHOOL='佛教志蓮小學', TITLE='智取恐龍島', DATE='2026.09.13', SCORE_TARGET=10, CERT_TARGET=6, MAX_ZONE_MS=240000;
export const ZONES=[
 ['chinese','中文','write','xiaolian-write','用正確筆順寫字，幫小龍起屋同搵水。','有山洞、有清水、有樹蔭，小龍住得更安全！'],
 ['english','英文','ear',null,'聽英文，用行動照顧小龍。','有水飲、食得飽，小龍安心休息！'],
 ['mandarin','普通話','ear',null,'聽普通話，先至知小龍要咩。','避到雨、食得飽，小龍學識照顧自己！'],
 ['math','數學','apple',null,'數一數，每隻恐龍分一份，唔重複、唔漏低。','每隻恐龍都有一份食物，大家食飽又開心！'],
 ['general','常識','sun','xiaozhi-welcome','認識早午晚，幫小龍安排飲食、清潔同休息。','食早餐、玩耍、沖涼、瞓覺，小龍學識有規律嘅生活！'],
 ['science','科學','search','xiaozhi-sit','先睇清楚，再決定點幫。','睇清楚需要，小龍精神返，學識健康生活！'],
 ['humanities','人文','share','xiaolian-point','觀察環境，為小龍選安全營地、飲用水同樹蔭。','有安全營地、清潔飲用水同樹蔭，小龍生活更安心！'],
 ['art','視藝','paint','xiaolian-color','用顏色、形狀同紋樣裝飾彩蛋，歡迎小龍誕生。','你創作嘅彩蛋孵出小龍，新生命開心同你打招呼！'],
 ['music','音樂','drum','xiaolian-clap','跟節奏，小龍就唔會驚。','有你陪住打拍子，小龍安心又開心！'],
 ['pe','體育','move','xiaozhi-stretch','一齊郁身，小龍先有氣力玩。','一齊伸展同踏步，小龍充滿精神！'],
 ['computing','資訊','order','xiaozhi-tablet','照顧都有先後次序。','先飲水、後食菜，小龍學識照顧次序！']
].map(([id,name,icon,companion,parent,outcome])=>({id,name,icon,companion,parent,outcome}));
export const zoneById=id=>ZONES.find(z=>z.id===id);
export const nameLength=s=>[...new Intl.Segmenter('zh-HK',{granularity:'grapheme'}).segment(s)].length;
export function cleanName(s){return String(s).normalize('NFC').trim().replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g,'');}
export function validName(s){return !!cleanName(s)&&nameLength(cleanName(s))<=8;}
export const uid=()=>crypto.randomUUID();
export function newPlayer(name){if(!validName(name))throw Error('請輸入一至八個字嘅暱稱');return {id:uid(),name:cleanName(name),version:1,zones:{},createdAt:Date.now()};}
export function totals(p){const entries=Object.entries(p?.zones||{}).filter(([id,v])=>zoneById(id)&&v?.complete).slice(0,SCORE_TARGET),ids=entries.map(([id])=>id);return {zoneIds:ids,zonesCompleted:ids.length,totalMs:entries.reduce((s,[,v])=>s+Math.min(MAX_ZONE_MS,Math.max(0,v.ms||0)),0),certReady:ids.length>=CERT_TARGET,scoreReady:ids.length===SCORE_TARGET};}
export function snapshot(p){return {id:p.id,name:p.name,version:p.version,zones:Object.fromEntries(Object.entries(p.zones).filter(([id,v])=>zoneById(id)&&v.complete).slice(0,SCORE_TARGET).map(([id,v])=>[id,Math.min(MAX_ZONE_MS,Math.round(v.ms||0))]))};}
export function completeZone(p,id){if(!zoneById(id))throw Error('未知站點');if(p.zones[id]?.complete||totals(p).scoreReady)return false;p.zones[id]={...p.zones[id],complete:true,ms:Math.min(MAX_ZONE_MS,p.zones[id]?.ms||0)};p.version++;return true;}
export const formatTime=ms=>`${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
export function rank(players){return [...players].sort((a,b)=>b.zonesCompleted-a.zonesCompleted||a.totalMs-b.totalMs||a.reachedAt-b.reachedAt||a.id.localeCompare(b.id));}
export class ActiveClock{constructor(onTick,now=()=>performance.now()){this.onTick=onTick;this.now=now;this.start=null;}resume(){if(this.start===null)this.start=this.now();}checkpoint(){if(this.start!==null){let t=this.now();this.onTick(Math.max(0,t-this.start));this.start=t;}}pause(){this.checkpoint();this.start=null;}}
// Paths are original interaction geometry. Stroke order follows 山: 豎、豎折、豎;
// 水: 豎鈎、橫撇、撇、捺; 木: 橫、豎、撇、捺. Teacher review remains a release gate.
export const CHARACTERS=[
 {char:'山',reward:'有山洞躲雨，小龍安全啦！',paths:[[[150,50],[150,242]],[[65,118],[65,250],[238,250]],[[238,118],[238,250]]]},
 {char:'水',reward:'有清水飲，小龍唔口渴啦！',paths:[[[153,45],[153,247],[130,230]],[[57,125],[111,125],[88,180],[45,223]],[[243,85],[190,137]],[[171,128],[200,185],[258,227]]]},
 {char:'木',reward:'有樹蔭，小龍涼快啦！',paths:[[[54,103],[250,103]],[[152,43],[152,261]],[[145,115],[105,181],[48,234]],[[165,116],[203,180],[259,228]]]}
];
export function pathSamples(points,step=10){const out=[points[0]];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/step);for(let j=1;j<=n;j++)out.push([a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n]);}return out;}
export function tracePass(input,path,tolerance=27){if(input.length<3)return false;let samples=pathSamples(path),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);if(dist(input[0],samples[0])>tolerance||dist(input.at(-1),samples.at(-1))>tolerance)return false;let at=0;for(const p of input){let best=Infinity,idx=at;for(let j=Math.max(0,at-2);j<Math.min(samples.length,at+7);j++){let d=dist(p,samples[j]);if(d<best){best=d;idx=j;}}if(best>tolerance)return false;at=Math.max(at,idx);}return at>=samples.length-3;}
