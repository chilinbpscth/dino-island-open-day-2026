import test from 'node:test';import assert from 'node:assert/strict';
import {runSequence,SEQUENCE_LEVELS} from '../shared/sequence.js';
test('All puzzles are solvable with at most three preplanned commands',()=>{for(const level of SEQUENCE_LEVELS){assert(level.solution.length<=3);assert(runSequence(level,level.solution).success);}});
test('Turns use robot heading, not absolute screen direction',()=>{const level=SEQUENCE_LEVELS[1];const r=runSequence(level,['right','forward']);assert.deepEqual(r.position,{x:2,y:2,heading:1});assert.equal(r.success,false);});
test('Walking into a rock stops but jumping over it reaches the egg',()=>{const level=SEQUENCE_LEVELS[2];assert(runSequence(level,['left','forward']).blocked);assert(runSequence(level,['left','jump']).success);assert(!runSequence(level,[]).success);});
test('Bounds stop motion and input level is never mutated',()=>{const level=SEQUENCE_LEVELS[0],before=structuredClone(level);assert(runSequence(level,['left','forward','forward','forward']).blocked);assert.deepEqual(level,before);});
