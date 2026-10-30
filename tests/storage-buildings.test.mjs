import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,harvest,build,buildCost,buildingUnlocked,count,storageCapacity,buildingStorage,research,tick,assignWorkers,serialize,restore,reevolve,rates} from '../dist/model.js';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
function fields(){const s=fresh(1000);for(const price of [10,17]){for(let n=0;n<price;n++)assert.equal(harvest(s),null);assert.equal(build(s,'farm'),null);}return s;}

test('small starting stores and field storage still fund Cultivation and Barns',()=>{
  const s=fields();assert.equal(storageCapacity(fresh(),'wheat'),50);assert.equal(storageCapacity(fresh(),'wood'),25);
  assert.equal(storageCapacity(s,'wheat'),80);tick(s,800);near(s.resources.wheat,80);
  assert.equal(research(s,'agriculture'),null);tick(s,90);tick(s,300);assert.equal(research(s,'granaries'),null);
  assert.ok(build(s,'barn'));tick(s,120);assert.equal(storageCapacity(s,'wheat'),80);
  const before=s.resources.wheat;assert.equal(build(s,'barn'),null);near(s.resources.wheat,before-20);assert.equal(storageCapacity(s,'wheat'),480);
});
test('logging camps add small wood stores even when the new camp has no staff',()=>{
  const s=fresh();s.tech=['forestry'];s.resources.wheat=5000;
  for(let n=0;n<4;n++)assert.equal(build(s,'lumber'),null);
  assert.equal(count(s,'lumber'),4);assert.equal(s.assignments.lumber,6);assert.equal(storageCapacity(s,'wood'),125);
  const full=storageCapacity(s,'wood');s.resources.wood=full;tick(s,100);near(s.resources.wood,full);
  s.resources.wood-=2;tick(s,1);assert.ok(s.resources.wood>full-2);
});
test('warehouses require research, expand goods without staffing, and organized storage improves existing stores',()=>{
  const s=fields();s.tech=['granaries'];Object.assign(s.resources,{wheat:500,wood:500,stone:500});
  const before=structuredClone(s);assert.ok(build(s,'warehouse'));assert.deepEqual(s,before);
  s.tech.push('warehousing');assert.equal(build(s,'barn'),null);const wood=storageCapacity(s,'wood'),wheat=storageCapacity(s,'wheat');
  assert.equal(build(s,'warehouse'),null);assert.equal(storageCapacity(s,'wood'),wood+500);assert.equal(storageCapacity(s,'wheat'),wheat+500);
  assert.equal(storageCapacity(s,'science'),25);assert.equal(s.assignments.warehouse,undefined);
  s.tech.push('organizedStorage');assert.equal(storageCapacity(s,'wheat'),80+1200+1500);assert.equal(storageCapacity(s,'wood'),25+1500);
  s.meta.upgrades.storage=1;assert.equal(storageCapacity(s,'wood'),Math.floor(1525*1.25));assert.equal(buildingStorage(s,'warehouse').wood,1875);
});
test('old stockpiles above reduced caps survive reloads and offline use without creating more goods',()=>{
  const s=fresh(1000);s.tech=['forestry','warehousing'];s.resources.wheat=5000;s.resources.wood=6000;s.resources.stone=4000;
  assert.equal(build(s,'lumber'),null);assert.equal(assignWorkers(s,'lumber',2),null);
  const before=structuredClone(s.resources),loaded=restore(serialize(s,1000),1000);assert.ok(loaded);assert.deepEqual(loaded.state.resources,before);
  tick(loaded.state,60);near(loaded.state.resources.wood,before.wood);near(loaded.state.resources.stone,before.stone);near(loaded.state.resources.wheat,before.wheat-18);near(rates(loaded.state).wood,0);
  assert.equal(build(loaded.state,'warehouse'),null);assert.equal(count(loaded.state,'warehouse'),1);
  const again=restore(serialize(loaded.state,1000),61000);assert.ok(again);near(again.state.resources.wood,before.wood-150);near(again.state.resources.stone,before.stone-100);
});
test('built storage survives saves and RE-Evolution restores the small opening limits',()=>{
  const s=simulateFirstRun().state,loaded=restore(serialize(s,1000),1000);assert.ok(loaded);
  assert.equal(count(loaded.state,'barn'),1);assert.equal(count(loaded.state,'warehouse'),1);assert.equal(storageCapacity(loaded.state,'wood'),storageCapacity(s,'wood'));
  assert.equal(reevolve(loaded.state,1000),null);assert.equal(storageCapacity(loaded.state,'wheat'),50);assert.equal(storageCapacity(loaded.state,'wood'),25);assert.equal(count(loaded.state,'warehouse'),0);
});

test('Warehouses research must finish before construction is allowed, including across pause',()=>{
  const s=fields();s.tech=['agriculture','granaries','forestry','stockpiles','housing','masonry'];Object.assign(s.resources,{wheat:480,wood:225,stone:200});
  assert.equal(build(s,'barn'),null);assert.equal(buildingUnlocked(s,'warehouse'),false);assert.equal(research(s,'warehousing'),null);
  const waiting=structuredClone(s);assert.ok(build(s,'warehouse'));assert.deepEqual(s,waiting);
  tick(s,299);assert.equal(buildingUnlocked(s,'warehouse'),false);s.paused=true;tick(s,30);assert.equal(buildingUnlocked(s,'warehouse'),false);
  s.paused=false;tick(s,1);assert.equal(buildingUnlocked(s,'warehouse'),true);
  s.resources.wood=150;s.resources.stone=100;assert.equal(build(s,'warehouse'),null);near(s.resources.wood,0);near(s.resources.stone,0);
});

test('warehouse price scales with its research tier and the number already built',()=>{
  const s=fields();s.tech=['warehousing'];Object.assign(s.resources,{wood:2000,stone:2000});
  assert.deepEqual(buildCost(s,'warehouse'),{wood:150,stone:100});assert.equal(buildingStorage(s,'warehouse').wood,500);
  for(let i=0;i<3;i++)assert.equal(build(s,'warehouse'),null);
  assert.deepEqual(buildCost(s,'warehouse'),{wood:615,stone:410});
  s.tech.push('organizedStorage');assert.equal(buildingStorage(s,'warehouse').wood,1500);
  assert.deepEqual(buildCost(s,'barn'),{wheat:60});assert.equal(buildingStorage(s,'barn').wheat,1200);
  assert.deepEqual(buildCost(s,'warehouse'),{wood:1844,stone:1229,brick:246});
  assert.equal(count(s,'warehouse'),3);assert.equal(storageCapacity(s,'wood'),4525);
});

test('advanced warehouse construction requires bricks and pays the displayed price atomically',()=>{
  const s=fields();s.tech=['warehousing','organizedStorage'];Object.assign(s.resources,{wood:450,stone:300,brick:59});
  const before=structuredClone(s);assert.match(build(s,'warehouse'),/Not enough/);assert.deepEqual(s,before);
  s.resources.brick=60;assert.deepEqual(buildCost(s,'warehouse'),{wood:450,stone:300,brick:60});assert.equal(build(s,'warehouse'),null);
  near(s.resources.wood,0);near(s.resources.stone,0);near(s.resources.brick,0);
  const loaded=restore(serialize(s,1000),1000);assert.ok(loaded);assert.equal(count(loaded.state,'warehouse'),1);assert.equal(storageCapacity(loaded.state,'wood'),1525);
});
