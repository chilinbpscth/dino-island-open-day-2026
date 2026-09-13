import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,cp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

test('Rebuilding removes withdrawn assets from the generated package',async()=>{
 const root=await mkdtemp(path.join(tmpdir(),'dino-build-'));
 try{
  for(const dir of ['scripts','hub','board','setup','shared'])await mkdir(path.join(root,dir));
  await cp(new URL('../scripts/build.mjs',import.meta.url),path.join(root,'scripts/build.mjs'));
  await writeFile(path.join(root,'index.html'),'<p>island</p>');
  const withdrawn=path.join(root,'hub/withdrawn.png');await writeFile(withdrawn,'test asset');
  const build=()=>execFileSync(process.execPath,[path.join(root,'scripts/build.mjs')]);
  build();await access(path.join(root,'dist/hub/withdrawn.png'));
  await rm(withdrawn);build();
  await assert.rejects(access(path.join(root,'dist/hub/withdrawn.png')),{code:'ENOENT'});
  const manifest=JSON.parse(await readFile(path.join(root,'dist/asset-manifest.json'),'utf8'));
  assert.ok(!manifest.assets.includes('hub/withdrawn.png'));
  assert.match(await readFile(path.join(root,'dist/index.html'),'utf8'),/island/);
 }finally{await rm(root,{recursive:true,force:true});}
});
