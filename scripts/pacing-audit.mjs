import {simulateFirstRun} from './balance-run.mjs';
const scenarios=[
  ['Reference',{}],
  ['Human-paced harvests',{harvestInterval:.35}],
  ['Early researchers',{researchers:true,harvestInterval:.35}],
  ['Managed forests',{managedForests:true,harvestInterval:.35}],
  ['Optional fishing fleet',{shipping:true,harvestInterval:.35}],
  ['Available supply boosts',{supplies:true,harvestInterval:.35}],
  ['15-minute check-ins',{checkIn:900,harvestInterval:.35}],
];
const results=[];
for(const [name,options] of scenarios){
  try{
    const run=simulateFirstRun(()=>{},null,options);
    const at=label=>run.timeline.find(x=>x.label===label)?.minutes??null;
    const result={name,hours:+(run.state.elapsed/3600).toFixed(2),mapping:at('map'),town:at('Town'),city:at('City'),harvests:run.diagnostics.harvests,foodBlockedMinutes:+(run.diagnostics.foodBlocked/60).toFixed(1),longestMaterialWaits:run.waits.sort((a,b)=>b.seconds-a.seconds).slice(0,5).map(x=>({label:x.label,minutes:+(x.seconds/60).toFixed(1)})),fullStorageMinutes:Object.fromEntries(Object.entries(run.diagnostics.fullSeconds).map(([k,n])=>[k,+(n/60).toFixed(1)])),timeline:run.timeline};
    results.push(result);console.log(JSON.stringify(result));
  }catch(error){results.push({name,error:error.message});console.log(JSON.stringify(results.at(-1)));process.exitCode=1;}
}
