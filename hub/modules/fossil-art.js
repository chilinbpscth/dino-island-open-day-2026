// Original, simplified cartoon geometry: spatial relationships, not a species specimen.
export const fossilParts=['head','body','legs','tail'];
const bones={
 head:'<path d="M155 125H66Q24 125 24 101V77Q24 59 54 59H73Q83 31 112 31Q150 31 158 61L164 103Z"/><circle cx="115" cy="66" r="16" fill="#b49a70"/><path d="M34 95H70M48 75h5M42 139H147L155 125H67Z"/>',
 body:'<path d="M155 104L192 111L241 104L295 101L338 105L380 118" fill="none" stroke-width="14"/><path d="M225 107Q201 152 240 192M251 105Q230 159 267 200M278 104Q263 163 292 201M305 106Q301 163 318 194M331 109Q347 157 336 180" fill="none" stroke-width="10"/><path d="M228 132L202 160L179 155M202 160L191 174" fill="none" stroke-width="10"/><path d="M304 190Q327 178 351 188L345 206H313Z"/>',
 legs:'<path d="M315 198L287 240L272 281H235M344 199L364 236L351 279H318" fill="none" stroke-width="15"/><circle cx="287" cy="240" r="8"/><circle cx="364" cy="236" r="8"/><path d="M244 276v11M257 276v11M326 274v11M339 274v11"/>',
 tail:'<path d="M380 118Q438 124 482 144Q524 162 565 165Q514 185 470 165Q424 149 380 137Z"/><path d="M405 121L402 143M432 128L427 151M460 135L452 159M487 146L479 169M513 157L506 177M537 163L532 174"/>'
};
const bounds={head:'15 23 155 125',body:'150 85 235 125',legs:'225 186 165 112',tail:'373 104 205 82'};
const style='fill="#fff3ce" stroke="#514531" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
export const fossil=id=>`<svg viewBox="${bounds[id]}" aria-hidden="true" ${style}>${bones[id]}</svg>`;
export const skeleton=placed=>`<svg class="joined-skeleton" viewBox="0 0 600 320" role="img" aria-label="頭、身體、腳同尾連成一副卡通骨架" ${style}>${fossilParts.map(id=>`<g data-bone="${id}" opacity="${placed.includes(id)?1:.22}">${bones[id]}</g>`).join('')}</svg>`;
