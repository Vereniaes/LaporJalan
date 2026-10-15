/*
file ini buat peta 3d maplibre di browser
lengkap sama gedung timbul, kerucut cctv segitiga, garis macet, sama marker lubang
Todo:
-> pasang maplibre peta dengan kemiringan pitch 55 derajat
-> gambar poligon kerucut pandang (frustum) kamera cctv ke jalanan
-> pasang marker kerusakan jalan 3d yang pulsasi warna merah/oranye
-> pasang garis kemacetan jalan real-time
*/

import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { DamageReport, CctvCamera, TrafficSegment } from '../types';
import { Compass, Eye, ShieldAlert, Layers } from 'lucide-react';

interface Map3DProps {
  reports: DamageReport[];
  cctvList: CctvCamera[];
  trafficSegments: TrafficSegment[];
  selectedReport: DamageReport | null;
  targetFlyLocation?: { lng: number; lat: number } | null;
  onSelectReport: (report: DamageReport) => void;
  onSelectCctv: (cctv: CctvCamera) => void;
}

// helper bikin koordinat poligon kerucut pandang cctv (frustum) --------------------------------------------------------------------------
// input param : lat, lng kamera, sudut hadap kamera (angle), dan lebar fov
// output : array koordinat GeoJSON polygon segitiga
function createCctvConePolygon(lat: number, lng: number, angleDeg: number, fovDeg: number, distanceM: number): number[][] {
  const earthRadius = 6378137;
  const dRad = distanceM / earthRadius;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const latRad = toRad(lat);
  const lngRad = toRad(lng);

  const leftAngle = toRad(angleDeg - fovDeg / 2);
  const rightAngle = toRad(angleDeg + fovDeg / 2);

  // titik kiri kerucut
  const leftLat = Math.asin(
    Math.sin(latRad) * Math.cos(dRad) + Math.cos(latRad) * Math.sin(dRad) * Math.cos(leftAngle)
  );
  const leftLng = lngRad + Math.atan2(
    Math.sin(leftAngle) * Math.sin(dRad) * Math.cos(latRad),
    Math.cos(dRad) - Math.sin(latRad) * Math.sin(leftLat)
  );

  // titik kanan kerucut
  const rightLat = Math.asin(
    Math.sin(latRad) * Math.cos(dRad) + Math.cos(latRad) * Math.sin(dRad) * Math.cos(rightAngle)
  );
  const rightLng = lngRad + Math.atan2(
    Math.sin(rightAngle) * Math.sin(dRad) * Math.cos(latRad),
    Math.cos(dRad) - Math.sin(latRad) * Math.sin(rightLat)
  );

  return [
    [lng, lat],
    [toDeg(leftLng), toDeg(leftLat)],
    [toDeg(rightLng), toDeg(rightLat)],
    [lng, lat]
  ];
}
// end of helper ------------------------------------------------------------------

export const Map3D: React.FC<Map3DProps> = ({
  reports,
  cctvList,
  trafficSegments,
  selectedReport,
  targetFlyLocation,
  onSelectReport,
  onSelectCctv,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // style peta vektor bersih bernuansa terang mirip 
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors, © CARTO'
          }
        },
        layers: [
          {
            id: 'osm-base',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 20
          }
        ]
      },
      center: [106.8232, -6.1965], // Bundaran HI - Thamrin
      zoom: 15.2,
      pitch: 52, // kemiringan 3d perspective
      bearing: -12, // rotasi menghadap koridor thamrin
      maxPitch: 75
    });

    mapRef.current = map;

    map.on('load', () => {
      // 1. tambahkan layer kerucut pandang (frustum) cctv
      const cctvFeatures = cctvList.map((cam) => ({
        type: 'Feature' as const,
        properties: { id: cam.id, name: cam.name },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [createCctvConePolygon(cam.lat, cam.lng, cam.angle, cam.fov, cam.distanceMeters)]
        }
      }));

      map.addSource('cctv-cones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: cctvFeatures
        }
      });

      // layer poligon transparan kerucut pandang
      map.addLayer({
        id: 'cctv-cones-fill',
        type: 'fill',
        source: 'cctv-cones',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.16
        }
      });

      // garis batas tepi kerucut kamera
      map.addLayer({
        id: 'cctv-cones-line',
        type: 'line',
        source: 'cctv-cones',
        paint: {
          'line-color': '#2563eb',
          'line-width': 1.5,
          'line-opacity': 0.5,
          'line-dasharray': [3, 2]
        }
      });

      // 2. tambahkan layer garis arus kemacetan
      const trafficFeatures = trafficSegments.map((seg) => ({
        type: 'Feature' as const,
        properties: {
          id: seg.id,
          name: seg.roadName,
          status: seg.status,
          color: seg.status === 'macet' ? '#ef4444' : seg.status === 'padat' ? '#f59e0b' : '#10b981'
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: seg.coordinates
        }
      }));

      map.addSource('traffic-flow', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: trafficFeatures
        }
      });

      map.addLayer({
        id: 'traffic-lines',
        type: 'line',
        source: 'traffic-flow',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-opacity': 0.85
        }
      });

      // 3. layer garis pandang cctv (sight-line dinamis)
      map.addSource('cctv-sightline', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'cctv-sightline-glow',
        type: 'line',
        source: 'cctv-sightline',
        paint: {
          'line-color': '#34d399',
          'line-width': 6,
          'line-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'cctv-sightline-line',
        type: 'line',
        source: 'cctv-sightline',
        paint: {
          'line-color': '#059669',
          'line-width': 2.5,
          'line-dasharray': [2, 2]
        }
      });
    });

    return () => {
      map.remove();
    };
  }, []);

  // sinkronisasi markers kerusakan jalan, kamera cctv, dan garis pandang sight-line
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // bersihkan marker lama
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // update garis pandang cctv jika laporan terpilih cocok dengan kamera
    const matchedCam = selectedReport?.cctvMatchId
      ? cctvList.find((c) => c.id === selectedReport.cctvMatchId)
      : null;

    if (map.isStyleLoaded() && map.getSource('cctv-sightline')) {
      const sightSource = map.getSource('cctv-sightline') as maplibregl.GeoJSONSource;
      if (matchedCam && selectedReport) {
        sightSource.setData({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [matchedCam.lng, matchedCam.lat],
                  [selectedReport.lng, selectedReport.lat]
                ]
              }
            }
          ]
        });

        // pasang label jarak di titik tengah garis pandang
        const midLng = (matchedCam.lng + selectedReport.lng) / 2;
        const midLat = (matchedCam.lat + selectedReport.lat) / 2;
        const dLat = (selectedReport.lat - matchedCam.lat) * 111000;
        const dLng = (selectedReport.lng - matchedCam.lng) * 111000 * Math.cos((midLat * Math.PI) / 180);
        const distM = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));

        const midEl = document.createElement('div');
        midEl.innerHTML = `
          <div class="px-2 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold shadow-md flex items-center space-x-1 border border-white/80">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>Terlihat CCTV • ${distM}m</span>
          </div>
        `;
        const midMarker = new maplibregl.Marker({ element: midEl })
          .setLngLat([midLng, midLat])
          .addTo(map);
        markersRef.current.push(midMarker);
      } else {
        sightSource.setData({
          type: 'FeatureCollection',
          features: []
        });
      }
    }

    // pasang marker cctv publik bergaya 
    cctvList.forEach((cam) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group';
      el.innerHTML = `
        <div class="flex items-center space-x-1 px-2.5 py-1 bg-slate-900/90 text-white rounded-full text-[11px] font-bold shadow-md hover:bg-blue-600 transition-all border border-white/40">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>${cam.name}</span>
        </div>
      `;
      el.addEventListener('click', () => onSelectCctv(cam));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.lng, cam.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // pasang marker kerusakan jalan 3d
    reports.forEach((rep) => {
      const isSelected = selectedReport?.id === rep.id;
      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform hover:scale-110';

      const colorBg =
        rep.severity === 'berat'
          ? 'bg-red-500'
          : rep.severity === 'sedang'
          ? 'bg-amber-500'
          : 'bg-yellow-500';

      const labelType =
        rep.type === 'pothole'
          ? 'LUBANG'
          : rep.type === 'trench'
          ? 'GALIAN'
          : rep.type === 'crack'
          ? 'RETAK'
          : 'AMBLES';

      el.innerHTML = `
        <div class="relative flex flex-col items-center">
          <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg border-2 ${
            isSelected ? 'border-white ring-4 ring-red-400/50 scale-110' : 'border-white'
          } ${colorBg}">
            <span class="text-[10px] tracking-wide">${labelType}</span>
            <span class="text-[11px] font-normal opacity-90">${rep.depthCm}cm</span>
          </div>
          <!-- pin arrow -->
          <div class="w-2.5 h-2.5 bg-slate-800 rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;
      el.addEventListener('click', () => onSelectReport(rep));

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([rep.lng, rep.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [reports, cctvList, selectedReport]);

  // efek zoom ke laporan terpilih
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedReport) return;

    map.flyTo({
      center: [selectedReport.lng, selectedReport.lat],
      zoom: 16.5,
      pitch: 58,
      speed: 1.2
    });
  }, [selectedReport]);

  // efek zoom ke lokasi pencarian alamat
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !targetFlyLocation) return;

    map.flyTo({
      center: [targetFlyLocation.lng, targetFlyLocation.lat],
      zoom: 16.5,
      pitch: 58,
      speed: 1.2
    });
  }, [targetFlyLocation]);

  const handleResetCamera = () => {
    mapRef.current?.flyTo({
      center: [106.8232, -6.1965],
      zoom: 15.2,
      pitch: 52,
      bearing: -12,
      speed: 1.0
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* tombol kontrol kamera peta 3d */}
      <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        <button
          onClick={handleResetCamera}
          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-floating text-slate-700 hover:text-amber-600 transition-colors border border-slate-100 flex items-center justify-center group"
          title="Reset Sudut Pandang 3D"
        >
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* legenda peta mengambang */}
      <div className="absolute bottom-5 right-5 z-20 hidden md:flex items-center space-x-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-soft text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span>Lubang Kritis</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>Galian Utilitas</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>Kerucut CCTV</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-1 bg-red-500 rounded-full"></span>
          <span>Macet</span>
        </div>
      </div>
    </div>
  );
};
