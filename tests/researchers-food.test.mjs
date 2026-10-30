import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {
  fresh, tick, build, availableBuildings, workerDemand, assignWorkers, assignedWorkers,
  idleWorkers, research, researchRemaining, researchSpeed, speedResearch, rates,
  foodConsumption, foodSufficient, setArrivalJob, serialize, restore,
} from '../dist/model.js';

const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
const run=simulateFirstRun();
function town(){const s=structuredClone(run.beforeWonder);tick(s,1200);assert.equal(build(s,'study'),null);return s;}

test('Shelter unlocks a Study before Writing, with two researcher slots per Study',()=>{
  const s=fresh(); assert.ok(!availableBuildings(s).includes('study')); assert.equal(workerDemand(s,'researcher'),0);
  assert.ok(assignWorkers(s,'researcher',1));
  s.tech=['housing']; s.resources.wheat=120; s.earned.wheat=120; s.resources.wood=80;
  assert.ok(availableBuildings(s).includes('study')); assert.equal(build(s,'study'),null);
  assert.equal(workerDemand(s,'researcher'),2); assert.equal(assignedWorkers(s,'researcher'),0);
  assert.equal(assignWorkers(s,'researcher',2),null); assert.equal(idleWorkers(s),4);
  assert.ok(assignWorkers(s,'researcher',3));
  s.resources.wheat=180; s.resources.wood=120; assert.equal(build(s,'study'),null);
  assert.equal(workerDemand(s,'researcher'),4);
});
test('academies add research slots alongside separate knowledge-production jobs',()=>{
  const s=town(); assert.equal(workerDemand(s,'researcher'),10);
  const science=rates(s).science,idleBefore=idleWorkers(s);
  assert.equal(assignWorkers(s,'researcher',4),null);
  near(rates(s).science,science); assert.equal(researchSpeed(s),1.2);
  assert.equal(idleWorkers(s),idleBefore-4);
});
test('researchers speed up active projects immediately without resetting completed work',()=>{
  const s=town(); assert.equal(research(s,'markets'),null);
  near(researchRemaining(s),480); assert.equal(assignWorkers(s,'researcher',4),null);
  near(researchRemaining(s),400); tick(s,60); near(researchRemaining(s),340);
  const work=s.researching.remaining;
  assert.equal(assignWorkers(s,'researcher',0),null); near(s.researching.remaining,work); near(researchRemaining(s),408);
  assert.equal(assignWorkers(s,'researcher',4),null); tick(s,340);
  assert.equal(s.researching,null); assert.ok(s.tech.includes('markets'));
});
test('one click still removes exactly one displayed second with researchers',()=>{
  const s=town(); assert.equal(assignWorkers(s,'researcher',4),null); assert.equal(research(s,'markets'),null);
  const seconds=researchRemaining(s), resources=structuredClone(s.resources), elapsed=s.elapsed;
  assert.equal(speedResearch(s,'markets'),null); near(researchRemaining(s),seconds-1);
  assert.deepEqual(s.resources,resources); assert.equal(s.elapsed,elapsed);
  s.paused=true; const before=structuredClone(s); tick(s,300); assert.ok(speedResearch(s,'markets')); assert.ok(assignWorkers(s,'researcher',0)); assert.deepEqual(s,before);
});
test('researchers obey population limits and new-arrival priorities',()=>{
  const s=town(); s.population=54; s.growthProgress=0;
  assert.equal(setArrivalJob(s,'researcher'),null); tick(s,60);
  assert.equal(assignedWorkers(s,'researcher'),1); assert.equal(s.population,55);
  s.assignments.researcher=0;
  const assigned=Object.values(s.assignments).reduce((n,x)=>n+x,0);
  s.population=assigned; assert.ok(assignWorkers(s,'researcher',1));
});
test('researcher saves retain staffing and finish accelerated research offline',()=>{
  const s=town(); assert.equal(assignWorkers(s,'researcher',4),null); assert.equal(research(s,'markets'),null);
  const loaded=restore(serialize(s,1000),301000);
  assert.ok(loaded); assert.equal(assignedWorkers(loaded.state,'researcher'),4); near(researchRemaining(loaded.state),100);
  const finish=restore(serialize(loaded.state,301000),401000);
  assert.ok(finish.state.tech.includes('markets')); assert.equal(finish.state.researching,null);
  const invalid=structuredClone(s); invalid.assignments.researcher=11;
  assert.equal(restore(serialize(invalid,1000),1000),null);
});
test('format 6 migration preserves permanent progress and active work, leaving researchers unassigned',()=>{
  const s=town(); s.version=6; delete s.assignments.researcher; s.meta.insight=3; s.meta.revolutions=1;
  assert.equal(research(s,'markets'),null); tick(s,30); const remaining=s.researching.remaining;
  const loaded=restore(serialize(s,1000),1000);
  assert.ok(loaded); assert.equal(loaded.state.version,13); assert.equal(loaded.state.meta.insight,15); assert.equal(loaded.state.meta.revolutions,1);
  assert.equal(assignedWorkers(loaded.state,'researcher'),0); near(loaded.state.researching.remaining,remaining);
});
test('all residents consume wheat, independently of assignments, online and offline',()=>{
  const s=fresh(); s.resources.wheat=100; near(foodConsumption(s),.3);
  tick(s,60); near(s.resources.wheat,82); assert.equal(s.population,6);
  const loaded=restore(serialize(s,1000),61000); near(loaded.state.resources.wheat,64);
  tick(s,1000); near(s.resources.wheat,0); assert.equal(s.population,6);
  const city=town(); city.resources.wheat=100;
  near(foodConsumption(city),3); near(rates(city).wheat,.15);
  assert.equal(assignWorkers(city,'researcher',4),null); near(foodConsumption(city),3);
  city.paused=true; const wheat=city.resources.wheat; tick(city,1000); near(city.resources.wheat,wheat);
});
test('food exhaustion pauses arrival progress exactly, without losing it or removing residents',()=>{
  const s=fresh(); s.tech=['housing'];s.earned.wheat=120;s.resources.wheat=120;s.resources.wood=60;
  assert.equal(build(s,'house'),null); s.resources.wheat=6;
  tick(s,60); near(s.resources.wheat,0); near(s.growthProgress,20); assert.equal(s.population,6); assert.equal(foodSufficient(s),false);
  tick(s,500); near(s.growthProgress,20); assert.equal(s.population,6);
  s.resources.wheat=10; assert.equal(build(s,'farm'),null); s.resources.wheat=17; assert.equal(build(s,'farm'),null); assert.equal(foodSufficient(s),true);
  tick(s,40); assert.equal(s.population,7); near(s.growthProgress,0);
  near(foodConsumption(s),.35);
});
test('research completion applies the faster production rate only after its accelerated boundary',()=>{
  const s=town(); s.resources.wheat=0; assert.equal(assignWorkers(s,'researcher',4),null);
  s.tech=s.tech.filter(id=>id!=='irrigation'); assert.equal(research(s,'irrigation'),null); s.researching.remaining=.6;
  tick(s,1); near(s.resources.wheat,0*.5+.15*.5);
});
test('the route with an early Study and researchers still fits the first-run pacing target',()=>{
  const staffed=simulateFirstRun(()=>{},null,{researchers:true});
  assert.ok(staffed.state.elapsed>=21600 && staffed.state.elapsed<=28800);
  assert.equal(staffed.state.assignments.researcher,10);
});
