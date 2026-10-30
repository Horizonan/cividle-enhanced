import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,build,buildingUnlocked,capacity,population,tick,research,TECH,demolitionQuote,demolishHome,researchRequirements,serialize,restore,stageIndex} from '../dist/model.js';

function settlement(){
  const s=fresh(1000);s.tech=['forestry','housing','masonry','stockpiles','granaries'];s.earned.wheat=1000;
  Object.assign(s.resources,{wheat:500,wood:500,stone:500});
  assert.equal(build(s,'farm'),null);assert.equal(build(s,'quarry'),null);assert.equal(build(s,'barn'),null);return s;
}
test('stone housing requires its own funded research after shelter and quarrying',()=>{
  const s=settlement();assert.equal(buildingUnlocked(s,'stoneHouse'),false);
  const before=structuredClone(s);assert.ok(build(s,'stoneHouse'));assert.deepEqual(s,before);
  assert.equal(research(s,'stoneConstruction'),null);assert.equal(s.resources.stone,380);assert.equal(s.resources.wood,270);
  tick(s,TECH.stoneConstruction.duration-1);assert.equal(buildingUnlocked(s,'stoneHouse'),false);
  tick(s,1);assert.equal(buildingUnlocked(s,'stoneHouse'),true);assert.equal(s.mapUnlocked,false);
  const missing=settlement();missing.buildings=missing.buildings.filter(b=>b.type!=='quarry');assert.ok(researchRequirements(missing,'stoneConstruction').length);
});
test('wood, stone and brick housing provide increasing space with gradual arrivals',()=>{
  const s=settlement();s.tech.push('stoneConstruction');assert.equal(build(s,'house'),null);assert.equal(capacity(s),12);
  assert.equal(build(s,'stoneHouse'),null);assert.equal(capacity(s),21);assert.equal(population(s),6);
  s.resources.wheat=500;tick(s,60);assert.equal(population(s),7);
  const loaded=restore(serialize(s,1000),61000);assert.ok(loaded);assert.equal(capacity(loaded.state),21);assert.equal(population(loaded.state),8);
  // The late tier remains gated by Civil engineering and Town stage.
  assert.equal(buildingUnlocked(s,'residence'),false);
});
test('stone houses replace wooden homes without losing earlier housing milestones',()=>{
  const s=settlement();s.tech.push('stoneConstruction');assert.equal(build(s,'lumber'),null);
  assert.equal(build(s,'house'),null);const wooden=s.buildings.find(b=>b.type==='house');
  assert.equal(build(s,'stoneHouse'),null);assert.equal(build(s,'stoneHouse'),null);
  s.resources.wheat=200;s.resources.wood=0;s.population=12;
  assert.equal(demolishHome(s,wooden.x,wooden.y),null);assert.equal(capacity(s),24);assert.equal(stageIndex(s),1);
  assert.ok(!researchRequirements(s,'writing').some(r=>r.includes('houses')));
  assert.ok(!researchRequirements(s,'map').some(r=>r.startsWith('3 houses')));
});
test('stone demolition refunds original wood and stone and persists purchase records',()=>{
  const s=settlement();s.tech.push('stoneConstruction');assert.equal(build(s,'stoneHouse'),null);assert.equal(build(s,'stoneHouse'),null);
  s.resources.wood=100;s.resources.stone=100;
  const home=s.buildings.filter(b=>b.type==='stoneHouse').at(-1),loaded=restore(serialize(s,1000),1000);assert.ok(loaded);
  assert.deepEqual(demolitionQuote(loaded.state,home.x,home.y).refund,{wood:35,stone:52.5});
  const before=structuredClone(loaded.state);loaded.state.population=16;
  assert.match(demolishHome(loaded.state,home.x,home.y),/housing/);
  loaded.state.population=before.population;assert.equal(demolishHome(loaded.state,home.x,home.y),null);
  assert.equal(capacity(loaded.state),15);assert.equal(loaded.state.resources.wood,before.resources.wood+35);assert.equal(loaded.state.resources.stone,before.resources.stone+52.5);
});
