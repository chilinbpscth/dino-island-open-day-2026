import {test} from 'node:test';import assert from 'node:assert/strict';import {PoseActions} from '../shared/pose-actions.js';
const head=(x=.5,y=.4)=>[[{x,y,visibility:.8,presence:.8}]];
const ready=()=>{const t=new PoseActions();for(let n=0;n<=600;n+=100)t.update(head(),n);return t;};
for(const [command,x,y] of [['left',.55,.4],['right',.45,.4],['sit',.5,.45],['jump',.5,.35],['hands',.5,.35],['stand',.5,.4],['freeze',.5,.4]])test(command+' accepts head-only landmarks',()=>{const t=ready();t.setCommand(command);let r;for(let n=700;n<=1700;n+=100)r=t.update(head(x,y),n);assert.equal(r.status,'success');});
test('tiny jitter does not complete directional movement',()=>{const t=ready();t.setCommand('left');for(let n=700;n<2000;n+=100)assert.notEqual(t.update(head(.51,.4),n).status,'success');});
test('no person and multiple people never complete',()=>{const t=ready();t.setCommand('freeze');assert.equal(t.update([],700).status,'no-person');assert.equal(t.update([...head(),...head()],800).status,'multiple');});
test('missing frame clears held movement',()=>{const t=ready();t.setCommand('left');t.update(head(.55),700);t.update([],800);assert.equal(t.update(head(.55),900).progress,0);});

test('opposite direction is rejected',()=>{for(const [command,x] of [['left',.45],['right',.55]]){const t=ready();t.setCommand(command);for(let n=700;n<2000;n+=100)assert.notEqual(t.update(head(x),n).status,'success');}});
test('low confidence nose prevents calibration',()=>{const t=new PoseActions();const h=head();h[0][0].visibility=.2;assert.equal(t.update(h,0).status,'unclear');assert.equal(t.baseline,null);});
test('slow head drift is not freeze',()=>{const t=ready();t.setCommand('freeze');let r;for(let n=0;n<15;n++)r=t.update(head(.5+n*.009),700+n*100);assert.notEqual(r.status,'success');});
test('long frame gap cannot finish hold',()=>{const t=ready();t.setCommand('freeze');t.update(head(),700);assert.equal(t.update(head(),3000).progress,0);});
