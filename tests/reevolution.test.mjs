import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateFirstRun } from '../scripts/balance-run.mjs';
import {
  fresh, tick, rates, count, buildingUnlocked, researchRequirements, stageIndex,
  STAGES, WONDER_STAGES, WONDER_NAME, LEGACY_UPGRADES, startWonder, canReevolve,
  buyLegacy, legacyCost, reevolve, research, researchDuration, wonderDuration,
  setArrivalJob, assignedWorkers, workerDemand, storageCapacity, serialize, restore, speedResearch,
} from '../dist/model.js';

const copy=s=>structuredClone(s);
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
const full=simulateFirstRun();
const completed=()=>copy(full.state);
const city=()=>{const s=copy(full.beforeWonder);tick(s,1200);return s;};

test('a produced-resource first run reaches RE-Evolution in 6–8 hours',()=>{
  assert.ok(full.state.elapsed>=21600 && full.state.elapsed<=28800);
  assert.equal(stageIndex(full.state),4);
  assert.equal(canReevolve(full.state),true);
  assert.equal(count(full.state,'workshop'),3);
  assert.ok(full.timeline.find(x=>x.label==='map').minutes>100);
  console.log('Full reference route:',(full.state.elapsed/3600).toFixed(2),'hours');
});
test('stage prerequisites gate advanced research and buildings',()=>{
  const s=city();
  assert.deepEqual(STAGES.map(x=>x.name),['Camp','Hamlet','Village','Town','City']);
  s.population=24;
  assert.equal(stageIndex(s),2);
  assert.equal(buildingUnlocked(s,'residence'),false);
  assert.equal(buildingUnlocked(s,'academy'),false);
  assert.ok(researchRequirements(s,'education').includes('Town stage'));
  const old=copy(s); assert.match(startWonder(s),/City/); assert.deepEqual(s,old);
  s.population=60; assert.equal(stageIndex(s),4);
  s.tech=s.tech.filter(x=>x!=='housing'); assert.equal(stageIndex(s),0);
});
test('arrival priorities fill only new arrivals and keep existing jobs',()=>{
  const s=city(); s.population=54; s.assignments.workshop=0; s.growthProgress=0;
  const previous=copy(s.assignments);
  assert.equal(setArrivalJob(s,'workshop'),null);
  tick(s,59); assert.equal(assignedWorkers(s,'workshop'),0);
  tick(s,1); assert.equal(assignedWorkers(s,'workshop'),1);
  for(const type of Object.keys(previous).filter(x=>x!=='workshop'))assert.equal(s.assignments[type],previous[type]);
  tick(s,1000); assert.equal(assignedWorkers(s,'workshop'),workerDemand(s,'workshop'));
  assert.match(setArrivalJob(fresh(),'workshop'),/not available/);
  s.paused=true; assert.match(setArrivalJob(s,null),/Resume/);
});
test('tools require staff and both inputs, and stop consuming when full',()=>{
  const s=city();
  s.assignments.workshop=0; assert.equal(rates(s).tool,0);
  s.assignments.workshop=6;
  // Isolate workshops while retaining a valid economy for rates.
  s.buildings=s.buildings.filter(b=>b.type==='workshop');
  s.resources.wood=0; s.resources.stone=100; tick(s,10); near(s.resources.stone,100);
  s.resources.wood=100; s.resources.stone=0; tick(s,10); near(s.resources.wood,100);
  s.resources.stone=100; s.resources.tool=storageCapacity(s,'tool'); tick(s,10);
  near(s.resources.wood,100); near(s.resources.stone,100);
  s.resources.tool=0; tick(s,10); assert.ok(s.resources.tool>0); assert.ok(s.resources.wood<100 && s.resources.stone<100);
});
test('wonder purchases are atomic and each stage requires its own payment',()=>{
  const s=city(); s.resources.tool=0;
  const before=copy(s);
  assert.match(startWonder(s),/Not enough/); assert.deepEqual(s,before);
  s.resources.tool=1000;
  const cost=WONDER_STAGES[0].cost, old=copy(s.resources);
  assert.equal(startWonder(s),null);
  for(const [key,n] of Object.entries(cost))near(s.resources[key],old[key]-n);
  const active=copy(s); assert.match(startWonder(s),/still under construction/); assert.deepEqual(s,active);
  tick(s,28800);
  assert.equal(s.wonder.stage,1); assert.equal(s.wonder.remaining,0);
  assert.equal(canReevolve(s),false);
  assert.ok(restore(serialize(s,1000),1000));
});
test('research and construction run together, clicks affect research only, pause freezes both',()=>{
  const s=city(); s.resources.tool=1000;
  assert.equal(startWonder(s),null);
  assert.equal(research(s,'markets'),null);
  const duration=s.wonder.remaining;
  assert.equal(speedResearch(s,'markets'),null); near(s.wonder.remaining,duration);
  tick(s,10); near(s.wonder.remaining,duration-10); near(s.researching.remaining,researchDuration(s,'markets')-11);
  s.paused=true; const old=copy(s); tick(s,1000); assert.deepEqual(s,old);
  assert.match(startWonder(s),/Resume/); assert.match(speedResearch(s,'markets'),/Resume/);
});
test('offline wonder completion stops before purchasing the next stage',()=>{
  const s=city(); s.resources.tool=1000; assert.equal(startWonder(s),null);
  const result=restore(serialize(s,1000),1000+28800000);
  assert.ok(result); assert.equal(result.state.wonder.stage,1); assert.equal(result.state.wonder.remaining,0);
  assert.equal(result.offline,28800);
});
test('RE-Evolution requires a finished wonder and clears run progress while preserving legacy',()=>{
  const blocked=city(), old=copy(blocked); assert.match(reevolve(blocked),/Complete/); assert.deepEqual(blocked,old);
  const s=completed(); s.name='Riverbend'; s.autoJob='workshop'; s.paused=true;
  assert.match(reevolve(s),/Resume/); s.paused=false;
  const seconds=s.elapsed; assert.equal(reevolve(s,2000),null);
  assert.equal(s.name,'Riverbend'); assert.equal(s.meta.insight,3); assert.equal(s.meta.revolutions,1);
  assert.deepEqual(s.meta.history,[{run:1,seconds,completedAt:2000,reward:3,wonder:WONDER_NAME}]);
  assert.equal(s.elapsed,0); assert.equal(s.population,6); assert.equal(s.autoJob,null);
  assert.deepEqual(s.buildings,[]); assert.deepEqual(s.tech,[]); assert.equal(s.mapUnlocked,false);
  assert.equal(s.wonder.stage,0); assert.equal(s.researching,null);
  assert.equal(s.exploration.tiles.length,25);assert.equal(s.exploration.progress,0);assert.equal(s.fleet.ships,0);assert.equal(s.fleet.building,null);
  assert.ok(Object.values(s.resources).every(x=>x===0)); assert.ok(Object.values(s.assignments).every(x=>x===0));
  assert.ok(restore(serialize(s,2000),2000));
});
test('permanent upgrades spend Insight once and preserve already-started durations',()=>{
  const s=city(); s.resources.tool=1000; s.meta.insight=10;
  assert.equal(startWonder(s),null); assert.equal(research(s,'markets'),null);
  const duration=s.wonder.duration, researchTime=s.researching.duration;
  assert.equal(buyLegacy(s,'knowledge'),null); assert.equal(s.meta.insight,9);
  near(s.wonder.duration,duration); near(s.researching.duration,researchTime);
  assert.ok(wonderDuration(s,0)<duration); assert.ok(researchDuration(s,'markets')<researchTime);
  assert.ok(restore(serialize(s,1000),1000));
  assert.equal(legacyCost(s,'knowledge'),2);
  const toolCap=storageCapacity(s,'tool');
  assert.equal(buyLegacy(s,'production'),null); assert.equal(buyLegacy(s,'storage'),null);
  assert.equal(storageCapacity(s,'tool'),Math.floor(toolCap*1.25));
  const basic=city(); near(rates(s).tool,rates(basic).tool*1.15);
  s.meta.upgrades.knowledge=5; const old=copy(s); assert.match(buyLegacy(s,'knowledge'),/not available/); assert.deepEqual(s,old);
  s.meta.insight=0; assert.match(buyLegacy(s,'production'),/Not enough/);
});
test('three first-run Insight can improve all three systems and shorten the next run',()=>{
  const s=completed(); assert.equal(reevolve(s),null);
  for(const key of Object.keys(LEGACY_UPGRADES))assert.equal(buyLegacy(s,key),null);
  assert.equal(s.meta.insight,0);
  const next=simulateFirstRun(()=>{},s.meta);
  assert.ok(next.state.elapsed<full.state.elapsed*.95);
  assert.equal(next.state.meta.history.length,1);
});
test('format 5 saves keep population, progress and staffing without granting new systems',()=>{
  const s=city(); s.version=5; s.population=59; s.growthProgress=27;
  s.buildings=s.buildings.filter(b=>!['workshop','residence','academy'].includes(b.type));
  s.population=30; s.tech=s.tech.filter(id=>!['toolmaking','civilEngineering','education','astronomy'].includes(id));
  s.assignments.quarry-=2;
  delete s.resources.tool; delete s.earned.tool; delete s.assignments.workshop; delete s.assignments.academy;
  delete s.meta; delete s.wonder; delete s.autoJob;
  const result=restore(JSON.stringify(s),s.lastSaved);
  assert.ok(result); assert.equal(result.state.version,12); assert.equal(result.state.population,30);
  assert.equal(result.state.growthProgress,27); assert.equal(result.state.resources.tool,0);
  assert.equal(result.state.meta.insight,0); assert.equal(result.state.wonder.stage,0);
  assert.equal(result.state.assignments.lumber,s.assignments.lumber);
});
test('completed saves round-trip and malformed project or legacy data is refused',()=>{
  assert.ok(restore(serialize(completed(),1000),1000));
  const mutations=[s=>s.meta.upgrades.production=6,s=>s.meta.insight=-1,s=>s.wonder.stage=5,
    s=>s.wonder.remaining=1,s=>s.autoJob='farm',s=>s.meta.history=[{}]];
  for(const mutate of mutations){const s=completed();mutate(s);assert.equal(restore(serialize(s,1000),1000),null);}
});
