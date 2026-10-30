import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {mapHTML} from '../dist/map.js';
import {fresh,mapSize,mapTileCount,MAX_MAP_SIZE,research,researchRequirements,researchCost,researchDuration,researchRemaining,speedResearch,tick,assignWorkers,workerDemand,explorationRate,EXPLORATION_WORK,build,freeTile,terrain,tileKnown,serialize,restore,reevolve,startShip,assignShips} from '../dist/model.js';
const reference=simulateFirstRun().state;
const complete=()=>structuredClone(reference);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);

test('Frontier surveying requires a completed region and uses the normal queue',()=>{
  const s=complete();s.exploration.tiles.pop();const before=structuredClone(s);
  assert.ok(researchRequirements(s,'cartography').some(x=>x.includes('Explore all 81')));
  assert.match(research(s,'cartography'),/Explore all/);assert.deepEqual(s,before);
  assert.equal(research(complete(),'markets'),null);
  const queued=complete();assert.equal(research(queued,'markets'),null);assert.match(research(queued,'cartography'),/Finish/);
});
test('completing a survey adds unexplored territory while preserving all existing progress',()=>{
  const s=complete(),old=structuredClone(s),cost=researchCost('cartography',s);
  assert.equal(research(s,'cartography'),null);
  for(const[k,n]of Object.entries(cost))near(s.resources[k],old.resources[k]-n);
  assert.equal(mapSize(s),9);tick(s,researchDuration(s,'cartography'));
  assert.equal(mapSize(s),13);assert.equal(mapTileCount(s),169);assert.equal(s.exploration.tiles.length,81);
  assert.deepEqual(s.buildings,old.buildings);assert.deepEqual(s.exploration.tiles,old.exploration.tiles);assert.deepEqual(s.meta.upgrades,old.meta.upgrades);assert.equal(s.meta.insight,old.meta.insight);assert.ok(s.meta.collections.records.stone>=old.meta.collections.records.stone);
  assert.equal(s.population,old.population);assert.equal(s.wonder.stage,old.wonder.stage);assert.equal(s.mapUnlocked,true);
  assert.ok(!s.tech.includes('cartography'));assert.equal(workerDemand(s,'explorer'),4);
});
test('explorers discover new neighbouring tiles beyond the original boundaries',()=>{
  const s=complete();research(s,'cartography');tick(s,researchRemaining(s));
  assert.equal(assignWorkers(s,'explorer',4),null);near(explorationRate(s),4);tick(s,EXPLORATION_WORK/4);
  assert.equal(s.exploration.tiles.length,82);const[x,y]=s.exploration.tiles.at(-1).split(',').map(Number);
  assert.ok(x>=9||y>=9);assert.ok(x<13&&y<13);assert.equal(tileKnown(s,x,y),true);
});
test('surveys repeat only after the expanded region is fully explored, with increasing costs',()=>{
  const s=complete();research(s,'cartography');tick(s,researchRemaining(s));assert.ok(research(s,'cartography'));
  assert.equal(assignWorkers(s,'explorer',4),null);tick(s,88*EXPLORATION_WORK/4);assert.equal(s.exploration.tiles.length,169);
  assert.equal(s.assignments.explorer,0);assert.deepEqual(researchCost('cartography',s),{science:450,wood:750,coin:150});
  assert.equal(research(s,'cartography'),null);near(s.researching.duration,1500);
  tick(s,researchRemaining(s));assert.equal(mapSize(s),17);assert.equal(mapTileCount(s),289);assert.equal(s.exploration.tiles.length,169);
});
test('survey timers pause, accept one-second click boosts, and complete offline once',()=>{
  const s=complete();research(s,'cartography');const before=researchRemaining(s);speedResearch(s,'cartography');near(researchRemaining(s),before-1);
  s.paused=true;tick(s,2000);assert.equal(mapSize(s),9);near(researchRemaining(s),before-1);
  s.paused=false;const loaded=restore(serialize(s,1000),1000+28800000);assert.ok(loaded);
  assert.equal(mapSize(loaded.state),13);assert.equal(loaded.state.researching,null);assert.equal(loaded.state.exploration.tiles.length,81);
});
test('expanded territory supports automatic construction and valid saves beyond coordinate 8',()=>{
  const s=complete();research(s,'cartography');tick(s,researchRemaining(s));
  s.exploration.tiles=Array.from({length:169},(_,i)=>i%13+','+Math.floor(i/13));
  // Occupy original grass sites to verify construction selects a new region.
  while(freeTile(s,'study')&&freeTile(s,'study').x<9&&freeTile(s,'study').y<9)s.buildings.push({type:'study',...freeTile(s,'study')});
  const site=freeTile(s,'study');assert.ok(site.x>=9||site.y>=9);assert.equal(terrain(site.x,site.y),'grass');
  // Existing studies make further study construction costly; use a fresh field at the same frontier.
  s.resources.wheat=10000;assert.equal(build(s,'farm'),null);assert.ok(s.buildings.some(b=>b.x>=9||b.y>=9));
  assert.ok(restore(serialize(s,1000),1000));
});
test('map rendering includes expanded bounds and keeps unknown terrain hidden',()=>{
  const s=complete();research(s,'cartography');tick(s,researchRemaining(s));const html=mapHTML(s);
  assert.equal((html.match(/class="tile"/g)||[]).length,81);assert.equal((html.match(/class="unexplored-tile"/g)||[]).length,88);
  assert.match(html,/viewBox="48 8 1000 584"/);
});
test('format 8 migration preserves completed exploration and building coordinates',()=>{
  const s=complete();s.version=8;delete s.exploration.size;
  const result=restore(serialize(s,1000),1000);assert.ok(result);assert.equal(result.state.version,13);
  assert.equal(mapSize(result.state),9);assert.equal(result.state.exploration.tiles.length,81);assert.deepEqual(result.state.buildings,s.buildings);
});
test('expanded survey work round-trips and malformed region sizes are rejected',()=>{
  const s=complete();research(s,'cartography');tick(s,researchRemaining(s));
  s.exploration.tiles=Array.from({length:169},(_,i)=>i%13+','+Math.floor(i/13));research(s,'cartography');
  assert.ok(restore(serialize(s,1000),1000));
  for(const size of [10,45,0,'13',null]){const bad=structuredClone(s);bad.exploration.size=size;assert.equal(restore(serialize(bad,1000),1000),null);}
  const bad=structuredClone(s);bad.exploration.tiles.push('13,0');assert.equal(restore(serialize(bad,1000),1000),null);
});
test('the final supported frontier cannot expand further and RE-Evolution resets the map',()=>{
  const s=complete();s.exploration.size=MAX_MAP_SIZE;s.exploration.tiles=Array.from({length:mapTileCount(s)},(_,i)=>i%MAX_MAP_SIZE+','+Math.floor(i/MAX_MAP_SIZE));
  const old=structuredClone(s);assert.match(research(s,'cartography'),/complete/);assert.deepEqual(s,old);
  assert.equal(reevolve(s),null);assert.equal(mapSize(s),9);assert.equal(mapTileCount(s),81);assert.equal(s.exploration.tiles.length,25);
});
test('ships can resume exploration after a region expands',()=>{
  const s=complete();assert.equal(research(s,'cartography'),null);tick(s,researchRemaining(s));
  s.exploration.tiles=Array.from({length:169},(_,i)=>i%13+','+Math.floor(i/13));
  s.tech.push('shipping');s.resources.tool=1000;
  assert.equal(build(s,'wharf'),null);assert.equal(startShip(s),null);tick(s,600);
  assert.match(assignShips(s,'exploration',1),/already/);
  assert.equal(research(s,'cartography'),null);tick(s,researchRemaining(s));
  assert.equal(assignShips(s,'exploration',1),null);assert.equal(assignWorkers(s,'sailor',2),null);
  near(explorationRate(s),2);tick(s,300);assert.equal(s.exploration.tiles.length,170);
  assert.ok(restore(serialize(s,1000),1000));
});
