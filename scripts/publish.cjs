const fs = require('node:fs/promises');
const path = require('node:path');

// Keep exactly the previous release's hashed scripts/styles. A cached HTML
// document or a restored browser tab can still request those after deployment.
async function retainPreviousAssets(git) {
  const read=async asset=>{await git.exec('show','HEAD:'+asset);return git.output;};
  let manifest;
  try { manifest=JSON.parse(await read('asset-manifest.json')); }
  catch { return 0; } // First publication has no prior manifest.
  const assets=new Set(Object.values(manifest.files || {}).filter(value=>
    typeof value==='string' && /^\/static\/(js|css)\/[\w.-]+\.(js|css)$/.test(value)
  ).map(value=>value.slice(1)));
  for(const asset of [...assets])if(asset.endsWith('.js'))assets.add(asset+'.LICENSE.txt');
  let retained=0;
  for(const asset of assets){
    const destination=path.join(git.cwd,asset);
    try { await fs.access(destination);continue; } catch { /* Missing from new build. */ }
    let contents;
    try { contents=await read(asset); }
    catch(error){if(asset.endsWith('.LICENSE.txt'))continue;throw error;}
    await fs.mkdir(path.dirname(destination),{recursive:true});
    await fs.writeFile(destination,contents);retained++;
  }
  return retained;
}

if(require.main===module){
  require('gh-pages').publish(path.resolve(process.argv[2] || 'build'),{
    branch:'gh-pages',message:process.argv[3] || 'Publish portfolio',
    beforeAdd:async git=>console.log(`Retained ${await retainPreviousAssets(git)} previous release assets for cached tabs.`),
  },error=>{if(error){console.error(error);process.exitCode=1;}else console.log('Published');});
}
module.exports={retainPreviousAssets};
