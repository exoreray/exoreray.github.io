const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');const photos=require('../src/data/photographs.json');const approved=require('../src/data/approvedPhotographyMedia.json');
const fail=message=>{throw new Error('Photography privacy check: '+message);};
for(const blocked of ['public/photography','public/profile.jpeg','public/graduation cover.png','src/assets/profile.png','src/assets/profile2.png','src/assets/profile3.png'])if(fs.existsSync(path.join(root,blocked)))fail('withdrawn media path restored: '+blocked);
const used=new Set();
for(const p of photos){
 if(!p.privacyReviewed || p.category==='Portraits' || p.subjects?.includes('People'))fail('unreviewed or person-tagged item: '+p.id);
 for(const key of ['src','full','atlasSrc','videoSrc'])if(p[key]){
  const url=p[key];if(!url.startsWith('/photography-reviewed/')||!approved[url])fail('unapproved URL: '+url);
  const file=path.join(root,'public',url);if(!fs.existsSync(file))fail('missing file: '+url);
  const sha=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');if(sha!==approved[url].sha256)fail('content changed since privacy review: '+url);used.add(url);
 }
}
const reviewed=path.join(root,'public/photography-reviewed');if(fs.existsSync(reviewed))for(const file of fs.readdirSync(reviewed))if(!used.has('/photography-reviewed/'+file))fail('unreferenced file: '+file);
if(process.argv[2]){const output=path.resolve(process.argv[2]);for(const old of ['photography','profile.jpeg','graduation cover.png'])if(fs.existsSync(path.join(output,old)))fail('withdrawn files in publish output: '+old);for(const url of used){const f=path.join(output,url);if(!fs.existsSync(f))fail('missing output asset: '+url);const hash=crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');if(hash!==approved[url].sha256)fail('unapproved output bytes: '+url);}const folder=path.join(output,'photography-reviewed');if(fs.existsSync(folder))for(const f of fs.readdirSync(folder))if(!used.has('/photography-reviewed/'+f))fail('unapproved output file: '+f);}
console.log('Privacy check passed: '+photos.length+' reviewed works, '+used.size+' approved media files.');
