import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {fresh,startWonder,wonderBoostQuote,boostWonder,wonderSpeed,wonderRemaining,MAX_WONDER_BOOSTS,tick,storageCapacity,serialize,restore,reevolve,canReevolve,research,researchRemaining} from '../dist/model.js';
const reference=simulateFirstRun();
const copy=s=>structuredClone(s),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
const fund=s=>{for(const k of Object.keys(s.resources))s.resources[k]=storageCapacity(s,k);};
function active(){const s=copy(reference.beforeWonder);fund(s);assert.equal(startWonder(s),null);return s;}

test('extra materials buy ongoing speed without skipping completed construction work',()=>{
  const s=active(),before=copy(s),quote=wonderBoostQuote(s);assert.deepEqual(s,before);
  assert.deepEqual(quote.cost,{stone:180,brick:90,tool:12,coin:38});near(quote.remaining,1800);near(quote.nextRemaining,1440);near(quote.saved,360);
  assert.equal(boostWonder(s,quote.stage,quote.level),null);assert.equal(wonderSpeed(s),1.25);assert.equal(s.wonder.remaining,before.wonder.remaining);assert.equal(s.wonder.duration,before.wonder.duration);
  for(const [key,n]of Object.entries(quote.cost))near(s.resources[key],before.resources[key]-n);
  assert.deepEqual(s.earned,before.earned);assert.deepEqual(s.assignments,before.assignments);tick(s,10);near(s.wonder.remaining,1787.5);near(wonderRemaining(s),1430);
});
test('successive supplies cost more, cap at double speed and cannot be charged twice from a stale offer',()=>{
  const s=active();let previous=0;
  for(let n=0;n<MAX_WONDER_BOOSTS;n++){fund(s);const quote=wonderBoostQuote(s);assert.ok(quote.cost.stone>previous);previous=quote.cost.stone;assert.equal(boostWonder(s,quote.stage,quote.level),null);const before=copy(s);assert.match(boostWonder(s,quote.stage,quote.level),/changed/);assert.deepEqual(s,before);}
  assert.equal(wonderSpeed(s),2);assert.equal(wonderBoostQuote(s),null);const before=copy(s);assert.match(boostWonder(s),/maximum/);assert.deepEqual(s,before);
});
test('unfunded, paused, inactive, stale-stage and almost-complete boosts are atomic',()=>{
  const s=active();s.resources.brick=0;let before=copy(s);assert.match(boostWonder(s),/Not enough/);assert.deepEqual(s,before);
  fund(s);s.paused=true;before=copy(s);assert.match(boostWonder(s),/Resume/);assert.deepEqual(s,before);s.paused=false;
  before=copy(s);assert.match(boostWonder(s,1,0),/no longer active/);assert.deepEqual(s,before);
  s.wonder.remaining=.5;before=copy(s);assert.match(boostWonder(s),/nearly complete/);assert.deepEqual(s,before);
  const idle=fresh();before=copy(idle);assert.match(boostWonder(idle),/no longer active/);assert.deepEqual(idle,before);
});
test('boosted completion resets only the current stage, unlocks its achievement and never buys the next one',()=>{
  const s=active();assert.equal(boostWonder(s),null);tick(s,1439);assert.equal(s.wonder.stage,0);near(wonderRemaining(s),1);
  tick(s,1);assert.equal(s.wonder.stage,1);assert.equal(s.wonder.remaining,0);assert.equal(s.wonder.boosts,0);assert.equal(wonderSpeed(s),1);assert.ok(s.meta.achievements.includes('foundations'));
  const before=copy(s);assert.match(boostWonder(s,0,0),/no longer active/);assert.deepEqual(s,before);
  fund(s);assert.equal(startWonder(s),null);assert.equal(s.wonder.boosts,0);near(wonderRemaining(s),2400);
});
test('speed persists through saves, offline work and pause and combines with permanent construction bonuses',()=>{
  const s=copy(reference.beforeWonder);s.meta.upgrades.knowledge=2;fund(s);assert.equal(startWonder(s),null);assert.equal(boostWonder(s),null);near(s.wonder.duration,1500);near(wonderRemaining(s),1200);
  const loaded=restore(serialize(s,1000),61000);assert.ok(loaded);assert.equal(loaded.state.wonder.boosts,1);near(wonderRemaining(loaded.state),1140);
  loaded.state.paused=true;const paused=copy(loaded.state);tick(loaded.state,1000);assert.deepEqual(loaded.state,paused);
  const pausedLoad=restore(serialize(loaded.state,1000),601000);assert.ok(pausedLoad);near(wonderRemaining(pausedLoad.state),1140);
  const done=restore(serialize(s,1000),1201000);assert.ok(done);assert.equal(done.state.wonder.stage,1);assert.equal(done.state.wonder.boosts,0);assert.equal(done.state.wonder.remaining,0);
});
test('supplies speed only the wonder and the final observation still enables a clean RE-Evolution',()=>{
  const s=active();assert.equal(research(s,'markets'),null);const remaining=researchRemaining(s);assert.equal(boostWonder(s),null);tick(s,10);near(researchRemaining(s),remaining-10);
  const last=copy(reference.state);last.wonder={stage:3,remaining:1800,duration:1800,boosts:0};fund(last);assert.equal(boostWonder(last),null);tick(last,1440);assert.ok(canReevolve(last));assert.equal(last.wonder.boosts,0);
  assert.equal(reevolve(last,1000),null);assert.deepEqual(last.wonder,{stage:0,remaining:0,duration:0,boosts:0});
});
test('format 11 projects retain their existing work on migration and invalid speed data is rejected',()=>{
  const old=active();old.version=11;delete old.wonder.boosts;const loaded=restore(serialize(old,1000),1000);assert.ok(loaded);assert.equal(loaded.state.version,13);assert.equal(loaded.state.wonder.boosts,0);near(wonderRemaining(loaded.state),1800);
  for(const bad of [undefined,-1,.5,5,'1']){const s=active();s.wonder.boosts=bad;assert.equal(restore(serialize(s,1000),1000),null);}
  const inactive=fresh();inactive.wonder.boosts=1;assert.equal(restore(serialize(inactive,1000),1000),null);
});
