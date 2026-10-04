const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const os=require('node:os');
const path=require('node:path');
const {retainPreviousAssets}=require('./publish.cjs');

test('keeps prior hashed code and licenses, without overwriting new code or copying other paths',async()=>{
  const cwd=await fs.mkdtemp(path.join(os.tmpdir(),'site-release-test-'));
  try {
    await fs.mkdir(path.join(cwd,'static/js'),{recursive:true});
    await fs.writeFile(path.join(cwd,'static/js/shared.123.js'),'current');
    const previous={
      'asset-manifest.json':JSON.stringify({files:{main:'/static/js/main.old.js',style:'/static/css/main.old.css',shared:'/static/js/shared.123.js',outside:'/../../secret',image:'/profile.jpeg'}}),
      'static/js/main.old.js':'previous main',
      'static/css/main.old.css':'previous css',
      'static/js/main.old.js.LICENSE.txt':'license',
    };
    const reads=[];
    const git={cwd,exec:async(command,ref)=>{
      assert.equal(command,'show');reads.push(ref);
      const value=previous[ref.slice(5)];if(value===undefined)throw new Error('not present');git.output=value;return git;
    }};
    const count=await retainPreviousAssets(git);
    assert.equal(count,3);
    assert.equal(await fs.readFile(path.join(cwd,'static/js/shared.123.js'),'utf8'),'current');
    assert.equal(await fs.readFile(path.join(cwd,'static/js/main.old.js'),'utf8'),'previous main');
    assert.ok(!reads.some(ref=>ref.includes('secret') || ref.includes('profile.jpeg')));
    assert.ok(!reads.includes('HEAD:static/js/shared.123.js'));
  }finally{await fs.rm(cwd,{recursive:true,force:true});}
});
