const art=[
 '<path fill="#b6c99a" d="M5 82L45 15L85 82Z"/><path fill="#8d9f77" d="M60 82L104 6L152 82Z"/><path fill="#314839" d="M82 82V60a17 17 0 0134 0v22Z"/>',
 '<path fill="#7fc9db" d="M67 3H105Q34 29 92 43Q153 58 97 87H40Q106 56 61 47Q3 32 67 3Z"/>',
 '<path fill="#b5a88b" d="M18 82L63 23H100L145 82Z"/><path fill="#e5bc5d" d="M63 23L73 39L82 32L91 40L100 23Z"/><path d="M74 15q-8-8 0-13m17 13q8-8 0-13"/><path d="M3 84h150"/>',
 '<path d="M80 85V38" stroke-width="10"/><path fill="#75a75b" d="M34 41Q19 17 51 17Q72-9 98 15Q134 12 126 39Q148 65 103 66H57Q18 66 34 41Z"/>',
 '<circle fill="#e5bc5d" cx="80" cy="45" r="26"/><path d="M80 2v10m0 66v10M37 45h10m66 0h10M48 14l7 7m50 50 7 7M48 76l7-7m50-50 7-7"/>',
 '<path fill="#e5bc5d" d="M95 8a36 36 0 1030 53C85 71 70 34 95 8Z"/><path d="M37 18v14m-7-7h14"/>'
];
const captions=['山洞可以遮風擋雨。','清水幫小龍解渴。','火山只遠遠觀察，唔靠近。','樹木為小龍提供樹蔭。','日頭出嚟，記得遮陽。','月亮出嚟，小龍休息。'];
export function chineseScene(index,complete=false){return `<div class="chinese-scene scene-${index} ${complete?'scene-complete':''}" aria-label="${captions[index]}"><svg viewBox="0 0 160 90" fill="none" stroke="#203b2e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${art[index]}</svg><span>${captions[index]}</span></div>`;}
