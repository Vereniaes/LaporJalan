/* Synthetic metadata for tests only. Never imported by the application.
Todo:
-> cover distinct locations, statuses and missing status
*/
export const snapshot = {
  source: { name: 'CRM Jakarta · JAKI', url: 'https://crm.jakarta.go.id/peta/', retrievedAt: '2026-10-17T04:00:00.000Z', dateStart: '2026-10-16', dateEnd: '2026-10-17' },
  reports: [
    { id: 'test-a', code: 'TEST-A', lng: 106.82, lat: -6.19, category: 'road' as const, sourceCategory: 'Jalan' as const, createdAt: '2026-10-17T03:00:00.000Z', sourceStatus: 'Koordinasi' },
    { id: 'test-b', code: 'TEST-B', lng: 106.88, lat: -6.23, category: 'road' as const, sourceCategory: 'Jalan' as const, createdAt: '2026-10-17T02:00:00.000Z', sourceStatus: 'Selesai' },
    { id: 'test-c', code: 'TEST-C', lng: 106.821, lat: -6.191, category: 'road' as const, sourceCategory: 'Jalan' as const, createdAt: '2026-10-17T01:00:00.000Z', sourceStatus: null },
  ],
};
export const style = { version: 8, sources: { attribution: { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, attribution: 'Test map attribution' } }, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#e8ede7' } }, { id: 'attributed-points', type: 'circle', source: 'attribution' }] };
