import { test, expect } from '@playwright/test';
import { fixture } from './fixtures';

test('B01 fixed fixture keeps missing dimensions unknown', () => {
  expect(fixture.report.widthCm / 100).toBeCloseTo(fixture.geometry.widthM, 6);
  expect(fixture.report.depthCm / 100).toBeCloseTo(fixture.geometry.depthM, 6);
  expect(fixture.geometry.roadAnchor).toBeNull();
  expect(fixture.geometry.roadWidthM).toBeNull();
});
