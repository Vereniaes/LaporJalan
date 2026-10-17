/*
Keep map camera modes consistent.
Todo:
-> share navigation and inspection poses
*/

export type CameraMode = '2d' | '3d' | 'inspect';
export type NavigationMode = Exclude<CameraMode, 'inspect'>;

export function cameraPose(mode: CameraMode, bearing: number) {
  return {
    pitch: mode === '2d' ? 0 : mode === 'inspect' ? 60 : 56,
    bearing: mode === '2d' ? 0 : bearing,
  };
}

// Keep the calibrated 52 cm view while fitting larger dimensions with camera distance.
export function inspectionZoom(widthM: number, depthM: number, latitude: number, availablePixels: number) {
  const span = Math.max(widthM, 2 * depthM * Math.sin(Math.PI / 3));
  return 25 + Math.log2(0.52 / span) + Math.log2(availablePixels / 234) +
    Math.log2(Math.cos(latitude * Math.PI / 180) / Math.cos(-6.1965 * Math.PI / 180));
}
