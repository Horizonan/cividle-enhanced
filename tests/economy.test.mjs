import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RESOURCE, BUILDINGS, TECH, JOB_TYPES, MARKET_PRICES, POPULATION_INTERVAL, storageCapacity, fresh, count, capacity, population, nextArrival, workers, workerDemand, assignedWorkers, idleWorkers, assignWorkers, staffing, constructionUnlocked, mapAvailable,
  researchUnlocked, visibleResources, visibleTechnologies, researchRequirements, availableBuildings,
  rates, multiplier, tick, harvest, affordable, buildCost, build, researchCost, research, speedResearch,
  trade, coinsUnlocked, tradeUnlocked, marketQuote, marketTrade, estimateWait, serialize, restore, freeTile, terrain,
} from '../dist/model.js';

const copy = s => JSON.parse(JSON.stringify(s));
const near = (a,b) => assert.ok(Math.abs(a-b)<1e-7, a + ' ≠ ' + b);
function gather(s,n) { for(let i=0;i<n;i++) assert.equal(harvest(s),null); }
function waitFor(s,cost) {
  let waited=0;
  while(!affordable(s,cost) && waited<14400) { tick(s,5); waited+=5; }
  assert.ok(affordable(s,cost),'Unreachable cost: '+JSON.stringify(cost));
}
function buy(s,type) { waitFor(s,buildCost(s,type)); assert.equal(build(s,type),null); }
function discover(s,id) {
  assert.deepEqual(researchRequirements(s,id),[],'Requirements for '+id);
  waitFor(s,researchCost(id));
  assert.equal(research(s,id),null);
  tick(s,TECH[id].duration);
  assert.ok(s.tech.includes(id));
}
function opening() { const s=fresh(1000); gather(s,27); buy(s,'farm'); buy(s,'farm'); return s; }

// A reproducible mostly-idle route: 27 opening clicks, then production pays for every purchase.
const route=opening(), timeline=[];
const mark = label => timeline.push({label,minutes:Math.round(route.elapsed/6)/10});
discover(route,'agriculture'); mark('Cultivation');
discover(route,'granaries'); mark('Granaries');
buy(route,'barn');
while(count(route,'farm')<6) buy(route,'farm');
discover(route,'forestry'); mark('Woodcutting');
buy(route,'lumber'); buy(route,'lumber');
discover(route,'stockpiles'); mark('Stockpiles');
discover(route,'housing'); buy(route,'house'); mark('Shelter');
discover(route,'masonry'); buy(route,'quarry'); buy(route,'quarry'); mark('Stone tools');
buy(route,'house'); buy(route,'house');
discover(route,'warehousing'); mark('Warehouses');
buy(route,'warehouse');
discover(route,'writing'); buy(route,'hall'); mark('Writing / town hall');
discover(route,'scholarship'); buy(route,'library'); mark('Record keeping / library');
discover(route,'archives'); mark('Archives');
const beforeMapping=copy(route);
discover(route,'map'); mark('Mapping');
const mapped=copy(route);
console.log('Idle balance route:',JSON.stringify(timeline));

test('new games expose only wheat; waiting does not create buildings, currencies or research',()=>{
  const s=fresh();
  assert.deepEqual(visibleResources(s),['wheat']);
  assert.equal(s.resources.wheat,0); assert.equal(s.buildings.length,0);
  assert.equal(constructionUnlocked(s),false); assert.equal(researchUnlocked(s),false);
  assert.deepEqual(availableBuildings(s),[]); assert.deepEqual(visibleTechnologies(s),[]);
  tick(s,28800);
  assert.ok(Object.values(s.resources).every(n=>n===0));
  assert.equal(s.mapUnlocked,false); assert.equal(s.researching,null);
});
test('the first field is affordable after ten harvests but produces incrementally',()=>{
  const s=fresh(); gather(s,9); assert.equal(constructionUnlocked(s),false);
  gather(s,1); assert.equal(build(s,'farm'),null);
  assert.equal(s.resources.wheat,0); assert.equal(constructionUnlocked(s),true);
  tick(s,60); near(s.resources.wheat,0); // One field cannot feed six founders; harvesting bridges the second field.
  assert.equal(buildCost(s,'farm').wheat,17);
  assert.deepEqual(visibleResources(s),['wheat']);
  assert.deepEqual(visibleTechnologies(s),['agriculture']);
  assert.ok(researchRequirements(s,'agriculture').some(v=>v.includes('2 wheat fields')));
});
test('three fields and even full resource stores cannot skip the logical path to Mapping',()=>{
  const s=opening(); buy(s,'farm');
  for(const k of Object.keys(RESOURCE)) s.resources[k]=10000;
  assert.equal(mapAvailable(s),false);
  assert.ok(!visibleTechnologies(s).includes('map'));
  const before=JSON.stringify(s);
  assert.ok(research(s,'map')); assert.equal(JSON.stringify(s),before);
  tick(s,28800);
  assert.equal(s.mapUnlocked,false); assert.equal(count(s,'farm'),3);
  assert.ok(!availableBuildings(s).includes('lumber'));
});
test('production and building construction work throughout the economy before a map exists',()=>{
  const s=copy(beforeMapping);
  assert.equal(s.mapUnlocked,false);
  for(const type of ['farm','lumber','quarry','house','hall','library']) assert.ok(count(s,type)>0);
  assert.deepEqual(visibleResources(s),['wheat','wood','stone','science']);
  s.resources.wood=0; s.resources.stone=0; s.resources.science=0;
  assert.ok(rates(s).wood>0); assert.ok(rates(s).stone>0); assert.ok(rates(s).science>0);
  const coords=s.buildings.map(b=>[b.x,b.y]);
  discover(s,'map');
  assert.deepEqual(s.buildings.map(b=>[b.x,b.y]),coords);
});
test('the mostly-idle route reaches Mapping in 60–150 minutes including storage progression',()=>{
  assert.ok(mapped.elapsed>=60*60,'Mapping was too early');
  assert.ok(mapped.elapsed<=150*60,'Opening route stalled');
  assert.ok(mapped.mapUnlocked);
  assert.ok(count(mapped,'farm')>=6); assert.ok(count(mapped,'house')>=3);
  assert.ok(mapped.tech.includes('scholarship')); assert.ok(count(mapped,'library')>=1);
  const mandatory=['agriculture','forestry','housing','masonry','writing','scholarship','map'];
  assert.ok(mandatory.reduce((sum,id)=>sum+TECH[id].duration,0)>=40*60);
});
test('research spends upfront, queues one project, and changes nothing until completion',()=>{
  const s=opening(); waitFor(s,researchCost('agriculture'));
  const before=s.resources.wheat;
  assert.equal(research(s,'agriculture'),null);
  near(s.resources.wheat,before-80);
  assert.equal(s.researching.id,'agriculture');
  assert.equal(s.tech.includes('agriculture'),false);
  near(rates(s).wheat,.1); // Paying opens room in the previously full store; production is still unupgraded.
  const snapshot=JSON.stringify(s); assert.ok(research(s,'forestry')); assert.equal(JSON.stringify(s),snapshot);
  tick(s,89); assert.ok(!s.tech.includes('agriculture'));
  tick(s,1); assert.ok(s.tech.includes('agriculture')); assert.equal(s.researching,null);
  near(rates(s).wheat,.26); // The production bonus does not multiply food consumption.
});
test('research completion inside a time step applies its shared bonus only afterward',()=>{
  const s=opening(); waitFor(s,researchCost('agriculture')); research(s,'agriculture');
  s.researching.remaining=.5; const before=s.resources.wheat;
  tick(s,1);
  near(s.resources.wheat-before,.1*.5+.26*.5);
  assert.ok(s.buildings.every(b=>!Object.hasOwn(b,'level')));
  buy(s,'farm'); near(rates(s).wheat,.54);
});
test('each research click removes one second without granting production or spending resources',()=>{
  const s=opening(); waitFor(s,researchCost('agriculture')); research(s,'agriculture');
  const resources={...s.resources}, earned={...s.earned}, elapsed=s.elapsed;
  for(let i=0;i<12;i++)assert.equal(speedResearch(s,'agriculture'),null);
  assert.equal(s.researching.remaining,78);
  assert.deepEqual(s.resources,resources); assert.deepEqual(s.earned,earned);
  assert.equal(s.elapsed,elapsed); assert.ok(!s.tech.includes('agriculture'));
  const snapshot=JSON.stringify(s);
  assert.ok(speedResearch(s,'forestry')); assert.equal(JSON.stringify(s),snapshot);
  s.paused=true; const paused=JSON.stringify(s);
  assert.ok(speedResearch(s,'agriculture')); assert.equal(JSON.stringify(s),paused);
});
test('the final research click completes its unlock once and does not affect another project',()=>{
  const s=copy(beforeMapping); waitFor(s,researchCost('map')); research(s,'map');
  s.researching.remaining=.25;
  const resources={...s.resources};
  assert.equal(speedResearch(s,'map'),null);
  assert.equal(s.researching,null); assert.equal(s.mapUnlocked,true);
  assert.equal(s.tech.filter(id=>id==='map').length,1);
  assert.deepEqual(s.resources,resources);
  assert.ok(speedResearch(s,'map'));
  waitFor(s,researchCost('trade')); research(s,'trade');
  const snapshot=JSON.stringify(s);
  assert.ok(speedResearch(s,'map')); assert.equal(JSON.stringify(s),snapshot);
});
test('click-shortened timers survive saving and complete correctly during offline production',()=>{
  const now=1000000,s=opening(); waitFor(s,researchCost('agriculture')); research(s,'agriculture');
  for(let i=0;i<30;i++)speedResearch(s,'agriculture');
  const before=s.resources.wheat;
  const result=restore(serialize(s,now),now+70000);
  assert.ok(result); assert.equal(result.state.researching,null);
  assert.ok(result.state.tech.includes('agriculture'));
  near(result.state.resources.wheat-before,.1*60+.26*10);
});
test('Mapping needs a functioning town, multiple resources, and its full 15-minute research',()=>{
  const s=copy(beforeMapping);
  const house=s.buildings.findIndex(b=>b.type==='house'); s.buildings.splice(house,1);
  assert.ok(researchRequirements(s,'map').some(v=>v.includes('3 houses')));
  assert.ok(research(s,'map'));
  buy(s,'house'); waitFor(s,researchCost('map'));
  assert.equal(research(s,'map'),null); assert.equal(s.mapUnlocked,false);
  tick(s,899); assert.equal(s.mapUnlocked,false);
  tick(s,1); assert.equal(s.mapUnlocked,true);
  assert.ok(research(s,'map'));
});
test('pausing freezes both research and production and refuses purchases',()=>{
  const s=opening(); waitFor(s,researchCost('agriculture')); research(s,'agriculture'); s.paused=true;
  const before=JSON.stringify(s);
  tick(s,1000); assert.ok(harvest(s)); assert.ok(build(s,'farm')); assert.ok(research(s,'forestry'));
  assert.equal(JSON.stringify(s),before);
  assert.ok(Object.values(rates(s)).every(n=>n===0));
});
test('offline research completes once and uses the correct before/after production rates',()=>{
  const now=1000000,s=opening(); waitFor(s,researchCost('agriculture')); research(s,'agriculture');
  const before=s.resources.wheat;
  const result=restore(serialize(s,now),now+120000);
  assert.ok(result); assert.equal(result.state.researching,null);
  assert.equal(result.state.tech.filter(k=>k==='agriculture').length,1);
  near(result.state.resources.wheat-before,.1*90+.26*30);
  assert.equal(result.state.mapUnlocked,false);
});
test('offline progress has an eight-hour cap, no automatic purchases, and respects pause',()=>{
  const now=1000000,s=opening();
  const loaded=restore(serialize(s,now),now+86400000);
  assert.equal(loaded.offline,28800); near(loaded.state.resources.wheat,storageCapacity(s,'wheat'));
  assert.equal(loaded.state.buildings.length,2); assert.equal(loaded.state.mapUnlocked,false);
  s.paused=true; const paused=restore(serialize(s,now),now+86400000);
  near(paused.state.resources.wheat,s.resources.wheat);
  assert.equal(restore(serialize(s,now),now-10000).offline,0);
});
test('insufficient multi-resource payments and blocked placement are atomic',()=>{
  const s=copy(beforeMapping); s.resources.science=179;
  const before=JSON.stringify(s);
  assert.ok(research(s,'map')); assert.equal(JSON.stringify(s),before);
  const b=s.buildings[0];
  assert.ok(build(s,'farm',b.x,b.y)); assert.equal(JSON.stringify(s),before);
  assert.ok(build(s,'farm',0,0)); assert.equal(JSON.stringify(s),before);
  assert.ok(build(s,'farm',9,0)); assert.equal(JSON.stringify(s),before);
});
test('unstaffed buildings can be built and workers can move between jobs before Mapping',()=>{
  const s=opening(); discover(s,'agriculture'); discover(s,'granaries'); buy(s,'barn'); discover(s,'forestry');
  for(let i=0;i<3;i++) buy(s,'lumber');
  assert.equal(workers(s),capacity(s));
  discover(s,'housing'); discover(s,'masonry');
  buy(s,'quarry');
  assert.equal(assignedWorkers(s,'quarry'),0); near(rates(s).stone,0);
  assert.equal(count(s,'quarry'),1); assert.equal(idleWorkers(s),0);
  assert.equal(assignWorkers(s,'lumber',4),null);
  assert.equal(assignWorkers(s,'quarry',2),null);
  near(rates(s).wood,.4); near(rates(s).stone,.15);
  near(staffing(s,'lumber'),2/3);
  const staffed=JSON.stringify(s);
  assert.ok(assignWorkers(s,'lumber',6)); assert.equal(JSON.stringify(s),staffed);
  buy(s,'house'); assert.equal(idleWorkers(s),0);
  tick(s,60); assert.equal(idleWorkers(s),1);
  assert.equal(s.mapUnlocked,false); assert.ok(workers(s)<=capacity(s));
});
test('refineries share finite input without creating resources from nothing',()=>{
  const s=copy(mapped); s.tech.push('pottery'); s.buildings=[];
  s.assignments=Object.fromEntries(JOB_TYPES.map(type=>[type,0]));
  for(let i=0;i<2;i++)s.buildings.push({...freeTile(s,'kiln'),type:'kiln'});
  assert.equal(assignWorkers(s,'kiln',4),null);
  s.resources.stone=.3; s.resources.brick=0; tick(s,1);
  near(s.resources.stone,0); near(s.resources.brick,.15);
  tick(s,2); near(s.resources.stone,0); near(s.resources.brick,.15);
});
test('trade requires Currency and Markets research, with atomic payments',()=>{
  const early=copy(beforeMapping), before=JSON.stringify(early);
  assert.ok(research(early,'trade')); assert.ok(trade(early,'wheat'));
  assert.equal(JSON.stringify(early),before);
  const s=copy(mapped); discover(s,'trade'); assert.ok(trade(s,'wheat')); discover(s,'markets');
  const coins=s.resources.coin, wheat=s.resources.wheat;
  assert.equal(trade(s,'wheat'),null);
  near(s.resources.coin,coins+15); near(s.resources.wheat,wheat-50);
  s.resources.wheat=49; const snapshot=JSON.stringify(s);
  assert.ok(trade(s,'wheat')); assert.equal(JSON.stringify(s),snapshot);
});
test('old saves preserve completed systems and migrate to shared research without resetting',()=>{
  const old=opening(); old.version=2; delete old.researching;
  old.tech=['map']; old.mapUnlocked=true; old.buildings[0].level=4;
  const restored=restore(serialize(old,1000),1000);
  assert.ok(restored); assert.equal(restored.state.version,13);
  assert.equal(restored.state.buildings.length,old.buildings.length);
  assert.ok(restored.state.buildings.every(b=>!Object.hasOwn(b,'level')));
  for(const id of ['agriculture','forestry','housing','masonry','writing','scholarship','map'])assert.ok(restored.state.tech.includes(id));
  assert.equal(restored.state.mapUnlocked,true); assert.equal(restored.state.researching,null);
});
test('saves validate queued research and do not trust an unresearched map flag',()=>{
  const empty=fresh(1000); assert.ok(restore(serialize(empty,1000),1000));
  assert.equal(restore('null'),null); assert.equal(restore('{broken'),null);
  const invalid=opening(); invalid.researching={id:'map',remaining:20};
  assert.equal(restore(serialize(invalid)),null);
  const negative=opening(); negative.resources.wheat=-1;
  assert.equal(restore(serialize(negative)),null);
  const duplicate=opening(); duplicate.buildings.push({...duplicate.buildings[0]});
  assert.equal(restore(serialize(duplicate)),null);
  const fakeMap=opening(); fakeMap.mapUnlocked=true;
  assert.equal(restore(serialize(fakeMap),fakeMap.lastSaved).state.mapUnlocked,false);
});
test('full storage prevents overflow while fields still replace wheat consumed by residents',()=>{
  const s=opening(),cap=storageCapacity(s,'wheat'); s.resources.wheat=cap-.2;
  const earned=s.earned.wheat;
  assert.equal(harvest(s),null); near(s.resources.wheat,cap); near(s.earned.wheat-earned,.2);
  assert.ok(harvest(s));
  const fullEarned=s.earned.wheat;
  tick(s,1000); near(s.resources.wheat,cap); near(s.earned.wheat,fullEarned+300);
  near(rates(s).wheat,0);
  const loaded=restore(serialize(s,1000),1000+86400000);
  near(loaded.state.resources.wheat,cap); near(loaded.state.earned.wheat,fullEarned+300+8640);
});
test('Barns research unlocks construction and built storage resumes full production',()=>{
  const s=opening(); discover(s,'agriculture');
  waitFor(s,researchCost('granaries')); assert.equal(research(s,'granaries'),null);
  s.resources.wheat=80; s.researching.remaining=1;
  assert.equal(storageCapacity(s,'wheat'),80);assert.ok(build(s,'barn'));
  tick(s,2);
  assert.equal(storageCapacity(s,'wheat'),80);near(s.resources.wheat,80);
  assert.equal(build(s,'barn'),null);assert.equal(storageCapacity(s,'wheat'),480);tick(s,1);near(s.resources.wheat,60.26);
  assert.equal(storageCapacity(s,'wood'),25);
  assert.equal(storageCapacity(mapped,'wheat'),1040);
  assert.equal(storageCapacity(mapped,'wood'),775);
  assert.equal(storageCapacity(mapped,'science'),625);
});
test('full brick storage stops stone consumption; partial headroom consumes only matching input',()=>{
  const s=copy(mapped); s.tech.push('pottery'); buy(s,'kiln');
  assert.equal(assignWorkers(s,'quarry',0),null);
  s.resources.brick=storageCapacity(s,'brick'); s.resources.stone=10;
  tick(s,10); near(s.resources.stone,10);
  s.resources.brick-=.05;
  tick(s,1); near(s.resources.brick,storageCapacity(s,'brick')); near(s.resources.stone,9.9);
});
test('partial staffing scales every building in a job and leaves other jobs unchanged',()=>{
  const s=copy(mapped);
  for(const k of Object.keys(RESOURCE))s.resources[k]=0;
  assert.equal(assignWorkers(s,'lumber',1),null);
  assert.equal(assignedWorkers(s,'lumber'),1); near(staffing(s,'lumber'),.25);
  near(rates(s).wood,.1); near(rates(s).stone,.3);
  const stoneRate=rates(s).stone;
  assert.equal(assignWorkers(s,'lumber',0),null);
  near(rates(s).wood,0); near(rates(s).stone,stoneRate);
});
test('new construction uses idle workers but never steals an existing job assignment',()=>{
  const s=copy(mapped);
  for(const type of JOB_TYPES)if(workerDemand(s,type))assert.equal(assignWorkers(s,type,workerDemand(s,type)),null);
  const lumberBefore=assignedWorkers(s,'lumber'), quarryBefore=assignedWorkers(s,'quarry');
  const spare=idleWorkers(s); buy(s,'lumber');
  assert.equal(assignedWorkers(s,'lumber'),lumberBefore+Math.min(2,spare));
  assert.equal(assignedWorkers(s,'quarry'),quarryBefore);
});
test('invalid, excessive and paused worker transfers are atomic',()=>{
  const s=copy(mapped), before=JSON.stringify(s);
  for(const [type,n] of [['lumber',-1],['lumber',.5],['lumber',workerDemand(s,'lumber')+1],['farm',1],['unknown',1]]){
    assert.ok(assignWorkers(s,type,n)); assert.equal(JSON.stringify(s),before);
  }
  s.paused=true; const paused=JSON.stringify(s);
  assert.ok(assignWorkers(s,'lumber',0)); assert.equal(JSON.stringify(s),paused);
});
test('saved worker assignments control offline output and survive import',()=>{
  const s=copy(mapped); s.resources.wood=0; s.resources.stone=0;
  assignWorkers(s,'lumber',1); assignWorkers(s,'quarry',0);
  const saved=serialize(s,1000), loaded=restore(saved,61000);
  assert.ok(loaded); assert.equal(assignedWorkers(loaded.state,'lumber'),1); assert.equal(assignedWorkers(loaded.state,'quarry'),0);
  near(loaded.state.resources.wood,6); near(loaded.state.resources.stone,0);
  const invalid=copy(s); invalid.assignments.lumber=100;
  assert.equal(restore(serialize(invalid)),null);
});
test('version 3 saves preserve stockpiles and initialize staffing within population limits',()=>{
  const old=opening(); old.version=3; delete old.assignments;
  old.tech=['agriculture','forestry','masonry'];
  old.resources.wheat=900; old.resources.wood=350; old.resources.science=1200;
  for(let i=0;i<3;i++)old.buildings.push({...freeTile(old,'lumber'),type:'lumber'});
  old.buildings.push({...freeTile(old,'quarry'),type:'quarry'});
  const loaded=restore(serialize(old,1000),1000);
  assert.ok(loaded); assert.equal(loaded.state.version,13);
  near(loaded.state.resources.wheat,900); near(loaded.state.resources.wood,350); near(loaded.state.resources.science,1200);
  assert.equal(workers(loaded.state),capacity(loaded.state));
  assert.equal(assignedWorkers(loaded.state,'quarry'),0);
  assert.ok(loaded.state.tech.includes('organizedStorage'));
  assert.equal(loaded.state.mapUnlocked,false);
});
test('a trade never consumes goods when there is no room for its coins',()=>{
  const s=copy(mapped); discover(s,'trade'); discover(s,'markets');
  s.resources.coin=storageCapacity(s,'coin')-10;
  const before=JSON.stringify(s);
  assert.ok(trade(s,'wheat')); assert.equal(JSON.stringify(s),before);
});
function growthSettlement() {
  const s=opening(); s.tech.push('housing','granaries','stockpiles');
  s.resources.wheat=500; s.resources.wood=500;
  assert.equal(build(s,'barn'),null);
  return s;
}
test('houses create space immediately but new residents arrive once per minute',()=>{
  const s=growthSettlement(), initial=population(s), idle=idleWorkers(s);
  assert.equal(build(s,'house'),null);
  assert.equal(capacity(s),12); assert.equal(population(s),initial); assert.equal(idleWorkers(s),idle);
  assert.equal(nextArrival(s),POPULATION_INTERVAL);
  tick(s,59); assert.equal(population(s),6); near(nextArrival(s),1);
  tick(s,1); assert.equal(population(s),7); assert.equal(idleWorkers(s),idle+1);
  assert.equal(nextArrival(s),POPULATION_INTERVAL);
});
test('full housing cannot bank growth and offline growth stops at housing capacity',()=>{
  const s=growthSettlement(); tick(s,28800);
  assert.equal(population(s),6); assert.equal(s.growthProgress,0); assert.equal(nextArrival(s),null);
  build(s,'house'); tick(s,1); assert.equal(population(s),6);
  const loaded=restore(serialize(s,1000),1000+86400000);
  assert.ok(loaded); assert.equal(population(loaded.state),12);
  assert.equal(loaded.state.growthProgress,0); assert.equal(nextArrival(loaded.state),null);
});
test('growth progress persists and pause freezes it without accelerating research',()=>{
  const s=growthSettlement(); build(s,'house'); tick(s,35); s.paused=true;
  const loaded=restore(serialize(s,1000),601000);
  assert.ok(loaded); assert.equal(population(loaded.state),6); near(loaded.state.growthProgress,35);
  loaded.state.paused=false; tick(loaded.state,25);
  assert.equal(population(loaded.state),7);
});
test('empty housing cannot be assigned as workers; new residents remain idle',()=>{
  const s=copy(mapped); s.population=6; s.growthProgress=0;
  s.assignments.lumber=4; s.assignments.quarry=2; s.assignments.library=0;
  const before=JSON.stringify(s);
  assert.ok(assignWorkers(s,'library',1)); assert.equal(JSON.stringify(s),before);
  tick(s,60); assert.equal(population(s),7); assert.equal(idleWorkers(s),1);
  assert.equal(assignedWorkers(s,'library'),0);
  assert.equal(assignWorkers(s,'library',1),null); assert.equal(idleWorkers(s),0);
});
test('Currency reveals zero-balance coins and tax income but does not unlock the market',()=>{
  const s=copy(mapped);
  assert.equal(coinsUnlocked(s),false); assert.equal(tradeUnlocked(s),false);
  tick(s,10); near(s.resources.coin,0);
  assert.equal(research(s,'trade'),null); s.researching.remaining=.5;
  tick(s,1);
  assert.equal(coinsUnlocked(s),true); assert.equal(tradeUnlocked(s),false);
  assert.ok(visibleResources(s).includes('coin'));
  near(s.resources.coin,population(s)*.01*.5);
  const before=JSON.stringify(s); assert.ok(marketTrade(s,'wheat','buy',10)); assert.equal(JSON.stringify(s),before);
});
test('tax income changes when a resident actually arrives, including offline',()=>{
  const s=growthSettlement(); build(s,'house'); s.tech.push('trade'); s.resources.coin=0;
  const loaded=restore(serialize(s,1000),91000);
  assert.ok(loaded); assert.equal(population(loaded.state),7);
  near(loaded.state.resources.coin,6*.01*60+7*.01*30);
});
test('market purchases and sales exchange exact amounts, including fractional coin prices',()=>{
  const s=copy(mapped); s.tech.push('trade','markets'); s.resources.coin=100;
  const wheat=s.resources.wheat;
  assert.equal(marketTrade(s,'wheat','sell',50),null);
  near(s.resources.coin,115); near(s.resources.wheat,wheat-50);
  assert.equal(marketTrade(s,'wheat','buy',10),null);
  near(s.resources.coin,105); near(s.resources.wheat,wheat-40);
  near(marketQuote('stone','sell',10).receive.coin,7.5);
});
test('buying and selling the same goods cannot generate coins',()=>{
  for(const key of Object.keys(MARKET_PRICES)) {
    const s=copy(mapped); s.tech.push('trade','markets'); s.resources.coin=500; s.resources[key]=0;
    assert.equal(marketTrade(s,key,'buy',10),null);
    assert.equal(marketTrade(s,key,'sell',10),null);
    assert.ok(s.resources.coin<500); near(s.resources[key],0);
  }
});
test('failed market transactions never lose coins or goods',()=>{
  const s=copy(mapped); s.tech.push('trade','markets'); s.resources.coin=0;
  let before=JSON.stringify(s); assert.ok(marketTrade(s,'wood','buy',10)); assert.equal(JSON.stringify(s),before);
  s.resources.coin=500; s.resources.wood=storageCapacity(s,'wood')-5;
  before=JSON.stringify(s); assert.ok(marketTrade(s,'wood','buy',10)); assert.equal(JSON.stringify(s),before);
  for(const [key,direction,n] of [['science','buy',10],['wheat','buy',0],['wheat','buy',-1],['wheat','buy',.5],['wheat','other',10]]) {
    assert.ok(marketTrade(s,key,direction,n)); assert.equal(JSON.stringify(s),before);
  }
  s.paused=true; before=JSON.stringify(s); assert.ok(marketTrade(s,'wheat','sell',10)); assert.equal(JSON.stringify(s),before);
});
test('legacy populated houses and completed trading remain available after migration',()=>{
  const old=copy(mapped); old.version=4; old.tech.push('trade');
  delete old.population; delete old.growthProgress;
  const loaded=restore(serialize(old,1000),1000);
  assert.ok(loaded); assert.equal(loaded.state.version,13);
  assert.equal(population(loaded.state),capacity(loaded.state));
  assert.deepEqual(loaded.state.assignments,old.assignments);
  assert.equal(tradeUnlocked(loaded.state),true); assert.ok(loaded.state.tech.includes('markets'));
});
test('population and growth save validation rejects impossible residents or assignments',()=>{
  const s=opening(); s.population=capacity(s)+1;
  assert.equal(restore(serialize(s)),null);
  s.population=6; s.growthProgress=60; assert.equal(restore(serialize(s)),null);
  s.growthProgress=-1; assert.equal(restore(serialize(s)),null);
});
test('waiting estimates are read-only and use the slowest required resource',()=>{
  const s=copy(mapped); s.resources.wood=0; s.resources.stone=0;
  const before=JSON.stringify(s), result=estimateWait(s,{wood:10,stone:6});
  assert.equal(result.status,'waiting'); near(result.seconds,25);
  assert.equal(JSON.stringify(s),before);
  const early=opening(); early.resources.wheat=0;
  near(estimateWait(early,{wheat:80}).seconds,80/.1);
});
test('waiting estimates explain ready, paused, storage, and missing-production states',()=>{
  const s=opening();
  assert.equal(estimateWait(s,{wheat:0}).status,'ready');
  assert.equal(estimateWait(s,{wheat:101}).status,'storage');
  assert.equal(estimateWait(s,{wood:10}).status,'production');
  s.paused=true; assert.equal(estimateWait(s,{wheat:10}).status,'paused');
  assert.equal(estimateWait(fresh(),{wheat:10}).resource,'wheat');
});
test('brick waiting estimates account for finite stone reserves and ongoing supply',()=>{
  const s=copy(mapped); s.tech.push('pottery'); buy(s,'kiln'); s.resources.brick=0; s.resources.stone=0;
  assert.equal(assignWorkers(s,'quarry',1),null);
  const estimate=estimateWait(s,{brick:3});
  assert.equal(estimate.status,'waiting'); near(estimate.seconds,80);
  assignWorkers(s,'quarry',0); s.resources.stone=8;
  near(estimateWait(s,{brick:3}).seconds,30);
  assert.equal(estimateWait(s,{brick:5}).status,'input');
});
test('coin waiting estimates use current population income',()=>{
  const s=copy(mapped); s.tech.push('trade','markets'); s.resources.coin=0;
  const estimate=estimateWait(s,marketQuote('wheat','buy',10).cost);
  assert.equal(estimate.status,'waiting'); near(estimate.seconds,10/(population(s)*.01));
});
