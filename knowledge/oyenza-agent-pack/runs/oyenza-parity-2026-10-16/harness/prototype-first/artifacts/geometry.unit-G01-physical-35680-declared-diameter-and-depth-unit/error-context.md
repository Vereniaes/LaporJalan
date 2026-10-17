# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: geometry.unit.spec.ts >> G01 physical cavity joins the road with the declared diameter and depth
- Location: tests/geometry.unit.spec.ts:4:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 0
Received: -0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { createDamageGeometry, createDamageContour, sampleDamageHeight } from '../src/map/damageGeometry';
  3  | 
  4  | test('G01 physical cavity joins the road with the declared diameter and depth', () => {
  5  |   const geometry = createDamageGeometry(0.52, 0.075);
  6  |   const position = geometry.getAttribute('position');
  7  |   expect(geometry.boundingBox!.min.z).toBeCloseTo(-0.075, 6);
  8  |   expect(geometry.boundingBox!.max.z).toBeCloseTo(0, 6);
  9  |   expect(geometry.boundingBox!.max.x - geometry.boundingBox!.min.x).toBeCloseTo(0.52, 6);
  10 |   for (let i = 0; i < position.count; i++) {
  11 |     const x = position.getX(i), y = position.getY(i);
  12 |     expect(position.getZ(i)).toBeCloseTo(sampleDamageHeight(x, y, 0.52, 0.075), 6);
  13 |     expect(Math.hypot(x, y)).toBeLessThanOrEqual(0.260001);
  14 |   }
> 15 |   for (const [x, y] of [[0.26, 0], [0, -0.26], [1, 1]]) expect(sampleDamageHeight(x, y, 0.52, 0.075)).toBe(0);
     |                                                                                                       ^ Error: expect(received).toBe(expected) // Object.is equality
  16 |   geometry.dispose();
  17 | });
  18 | 
  19 | test('G01 contour vertices use the same surface profile', () => {
  20 |   for (const fraction of [0.25, 0.5, 0.75]) {
  21 |     const contour = createDamageContour(0.52, 0.075, fraction);
  22 |     const positions = contour.getAttribute('position');
  23 |     for (let i = 0; i < positions.count; i++) {
  24 |       expect(positions.getZ(i)).toBeCloseTo(-0.075 * fraction, 6);
  25 |       expect(positions.getZ(i)).toBeCloseTo(sampleDamageHeight(positions.getX(i), positions.getY(i), 0.52, 0.075), 6);
  26 |     }
  27 |     contour.dispose();
  28 |   }
  29 | });
  30 | 
```