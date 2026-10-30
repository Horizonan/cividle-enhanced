// Permanent collections are claimed only when completing a civilization.
export const COLLECTIONS=[
 ['buildings','Buildings constructed',[10,25,50,100,200]],['wheat','Wheat harvested',[1000,10000,100000,1000000]],
 ['wood','Wood produced',[1000,10000,100000,1000000]],['stone','Stone quarried',[1000,10000,100000,1000000]],
 ['science','Knowledge produced',[500,5000,50000,500000]],['tool','Tools crafted',[100,1000,10000,100000]],
 ['population','Peak population',[12,24,60,120,240]],['tiles','Explored tiles',[49,81,169,441,1681]],
].map(([id,name,thresholds])=>({id,name,thresholds}));
export const MEMENTOS=[
 {id:'grain',name:'First grain',description:'Harvest 1,000 wheat.',key:'wheat',target:1000},
 {id:'tablet',name:'Stone tablet',description:'Quarry 1,000 stone.',key:'stone',target:1000},
 {id:'gear',name:'Workshop gear',description:'Craft 100 tools.',key:'tool',target:100},
 {id:'compass',name:'Explorer’s compass',description:'Reveal 49 tiles.',key:'tiles',target:49},
 {id:'shell',name:'Voyager’s shell',description:'Complete a ship.'},
 {id:'lens',name:'Observatory lens',description:'Complete the first observation.'},
 {id:'seal',name:'Guild seal',description:'Build a guildhall.'},
 {id:'chart',name:'Celestial chart',description:'Complete the Celestial Atlas.'},
];
export const CONSTELLATIONS=[
 {id:'harvester',name:'The Harvester',subtitle:'Food & storage',stars:[
 {id:'seed',name:'Seed',cost:5,description:'+20% wheat and fish production.'},
 {id:'hearth',name:'Hearth',cost:8,description:'Residents consume 10% less food.',requires:'seed'},
 {id:'granary',name:'Abundance',cost:13,description:'+25% storage for every resource.',requires:'hearth'}]},
 {id:'artificer',name:'The Artificer',subtitle:'Materials & industry',stars:[
 {id:'chisel',name:'Chisel',cost:5,description:'+15% wood and stone production.'},
 {id:'forge',name:'Forge',cost:8,description:'+20% brick and tool production.',requires:'chisel'},
 {id:'engine',name:'Engine',cost:13,description:'+10% production from buildings and ships.',requires:'forge'}]},
 {id:'scholar',name:'The Scholar',subtitle:'Research & construction',stars:[
 {id:'thought',name:'Thought',cost:5,description:'New research takes 15% less time.'},
 {id:'archive',name:'Memory',cost:8,description:'+25% knowledge production.',requires:'thought'},
 {id:'vision',name:'Vision',cost:13,description:'New wonder stages take 15% less time.',requires:'archive'}]},
 {id:'wayfarer',name:'The Wayfarer',subtitle:'Exploration & trade',stars:[
 {id:'trail',name:'Trail',cost:5,description:'+25% exploration speed.'},
 {id:'tide',name:'Tide',cost:8,description:'+30% fish from ships.',requires:'trail'},
 {id:'exchange',name:'Exchange',cost:13,description:'+20% resident coin income.',requires:'tide'}]},
];
export const STARS=CONSTELLATIONS.flatMap(c=>c.stars);
export const hasStar=(s,id)=>s.meta.stars?.includes(id)||false;
export const blankCollections=()=>({records:Object.fromEntries(COLLECTIONS.map(c=>[c.id,0])),tiers:Object.fromEntries(COLLECTIONS.map(c=>[c.id,0])),items:[],claimedItems:[]});
export const blankStats=()=>({constructed:0,produced:Object.fromEntries(['wheat','wood','stone','science','coin','brick','tool','fish'].map(k=>[k,0])),peakPopulation:6,peakTiles:25});
export function recordCollections(s){
 const r=s.runStats,c=s.meta.collections;if(!r||!c)return;
 r.peakPopulation=Math.max(r.peakPopulation,s.population);r.peakTiles=Math.max(r.peakTiles,s.exploration.tiles.length);
 for(const row of COLLECTIONS){const value=row.id==='buildings'?r.constructed:row.id==='population'?r.peakPopulation:row.id==='tiles'?r.peakTiles:r.produced[row.id];c.records[row.id]=Math.max(c.records[row.id],value);}
 for(const item of MEMENTOS){const earned=item.key?c.records[item.key]>=item.target:item.id==='shell'?s.fleet.ships>0:item.id==='lens'?s.wonder.stage>=4:item.id==='seal'?s.buildings.some(b=>b.type==='guildhall'):s.wonder.stage>=6;
 if(earned&&!c.items.includes(item.id))c.items.push(item.id);}
}
export function evolutionQuote(s){
 const c=s.meta.collections,rows=COLLECTIONS.map(row=>{const reached=row.thresholds.filter(n=>c.records[row.id]>=n).length,claimed=c.tiers[row.id];return {...row,value:c.records[row.id],reached,claimed,points:[1,1,2,3,5].slice(claimed,reached).reduce((a,b)=>a+b,0)};});
 const items=c.items.filter(id=>!c.claimedItems.includes(id)),collectionPoints=rows.reduce((n,row)=>n+row.points,0);
 return {base:12,collectionPoints,itemPoints:items.length,total:12+collectionPoints+items.length,rows,items};
}
export function buyStar(s,id){
 if(s.paused)return 'Resume the game to choose a star.';
 if(!s.meta.revolutions)return 'Complete your first RE-Evolution first.';
 const star=STARS.find(x=>x.id===id);if(!star||hasStar(s,id))return 'This star is not available.';
 if(star.requires&&!hasStar(s,star.requires))return 'Unlock the preceding star first.';
 if(s.meta.insight<star.cost)return 'Not enough Evolution Points.';
 s.meta.insight-=star.cost;s.meta.stars.push(id);return null;
}
export function acknowledgeEvolution(s){s.meta.pendingEvolution=null;}
export function validEvolution(s){
 const c=s.meta.collections,r=s.runStats,integer=n=>Number.isSafeInteger(n)&&n>=0,positive=n=>Number.isFinite(n)&&n>=0;
 if(!r||!integer(r.constructed)||!integer(r.peakPopulation)||r.peakPopulation<6||!integer(r.peakTiles)||r.peakTiles<25||!r.produced||Object.keys(blankStats().produced).some(k=>!positive(r.produced[k])))return false;
 if(!Array.isArray(s.meta.stars)||new Set(s.meta.stars).size!==s.meta.stars.length||s.meta.stars.some(id=>!STARS.some(x=>x.id===id)||STARS.find(x=>x.id===id).requires&&!hasStar(s,STARS.find(x=>x.id===id).requires))||s.meta.stars.length&&!s.meta.revolutions)return false;
 if(!c||!c.records||!c.tiers||COLLECTIONS.some(row=>!positive(c.records[row.id])||!integer(c.tiers[row.id])||c.tiers[row.id]>row.thresholds.filter(n=>c.records[row.id]>=n).length))return false;
 if(['items','claimedItems'].some(key=>!Array.isArray(c[key])||new Set(c[key]).size!==c[key].length||c[key].some(id=>!MEMENTOS.some(x=>x.id===id)))||c.claimedItems.some(id=>!c.items.includes(id)))return false;
 const p=s.meta.pendingEvolution;
 return p===null||!!p&&integer(p.base)&&p.base===12&&integer(p.collectionPoints)&&integer(p.itemPoints)&&p.total===p.base+p.collectionPoints+p.itemPoints&&s.meta.history.some(h=>h.currency==='EP'&&h.run===s.meta.revolutions&&h.reward===p.total);
}
