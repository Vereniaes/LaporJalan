import { test, expect } from '@playwright/test';
import { cmToMeters, normalizeDamageDimensions } from '../src/map/dimensions';
import { fixture } from './fixtures';

test('D01 centimeter values retain physical scale', () => {
  expect(cmToMeters(52)).toBeCloseTo(0.52, 6);
  expect(cmToMeters(7.5)).toBeCloseTo(0.075, 6);
  const result = normalizeDamageDimensions(fixture.report);
  expect(result).toMatchObject({ widthM: 0.52, depthM: 0.075, lengthM: null, heading: null, roadWidthM: null });
});

test('D02 missing, negative and nonfinite values never become invented dimensions', () => {
  for (const value of [null, undefined, NaN, Infinity, -Infinity, -1, '52', true]) {
    expect(cmToMeters(value)).toBeNull();
    const result = normalizeDamageDimensions({ ...fixture.report, widthCm: value, depthCm: value } as any);
    expect(result.widthM).toBeNull();
    expect(result.depthM).toBeNull();
  }
});

test('D02 zero depth is preserved and zero width is unsupported', () => {
  expect(cmToMeters(0)).toBe(0);
  expect(normalizeDamageDimensions({ ...fixture.report, depthCm: 0 }).depthM).toBe(0);
  expect(normalizeDamageDimensions({ ...fixture.report, widthCm: 0 }).widthM).toBeNull();
});
