import {icon} from '../../shared/icons.js';
export const journeyScenes=[
 {file:'chinese/mountain.png',caption:'山洞可以遮風擋雨。',outcome:'小龍搵到可以躲雨嘅山洞。',sprite:'games/chinese/dino-walking'},
 {file:'chinese/river.png',caption:'清水幫小龍解渴。',outcome:'留喺岸上，飲自備嘅清水。',sprite:'games/chinese/dino-drinking'},
 {file:'chinese/volcano.png',caption:'火山只遠遠觀察，唔靠近。',outcome:'小龍留喺安全地方，遠遠觀察火山。'},
 {file:'humanities/safe-forest.png',caption:'樹木為小龍提供樹蔭。',outcome:'小龍喺樹蔭下休息，涼快返。'},
 {file:'general/daytime.png',caption:'日頭出嚟，記得遮陽。',outcome:'日頭出嚟，準備好帽先再出發。',prop:'hat'},
 {file:'general/bedtime.png',caption:'月亮出嚟，小龍休息。',outcome:'小龍返到小屋，攬住枕頭安心瞓。',pose:'dino-baby-sleep'}
];
export function chineseScene(index,complete=false){
 const s=journeyScenes[index];
 if(!complete)return `<div class="chinese-scene scene-${index}" aria-label="${s.caption}"><img class="journey-thumbnail" src="img/games/${s.file}" alt=""><span>${s.caption}</span></div>`;
 return `<div class="chinese-journey scene-${index} scene-complete" aria-label="${s.outcome}"><img class="journey-background" src="img/games/${s.file}" alt=""><div class="journey-dino"><img class="character" src="img/${s.sprite||`chars/${s.pose||'dino-baby'}`}.png" alt="${s.outcome}">${s.prop?`<span class="journey-prop prop-${s.prop}" aria-hidden="true">${icon(s.prop)}</span>`:''}</div><p class="journey-caption">${s.outcome}</p></div>`;
}
