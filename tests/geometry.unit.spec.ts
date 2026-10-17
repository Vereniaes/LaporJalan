import { test, expect } from '@playwright/test';
import { createDamageGeometry, createDamageContour, sampleDamageHeight } from '../src/map/damageGeometry';

test('G01 physical cavity joins the road with the declared diameter and depth', () => {
  const geometry = createDamageGeometry(0.52, 0.075);
  const position = geometry.getAttribute('position');
  expect(geometry.boundingBox!.min.z).toBeCloseTo(-0.075, 6);
  expect(geometry.boundingBox!.max.z).toBeCloseTo(0, 6);
  expect(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x).toBeCloseTo(0.52, 6);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i);
    expect(position.getZ(i)).toBeCloseTo(sampleDamageHeight(x, y, 0.52, 0.075), 6);
    expect(Math.hypot(x, y)).toBeLessThanOrEqual(0.260001);
  }
  for (const [x, y] of [[0.26, 0], [0, -0.26], [1, 1]]) expect(sampleDamageHeight(x, y, 0.52, 0.075)).toBe(0);
  geometry.dispose();
});

test('G01 contour vertices use the same surface profile', () => {
  for (const fraction of [0.25, 0.5, 0.75]) {
    const contour = createDamageContour(0.52, 0.075, fraction);
    const positions = contour.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      expect(positions.getZ(i)).toBeCloseTo(-0.075 * fraction, 6);
      expect(positions.getZ(i)).toBeCloseTo(sampleDamageHeight(positions.getX(i), positions.getY(i), 0.52, 0.075), 6);
    }
    contour.dispose();
  }
});
