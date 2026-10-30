import test from 'node:test';
import assert from 'node:assert/strict';
import {fresh,TECH,RESOURCE,harvest,build,buildCost,freeTile,terrain,tileKnown,assignWorkers,workerDemand,assignedWorkers,idleWorkers,tick,EXPLORATION_WORK,explorationRate,research,researchRemaining,startShip,assignShips,SHIP_DURATION,SHIP_COST,foodConsumption,foodSupply,rates,storageCapacity,serialize,restore,initialTiles,reevolve,estimateWait} from '../dist/model.js';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} ≠ ${b}`);
const copy=s=>structuredClone(s);
function mapped(all=false){const s=fresh(1000);s.tech=Object.keys(TECH);s.mapUnlocked=true;for(const k of Object.keys(RESOURCE))s.resources[k]=10000;s.resources.fish=0;if(all)s.exploration.tiles=Array.from({length:81},(_,i)=>i%9+','+Math.floor(i/9));return s;}
function navy(){const s=mapped(true);assert.equal(build(s,'wharf'),null);assert.equal(startShip(s),null);tick(s,SHIP_DURATION);return s;}

test('stronger food needs require two fields while manual harvest keeps the start playable',()=>{
  const s=fresh();near(foodConsumption(s),.3);
  for(let i=0;i<10;i++)assert.equal(harvest(s),null);
  assert.equal(build(s,'farm'),null);tick(s,60);near(s.resources.wheat,0);
  for(let i=0;i<17;i++)assert.equal(harvest(s),null);
  assert.equal(build(s,'farm'),null);tick(s,60);near(s.resources.wheat,6);
});
test('buildings place automatically and coordinates cannot spend resources',()=>{
  const s=mapped();s.earned.wheat=100;const before=copy(s);assert.match(build(s,'farm',4,4),/automatically/);assert.deepEqual(s,before);
  s.earned.wheat=100;const site=freeTile(s,'farm');assert.equal(build(s,'farm'),null);
  assert.deepEqual(s.buildings[0],{...site,type:'farm'});assert.equal(tileKnown(s,site.x,site.y),true);
});
test('initial territory contains 25 tiles and Mapping alone does not reveal more',()=>{
  const s=fresh();assert.equal(s.exploration.tiles.length,25);assert.ok(assignWorkers(s,'explorer',1));
  tick(s,28800);assert.equal(s.exploration.tiles.length,25);
  s.tech.push('map');s.mapUnlocked=true;tick(s,3600);assert.equal(s.exploration.tiles.length,25);
});
test('explorers reveal one adjacent tile at a time and keep fractional progress',()=>{
  const s=mapped();assert.equal(assignWorkers(s,'explorer',2),null);const old=[...s.exploration.tiles];
  tick(s,EXPLORATION_WORK/2-1);assert.equal(s.exploration.tiles.length,25);near(s.exploration.progress,EXPLORATION_WORK-2);
  tick(s,1);assert.equal(s.exploration.tiles.length,26);near(s.exploration.progress,0);
  const [x,y]=s.exploration.tiles.at(-1).split(',').map(Number);assert.ok(old.some(k=>{const[a,b]=k.split(',').map(Number);return Math.abs(x-a)+Math.abs(y-b)===1;}));
  assert.equal(assignWorkers(s,'explorer',0),null);tick(s,600);assert.equal(s.exploration.tiles.length,26);
});
test('exploration pauses, works offline and returns explorers when the map is complete',()=>{
  const s=mapped();assert.equal(assignWorkers(s,'explorer',4),null);s.paused=true;tick(s,600);assert.equal(s.exploration.progress,0);
  s.paused=false;const loaded=restore(serialize(s,1000),1000+EXPLORATION_WORK/4*1000);assert.ok(loaded);assert.equal(loaded.state.exploration.tiles.length,26);
  tick(s,28800);assert.equal(s.exploration.tiles.length,81);assert.equal(assignedWorkers(s,'explorer'),0);assert.equal(workerDemand(s,'explorer'),0);assert.equal(explorationRate(s),0);
});
test('undiscovered terrain cannot be consumed by construction and a failed purchase is atomic',()=>{
  const s=mapped();s.earned.wheat=100;
  while(freeTile(s,'farm'))s.buildings.push({type:'house',...freeTile(s,'farm')});
  const before=copy(s);assert.match(build(s,'farm'),/explored tile/);assert.deepEqual(s,before);
});
test('Fishing and Shipping unlock their own buildings and enforce coast placement',()=>{
  const s=fresh();assert.ok(build(s,'fishery'));assert.ok(build(s,'wharf'));assert.ok(startShip(s));
  const coast=mapped();assert.equal(build(coast,'fishery'),null);assert.equal(build(coast,'wharf'),null);
  const dock=coast.buildings.find(b=>b.type==='fishery'),wharf=coast.buildings.find(b=>b.type==='wharf');
  assert.equal(terrain(dock.x,dock.y),'water');assert.equal(terrain(wharf.x,wharf.y),'grass');assert.ok(restore(serialize(coast,1000),1000));
});
test('docks consume workers, provide food, and preserve wheat by feeding fish first',()=>{
  const s=fresh();s.tech=['housing','masonry','fishing','granaries','stockpiles'];s.resources.wheat=200;s.resources.wood=100;
  assert.equal(build(s,'fishery'),null);assert.equal(assignedWorkers(s,'fishery'),2);near(foodSupply(s),.2);
  const wheat=s.resources.wheat;tick(s,10);near(s.resources.wheat,wheat-1);near(s.resources.fish,0);near(s.earned.fish,2);
  assert.equal(assignWorkers(s,'fishery',0),null);near(foodSupply(s),0);
  s.resources.fish=10;const reserved=s.resources.wheat;tick(s,10);near(s.resources.wheat,reserved);near(s.resources.fish,7);
});
test('ships pay once, require wharf capacity and complete through a timed queue',()=>{
  const s=mapped(true);assert.equal(build(s,'wharf'),null);const before=copy(s.resources);assert.equal(startShip(s),null);
  for(const[k,n]of Object.entries(SHIP_COST))near(s.resources[k],before[k]-n);
  const active=copy(s);assert.ok(startShip(s));assert.deepEqual(s,active);
  tick(s,SHIP_DURATION-1);assert.equal(s.fleet.ships,0);tick(s,1);assert.equal(s.fleet.ships,1);assert.equal(s.fleet.building,null);
  assert.equal(startShip(s),null);tick(s,SHIP_DURATION);assert.equal(s.fleet.ships,2);assert.match(startShip(s),/capacity/);
});
test('ships need assigned missions and sailors, with partial crewing scaling output',()=>{
  const s=navy();assert.equal(s.fleet.missions.fishing,0);assert.equal(workerDemand(s,'sailor'),0);
  assert.equal(assignShips(s,'fishing',1),null);assert.equal(workerDemand(s,'sailor'),2);near(foodSupply(s),0);
  assert.equal(assignWorkers(s,'sailor',1),null);near(foodSupply(s),.1875);
  assert.equal(assignWorkers(s,'sailor',2),null);near(foodSupply(s),.375);
  const before=copy(s);assert.ok(assignShips(s,'exploration',1));assert.deepEqual(s,before);
  assert.equal(assignShips(s,'fishing',0),null);assert.equal(assignedWorkers(s,'sailor'),0);assert.equal(idleWorkers(s),6);
});
test('crewed exploration ships help discover tiles and changing missions never duplicates boats',()=>{
  const s=navy();s.exploration={tiles:initialTiles(),progress:0};
  // The wharf was built inside the starting territory.
  assert.equal(assignShips(s,'exploration',1),null);assert.equal(explorationRate(s),0);
  assert.equal(assignWorkers(s,'sailor',2),null);near(explorationRate(s),2);tick(s,300);assert.equal(s.exploration.tiles.length,26);
  assert.equal(assignShips(s,'exploration',0),null);assert.equal(assignShips(s,'fishing',1),null);assert.equal(s.fleet.ships,1);near(explorationRate(s),0);
});
test('ship timers and assignments survive saves; offline construction buys no additional ships',()=>{
  const s=mapped(true);assert.equal(build(s,'wharf'),null);assert.equal(startShip(s),null);
  s.paused=true;const old=copy(s);tick(s,1000);assert.deepEqual(s,old);
  s.paused=false;const loaded=restore(serialize(s,1000),1000+28800000);assert.ok(loaded);assert.equal(loaded.state.fleet.ships,1);assert.equal(loaded.state.fleet.building,null);
  const n=navy();assignShips(n,'fishing',1);assignWorkers(n,'sailor',2);const saved=restore(serialize(n,1000),1000);assert.ok(saved);assert.equal(saved.state.assignments.sailor,2);
});
test('old maps retain every existing building position during migration',()=>{
  const s=mapped(true);s.earned.wheat=100;for(let n=0;n<12;n++){s.resources.wheat=10000;assert.equal(build(s,'farm'),null);}
  s.version=7;delete s.exploration;delete s.fleet;delete s.resources.fish;delete s.earned.fish;for(const job of ['fishery','explorer','sailor'])delete s.assignments[job];
  const loaded=restore(serialize(s,1000),1000);assert.ok(loaded);assert.equal(loaded.state.version,12);assert.deepEqual(loaded.state.buildings,s.buildings);
  for(const b of s.buildings)assert.ok(tileKnown(loaded.state,b.x,b.y));assert.equal(loaded.state.fleet.ships,0);
});
test('malformed exploration and fleet saves are rejected',()=>{
  const mutations=[s=>s.exploration.tiles.push('9,9'),s=>s.exploration.tiles.push(s.exploration.tiles[0]),s=>s.exploration.progress=EXPLORATION_WORK,s=>s.fleet.ships=1,s=>s.fleet.missions.fishing=1,s=>s.fleet.building={duration:600,remaining:601}];
  for(const mutate of mutations){const s=mapped();mutate(s);assert.equal(restore(serialize(s,1000),1000),null);}
});
test('wheat waiting estimates account for a fish reserve running out',()=>{
  const s=fresh();s.earned.wheat=100;s.resources.wheat=27;assert.equal(build(s,'farm'),null);assert.equal(build(s,'farm'),null);
  s.resources.fish=3;const before=copy(s);near(estimateWait(s,{wheat:8}).seconds,50);assert.deepEqual(s,before);
  tick(s,50);near(s.resources.wheat,8);near(s.resources.fish,0);
});
