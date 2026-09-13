import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareGameState,hintLevel} from '../shared/game-state.js';

test('Unfinished old gameplay restarts without changing score or accumulated time',()=>{
 const zone={ms:12345,complete:false,game:{round:2,step:1}};
 assert.deepEqual(prepareGameState(zone,2),{state:{contentVersion:2,round:0},reset:true});
 assert.equal(zone.ms,12345);assert.equal(zone.complete,false);
 zone.game.round=1;
 assert.equal(prepareGameState(zone,2).reset,false);assert.equal(zone.game.round,1);
});
test('Completed old content is preserved exactly',()=>{
 const zone={complete:true,ms:180000,game:{round:3}},before=structuredClone(zone);
 assert.equal(prepareGameState(zone,2).reset,false);assert.deepEqual(zone,before);
});
test('Fresh content starts without an update warning and hints increase after retries',()=>{
 assert.equal(prepareGameState({game:{}},2).reset,false);
 assert.deepEqual([0,1,2,3,10].map(hintLevel),['retry','retry','hint','guided','guided']);
});
