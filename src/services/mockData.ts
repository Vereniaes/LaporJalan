/*
file ini isinya dummy data jalanan jakarta buat testing aplikasi
ada data kamera cctv, data lubang jalan, data galian utilitas, sama garis macet
Todo:
-> siapin koordinat cctv realistik di sudirman thamrin
-> siapin data laporan kerusakan jalan lengkap dengan kedalaman cm
-> siapin jalur kemacetan yang sesuai sama titik galian
*/

import { DamageReport, CctvCamera, TrafficSegment } from '../types';

// data kamera cctv publik terpasang di jakarta
export const INITIAL_CCTV_CAMERAS: CctvCamera[] = [
  {
    id: 'cctv-hi-01',
    name: '1 • CCTV Bundaran HI',
    location: 'Bundaran HI • Sisi Hotel Indonesia • Simpang C09',
    lat: -6.1950,
    lng: 106.8230,
    angle: 35, // menghadap utara timur ke arah jalan
    fov: 48,
    distanceMeters: 280,
    snapshotUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    lastUpdated: '09:42:55',
    status: 'online'
  },
  {
    id: 'cctv-sudirman-6b',
    name: '6B • CCTV Tosari Dukuh Atas',
    location: 'Jl. Jenderal Sudirman • Halte Tosari 1',
    lat: -6.2005,
    lng: 106.8236,
    angle: 195, // menghadap selatan jalur busway
    fov: 52,
    distanceMeters: 320,
    snapshotUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    lastUpdated: '09:43:10',
    status: 'online'
  },
  {
    id: 'cctv-semanggi-4c',
    name: '4C • CCTV Simpang Semanggi',
    location: 'Plaza Semanggi • Sudirman Loop B',
    lat: -6.2185,
    lng: 106.8175,
    angle: 80,
    fov: 55,
    distanceMeters: 350,
    snapshotUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    lastUpdated: '09:41:20',
    status: 'online'
  },
  {
    id: 'cctv-kuningan-9d',
    name: '9D • CCTV Rasuna Said Kuningan',
    location: 'HR Rasuna Said • Depan Menara Kadin',
    lat: -6.2240,
    lng: 106.8310,
    angle: 350,
    fov: 50,
    distanceMeters: 300,
    snapshotUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
    lastUpdated: '09:40:02',
    status: 'online'
  }
];

// data laporan kerusakan jalan aktif
export const INITIAL_REPORTS: DamageReport[] = [
  {
    id: 'rep-001',
    type: 'pothole',
    title: 'Lubang Kritis Lajur Kanan Jalur Cepat',
    severity: 'berat',
    depthCm: 7.5,
    widthCm: 52.0,
    lat: -6.1965,
    lng: 106.8232,
    address: 'Jl. M.H. Thamrin No. 28, Menteng (Arah Bundaran HI)',
    jurisdiction: 'Jalan Nasional (BBPJN PUPR)',
    status: 'verified',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    createdAt: '15 Menit lalu',
    upScore: 8.5,
    trafficImpact: 'macet',
    cctvMatchId: 'cctv-hi-01',
    description: 'Lubang aspal tembus lapisan agregat dasar. Sudah membuat 2 pengendara motor oleng saat jam pulang kantor.'
  },
  {
    id: 'rep-002',
    type: 'trench',
    title: 'Galian Kabel Utilitas Ambles Belum Di-overlay',
    severity: 'sedang',
    depthCm: 4.8,
    widthCm: 180.0,
    lat: -6.2020,
    lng: 106.8234,
    address: 'Jl. Jenderal Sudirman (Depan Gedung Chase Plaza)',
    jurisdiction: 'Jalan Provinsi (Bina Marga DKI)',
    status: 'scheduled',
    photoUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    createdAt: '1 Jam lalu',
    upScore: 6.8,
    trafficImpact: 'padat',
    cctvMatchId: 'cctv-sudirman-6b',
    description: 'Bekas galian melintang lajur lambat. Penimbunan pasir tidak rata dan turun setelah diguyur hujan deras semalam.'
  },
  {
    id: 'rep-003',
    type: 'crack',
    title: 'Retak Kulit Buaya Luas Jalur Lambat',
    severity: 'ringan',
    depthCm: 1.8,
    widthCm: 240.0,
    lat: -6.2230,
    lng: 106.8305,
    address: 'Jl. H.R. Rasuna Said, Karet Kuningan',
    jurisdiction: 'Jalan Provinsi (Bina Marga DKI)',
    status: 'review',
    photoUrl: 'https://images.unsplash.com/photo-1578874691223-a49267b0995f?auto=format&fit=crop&w=800&q=80',
    createdAt: '3 Jam lalu',
    upScore: 4.2,
    trafficImpact: 'lancar',
    cctvMatchId: 'cctv-kuningan-9d',
    description: 'Struktur aspal retak-retak pecah seribu, air merembes keluar saat kendaraan berat lewat.'
  },
  {
    id: 'rep-004',
    type: 'subsidence',
    title: 'Amblesan Oprit Jembatan Semanggi Barat',
    severity: 'berat',
    depthCm: 9.0,
    widthCm: 120.0,
    lat: -6.2195,
    lng: 106.8168,
    address: 'Akses Naik Jembatan Semanggi Arah Slipi',
    jurisdiction: 'Jalan Nasional (BBPJN PUPR)',
    status: 'verified',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    createdAt: 'Kemarin',
    upScore: 9.1,
    trafficImpact: 'macet',
    cctvMatchId: 'cctv-semanggi-4c',
    description: 'Penurunan elevasi tanah dasar antara sambungan jembatan dan aspal badan jalan memicu benturan keras bemper mobil.'
  }
];

// segmen jalur kemacetan kota jakarta
export const INITIAL_TRAFFIC_SEGMENTS: TrafficSegment[] = [
  {
    id: 'tr-01',
    roadName: 'Jl. M.H. Thamrin (Arah Bundaran HI)',
    status: 'macet',
    speedKmh: 12,
    coordinates: [
      [106.8228, -6.1920],
      [106.8231, -6.1955],
      [106.8233, -6.1970]
    ]
  },
  {
    id: 'tr-02',
    roadName: 'Jl. Jend. Sudirman (Dukuh Atas ke Benhil)',
    status: 'padat',
    speedKmh: 24,
    coordinates: [
      [106.8233, -6.1970],
      [106.8235, -6.2025],
      [106.8220, -6.2100]
    ]
  },
  {
    id: 'tr-03',
    roadName: 'Jl. H.R. Rasuna Said (Kuningan Sentral)',
    status: 'lancar',
    speedKmh: 48,
    coordinates: [
      [106.8290, -6.2150],
      [106.8305, -6.2230],
      [106.8320, -6.2300]
    ]
  }
];

// data poligon gedung pencakar langit 3d koridor thamrin - sudirman
export const BUILDINGS_3D_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Menara BCA', height: 230 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8208, -6.1950], [106.8218, -6.1950], [106.8218, -6.1962], [106.8208, -6.1962], [106.8208, -6.1950]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Grand Indonesia West Mall', height: 48 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8196, -6.1945], [106.8208, -6.1945], [106.8208, -6.1966], [106.8196, -6.1966], [106.8196, -6.1945]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Kempinski Private Residences', height: 215 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8218, -6.1960], [106.8226, -6.1960], [106.8226, -6.1969], [106.8218, -6.1969], [106.8218, -6.1960]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'The Plaza Office Tower', height: 210 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8216, -6.1926], [106.8226, -6.1926], [106.8226, -6.1936], [106.8216, -6.1936], [106.8216, -6.1926]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Keraton at The Plaza', height: 180 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8216, -6.1936], [106.8224, -6.1936], [106.8224, -6.1944], [106.8216, -6.1944], [106.8216, -6.1936]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Plaza Indonesia Mall', height: 42 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8224, -6.1930], [106.8234, -6.1930], [106.8234, -6.1944], [106.8224, -6.1944], [106.8224, -6.1930]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Hotel Mandarin Oriental', height: 110 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8236, -6.1965], [106.8246, -6.1965], [106.8246, -6.1975], [106.8236, -6.1975], [106.8236, -6.1965]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Wisma Nusantara & Pullman', height: 120 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8236, -6.1938], [106.8246, -6.1938], [106.8246, -6.1950], [106.8236, -6.1950], [106.8236, -6.1938]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Autograph Tower (Thamrin Nine)', height: 382 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8212, -6.2002], [106.8224, -6.2002], [106.8224, -6.2014], [106.8212, -6.2014], [106.8212, -6.2002]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'UOB Plaza', height: 195 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8224, -6.2004], [106.8234, -6.2004], [106.8234, -6.2014], [106.8224, -6.2014], [106.8224, -6.2004]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Wisma 46 (BNI City)', height: 262 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8208, -6.2036], [106.8220, -6.2036], [106.8220, -6.2048], [106.8208, -6.2048], [106.8208, -6.2036]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Menara Astra', height: 260 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8222, -6.2064], [106.8234, -6.2064], [106.8234, -6.2076], [106.8222, -6.2076], [106.8222, -6.2064]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'Chase Plaza', height: 130 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8218, -6.2086], [106.8228, -6.2086], [106.8228, -6.2096], [106.8218, -6.2096], [106.8218, -6.2086]]]
      }
    },
    {
      type: 'Feature',
      properties: { name: 'MidPlaza 1 & 2', height: 115 },
      geometry: {
        type: 'Polygon',
        coordinates: [[[106.8206, -6.2078], [106.8218, -6.2078], [106.8218, -6.2088], [106.8206, -6.2088], [106.8206, -6.2078]]]
      }
    }
  ]
};

