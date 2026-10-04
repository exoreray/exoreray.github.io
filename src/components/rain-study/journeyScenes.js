export const journeyScenes = [
  { label: 'Wangjing', kind:'campus', authored:true, asset: '/models/journey-wangjing-campus.glb', rotation: [0,0,0] },
  { label: 'Architecture', asset: '/models/journey-parametric-structure.glb', rotation: [0, -.15, 0], size: 5.2 },
  { label: 'Berkeley', kind:'campus', authored:true, asset: '/models/journey-berkeley-campus.glb', rotation: [0,0,0] },
  { label: 'F1', kind: 'racing', asset: '/models/journey-racing-car.glb', rotation: [0, 0, 0], size: .9 },
  { label: 'FlowGPT', kind: 'growth' },
  { label: 'Apple', kind: 'apple-park', asset: '/models/journey-apple-park.glb', rotation: [0, -.15, 0], size: 4.6 },
  { label: 'Community', kind: 'network' },
  { label: 'Livia', kind: 'soul-orb' },
];
export const wrapChapter = index => (index % journeyScenes.length + journeyScenes.length) % journeyScenes.length;
export function chapterDistance(index, position) {
  const count = journeyScenes.length;
  return ((index - position + count / 2) % count + count) % count - count / 2;
}
