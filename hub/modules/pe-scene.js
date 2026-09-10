// Original simple game props; character poses remain separate illustrated assets.
const egg='<path d="M50 10C30 10 17 44 17 61c0 24 15 33 33 33s33-9 33-33C83 44 70 10 50 10Z" fill="#fff5d3" stroke="#243f31" stroke-width="5"/><g fill="#b8923a"><ellipse cx="39" cy="38" rx="8" ry="10"/><ellipse cx="65" cy="63" rx="9" ry="7"/><circle cx="37" cy="77" r="6"/></g>';
const rock='<path d="M16 67 26 32 52 17 78 30 91 62 70 82 35 84Z" fill="#aaa285" stroke="#243f31" stroke-width="5" stroke-linejoin="round"/><path d="m27 34 28 7 21-11M55 41l-8 29" fill="none" stroke="#d3c9aa" stroke-width="5" stroke-linecap="round"/>';
const branch='<path d="m12 78 72-52 6 10-72 53Z" fill="#b78a51" stroke="#243f31" stroke-width="5" stroke-linejoin="round"/><path d="m49 53-5-26m22 14 15 19" fill="none" stroke="#243f31" stroke-width="7" stroke-linecap="round"/><path d="M44 30C21 28 26 6 27 7c19 0 26 12 17 23Zm35 29c15-14 29-2 26 5-16 11-23 5-26-5Z" fill="#4a9854" stroke="#243f31" stroke-width="4"/>';
const svg=(body,label,cls)=>`<svg class="${cls}" viewBox="0 0 110 110" role="img" aria-label="${label}">${body}</svg>`;
export const peSituations={sit:'圓圓火山石飛過，慢慢蹲低避一避。',left:'右邊有樹枝，向畫面左邊移一步。',right:'左邊有樹枝，向畫面右邊移一步。',hands:'恐龍蛋落嚟啦，舉高雙手接住。',freeze:'大龍經過，企定定守住恐龍蛋。'};
export function peScene(command,complete){
 return `<img class="pe-backdrop" src="img/games/pe/${command==='freeze'&&!complete?'forest-visitor':'forest-arena'}.png" alt="${command==='freeze'&&!complete?'友善大龍喺遠處經過':'保護恐龍蛋嘅森林空地'}"><div class="pe-nest" aria-hidden="true"></div>${svg(egg,complete?'安全返到窩入面嘅恐龍蛋':'要保護嘅恐龍蛋','pe-egg')}${!complete&&command==='sit'?svg(rock,'圓圓火山石由右邊飛過','pe-obstacle pe-rock'):!complete&&['left','right'].includes(command)?svg(branch,command==='left'?'右邊嘅樹枝':'左邊嘅樹枝','pe-obstacle pe-branch'):''}`;
}
