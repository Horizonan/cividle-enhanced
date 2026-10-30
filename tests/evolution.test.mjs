import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateFirstRun} from '../scripts/balance-run.mjs';
import {fresh,tick,harvest,build,demolishHome,marketTrade,recordAchievements,evolutionQuote,reevolve,buyStar,hasStar,acknowledgeEvolution,CONSTELLATIONS,STARS,LEGACY_STAR_IDS,serialize,restore,foodConsumption,multiplier,researchDuration,wonderDuration,storageCapacity,explorationRate,researchSpeed,setGuild,GUILDS,buildingUnlocked,visibleTechnologies,researchRequirements,wonderProjects,startWonder,wonderRemaining,canReevolve,boostWonder,assignWorkers,count,JOB_TYPES} from '../dist/model.js';
const base=simulateFirstRun().state;
const completed=()=>structuredClone(base),near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,a+' != '+b);
function next(){const s=completed();reevolve(s,2000);return s;}

test('collections quote is pure, awards all reached tiers, and never claims on preview',()=>{
 const s=completed(),before=structuredClone(s),q=evolutionQuote(s);assert.deepEqual(s,before);assert.equal(q.base,12);assert.ok(q.collectionPoints>0);assert.ok(q.itemPoints>=4);assert.equal(q.total,q.base+q.collectionPoints+q.itemPoints);
 s.resources.stone=0;assert.deepEqual(evolutionQuote(s),q);
 const row=q.rows.find(x=>x.id==='stone');assert.equal(row.reached,2);assert.equal(row.points,2);
});
test('production stats count harvesting and actual output but exclude trade and refunds',()=>{
 const s=fresh(1000);for(let i=0;i<10;i++)harvest(s);near(s.runStats.produced.wheat,10);build(s,'farm');assert.equal(s.runStats.constructed,1);tick(s,10);assert.ok(s.runStats.produced.wheat>10);
 const mature=completed();mature.tech.push('markets');mature.resources.wood=100;mature.resources.coin=100;const before=structuredClone(mature.runStats);assert.equal(marketTrade(mature,'wood','buy',10),null);assert.equal(marketTrade(mature,'wood','sell',10),null);assert.deepEqual(mature.runStats,before);
 const home=fresh();home.tech=['housing'];home.earned.wheat=200;home.resources.wheat=200;home.resources.wood=100;build(home,'house');const stats=structuredClone(home.runStats);home.resources.wheat=0;home.resources.wood=0;assert.equal(demolishHome(home,home.buildings[0].x,home.buildings[0].y),null);assert.deepEqual(home.runStats,stats);
});
test('points are awarded atomically once; receipt replay and acknowledgement cannot pay again',()=>{
 const s=completed(),q=evolutionQuote(s);assert.equal(reevolve(s,2000),null);assert.equal(s.meta.insight,q.total);assert.equal(s.meta.history[0].reward,q.total);assert.equal(s.meta.pendingEvolution.total,q.total);
 const before=structuredClone(s);assert.match(reevolve(s),/Complete/);assert.deepEqual(s,before);assert.equal(evolutionQuote(s).total,12);
 const saved=restore(serialize(s,2000),2000);assert.ok(saved);assert.equal(saved.state.meta.pendingEvolution.total,q.total);acknowledgeEvolution(saved.state);assert.equal(saved.state.meta.insight,q.total);acknowledgeEvolution(saved.state);assert.equal(saved.state.meta.insight,q.total);
 const reset=fresh(3000,s.meta);assert.equal(reset.meta.insight,q.total);assert.equal(reset.runStats.constructed,0);assert.deepEqual(reset.meta.collections,s.meta.collections);
});
test('stars enforce evolution, prerequisites, balance, uniqueness and pause without partial payments',()=>{
 assert.match(buyStar(fresh(),'seed'),/first RE-Evolution/);const s=next();
 for(const id of ['hearth','unknown']){const before=structuredClone(s);assert.ok(buyStar(s,id));assert.deepEqual(s,before);}
 assert.equal(buyStar(s,'seed'),null);assert.ok(hasStar(s,'seed'));assert.equal(buyStar(s,'hearth'),null);
 let before=structuredClone(s);assert.ok(buyStar(s,'seed'));assert.deepEqual(s,before);s.meta.insight=0;before=structuredClone(s);assert.ok(buyStar(s,'chisel'));assert.deepEqual(s,before);
 s.meta.insight=100;s.paused=true;before=structuredClone(s);assert.ok(buyStar(s,'chisel'));assert.deepEqual(s,before);
});
test('every constellation bonus affects its own system and stacks with retained upgrades',()=>{
 const s=next();s.meta.insight=200;const ordinary=structuredClone(s);for(const id of LEGACY_STAR_IDS)assert.equal(buyStar(s,id),null);
 near(multiplier(s,{type:'farm'}),1.2*1.1);near(multiplier(s,{type:'lumber'}),1.15*1.1);near(multiplier(s,{type:'quarry'}),1.15*1.1);near(multiplier(s,{type:'kiln'}),1.2*1.1);near(multiplier(s,{type:'workshop'}),1.2*1.1);near(multiplier(s,{type:'grandArchive'}),1.25*1.1);near(multiplier(s,{type:'ship'}),1.2*1.3*1.1);
 near(foodConsumption(s),foodConsumption(ordinary)*.9);assert.equal(storageCapacity(s,'wheat'),Math.floor(storageCapacity(ordinary,'wheat')*1.25));near(researchDuration(s,'agriculture'),researchDuration(ordinary,'agriculture')*.85);near(wonderDuration(s,0),wonderDuration(ordinary,0)*.85);
 s.mapUnlocked=true;s.assignments.explorer=2;near(explorationRate(s),2.5);s.meta.upgrades.production=1;near(multiplier(s,{type:'farm'}),1.2*1.1*1.15);
 const taxes=fresh(1000,s.meta);taxes.tech=['trade'];tick(taxes,10);near(taxes.resources.coin,.72);
});
test('format 12 migration preserves the run, credits older evolutions once, and retains upgrades',()=>{
 const s=completed();s.version=12;s.meta.revolutions=2;s.meta.insight=3;s.meta.upgrades.production=2;delete s.runStats;delete s.guildFocus;delete s.meta.stars;delete s.meta.collections;delete s.meta.pendingEvolution;delete s.assignments.grandArchive;
 const result=restore(serialize(s,1000),1000);assert.ok(result);assert.equal(result.state.version,13);assert.equal(result.state.meta.insight,27);assert.deepEqual(result.state.buildings,s.buildings);assert.deepEqual(result.state.wonder,s.wonder);assert.equal(result.state.meta.upgrades.production,2);
 const again=restore(serialize(result.state,1000),1000);assert.equal(again.state.meta.insight,27);assert.equal(result.state.runStats.constructed,s.buildings.length);
});
test('malformed stars, receipt, stats, guild, collection tiers and impossible first-run technology are rejected',()=>{
 for(const change of [s=>s.meta.stars=['unknown'],s=>s.meta.stars=['hearth'],s=>s.runStats.produced.stone=-1,s=>s.runStats.constructed=.5,s=>s.meta.collections.tiers.stone=99,s=>s.meta.collections.items=['unknown'],s=>s.meta.collections.claimedItems=['seal'],s=>s.meta.pendingEvolution={base:12,collectionPoints:2,itemPoints:0,total:14},s=>s.guildFocus='industry',s=>s.tech.push('renaissance')]){const s=completed();change(s);assert.equal(restore(serialize(s,1000),1000),null);}
});
test('guild and Renaissance content are gated behind the first completed evolution',()=>{
 const s=completed();assert.equal(wonderProjects(s).length,4);assert.equal(buildingUnlocked(s,'guildhall'),false);assert.ok(!visibleTechnologies(s).includes('guildCharters'));assert.ok(researchRequirements(s,'guildCharters').some(x=>x.includes('RE-Evolution')));
 s.meta.revolutions=1;assert.equal(wonderProjects(s).length,6);assert.equal(canReevolve(s),false);assert.ok(visibleTechnologies(s).includes('guildCharters'));assert.match(startWonder(s),/Printing/);
 assert.ok(researchRequirements(s,'celestialNavigation').includes('Complete a ship'));
});
test('guild switching applies its tradeoff, changes research speed, respects pause and survives saves',()=>{
 const s=completed();s.meta.revolutions=1;assert.ok(setGuild(s,'industry'));s.tech.push('guildCharters');assert.equal(build(s,'guildhall'),null);const basic=structuredClone(s);
 assert.equal(setGuild(s,'industry'),null);near(multiplier(s,{type:'workshop'}),multiplier(basic,{type:'workshop'})*1.35);near(multiplier(s,{type:'farm'}),multiplier(basic,{type:'farm'})*.9);
 assert.equal(setGuild(s,'agrarian'),null);near(multiplier(s,{type:'farm'}),multiplier(basic,{type:'farm'})*1.25);near(multiplier(s,{type:'workshop'}),multiplier(basic,{type:'workshop'})*.9);
 assert.equal(setGuild(s,'scholars'),null);near(researchSpeed(s),researchSpeed(basic)*1.25);near(multiplier(s,{type:'lumber'}),multiplier(basic,{type:'lumber'})*.9);assert.ok(restore(serialize(s,1000),1000));
 s.paused=true;const before=structuredClone(s);assert.ok(setGuild(s,null));tick(s,100);assert.deepEqual(s,before);
});
test('a produced-resource second civilization reaches a paid six-stage Atlas and new collections',()=>{
 const s=next();for(const id of ['seed','chisel','thought'])assert.equal(buyStar(s,id),null);
 const result=simulateFirstRun(()=>{},s.meta);const world=result.state;
 assert.equal(world.wonder.stage,6);assert.equal(canReevolve(world),true);assert.ok(world.tech.includes('renaissance'));assert.ok(world.tech.includes('celestialNavigation'));assert.ok(count(world,'grandArchive')>=1);assert.ok(world.fleet.ships>=1);assert.ok(world.population>=84);assert.ok(storageCapacity(world,'science')>=8000);assert.ok(world.meta.collections.items.includes('chart'));assert.ok(world.meta.collections.items.includes('seal'));
 const q=evolutionQuote(world);assert.ok(q.items.includes('chart'));assert.ok(!q.items.includes('lens'));assert.ok(q.rows.every(row=>row.claimed<=row.reached));assert.ok(restore(serialize(world,1000),1000));
 const seconds=world.elapsed,balance=world.meta.insight;assert.equal(reevolve(world,2000),null);assert.equal(world.meta.insight,balance+q.total);assert.equal(world.meta.revolutions,2);assert.deepEqual(world.meta.stars,s.meta.stars);assert.equal(world.guildFocus,null);assert.equal(world.wonder.stage,0);assert.equal(evolutionQuote(world).total,12);
 console.log('Second civilization reference:',(seconds/3600).toFixed(2),'hours before reset');
});

test('collection thresholds grant a tier once and only new personal records add rewards',()=>{
 const s=fresh();s.runStats.produced.stone=999;recordAchievements(s);assert.equal(evolutionQuote(s).rows.find(x=>x.id==='stone').points,0);
 s.runStats.produced.stone=1000;recordAchievements(s);assert.equal(evolutionQuote(s).rows.find(x=>x.id==='stone').points,1);
 s.meta.collections.tiers.stone=1;s.meta.collections.claimedItems=['tablet'];assert.equal(evolutionQuote(s).total,12);
 s.runStats.produced.stone=10000;recordAchievements(s);const row=evolutionQuote(s).rows.find(x=>x.id==='stone');assert.equal(row.points,1);assert.equal(row.reached,2);s.runStats.produced.stone=0;recordAchievements(s);assert.equal(evolutionQuote(s).rows.find(x=>x.id==='stone').value,10000);
});
test('offline production updates collections, paused time cannot farm them',()=>{
 const s=completed();s.resources.tool=0;const initial=s.runStats.produced.tool,loaded=restore(serialize(s,1000),11000);assert.ok(loaded);assert.ok(loaded.state.runStats.produced.tool>initial);assert.ok(loaded.state.meta.collections.records.tool>initial);
 s.paused=true;const paused=restore(serialize(s,1000),11000);near(paused.state.runStats.produced.tool,initial);assert.equal(paused.state.meta.insight,0);
});
test('later Atlas stages require their own research, population and separate payment; offline finishes only funded work',()=>{
 const s=completed();s.meta.revolutions=1;s.tech.push('guildCharters');build(s,'guildhall');s.tech.push('waterpower','renaissance','printingPress');
 assert.match(startWonder(s),/84 residents/);
 // Build a valid second-civilization fixture using real automatic placement and unlocked research.
 const rich=simulateFirstRun(()=>{},next().meta).state;rich.wonder.stage=4;rich.tech=rich.tech.filter(id=>id!=='celestialNavigation');for(const key of Object.keys(rich.resources))rich.resources[key]=storageCapacity(rich,key);
 assert.equal(startWonder(rich),null);const paid=structuredClone(rich.resources),remaining=rich.wonder.remaining;assert.equal(boostWonder(rich),null);assert.ok(wonderRemaining(rich)<remaining);
 const loaded=restore(serialize(rich,1000),1000+28800000);assert.ok(loaded);assert.equal(loaded.state.wonder.stage,5);assert.equal(loaded.state.wonder.remaining,0);assert.equal(canReevolve(loaded.state),false);assert.match(startWonder(loaded.state),/Celestial navigation/);
});

test('new star duration bonuses preserve active projects while guild research speed applies immediately offline',()=>{
 const s=completed();s.meta.revolutions=1;s.meta.insight=100;s.wonder.stage=0;
 s.tech.push('guildCharters');assert.equal(build(s,'guildhall'),null);
 assert.equal(startWonder(s),null);
 // Markets is unlocked but not yet researched on the reference route.
 s.researching={id:'markets',duration:480,remaining:480};const wonder=s.wonder.duration;
 assert.equal(buyStar(s,'thought'),null);assert.equal(buyStar(s,'archive'),null);assert.equal(buyStar(s,'vision'),null);
 near(s.wonder.duration,wonder);near(s.researching.remaining,480);near(wonderDuration(s,0),wonder*.85);
 assert.equal(setGuild(s,'scholars'),null);const loaded=restore(serialize(s,1000),11000);assert.ok(loaded);near(loaded.state.researching.remaining,467.5);near(loaded.state.wonder.remaining,wonder-10);
});
