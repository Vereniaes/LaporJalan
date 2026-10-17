// Fixed inputs are synthetic; no claim of a surveyed road or measured CCTV stream.
export const fixture = {
  id: 'oyenza-parity-fixture-v1', time: '2026-10-16T00:00:00.000Z', seed: 1,
  report: {
    id: 'fixture-pothole-052-0075', type: 'pothole', title: 'Fixture pothole 52 cm',
    severity: 'berat', depthCm: 7.5, widthCm: 52, lat: -6.1965, lng: 106.8232,
    address: 'Synthetic anchor - road not verified', jurisdiction: 'Jalan Nasional (BBPJN PUPR)',
    status: 'verified', photoUrl: '/fixture-snapshot.svg', createdAt: '2026-10-16T00:00:00.000Z',
    upScore: 8.5, trafficImpact: 'padat', description: 'Synthetic test report', cctvMatchId: 'cam-001',
  },
  geometry: { widthM: 0.52, depthM: 0.075, lengthM: null, heading: null, roadWidthM: null,
    roadAnchor: null, syntheticOrigin: [106.8232, -6.1965], patchM: [4, 4],
    axes: 'x east, y north, z up', rimZ: 0, centerZ: -0.075, pitch: 60, bearings: [0, 90, 180, 270],
    inspectionZoom: 23, calibration: 'proposed, not calibrated until P2 layer exists' },
};
export const style = { version: 8, sources: {}, layers: [{ id: 'fixture-background', type: 'background', paint: { 'background-color': '#e8e9e6' } }] };
export const snapshot = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#334155"/><text x="60" y="180" fill="white" font-size="28">STATIC TEST SNAPSHOT</text></svg>';
