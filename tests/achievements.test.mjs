import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {fresh,harvest,build,ACHIEVEMENTS,achievementProgress,recordAchievements,tick,serialize,restore,reevolve,startWonder,startShip,wonderVisualStep,canReevolve} from '../dist/model.js';
import {mapHTML,wonderArt} from '../dist/map.js';
const reference=simulateFirstRun();
const copy=s=>structuredClone(s);

test('exactly ten achievements start locked and the first field earns its badge once',()=>{
  const s=fresh(1000);assert.equal(ACHIEVEMENTS.length,10);assert.deepEqual(s.meta.achievements,[]);
  for(let i=0;i<10;i++)assert.equal(harvest(s),null);
  assert.equal(build(s,'farm'),null);assert.deepEqual(s.meta.achievements,['firstField']);
  tick(s,0);recordAchievements(s);assert.deepEqual(s.meta.achievements,['firstField']);assert.equal(s.meta.insight,0);
});
test('achievements latch tool totals and population milestones without consuming resources',()=>{
  const s=fresh(1000);s.population=24;s.earned.tool=99.9;
  recordAchievements(s);assert.ok(s.meta.achievements.includes('hamlet'));assert.ok(s.meta.achievements.includes('village'));assert.ok(!s.meta.achievements.includes('tools'));
  s.earned.tool=100;const resources=copy(s.resources);recordAchievements(s);s.population=6;s.earned.tool=0;
  assert.deepEqual(achievementProgress(s,'tools'),{current:100,target:100,earned:true});assert.deepEqual(s.resources,resources);
});
test('optional exploration and ship milestones require discovered tiles and a completed ship',()=>{
  const s=fresh(1000);s.exploration.tiles=Array.from({length:81},(_,i)=>(i%9)+','+Math.floor(i/9));s.mapUnlocked=false;
  recordAchievements(s);assert.ok(!s.meta.achievements.includes('explorer'));assert.ok(!s.meta.achievements.includes('voyage'));
  s.mapUnlocked=true;s.tech.push('fishing','shipping');for(const key of Object.keys(s.resources))s.resources[key]=5000;
  assert.equal(build(s,'wharf'),null);assert.equal(startShip(s),null);recordAchievements(s);assert.ok(s.meta.achievements.includes('explorer'));assert.ok(!s.meta.achievements.includes('voyage'));
  tick(s,599);assert.ok(!s.meta.achievements.includes('voyage'));tick(s,1);assert.ok(s.meta.achievements.includes('voyage'));
});
test('offline foundation completion earns its achievement once and preserves future stages',()=>{
  const s=copy(reference.beforeWonder);for(const key of Object.keys(s.resources))s.resources[key]=5000;
  assert.equal(startWonder(s),null);assert.ok(!s.meta.achievements.includes('foundations'));
  const result=restore(serialize(s,1000),1000+28800000);assert.ok(result);assert.equal(result.state.wonder.stage,1);
  assert.ok(result.state.meta.achievements.includes('foundations'));assert.ok(!result.state.meta.achievements.includes('observatory'));
  const again=restore(serialize(result.state,1000),1000);assert.equal(again.state.meta.achievements.filter(id=>id==='foundations').length,1);
});
test('RE-Evolution keeps earned badges, grants its final badge and does not require all ten',()=>{
  const s=copy(reference.state);assert.ok(canReevolve(s));assert.ok(!s.meta.achievements.includes('voyage'));
  const earned=[...s.meta.achievements];assert.equal(reevolve(s,2000),null);
  for(const id of earned)assert.ok(s.meta.achievements.includes(id));assert.ok(s.meta.achievements.includes('reevolution'));
  assert.ok(!s.meta.achievements.includes('voyage'));assert.equal(s.meta.insight,s.meta.history[0].reward);assert.ok(s.meta.insight>=12);assert.equal(s.wonder.stage,0);
  assert.ok(restore(serialize(s,2000),2000));
});
test('format 10 migration recovers verifiable achievements and rejects malformed new records',()=>{
  const s=copy(reference.state);s.version=10;delete s.meta.achievements;
  const result=restore(serialize(s,1000),1000);assert.ok(result);assert.equal(result.state.version,13);
  for(const id of ['firstField','hamlet','village','tools','city','foundations','observatory','explorer'])assert.ok(result.state.meta.achievements.includes(id));
  assert.ok(!result.state.meta.achievements.includes('reevolution'));
  for(const ids of [undefined,['unknown'],['firstField','firstField'],[{}]]){const bad=copy(result.state);bad.meta.achievements=ids;assert.equal(restore(serialize(bad,1000),1000),null);}
});
test('old completed civilizations recover mandatory badges without inventing optional voyages',()=>{
  const s=fresh(1000);s.meta.revolutions=1;s.version=10;delete s.meta.achievements;
  const result=restore(serialize(s,1000),1000);assert.ok(result);
  assert.ok(result.state.meta.achievements.includes('observatory'));assert.ok(result.state.meta.achievements.includes('reevolution'));assert.ok(!result.state.meta.achievements.includes('voyage'));assert.ok(!result.state.meta.achievements.includes('explorer'));
});
test('wonder visuals distinguish construction phases, pause, completion and restarting',()=>{
  const s=copy(reference.beforeWonder);for(const key of Object.keys(s.resources))s.resources[key]=5000;
  assert.ok(!mapHTML(s).includes('data-open-wonder'));assert.equal(startWonder(s),null);
  const foundations=wonderArt(s);assert.ok(mapHTML(s).includes('Great Observatory: Building foundations'));
  tick(s,s.wonder.remaining);assert.equal(wonderVisualStep(s),4);assert.notEqual(wonderArt(s),foundations);
  assert.equal(startWonder(s),null);tick(s,s.wonder.duration/2);assert.equal(wonderVisualStep(s),6);
  const tower=wonderArt(s);s.paused=true;tick(s,28800);assert.equal(wonderArt(s),tower);s.paused=false;
  tick(s,s.wonder.remaining);assert.equal(wonderVisualStep(s),8);
  assert.equal(startWonder(s),null);tick(s,s.wonder.remaining);const instruments=wonderArt(s);assert.notEqual(instruments,tower);
  for(const key of Object.keys(s.resources))s.resources[key]=5000;
  assert.equal(startWonder(s),null);tick(s,s.wonder.remaining);assert.equal(wonderVisualStep(s),16);assert.ok(mapHTML(s).includes('First observation complete'));
  assert.notEqual(wonderArt(s),instruments);assert.equal(reevolve(s),null);assert.ok(!mapHTML(s).includes('data-open-wonder'));
});
