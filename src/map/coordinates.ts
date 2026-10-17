// Reject coordinates outside the map projection before creating map objects.
export function isMapCoordinate(lng: unknown, lat: unknown): boolean {
  return typeof lng === 'number' && typeof lat === 'number' &&
    Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 85.051129;
}
