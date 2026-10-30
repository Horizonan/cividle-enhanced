import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {fresh,harvest,build,nextMilestone,advanceAway,restore,serialize,tick,storageCapacity,research,startWonder,boostWonder,canReevolve} from '../dist/model.js';
const full=simulateFirstRun(),copy=s=>structuredClone(s),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} ≠ ${b}`);
const fund=s=>{for(const k of Object.keys(s.resources))s.resources[k]=storageCapacity(s,k);};

test('guidance follows real early prerequisites without revealing the map or changing progress',()=>{
  const s=fresh(),before=copy(s);assert.equal(nextMilestone(s).title,'First wheat field');assert.deepEqual(s,before);
  for(let i=0;i<10;i++)harvest(s);assert.equal(build(s,'farm'),null);
  const milestone=nextMilestone(s);assert.equal(milestone.title,'Hamlet');assert.equal(milestone.action.build,'farm');assert.equal(s.mapUnlocked,false);
  s.resources.wheat=17;s.earned.wheat+=17;assert.equal(build(s,'farm'),null);assert.equal(nextMilestone(s).action.research,'agriculture');
  assert.ok(milestone.requirements.some(r=>r.label==='Residents'&&r.current===6&&r.target===12));
  s.tech=['agriculture','granaries'];assert.equal(nextMilestone(s).action.build,'barn');assert.equal(s.mapUnlocked,false);
});

test('guidance respects improved housing equivalents, Mapping, funded stages and RE-Evolution readiness',()=>{
  const s=copy(full.beforeWonder);s.population=24;s.tech=s.tech.filter(id=>id!=='map');s.mapUnlocked=false;
  assert.equal(nextMilestone(s).title,'Mapping');assert.equal(nextMilestone(s).action.research,'map');
  s.tech.push('map');s.mapUnlocked=true;s.population=60;
  let milestone=nextMilestone(s);assert.match(milestone.title,/Foundations/);assert.equal(milestone.action.page,'progress');
  fund(s);assert.equal(startWonder(s),null);milestone=nextMilestone(s);assert.ok(milestone.requirements.every(r=>r.done));
  assert.match(milestone.description,/in progress/);assert.equal(nextMilestone(full.state).title,'RE-Evolution ready');
  assert.equal(nextMilestone(full.state).action.page,'legacy');
  const homes=copy(full.beforeWonder);homes.population=6;homes.buildings=homes.buildings.map(b=>b.type==='house'?{...b,type:'stoneHouse'}:b);
  assert.ok(nextMilestone(homes).requirements.find(r=>r.id==='house').done);
});

test('away reports match simulation and restoration never adds the same elapsed time twice',()=>{
  const s=copy(full.beforeWonder),direct=copy(s),before=copy(s.resources);tick(direct,600);
  const report=advanceAway(s,600);assert.deepEqual(s,direct);near(report.simulated,600);
  for(const k of Object.keys(before))near(report.resources[k],s.resources[k]-before[k]);
  const loaded=restore(serialize(full.beforeWonder,1000),601000);assert.ok(loaded);assert.equal(loaded.away.seconds,600);
  const again=restore(serialize(loaded.state,601000),601000);assert.ok(again);near(again.away.simulated,0);assert.deepEqual(again.state.resources,loaded.state.resources);
});

test('away reports include concurrent research and the funded final observation without auto-resetting',()=>{
  const s=copy(full.beforeWonder);fund(s);assert.equal(research(s,'markets'),null);s.researching.remaining=2;
  s.wonder.stage=3;assert.equal(startWonder(s),null);assert.equal(boostWonder(s),null);s.wonder.remaining=2;
  const report=advanceAway(s,60);assert.ok(report.research.includes('markets'));assert.deepEqual(report.wonder,['First observation']);assert.ok(report.achievements.includes('observatory'));
  assert.equal(canReevolve(s),true);assert.equal(s.meta.revolutions,0);assert.equal(s.meta.insight,0);
});

test('pause and the eight-hour cap are reflected honestly in return reports',()=>{
  const s=copy(full.beforeWonder);s.paused=true;const before=copy(s),report=advanceAway(s,3600);
  assert.deepEqual(s,before);assert.equal(report.paused,true);assert.equal(report.simulated,0);assert.deepEqual(report.full,[]);
  s.paused=false;const capped=advanceAway(s,9*3600);assert.equal(capped.capped,true);assert.equal(capped.seconds,28800);near(capped.simulated,28800);
  assert.equal(advanceAway(s,-1).simulated,0);
});

test('return reports identify full stores, food-blocked arrivals and repeatable surveying',()=>{
  const s=copy(full.beforeWonder);s.resources.wood=storageCapacity(s,'wood')-1;
  const report=advanceAway(s,60);assert.ok(report.full.includes('wood'));assert.ok(report.resources.wood<=1&&report.resources.wood>=0);
  const hungry=copy(full.beforeWonder);hungry.population=59;hungry.buildings=hungry.buildings.filter(b=>b.type!=='farm');hungry.resources.wheat=0;hungry.resources.fish=0;
  const shortage=advanceAway(hungry,120);near(shortage.hunger,120);assert.equal(shortage.residents,0);assert.equal(hungry.population,59);
  const survey=copy(full.beforeWonder);fund(survey);assert.equal(research(survey,'cartography'),null);
  const discovered=advanceAway(survey,1300);assert.equal(discovered.survey,true);assert.equal(survey.exploration.size,13);assert.equal(survey.tech.includes('cartography'),false);
});
