import wangjingPlan from './landmarkLandscapePlan.json';

const clamp = value => Math.max(0, Math.min(1, value));
const smooth = (lo, hi, value) => { const t = clamp((value - lo) / (hi - lo)); return t * t * (3 - 2 * t); };
const rectangle = (minX, maxX, minZ, maxZ) => [[minX, minZ], [maxX, minZ], [maxX, maxZ], [minX, maxZ]];

export function segmentDistance(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / Math.max(.000001, dx * dx + dz * dz));
  return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
}

export function polygonContains(x, z, polygon) {
  let inside = false;
  for (let i = 0, previous = polygon.length - 1; i < polygon.length; previous = i++) {
    const a = polygon[i], b = polygon[previous];
    if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

export function polygonEdgeDistance(x, z, polygon) {
  let distance = Infinity;
  for (let i = 0; i < polygon.length; i++) distance = Math.min(distance, segmentDistance(x, z, polygon[i], polygon[(i + 1) % polygon.length]));
  return distance;
}

export const landmarkLandscapePlans = {
  wangjing: {
    label: 'Wangjing', seed: 798, groundY: -.018, center: [0, -.1], extent: [6.8, 4.7],
    // These are the model author's exact source-derived plan contours, in the
    // exported GLB coordinates. They also reserve the low drone's entire lane.
    gardenY: wangjingPlan.plantingTopY,
    gardenHeights: wangjingPlan.plantingTopYByIsland,
    gardens: wangjingPlan.plantingIslandsXZ,
    plaza: wangjingPlan.plazaOutlineXZ,
    obstacles: [...wangjingPlan.towerFootprintsXZ, wangjingPlan.reflectingPoolXZ,
      ...wangjingPlan.pavilions.map(({ center, halfExtentsXZ }) => rectangle(center[0] - halfExtentsXZ[0], center[0] + halfExtentsXZ[0], center[2] - halfExtentsXZ[1], center[2] + halfExtentsXZ[1]))],
    lane: wangjingPlan.droneLaneXZ,
    laneClearance: wangjingPlan.droneClearRadius,
    groveCenters: [[-5.15, -2.12], [-4.4, 2.92], [-2.8, 3.65], [.8, 3.63], [4.4, 2.30], [5.60, -.2], [2.25, -3.3], [-.6, -3.64]],
    groveRadius: .58, groveHeight: [.31, .49],
  },
  berkeley: {
    label: 'Berkeley', seed: 1868, groundY: -.018, center: [0, .45], extent: [3.5, 4.65],
    gardens: [],
    // The actual stone plaza, entrance steps and arrival promenade belong to
    // the asset. This expanded lane keeps branches out of the moving camera.
    obstacles: [rectangle(-1.16, 1.16, -3.8, 5.05)],
    lane: [], laneClearance: .22,
    groveCenters: [[-1.82, -2.5], [-2.24, -.9], [-1.96, 1.1], [-2.12, 3.05], [1.84, -2.23], [2.15, -.42], [1.90, 1.71], [2.1, 3.23]],
    groveRadius: .56, groveHeight: [.35, .58],
  },
};

export function terrainHeight(plan, x, z) {
  const edge = (Math.abs((x - plan.center[0]) / plan.extent[0]) ** 4 + Math.abs((z - plan.center[1]) / plan.extent[1]) ** 4) ** .25;
  return plan.groundY + smooth(.60, 1, edge) * Math.sin(x * .80) * Math.cos(z * .65) * .018;
}

export function treeClearance(plan, tree) {
  const obstacle = Math.min(...plan.obstacles.map(polygon => polygonContains(tree.x, tree.z, polygon)
    ? -polygonEdgeDistance(tree.x, tree.z, polygon) : polygonEdgeDistance(tree.x, tree.z, polygon)));
  const lane = Math.min(...plan.lane.slice(1).map((point, index) => segmentDistance(tree.x, tree.z, plan.lane[index], point)));
  return { obstacle: obstacle - tree.radius, lane: lane - tree.radius };
}

export function createLandmarkLandscape(kind) {
  const name = String(kind || '').toLowerCase();
  const plan = name.includes('wangjing') ? landmarkLandscapePlans.wangjing : name.includes('berkeley') ? landmarkLandscapePlans.berkeley : null;
  if (!plan) return null;
  let state = plan.seed;
  const random = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const trees = [];
  const plant = (x, z, height, garden = null) => {
    if (trees.length >= 150) return false;
    const radius = height * .58;
    if (garden && (!polygonContains(x, z, garden) || polygonEdgeDistance(x, z, garden) < radius * .85)) return false;
    if (!garden && plan.plaza && (polygonContains(x, z, plan.plaza) || polygonEdgeDistance(x, z, plan.plaza) < radius + .06)) return false;
    const candidate = { x, z, height, radius };
    const clearance = treeClearance(plan, candidate);
    if (clearance.obstacle < .04 || clearance.lane < plan.laneClearance) return false;
    if (trees.some(tree => Math.hypot(tree.x - x, tree.z - z) < (tree.radius + radius) * .69)) return false;
    const gardenIndex = garden ? plan.gardens.indexOf(garden) : -1;
    trees.push({ ...candidate, y: garden ? (plan.gardenHeights?.[gardenIndex] ?? plan.gardenY) : terrainHeight(plan, x, z),
      turn: random() * Math.PI * 2, lean: (random() - .5) * .10, tint: random(), garden: Boolean(garden), gardenIndex });
    return true;
  };
  for (const garden of plan.gardens) {
    const minX = Math.min(...garden.map(p => p[0])), maxX = Math.max(...garden.map(p => p[0]));
    const minZ = Math.min(...garden.map(p => p[1])), maxZ = Math.max(...garden.map(p => p[1]));
    let planted = 0;
    for (let attempt = 0; attempt < 150 && planted < 8; attempt++) {
      if (plant(minX + random() * (maxX - minX), minZ + random() * (maxZ - minZ), .18 + random() * .15, garden)) planted++;
    }
  }
  for (const center of plan.groveCenters) {
    let planted = 0;
    for (let attempt = 0; attempt < 55 && planted < 13; attempt++) {
      const angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * plan.groveRadius;
      if (plant(center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius,
        plan.groveHeight[0] + random() * (plan.groveHeight[1] - plan.groveHeight[0]))) planted++;
    }
  }
  return { ...plan, trees };
}
