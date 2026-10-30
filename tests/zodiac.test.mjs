import test from 'node:test';
import assert from 'node:assert/strict';
import {CONSTELLATIONS,STARS,LEGACY_STAR_IDS,prerequisites,starBonus,constellationBonuses,fresh,buyStar,serialize,restore,hasStar,foodConsumption,multiplier,researchDuration,wonderDuration,storageCapacity,buildingStorage,nextArrival,tick,harvest,build,assignWorkers,explorationRate,startShip,SHIP_DURATION,JOB_TYPES} from '../dist/model.js';
import {ZODIAC_SHAPES} from '../dist/zodiac-shapes.js';
import {zodiacHTML} from '../dist/zodiac-ui.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b);
function world(){const s=fresh(1000);s.meta.revolutions=1;s.meta.insight=10000;return s;}
function buySign(s,id){const sign=CONSTELLATIONS.find(c=>c.id===id);for(const star of [...sign.stars].sort((a,b)=>a.depth-b.depth))assert.equal(buyStar(s,star.id),null,star.id);return sign;}
function owned(id){const s=world();buySign(s,id);return s;}

test('the full tree has twelve zodiac signs, 147 unique stars and real connected line figures',()=>{
 assert.deepEqual(CONSTELLATIONS.map(c=>c.name),['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']);assert.equal(STARS.length,147);assert.equal(new Set(STARS.map(s=>s.id)).size,147);
 for(const sign of CONSTELLATIONS){const shape=ZODIAC_SHAPES.find(x=>x.id===sign.abbr);assert.equal(sign.stars.length,shape.points.length);assert.deepEqual(sign.edges,shape.edges);assert.ok(sign.stars.every(star=>star.name&&star.description&&star.cost>=3&&star.cost<=13&&star.x>=45&&star.x<=855&&star.y>=45&&star.y<=555));
  const roots=sign.stars.filter(star=>!prerequisites(star).length);assert.equal(roots.length,1);
  for(const star of sign.stars)for(const parentId of prerequisites(star)){const parent=sign.stars.find(x=>x.id===parentId);assert.ok(parent);assert.ok(parent.depth<star.depth);const a=sign.stars.indexOf(star),b=sign.stars.indexOf(parent);assert.ok(sign.edges.some(edge=>edge.includes(a)&&edge.includes(b)));}
  for(const a of sign.stars)for(const b of sign.stars)if(a!==b)assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=60,'Separated targets in '+sign.name);
 }
 assert.ok(CONSTELLATIONS.some(c=>c.stars.some(parent=>c.stars.filter(child=>prerequisites(child).includes(parent.id)).length>=3)));
});
test('all twelve previous purchases keep their identities, prices, prerequisites and effects',()=>{
 const s=world();for(const id of LEGACY_STAR_IDS)assert.equal(buyStar(s,id),null);assert.equal(s.meta.stars.length,12);assert.deepEqual(constellationBonuses(s).masteries,[]);assert.deepEqual(constellationBonuses(s).bonuses,{});assert.ok(restore(serialize(s,1000),1000));
 assert.equal(CONSTELLATIONS.find(c=>c.id==='virgo').stars[0].id,'seed');assert.equal(STARS.find(x=>x.id==='granary').requires,'hearth');assert.equal(STARS.find(x=>x.id==='engine').cost,13);
 near(multiplier(s,{type:'farm'}),1.2*1.1);near(foodConsumption(s),.27);near(researchDuration(s,'agriculture'),76.5);
});
test('new branches enforce their parent without partial payments and remain open as independent choices',()=>{
 const s=world(),sign=CONSTELLATIONS.find(c=>c.id==='scorpio'),child=sign.stars.find(x=>x.depth>2),before=structuredClone(s);assert.ok(buyStar(s,child.id));assert.deepEqual(s,before);
 assert.equal(buyStar(s,sign.stars[0].id),null);assert.equal(buyStar(s,'aries_0'),null);assert.equal(buyStar(s,'gemini_0'),null);assert.equal(s.meta.stars.length,3);
 s.meta.insight=0;const poor=structuredClone(s);assert.ok(buyStar(s,'cancer_0'));assert.deepEqual(s,poor);
});
test('every sign can be completed in depth order and mastery activates exactly on its final purchase',()=>{
 for(const sign of CONSTELLATIONS){const s=world(),ordered=[...sign.stars].sort((a,b)=>a.depth-b.depth);for(const star of ordered.slice(0,-1))assert.equal(buyStar(s,star.id),null);assert.deepEqual(constellationBonuses(s).masteries,[]);
  const key=Object.keys(sign.mastery)[0],prior=starBonus(s,key),last=ordered.at(-1);assert.equal(buyStar(s,last.id),null);assert.deepEqual(constellationBonuses(s).masteries,[sign.id]);near(starBonus(s,key),prior+(last.effects[key]||0)+sign.mastery[key]);const balance=s.meta.insight;assert.ok(buyStar(s,last.id));assert.equal(s.meta.insight,balance);assert.deepEqual(constellationBonuses(s).masteries,[sign.id]);
 }
});
test('all 147 stars and twelve masteries round-trip without modifying points on reload',()=>{
 const s=world();for(const sign of CONSTELLATIONS)buySign(s,sign.id);assert.equal(s.meta.stars.length,147);assert.equal(constellationBonuses(s).masteries.length,12);assert.equal(s.meta.insight,10000-STARS.reduce((n,star)=>n+star.cost,0));
 const loaded=restore(serialize(s,1000),1000);assert.ok(loaded);assert.deepEqual(loaded.state.meta.stars,s.meta.stars);assert.equal(loaded.state.meta.insight,s.meta.insight);assert.deepEqual(constellationBonuses(loaded.state),constellationBonuses(s));
 const reset=fresh(2000,s.meta);assert.deepEqual(constellationBonuses(reset),constellationBonuses(s));assert.equal(reset.meta.insight,s.meta.insight);
});
test('new output, capacity and timer effects apply to actual simulation categories',()=>{
 const s=world();for(const sign of CONSTELLATIONS)buySign(s,sign.id);const base=fresh();
 const factors=(...keys)=>keys.reduce((n,key)=>n*(1+starBonus(s,key)),1);
 near(multiplier(s,{type:'farm'}),1.1*1.2*factors('all','food','wheat'));near(multiplier(s,{type:'quarry'}),1.1*1.15*factors('all','raw','stone'));near(multiplier(s,{type:'kiln'}),1.1*1.2*factors('all','industry','brick'));near(multiplier(s,{type:'workshop'}),1.1*1.2*factors('all','industry','tool'));near(multiplier(s,{type:'grandArchive'}),1.1*1.25*factors('all','science'));near(multiplier(s,{type:'fishery'}),1.1*1.2*factors('all','food','fish'));near(multiplier(s,{type:'ship'}),1.1*1.2*1.3*factors('all','food','shipFish'));
 assert.equal(storageCapacity(s,'wheat'),Math.floor(50*1.25*(1+starBonus(s,'storage'))));assert.equal(storageCapacity(s,'science'),Math.floor(25*1.25*factors('storage','scienceStorage')));near(buildingStorage(s,'academy').science,100*1.25*factors('storage','scienceStorage'));
 near(researchDuration(s,'agriculture'),90*.85/(1+starBonus(s,'research')));near(wonderDuration(s,0),1800*.85/(1+starBonus(s,'wonder')));near(foodConsumption(s),.3*.9*Math.max(.4,1-starBonus(s,'foodUse')));
 s.mapUnlocked=true;s.assignments.explorer=2;near(explorationRate(s),2*1.25*(1+starBonus(s,'exploration')));
 s.tech=['trade'];tick(s,10);near(s.resources.coin,6*.01*1.2*(1+starBonus(s,'coins'))*10);
});
test('growth stars shorten arrivals while preserving partial work, food gating, pause and offline timing',()=>{
 const s=owned('gemini');s.tech=['housing','granaries'];s.earned.wheat=1000;s.resources.wheat=200;s.resources.wood=100;assert.equal(build(s,'house'),null);s.growthProgress=30;const remaining=30/(1+starBonus(s,'growth'));near(nextArrival(s),remaining);tick(s,remaining-.1);assert.equal(s.population,6);tick(s,.1);assert.equal(s.population,7);
 s.resources.wheat=0;const progress=s.growthProgress;tick(s,200);near(s.growthProgress,progress);s.resources.wheat=100;s.paused=true;const before=structuredClone(s);tick(s,1000);assert.deepEqual(s,before);
 s.paused=false;const reload=restore(serialize(s,1000),61000);assert.ok(reload);assert.ok(reload.state.population>7);
});
test('ship speed stars finish paid work at the correct boundary online, paused and offline',()=>{
 const s=owned('pisces');s.tech=['shipping'];s.buildings=[{type:'wharf',x:2,y:5}];s.resources.wood=200;s.resources.tool=20;s.resources.coin=50;assert.equal(startShip(s),null);const duration=SHIP_DURATION/(1+starBonus(s,'shipBuild'));tick(s,duration-.01);assert.equal(s.fleet.ships,0);tick(s,.01);assert.equal(s.fleet.ships,1);
 s.resources.wood=200;s.resources.tool=20;s.resources.coin=50;assert.equal(startShip(s),null);s.paused=true;const before=structuredClone(s);tick(s,1000);assert.deepEqual(s,before);s.paused=false;
 const loaded=restore(serialize(s,1000),1000+duration*1000);assert.ok(loaded);assert.equal(loaded.state.fleet.ships,2);assert.equal(loaded.state.fleet.building,null);
});
test('broken new paths, duplicate stars and unknown zodiac IDs are rejected without affecting old saves',()=>{
 for(const mutation of [s=>s.meta.stars=['pisces_4'],s=>s.meta.stars=['aries_0','aries_0'],s=>s.meta.stars=['ophiuchus_0']]){const s=world();mutation(s);assert.equal(restore(serialize(s,1000),1000),null);}
 const s=owned('aries');const data=serialize(s,1000);const bad=JSON.parse(data);bad.meta.stars=bad.meta.stars.filter(id=>id!=='aries_1');assert.equal(restore(JSON.stringify(bad),1000),null);
});
test('both atlas and focused views expose every star, status, costs and accessible selection controls',()=>{
 const s=world(),atlas=zodiacHTML(s,'seed');assert.equal((atlas.match(/class="zodiac-node /g)||[]).length,147);assert.ok(atlas.includes('Full tree'));assert.ok(atlas.includes('Select a star'));assert.ok(atlas.includes('credits.html'));assert.ok(!atlas.includes('undefined'));
 for(const sign of CONSTELLATIONS){const html=zodiacHTML(s,sign.stars[0].id,{view:'sign',zoom:2});assert.equal((html.match(/class="zodiac-node /g)||[]).length,sign.stars.length);assert.ok(html.includes(sign.name+' mastery'));assert.ok(html.includes('1800px'));assert.ok(!html.includes('undefined'));}
});
