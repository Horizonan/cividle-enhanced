import {
  RESOURCE, BUILDINGS, TECH, JOB_TYPES, MARKET_PRICES, STAGES, WONDER_NAME, WONDER_STAGES, LEGACY_UPGRADES, storageCapacity, fresh, count, constructionUnlocked,
  availableBuildings, researchUnlocked, tradeUnlocked, visibleResources,
  capacity, population, nextArrival, foodConsumption, foodSupply, foodSufficient, workers, idleWorkers, assignedWorkers, workerDemand, workersUnlocked, assignWorkers, staffing, rates, multiplier, tick, harvest, affordable, buildCost, build,
  researchCost, researchDuration, researchSpeed, researchRemaining, jobName, researchRequirements, visibleTechnologies, research, speedResearch, marketQuote, marketTrade, estimateWait, serialize, restore, terrain,
  stageIndex, stageRequirements, setArrivalJob, wonderDuration, wonderRequirements, startWonder, canReevolve, legacyCost, buyLegacy, reevolve, wonderSpeed, wonderRemaining, wonderBoostQuote, boostWonder, MAX_WONDER_BOOSTS,
  freeTile, explorationRate, EXPLORATION_WORK, SHIP_COST, SHIP_DURATION, startShip, assignShips, shipCapacity, shipCrewing,
  mapSize, mapTileCount, MAX_MAP_SIZE,
  isHome, demolitionQuote, demolishHome, ACHIEVEMENTS, achievementProgress, wonderVisualStep, wonderStatus, buildingStorage, nextMilestone, advanceAway,
} from './model.js';
import {constellationsHTML,collectionsHTML,guildsHTML,revealEvolution} from './evolution-ui.js';
import {evolutionQuote,CONSTELLATIONS,STARS,COLLECTIONS,hasStar,buyStar,acknowledgeEvolution,GUILDS,setGuild,wonderProjects} from './model.js';
let selectedStar='seed';
import { mapHTML, wonderArt } from './map.js';
import { observatoryAnimationHTML } from './observatory.js';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SAVE_KEY = 'everdawn-save-v2';
const RESEARCH_FILTER_KEY = 'everdawn-hide-researched';
const BACKUP_KEY = 'everdawn-last-run';
const GROUPS_KEY='everdawn-building-groups';
const DISCORD_FEEDBACK_URL='https://discord.gg/y6AtXJfcWc';
const feedbackLinkHTML=()=>'<a class="feedback-link" href="'+DISCORD_FEEDBACK_URL+'" target="_blank" rel="noopener noreferrer" aria-label="Feedback on Discord (opens in a new tab)"><span>Feedback on Discord</span><span aria-hidden="true">↗</span></a>';
const BUILD_GROUPS=[
  {id:'food',name:'Food',types:['farm','fishery']},
  {id:'materials',name:'Materials',types:['lumber','quarry','kiln','workshop']},
  {id:'housing',name:'Housing',types:['house','stoneHouse','residence']},
  {id:'storage',name:'Storage',types:['barn','warehouse']},
  {id:'knowledge',name:'Knowledge',types:['hall','study','library','academy','grandArchive','guildhall']},
  {id:'harbour',name:'Harbour',types:['wharf']},
];
let buildGroupOpen={food:true};
try{const saved=JSON.parse(localStorage.getItem(GROUPS_KEY));for(const group of BUILD_GROUPS)if(typeof saved?.[group.id]==='boolean')buildGroupOpen[group.id]=saved[group.id];}catch{}
let restored;
try { restored = restore(localStorage.getItem(SAVE_KEY)); } catch {}
let hideResearched = false;
try { hideResearched = localStorage.getItem(RESEARCH_FILTER_KEY) === 'true'; } catch {}
let state = restored?.state || fresh();
let latestAway=restored?.away?.seconds>=60?restored.away:null, awayStarted=document.hidden?Date.now():null;
let knownAchievements=new Set(state.meta.achievements);
let page = 'settlement', marketQuantity = 10, lastTick = Date.now(), saveTime = 0, toastTimer, signature;
let resourcesExpanded=false,mobileSettlementView='buildings',mapZoom=1;
const navigationItems=()=>researchUnlocked(state)?[['settlement','Settlement'],['research','Research'],['progress','Progress'],...(workersUnlocked(state)?[['workers','Workers']]:[]),...(tradeUnlocked(state)?[['trade','Market']]:[]),...(state.tech.includes('shipping')?[['fleet','Fleet']]:[]),['achievements','Achievements'],['collections','Collections'],...(state.tech.includes('guildCharters')?[['guilds','Guilds']]:[]),...(state.meta.revolutions||canReevolve(state)?[['legacy','RE-Evolution']]:[])]:state.meta.achievements.length||state.meta.revolutions?[['settlement','Settlement'],['achievements','Achievements'],['collections','Collections'],...(state.meta.revolutions?[['legacy','RE-Evolution']]:[])]:[];
const navIcon=id=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+({settlement:'<path d="M3 10l9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',research:'<path d="M12 5v15M3 4h4q3 0 5 2 2-2 5-2h4v14h-4q-3 0-5 2-2-2-5-2H3Z"/>',workers:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M17 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v3"/>',more:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'}[id]||'')+'</svg>';
function navigatePage(id){page=id;render();window.scrollTo(0,0);}
function showMore(){
  const items=navigationItems().filter(([id])=>!['settlement','research','workers'].includes(id));
  dialog('<h2>More</h2><div class="more-menu">'+items.map(([id,name])=>'<button data-more-page="'+id+'" '+(page===id?'aria-current="page"':'')+'><span>'+name+'</span><span aria-hidden="true">›</span></button>').join('')+feedbackLinkHTML()+'</div>');
  $$('[data-more-page]').forEach(btn=>btn.onclick=()=>{$('#modal').close();navigatePage(btn.dataset.morePage);});
}
const fmt = n => Math.floor(n).toLocaleString('en-US');
const rateFmt = n => Number(n.toFixed(2)).toLocaleString('en-US');
const resourceFmt = (key,n) => key === 'coin' ? rateFmt(n) : fmt(n);
const timeFmt = seconds => { const n = Math.max(0,Math.ceil(seconds)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2,'0'); };
const runTimeFmt = seconds => Math.floor(seconds/3600) + 'h ' + Math.floor(seconds%3600/60) + 'm';
const costText = cost => Object.entries(cost).map(([k,n]) => n + ' ' + RESOURCE[k].name.toLowerCase()).join(', ');
const costHTML = cost => '<span class="cost">' + Object.entries(cost).map(([k,n]) =>
  '<span data-cost-resource="' + k + '" data-cost-amount="' + n + '">' + n + ' ' + RESOURCE[k].name.toLowerCase() + '</span>').join(', ') + '</span>';
const needs = cost => 'data-needs="' + escape(JSON.stringify(cost)) + '"';
const etaHTML = (cost, researchId = '', receive = null) => '<span class="cost-wait" data-wait-cost="' + escape(JSON.stringify(cost)) + '" data-wait-research="' + researchId + '"' + (receive ? ' data-wait-receive="' + escape(JSON.stringify(receive)) + '"' : '') + ' title="Estimated from current net production, without future purchases or manual clicks."></span>';
const storageWarning = cost => {
  const blocked = Object.entries(cost).filter(([k,n]) => n > storageCapacity(state,k)).map(([k]) => RESOURCE[k].name.toLowerCase());
  return blocked.length ? '<p class="capacity-warning">Expand ' + blocked.join(', ') + ' storage.</p>' : '';
};

function toast(text) {
  $('#toast').textContent = text;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2600);
}
function save() {
  try {
    localStorage.setItem(SAVE_KEY, serialize(state));
    $('#save-status').textContent = 'Saved';
  } catch { $('#save-status').textContent = 'Save unavailable'; }
}
function advance() {
  const now = Date.now();
  tick(state, Math.max(0, (now - lastTick) / 1000));
  lastTick = now;
}
function act(action, message) {
  advance();
  const error = action();
  if (error) { toast(error); updateLive(); return false; }
  save();
  render();
  if (message) toast(message);
  return true;
}
function uiSignature() {
  return [constructionUnlocked(state), state.mapUnlocked, researchUnlocked(state), state.researching?.id,
    state.tech.join(','), mapSize(state), state.exploration.tiles.length, state.fleet.ships, !!state.fleet.building, JSON.stringify(state.fleet.missions), population(state), stageIndex(state), state.autoJob, state.wonder.stage, state.wonder.boosts, state.wonder.remaining>0, wonderVisualStep(state), state.meta.achievements.join(','), state.meta.insight, state.meta.stars.join(','), state.meta.pendingEvolution?.total, evolutionQuote(state).total, state.guildFocus, JSON.stringify(state.meta.upgrades), JSON.stringify(state.assignments), tradeUnlocked(state), visibleResources(state).join(','), availableBuildings(state).join(','), visibleTechnologies(state).join(',')].join('|');
}
function productionText(type) {
  const d = BUILDINGS[type];
  if (isHome(type)) return '+'+d.housing+' housing space · residents arrive over time';
  if (type === 'study') return '+2 researcher slots';
  if (type === 'wharf') return '+2 ship capacity · automatic coastal placement';
  const storage=buildingStorage(state,type),storageText=type==='warehouse'?'Each: +'+rateFmt(storage.wheat)+' capacity per good':Object.entries(storage).map(([k,n])=>'+'+rateFmt(n)+' '+RESOURCE[k].name.toLowerCase()+' storage').join(', ');
  const result = Object.entries(d.output).map(([k,n]) => '+' + rateFmt(n * multiplier(state,{type})) + ' ' + RESOURCE[k].name.toLowerCase() + '/s each').join(', ');
  const input = Object.entries(d.input || {}).map(([k,n]) => rateFmt(n * multiplier(state,{type})) + ' ' + RESOURCE[k].name.toLowerCase() + '/s').join(', ');
  return [result+(input ? ' · uses ' + input : '')+(type==='academy'?' · +4 researcher slots':''),storageText].filter(Boolean).join(' · ');
}
function earlyHTML() {
  const resources = visibleResources(state).length > 1 ? stockpilesHTML() : '<section class="wheat-start" aria-label="Wheat">' +
    '<div class="stock-heading">Wheat</div><div class="stock-number"><span data-value="wheat">' + fmt(state.resources.wheat) + '</span><span class="storage-limit"> / <span data-storage="wheat">' + fmt(storageCapacity(state,'wheat')) + '</span></span></div>' +
    '<div class="production-rate" data-rate="wheat">' + (count(state,'farm') ? '+' + rateFmt(rates(state).wheat) + '/s' : '') + '</div><p class="food-use" data-food-use>'+foodText()+'</p>' +
    '<button class="primary harvest" id="harvest">Harvest wheat <span>+1</span></button>' +
    (!constructionUnlocked(state) ? '<p class="next-step">Collect 10 wheat to build a field.</p>' : count(state,'farm')===1&&!foodSufficient(state)?'<p class="next-step">Harvest wheat to establish a second field.</p>':'') + '</section>';
  return resources + (constructionUnlocked(state) ? constructionHTML() : '');
}
function constructionHTML() {
  const available=availableBuildings(state),types=available.filter(type=>!['hall','guildhall'].includes(type)||!count(state,type));
  if(!available.includes('warehouse')&&visibleTechnologies(state).includes('warehousing'))types.push('warehouse');
  const rowHTML=type=>{
    const cost = buildCost(state,type), owned = count(state,type);
    if(!available.includes(type))return '<div class="build-row"><div><h3>'+BUILDINGS[type].name+'</h3><div class="build-effect">500 capacity per good</div><div class="staffing-note">Requires Warehouses research</div></div><button data-storage-research>View research</button></div>';
    const storageResearch=type==='warehouse'?'warehousing':type==='barn'?'granaries':null;
    const researchNote=storageResearch?'<div class="staffing-note">'+TECH[storageResearch].name+' researched'+(state.tech.includes('organizedStorage')?' · Organized storage ×3':'')+(state.meta.upgrades.storage?' · Storage traditions +'+(state.meta.upgrades.storage*25)+'%':'')+'</div>':'';
    return '<div class="build-row"><div><div class="build-label"><h3>' + BUILDINGS[type].name + '</h3>' +
      (owned ? '<span class="owned">' + owned + ' built</span>' : '') + '</div><div class="build-effect"'+(type==='warehouse'?' title="Each warehouse adds capacity separately for wheat, wood, stone, bricks, tools, coins and fish. Knowledge is stored separately."':'')+'>' + productionText(type) + '</div>'+researchNote +
      (owned && BUILDINGS[type].workers ? '<div class="staffing-note">' + assignedWorkers(state,type) + '/' + workerDemand(state,type) + ' workers' + (!assignedWorkers(state,type) ? ' · Waiting for workers' : staffing(state,type) < 1 ? ' · ' + Math.round(staffing(state,type)*100) + '% staffed' : '') + '</div>' : '') + storageWarning(cost) + '</div>' +
      '<div class="purchase-block"><div class="build-actions">' + costHTML(cost) + '<button data-build="' + type + '" ' + needs(cost) +
      ' data-build-space="'+type+'" title="Automatically places on suitable explored terrain">Build</button></div>' + (!freeTile(state,type)?'<span class="capacity-warning">'+(state.mapUnlocked?'Explore more suitable terrain.':'No suitable terrain in the starting area.')+'</span>':'') + etaHTML(cost) + (owned&&isHome(type)?'<button class="demolish-home danger" data-demolish-type="'+type+'" aria-label="Demolish one '+BUILDINGS[type].name.toLowerCase()+'" title="Recover 25% of the original construction cost">Demolish</button>':'') + '</div></div>';
  };
  const rows=available.length<6?types.map(rowHTML).join(''):BUILD_GROUPS.filter(group=>types.some(type=>group.types.includes(type))).map(group=>
    '<details class="build-group" data-build-group="'+group.id+'" '+(buildGroupOpen[group.id]?'open':'')+'><summary>'+group.name+'<span>'+group.types.reduce((n,type)=>n+count(state,type),0)+' built</span></summary>'+types.filter(type=>group.types.includes(type)).map(rowHTML).join('')+'</details>').join('');
  return '<section class="construction"><div class="section-heading"><h2>Buildings</h2>' +
    (state.mapUnlocked ? '<small>' + state.buildings.length + ' / '+state.exploration.tiles.length+' known tiles</small>' : '') + '</div>' + rows +
    (workersUnlocked(state) ? '<p class="worker-note">Population: ' + population(state) + ' / ' + capacity(state) + ' · ' + workers(state) + ' assigned · ' + idleWorkers(state) + ' idle <button data-open-workers>Assign workers</button></p><p class="population-growth" data-next-arrival></p>' : '') + '</section>';
}
function stockpilesHTML() {
  const resources=visibleResources(state),priority=page==='trade'?['coin','wheat']:page==='research'?['science','wood']:['wheat','wood'],preview=[...priority.filter(k=>resources.includes(k)),...resources.filter(k=>!priority.includes(k))].slice(0,2);
  return '<section class="resource-panel'+(resourcesExpanded?' expanded':'')+'"><button class="resource-toggle" aria-expanded="'+resourcesExpanded+'" aria-controls="resource-grid"><span class="resource-toggle-heading">Resources<span data-resource-toggle-label>'+(resourcesExpanded?'Show less':'Show all')+' <span aria-hidden="true">⌄</span></span></span><span class="resource-preview">'+preview.map(k=>'<span><small>'+RESOURCE[k].name+'</small><strong data-value="'+k+'">'+resourceFmt(k,state.resources[k])+'</strong></span>').join('')+'</span><span class="resource-food food-use" data-food-use>'+foodText()+'</span></button><div class="stockpiles" id="resource-grid" aria-label="Resources">' + resources.map(k =>
    '<div class="stock"><small>' + RESOURCE[k].name + '</small><strong><span data-value="' + k + '">' + resourceFmt(k,state.resources[k]) + '</span><span class="storage-limit"> / <span data-storage="' + k + '">' + fmt(storageCapacity(state,k)) + '</span></span></strong>' +
    '<span class="rate" data-rate="' + k + '">' + rateFmt(rates(state)[k]) + '/s</span>' +
    (k === 'wheat' ? '<span class="food-use" data-food-use>'+foodText()+'</span><button class="compact-harvest" id="harvest">Harvest +1</button>' : '') + '</div>').join('') + '</div></section>';
}
function foodState(){const balance=foodSupply(state)-foodConsumption(state);return balance>1e-9?'positive':balance< -1e-9?'negative':'balanced';}
function foodText(){const status=foodState();return 'Food balance: '+status[0].toUpperCase()+status.slice(1);}
function settlementHTML() {
  return stockpilesHTML() + '<div class="mobile-view-controls" role="group" aria-label="Settlement view"><button data-settlement-view="buildings" aria-pressed="'+(mobileSettlementView==='buildings')+'">Buildings</button><button data-settlement-view="map" aria-pressed="'+(mobileSettlementView==='map')+'">Map</button></div><div class="settlement-layout" data-mobile-view="'+mobileSettlementView+'"><section data-settlement-section="map"><div class="map-heading"><h1>' + escape(state.name) + '</h1>' +
    '<small>' + state.buildings.length + ' buildings</small></div><div class="mobile-map-controls" role="group" aria-label="Map zoom"><button data-map-zoom="-1" aria-label="Zoom out" '+(mapZoom===1?'disabled':'')+'>−</button><span data-map-scale>'+Math.round(mapZoom*100)+'%</span><button data-map-zoom="1" aria-label="Zoom in" '+(mapZoom===3?'disabled':'')+'>+</button></div><div class="map-frame" style="--map-zoom:'+mapZoom+'">' + mapHTML(state) + '</div>' +
    '<div class="map-legend"><span><i></i>Grassland</span><span><i></i>Forest</span><span><i></i>Stone</span></div>' +
    '<p class="map-instruction">Buildings are placed automatically.</p>'+((state.wonder.stage||state.wonder.remaining)?'<button class="wonder-map-link" data-open-wonder>'+WONDER_NAME+' · '+wonderStatus(state)+'</button>':'')+explorationHTML() +
    '</section><div data-settlement-section="buildings">' + constructionHTML() + '</div></div>';
}
function explorationHTML(){
  const complete=state.exploration.tiles.length===mapTileCount(state),expandable=mapSize(state)<MAX_MAP_SIZE;
  return '<section class="exploration-summary"><h2>Exploration</h2><p>'+state.exploration.tiles.length+' / '+mapTileCount(state)+' tiles discovered · '+mapSize(state)+'×'+mapSize(state)+'</p><p data-exploration-eta></p>'+(!complete?'<progress data-exploration-progress max="'+EXPLORATION_WORK+'" value="'+state.exploration.progress+'"></progress><button data-open-workers>Assign explorers</button>':expandable?'<p>Research Frontier surveying to open a '+(mapSize(state)+4)+'×'+(mapSize(state)+4)+' map.</p><button data-frontier-research>View research</button>':'<p>All frontier regions surveyed.</p>')+'</section>';
}
function fleetHTML(){
  const fleet=state.fleet;
  return stockpilesHTML()+'<h1 class="page-title">Fleet</h1><p class="worker-summary">'+fleet.ships+' / '+shipCapacity(state)+' ships · '+assignedWorkers(state,'sailor')+'/'+workerDemand(state,'sailor')+' sailors</p>'+
    (!count(state,'wharf')?'<p class="worker-help">Build a wharf on explored coastline to construct ships.</p>':fleet.building?'<section class="ship-construction"><h2>Ship under construction</h2><progress data-ship-progress max="'+SHIP_DURATION+'" value="'+(SHIP_DURATION-fleet.building.remaining)+'"></progress><p data-ship-remaining></p></section>':'<section class="build-row"><div><h2>Build ship</h2><p class="worker-help">10 minutes · two sailors per active ship</p></div><div class="purchase-block">'+costHTML(SHIP_COST)+'<button id="build-ship" '+needs(SHIP_COST)+' data-locked="'+(fleet.ships>=shipCapacity(state))+'">Build ship</button>'+etaHTML(SHIP_COST)+'</div></section>')+
    ['fishing','exploration'].map(mission=>'<section class="job-row"><div><h3>'+ (mission==='fishing'?'Fishing ships':'Exploration ships')+'</h3><p>'+fleet.missions[mission]+' assigned · '+(mission==='fishing'?'+'+rateFmt(.3*multiplier(state,{type:'ship'}))+' fish/s per fully crewed ship':'Adds two explorers per fully crewed ship')+'</p></div><div class="job-controls"><button data-ship-mission="'+mission+'" data-ship-delta="-1" aria-label="Remove one '+mission+' ship">−</button><strong>'+fleet.missions[mission]+'</strong><button data-ship-mission="'+mission+'" data-ship-delta="1" aria-label="Assign one '+mission+' ship">+</button></div></section>').join('')+'<p class="worker-help">'+(fleet.ships-fleet.missions.fishing-fleet.missions.exploration)+' idle ships · '+Math.round(shipCrewing(state)*100)+'% crewed. Assign sailors in Workers.</p><button data-open-workers>Assign sailors</button>';
}
function technologyRows() {
  const isDone=id=>TECH[id].repeatable?mapSize(state)>=MAX_MAP_SIZE:state.tech.includes(id);
  const technologies = visibleTechnologies(state).filter(id => !hideResearched || !isDone(id));
  if (!technologies.length) return '<p class="research-empty">No research to show.</p>';
  return '<div class="research-list">' + technologies.map(id => {
    const t = TECH[id];
    const done = isDone(id), missing = researchRequirements(state,id), active = state.researching?.id === id;
    if (active) return '<button class="research-row research-active" data-speed-research="' + id + '" aria-label="Speed up ' + t.name + ' by 1 second" title="Click to reduce research time by 1 second">' +
      '<span class="research-summary"><strong>' + t.name + '</strong><span class="research-description">' + t.description + '</span>' +
      '<span class="research-progress"><progress max="' + state.researching.duration + '" value="' + (state.researching.duration-state.researching.remaining) + '" data-research-progress></progress>' +
      '<span data-research-remaining>' + timeFmt(researchRemaining(state)) + ' remaining</span></span></span><span class="research-click-hint">−1s / click</span></button>';
    return '<section class="research-row"><div><h3>' + t.name + '</h3><p>' + t.description + '</p>' +
      (missing.length && !done ? '<p class="prerequisite">Requires ' + missing.join(', ') + '</p>' : '') +
      (!done ? storageWarning(researchCost(id,state)) : '') + '</div>' + (done ? '<span class="done-label">Researched</span>' : '<div class="research-purchase"><span class="research-duration">' + timeFmt(researchDuration(state,id)/researchSpeed(state)) + '</span><div class="build-actions">' + costHTML(researchCost(id,state)) + '<button data-research="' + id + '" aria-label="Research ' + t.name + '" ' + needs(researchCost(id,state)) + ' data-locked="' + (missing.length ? 'true' : 'false') + '">Research</button></div>' + etaHTML(researchCost(id,state),id) + '</div>') +
      '</section>';
  }).join('') + '</div>';
}
function researchHTML() {
  return stockpilesHTML() + (state.meta.revolutions?'<p class="worker-help">Evolution '+(state.meta.revolutions+1)+' · '+(state.tech.includes('renaissance')?'Renaissance':state.tech.includes('guildCharters')?'Age of guilds':'Foundations')+'</p>':'') + '<div class="research-heading"><h1 class="page-title">Research</h1>' +
    '<button id="hide-researched" aria-pressed="' + hideResearched + '">Hide researched</button></div>' + (workerDemand(state,'researcher') ? '<p class="worker-summary">'+assignedWorkers(state,'researcher')+'/'+workerDemand(state,'researcher')+' researchers · '+rateFmt(researchSpeed(state))+'× research speed <button class="research-workers" data-open-workers>Assign researchers</button></p>':state.tech.includes('housing')?'<p class="worker-summary">Build a Study to assign researchers and speed up research.</p>':'') + technologyRows();
}
function tradeHTML() {
  return stockpilesHTML() + '<div class="market-heading"><h1 class="page-title">Market</h1><label>Quantity <select id="market-quantity">' + [10,50,100].map(n => '<option value="' + n + '" ' + (marketQuantity === n ? 'selected' : '') + '>' + n + '</option>').join('') + '</select></label></div>' +
    Object.keys(MARKET_PRICES).filter(k => visibleResources(state).includes(k) || k === 'brick' && state.tech.includes('pottery') || k === 'tool' && state.tech.includes('toolmaking') || k==='fish'&&state.tech.includes('fishing')).map(k =>
      '<section class="market-row"><h3>' + RESOURCE[k].name + '</h3>' + ['buy','sell'].map(direction => {
        const quote = marketQuote(k,direction,marketQuantity), coins = direction === 'buy' ? quote.cost.coin : quote.receive.coin;
        return '<div class="market-offer"><span>' + (direction === 'buy' ? 'Buy for ' : 'Sell for ') + rateFmt(coins) + ' coins</span><button data-market-resource="' + k + '" data-market-direction="' + direction + '" data-receive="' + escape(JSON.stringify(quote.receive)) + '" aria-label="' + (direction === 'buy' ? 'Buy ' : 'Sell ') + marketQuantity + ' ' + RESOURCE[k].name.toLowerCase() + '" ' + needs(quote.cost) + '>' + (direction === 'buy' ? 'Buy ' : 'Sell ') + marketQuantity + '</button>' + etaHTML(quote.cost,'',quote.receive) + '</div>';
      }).join('') + '</section>').join('');
}
function workersHTML() {
  const jobs = JOB_TYPES.filter(type => workerDemand(state,type));
  return stockpilesHTML() + '<h1 class="page-title">Workers</h1><p class="worker-summary">Population: ' + population(state) + ' / ' + capacity(state) + ' · ' + workers(state) + ' assigned · ' + idleWorkers(state) + ' idle</p><p class="population-growth" data-next-arrival></p>' +
    (stageIndex(state)>=1 ? '<label class="arrival-priority" for="arrival-job">New arrivals <select id="arrival-job"><option value="">Leave idle</option>' + jobs.map(type=>'<option value="'+type+'" '+(state.autoJob===type?'selected':'')+'>'+jobName(type)+'</option>').join('') + '</select></label>' : '') +
    (jobs.length ? '<div class="job-list">' + jobs.map(type => {
      const assigned = assignedWorkers(state,type), demand = workerDemand(state,type);
      const description=type==='researcher' ? assigned+'/'+demand+' researchers · +'+assigned*5+'% research speed' : type==='explorer'?assigned+'/'+demand+' explorers · one explorer needs 10 minutes per tile':type==='sailor'?assigned+'/'+demand+' sailors · two per active ship':count(state,type)+(count(state,type)===1?' building · ':' buildings · ')+assigned+'/'+demand+' workers · '+Math.round(staffing(state,type)*100)+'% staffed';
      return '<section class="job-row"><div><label for="workers-' + type + '">' + jobName(type) + '</label><p>' + description + '</p></div><div class="job-controls">' +
        '<button data-worker-type="' + type + '" data-worker-delta="-1" aria-label="Remove one worker from ' + jobName(type) + '">−</button>' +
        '<input type="number" inputmode="numeric" id="workers-' + type + '" data-worker-input="' + type + '" aria-label="Workers assigned to ' + jobName(type) + '" value="' + assigned + '" min="0" max="' + Math.min(demand,assigned+idleWorkers(state)) + '" step="1">' +
        '<button data-worker-type="' + type + '" data-worker-delta="1" aria-label="Assign one worker to ' + jobName(type) + '">+</button></div></section>';
    }).join('') + '</div>' : '<p class="research-empty">Build a logging camp to create jobs.</p>') +
    (workerDemand(state,'researcher')?'<p class="worker-help">Each researcher adds 5% research speed. Research slots: Study +2, academy +4. Researchers use residents separately from knowledge-producing jobs.</p>':'') + '<p class="worker-help">New residents arrive once per minute while there is room and enough wheat. Hamlet stage lets you choose a priority job for arrivals; otherwise they stay idle. Partially staffed jobs produce proportionally less.</p>';
}
function progressHTML() {
  const current=stageIndex(state), missing=wonderRequirements(state);
  return stockpilesHTML() + '<h1 class="page-title">Settlement progress</h1><div class="stage-current"><strong>' + STAGES[current].name + '</strong><span>' + STAGES[current].unlock + '</span></div>' +
    '<ol class="stage-list">' + STAGES.map((stage,i)=>'<li><div><h3>'+stage.name+'</h3><p>'+stage.unlock+'</p>'+(i>current?'<p class="stage-requirements">Requires '+stageRequirements(state,i).join(', ')+'</p>':'')+'</div><span>'+(i<current?'Reached':i===current?'Current':'Locked')+'</span></li>').join('') + '</ol>' +
    (current>=3 ? '<section class="wonder-section"><h2>'+WONDER_NAME+'</h2><div class="wonder-preview">'+wonderArt(state)+'<div><strong>'+wonderStatus(state)+'</strong><p>'+state.wonder.stage+' / '+wonderProjects(state).length+' stages complete</p></div></div><p class="worker-help">Complete the construction stages to unlock RE-Evolution. Later civilizations extend the Observatory into a Celestial Atlas. Research can continue during construction.</p>' +
      (missing.length?'<p class="capacity-warning">Requires '+missing.join(', ')+'.</p>':'') + wonderProjects(state).map((project,i)=> {
        const complete=i<state.wonder.stage, active=i===state.wonder.stage&&state.wonder.remaining>0, next=i===state.wonder.stage&&!active;
        return '<div class="wonder-row"><div><h3>'+(i+1)+'. '+project.name+'</h3><p>'+timeFmt(active?state.wonder.duration:wonderDuration(state,i))+' base construction</p>'+(active?'<progress class="wonder-progress" data-wonder-progress max="'+state.wonder.duration+'" value="'+(state.wonder.duration-state.wonder.remaining)+'"></progress><span class="cost-wait" data-wonder-remaining></span>':'')+'</div>'+
          (complete?'<span class="done-label">Complete</span>':active?wonderSuppliesHTML():'<div class="purchase-block">'+costHTML(project.cost)+(next?'<button id="start-wonder" '+needs(project.cost)+' data-locked="'+!!missing.length+'">Start stage</button>'+etaHTML(project.cost):'<span class="done-label">Complete previous stage</span>')+'</div>')+'</div>';
      }).join('') + (state.wonder.stage>=4?'<div class="reevolution-ready"><p>'+WONDER_NAME+' complete. '+(canReevolve(state)?'RE-Evolution awards '+evolutionQuote(state).total+' Evolution Points.':'Continue the Star catalogue and Celestial Atlas to unlock RE-Evolution.')+'</p><div class="completion-actions"><button data-observatory-animation>Show Observatory animation</button>'+(canReevolve(state)?'<button class="primary" data-reevolve>Review RE-Evolution</button>':'')+'</div></div>':'') + '</section>' : '') +
    (current<3?'<p class="worker-help">Develop a town to reveal the Great Observatory project. Completing this wonder unlocks RE-Evolution and permanent upgrades.</p>':'');
}
function wonderSuppliesHTML(){
  const quote=wonderBoostQuote(state);
  return '<div class="purchase-block wonder-supplies"><span class="done-label">'+rateFmt(wonderSpeed(state))+'× speed · '+state.wonder.boosts+'/'+MAX_WONDER_BOOSTS+' supply boosts</span>'+(quote?'<span class="research-duration">Extra supplies · next speed '+rateFmt(quote.nextSpeed)+'×</span>'+costHTML(quote.cost)+'<button data-boost-wonder="'+quote.stage+'" data-boost-level="'+quote.level+'" '+needs(quote.cost)+'>Fund extra supplies</button><span class="cost-wait" data-wonder-boost-preview></span>'+etaHTML(quote.cost):'<span class="done-label">Maximum speed for this stage</span>')+'</div>';
}
function achievementsHTML(){
  return '<h1 class="page-title">Achievements</h1><p class="worker-summary">'+state.meta.achievements.length+' / '+ACHIEVEMENTS.length+' earned · kept through RE-Evolution</p><p class="worker-help">Ten milestones for your first civilization. Optional goals can also be finished in later civilizations.</p><div class="achievement-list">'+ACHIEVEMENTS.map(a=>{
    const p=achievementProgress(state,a.id);
    return '<section class="achievement-row '+(p.earned?'earned':'')+'"><div><h3>'+a.name+'</h3><p>'+a.description+'</p><progress aria-label="'+a.name+' progress" data-achievement-progress="'+a.id+'" max="'+p.target+'" value="'+p.current+'"></progress></div><span data-achievement-status="'+a.id+'">'+(p.earned?'Earned':fmt(p.current)+' / '+p.target)+'</span></section>';
  }).join('')+'</div>';
}
function legacyHTML(){return constellationsHTML(state,selectedStar);}
function showEvolutionRewards(){if(state.meta.pendingEvolution)revealEvolution(state.meta.pendingEvolution,{open:dialog,finish:()=>{acknowledgeEvolution(state);page='legacy';save();$('#modal').close();render();}});}
function reviewReevolution() {
  if(!canReevolve(state)){toast('Complete every Observatory and Atlas stage first.');return;}
  dialog('<h2>Begin RE-Evolution?</h2><p>Your completed civilization earns <strong>'+evolutionQuote(state).total+' Evolution Points</strong> ('+evolutionQuote(state).base+' completion + '+evolutionQuote(state).collectionPoints+' collection tiers + '+evolutionQuote(state).itemPoints+' mementos). This run took '+runTimeFmt(state.elapsed)+'.</p><p>'+state.meta.achievements.length+' / 10 achievements earned. A new beginning unlocks when you restart; optional achievements can be earned later.</p><p><strong>Resets:</strong> resources, buildings, population, worker assignments, run research, the map and wonder construction.</p><p><strong>Keeps:</strong> achievements, collections, Evolution Points, constellation stars, permanent upgrades and completed-run history. Guilds, Renaissance research and the Celestial Atlas are available in the next civilization. A backup of this run will be available in Settings.</p><div class="dialog-actions"><button id="cancel-reevolve">Keep this civilization</button><button class="primary" id="confirm-reevolve">Begin next civilization</button></div>');
  $('#cancel-reevolve').onclick=()=>$('#modal').close();
  $('#confirm-reevolve').onclick=()=>{
    advance();
    if(!canReevolve(state)){toast('Complete the Great Observatory first.');return;}
    try {localStorage.setItem(BACKUP_KEY,serialize(state));}catch{toast('Backup unavailable. Export your save before restarting.');return;}
    const error=reevolve(state);if(error){toast(error);return;}
    lastTick=Date.now();latestAway=null;page='legacy';save();render();$('#modal').close();showEvolutionRewards();
  };
}
function render() {
  const unlocked=ACHIEVEMENTS.filter(a=>state.meta.achievements.includes(a.id)&&!knownAchievements.has(a.id));
  knownAchievements=new Set(state.meta.achievements);
  if(unlocked.length)toast(unlocked.length===1?'Achievement earned: '+unlocked[0].name:unlocked.length+' achievements earned.');
  if (page === 'research' && !researchUnlocked(state) || page === 'trade' && !tradeUnlocked(state) || page === 'workers' && !workersUnlocked(state)) page = 'settlement';
  const items=navigationItems(),primary=items.filter(([id])=>['settlement','research','workers'].includes(id)),secondary=items.filter(([id])=>!['settlement','research','workers'].includes(id));
  $('#navigation').innerHTML=items.map(([id,name])=>'<button data-page="'+id+'" class="'+(page===id?'active':'')+'" '+(page===id?'aria-current="page"':'')+'>'+name+'</button>').join('');
  $('#mobile-navigation').innerHTML=primary.map(([id,name])=>'<button data-page="'+id+'" class="'+(page===id?'active':'')+'" '+(page===id?'aria-current="page"':'')+'>'+navIcon(id)+'<span>'+name+'</span></button>').join('')+(secondary.length?'<button id="mobile-more" aria-haspopup="dialog" class="'+(secondary.some(([id])=>id===page)?'active':'')+'">'+navIcon('more')+'<span>More</span></button>':'');
  document.body.classList.toggle('has-mobile-navigation',items.length>0);
  $('#stage-label').hidden=!state.buildings.length; $('#stage-label').textContent=STAGES[stageIndex(state)].name;
  $('#journey-controls').hidden=!state.buildings.length&&!latestAway;
  $('#next-milestone').hidden=!state.buildings.length;
  $('#away-report').hidden=!latestAway;
  $('#game').className = page==='legacy'?'evolution-page':state.mapUnlocked?'':'early';
  $('#game').innerHTML = page === 'research' ? researchHTML() : page === 'trade' ? tradeHTML() : page === 'workers' ? workersHTML() : page==='fleet'?fleetHTML(): page==='progress'?progressHTML():page==='achievements'?achievementsHTML():page==='legacy'?legacyHTML():page==='collections'?collectionsHTML(state):page==='guilds'?guildsHTML(state):state.mapUnlocked ? settlementHTML() : earlyHTML();
  signature = uiSignature();
  bind();
  updateLive();
}
function updateLive() {
  for(const row of evolutionQuote(state).rows){const value=$('[data-collection-value="'+row.id+'"]'),bar=$('[data-collection-progress="'+row.id+'"]');if(value)value.textContent=fmt(row.value);if(bar)bar.value=row.value;}
  if (signature !== uiSignature()) { render(); return; }
  const r = rates(state);
  if($('#milestone-content'))$('#milestone-content').innerHTML=milestoneHTML();
  if($('#milestone-go'))$('#milestone-go').textContent=nextMilestone(state).action.label;
  $$('[data-achievement-progress]').forEach(el=>el.value=achievementProgress(state,el.dataset.achievementProgress).current);
  $$('[data-achievement-status]').forEach(el=>{const p=achievementProgress(state,el.dataset.achievementStatus);el.textContent=p.earned?'Earned':fmt(p.current)+' / '+p.target;});
  $$('[data-value]').forEach(el => el.textContent = resourceFmt(el.dataset.value,state.resources[el.dataset.value]));
  $$('[data-storage]').forEach(el => el.textContent = fmt(storageCapacity(state,el.dataset.storage)));
  $$('[data-rate]').forEach(el => {
    const k = el.dataset.rate, n = r[k];
    el.textContent = state.resources[k]>storageCapacity(state,k)+1e-9?'Over capacity':state.paused ? (state.buildings.length ? 'Paused' : '') :
      (state.resources[k] >= storageCapacity(state,k) - 1e-9 && n >= 0 ? 'Full' : !state.mapUnlocked && !count(state,'farm') ? '' : (n > 0 ? '+' : '') + rateFmt(n) + '/s');
  });
  $$('[data-needs]').forEach(btn => {
    btn.disabled = state.paused || btn.dataset.locked === 'true' || !affordable(state, JSON.parse(btn.dataset.needs)) ||
      (btn.dataset.receive && Object.entries(JSON.parse(btn.dataset.receive)).some(([k,n]) => state.resources[k] + n > storageCapacity(state,k) + 1e-9)) ||
      (btn.dataset.research && !!state.researching);
    if(btn.dataset.buildSpace&&!freeTile(state,btn.dataset.buildSpace))btn.disabled=true;
  });
  const exploreRate=explorationRate(state);
  $$('[data-exploration-eta]').forEach(el=>el.textContent=state.exploration.tiles.length===mapTileCount(state)?'Region fully explored.':state.paused?'Exploration paused':exploreRate>0?'Next tile in '+timeFmt((EXPLORATION_WORK-state.exploration.progress)/exploreRate):'Assign explorers to discover new tiles.');
  $$('[data-exploration-progress]').forEach(el=>el.value=state.exploration.progress);
  if(state.fleet.building){$$('[data-ship-progress]').forEach(el=>el.value=SHIP_DURATION-state.fleet.building.remaining);$$('[data-ship-remaining]').forEach(el=>el.textContent=timeFmt(state.fleet.building.remaining)+(state.paused?' · paused':' remaining'));}
  $$('[data-ship-mission]').forEach(btn=>btn.disabled=state.paused||(Number(btn.dataset.shipDelta)<0?state.fleet.missions[btn.dataset.shipMission]===0:state.fleet.missions.fishing+state.fleet.missions.exploration>=state.fleet.ships||btn.dataset.shipMission==='exploration'&&state.exploration.tiles.length===mapTileCount(state)));
  const arrival = nextArrival(state);
  $$('[data-next-arrival]').forEach(el => el.textContent = arrival === null ? 'Housing full · build a house for population growth.' : state.paused ? 'Population growth paused · '+timeFmt(arrival) : !foodSufficient(state) ? 'Growth paused · wheat supply is too low.' : 'Next resident in '+timeFmt(arrival));
  $$('[data-food-use]').forEach(el=>{el.textContent=foodText();el.dataset.foodBalance=foodState();});
  $$('[data-wait-cost]').forEach(el => {
    const id = el.dataset.waitResearch, cost = JSON.parse(el.dataset.waitCost);
    let result = estimateWait(state,cost);
    if (id && researchRequirements(state,id).length) { el.textContent = 'Requirements unmet'; return; }
    if (el.dataset.waitReceive && Object.entries(JSON.parse(el.dataset.waitReceive)).some(([k,n]) => state.resources[k] + n > storageCapacity(state,k) + 1e-9)) { el.textContent = 'Not enough storage'; return; }
    if (id && state.researching && ['ready','waiting'].includes(result.status)) result = { status: 'waiting', seconds: Math.max(result.seconds,researchRemaining(state)) };
    el.textContent = result.status === 'ready' ? 'Ready' : result.status === 'waiting' ? '≈ ' + timeFmt(result.seconds) + ' at current rates' : result.status === 'paused' ? 'Paused' : result.status === 'storage' ? 'Expand storage' : result.status === 'input' ? 'Needs ' + RESOURCE[result.resource].name.toLowerCase() + ' input' : result.resource ? 'No net ' + RESOURCE[result.resource].name.toLowerCase() + ' production' : 'Unavailable';
  });
  if (state.researching) {
    $$('[data-research-remaining]').forEach(el => el.textContent = timeFmt(researchRemaining(state)) + (state.paused ? ' · paused' : ' remaining'));
    $$('[data-research-progress]').forEach(el => el.value = state.researching.duration - state.researching.remaining);
  }
  if(state.wonder.remaining>0){$$('[data-wonder-progress]').forEach(el=>el.value=state.wonder.duration-state.wonder.remaining);$$('[data-wonder-remaining]').forEach(el=>el.textContent=timeFmt(wonderRemaining(state))+(state.paused?' · paused':' remaining'));const quote=wonderBoostQuote(state);if(quote){$$('[data-wonder-boost-preview]').forEach(el=>el.textContent=quote.saved<1?'Stage nearly complete':'Saves '+timeFmt(quote.saved)+' · '+timeFmt(quote.nextRemaining)+' remaining after boost');$$('[data-boost-wonder]').forEach(btn=>btn.disabled=state.paused||quote.saved<1||!affordable(state,quote.cost));}}
  if($('#arrival-job'))$('#arrival-job').disabled=state.paused;
  $$('[data-speed-research]').forEach(btn => btn.disabled = state.paused);
  $$('[data-star]').forEach(btn=>btn.onclick=()=>{selectedStar=btn.dataset.star;render();$('.star-node[data-star="'+selectedStar+'"]')?.focus();});
  $$('[data-buy-star]').forEach(btn=>btn.onclick=()=>act(()=>buyStar(state,btn.dataset.buyStar),'Permanent star unlocked.'));
  $$('[data-guild]').forEach(btn=>btn.onclick=()=>act(()=>setGuild(state,btn.dataset.guild||null)));
  $$('[data-evolution-reveal]').forEach(btn=>btn.onclick=showEvolutionRewards);
  $$('[data-legacy]').forEach(btn=>btn.disabled=state.paused||state.meta.upgrades[btn.dataset.legacy]>=5||state.meta.insight<legacyCost(state,btn.dataset.legacy));
  $$('[data-reevolve]').forEach(btn=>btn.disabled=state.paused);
  $$('[data-demolish-type]').forEach(btn=>btn.disabled=state.paused);
  if($('#confirm-demolition')){const[x,y]=$('#confirm-demolition').dataset.home.split(',').map(Number),quote=demolitionQuote(state,x,y),reason=quote?.reason||(!quote?'This home no longer exists.':'');$('#confirm-demolition').disabled=!!reason;$('#demolition-reason').textContent=reason;}
  $$('[data-cost-resource]').forEach(el => el.classList.toggle('short', state.resources[el.dataset.costResource] < Number(el.dataset.costAmount)));
  if ($('#harvest')) $('#harvest').disabled = state.paused || state.resources.wheat >= storageCapacity(state,'wheat') - 1e-9;
  $$('[data-worker-input]').forEach(input => input.disabled = state.paused);
  $$('[data-worker-delta]').forEach(btn => {
    const type = btn.dataset.workerType, amount = assignedWorkers(state,type);
    btn.disabled = state.paused || (Number(btn.dataset.workerDelta) < 0 ? amount <= 0 : amount >= workerDemand(state,type) || idleWorkers(state) <= 0);
  });
  $('#pause-button').textContent = state.paused ? 'Resume' : 'Pause';
}
function dialog(html) { $('#modal').classList.remove('observatory-dialog','evolution-dialog'); $('#modal-content').innerHTML = html; if (!$('#modal').open) $('#modal').showModal(); updateLive(); }
function milestoneHTML(){
  const milestone=nextMilestone(state);
  return '<h2>'+escape(milestone.title)+'</h2><p>'+escape(milestone.description)+'</p><ul class="milestone-list">'+milestone.requirements.map(r=>'<li class="'+(r.done?'met':'')+'"><span>'+escape(r.label)+'</span><strong>'+(r.kind==='research'?(r.done?'Complete':state.researching?.id===r.id?'Researching · '+timeFmt(researchRemaining(state)):'Not researched'):fmt(r.current)+' / '+fmt(r.target))+'</strong></li>').join('')+'</ul>'+(state.wonder.remaining>0?'<p>Construction: '+timeFmt(wonderRemaining(state))+' remaining'+(state.paused?' · paused':'')+'</p>':'')+'<p class="milestone-hint">'+escape(milestone.action.label)+'.</p>';
}
function showMilestone(){
  advance();dialog('<div id="milestone-content">'+milestoneHTML()+'</div><div class="dialog-actions"><button id="milestone-dismiss">Close</button><button class="primary" id="milestone-go"></button></div>');
  $('#milestone-dismiss').onclick=()=>$('#modal').close();
  $('#milestone-go').onclick=()=>{
    const action=nextMilestone(state).action;$('#modal').close();page=action.page;if(action.build)mobileSettlementView='buildings';render();
    if(action.build){const group=BUILD_GROUPS.find(g=>g.types.includes(action.build));if(group){buildGroupOpen[group.id]=true;render();}$('[data-build="'+action.build+'"]')?.closest('.build-row').scrollIntoView({block:'center'});}
    if(action.research){if(hideResearched&&state.tech.includes(action.research)){hideResearched=false;render();}($('[data-research="'+action.research+'"]')?.closest('.research-row')||$('[data-speed-research="'+action.research+'"]'))?.scrollIntoView({block:'center'});}
    if(action.page==='progress')$('.wonder-section')?.scrollIntoView({block:'start'});
  };
}
function showAway(){
  const report=latestAway;if(!report)return;
  const events=[...report.research.map(id=>'Research completed: '+TECH[id].name),...(report.survey?['Frontier surveying completed']:[]),...report.stages.map(name=>'Settlement reached '+name),...report.wonder.map(name=>'Observatory stage completed: '+name),...(report.residents?[report.residents+' new residents']:[]),...(report.tiles?[report.tiles+' tiles discovered']:[]),...(report.ships?[report.ships+' ships completed']:[]),...report.achievements.map(id=>'Achievement: '+ACHIEVEMENTS.find(a=>a.id===id).name)];
  const resourceRows=Object.entries(report.resources).filter(([,n])=>Math.abs(n)>=.01).map(([k,n])=>'<li><span>'+RESOURCE[k].name+'</span><strong>'+(n>0?'+':'−')+rateFmt(Math.abs(n))+'</strong></li>').join('');
  dialog('<h2>While you were away</h2><p>'+runTimeFmt(report.seconds)+' away'+(report.capped?' · progress capped at 8 hours':'')+'. '+(report.paused?'Your game was paused; no progress was added.':'Progress has been added to your settlement.')+'</p>'+(events.length?'<ul class="away-events">'+events.map(text=>'<li>'+escape(text)+'</li>').join(''):'<p>No projects finished during this time.</p>')+(resourceRows?'<h3>Net resource change</h3><ul class="milestone-list">'+resourceRows+'</ul><p>Includes food consumption and production inputs.</p>':'')+(report.full.length?'<p><strong>Storage reached capacity:</strong> '+report.full.map(k=>RESOURCE[k].name).join(', ')+'. Expand storage or spend goods to keep production moving.</p>':'')+(report.hunger>=1?'<p class="capacity-warning">Population growth was held up by food shortages for '+timeFmt(report.hunger)+'.</p>':'')+(canReevolve(state)?'<p>The Observatory is ready. Its animation waits for you in Progress.</p>':'')+'<div class="dialog-actions"><button id="away-dismiss" class="primary">Continue</button></div>');
  $('#away-dismiss').onclick=()=>$('#modal').close();
}
function showObservatoryAnimation(){
  if(state.wonder.stage<4)return;
  dialog(observatoryAnimationHTML());$('#modal').classList.add('observatory-dialog');$('#modal-close').focus();
  $('#observation-summary').onclick=showRunSummary;
}
function showRunSummary(){
  if(state.wonder.stage<4)return;
  dialog('<h2>Your first observation</h2><p>The Great Observatory is complete.</p><div class="run-summary">'+[['Civilization',state.name],['Time',runTimeFmt(state.elapsed)],['Residents',fmt(population(state))],['Buildings',fmt(state.buildings.length)],['Tiles explored',fmt(state.exploration.tiles.length)],['Achievements',state.meta.achievements.length+' / '+ACHIEVEMENTS.length],['RE-Evolution reward',evolutionQuote(state).total+' Evolution Points']].map(([label,value])=>'<div class="detail-stat"><span>'+label+'</span><strong>'+escape(value)+'</strong></div>').join('')+'</div><p>Begin another civilization with permanent production, storage or research upgrades. The next civilization unlocks guild specializations and Renaissance research, leading to the Celestial Atlas.</p><div class="dialog-actions"><button id="replay-observation">Replay</button><button id="summary-return">Return</button><button class="primary" id="summary-reevolve" '+(canReevolve(state)?'':'disabled')+'>Review RE-Evolution</button></div>');
  $('#replay-observation').onclick=showObservatoryAnimation;$('#summary-return').onclick=()=>$('#modal').close();$('#summary-reevolve').onclick=reviewReevolution;
}
function reviewDemolition(x,y){
  advance();const quote=demolitionQuote(state,x,y);if(!quote){toast('This home no longer exists.');return;}
  dialog('<h2>Demolish '+BUILDINGS[quote.type].name.toLowerCase()+'?</h2><p>Return <strong>25% of the original construction cost</strong>: '+costText(quote.refund)+'.</p><p>Housing: '+capacity(state)+' → '+quote.capacityAfter+' spaces.</p><p class="capacity-warning" id="demolition-reason">'+escape(quote.reason||'')+'</p><div class="dialog-actions"><button id="cancel-demolition">Cancel</button><button class="danger" id="confirm-demolition" data-home="'+x+','+y+'">Demolish '+BUILDINGS[quote.type].name.toLowerCase()+'</button></div>');
  $('#cancel-demolition').onclick=()=>$('#modal').close();
  $('#confirm-demolition').onclick=()=>{if(act(()=>demolishHome(state,x,y),BUILDINGS[quote.type].name+' demolished.'))$('#modal').close();};
}
function tileAction(x,y) {
  const b=state.buildings.find(b=>b.x===x&&b.y===y);
  if(b&&isHome(b.type)){reviewDemolition(x,y);return;}
  if(b)toast(BUILDINGS[b.type].name+' · '+productionText(b.type));
}
function bind() {
  if($('#mobile-more'))$('#mobile-more').onclick=showMore;
  if($('.resource-toggle'))$('.resource-toggle').onclick=()=>{resourcesExpanded=!resourcesExpanded;$('.resource-panel').classList.toggle('expanded',resourcesExpanded);$('.resource-toggle').setAttribute('aria-expanded',String(resourcesExpanded));$('[data-resource-toggle-label]').innerHTML=(resourcesExpanded?'Show less':'Show all')+' <span aria-hidden="true">⌄</span>';};
  $$('[data-settlement-view]').forEach(btn=>btn.onclick=()=>{mobileSettlementView=btn.dataset.settlementView;$('.settlement-layout').dataset.mobileView=mobileSettlementView;$$('[data-settlement-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.settlementView===mobileSettlementView)));});
  $$('[data-map-zoom]').forEach(btn=>btn.onclick=()=>{mapZoom=Math.max(1,Math.min(3,mapZoom+Number(btn.dataset.mapZoom)*.5));$('.map-frame').style.setProperty('--map-zoom',mapZoom);$('[data-map-scale]').textContent=Math.round(mapZoom*100)+'%';$$('[data-map-zoom]').forEach(b=>b.disabled=Number(b.dataset.mapZoom)<0?mapZoom===1:mapZoom===3);});
  $$('[data-observatory-animation]').forEach(btn=>btn.onclick=showObservatoryAnimation);
  $$('[data-storage-research]').forEach(btn=>btn.onclick=()=>{page='research';render();$('[data-research="warehousing"]')?.closest('.research-row').scrollIntoView({block:'center'});});
  $$('[data-open-wonder]').forEach(el=>{el.onclick=()=>{page='progress';render();$('.wonder-section')?.scrollIntoView({block:'start'});};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.onclick();}};});
  $$('[data-demolish-type]').forEach(btn=>btn.onclick=()=>{const homes=state.buildings.filter(b=>b.type===btn.dataset.demolishType),home=homes[homes.length-1];if(home)reviewDemolition(home.x,home.y);});
  $$('[data-build-group]').forEach(group=>group.ontoggle=()=>{if(!group.isConnected)return;buildGroupOpen[group.dataset.buildGroup]=group.open;try{localStorage.setItem(GROUPS_KEY,JSON.stringify(buildGroupOpen));}catch{}});
  $$('[data-frontier-research]').forEach(btn=>btn.onclick=()=>{page='research';render();});
  if($('#build-ship'))$('#build-ship').onclick=()=>act(()=>startShip(state));
  $$('[data-ship-mission]').forEach(btn=>btn.onclick=()=>act(()=>assignShips(state,btn.dataset.shipMission,state.fleet.missions[btn.dataset.shipMission]+Number(btn.dataset.shipDelta))));
  $$('[data-page]').forEach(btn => btn.onclick = () => navigatePage(btn.dataset.page));
  $$('[data-open-workers]').forEach(btn => btn.onclick = () => navigatePage('workers'));
  if($('#arrival-job'))$('#arrival-job').onchange=()=>act(()=>setArrivalJob(state,$('#arrival-job').value||null));
  if($('#start-wonder'))$('#start-wonder').onclick=()=>act(()=>startWonder(state));
  $$('[data-boost-wonder]').forEach(btn=>btn.onclick=()=>act(()=>boostWonder(state,Number(btn.dataset.boostWonder),Number(btn.dataset.boostLevel)),'Extra construction supplies funded.'));
  $$('[data-reevolve]').forEach(btn=>btn.onclick=reviewReevolution);
  $$('[data-legacy]').forEach(btn=>btn.onclick=()=>act(()=>buyLegacy(state,btn.dataset.legacy)));
  $$('[data-worker-delta]').forEach(btn => btn.onclick = () => {
    const type = btn.dataset.workerType;
    act(() => assignWorkers(state,type,assignedWorkers(state,type)+Number(btn.dataset.workerDelta)));
  });
  $$('[data-worker-input]').forEach(input => input.onchange = () => {
    const type = input.dataset.workerInput, amount = Number(input.value);
    if (!input.value.trim()) { input.value = assignedWorkers(state,type); return; }
    if (!act(() => assignWorkers(state,type,amount))) input.value = assignedWorkers(state,type);
  });
  $$('[data-worker-input]').forEach(input => input.onkeydown = e => {if(e.key==='Enter'){e.preventDefault();input.onchange();}});
  if ($('#hide-researched')) $('#hide-researched').onclick = () => {
    hideResearched = !hideResearched;
    try { localStorage.setItem(RESEARCH_FILTER_KEY,String(hideResearched)); } catch {}
    render();
    $('#hide-researched').focus();
  };
  if ($('#harvest')) $('#harvest').onclick = () => {
    advance();
    const error = harvest(state);
    if (error) { toast(error); return; }
    save(); updateLive();
  };
  $$('[data-build]').forEach(btn=>btn.onclick=()=>act(()=>build(state,btn.dataset.build)));
  $$('[data-research]').forEach(btn => btn.onclick = () => act(() => research(state,btn.dataset.research)));
  $$('[data-speed-research]').forEach(btn => btn.onclick = () => {
    advance();
    const error = speedResearch(state,btn.dataset.speedResearch);
    if (!error) save();
    updateLive();
  });
  if ($('#market-quantity')) $('#market-quantity').onchange = () => { marketQuantity = Number($('#market-quantity').value); render(); };
  $$('[data-market-resource]').forEach(btn => btn.onclick = () => act(() => marketTrade(state,btn.dataset.marketResource,btn.dataset.marketDirection,marketQuantity)));
  $$('.tile').forEach(el => {
    el.onclick = () => tileAction(+el.dataset.x,+el.dataset.y);
    el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tileAction(+el.dataset.x,+el.dataset.y); } };
  });
}
function settings() {
  let backupAvailable=false;
  try { backupAvailable=!!localStorage.getItem(BACKUP_KEY); } catch {}
  dialog('<h2>Settings</h2>' +
    (state.mapUnlocked ? '<label class="settings-label" for="settlement-name">Settlement name</label><input type="text" id="settlement-name" maxlength="24" value="' + escape(state.name) + '"><div class="dialog-actions"><button id="rename">Save name</button></div><hr class="settings-separator">' : '') +
    '<div class="settings-buttons"><button id="export-save">Export save</button><button id="import-save">Import save</button><input type="file" id="import-file" accept=".json,application/json" hidden></div>' +
    '<p>Progress saves in this browser. Offline production is capped at 8 hours.</p>' +
    '<div class="settings-feedback">'+feedbackLinkHTML()+'</div>' +
    (backupAvailable?'<button class="secondary" id="export-backup">Export previous civilization</button>':'') +
    '<hr class="settings-separator"><button class="danger" id="new-game">Reset current run</button>');
  if ($('#rename')) $('#rename').onclick = () => {
    const name = $('#settlement-name').value.trim();
    if (!name) { toast('Enter a name.'); return; }
    state.name = name; save(); render(); $('#modal').close();
  };
  $('#export-save').onclick = () => {
    advance();
    const url = URL.createObjectURL(new Blob([serialize(state)],{type:'application/json'})), link = document.createElement('a');
    link.href = url; link.download = 'cividle-enhanced-save.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  };
  $('#import-save').onclick = () => $('#import-file').click();
  if($('#export-backup'))$('#export-backup').onclick=()=>{const raw=localStorage.getItem(BACKUP_KEY);if(!raw)return;const url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='cividle-enhanced-previous-civilization.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  $('#import-file').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1000000) { toast('Save file is too large.'); return; }
    let result;
    try { result = restore(await file.text()); } catch {}
    if (!result) { toast('Invalid save. Import a save from the wheat-start version.'); return; }
    dialog('<h2>Import save?</h2><p>This replaces the current game. Export a backup first if you want to keep it.</p><div class="dialog-actions"><button id="cancel-import">Cancel</button><button class="primary" id="confirm-import">Import</button></div>');
    $('#cancel-import').onclick = () => $('#modal').close();
    $('#confirm-import').onclick = () => { state = result.state; latestAway=result.away?.seconds>=60?result.away:null; page = 'settlement'; lastTick = Date.now(); save(); render(); $('#modal').close(); if(latestAway)showAway(); };
  };
  $('#new-game').onclick = () => {
    dialog('<h2>Reset this run?</h2><p>Your settlement will be replaced. Evolution Points, collections, stars, upgrades and completed-run history are kept. This reset awards no points. Export a backup first if you want to keep this settlement.</p><div class="dialog-actions"><button id="cancel-reset">Cancel</button><button class="danger" id="confirm-reset">Start over</button></div>');
    $('#cancel-reset').onclick = () => $('#modal').close();
    $('#confirm-reset').onclick = () => { state = fresh(Date.now(),state.meta); latestAway=null; lastTick = Date.now(); page = 'settlement'; save(); render(); $('#modal').close(); };
  };
}

$('#settings-button').onclick = settings;
$('#next-milestone').onclick=showMilestone;
$('#away-report').onclick=showAway;
$('#pause-button').onclick = () => { advance(); state.paused = !state.paused; save(); updateLive(); };
$('.brand').onclick = e => { e.preventDefault(); page = 'settlement';  render(); };
$('#modal-close').onclick = () => $('#modal').close();
render();
setInterval(() => {
  if(document.hidden||awayStarted!==null)return;
  advance(); updateLive();
  if (++saveTime >= 10) { save(); saveTime = 0; }
},500);
window.addEventListener('pagehide',()=>{if(awayStarted!==null){try{localStorage.setItem(SAVE_KEY,serialize(state,awayStarted));}catch{}}else{advance();save();}});
document.addEventListener('visibilitychange',()=>{
  document.documentElement.classList.toggle('tab-hidden',document.hidden);
  if(document.hidden){if(awayStarted===null){advance();save();awayStarted=Date.now();}return;}
  if(awayStarted===null)return;
  const seconds=Math.max(0,(Date.now()-awayStarted)/1000),report=advanceAway(state,seconds);
  awayStarted=null;lastTick=Date.now();if(seconds>=60)latestAway=report;save();render();if(seconds>=60&&!$('#modal').open)showAway();
});
if(latestAway&&!document.hidden)showAway();
