import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {fresh,TECH,build,buildCost,count,capacity,population,demolitionQuote,demolishHome,stageIndex,research,serialize,restore,storageCapacity,tick} from '../dist/model.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
function homes(n=3){const s=fresh(1000);s.tech=['housing','warehousing'];s.earned.wheat=5000;s.resources.wheat=2000;s.resources.wood=2000;s.resources.stone=2000;for(let i=0;i<2;i++)assert.equal(build(s,'warehouse'),null);s.tech.push('organizedStorage');for(let i=0;i<n;i++)assert.equal(build(s,'house'),null);return s;}
const full=simulateFirstRun().state;
// Extra land and stores isolate demolition from separate space/storage bottlenecks.
full.exploration.size=13;full.exploration.tiles=Array.from({length:169},(_,i)=>i%13+','+Math.floor(i/13));
for(let i=0;i<2;i++){for(const key of Object.keys(full.resources))full.resources[key]=10000;assert.equal(build(full,'warehouse'),null);}
for(const key of Object.keys(full.resources))full.resources[key]=Math.min(5000,storageCapacity(full,key)-500);
const lastHome=(s,type='house')=>s.buildings.filter(b=>b.type===type).at(-1);

test('demolition returns exactly 25% of the original paid price, including fractional materials',()=>{
  const s=homes(),home=lastHome(s),before=structuredClone(s);
  const quote=demolitionQuote(s,home.x,home.y);
  assert.deepEqual(quote.refund,{wheat:59,wood:29.5});assert.equal(quote.reason,null);assert.deepEqual(s,before);
  assert.equal(demolishHome(s,home.x,home.y),null);assert.equal(count(s,'house'),2);
  near(s.resources.wheat,before.resources.wheat+59);near(s.resources.wood,before.resources.wood+29.5);
  assert.deepEqual(s.earned,before.earned);assert.deepEqual(s.assignments,before.assignments);assert.equal(s.population,before.population);
  assert.equal(capacity(s),18);assert.ok(!s.buildings.some(b=>b.x===home.x&&b.y===home.y));
});
test('removing selected earlier homes and rebuilding cannot change another home’s refund',()=>{
  const s=homes(),[first,second]=s.buildings.filter(b=>b.type==='house');
  assert.equal(demolishHome(s,first.x,first.y),null);assert.equal(build(s,'house'),null);
  const loaded=restore(serialize(s,1000),1000);assert.ok(loaded);
  assert.deepEqual(loaded.state.buildings.filter(b=>b.type==='house').map(b=>b.costIndex),[1,2,2]);
  assert.deepEqual(demolitionQuote(loaded.state,second.x,second.y).refund,{wheat:42,wood:21});
  assert.equal(demolishHome(loaded.state,second.x,second.y),null);assert.ok(restore(serialize(loaded.state,1000),1000));
});
test('occupied housing cannot be demolished and population never disappears',()=>{
  const s=homes(1);s.population=7;const home=lastHome(s),before=structuredClone(s);
  assert.match(demolitionQuote(s,home.x,home.y).reason,/Not enough housing/);assert.match(demolishHome(s,home.x,home.y),/Not enough housing/);
  assert.deepEqual(s,before);
  s.population=6;s.growthProgress=25;assert.equal(demolishHome(s,home.x,home.y),null);assert.equal(capacity(s),6);assert.equal(population(s),6);assert.equal(s.growthProgress,0);
});
test('demolition checks housing again if a resident arrives after the preview',()=>{
  const s=homes(1);s.resources.wheat=100;s.growthProgress=59;const home=lastHome(s);
  assert.equal(demolitionQuote(s,home.x,home.y).reason,null);tick(s,1);assert.equal(s.population,7);
  const before=structuredClone(s);assert.match(demolishHome(s,home.x,home.y),/housing/);assert.deepEqual(s,before);
});
test('demolition refuses refund overflow, pause, non-homes and stale selections atomically',()=>{
  const s=homes(1),home=lastHome(s);s.resources.wood=storageCapacity(s,'wood');
  let before=structuredClone(s);assert.match(demolishHome(s,home.x,home.y),/storage/);assert.deepEqual(s,before);
  s.resources.wood=500;s.paused=true;before=structuredClone(s);assert.match(demolishHome(s,home.x,home.y),/Resume/);assert.deepEqual(s,before);
  s.paused=false;before=structuredClone(s);assert.equal(demolitionQuote(s,0,0),null);assert.ok(demolishHome(s,0,0));assert.deepEqual(s,before);
  assert.equal(demolishHome(s,home.x,home.y),null);before=structuredClone(s);assert.ok(demolishHome(s,home.x,home.y));assert.deepEqual(s,before);
});
test('homes required by active research cannot be removed',()=>{
  const s=homes();s.tech=Object.keys(TECH).filter(id=>!['map','cartography'].includes(id));
  for(let i=0;i<6;i++)assert.equal(build(s,'farm'),null);
  s.resources.stone=1000;for(const type of ['hall','library','quarry'])assert.equal(build(s,type),null);
  s.resources.science=300;assert.equal(research(s,'map'),null);
  const home=lastHome(s),before=structuredClone(s);assert.ok(population(s)<=capacity(s)-6);
  assert.match(demolishHome(s,home.x,home.y),/active research/);assert.deepEqual(s,before);
});
test('demolishing a townhouse does not invalidate a started wonder',()=>{
  const s=structuredClone(full);assert.equal(build(s,'house'),null);assert.equal(build(s,'house'),null);
  const home=lastHome(s,'residence'),before=structuredClone(s);
  assert.ok(population(s)<=capacity(s)-12);assert.match(demolishHome(s,home.x,home.y),/Observatory/);assert.deepEqual(s,before);
});
test('townhouses can replace every basic house while preserving developed settlement stages',()=>{
  const s=structuredClone(full);for(let i=0;i<3;i++)assert.equal(build(s,'residence'),null);
  s.resources.wheat=0;assert.equal(count(s,'residence'),5);
  while(count(s,'house')){const home=lastHome(s);assert.equal(demolishHome(s,home.x,home.y),null);}
  assert.equal(stageIndex(s),4);assert.equal(s.population,60);assert.equal(capacity(s),66);assert.ok(restore(serialize(s,1000),1000));
});
test('townhouse refunds contain all original materials and coins',()=>{
  const s=structuredClone(full);s.resources.wheat=0;s.resources.wood=5000;assert.equal(build(s,'residence'),null);
  const home=lastHome(s,'residence'),quote=demolitionQuote(s,home.x,home.y);
  assert.deepEqual(quote.refund,{wood:159.5,brick:91.25,tool:16,coin:45.75});assert.equal(quote.reason,null);
  const before=structuredClone(s.resources);assert.equal(demolishHome(s,home.x,home.y),null);
  for(const[k,n]of Object.entries(quote.refund))near(s.resources[k],before[k]+n);
});
test('format 9 saves infer historical costs and format 10 refuses invalid cost records',()=>{
  const s=homes();s.version=9;for(const b of s.buildings)delete b.costIndex;
  const loaded=restore(serialize(s,1000),1000);assert.ok(loaded);assert.equal(loaded.state.version,12);assert.deepEqual(loaded.state.buildings.filter(b=>b.type==='house').map(b=>b.costIndex),[0,1,2]);
  for(const invalid of [undefined,-1,.5,1681,'2']){const bad=structuredClone(loaded.state);bad.buildings.find(b=>b.type==='house').costIndex=invalid;assert.equal(restore(serialize(bad,1000),1000),null);}
});
