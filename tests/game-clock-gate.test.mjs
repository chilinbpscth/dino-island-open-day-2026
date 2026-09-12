import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ActiveClock} from '../shared/core.js';
import {GameClockGate} from '../shared/game-clock-gate.js';
function setup(){let time=0,total=0;const clock=new ActiveClock(ms=>total+=ms,()=>time),gate=new GameClockGate(clock);return {gate,advance:ms=>{time+=ms;clock.checkpoint();},total:()=>total};}
test('Permission wait survives hide/show and excluded time is never added',()=>{const s=setup(),game=s.gate.begin();s.advance(100);game.pause();s.advance(2000);s.gate.setVisible(false);s.advance(1000);s.gate.setVisible(true);s.advance(1000);assert.equal(s.total(),100);game.resume();s.advance(300);assert.equal(s.total(),400);});
test('Independent loading reasons all have to finish, duplicate resume is harmless',()=>{const s=setup(),game=s.gate.begin();game.pause('camera');game.pause('model');game.resume('camera');game.resume('camera');s.advance(500);assert.equal(s.total(),0);game.resume('model');s.advance(200);assert.equal(s.total(),200);});
test('Late callbacks from a replaced game cannot alter the current game timer',()=>{const s=setup(),old=s.gate.begin();old.pause();const next=s.gate.begin();next.pause();old.resume();s.advance(1000);assert.equal(s.total(),0);next.resume();s.advance(100);old.pause();s.advance(100);assert.equal(s.total(),200);s.gate.end();next.resume();s.advance(1000);assert.equal(s.total(),200);});
test('Releasing a wait in background does not resume until visible',()=>{const s=setup(),game=s.gate.begin();game.pause();s.gate.setVisible(false);game.resume();s.advance(1000);assert.equal(s.total(),0);s.gate.setVisible(true);s.advance(100);assert.equal(s.total(),100);});
