const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const os=require('node:os');const path=require('node:path');const {spawnSync}=require('node:child_process');
test('a stale deployment containing withdrawn photography is rejected',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'photography-privacy-check-'));
 try{fs.mkdirSync(path.join(temp,'photography'));const result=spawnSync(process.execPath,[path.join(__dirname,'check-photography-privacy.cjs'),temp],{encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/withdrawn files in publish output/);}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
