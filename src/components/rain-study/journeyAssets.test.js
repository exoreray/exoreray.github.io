import fs from 'fs';
import path from 'path';
import { journeyScenes } from './journeyScenes';

const refreshedChapters=[0,1,2,3,5];

test.each(refreshedChapters)('chapter %i has a complete, compact standalone GLB',index=>{
  const asset=journeyScenes[index].asset;
  const file=fs.readFileSync(path.resolve(__dirname,'../../../public',asset.slice(1)));
  expect(file.readUInt32LE(0)).toBe(0x46546c67);
  expect(file.readUInt32LE(4)).toBe(2);
  expect(file.readUInt32LE(8)).toBe(file.length);
  const racing=journeyScenes[index].kind==='racing';
  expect(file.length).toBeLessThan(racing?6000000:journeyScenes[index].authored?4500000:2500000);
  const gltf=JSON.parse(file.toString('utf8',20,20+file.readUInt32LE(12)));
  expect(gltf.buffers.every(buffer=>!buffer.uri)).toBe(true);
  expect((gltf.images || []).every(image=>image.bufferView!==undefined)).toBe(true);
  expect(gltf.extensionsRequired || []).not.toContain('KHR_draco_mesh_compression');
  const triangles=gltf.meshes.reduce((sum,mesh)=>sum+mesh.primitives.reduce((count,p)=>count+(gltf.accessors[p.indices??p.attributes.POSITION].count/3),0),0);
  expect(triangles).toBeGreaterThan(100);
  expect(triangles).toBeLessThan(racing?130000:journeyScenes[index].authored?110000:65000);
});
