/*
Build an illustrative road cavity in meters.
Todo:
-> keep the surface, wireframe and contours on the same profile
*/
import * as THREE from 'three';

function validateDimensions(widthM: number, depthM: number) {
  if (!Number.isFinite(widthM) || widthM <= 0 || !Number.isFinite(depthM) || depthM < 0) {
    throw new RangeError('Invalid damage dimensions');
  }
}

// A compact profile joins the road with zero height and slope at the rim.
export function sampleDamageHeight(x: number, y: number, widthM: number, depthM: number) {
  validateDimensions(widthM, depthM);
  const distanceSquared = (x * x + y * y) / ((widthM / 2) ** 2);
  return distanceSquared >= 1 || depthM === 0 ? 0 : -depthM * (1 - distanceSquared) ** 2;
}

export function createDamageGeometry(widthM: number, depthM: number): THREE.BufferGeometry {
  validateDimensions(widthM, depthM);
  const segments = 64;
  const rings = 20;
  const positions = [0, 0, -depthM];
  const indices: number[] = [];
  for (let ring = 1; ring <= rings; ring++) {
    const radius = widthM / 2 * ring / rings;
    for (let segment = 0; segment < segments; segment++) {
      const angle = segment / segments * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      positions.push(x, y, sampleDamageHeight(x, y, widthM, depthM));
      const current = 1 + (ring - 1) * segments + segment;
      const next = 1 + (ring - 1) * segments + (segment + 1) % segments;
      if (ring === 1) indices.push(0, current, next);
      else indices.push(current - segments, current, next, current - segments, next, next - segments);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

export function createDamageContour(widthM: number, depthM: number, fraction: number) {
  validateDimensions(widthM, depthM);
  if (fraction <= 0 || fraction >= 1) throw new RangeError('Invalid contour fraction');
  const radius = widthM / 2 * Math.sqrt(1 - Math.sqrt(fraction));
  return new THREE.BufferGeometry().setFromPoints(Array.from({ length: 65 }, (_, index) => {
    const angle = index / 64 * Math.PI * 2;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return new THREE.Vector3(x, y, sampleDamageHeight(x, y, widthM, depthM));
  }));
}
