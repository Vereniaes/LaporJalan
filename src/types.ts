/* Todo:
-> define client domain types for damage reports, CCTV cameras, and traffic
*/

// --- Frontend Type Contracts --------------------------------------------------
export type DamageType = 'pothole' | 'crack' | 'trench' | 'subsidence';
export type DamageSeverity = 'ringan' | 'sedang' | 'berat';
export type JurisdictionType = 
  | 'Jalan Nasional (BBPJN PUPR)'
  | 'Jalan Provinsi (Bina Marga DKI)'
  | 'Jalan Kota (Dinas PU Kota)';

export type ReportStatus = 'review' | 'verified' | 'scheduled' | 'fixed';

export interface DamageReport {
  id: string;
  type: DamageType;
  title: string;
  severity: DamageSeverity;
  depthCm: number;
  widthCm: number;
  lat: number;
  lng: number;
  address: string;
  jurisdiction: JurisdictionType;
  status: ReportStatus;
  photoUrl: string;
  createdAt: string;
  upScore: number; // Urutan Prioritas Bina Marga (1-10)
  trafficImpact: 'lancar' | 'padat' | 'macet';
  cctvMatchId?: string;
  description: string;
}

export interface CctvCamera {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  angle: number; // arah hadap kamera dalam derajat (0-360)
  fov: number; // sudut lebar kerucut kamera (misal 60 derajat)
  distanceMeters: number; // jarak jangkauan pantau kerucut
  snapshotUrl: string;
  lastUpdated: string;
  status: 'online' | 'maintenance';
}

export interface TrafficSegment {
  id: string;
  roadName: string;
  status: 'lancar' | 'padat' | 'macet';
  speedKmh: number;
  coordinates: [number, number][]; // [lng, lat]
}
// --- end of Frontend Type Contracts -------------------------------------------
