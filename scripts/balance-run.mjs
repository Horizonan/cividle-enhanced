import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import {
  fresh, harvest, tick, affordable, freeTile, buildCost, build, research, researchCost,
  researchRequirements, workers, population, workerDemand, assignedWorkers, assignWorkers,
  researchRemaining, WONDER_STAGES, WONDER_NAME, startWonder, stageIndex, STAGES, canReevolve, storageCapacity, foodSufficient, capacity, startShip, SHIP_COST, assignShips, boostWonder, wonderBoostQuote, wonderRemaining, mapTileCount,
} from '../dist/model.js';

export function simulateFirstRun(onMilestone = () => {}, meta = null, options = {}) {
  const s=fresh(1000,meta), timeline=[],waits=[],checkIn=options.checkIn||5;
  const diagnostics={foodBlocked:0,fullSeconds:{},harvests:0,researchSeconds:0,constructionSeconds:0};
  const mark=label=>{const item={label,minutes:Math.round(s.elapsed/6)/10};timeline.push(item);onMilestone(item);};
  const fillJobs=()=>{
    for(const type of ['lumber','quarry','kiln','workshop','academy','library','explorer']) {
      const amount=Math.min(workerDemand(s,type),assignedWorkers(s,type)+population(s)-workers(s));
      if(amount!==assignedWorkers(s,type))assert.equal(assignWorkers(s,type,amount),null);
    }
    if(options.researchers) {
      const amount=Math.min(workerDemand(s,'researcher'),assignedWorkers(s,'researcher')+population(s)-workers(s));
      if(amount!==assignedWorkers(s,'researcher'))assert.equal(assignWorkers(s,'researcher',amount),null);
    }
  };
  const advance=seconds=>{for(let n=0;n<seconds;n+=5){const dt=Math.min(5,seconds-n);if(population(s)<capacity(s)&&!foodSufficient(s))diagnostics.foodBlocked+=dt;if(s.researching)diagnostics.researchSeconds+=dt;if(s.wonder.remaining>0)diagnostics.constructionSeconds+=dt;for(const k of Object.keys(s.resources))if(s.resources[k]>=storageCapacity(s,k)-1e-8)diagnostics.fullSeconds[k]=(diagnostics.fullSeconds[k]||0)+dt;tick(s,dt);if(!options.checkIn)fillJobs();}fillJobs();};
  const wait=(cost,label='materials')=>{
    let seconds=0;
    for(const [k,n]of Object.entries(cost))assert.ok(n<=storageCapacity(s,k),'Storage blocks '+label+': '+k+' '+n+' > '+storageCapacity(s,k));
    const start=s.elapsed;
    while(!affordable(s,cost)&&seconds<14400){advance(checkIn);seconds+=checkIn;}
    if(s.elapsed>start)waits.push({label,seconds:s.elapsed-start,at:s.elapsed});
    assert.ok(affordable(s,cost),'Cannot reach cost '+JSON.stringify(cost));
  };
  const buy=(type,target)=>{while(s.buildings.filter(b=>b.type===type).length<target){wait(buildCost(s,type),'Build '+type+' '+(s.buildings.filter(b=>b.type===type).length+1));let explored=0;while(!freeTile(s,type)&&explored<3600){advance(checkIn);explored+=checkIn;}wait(buildCost(s,type));assert.equal(build(s,type),null,'Build '+type);fillJobs();}};
  const discover=id=>{assert.deepEqual(researchRequirements(s,id),[],'Requirements for '+id);wait(researchCost(id),'Research '+id);assert.equal(research(s,id),null,'Research '+id);while(s.researching)advance(options.checkIn?checkIn:Math.min(5,researchRemaining(s)));mark(id);};
  for(let i=0;i<3;i++){while(!affordable(s,buildCost(s,'farm'))){assert.equal(harvest(s),null);diagnostics.harvests++;if(options.harvestInterval)advance(options.harvestInterval);}buy('farm',i+1);}
  discover('agriculture');discover('granaries');buy('barn',1);buy('farm',6);
  discover('forestry');buy('lumber',2);discover('stockpiles');discover('housing');buy('house',1);
  if(options.researchers)buy('study',1);
  discover('masonry');buy('quarry',2);discover('irrigation');buy('house',3);discover('warehousing');buy('warehouse',1);discover('writing');buy('hall',1);
  discover('scholarship');buy('library',1);discover('archives');discover('map');fillJobs();mark('Mapped settlement');
  if(options.managedForests)discover('sustainableForestry');
  buy('lumber',4);buy('quarry',4);buy('house',5);buy('library',2);
  discover('pottery');buy('kiln',2);discover('trade');discover('engineering');discover('toolmaking');
  buy('workshop',3);buy('lumber',5);buy('quarry',5);
  if(options.shipping){
    discover('fishing');discover('shipping');
    while(!freeTile(s,'wharf')&&s.exploration.tiles.length<mapTileCount(s))advance(checkIn);
    if(!freeTile(s,'wharf')){discover('cartography');fillJobs();}
    buy('wharf',1);wait(SHIP_COST,'Build ship');assert.equal(startShip(s),null);
    while(s.fleet.building)advance(checkIn);
    assert.equal(assignShips(s,'fishing',1),null);
    const crewNeeded=Math.max(0,2-(population(s)-workers(s)));
    if(crewNeeded)assert.equal(assignWorkers(s,'explorer',assignedWorkers(s,'explorer')-crewNeeded),null);
    assert.equal(assignWorkers(s,'sailor',2),null);mark('Fishing fleet');
  }
  discover('organizedStorage');discover('civilEngineering');mark(STAGES[stageIndex(s)].name);
  buy('residence',2);discover('education');buy('academy',2);discover('astronomy');
  while(stageIndex(s)<4){advance(5);}
  mark('City');
  // Expand brick production and its stone supply before funding the wonder.
  buy('quarry',6);buy('kiln',3);
  const beforeWonder=JSON.parse(JSON.stringify(s));
  for(let i=0;i<WONDER_STAGES.length;i++) {
    wait(WONDER_STAGES[i].cost,'Fund '+WONDER_STAGES[i].name);assert.equal(startWonder(s),null);
    if(options.supplies){while(wonderBoostQuote(s)&&affordable(s,wonderBoostQuote(s).cost))assert.equal(boostWonder(s),null);}
    advance(options.checkIn?Math.ceil(wonderRemaining(s)/checkIn)*checkIn:wonderRemaining(s));mark(WONDER_STAGES[i].name);
  }
  assert.ok(canReevolve(s));mark(WONDER_NAME+' complete');
  return { state:s,beforeWonder,timeline,waits,diagnostics };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  const result=simulateFirstRun(item=>console.log(item.label+': '+item.minutes+' min'),null,{researchers:process.argv.includes('--researchers')});
  console.log('First RE-Evolution available after '+(result.state.elapsed/3600).toFixed(2)+' hours.');
}
