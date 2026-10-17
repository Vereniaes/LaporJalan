/*
Convert report dimensions without inventing measurements.
Todo:
-> validate centimeters and keep missing dimensions unknown
*/

export function cmToMeters(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value / 100
    : null;
}

export function normalizeDamageDimensions(report: { widthCm?: unknown; depthCm?: unknown }) {
  const widthM = cmToMeters(report.widthCm);
  return {
    widthM: widthM !== null && widthM > 0 ? widthM : null,
    depthM: cmToMeters(report.depthCm),
    lengthM: null,
    heading: null,
    roadWidthM: null,
    provenance: 'unknown' as const,
  };
}
