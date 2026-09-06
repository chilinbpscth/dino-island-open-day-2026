const paths={
 water:'<path fill="#7fc9db" d="M45 12Q15 45 15 61a30 30 0 0060 0Q75 45 45 12Z"/><path d="M29 57q-5 15 9 18"/>',
 apple:'<path fill="#ee937c" d="M45 32C10 8 1 63 25 83q10 7 20-1 12 8 21 0C92 51 77 14 45 32Z"/><path d="M45 31V16"/><path fill="#75a75b" d="M45 22Q53 4 71 12Q63 30 45 22Z"/>',
 leaf:'<path fill="#75a75b" d="M16 78Q1 12 77 13Q87 82 16 78Z"/><path d="M17 77L65 30m-26 26L36 36m3 20 22 2"/>',
 sleep:'<rect fill="#ece3b4" x="9" y="26" width="72" height="48" rx="15"/><path d="M18 34l7 6m47-6-7 6M18 66l7-6m47 6-7-6"/>',
 umbrella:'<path fill="#e5bc5d" d="M7 46a38 38 0 0176 0Q72 36 58 46Q45 36 32 46Q18 36 7 46Z"/><path d="M45 12v61q0 15 15 5"/>',
 hat:'<path fill="#e5bc5d" d="M21 58V38a24 24 0 0148 0v20"/><ellipse fill="#e5bc5d" cx="45" cy="62" rx="39" ry="13"/><path d="M22 47h46"/>',
 coat:'<path fill="#e5bc5d" d="M29 14l16 8 16-8 23 26-13 13-9-8v36H28V45l-9 8L6 40Z"/><path d="M45 23v57m-12-9h-5m29 0h5"/>',
 bath:'<path fill="#8dc8d1" d="M8 45h74l-7 28H19Z"/><path d="M21 77v7m47-7v7M17 43V23q0-15 15-7"/><circle fill="#fff" cx="49" cy="34" r="10"/><circle fill="#fff" cx="65" cy="27" r="7"/>',
 sun:'<circle fill="#e5bc5d" cx="45" cy="45" r="22"/><path d="M45 5v9m0 62v9M5 45h9m62 0h9M16 16l7 7m44 44 7 7M16 74l7-7m44-44 7-7"/>',
 rain:'<path fill="#b5d7d9" d="M20 51C-1 42 11 21 27 25C29 1 62 6 65 25C86 18 95 50 73 51Z"/><path stroke="#65a5b8" d="M27 63l-4 14m24-14-4 14m24-14-4 14"/>',
 cold:'<path stroke="#65a5b8" d="M45 9v72M14 27l62 36M14 63l62-36M35 15l10 10 10-10M35 75l10-10 10 10M15 39l14-4-3-14m48 30-14 4 3 14M15 51l14 4-3 14m48-30-14-4 3-14"/>',
 search:'<circle fill="#cce4d5" cx="38" cy="37" r="25"/><path stroke-width="12" d="M58 57l22 23"/><path d="M25 34q2-12 14-12"/>',
 ear:'<path fill="#e5bc5d" d="M28 34C20 0 82 1 75 40Q73 55 53 62Q50 87 33 77"/><path d="M42 38q-6-20 12-18 20 5-2 26"/><path d="M10 30q-8 15 0 30"/>',
 write:'<path fill="#c9cfad" d="M13 16h57v64H13Z"/><path fill="#e5bc5d" d="M40 56L69 11l13 9-30 45-16 7Z"/><path d="M28 32h13M27 48h9"/>',
 share:'<path fill="#e5bc5d" d="M14 51l20 9h21l12-8q16-8 13 5L61 77H31L8 65Z"/><path fill="#ee937c" d="M46 44C9 23 29 4 45 20C62 4 83 23 46 44Z"/>',
 paint:'<path fill="#ece3b4" d="M43 9C-5 8-7 80 37 82Q63 84 54 67q-5-10 11-9C104 66 84 9 43 9Z"/><circle fill="#146b4d" cx="26" cy="31" r="7"/><circle fill="#e5bc5d" cx="52" cy="26" r="7"/><circle fill="#ee937c" cx="25" cy="57" r="7"/>',
 drum:'<path fill="#e5bc5d" d="M13 34v38q32 18 64 0V34Z"/><ellipse fill="#fff6da" cx="45" cy="34" rx="32" ry="12"/><path d="M15 45l15 28 15-24 15 25 15-29M14 10l28 14M75 8L51 24"/>',
 move:'<circle fill="#e5bc5d" cx="48" cy="17" r="10"/><path d="M45 31l-7 23 19 10-4 17M38 54L21 77M41 37l-16 8-12-9M44 35l18 9 13-11"/>',
 order:'<rect fill="#cce4d5" x="8" y="15" width="30" height="29" rx="8"/><rect fill="#e5bc5d" x="52" y="50" width="30" height="29" rx="8"/><path d="M42 28h22v15m-7-6 7 7 7-7"/>',
 star:'<path fill="#e5bc5d" d="M45 7l12 25 27 4-20 20 5 28-24-13-24 13 5-28L6 36l27-4Z"/>',
 footprint:'<ellipse fill="#146b4d" cx="45" cy="59" rx="23" ry="21"/><ellipse fill="#146b4d" cx="22" cy="29" rx="8" ry="11"/><ellipse fill="#146b4d" cx="45" cy="20" rx="8" ry="11"/><ellipse fill="#146b4d" cx="68" cy="29" rx="8" ry="11"/>',
 back:'<path d="M48 19L22 45l26 26M23 45h55"/>',camera:'<rect fill="#cce4d5" x="8" y="25" width="74" height="54" rx="10"/><path d="M28 24l5-12h25l5 12"/><circle fill="#f6f3ec" cx="45" cy="51" r="18"/>',
 mud:'<path fill="#b8923a" d="M16 68Q-2 48 22 40q-9-31 15-14Q63 1 62 38q35-7 16 21 11 27-21 20-33 19-41-11Z"/>',
 square:'<rect fill="#c9cfad" x="18" y="18" width="54" height="54" rx="5"/>',circle:'<circle fill="#c9cfad" cx="45" cy="45" r="30"/>',triangle:'<path fill="#c9cfad" d="M45 12L80 76H10Z"/>'
};
export function icon(name,cls=''){return `<svg class="icon ${cls}" viewBox="0 0 90 90" aria-hidden="true" fill="none" stroke="#203b2e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.leaf}</svg>`;}
export function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
