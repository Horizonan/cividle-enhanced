import {blankCollections,blankStats,recordCollections,evolutionQuote,hasStar,validEvolution} from './evolution.js';
export {COLLECTIONS,MEMENTOS,CONSTELLATIONS,STARS,hasStar,evolutionQuote,buyStar,acknowledgeEvolution} from './evolution.js';
export const RESOURCE = {
  wheat: { name: 'Wheat' }, wood: { name: 'Wood' }, stone: { name: 'Stone' },
  science: { name: 'Knowledge' }, coin: { name: 'Coins' }, brick: { name: 'Bricks' }, tool: { name: 'Tools' }, fish: { name: 'Fish' },
};
export const BUILDINGS = {
  guildhall: {name:'Guildhall',output:{},cost:{wood:300,stone:200,brick:100,coin:50},workers:0,terrain:['grass']},
  grandArchive: {name:'Grand archive',storage:{science:500},output:{science:1.2},cost:{wood:600,brick:500,tool:80,coin:400},growth:1.5,workers:4,terrain:['grass']},
  farm: { name: 'Wheat field', storage: {wheat:15}, output: { wheat: .2 }, cost: { wheat: 10 }, growth: 1.65, workers: 0, terrain: ['grass'] },
  lumber: { name: 'Logging camp', storage: {wood:25}, output: { wood: .2 }, cost: { wheat: 100 }, growth: 1.35, workers: 2, terrain: ['forest'] },
  quarry: { name: 'Stone quarry', storage: {stone:25}, output: { stone: .15 }, cost: { wheat: 150, wood: 50 }, growth: 1.35, workers: 2, terrain: ['rock'] },
  house: { name: 'Wooden house', housing: 6, output: {}, cost: { wheat: 120, wood: 60 }, growth: 1.4, workers: 0, terrain: ['grass'] },
  stoneHouse: { name: 'Stone house', housing: 9, output: {}, cost: { wood: 100, stone: 150 }, growth: 1.4, workers: 0, terrain: ['grass'] },
  hall: { name: 'Town hall', storage: {science:75}, output: { science: .1 }, cost: { wheat: 400, wood: 200, stone: 100 }, workers: 0, terrain: ['grass'] },
  library: { name: 'Library', storage: {science:50}, output: { science: .2 }, cost: { wood: 150, stone: 80 }, growth: 1.5, workers: 2, terrain: ['grass'] },
  kiln: { name: 'Brickworks', storage: {brick:25}, output: { brick: .1 }, input: { stone: .2 }, cost: { wood: 200, stone: 150 }, growth: 1.35, workers: 2, terrain: ['grass', 'rock'] },
  workshop: { name: 'Workshop', storage: {tool:10}, output: { tool: .025 }, input: { wood: .1, stone: .05 }, cost: { wood: 250, stone: 150, brick: 80 }, growth: 1.35, workers: 2, terrain: ['grass'] },
  residence: { name: 'Townhouse', housing: 12, output: {}, cost: { wood: 350, brick: 200, tool: 35, coin: 100 }, growth: 1.35, workers: 0, terrain: ['grass'] },
  academy: { name: 'Academy', storage: {science:100}, output: { science: .6 }, cost: { wood: 300, brick: 250, tool: 50, coin: 150 }, growth: 1.4, workers: 4, terrain: ['grass'] },
  study: { name: 'Study', output: {}, cost: { wheat: 120, wood: 80 }, growth: 1.5, workers: 0, terrain: ['grass'] },
  fishery: { name: 'Fishing dock', storage: {fish:25}, output: { fish: .2 }, cost: { wheat: 160, wood: 100 }, growth: 1.4, workers: 2, terrain: ['water'], coast: true },
  wharf: { name: 'Wharf', output: {}, cost: { wood: 250, stone: 150, tool: 20 }, growth: 1.5, workers: 0, terrain: ['grass'], coast: true },
  barn: {name:'Barn',storage:{wheat:400},dedicatedStorage:true,output:{},cost:{wheat:20},growth:1.6,workers:0,terrain:['grass']},
  warehouse: {name:'Warehouse',storage:{wheat:500,wood:500,stone:500,brick:500,tool:500,coin:500,fish:500},dedicatedStorage:true,output:{},cost:{wood:150,stone:100},growth:1.6,workers:0,terrain:['grass','rock']},
};
export const TECH = {
  guildCharters:{name:'Guild charters',description:'Unlock a guildhall and choose an economic specialization.',minEvolution:1,minStage:2,cost:{science:300,wood:150},duration:600,requires:['map','pottery']},
  waterpower:{name:'Waterpower',description:'Logging camps and quarries produce 20% more.',minEvolution:1,minStage:3,cost:{science:800,brick:120,tool:60},duration:900,requires:['engineering','guildCharters']},
  renaissance:{name:'Renaissance',description:'Enter a new research era. Develop printing and celestial navigation.',minEvolution:1,minStage:4,buildings:{guildhall:1},cost:{science:2000,tool:150,coin:400},duration:1200,requires:['astronomy','waterpower']},
  printingPress:{name:'Printing press',description:'Unlock grand archives and 8,000 base knowledge storage.',minEvolution:1,cost:{science:2000,brick:350,tool:100},duration:1200,requires:['renaissance']},
  celestialNavigation:{name:'Celestial navigation',description:'Chart the sky and unlock the final Celestial Atlas stage. Requires a completed ship.',minEvolution:1,minStage:4,ships:1,buildings:{grandArchive:1,wharf:1},cost:{science:4000,tool:200,coin:750},duration:1800,requires:['printingPress','shipping']},
  agriculture: { name: 'Cultivation', description: 'All wheat fields produce 40% more.', cost: { wheat: 80 }, duration: 90, requires: [], buildings: { farm: 2 } },
  granaries: { name: 'Barns', description: 'Unlock barns. Each stores 400 wheat.', cost: { wheat: 80 }, duration: 120, requires: ['agriculture'] },
  forestry: { name: 'Woodcutting', description: 'Unlock logging camps.', cost: { wheat: 150 }, duration: 150, requires: ['agriculture', 'granaries'] },
  stockpiles: { name: 'Stockpiles', description: 'Add 200 storage for wood, stone, bricks, tools, fish and coins.', cost: { wheat: 180, wood: 60 }, duration: 180, requires: ['forestry'], buildings: { lumber: 1 } },
  housing: { name: 'Shelter', description: 'Unlock wooden houses and studies. Houses add space for 6 residents; studies provide researcher jobs.', cost: { wheat: 180, wood: 60 }, duration: 180, requires: ['forestry'], buildings: { lumber: 1 } },
  masonry: { name: 'Stone tools', description: 'Unlock stone quarries.', cost: { wheat: 180, wood: 80 }, duration: 240, requires: ['forestry'], buildings: { lumber: 1 } },
  stoneConstruction: { name: 'Stone construction', description: 'Unlock stone houses with space for 9 residents each.', cost: { wood: 180, stone: 120 }, duration: 360, requires: ['housing', 'masonry', 'stockpiles'], buildings: { quarry: 1 } },
  irrigation: { name: 'Irrigation', description: 'All wheat fields produce 50% more.', cost: { wood: 100, stone: 60 }, duration: 300, requires: ['agriculture', 'masonry'], buildings: { quarry: 1 } },
  warehousing: { name: 'Warehouses', description: 'Unlock warehouses: 150 wood and 100 stone for 500 capacity per good. Knowledge is separate.', cost: { wheat: 350, wood: 200, stone: 150 }, duration: 300, requires: ['stockpiles', 'housing', 'masonry'] },
  writing: { name: 'Writing', description: 'Unlock the town hall and knowledge production.', cost: { wheat: 300, wood: 160, stone: 100 }, duration: 360, requires: ['housing', 'masonry', 'stockpiles'], buildings: { house: 2, quarry: 1 } },
  archives: { name: 'Archives', description: 'Increase base knowledge storage to 500, plus space from knowledge buildings.', cost: { science: 80, wood: 200, stone: 100 }, duration: 240, requires: ['writing'], buildings: { hall: 1 } },
  scholarship: { name: 'Record keeping', description: 'Unlock libraries for knowledge production.', cost: { science: 60, wood: 120 }, duration: 480, requires: ['writing'], buildings: { hall: 1 } },
  map: { name: 'Mapping', description: 'Reveal the settlement map and unlock explorer jobs to discover more tiles.', cost: { science: 180, wood: 300, wheat: 600 }, duration: 900, requires: ['scholarship', 'warehousing', 'archives'], buildings: { farm: 6, house: 3, hall: 1, library: 1 } },
  organizedStorage: { name: 'Organized storage', description: 'Triple barn and warehouse capacity and base construction costs. New warehouses also need 60 bricks before repeat-building increases. Base knowledge storage becomes 4,000.', cost: { science: 250, brick: 100 }, duration: 600, requires: ['warehousing', 'archives', 'scholarship', 'pottery'] },
  pottery: { name: 'Brick making', description: 'Unlock brickworks.', cost: { science: 80, wood: 100 }, duration: 480, requires: ['writing', 'masonry'], buildings: { hall: 1 } },
  sustainableForestry: { name: 'Managed forests', description: 'All logging camps produce 40% more.', cost: { science: 120, stone: 120 }, duration: 600, requires: ['writing', 'forestry'], buildings: { hall: 1 } },
  trade: { name: 'Currency', description: 'Unlock coins. Each resident generates 0.01 coins per second.', cost: { science: 100 }, duration: 600, requires: ['map', 'writing'], buildings: { hall: 1 } },
  markets: { name: 'Markets', description: 'Unlock the market to buy and sell resources with coins.', cost: { science: 150, wood: 150, coin: 25 }, duration: 480, requires: ['trade'], buildings: { hall: 1 } },
  engineering: { name: 'Engineering', description: 'All production increases by 25%.', cost: { science: 300, brick: 100 }, duration: 1200, requires: ['pottery', 'scholarship'], buildings: { library: 1, kiln: 1 } },
  toolmaking: { name: 'Toolmaking', description: 'Unlock workshops. Turn wood and stone into tools.', cost: { wood: 300, stone: 200, science: 200 }, duration: 900, requires: ['map', 'pottery'], minStage: 2 },
  civilEngineering: { name: 'Civil engineering', description: 'Establish a town and unlock townhouses when Town requirements are met.', cost: { science: 500, brick: 200, tool: 40 }, duration: 1200, requires: ['toolmaking', 'engineering'], minStage: 2, buildings: { workshop: 2 } },
  education: { name: 'Education', description: 'Unlock academies for advanced knowledge production.', cost: { science: 700, tool: 40, coin: 200 }, duration: 1200, requires: ['civilEngineering', 'organizedStorage'], minStage: 3 },
  astronomy: { name: 'Astronomy', description: 'Develop a city and unlock the Great Observatory when City requirements are met.', cost: { science: 1500, tool: 80, coin: 300 }, duration: 1800, requires: ['education'], minStage: 3, buildings: { academy: 2 } },
  fishing: { name: 'Fishing', description: 'Unlock fishing docks. Fish feeds residents before wheat is used.', cost: { wheat: 160, wood: 100 }, duration: 300, requires: ['housing','masonry'] },
  shipping: { name: 'Shipping', description: 'Unlock coastal wharves and ships for fishing or exploration.', cost: { science: 300, wood: 300, tool: 20 }, duration: 900, requires: ['fishing','map','toolmaking','trade'] },
  cartography: { name: 'Frontier surveying', description: 'Expand the map by four rows and columns. Repeat after fully exploring each region.', cost: { science:300,wood:500,coin:100 }, duration:1200, requires:['map','scholarship','trade'], minStage:2, repeatable:true },
};
export const STAGES = [
  { id: 'camp', name: 'Camp', population: 6, buildings: {}, tech: [], unlock: 'Establish farming and a settlement.' },
  { id: 'hamlet', name: 'Hamlet', population: 12, buildings: { house: 1, lumber: 1 }, tech: ['housing'], unlock: 'Choose a priority job for new residents.' },
  { id: 'village', name: 'Village', population: 24, buildings: { hall: 1, quarry: 1 }, tech: ['writing'], unlock: 'Toolmaking and workshop industry become available after Mapping.' },
  { id: 'town', name: 'Town', population: 36, buildings: { workshop: 2, library: 2 }, tech: ['civilEngineering'], unlock: 'Townhouses and academy research.' },
  { id: 'city', name: 'City', population: 60, buildings: { residence: 2, academy: 2 }, tech: ['astronomy'], unlock: 'Build the Great Observatory and prepare for RE-Evolution.' },
];
export const WONDER_NAME = 'Great Observatory';
export const WONDER_STAGES = [
  { name: 'Foundations', cost: { stone: 1200, brick: 600, tool: 80, coin: 250 }, duration: 1800 },
  { name: 'Observation tower', cost: { wood: 1800, brick: 900, tool: 150, coin: 400 }, duration: 2400 },
  { name: 'Instruments', cost: { tool: 250, science: 1500, coin: 700 }, duration: 2400 },
  { name: 'First observation', cost: { science: 3000, tool: 120, coin: 1000 }, duration: 1800 },
];
export const ATLAS_STAGES=[
 {name:'Star catalogue',cost:{stone:2500,science:4000,tool:250,coin:1000},duration:1800},
 {name:'Celestial Atlas',cost:{wood:3000,science:6000,tool:350,coin:2000},duration:2400},
];
export const wonderProjects=s=>s.meta.revolutions>0?[...WONDER_STAGES,...ATLAS_STAGES]:WONDER_STAGES;
export const GUILDS={agrarian:{name:'Agrarian guild',description:'+25% food; −10% brick and tool production.'},industry:{name:'Artisans’ guild',description:'+35% brick and tool production; −10% food.'},scholars:{name:'Scholars’ guild',description:'+25% research speed; −10% wood and stone production.'}};
export function setGuild(s,id){
 if(s.paused)return 'Resume the game to change guilds.';
 if(!s.meta.revolutions||!s.tech.includes('guildCharters')||!count(s,'guildhall'))return 'Research Guild charters and build a guildhall first.';
 if(id!==null&&!Object.hasOwn(GUILDS,id))return 'Unknown guild.';
 s.guildFocus=id;return null;
}
export const MAX_WONDER_BOOSTS=4;
export const wonderSpeed=s=>1+.25*(s.wonder.boosts||0);
export const wonderRemaining=s=>s.wonder.remaining/wonderSpeed(s);
export const LEGACY_UPGRADES = {
  production: { name: 'Production methods', description: '+15% production per level.' },
  storage: { name: 'Storage traditions', description: '+25% storage per level.' },
  knowledge: { name: 'Recorded experience', description: 'Research and wonder construction are 10% faster per level. Applies to new projects.' },
};
export const ACHIEVEMENTS = [
  {id:'firstField',name:'First harvest',description:'Build your first wheat field.',target:1,value:s=>count(s,'farm'),past:true},
  {id:'hamlet',name:'Putting down roots',description:'Grow to 12 residents.',target:12,value:s=>population(s),past:true},
  {id:'village',name:'A growing community',description:'Grow to 24 residents.',target:24,value:s=>population(s),past:true},
  {id:'explorer',name:'Beyond the horizon',description:'Discover 49 map tiles after Mapping.',target:49,value:s=>s.mapUnlocked?s.exploration.tiles.length:0},
  {id:'tools',name:'Tools of progress',description:'Produce or acquire 100 tools in one civilization.',target:100,value:s=>s.earned.tool,past:true},
  {id:'voyage',name:'Maiden voyage',description:'Complete your first ship.',target:1,value:s=>s.fleet.ships},
  {id:'city',name:'City builder',description:'Reach City stage.',target:1,value:s=>stageIndex(s)>=4?1:0,past:true},
  {id:'foundations',name:'Built to last',description:'Complete the Observatory foundations.',target:1,value:s=>Math.min(1,s.wonder.stage),past:true},
  {id:'observatory',name:'Eyes on the sky',description:'Complete the Great Observatory.',target:4,value:s=>s.wonder.stage,past:true},
  {id:'reevolution',name:'A new beginning',description:'Begin your first RE-Evolution.',target:1,value:s=>s.meta.revolutions},
];
export function achievementProgress(s,id){
  const achievement=ACHIEVEMENTS.find(a=>a.id===id);
  if(!achievement)return null;
  const earned=s.meta.achievements.includes(id),current=earned||achievement.past&&s.meta.revolutions>0?achievement.target:Math.min(achievement.target,achievement.value(s));
  return {current,target:achievement.target,earned};
}
export function recordAchievements(s){
  recordCollections(s);
  for(const a of ACHIEVEMENTS)if(!s.meta.achievements.includes(a.id)&&achievementProgress(s,a.id).current>=a.target)s.meta.achievements.push(a.id);
}
const freshMeta = () => ({ insight: 0, revolutions: 0, upgrades: { production: 0, storage: 0, knowledge: 0 }, history: [], achievements: [], stars:[], collections:blankCollections(), pendingEvolution:null });
const legacyLevel = (s,key) => s.meta?.upgrades?.[key] || 0;
export const MAX_MAP_SIZE = 41;
export const mapSize=s=>s.exploration?.size??9;
export const mapTileCount=s=>mapSize(s)**2;
export const frontierLevel=s=>(mapSize(s)-9)/4;
const researchBaseDuration=(s,id)=>TECH[id].duration*(TECH[id].repeatable?1.25**frontierLevel(s):1);
export const researchDuration = (s,id) => researchBaseDuration(s,id) * (hasStar(s,'thought')?.85:1) / (1 + .1 * legacyLevel(s,'knowledge'));
export const wonderDuration = (s,index) => wonderProjects(s)[index].duration * (hasStar(s,'vision')?.85:1) / (1 + .1 * legacyLevel(s,'knowledge'));
export const STORAGE_LIMIT = 10000;
export const POPULATION_INTERVAL = 60;
export const COINS_PER_PERSON = .01;
export const WHEAT_PER_PERSON = .05;
export const EXPLORATION_WORK = 600;
export const SHIP_COST = {wood:200,tool:20,coin:50};
export const SHIP_DURATION = 600;
export const MARKET_PRICES = { wheat: { buy: 1, sell: .3 }, wood: { buy: 2, sell: .5 }, stone: { buy: 3, sell: .75 }, brick: { buy: 5, sell: 2 }, tool: { buy: 8, sell: 3 }, fish:{buy:1,sell:.3} };
export const JOB_TYPES = [...Object.keys(BUILDINGS).filter(type => BUILDINGS[type].workers > 0),'researcher','explorer','sailor'];
export const jobName = type => ({researcher:'Researchers',explorer:'Explorers',sailor:'Sailors'})[type] || BUILDINGS[type].name;
export const researchSpeed = s => (1 + .05 * assignedWorkers(s,'researcher'))*(s.guildFocus==='scholars'?1.25:1);
export const researchRemaining = s => s.researching ? s.researching.remaining / researchSpeed(s) : 0;
const STORAGE_TECH = ['granaries', 'stockpiles', 'warehousing', 'archives', 'organizedStorage'];
export function buildingStorage(s,type){
  const d=BUILDINGS[type],bonus=(d?.dedicatedStorage&&s.tech.includes('organizedStorage')?3:1)*(1+.25*legacyLevel(s,'storage'))*(hasStar(s,'granary')?1.25:1);
  return Object.fromEntries(Object.entries(d?.storage||{}).map(([k,n])=>[k,n*bonus]));
}
export function storageCapacity(s, resource) {
  let base=resource==='wheat'?50:25;
  if(resource==='science')base=s.tech.includes('printingPress')?8000:s.tech.includes('organizedStorage')?4000:s.tech.includes('archives')?500:25;
  else if(resource!=='wheat'&&s.tech.includes('stockpiles'))base+=200;
  const buildings=s.buildings.reduce((n,b)=>n+(BUILDINGS[b.type].storage?.[resource]||0)*(BUILDINGS[b.type].dedicatedStorage&&s.tech.includes('organizedStorage')?3:1),0);
  return Math.floor((base+buildings)*(1+.25*legacyLevel(s,'storage'))*(hasStar(s,'granary')?1.25:1));
}
export function terrain(x, y) {
  if(x>=9||y>=9){if((x+2*y)%17<3)return 'water';if((x*11+y*7)%13<3)return 'rock';if((x*3+y*5)%7<2)return 'forest';return 'grass';}
  if ((x < 2 && y > 3) || (x === 2 && y > 5) || (x === 3 && y > 6) || (x === 0 && y === 3)) return 'water';
  if ((x + y * 3) % 11 === 0 || (x > 6 && y < 3) || (x === 4 && y === 1)) return 'rock';
  if ((x * 3 + y * 5) % 7 < 2 || (x < 3 && y < 3) || (x > 6 && y > 5)) return 'forest';
  return 'grass';
}
const tileKey=(x,y)=>x+','+y;
const neighbours=(x,y,size=9)=>[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([a,b])=>a>=0&&a<size&&b>=0&&b<size);
export const initialTiles=()=>Array.from({length:25},(_,i)=>tileKey(2+i%5,2+Math.floor(i/5)));
export const tileKnown=(s,x,y)=>s.exploration.tiles.includes(tileKey(x,y));
export function suitableTile(s,type,x,y){
  const def=BUILDINGS[type];
  return !!def && tileKnown(s,x,y) && def.terrain.includes(terrain(x,y)) && !s.buildings.some(b=>b.x===x&&b.y===y) &&
    (!def.coast || neighbours(x,y,mapSize(s)).some(([a,b])=>tileKnown(s,a,b)&&(type==='fishery'?terrain(a,b)!=='water':terrain(a,b)==='water')));
}
export const shipCapacity=s=>count(s,'wharf')*2;
export const shipCrewing=s=>staffing(s,'sailor');
export const explorationRate=s=>s.mapUnlocked && s.exploration.tiles.length<mapTileCount(s) ? (assignedWorkers(s,'explorer')+s.fleet.missions.exploration*2*shipCrewing(s))*(hasStar(s,'trail')?1.25:1) : 0;
function revealTile(s){
  const frontier=new Set();
  for(const key of s.exploration.tiles){const [x,y]=key.split(',').map(Number);for(const [a,b]of neighbours(x,y,mapSize(s)))if(!tileKnown(s,a,b))frontier.add(tileKey(a,b));}
  const next=[...frontier].sort((a,b)=>{const [ax,ay]=a.split(',').map(Number),[bx,by]=b.split(',').map(Number);return Math.abs(ax-4)+Math.abs(ay-4)-Math.abs(bx-4)-Math.abs(by-4)||ay-by||ax-bx;})[0];
  if(next)s.exploration.tiles.push(next);
}
export function startShip(s){
  if(s.paused)return 'Resume the game to build a ship.';
  if(!s.tech.includes('shipping')||!count(s,'wharf'))return 'Research Shipping and build a wharf first.';
  if(s.fleet.building)return 'A ship is already under construction.';
  if(s.fleet.ships>=shipCapacity(s))return 'Build another wharf for more ship capacity.';
  if(!spend(s,SHIP_COST))return 'Not enough resources for a ship.';
  s.fleet.building={remaining:SHIP_DURATION,duration:SHIP_DURATION};return null;
}
export function assignShips(s,mission,amount){
  if(s.paused)return 'Resume the game to assign ships.';
  if(!['fishing','exploration'].includes(mission)||!Number.isInteger(amount)||amount<0||amount+s.fleet.missions[mission==='fishing'?'exploration':'fishing']>s.fleet.ships)return 'Invalid ship assignment.';
  if(mission==='exploration'&&amount>0&&s.exploration.tiles.length===mapTileCount(s))return 'All map tiles have already been discovered.';
  s.fleet.missions[mission]=amount;s.assignments.sailor=Math.min(assignedWorkers(s,'sailor'),workerDemand(s,'sailor'));if(!workerDemand(s,'sailor')&&s.autoJob==='sailor')s.autoJob=null;return null;
}
const emptyResources = () => Object.fromEntries(Object.keys(RESOURCE).map(k => [k, 0]));
export function fresh(now = Date.now(), meta = null) {
  return { version: 13, runStats:blankStats(), guildFocus:null, exploration:{size:9,tiles:initialTiles(),progress:0}, fleet:{ships:0,missions:{fishing:0,exploration:0},building:null}, meta: meta ? {...freshMeta(),...JSON.parse(JSON.stringify(meta))} : freshMeta(), wonder: { stage: 0, remaining: 0, duration: 0, boosts:0 }, autoJob: null, population: 6, growthProgress: 0, resources: emptyResources(), earned: emptyResources(), buildings: [], tech: [], assignments: Object.fromEntries(JOB_TYPES.map(type => [type,0])),
    researching: null, mapUnlocked: false, paused: false, lastSaved: now, elapsed: 0, name: 'Settlement' };
}
export const count = (s, type) => s.buildings.filter(b => b.type === type).length;
export const isHome=type=>!!BUILDINGS[type]?.housing;
const requirementCount=(s,type)=>type==='house'?Math.floor((capacity(s)-6)/6):count(s,type);
export const constructionUnlocked = s => s.earned.wheat >= 10;
export const capacity = s => 6 + s.buildings.reduce((total,b)=>total+(BUILDINGS[b.type]?.housing||0),0);
export const population = s => s.population;
export const foodConsumption = s => population(s)*WHEAT_PER_PERSON*(hasStar(s,'hearth')?.9:1);
export const wheatSupply = s => s.buildings.reduce((n,b)=>n+(BUILDINGS[b.type].output.wheat||0)*multiplier(s,b)*staffing(s,b.type),0);
export const fishSupply=s=>s.buildings.reduce((n,b)=>n+(BUILDINGS[b.type].output.fish||0)*multiplier(s,b)*staffing(s,b.type),0)+s.fleet.missions.fishing*.3*shipCrewing(s)*multiplier(s,{type:'ship'});
export const foodSupply=s=>wheatSupply(s)+fishSupply(s);
export const foodSufficient = s => s.resources.wheat+s.resources.fish>1e-9 || foodSupply(s)+1e-9>=foodConsumption(s);
export function stageRequirements(s,index) {
  const stage = STAGES[index];
  if (!stage) return [];
  return [
    ...(population(s) < stage.population ? [stage.population + ' residents (' + population(s) + '/' + stage.population + ')'] : []),
    ...Object.entries(stage.buildings).filter(([type,n]) => requirementCount(s,type) < n).map(([type,n]) => n + ' ' + BUILDINGS[type].name.toLowerCase() + (n > 1 ? 's' : '') + ' (' + requirementCount(s,type) + '/' + n + ')'),
    ...stage.tech.filter(id => !s.tech.includes(id)).map(id => TECH[id].name),
  ];
}
export function stageIndex(s) { let index = 0; for (let i=1;i<STAGES.length;i++) { if (stageRequirements(s,i).length) break; index=i; } return index; }
// Guidance is derived from the real requirements; it never awards progress.
export function nextMilestone(s){
  const row=(label,current,target,kind,id)=>({label,current:Math.min(current,target),target,done:current>=target,kind,id});
  const buildingRow=(type,n)=>row(type==='house'?'Housing (six-space equivalents)':BUILDINGS[type].name,requirementCount(s,type),n,'building',type);
  const techRow=id=>row(TECH[id].name,s.tech.includes(id)?1:0,1,'research',id);
  let title,description,requirements;
  const current=stageIndex(s);
  if(!count(s,'farm')){title='First wheat field';description='Establish your first source of food.';requirements=[buildingRow('farm',1)];}
  else if(current===2&&!s.mapUnlocked){title='Mapping';description=TECH.map.description;requirements=[...TECH.map.requires.map(techRow),...Object.entries(TECH.map.buildings).map(([t,n])=>buildingRow(t,n)),techRow('map')];}
  else if(current<4){const stage=STAGES[current+1];title=stage.name;description=stage.unlock;requirements=[row('Residents',population(s),stage.population,'population'),...Object.entries(stage.buildings).map(([t,n])=>buildingRow(t,n)),...stage.tech.map(techRow)];}
  else if(canReevolve(s))return {title:'RE-Evolution ready',description:'The first observation is complete. Review your rewards when you are ready.',requirements:[],action:{page:'legacy',label:'Review RE-Evolution'}};
  else{
    const project=wonderProjects(s)[s.wonder.stage];title=WONDER_NAME+' · '+project.name;description=s.wonder.remaining>0?'Construction in progress. Extra supplies can increase its speed.':'Fund the next construction stage.';
    requirements=[buildingRow('workshop',3),...(s.wonder.stage>=4?[techRow('printingPress'),buildingRow('guildhall',1),buildingRow('grandArchive',1),row('Residents',population(s),84,'population'),...(s.wonder.stage>=5?[techRow('celestialNavigation')]:[])]:[]),...Object.entries(project.cost).map(([k,n])=>row(RESOURCE[k].name,s.wonder.remaining>0?n:s.resources[k],n,'resource',k))];
    return {title,description,requirements,action:{page:'progress',label:'View Observatory'}};
  }
  const unlocks={lumber:'forestry',quarry:'masonry',house:'housing',hall:'writing',library:'scholarship',workshop:'toolmaking',residence:'civilEngineering',academy:'education',kiln:'pottery'};
  const actionForTech=(id,visited=new Set())=>{
    if(visited.has(id))return {page:'progress',label:'View settlement progress'};
    visited.add(id);const t=TECH[id];if(!t)return {page:'settlement',label:'View buildings'};
    const prerequisite=t.requires.find(k=>!s.tech.includes(k));if(prerequisite)return actionForTech(prerequisite,visited);
    const building=Object.entries(t.buildings||{}).find(([type,n])=>requirementCount(s,type)<n);
    if(building){const type=building[0];if(!buildingUnlocked(s,type)&&unlocks[type])return actionForTech(unlocks[type],visited);return {page:'settlement',build:type,label:'Build '+BUILDINGS[type].name.toLowerCase()};}
    const blocked=Object.entries(researchCost(id,s)).find(([k,n])=>n>storageCapacity(s,k));
    if(blocked){const resource=blocked[0];if(resource==='wheat')return s.tech.includes('granaries')?{page:'settlement',build:'barn',label:'Build a barn for wheat storage'}:actionForTech('granaries',visited);if(resource==='science')return !s.tech.includes('archives')?actionForTech('archives',visited):{page:'settlement',build:'library',label:'Add knowledge storage'};if(!s.tech.includes('stockpiles'))return actionForTech('stockpiles',visited);return s.tech.includes('warehousing')?{page:'settlement',build:'warehouse',label:'Build a warehouse for more storage'}:actionForTech('warehousing',visited);}
    return {page:'research',research:id,label:(s.researching?.id===id?'Continue ':'Research ')+t.name};
  };
  const missingTech=requirements.find(r=>r.kind==='research'&&!r.done);
  let action=missingTech?actionForTech(missingTech.id):null;
  const building=requirements.find(r=>r.kind==='building'&&!r.done);
  if(!action&&building)action=building.id==='farm'||buildingUnlocked(s,building.id)?{page:'settlement',build:building.id,label:'Build '+BUILDINGS[building.id].name.toLowerCase()}:actionForTech(unlocks[building.id]);
  if(foodSupply(s)+1e-9<foodConsumption(s)&&!s.paused)action=buildCost(s,'farm').wheat<=storageCapacity(s,'wheat')?{page:'settlement',build:'farm',label:'Increase food production'}:s.tech.includes('granaries')?{page:'settlement',build:'barn',label:'Add wheat storage for another field'}:action;
  if(!action)action=foodSupply(s)<foodConsumption(s)?{page:'settlement',build:'farm',label:'Increase food production'}:capacity(s)<(STAGES[current+1]?.population||0)?{page:'settlement',build:'house',label:'Add housing space'}:{page:'workers',label:'Wait for residents · view workers'};
  return {title,description,requirements,action};
}

export function progressSnapshot(s){
  return {resources:{...s.resources},population:population(s),tech:[...s.tech],stage:stageIndex(s),wonder:s.wonder.stage,ships:s.fleet.ships,tiles:s.exploration.tiles.length,size:mapSize(s),elapsed:s.elapsed,achievements:[...s.meta.achievements],paused:s.paused};
}
export function advanceAway(s,seconds){
  const before=progressSnapshot(s),requested=Number.isFinite(seconds)?Math.max(0,seconds):0,audit={full:new Set(),hunger:0};
  tick(s,requested,audit);
  return {seconds:Math.min(28800,requested),capped:requested>28800,paused:before.paused,simulated:s.elapsed-before.elapsed,
    resources:Object.fromEntries(Object.keys(RESOURCE).map(k=>[k,s.resources[k]-before.resources[k]])),
    residents:population(s)-before.population,research:s.tech.filter(id=>!before.tech.includes(id)),survey:mapSize(s)>before.size,
    stages:STAGES.slice(before.stage+1,stageIndex(s)+1).map(x=>x.name),wonder:wonderProjects(s).slice(before.wonder,s.wonder.stage).map(x=>x.name),
    ships:s.fleet.ships-before.ships,tiles:s.exploration.tiles.length-before.tiles,full:[...audit.full],hunger:audit.hunger,
    achievements:s.meta.achievements.filter(id=>!before.achievements.includes(id))};
}
export function setArrivalJob(s,type) {
  if (s.paused) return 'Resume the game to change arrival priorities.';
  if (stageIndex(s) < 1 || type !== null && (!JOB_TYPES.includes(type) || !workerDemand(s,type))) return 'This job priority is not available.';
  s.autoJob = type; return null;
}
export const nextArrival = s => population(s) < capacity(s) ? POPULATION_INTERVAL - s.growthProgress : null;
export const workerDemand = (s, type) => type==='researcher' ? count(s,'study')*2+count(s,'academy')*4 : type==='explorer' ? (s.tech.includes('map')&&s.exploration?.tiles.length<mapTileCount(s)?4:0) : type==='sailor' ? ((s.fleet?.missions.fishing||0)+(s.fleet?.missions.exploration||0))*2 : count(s,type) * (BUILDINGS[type]?.workers || 0);
export const assignedWorkers = (s, type) => s.assignments?.[type] || 0;
export const workers = s => JOB_TYPES.reduce((n, type) => n + assignedWorkers(s,type), 0);
export const idleWorkers = s => Math.max(0,population(s) - workers(s));
export const workersUnlocked = s => s.tech.includes('forestry');
export const staffing = (s, type) => ['researcher','explorer','sailor'].includes(type) || BUILDINGS[type]?.workers ? Math.min(1,assignedWorkers(s,type) / (workerDemand(s,type) || 1)) : 1;
export function assignWorkers(s, type, amount) {
  if (s.paused) return 'Resume the game to assign workers.';
  if (!JOB_TYPES.includes(type) || !Number.isInteger(amount) || amount < 0 || amount > workerDemand(s,type)) return 'Invalid worker assignment.';
  if (workers(s) - assignedWorkers(s,type) + amount > population(s)) return 'Release workers from another job first, or wait for new residents.';
  s.assignments[type] = amount;
  return null;
}
export function buildingUnlocked(s, type) {
  const unlocks = { guildhall:'guildCharters',grandArchive:'printingPress',lumber: 'forestry', quarry: 'masonry', house: 'housing', stoneHouse: 'stoneConstruction', study: 'housing', hall: 'writing', library: 'scholarship', kiln: 'pottery', workshop: 'toolmaking', residence: 'civilEngineering', academy: 'education', fishery:'fishing',wharf:'shipping',barn:'granaries',warehouse:'warehousing' };
  if (['guildhall','grandArchive'].includes(type)&&!s.meta.revolutions)return false;
  if (type === 'farm') return constructionUnlocked(s);
  if (['residence','academy'].includes(type) && stageIndex(s)<3) return false;
  return Object.hasOwn(unlocks, type) && s.tech.includes(unlocks[type]);
}
export const availableBuildings = s => Object.keys(BUILDINGS).filter(type => buildingUnlocked(s, type));
export const researchUnlocked = s => count(s, 'farm') > 0;
export const coinsUnlocked = s => s.tech.includes('trade');
export const tradeUnlocked = s => coinsUnlocked(s) && s.tech.includes('markets');
export const researchCost = (id,s=null) => Object.fromEntries(Object.entries(TECH[id].cost).map(([k,n])=>[k,Math.ceil(n*(TECH[id].repeatable&&s?1.5**frontierLevel(s):1))]));
export function researchRequirements(s, id) {
  const t = TECH[id];
  if (!t) return ['Unknown research'];
  return [
    ...(t.minEvolution&&s.meta.revolutions<t.minEvolution?['Complete RE-Evolution '+t.minEvolution]:[]),
    ...(t.ships&&s.fleet.ships<t.ships?['Complete a ship']:[]),
    ...(id==='cartography'&&s.exploration.tiles.length<mapTileCount(s)?['Explore all '+mapTileCount(s)+' tiles ('+s.exploration.tiles.length+'/'+mapTileCount(s)+')']:[]),
    ...(id==='cartography'&&mapSize(s)>=MAX_MAP_SIZE?['Frontier surveying complete']:[]),
    ...(t.minStage && stageIndex(s) < t.minStage ? [STAGES[t.minStage].name + ' stage'] : []),
    ...t.requires.filter(k => !s.tech.includes(k)).map(k => TECH[k].name),
    ...Object.entries(t.buildings || {}).filter(([type,n]) => requirementCount(s,type) < n)
      .map(([type,n]) => n + ' ' + (type === 'farm' ? 'wheat fields' : type === 'house' ? 'houses' : BUILDINGS[type].name.toLowerCase() + (n > 1 ? 's' : '')) + ' (' + requirementCount(s,type) + '/' + n + ')'),
  ];
}
export const mapAvailable = s => researchRequirements(s,'map').length === 0;
export const visibleTechnologies = s => researchUnlocked(s) ? Object.keys(TECH).filter(id =>
  (!TECH[id].minEvolution||s.meta.revolutions>=TECH[id].minEvolution)&&(s.tech.includes(id) || s.researching?.id === id || TECH[id].requires.every(k => s.tech.includes(k)))
) : [];
export const visibleResources = s => Object.keys(RESOURCE).filter(k => k === 'wheat' || k === 'coin' && coinsUnlocked(s) || s.resources[k] > 0 || s.earned[k] > 0 || s.buildings.some(b => BUILDINGS[b.type].output[k]));
export function multiplier(s, b) {
  let n = (s.tech.includes('engineering') ? 1.25 : 1) * (1 + .15 * legacyLevel(s,'production'));
  if (b.type === 'farm' && s.tech.includes('agriculture')) n *= 1.4;
  if (b.type === 'farm' && s.tech.includes('irrigation')) n *= 1.5;
  if (b.type === 'lumber' && s.tech.includes('sustainableForestry')) n *= 1.4;
  const food=['farm','fishery','ship'].includes(b.type),raw=['lumber','quarry'].includes(b.type),industry=['kiln','workshop'].includes(b.type),knowledge=['hall','library','academy','grandArchive'].includes(b.type);
  if(hasStar(s,'engine'))n*=1.1;
  if(food&&hasStar(s,'seed'))n*=1.2;
  if(raw&&hasStar(s,'chisel'))n*=1.15;
  if(industry&&hasStar(s,'forge'))n*=1.2;
  if(knowledge&&hasStar(s,'archive'))n*=1.25;
  if(b.type==='ship'&&hasStar(s,'tide'))n*=1.3;
  if(raw&&s.tech.includes('waterpower'))n*=1.2;
  if(s.guildFocus==='agrarian')n*=food?1.25:industry?.9:1;
  if(s.guildFocus==='industry')n*=industry?1.35:food?.9:1;
  if(s.guildFocus==='scholars'&&raw)n*=.9;
  return n;
}
function production(s, dt = 1, audit = null) {
  const net = emptyResources(), gross = emptyResources(), remaining = { ...s.resources };
  const fishEaten=Math.min(foodConsumption(s),s.resources.fish/dt+fishSupply(s));
  net.fish=-fishEaten;net.wheat=-(foodConsumption(s)-fishEaten);
  for (const b of s.buildings) {
    const def = BUILDINGS[b.type], m = multiplier(s, b) * staffing(s,b.type);
    if (!m) continue;
    let fraction = 1;
    for (const [k,n] of Object.entries(def.input || {})) fraction = Math.min(fraction,Math.max(0,remaining[k]) / (n*m*dt));
    for (const [k,n] of Object.entries(def.output)){const space=Math.max(0,storageCapacity(s,k)-s.resources[k]-net[k]*dt)/(n*m*dt);if(audit&&space<fraction-1e-9)audit.full.add(k);fraction=Math.min(fraction,space);}
    if (fraction <= 1e-12) continue;
    for (const [k, n] of Object.entries(def.input || {})) { remaining[k] -= n * m * fraction * dt; net[k] -= n * m * fraction; }
    for (const [k, n] of Object.entries(def.output)) { net[k] += n * m * fraction; gross[k] += n * m * fraction; }
  }
  const boatOutput=Math.min(s.fleet.missions.fishing*.3*shipCrewing(s)*multiplier(s,{type:'ship'}),Math.max(0,(storageCapacity(s,'fish')-s.resources.fish)/dt-net.fish));
  net.fish+=boatOutput;gross.fish+=boatOutput;
  if (coinsUnlocked(s)) {
    const amount = Math.max(0,Math.min(population(s) * COINS_PER_PERSON*(hasStar(s,'exchange')?1.2:1),(storageCapacity(s,'coin') - s.resources.coin) / dt));
    net.coin += amount; gross.coin += amount;
  }
  net.wheat=Math.max(-s.resources.wheat/dt,net.wheat);
  net.fish=Math.max(-s.resources.fish/dt,net.fish);
  return { net, gross };
}
export function rates(s) { return s.paused ? emptyResources() : production(s).net; }
function finishResearch(s) {
  const id = s.researching.id;
  if(id==='cartography'){s.exploration.size+=4;s.exploration.progress=0;}
  else if (!s.tech.includes(id)) s.tech.push(id);
  if (id === 'map') s.mapUnlocked = true;
  s.researching = null;
}
export function speedResearch(s, id) {
  if (s.paused) return 'Resume the game to speed up research.';
  if (!s.researching || s.researching.id !== id) return 'This research is not active.';
  s.researching.remaining = Math.max(0, s.researching.remaining - researchSpeed(s));
  if (s.researching.remaining <= 1e-9) finishResearch(s);
  return null;
}
export function tick(s, seconds, audit = null) {
  if (s.paused || !Number.isFinite(seconds)) return;
  let remaining = Math.min(Math.max(seconds, 0), 28800);
  while (remaining > 1e-9) {
    const growing = population(s) < capacity(s) && foodSufficient(s);
    const researchRate=researchSpeed(s);
    const foodDeficit=foodConsumption(s)-foodSupply(s), foodStock=s.resources.wheat+s.resources.fish, foodDeadline=foodStock>1e-9 && foodDeficit>1e-9 ? foodStock/foodDeficit : Infinity;
    const exploreRate=explorationRate(s);
    const dt = Math.min(remaining, 1, foodDeadline, s.researching ? s.researching.remaining/researchRate : Infinity, s.wonder?.remaining > 0 ? wonderRemaining(s) : Infinity, growing ? nextArrival(s) : Infinity, exploreRate>0?(EXPLORATION_WORK-s.exploration.progress)/exploreRate:Infinity,s.fleet.building?.remaining??Infinity);
    const { net, gross } = production(s, dt, audit);
    if(audit){
      if(!foodSufficient(s)&&population(s)<capacity(s))audit.hunger+=dt;
      for(const k of Object.keys(RESOURCE))if(s.resources[k]+net[k]*dt>=storageCapacity(s,k)-1e-8 && (k==='coin'?coinsUnlocked(s):s.buildings.some(b=>BUILDINGS[b.type].output[k])||k==='fish'&&s.fleet.missions.fishing))audit.full.add(k);
    }
    for (const k of Object.keys(RESOURCE)) {
      s.resources[k] = Math.min(Math.max(storageCapacity(s,k),s.resources[k]), Math.max(0, s.resources[k] + net[k] * dt));
      s.earned[k] = Math.min(Number.MAX_SAFE_INTEGER, s.earned[k] + gross[k] * dt);
      s.runStats.produced[k]=Math.min(Number.MAX_SAFE_INTEGER,s.runStats.produced[k]+gross[k]*dt);
    }
    s.elapsed += dt; remaining -= dt;
    if (growing) {
      s.growthProgress += dt;
      if (s.growthProgress >= POPULATION_INTERVAL - 1e-9) {
        s.population++; s.growthProgress = 0;
        if (s.autoJob && stageIndex(s)>=1 && assignedWorkers(s,s.autoJob)<workerDemand(s,s.autoJob)) s.assignments[s.autoJob]++;
      }
    } else if(population(s)>=capacity(s)) s.growthProgress = 0;
    if (s.researching) {
      s.researching.remaining -= dt*researchRate;
      if (s.researching.remaining <= 1e-9) finishResearch(s);
    }
    if (s.wonder?.remaining > 0) {
      s.wonder.remaining -= dt*wonderSpeed(s);
      if (s.wonder.remaining <= 1e-9) { s.wonder.remaining=0; s.wonder.duration=0; s.wonder.boosts=0; s.wonder.stage++; }
    }
    if(exploreRate>0){s.exploration.progress+=dt*exploreRate;if(s.exploration.progress>=EXPLORATION_WORK-1e-9){revealTile(s);s.exploration.progress=0;if(s.exploration.tiles.length===mapTileCount(s)){s.assignments.explorer=0;s.fleet.missions.exploration=0;s.assignments.sailor=Math.min(assignedWorkers(s,'sailor'),workerDemand(s,'sailor'));if(s.autoJob==='explorer'||s.autoJob==='sailor'&&!workerDemand(s,'sailor'))s.autoJob=null;}}}
    if(s.fleet.building){s.fleet.building.remaining-=dt;if(s.fleet.building.remaining<=1e-9){s.fleet.ships++;s.fleet.building=null;}}
  }
  recordAchievements(s);
}
export function harvest(s) {
  if (s.paused) return 'Resume the game to harvest.';
  const amount = Math.min(1,storageCapacity(s,'wheat') - s.resources.wheat);
  if (amount <= 1e-9) return 'Wheat storage is full.';
  s.resources.wheat += amount; s.earned.wheat += amount; s.runStats.produced.wheat+=amount;recordCollections(s);
  return null;
}
export function affordable(s, cost) { return Object.entries(cost).every(([k, n]) => Object.hasOwn(RESOURCE,k) && Number.isFinite(n) && n >= 0 && s.resources[k] + 1e-9 >= n); }
export function spend(s, cost) {
  if (!affordable(s, cost)) return false;
  for (const [k, n] of Object.entries(cost)) s.resources[k] = Math.max(0,s.resources[k] - n);
  return true;
}
export function buildCost(s, type) {
  const d = BUILDINGS[type];
  if (!d) return {};
  const growth = (d.growth || 1) ** count(s,type);
  const base=s.tech.includes('organizedStorage')?(type==='warehouse'?{wood:450,stone:300,brick:60}:type==='barn'?{wheat:60}:d.cost):d.cost;
  return Object.fromEntries(Object.entries(base).map(([k,n]) => [k,Math.ceil(n * growth)]));
}
export function freeTile(s, type) {
  const tiles = [];
  for (let x = 0; x < mapSize(s); x++) for (let y = 0; y < mapSize(s); y++) {
    if (suitableTile(s,type,x,y)) tiles.push({ x, y });
  }
  return tiles.sort((a,b)=>{const coastal=t=>neighbours(t.x,t.y,mapSize(s)).some(([x,y])=>tileKnown(s,x,y)&&terrain(x,y)==='water');return (s.mapUnlocked&&!BUILDINGS[type].coast?Number(coastal(a))-Number(coastal(b)):0)||(Math.abs(a.x - 4) + Math.abs(a.y - 4)) - (Math.abs(b.x - 4) + Math.abs(b.y - 4));})[0];
}
export function build(s, type, x, y) {
  if (!Object.hasOwn(BUILDINGS, type) || !buildingUnlocked(s, type)) return 'This building is not unlocked.';
  if (s.paused) return 'Resume the game to build.';
  if (['hall','guildhall'].includes(type) && count(s, type)) return 'You already have a '+(type==='hall'?'town hall':'guildhall')+'.';
  if(x!==undefined||y!==undefined)return 'Buildings are placed automatically.';
  const tile = freeTile(s, type);
  if (!tile) return 'No suitable explored tile. Assign explorers to discover more terrain.';
  if (s.buildings.some(b => b.x === tile.x && b.y === tile.y)) return 'This tile is occupied.';
  if (!BUILDINGS[type].terrain.includes(terrain(tile.x, tile.y))) return `Requires ${BUILDINGS[type].terrain.join(' or ')} terrain.`;
  const costIndex=count(s,type);
  if (!spend(s, buildCost(s, type))) return 'Not enough resources.';
  s.buildings.push({ ...tile, type, ...(isHome(type)?{costIndex}:{}) });
  s.runStats.constructed++;
  if (BUILDINGS[type].workers) s.assignments[type] += Math.min(BUILDINGS[type].workers,idleWorkers(s));
  recordAchievements(s);
  return null;
}
export function demolitionQuote(s,x,y){
  const home=s.buildings.find(b=>b.x===x&&b.y===y);
  if(!home||!isHome(home.type))return null;
  const def=BUILDINGS[home.type],refund=Object.fromEntries(Object.entries(def.cost).map(([key,n])=>[key,Math.ceil(n*def.growth**home.costIndex)*.25]));
  const after={...s,buildings:s.buildings.filter(b=>b!==home)},capacityAfter=capacity(after);
  let reason=null;
  if(s.paused)reason='Resume the game to demolish a home.';
  else if(population(s)>capacityAfter)reason='Not enough housing: '+population(s)+' residents need space, but only '+capacityAfter+' spaces would remain.';
  else if(s.researching&&researchRequirements(after,s.researching.id).length)reason='This home is needed by the active research project.';
  else if((s.wonder.stage>0||s.wonder.remaining>0)&&wonderRequirements(after,s.wonder.remaining>0?s.wonder.stage:s.wonder.stage-1).length)reason='This home is needed by the Great Observatory. Build replacement housing first.';
  else {const full=Object.entries(refund).find(([key,n])=>s.resources[key]+n>storageCapacity(s,key)+1e-9);if(full)reason='Make room in '+RESOURCE[full[0]].name.toLowerCase()+' storage for the refund.';}
  return {type:home.type,x,y,refund,capacityAfter,reason};
}
export function demolishHome(s,x,y){
  const quote=demolitionQuote(s,x,y);
  if(!quote)return 'This home no longer exists.';
  if(quote.reason)return quote.reason;
  s.buildings.splice(s.buildings.findIndex(b=>b.x===x&&b.y===y),1);
  for(const[key,n]of Object.entries(quote.refund))s.resources[key]+=n;
  if(population(s)>=capacity(s))s.growthProgress=0;
  return null;
}
export function research(s, id) {
  if (s.paused) return 'Resume the game to research.';
  if (!Object.hasOwn(TECH, id)) return 'Unknown research.';
  if (!researchUnlocked(s)) return 'Build a wheat field to unlock research.';
  if (s.tech.includes(id)&&!TECH[id].repeatable) return 'Already researched.';
  if (s.researching) return 'Finish the current research first.';
  const missing = researchRequirements(s,id);
  if (missing.length) return 'Requires ' + missing.join(', ') + '.';
  if (Object.entries(researchCost(id,s)).some(([k,n]) => n > storageCapacity(s,k))) return 'Expand storage before starting this research.';
  if (!spend(s,researchCost(id,s))) return 'Not enough resources.';
  const duration = researchDuration(s,id);
  s.researching = { id, remaining: duration, duration };
  return null;
}
export function wonderRequirements(s,index=s.wonder.stage) {
  return [
    ...(s.meta.revolutions>0&&index>=4?['printingPress',...(index>=5?['celestialNavigation']:[])].filter(id=>!s.tech.includes(id)).map(id=>TECH[id].name):[]),
    ...(s.meta.revolutions>0&&index>=4&&population(s)<84?['84 residents']:[]),
    ...(s.meta.revolutions>0&&index>=4&&(!count(s,'guildhall')||!count(s,'grandArchive'))?['Guildhall and grand archive']:[]),
    ...(stageIndex(s)<4 ? ['City stage'] : []),
    ...(!s.tech.includes('astronomy') ? ['Astronomy'] : []),
    ...(count(s,'workshop')<3 ? ['3 workshops (' + count(s,'workshop') + '/3)'] : []),
  ];
}
export function startWonder(s) {
  if (s.paused) return 'Resume the game to build the wonder.';
  if (s.wonder.remaining>0) return 'The current wonder stage is still under construction.';
  if (s.wonder.stage>=wonderProjects(s).length) return 'The Great Observatory is complete.';
  const missing=wonderRequirements(s);
  if (missing.length) return 'Requires ' + missing.join(', ') + '.';
  const project=wonderProjects(s)[s.wonder.stage];
  if (Object.entries(project.cost).some(([k,n])=>n>storageCapacity(s,k))) return 'Expand storage for this wonder stage.';
  if (!spend(s,project.cost)) return 'Not enough resources for this wonder stage.';
  s.wonder.duration=wonderDuration(s,s.wonder.stage); s.wonder.remaining=s.wonder.duration;s.wonder.boosts=0;
  return null;
}
export function wonderBoostQuote(s){
  if(s.wonder.remaining<=0||s.wonder.boosts>=MAX_WONDER_BOOSTS)return null;
  const cost=Object.fromEntries(Object.entries(wonderProjects(s)[s.wonder.stage].cost).map(([k,n])=>[k,Math.ceil(n*.15*1.75**s.wonder.boosts)]));
  const speed=wonderSpeed(s),nextSpeed=speed+.25,remaining=wonderRemaining(s),nextRemaining=s.wonder.remaining/nextSpeed;
  return {stage:s.wonder.stage,level:s.wonder.boosts,cost,speed,nextSpeed,remaining,nextRemaining,saved:remaining-nextRemaining};
}
export function boostWonder(s,stage=s.wonder.stage,level=s.wonder.boosts){
  if(s.paused)return 'Resume the game to fund extra construction supplies.';
  if(stage!==s.wonder.stage||s.wonder.remaining<=0)return 'This construction stage is no longer active.';
  if(level!==s.wonder.boosts)return 'The supply cost has changed. Review the current offer.';
  if(s.wonder.boosts>=MAX_WONDER_BOOSTS)return 'This stage is already at maximum construction speed.';
  const quote=wonderBoostQuote(s);
  if(quote.saved<1)return 'Construction is nearly complete.';
  if(!spend(s,quote.cost))return 'Not enough resources for extra construction supplies.';
  s.wonder.boosts++;return null;
}
export const canReevolve = s => s.wonder.stage === wonderProjects(s).length && s.wonder.remaining === 0;
export const wonderVisualStep=s=>Math.min(4,s.wonder.stage)*4+(s.wonder.remaining>0?Math.min(3,Math.floor((1-s.wonder.remaining/s.wonder.duration)*4)):0);
export const wonderStatus=s=>canReevolve(s)?(s.meta.revolutions?'Celestial Atlas complete':'First observation complete'):s.wonder.remaining>0?'Building '+wonderProjects(s)[s.wonder.stage].name.toLowerCase():s.wonder.stage>0?'Ready for '+wonderProjects(s)[s.wonder.stage].name.toLowerCase():'Not started';
export const legacyCost = (s,id) => (Object.hasOwn(LEGACY_UPGRADES,id) ? legacyLevel(s,id)+1 : Infinity);
export function buyLegacy(s,id) {
  if (s.paused) return 'Resume the game to choose a permanent upgrade.';
  if (!Object.hasOwn(LEGACY_UPGRADES,id) || legacyLevel(s,id)>=5) return 'This permanent upgrade is not available.';
  const cost=legacyCost(s,id);
  if (s.meta.insight<cost) return 'Not enough Insight.';
  s.meta.insight-=cost; s.meta.upgrades[id]++; return null;
}
export function reevolve(s, now=Date.now()) {
  if (s.paused) return 'Resume the game before RE-Evolution.';
  if (!canReevolve(s)) return 'Complete the Great Observatory first.';
  recordAchievements(s);
  const meta=JSON.parse(JSON.stringify(s.meta)), name=s.name;
  const quote=evolutionQuote(s);
  for(const row of quote.rows)meta.collections.tiers[row.id]=row.reached;
  meta.collections.claimedItems=[...meta.collections.items];
  meta.insight+=quote.total; meta.revolutions++;
  meta.pendingEvolution={base:quote.base,collectionPoints:quote.collectionPoints,itemPoints:quote.itemPoints,total:quote.total};
  meta.history.unshift({ run: meta.revolutions, seconds: s.elapsed, completedAt: now, reward: quote.total, currency:'EP', wonder: WONDER_NAME });
  meta.history=meta.history.slice(0,20);
  const next=fresh(now,meta); next.name=name;
  for (const key of Object.keys(s)) delete s[key];
  Object.assign(s,next); recordAchievements(s); return null;
}
export function marketQuote(key, direction, amount = 50) {
  if (!Object.hasOwn(MARKET_PRICES,key) || !['buy','sell'].includes(direction) || !Number.isInteger(amount) || amount <= 0 || amount > STORAGE_LIMIT) return null;
  const coins = Math.round(MARKET_PRICES[key][direction] * amount * 100) / 100;
  return direction === 'buy' ? { cost: { coin: coins }, receive: { [key]: amount } } : { cost: { [key]: amount }, receive: { coin: coins } };
}
export function marketTrade(s, key, direction, amount = 50) {
  if (s.paused) return 'Resume the game to trade.';
  if (!coinsUnlocked(s) || !tradeUnlocked(s)) return 'Complete Currency and Markets research to trade.';
  const quote = marketQuote(key,direction,amount);
  if (!quote) return 'Invalid trade.';
  if (Object.entries(quote.receive).some(([k,n]) => s.resources[k] + n > storageCapacity(s,k) + 1e-9)) return 'Not enough storage for this trade.';
  if (!spend(s,quote.cost)) return 'Not enough resources.';
  for (const [k,n] of Object.entries(quote.receive)) { s.resources[k] = Math.min(storageCapacity(s,k),s.resources[k]+n); s.earned[k] += n; }
  return null;
}
export function trade(s, key, amount = 50) {
  return marketTrade(s,key,'sell',amount);
}
export function estimateWait(s, cost) {
  if (s.paused) return { status: 'paused', seconds: null };
  if (Object.entries(cost).some(([k,n]) => !Object.hasOwn(RESOURCE,k) || !Number.isFinite(n) || n < 0)) return { status: 'blocked', seconds: null };
  if (Object.entries(cost).some(([k,n]) => n > storageCapacity(s,k))) return { status: 'storage', seconds: null };
  if (affordable(s,cost)) return { status: 'ready', seconds: 0 };
  const net = rates(s);
  let seconds = 0;
  for (const [key,amount] of Object.entries(cost)) {
    const missing = amount-s.resources[key];
    if (missing <= 1e-9) continue;
    let wait;
    if(key==='wheat'){
      const supply=wheatSupply(s),fishDeficit=foodConsumption(s)-fishSupply(s);
      const reserveTime=fishDeficit>1e-9?s.resources.fish/fishDeficit:Infinity;
      const sustainable=supply-Math.max(0,fishDeficit);
      if(supply>0&&missing<=reserveTime*supply)wait=missing/supply;
      else if(sustainable>1e-9)wait=reserveTime+(missing-reserveTime*supply)/sustainable;
      else return {status:'production',resource:key,seconds:null};
    } else if (key === 'brick' || key === 'tool') {
      const type=key==='brick'?'kiln':'workshop', def=BUILDINGS[type];
      const output = count(s,type) * def.output[key] * multiplier(s,{type}) * staffing(s,type);
      if (output <= 0) return { status: 'production', resource: key, seconds: null };
      let stockedSeconds=Infinity, sustainable=output, limiting=null;
      for (const [inputKey,perBuilding] of Object.entries(def.input)) {
        const input=count(s,type)*perBuilding*multiplier(s,{type})*staffing(s,type);
        let supply=0;
        for (const source of s.buildings) {
          const sourceDef=BUILDINGS[source.type], m=multiplier(s,source)*staffing(s,source.type);
          if (!sourceDef.input) supply+=(sourceDef.output[inputKey]||0)*m;
          else if (source.type!==type && Object.keys(sourceDef.output).some(k=>s.resources[k]<storageCapacity(s,k))) supply-=(sourceDef.input[inputKey]||0)*m;
        }
        supply=Math.max(0,supply);
        if (input>supply) stockedSeconds=Math.min(stockedSeconds,s.resources[inputKey]/(input-supply));
        const limit=output*Math.min(1,supply/input);
        if (limit<sustainable) { sustainable=limit; limiting=inputKey; }
      }
      if (missing <= stockedSeconds*output) wait = missing/output;
      else {
        if (sustainable <= 0) return { status: 'input', resource: limiting, seconds: null };
        wait = stockedSeconds+(missing-stockedSeconds*output)/sustainable;
      }
    } else {
      if (net[key] <= 1e-9) return { status: 'production', resource: key, seconds: null };
      wait = missing/net[key];
    }
    seconds = Math.max(seconds,wait);
  }
  return { status: 'waiting', seconds };
}
export function serialize(s, now = Date.now()) { return JSON.stringify({ ...s, lastSaved: now }); }
function migrate(s) {
  if(s.version===13)return;
  if(s.version===12){
    s.runStats={...blankStats(),constructed:s.buildings.length,produced:{...s.earned},peakPopulation:s.population,peakTiles:s.exploration.tiles.length};s.guildFocus=null;
    s.meta.stars=[];s.meta.collections=blankCollections();s.meta.pendingEvolution=null;s.meta.insight+=12*s.meta.revolutions;
    s.assignments.grandArchive=0;s.version=13;recordCollections(s);return;
  }
  if(s.version===11){if(s.wonder)s.wonder.boosts=0;s.version=12;return;}
  if(s.version===10){if(s.meta)s.meta.achievements=[];s.version=11;return;}
  if(s.version===9){const indices={};for(const b of s.buildings)if(isHome(b.type)){b.costIndex=indices[b.type]||0;indices[b.type]=b.costIndex+1;}s.version=10;return;}
  if(s.version===8){s.exploration.size=9;s.version=9;return;}
  if(s.version===7){
    s.exploration={tiles:[...new Set([...initialTiles(),...s.buildings.map(b=>tileKey(b.x,b.y))])],progress:0};
    s.fleet={ships:0,missions:{fishing:0,exploration:0},building:null};
    for(const type of ['fishery','explorer','sailor'])s.assignments[type]=0;
    s.version=8;return;
  }
  if (s.version >= 7) return;
  if (s.version === 6) { s.assignments.researcher=0; s.version=7; return; }
  const previousVersion = s.version;
  if (previousVersion < 4) {
  const add = id => {
    for (const prerequisite of TECH[id].requires) add(prerequisite);
    if (!s.tech.includes(id)) s.tech.push(id);
  };
  if (s.version === 2) {
    const legacyUnlocks = { lumber: 'forestry', quarry: 'masonry', house: 'housing', hall: 'writing', library: 'scholarship', kiln: 'pottery' };
    for (const b of s.buildings) if (legacyUnlocks[b.type]) add(legacyUnlocks[b.type]);
    for (const id of [...s.tech]) add(id);
    if (s.mapUnlocked) add('map');
    s.researching = null;
  }
  // Grandfather only storage needed by existing progress and saved resources.
  const addStorage = id => {
    for (const p of TECH[id].requires) if (STORAGE_TECH.includes(p)) addStorage(p);
    if (!s.tech.includes(id)) s.tech.push(id);
  };
  const ensureStorage = id => {
    for (const p of TECH[id].requires) { if (STORAGE_TECH.includes(p)) addStorage(p); else ensureStorage(p); }
  };
  for (const id of [...s.tech, ...(s.researching ? [s.researching.id] : [])]) if (Object.hasOwn(TECH,id)) ensureStorage(id);
  if (s.resources.wheat > 100) addStorage('granaries');
  if (['wood','stone','brick','coin'].some(k => s.resources[k] > 100)) addStorage('stockpiles');
  if (Object.keys(RESOURCE).some(k => k !== 'science' && s.resources[k] > 500)) addStorage('warehousing');
  if (s.resources.science > 100) addStorage('archives');
  if (Object.keys(RESOURCE).some(k => s.resources[k] > (k === 'science' ? 500 : 2000))) addStorage('organizedStorage');
  s.assignments = Object.fromEntries(JOB_TYPES.map(type => [type,0]));
  for (const type of JOB_TYPES.filter(type=>type!=='researcher')) s.assignments[type] = Math.min(workerDemand(s,type),idleWorkers(s));
  }
  if (previousVersion<5) {
    // Earlier houses already supplied their residents; keep those people and unlocks.
    s.population = capacity(s); s.growthProgress = 0;
    if (s.tech.includes('trade') && !s.tech.includes('markets')) s.tech.push('markets');
  }
  s.meta=freshMeta(); s.wonder={stage:0,remaining:0,duration:0}; s.autoJob=null;
  if (s.researching) s.researching.duration=TECH[s.researching.id]?.duration;
  s.version = 7;
}
export function restore(raw, now = Date.now()) {
  try {
    const s = JSON.parse(raw);
    if(s&&[2,3,4,5,6,7].includes(s.version))for(const field of ['resources','earned'])if(s[field])s[field].fish=0;
    if (s && [2,3,4,5].includes(s.version)) {
      if (s.resources && !Object.hasOwn(s.resources,'tool')) s.resources.tool=0;
      if (s.earned && !Object.hasOwn(s.earned,'tool')) s.earned.tool=0;
      if (s.assignments) for (const type of ['workshop','academy']) if (!Object.hasOwn(s.assignments,type)) s.assignments[type]=0;
    }
    if (s && [2,3,4,5,6].includes(s.version) && s.assignments) s.assignments.researcher=0;
    if (!s || ![2,3,4,5,6,7,8,9,10,11,12,13].includes(s.version) || !Array.isArray(s.buildings) || s.buildings.length > MAX_MAP_SIZE**2 || !Array.isArray(s.tech) || s.tech.some(k => !Object.hasOwn(TECH, k)) || new Set(s.tech).size !== s.tech.length ||
      !['resources', 'earned'].every(field => s[field] && Object.keys(RESOURCE).every(k => Number.isFinite(s[field][k]) && s[field][k] >= 0)) ||
      s.buildings.some(b => !b || !Object.hasOwn(BUILDINGS, b.type) || !Number.isInteger(b.x) || !Number.isInteger(b.y) || b.x < 0 || b.x >= mapSize(s) || b.y < 0 || b.y >= mapSize(s) || !BUILDINGS[b.type].terrain.includes(terrain(b.x, b.y))) ||
      new Set(s.buildings.map(b => `${b.x},${b.y}`)).size !== s.buildings.length || !Number.isFinite(s.lastSaved) || !Number.isFinite(s.elapsed) || s.elapsed < 0 || typeof s.paused !== 'boolean' || typeof s.mapUnlocked !== 'boolean' || typeof s.name !== 'string' || s.name.length > 24) return null;
    s.buildings = s.buildings.map(({x, y, type, costIndex}) => ({x, y, type, ...(isHome(type)?{costIndex}:{})}));
    // Older staffing migration uses the population that those saves already had.
    if (s.version < 5) s.population = capacity(s);
    while(s.version<13)migrate(s);
    if(s.buildings.some(b=>isHome(b.type)&&(!Number.isInteger(b.costIndex)||b.costIndex<0||b.costIndex>=MAX_MAP_SIZE**2)))return null;
    if(!s.exploration||!Number.isInteger(s.exploration.size)||mapSize(s)<9||mapSize(s)>MAX_MAP_SIZE||(mapSize(s)-9)%4!==0||!Array.isArray(s.exploration.tiles)||s.exploration.tiles.length<25||s.exploration.tiles.length>mapTileCount(s)||new Set(s.exploration.tiles).size!==s.exploration.tiles.length||s.exploration.tiles.some(k=>{if(typeof k!=='string'||!/^\d+,\d+$/.test(k))return true;const[x,y]=k.split(',').map(Number);return x>=mapSize(s)||y>=mapSize(s)||k!==tileKey(x,y);})||initialTiles().some(k=>!s.exploration.tiles.includes(k))||!Number.isFinite(s.exploration.progress)||s.exploration.progress<0||s.exploration.progress>=EXPLORATION_WORK||s.buildings.some(b=>!tileKnown(s,b.x,b.y)||BUILDINGS[b.type].coast&&!neighbours(b.x,b.y,mapSize(s)).some(([x,y])=>tileKnown(s,x,y)&&(b.type==='fishery'?terrain(x,y)!=='water':terrain(x,y)==='water'))))return null;
    if(!s.fleet||!Number.isInteger(s.fleet.ships)||s.fleet.ships<0||s.fleet.ships>shipCapacity(s)||!s.fleet.missions||['fishing','exploration'].some(k=>!Number.isInteger(s.fleet.missions[k])||s.fleet.missions[k]<0)||s.fleet.missions.fishing+s.fleet.missions.exploration>s.fleet.ships||s.fleet.ships>0&&!s.tech.includes('shipping')||s.fleet.building!==null&&(!s.fleet.building||!s.tech.includes('shipping')||s.fleet.ships>=shipCapacity(s)||s.fleet.building.duration!==SHIP_DURATION||!Number.isFinite(s.fleet.building.remaining)||s.fleet.building.remaining<=0||s.fleet.building.remaining>SHIP_DURATION))return null;
    if (!s.meta || !Array.isArray(s.meta.achievements) || new Set(s.meta.achievements).size!==s.meta.achievements.length || s.meta.achievements.some(id=>!ACHIEVEMENTS.some(a=>a.id===id)) || !Number.isInteger(s.meta.insight) || s.meta.insight<0 || !Number.isInteger(s.meta.revolutions) || s.meta.revolutions<0 || !s.meta.upgrades ||
      Object.keys(s.meta.upgrades).some(k=>!Object.hasOwn(LEGACY_UPGRADES,k)) || Object.keys(LEGACY_UPGRADES).some(k=>!Number.isInteger(s.meta.upgrades[k]) || s.meta.upgrades[k]<0 || s.meta.upgrades[k]>5) ||
      !Array.isArray(s.meta.history) || s.meta.history.length>20 || s.meta.history.some(h=>!h || !Number.isInteger(h.run) || h.run<1 || h.run>s.meta.revolutions || !Number.isFinite(h.seconds) || h.seconds<0 || !Number.isFinite(h.completedAt) || (h.currency==='EP'?!Number.isSafeInteger(h.reward)||h.reward<12:h.reward!==3) || h.wonder!==WONDER_NAME)) return null;
    if(!validEvolution(s)||s.tech.some(id=>TECH[id].minEvolution>s.meta.revolutions)||s.guildFocus!==null&&(!Object.hasOwn(GUILDS,s.guildFocus)||!s.tech.includes('guildCharters')||!count(s,'guildhall')||!s.meta.revolutions)||count(s,'guildhall')>1||s.buildings.some(b=>['guildhall','grandArchive'].includes(b.type)&&!buildingUnlocked(s,b.type)))return null;
    if (!Number.isInteger(s.population) || s.population < 6 || s.population > capacity(s) || !Number.isFinite(s.growthProgress) || s.growthProgress < 0 || s.growthProgress >= POPULATION_INTERVAL) return null;
    if (!s.assignments || Object.keys(s.assignments).some(k => !JOB_TYPES.includes(k)) ||
      JOB_TYPES.some(type => !Number.isInteger(s.assignments[type]) || s.assignments[type] < 0 || s.assignments[type] > workerDemand(s,type)) || workers(s) > population(s)) return null;
    if (population(s) >= capacity(s)) s.growthProgress = 0;
    if (s.autoJob!==null && (!JOB_TYPES.includes(s.autoJob) || !workerDemand(s,s.autoJob) || stageIndex(s)<1)) return null;
    if (!s.wonder || !Number.isInteger(s.wonder.boosts)||s.wonder.boosts<0||s.wonder.boosts>MAX_WONDER_BOOSTS||s.wonder.remaining===0&&s.wonder.boosts!==0 || !Number.isInteger(s.wonder.stage) || s.wonder.stage<0 || s.wonder.stage>wonderProjects(s).length || !Number.isFinite(s.wonder.remaining) || s.wonder.remaining<0 || !Number.isFinite(s.wonder.duration) || s.wonder.duration<0 ||
      s.wonder.stage===wonderProjects(s).length && s.wonder.remaining!==0 || s.wonder.remaining>0 && (s.wonder.duration<=0 || s.wonder.duration>wonderProjects(s)[s.wonder.stage].duration || s.wonder.remaining>s.wonder.duration) ||
      (s.wonder.stage>0 || s.wonder.remaining>0) && wonderRequirements(s,s.wonder.remaining>0?s.wonder.stage:s.wonder.stage-1).length) return null;
    if (s.researching !== null && (!s.researching || !Object.hasOwn(TECH,s.researching.id) || s.tech.includes(s.researching.id)&&!TECH[s.researching.id].repeatable ||
      !Number.isFinite(s.researching.duration) || s.researching.duration<=0 || s.researching.duration>researchBaseDuration(s,s.researching.id) || !Number.isFinite(s.researching.remaining) || s.researching.remaining <= 0 || s.researching.remaining > s.researching.duration ||
      researchRequirements(s,s.researching.id).length > 0)) return null;
    s.mapUnlocked = s.tech.includes('map');
    // Retain existing stock above a newly lowered cap; production waits for room.
    const offline = Math.min(28800, Math.max(0, (now - s.lastSaved) / 1000));
    recordAchievements(s); const away=advanceAway(s,Math.max(0,(now-s.lastSaved)/1000)); s.lastSaved = now;
    return { state: s, offline, away };
  } catch { return null; }
}
