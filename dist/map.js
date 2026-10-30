import { terrain, BUILDINGS, tileKnown, mapSize, wonderStatus } from './model.js';

export function wonderArt(state){
  const {stage,remaining,duration}=state.wonder,active=remaining>0,p=active?1-remaining/duration:0;
  const tower=stage>=2?62:stage===1&&active?12+50*p:0;
  const top=5-tower;
  const base='<path d="M-59 14L0-20 59 14 0 48z" fill="#9aa787"/><path d="M-44 10L0-15 44 10 0 35z" fill="#c7c6b1" stroke="#8e9787"/><path d="M-44 10L0 35 44 10v7L0 42-44 17z" fill="#929b8e"/>';
  const foundation=stage>0?'<path d="M-32 10V0L0-18 32 0v10L0 28z" fill="#c8c7b3"/><path d="M0 18L32 0v10L0 28z" fill="#9da896"/><path d="M-32 0L0 18 32 0M-22 6v10M-8 14v9M12 12v10M24 5v10" fill="none" stroke="#8c9786"/>':'<path d="M-32 10L0-8 32 10 0 28z" fill="none" stroke="#7f8a72" stroke-dasharray="4 3"/><path d="M-24 9l9-5 9 5-9 5zM4 16l9-5 9 5-9 5z" fill="#d2cbb5"/>';
  const walls=tower?`<path d="M-25 5V${top}L0 ${top-14} 25 ${top}V5L0 20z" fill="#d1cbb5"/><path d="M0 ${top+14}L25 ${top}V5L0 20z" fill="#a1aa99"/><path d="M-25 ${top}L0 ${top+14} 25 ${top} 0 ${top-14}z" fill="#e0dac3"/><path d="M-25 ${top+20}L0 ${top+34} 25 ${top+20}M-25 ${top+40}L0 ${top+54} 25 ${top+40}" fill="none" stroke="#9ba28e"/><path d="M-12 9V-8Q-8-15-4-8V14M8-4v-11l7-4v11z" fill="#5c7069"/>`:'';
  const roof=stage>=3?'<path d="M-29-58Q-29-103 0-109Q29-103 29-58L0-42z" fill="#718b7e"/><path d="M0-109Q18-100 16-50L0-42z" fill="#92a798"/><path d="M-29-58L0-42 29-58v6L0-36-29-52z" fill="#b1ad8e"/>':stage===2&&active?'<path d="M-29-58Q-29-103 0-109Q29-103 29-58M0-109v65M-29-58L0-42 29-58" fill="none" stroke="#9b997d" stroke-width="3"/>':'';
  const instrument=stage>=3?`<path d="M0-103L13-95 13-51 0-44z" fill="#394f4b"/><g transform="rotate(${stage>=4?-23:-8} 5 -69)"><path d="M-4-68L28-89l7 10L3-57z" fill="#c0aa6a"/><path d="M28-89l7 10 4-3-7-10z" fill="#546e68"/><path d="M5-64v14" stroke="#d2bb7d" stroke-width="3"/></g>`:'';
  const scaffold=active&&stage<3?'<g fill="none" stroke="#9d8057" stroke-width="2"><path d="M-40 20V-80M-30 27V-75M33 24V-74M43 18V-80M-40-55l83 0M-40-25l83 0M-40 5l83 0M-40 5l10-30-10-30M33 5l10-30-10-30"/></g>':'';
  return `<svg viewBox="-85 -125 170 180" role="img" aria-label="Great Observatory: ${wonderStatus(state)}">${base}${foundation}${walls}${roof}${instrument}${scaffold}</svg>`;
}
export function buildingArt(type){let shapes='';
const house=(x,y,s=1,roof='#a56e49')=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M-17-3L0-13 18-3 0 7z" fill="#584b32" opacity=".4"/><path d="M-15-7L0 1v-22l-15-8z" fill="#d9c6a1"/><path d="M0 1l16-9v-21L0-21z" fill="#b3ad8b"/><path d="M-20-28L-4-48 20-28 2-17z" fill="${roof}"/><path d="M-20-28L-4-48-7-29 2-17z" fill="#c28d5c"/><path d="M-7-29L2-17 20-28" fill="none" stroke="#805d3e" stroke-width="1"/><path d="M5-2v-12l6-3v12z" fill="#5b644b"/><path d="M-11-17l5 3v-6l-5-3z" fill="#807e5c"/><path d="M13-37v-13l5-3v18" fill="#a49c7d"/></g>`;
if(type==='house')shapes=house(0,18,1.08);
if(type==='barn')shapes='<path d="M-28 9V-17L0-34 28-17V9L0 25z" fill="#af8762"/><path d="M0-4L28-17V9L0 25z" fill="#8c7755"/><path d="M-33-18L-6-49 33-18 0-4z" fill="#a36d4a"/><path d="M-33-18L-6-49-12-21 0-4z" fill="#c08d5a"/><path d="M-17 14V-5L-4 2v20z" fill="#695d42"/><path d="M-16-3L-5 20M-16 14L-5 3" stroke="#bba47b" stroke-width="2"/><path d="M10 14V-6M19 9v-20" stroke="#6f654d"/><path d="M-30 16l8 5m-5-10l8 5" stroke="#d6bc70" stroke-width="5"/>';
if(type==='warehouse')shapes='<path d="M-33 8V-25L0-44 33-25V8L0 27z" fill="#c3bca5"/><path d="M0-6L33-25V8L0 27z" fill="#9b9f8b"/><path d="M-38-27L-7-52 38-27 0-6z" fill="#758174"/><path d="M-38-27L-7-52-13-30 0-6z" fill="#929e8a"/><path d="M-25 12V-10L-8 0v22zM7 19V-5l17-10V9z" fill="#6e7056"/><path d="M-24-8L-9 19M-24 10L-9 1M9 15L23-11M9-4L23 8" stroke="#b9ac86" stroke-width="2"/><path d="M-38 17l10 6 10-6-10-6z" fill="#b39a6f"/><path d="M-38 17v10l10 6V23z" fill="#917d58"/><path d="M-28 23l10-6v10l-10 6z" fill="#a38f63"/>';
if(type==='stoneHouse')shapes='<path d="M-23 8V-22L0-35 24-22V8L0 22z" fill="#bfc2b6"/><path d="M0-8L24-22V8L0 22z" fill="#939e95"/><path d="M-27-24L-4-47 28-24 0-8z" fill="#707d80"/><path d="M-27-24L-4-47-8-26 0-8z" fill="#8f9a9b"/><path d="M-22-10L0 3 23-10M-22 0L0 13 23 0M-12-17v12M12-14v10M-12 5v10M12 6v10" fill="none" stroke="#818b82" stroke-width="1.2"/><path d="M5 16V1l8-5v16z" fill="#655b48"/><path d="M-17-13l7 4v8l-7-4zM15-13l5-3v7l-5 3z" fill="#556a6a"/>';
if(type==='hall')shapes=`${house(-9,18,1.3,'#b17d50')}<g transform="translate(13,-8)"><path d="M-9 15V-24L2-30 12-24V14L2 20z" fill="#c9c19d"/><path d="M2 20v-50l10 6v38z" fill="#a6a785"/><path d="M-14-24L1-44 16-24 2-15z" fill="#798e61"/><path d="M2-37v-21" stroke="#d4c79a"/><path d="M3-58l15 4-15 6z" fill="#c4c981"/><path d="M-4-9v-8l4-2v8zM5-9v-8l4 2v8z" fill="#596649"/></g>`;
if(type==='lumber')shapes=`<path d="M-29 14l31 17 32-18L2-4z" fill="#8c9c60"/>${treeArt(-20,0,.65)}${house(7,20,.77,'#7d8660')}<g stroke="#6a563a" stroke-width="6" stroke-linecap="round"><path d="M-22 17l17 9m-16-15l17 9m-10-16l16 9"/></g><g fill="#c7b180"><ellipse cx="-22" cy="17" rx="3" ry="4"/><ellipse cx="-21" cy="11" rx="3" ry="4"/></g>`;
if(type==='farm')shapes=`<path d="M-35 6L-5-12 36 11 6 29z" fill="#6c7844"/><g stroke="#cdb363" stroke-width="4">${Array.from({length:7},(_,i)=>`<path d="M${-28+i*5} ${7+i*2.7}l26-15"/>`).join('')}</g><g stroke="#f0d28a" stroke-width="1.5">${Array.from({length:6},(_,i)=>`<path d="M${-21+i*7} ${6+i*2}v-7m-2 3l2 2 2-4"/>`).join('')}</g>${house(13,-1,.6,'#b68c4e')}<path d="M-31 3v16m-1-11l36 21m0-6v10" stroke="#b3ad76" stroke-width="2"/>`;
if(type==='quarry')shapes=`<path d="M-35 8L-8-10 35 10 8 29z" fill="#7f896c"/><path d="M-27 6L-17-15 0-21 13-7 27 5 9 15z" fill="#a9ad96"/><path d="M-17-15L-8 2 9 15l-36-9z" fill="#c0c0a6"/><path d="M0-21l-8 23 21-9z" fill="#929c85"/><path d="M-15 10l8-5 11 6-2 9-12 3zM12 17l8-6 11 6-9 7z" fill="#c8c7a9"/><path d="M-24-20v28m-4-28l26 14M-4-6v22" stroke="#8b7751" stroke-width="3"/><path d="M-24-20l20 14m-11-8v17" stroke="#c0ad75" stroke-width="2"/>`;
if(type==='library')shapes=`${house(0,22,1.25,'#7f9172')}<path d="M-24-18L0-32 24-18 0-5z" fill="#b5b996"/><path d="M-21-14v24m8-19v24m10-18v24" stroke="#ebe0bd" stroke-width="4"/><path d="M-24 9L0 22 25 9v5L0 29-24 15z" fill="#a4ac8a"/><path d="M-8-36l7-4 8 4-8 4z" fill="#ddd7ad"/>`;
if(type==='kiln')shapes=`<path d="M-28 12L0 27 30 10 2-7z" fill="#9a9672"/><path d="M-20 9v-25l18-10 24 14v24L3 24z" fill="#b17b57"/><path d="M3 24V-1l19-11v24z" fill="#936c4f"/><path d="M-20-16L-2-26 22-12 3-1z" fill="#c5966a"/><path d="M-12 13V1c0-10 10-6 10 1v17" fill="#5d5741"/><path d="M-10 10l3-7 4 12z" fill="#e2b363"/><path d="M9-19v-31l9-5v31z" fill="#9f8160"/><path d="M9-50l9-5 5 3-9 5z" fill="#c5a180"/><path d="M-26 15l8 5m-6-9l8 5m32 8l12-7" stroke="#bf9169" stroke-width="4"/>`;
if(type==='workshop')shapes=house(0,20,1.15,'#6c7d62')+'<path d="M-25 10l23 13 20-12" stroke="#7e6448" stroke-width="5"/><path d="M-17-10l12 6m-4-12l-6 15" stroke="#c2c4ac" stroke-width="3"/>';
if(type==='residence')shapes=house(-11,20,.95,'#947252')+house(11,4,1.15,'#997552');
if(type==='guildhall')shapes=house(0,20,1.4,'#84724c')+'<path d="M0-45v-21m0 1l17 4-17 8" stroke="#c7a76a" fill="#8b5b44"/>';
if(type==='grandArchive')shapes=house(-12,22,1.2,'#596f77')+house(12,2,1.5,'#596f77');
if(type==='academy')shapes=house(0,20,1.5,'#6b806e')+'<path d="M-26-11L0-26 27-11 0 4z" fill="#c9ccb6"/><path d="M-20-7v23m10-18v23m10-17v23m10-29v23m10-29v23" stroke="#e5dcc5" stroke-width="3"/>';
if(type==='study')shapes=house(0,14,.9,'#7d8c71')+'<path d="M-12 7L0 11 12 7 0 3z" fill="#eee6cd"/><path d="M0 4v7" stroke="#9b8b6a"/>';
if(type==='fishery'||type==='wharf')shapes=house(8,5,.65,'#6b8175')+'<path d="M-30 8L4 27 27 14-8-5z" fill="#a48c65"/><path d="M-25 11l24 14m-17-19l24 14m-17-19l24 14" stroke="#cfb58a" stroke-width="2"/><path d="M-28 16l7 8 17 5-4-8z" fill="#6a5842"/>';
return `<svg viewBox="-48 -72 96 112" aria-hidden="true">${shapes}</svg>`;}
function treeArt(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="2" cy="2" rx="13" ry="6" fill="#2e4934" opacity=".25"/><path d="M-2 2v-17h5V2" fill="#82704a"/><path d="M-16-11L0-40 17-11 0-2z" fill="#486c42"/><path d="M0-40L17-11 0-2z" fill="#395c3b"/><path d="M-13-23L0-47 14-23 0-16z" fill="#5e7e4b"/><path d="M0-47L14-23 0-16z" fill="#496d42"/></g>`;}
const bareArt=type=>buildingArt(type).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');

export function mapHTML(state) {
  const size=mapSize(state),center=37*size+67;
  let tiles = '';
  for (let sum = 0; sum <= 2*(size-1); sum++) for (let x = 0; x < size; x++) {
    const y = sum - x;
    if (y < 0 || y >= size) continue;
    const t = terrain(x, y), b = state.buildings.find(b => b.x === x && b.y === y);
    const px = center + (x - y) * 37, py = 52 + (x + y) * 21;
    if(!tileKnown(state,x,y)){tiles+=`<g class="unexplored-tile" transform="translate(${px} ${py})" aria-label="Unexplored tile"><path d="M0-21L37 0 0 21-37 0z" fill="#c7cbbf" stroke="#b5baac" stroke-width=".7"/></g>`;continue;}
    const colors = { grass: '#a9b78c', forest: '#8ea77a', rock: '#a6ad96', water: '#8bb5b1' };
    let decor = '';
    if (!b && t === 'forest') decor = treeArt(-12, 0, .6) + treeArt(9, 9, .8);
    if (!b && t === 'rock') decor = '<path d="M-16 4l6-17 12-3 10 13-6 10z" fill="#c8cabc"/><path d="M-10-13l3 16 13 4 6-10-10-13z" fill="#afb7a1"/>';
    if (!b && t === 'water') decor = '<path d="M-17 0l10 5m8-9l11 6" stroke="#d4e2d8" stroke-width="1" opacity=".5"/>';
    if (b) decor = `<g transform="scale(.83)">${bareArt(b.type)}</g>`;
    tiles += `<g class="tile" transform="translate(${px} ${py})" role="button" tabindex="0" data-x="${x}" data-y="${y}" aria-label="${b ? BUILDINGS[b.type].name : t + ' tile'}, column ${x + 1}, row ${y + 1}"><path d="M-37 0L0 21 37 0v7L0 28-37 7z" fill="${t === 'water' ? '#688f8c' : '#83916d'}"/><path class="tile-surface" d="M0-21L37 0 0 21-37 0z" fill="${colors[t]}" stroke="#566a5140" stroke-width=".7"/>${decor}</g>`;
  }
  const visible=state.wonder.stage>0||state.wonder.remaining>0;
  const landmark=visible?`<g class="wonder-landmark" role="button" tabindex="0" data-open-wonder aria-label="Great Observatory: ${wonderStatus(state)}" transform="translate(${center+size*25} 117) scale(.82)"><title>Great Observatory: ${wonderStatus(state)}</title>${wonderArt(state).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')}</g>`:'';
  return `<svg class="map-svg" viewBox="48 8 ${size*74+38} ${size*42+38}" aria-label="Settlement map">${tiles}${landmark}</svg>`;
}

