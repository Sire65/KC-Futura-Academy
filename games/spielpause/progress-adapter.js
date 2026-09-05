const TRAINING_PROFILE_KEY='kc_training_profile_v0254';

export function readTrainingProgress(storage=globalThis.localStorage){
  try{
    const profile=JSON.parse(storage?.getItem?.(TRAINING_PROFILE_KEY)||'{}');
    const modules=['quick','advanced','practice'].map(key=>Math.max(0,Math.min(100,Number(profile[key])||0)));
    const overall=Math.round(modules.reduce((sum,value)=>sum+value,0)/modules.length);
    return Object.freeze({overall,trainingComplete:modules.every(value=>value===100)});
  }catch{return Object.freeze({overall:0,trainingComplete:false})}
}
