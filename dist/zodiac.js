import {ZODIAC_SHAPES} from './zodiac-shapes.js';
// One purchasable upgrade per star in the twelve real zodiac line figures.
const SIGNS=[
 ['aries','Ari','Aries','♈','The Ram','Wonders & momentum','fire',['First spark','Golden fleece','Ram’s resolve','Dawn charge'],['wonder','tool','all'],{wonder:.15,all:.05}],
 ['taurus','Tau','Taurus','♉','The Bull','Materials & industry','earth',['Chisel','Forge','Engine','Oxen strength','Copper vein','Deep roots','Iron resolve','Stonebound','Foundry light','Enduring craft','Bull’s heart','Earthshaker'],['raw','industry','stone'],{raw:.15}],
 ['gemini','Gem','Gemini','♊','The Twins','Research & growth','air',['Twinned minds','Shared wisdom','First dialogue','Mirror thought','Common purpose','Second perspective','Exchange of ideas','Learning circle','Kindred spirits','United hands','Twin horizons','Concord'],['research','science','growth'],{research:.15,growth:.1}],
 ['cancer','Cnc','Cancer','♋','The Crab','Food & reserves','water',['Sheltered hearth','Tidal stores','Safe harbour','Gathered plenty','Sanctuary'],['foodUse','storage','growth'],{storage:.2,foodUse:.03}],
 ['leo','Leo','Leo','♌','The Lion','Prosperity & production','fire',['Lionheart','Pride of the city','Golden mane','Royal treasury','Strength of many','Crown of light','Sovereign craft','Radiant ambition','Solar crown'],['all','coins','wonder'],{all:.1,coins:.1}],
 ['virgo','Vir','Virgo','♍','The Maiden','Harvests & abundance','earth',['Seed','Hearth','Abundance','Fertile earth','Patient tending','Golden sheaf','Harvest moon','Threshing floor','Seed bank','Ripening fields','Gathering season','Keeper of grain','Endless harvest'],['food','storage','wheat'],{food:.2}],
 ['libra','Lib','Libra','♎','The Scales','Trade & balance','air',['Even measure','Honest exchange','Market weight','Balanced ledgers','Prosperous trade','Golden equilibrium'],['coins','storage','science'],{coins:.2,storage:.1}],
 ['scorpio','Sco','Scorpio','♏','The Scorpion','Tools & refining','water',['Tempered edge','Precise strike','Mineral insight','Deep extraction','Hidden seam','Metalworker','Stone furnace','Measured heat','Fine instruments','Hardened steel','Master’s touch','Night forge','Perfect temper','Obsidian sting'],['tool','brick','industry'],{industry:.2}],
 ['sagittarius','Sgr','Sagittarius','♐','The Archer','Exploration & voyages','fire',['Trail','Tide','Exchange','Far sight','Drawn bow','Open road','Charted waters','Trade winds','Distant beacon','Trailblazer','Swift crossing','Surveyor’s mark','River passage','Salt and sail','Lookout','Beyond the ridge','Navigator','New horizons','Celestial bearing','Pathfinder','Western passage','Voyager','Wanderer’s wisdom','Unerring course','Arrow of discovery'],['exploration','shipBuild','shipFish','coins'],{exploration:.25,shipBuild:.15}],
 ['capricorn','Cap','Capricorn','♑','The Sea Goat','Stone & construction','earth',['Mountain footing','Quarry face','Load bearing','Dressed stone','Firm foundations','Mason’s line','Rising tower','Stone vault','Enduring monument','Summit'],['stone','brick','wonder','storage'],{stone:.2,wonder:.1}],
 ['aquarius','Aqr','Aquarius','♒','The Water Bearer','Knowledge & discovery','air',['Thought','Memory','Vision','Flow of ideas','Written legacy','Reasoned inquiry','Open academy','Experiment','Scholarly exchange','Bright hypothesis','Collected wisdom','Long observation','New theory','Age of reason','Fountain of knowledge'],['science','research','scienceStorage','wonder'],{science:.2,research:.1}],
 ['pisces','Psc','Pisces','♓','The Fishes','Fishing & seafaring','water',['First current','Silver shoal','Calm waters','Cast net','Ocean stores','Twin currents','Tidal rhythm','Open sea','Well fed','Estuary','Seafarer','Deep water','Moon tide','Safe anchorage','Ocean bounty','Plentiful catch','Current reader','Blue horizon','Net maker','Sea passage','Abundant waters','Ocean’s embrace'],['fish','shipFish','foodUse','shipBuild'],{fish:.25,shipFish:.2}],
];
const LEGACY={
 taurus:[{id:'chisel',cost:5,description:'+15% wood and stone production.'},{id:'forge',cost:8,description:'+20% brick and tool production.',requires:'chisel'},{id:'engine',cost:13,description:'+10% production from buildings and ships.',requires:'forge'}],
 virgo:[{id:'seed',cost:5,description:'+20% wheat and fish production.'},{id:'hearth',cost:8,description:'Residents consume 10% less food.',requires:'seed'},{id:'granary',cost:13,description:'+25% storage for every resource.',requires:'hearth'}],
 aquarius:[{id:'thought',cost:5,description:'New research takes 15% less time.'},{id:'archive',cost:8,description:'+25% knowledge production.',requires:'thought'},{id:'vision',cost:13,description:'New wonder stages take 15% less time.',requires:'archive'}],
 sagittarius:[{id:'trail',cost:5,description:'+25% exploration speed.'},{id:'tide',cost:8,description:'+30% fish from ships.',requires:'trail'},{id:'exchange',cost:13,description:'+20% resident coin income.',requires:'tide'}],
};
export const BONUS_LABELS={all:'all building and ship production',food:'wheat and fish production',wheat:'wheat production',fish:'fishing dock production',raw:'wood and stone production',stone:'stone production',industry:'brick and tool production',brick:'brick production',tool:'tool production',science:'knowledge production',storage:'all resource storage',scienceStorage:'knowledge storage',research:'speed for new research',wonder:'speed for new wonder stages',exploration:'exploration speed',coins:'resident coin income',growth:'population growth speed',shipBuild:'ship construction speed',shipFish:'fishing ship production',foodUse:'less food consumed by residents'};
const strength={all:.025,food:.05,wheat:.06,fish:.06,raw:.045,stone:.06,industry:.04,brick:.06,tool:.05,science:.05,storage:.05,scienceStorage:.08,research:.04,wonder:.05,exploration:.06,coins:.06,growth:.05,shipBuild:.06,shipFish:.06,foodUse:.015};
export const effectsText=effects=>Object.entries(effects).map(([key,n])=>(key==='foodUse'?'−':'+')+Math.round(n*1000)/10+'% '+(key==='foodUse'?'resident food consumption':BONUS_LABELS[key])).join(' · ');
function geometry(shape){
 const xs=shape.points.map(p=>p[0]),wrap=Math.max(...xs)-Math.min(...xs)>180;
 const dec=shape.points.reduce((n,p)=>n+p[1],0)/shape.points.length,cos=Math.cos(dec*Math.PI/180);
 const raw=shape.points.map(([x,y])=>[-(wrap&&x<0?x+360:x)*cos,-y]);
 const lo=[Math.min(...raw.map(p=>p[0])),Math.min(...raw.map(p=>p[1]))],hi=[Math.max(...raw.map(p=>p[0])),Math.max(...raw.map(p=>p[1]))],scale=Math.min(720/(hi[0]-lo[0]),440/(hi[1]-lo[1]));
 const anchors=raw.map(p=>[+(450+(p[0]-(hi[0]+lo[0])/2)*scale).toFixed(2),+(300+(p[1]-(hi[1]+lo[1])/2)*scale).toFixed(2)]),points=anchors.map(p=>[...p]);
 // Preserve the celestial outline while separating close stars for readable hit areas.
 for(let step=0;step<180;step++){
  for(let a=0;a<points.length;a++)for(let b=a+1;b<points.length;b++){
   let dx=points[b][0]-points[a][0],dy=points[b][1]-points[a][1],d=Math.hypot(dx,dy);if(d<72){if(d<.01){dx=.1;dy=.1;d=.14;}const f=(72-d)/d*.45;points[a][0]-=dx*f;points[a][1]-=dy*f;points[b][0]+=dx*f;points[b][1]+=dy*f;}
  }
  for(let i=0;i<points.length;i++)for(let axis=0;axis<2;axis++)points[i][axis]+=(anchors[i][axis]-points[i][axis])*.012;
 }
 return {anchors,points:points.map(([x,y])=>[+Math.max(45,Math.min(855,x)).toFixed(2),+Math.max(45,Math.min(555,y)).toFixed(2)])};
}
export const CONSTELLATIONS=SIGNS.map(([id,abbr,name,glyph,title,subtitle,element,names,kinds,mastery])=>{
 const shape=ZODIAC_SHAPES.find(x=>x.id===abbr),{points,anchors}=geometry(shape),parents=Array(points.length).fill(null),depth=Array(points.length).fill(-1),queue=[0];depth[0]=0;
 for(const i of queue)for(const edge of shape.edges){if(!edge.includes(i))continue;const next=edge[0]===i?edge[1]:edge[0];if(depth[next]<0){depth[next]=depth[i]+1;parents[next]=i;queue.push(next);}}
 const ids=points.map((_,i)=>LEGACY[id]?.[i]?.id||id+'_'+i);
 const stars=points.map(([x,y],i)=>{
  const old=LEGACY[id]?.[i],key=kinds[i%kinds.length],leaf=!parents.includes(i),major=leaf&&depth[i]>1;
  const effects=old?{}:{[key]:strength[key]*(major?2:1)},requires=old?old.requires:(parents[i]===null?undefined:ids[parents[i]]);
  return {id:ids[i],sign:id,name:names[i],cost:old?.cost||Math.min(9,3+Math.ceil(depth[i]/2)+(major?1:0)),description:old?.description||effectsText(effects),effects,requires,depth:depth[i],major,x,y};
 });
 return {id,abbr,name,glyph:glyph+'︎',title,subtitle,element,stars,edges:shape.edges,anchors,mastery,masteryDescription:effectsText(mastery)};
});
export const STARS=CONSTELLATIONS.flatMap(c=>c.stars);
export const LEGACY_STAR_IDS=Object.values(LEGACY).flat().map(s=>s.id);
export const prerequisites=star=>!star?.requires?[]:Array.isArray(star.requires)?star.requires:[star.requires];
const bonusCache=new WeakMap();
export function constellationBonuses(s){
 const owned=s.meta.stars||[],cached=bonusCache.get(owned);if(cached?.length===owned.length)return cached;
 const set=new Set(owned),bonuses={},masteries=[];const add=effects=>{for(const [key,n]of Object.entries(effects))bonuses[key]=(bonuses[key]||0)+n;};
 for(const star of STARS)if(set.has(star.id))add(star.effects);
 for(const sign of CONSTELLATIONS)if(sign.stars.every(star=>set.has(star.id))){add(sign.mastery);masteries.push(sign.id);}
 const result={length:owned.length,bonuses,masteries};bonusCache.set(owned,result);return result;
}
export const starBonus=(s,key)=>constellationBonuses(s).bonuses[key]||0;
