// Migrate only unfinished content when that subject's replacement is enabled.
export function prepareGameState(zone,contentVersion){
 if(zone.complete)return {state:zone.game,reset:false};
 const prior=zone.game,reset=!!prior&&Object.keys(prior).length>0&&prior.contentVersion!==contentVersion;
 if(!prior||prior.contentVersion!==contentVersion)zone.game={contentVersion,round:0};
 return {state:zone.game,reset};
}

// Two failed attempts reveal a hint; a third enables guided completion.
export function hintLevel(attempts){return attempts>=3?'guided':attempts>=2?'hint':'retry';}
