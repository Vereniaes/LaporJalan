/*
file ini buat peta 3d maplibre di browser
lengkap sama gedung timbul, kerucut cctv segitiga, garis macet, marker lubang, dan bercakan aspal fisik 3d
Todo:
-> pasang maplibre peta dengan kemiringan pitch 52-74 derajat
-> render bercakan kerusakan jalan langsung di atas aspal (decals polygon)
-> auto-tilt kemiringan kamera saat zoom mendekat ke permukaan jalan
-> mode inspeksi lapangan 3d (street level view) putar orbit 360 derajat
-> gambar poligon kerucut pandang (frustum) cctv ke jalanan
*/

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import { DamageReport, CctvCamera, TrafficSegment } from '../types';
import { Compass, RotateCw } from 'lucide-react';
import { BUILDINGS_3D_GEOJSON } from '../services/mockData';
import { CctvPopover } from './CctvPopover';

interface Map3DProps {
  reports: DamageReport[];
  cctvList: CctvCamera[];
  trafficSegments: TrafficSegment[];
  selectedReport: DamageReport | null;
  selectedCctv?: CctvCamera | null;
  onCloseCctv?: () => void;
  targetFlyLocation?: { lng: number; lat: number } | null;
  isStreetInspectActive?: boolean;
  onToggleStreetInspect?: (active: boolean) => void;
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

  const leftLat = Math.asin(
    Math.sin(latRad) * Math.cos(dRad) + Math.cos(latRad) * Math.sin(dRad) * Math.cos(leftAngle)
  );
  const leftLng = lngRad + Math.atan2(
    Math.sin(leftAngle) * Math.sin(dRad) * Math.cos(latRad),
    Math.cos(dRad) - Math.sin(latRad) * Math.sin(leftLat)
  );

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

// helper bikin poligon bercakan kerusakan jalan langsung di aspal (decals) ------------------------------------------------
// input param : reports DamageReport[]
// output : FeatureCollection berisi poligon kawah lubang, persegi panjang galian, dan retakan
function generateRoadDamageDecalsGeoJSON(reports: DamageReport[]) {
  const earthRadius = 6378137;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const features: any[] = [];

  reports.forEach((rep, idx) => {
    const latRad = toRad(rep.lat);
    const lngRad = toRad(rep.lng);

    if (rep.type === 'pothole' || rep.type === 'subsidence') {
      // kawah lubang aspal tak beraturan (jagged rim)
      const radiusM = 4.0;
      const points = 16;
      const coords: number[][] = [];
      const innerCoords: number[][] = [];
      const haloCoords: number[][] = [];

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const jitter = 0.82 + 0.35 * Math.sin(i * 3 + idx * 2);
        const r = (radiusM * jitter) / earthRadius;

        const ptLat = Math.asin(
          Math.sin(latRad) * Math.cos(r) + Math.cos(latRad) * Math.sin(r) * Math.cos(angle)
        );
        const ptLng = lngRad + Math.atan2(
          Math.sin(angle) * Math.sin(r) * Math.cos(latRad),
          Math.cos(r) - Math.sin(latRad) * Math.sin(ptLat)
        );
        coords.push([toDeg(ptLng), toDeg(ptLat)]);

        // inti kawah gelap untuk kesan kedalaman 3d di permukaan jalan
        const rInner = (radiusM * 0.48 * jitter) / earthRadius;
        const inLat = Math.asin(
          Math.sin(latRad) * Math.cos(rInner) + Math.cos(latRad) * Math.sin(rInner) * Math.cos(angle)
        );
        const inLng = lngRad + Math.atan2(
          Math.sin(angle) * Math.sin(rInner) * Math.cos(latRad),
          Math.cos(rInner) - Math.sin(latRad) * Math.sin(inLat)
        );
        innerCoords.push([toDeg(inLng), toDeg(inLat)]);

        // halo zona bahaya aspal
        const rHalo = (radiusM * 1.55 * jitter) / earthRadius;
        const hLat = Math.asin(
          Math.sin(latRad) * Math.cos(rHalo) + Math.cos(latRad) * Math.sin(rHalo) * Math.cos(angle)
        );
        const hLng = lngRad + Math.atan2(
          Math.sin(angle) * Math.sin(rHalo) * Math.cos(latRad),
          Math.cos(rHalo) - Math.sin(latRad) * Math.sin(hLat)
        );
        haloCoords.push([toDeg(hLng), toDeg(hLat)]);
      }
      coords.push(coords[0]);
      innerCoords.push(innerCoords[0]);
      haloCoords.push(haloCoords[0]);

      // halo bercakan aspal
      features.push({
        type: 'Feature',
        properties: {
          id: `${rep.id}-halo`,
          color: rep.severity === 'berat' ? '#ef4444' : '#f59e0b',
          borderColor: 'transparent',
          borderWidth: 0,
          opacity: 0.2
        },
        geometry: {
          type: 'Polygon',
          coordinates: [haloCoords]
        }
      });

      // bibir kawah aspal luar
      features.push({
        type: 'Feature',
        properties: {
          id: rep.id,
          color: '#18181b',
          borderColor: rep.severity === 'berat' ? '#ef4444' : '#f59e0b',
          borderWidth: 3.0,
          opacity: 0.95
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      });

      // lubang hitam dalam (depth core)
      features.push({
        type: 'Feature',
        properties: {
          id: `${rep.id}-core`,
          color: '#000000',
          borderColor: '#450a0a',
          borderWidth: 1.5,
          opacity: 1.0
        },
        geometry: {
          type: 'Polygon',
          coordinates: [innerCoords]
        }
      });
    } else if (rep.type === 'trench') {
      // bercakan galian utilitas: strip persegi panjang melintang jalan
      const lenM = 9.5;
      const widthM = 3.4;
      const angRad = toRad(30);

      const halfL = (lenM / 2) / earthRadius;
      const halfW = (widthM / 2) / earthRadius;

      const corners = [
        [-halfW, -halfL],
        [halfW, -halfL],
        [halfW, halfL],
        [-halfW, halfL]
      ];

      const rectCoords = corners.map(([dx, dy]) => {
        const rx = dx * Math.cos(angRad) - dy * Math.sin(angRad);
        const ry = dx * Math.sin(angRad) + dy * Math.cos(angRad);

        const ptLat = rep.lat + toDeg(ry);
        const ptLng = rep.lng + toDeg(rx) / Math.cos(latRad);
        return [ptLng, ptLat];
      });
      rectCoords.push(rectCoords[0]);

      // halo galian
      const haloCorners = corners.map(([dx, dy]) => [dx * 1.35, dy * 1.2]);
      const haloRectCoords = haloCorners.map(([dx, dy]) => {
        const rx = dx * Math.cos(angRad) - dy * Math.sin(angRad);
        const ry = dx * Math.sin(angRad) + dy * Math.cos(angRad);
        return [rep.lng + toDeg(rx) / Math.cos(latRad), rep.lat + toDeg(ry)];
      });
      haloRectCoords.push(haloRectCoords[0]);

      features.push({
        type: 'Feature',
        properties: {
          id: `${rep.id}-halo`,
          color: '#f59e0b',
          borderColor: 'transparent',
          borderWidth: 0,
          opacity: 0.22
        },
        geometry: {
          type: 'Polygon',
          coordinates: [haloRectCoords]
        }
      });

      features.push({
        type: 'Feature',
        properties: {
          id: rep.id,
          color: '#27272a',
          borderColor: '#f59e0b',
          borderWidth: 3.0,
          opacity: 0.95
        },
        geometry: {
          type: 'Polygon',
          coordinates: [rectCoords]
        }
      });
    } else if (rep.type === 'crack') {
      // retakan aspal: poligon zig-zag
      const radiusM = 5.0;
      const points = 10;
      const coords: number[][] = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const jitter = (i % 2 === 0 ? 1.0 : 0.45) * (0.8 + 0.35 * Math.sin(i * 2 + idx));
        const r = (radiusM * jitter) / earthRadius;
        const ptLat = rep.lat + toDeg(r * Math.cos(angle));
        const ptLng = rep.lng + toDeg(r * Math.sin(angle)) / Math.cos(latRad);
        coords.push([ptLng, ptLat]);
      }
      coords.push(coords[0]);

      features.push({
        type: 'Feature',
        properties: {
          id: rep.id,
          color: '#1e293b',
          borderColor: '#eab308',
          borderWidth: 2.0,
          opacity: 0.9
        },
        geometry: {
          type: 'Polygon',
          coordinates: [coords]
        }
      });
    }
  });

  return {
    type: 'FeatureCollection' as const,
    features
  };
}
// end of helper ------------------------------------------------------------------

export const Map3D: React.FC<Map3DProps> = ({
  reports,
  cctvList,
  trafficSegments,
  selectedReport,
  selectedCctv,
  onCloseCctv,
  targetFlyLocation,
  isStreetInspectActive,
  onToggleStreetInspect,
  onSelectReport,
  onSelectCctv,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [is3DMode, setIs3DMode] = useState(true);
  const is3DModeRef = useRef(true);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const isOrbitingRef = useRef(false);
  const orbitAnimRef = useRef<number | null>(null);

  const cctvPopupInstanceRef = useRef<maplibregl.Popup | null>(null);
  const [cctvPopupNode, setCctvPopupNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // style peta vektor bersih bernuansa terang openfreemap (bebas watermark carto)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
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

      map.addLayer({
        id: 'cctv-cones-fill',
        type: 'fill',
        source: 'cctv-cones',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.16
        }
      });

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

      // 4. layer gedung pencakar langit 3d (fill-extrusion ala oyenza)
      map.addSource('buildings-3d', {
        type: 'geojson',
        data: BUILDINGS_3D_GEOJSON
      });

      map.addLayer({
        id: '3d-buildings-extrusion',
        type: 'fill-extrusion',
        source: 'buildings-3d',
        paint: {
          'fill-extrusion-color': '#d8dce2',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.85,
          'fill-extrusion-vertical-gradient': true
        }
      });

      // 5. layer bercakan kerusakan jalan langsung di atas aspal (decals fisik)
      map.addSource('road-damage-decals', {
        type: 'geojson',
        data: generateRoadDamageDecalsGeoJSON(reports)
      });

      map.addLayer({
        id: 'road-damage-decals-fill',
        type: 'fill',
        source: 'road-damage-decals',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': ['get', 'opacity']
        }
      });

      map.addLayer({
        id: 'road-damage-decals-line',
        type: 'line',
        source: 'road-damage-decals',
        paint: {
          'line-color': ['get', 'borderColor'],
          'line-width': ['get', 'borderWidth']
        }
      });

      // interaksi klik pada bercakan aspal
      map.on('click', 'road-damage-decals-fill', (e) => {
        if (e.features && e.features[0]) {
          const rawId = e.features[0].properties?.id as string;
          const targetId = rawId ? rawId.replace('-core', '').replace('-halo', '') : '';
          const rep = reports.find((r) => r.id === targetId);
          if (rep) {
            onSelectReport(rep);
          }
        }
      });

      map.on('mouseenter', 'road-damage-decals-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'road-damage-decals-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    // auto-tilt saat zoom mendekat ke aspal jalan hanya bila mode 3D aktif
    const handleZoomEnd = () => {
       const zoom = map.getZoom();
       if (is3DModeRef.current && zoom >= 16.5 && !isOrbitingRef.current) {
         const targetPitch = Math.min(74, 52 + (zoom - 16.0) * 11);
         if (Math.abs(map.getPitch() - targetPitch) > 5) {
           map.easeTo({ pitch: targetPitch, duration: 400 });
         }
       }
     };
     map.on('zoomend', handleZoomEnd);

    return () => {
      map.remove();
    };
  }, []);

  // update data bercakan jalan jika reports berubah
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const decalSource = map.getSource('road-damage-decals') as maplibregl.GeoJSONSource;
    if (decalSource) {
      decalSource.setData(generateRoadDamageDecalsGeoJSON(reports));
    }
  }, [reports]);

  // popup tertambat langsung di atas marker cctv ala transit.oyenza.com/cctv
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedCctv) {
      if (cctvPopupInstanceRef.current) {
        cctvPopupInstanceRef.current.remove();
      }

      const container = document.createElement('div');
      setCctvPopupNode(container);

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        anchor: 'bottom',
        offset: [0, -28],
        maxWidth: 'none',
        className: 'cctv-oyenza-popup'
      })
        .setLngLat([selectedCctv.lng, selectedCctv.lat])
        .setDOMContent(container)
        .addTo(map);

      cctvPopupInstanceRef.current = popup;

      map.flyTo({
        center: [selectedCctv.lng, selectedCctv.lat],
        zoom: Math.max(map.getZoom(), 15.8),
        duration: 800
      });
    } else {
      if (cctvPopupInstanceRef.current) {
        cctvPopupInstanceRef.current.remove();
        cctvPopupInstanceRef.current = null;
      }
      setCctvPopupNode(null);
    }
  }, [selectedCctv]);

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

    // pasang marker cctv publik
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
      el.className = `cursor-pointer transition-transform hover:scale-110 ${
        isStreetInspectActive && isSelected ? 'opacity-80 scale-95' : ''
      }`;

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
          ${
            isSelected
              ? `
            <div class="mb-2 px-3 py-2 bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl text-white text-[10px] font-sans flex flex-col space-y-0.5 animate-fade-in pointer-events-none min-w-[130px] z-30">
              <div class="flex items-center justify-between space-x-2">
                <span class="text-slate-400">Kedalaman:</span>
                <span class="font-bold text-red-400 font-mono">${rep.depthCm} cm</span>
              </div>
              <div class="flex items-center justify-between space-x-2">
                <span class="text-slate-400">Lebar:</span>
                <span class="font-bold text-slate-100 font-mono">${rep.widthCm} cm</span>
              </div>
              <div class="flex items-center justify-between space-x-2 border-t border-slate-800 pt-0.5 mt-0.5">
                <span class="text-slate-400">Lebar jalan:</span>
                <span class="font-bold text-emerald-400 font-mono">7 m</span>
              </div>
            </div>
          `
              : ''
          }
          <div class="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg border-2 ${
            isSelected ? 'border-white ring-4 ring-red-400/50 scale-105' : 'border-white'
          } ${colorBg}">
            <span class="text-[10px] tracking-wide">${labelType}</span>
            <span class="text-[11px] font-normal opacity-90">${rep.depthCm}cm</span>
          </div>
          <div class="w-2.5 h-2.5 bg-slate-800 rotate-45 -mt-1 shadow-sm"></div>
        </div>
      `;
      el.addEventListener('click', () => onSelectReport(rep));

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([rep.lng, rep.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [reports, cctvList, selectedReport, isStreetInspectActive]);

  // efek zoom ke laporan terpilih jika bukan street inspect mode
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedReport || isStreetInspectActive) return;

    map.flyTo({
      center: [selectedReport.lng, selectedReport.lat],
      zoom: 16.5,
      pitch: 58,
      speed: 1.2
    });
  }, [selectedReport, isStreetInspectActive]);

  // efek kamera terbang ke permukaan jalan saat mode inspeksi aktif (Street Level)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (isStreetInspectActive && selectedReport) {
      map.flyTo({
        center: [selectedReport.lng, selectedReport.lat],
        zoom: 19.2,
        pitch: 74,
        bearing: -15,
        speed: 1.2
      });
    } else {
      setIsOrbiting(false);
      isOrbitingRef.current = false;
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
        orbitAnimRef.current = null;
      }
    }
  }, [isStreetInspectActive, selectedReport]);

  // loop animasi orbit 360 derajat mengelilingi titik kerusakan
  useEffect(() => {
    isOrbitingRef.current = isOrbiting;
    if (!isOrbiting) {
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
        orbitAnimRef.current = null;
      }
      return;
    }

    const animateOrbit = () => {
      const map = mapRef.current;
      if (map && isOrbitingRef.current) {
        const nextBearing = (map.getBearing() + 0.35) % 360;
        map.setBearing(nextBearing);
        orbitAnimRef.current = requestAnimationFrame(animateOrbit);
      }
    };

    orbitAnimRef.current = requestAnimationFrame(animateOrbit);
    return () => {
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
      }
    };
  }, [isOrbiting]);

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

  // helper toggle perspektif 3d / 2d ala oyenza --------------------------------------------------------------------------
  // input param : status 3d boolean
  // output : transisi kemiringan kamera 56 deg dan rotasi isometrik
  const handleToggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const next3D = !is3DMode;
    setIs3DMode(next3D);
    is3DModeRef.current = next3D;

    const currentZoom = map.getZoom();
    if (next3D) {
      map.easeTo({
        pitch: 56,
        bearing: map.getBearing() || -17,
        zoom: Math.max(currentZoom, 15.4),
        duration: 1000
      });
      if (map.getLayer('3d-buildings-extrusion')) {
        map.setPaintProperty('3d-buildings-extrusion', 'fill-extrusion-opacity', 0.85);
      }
    } else {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
      if (map.getLayer('3d-buildings-extrusion')) {
        map.setPaintProperty('3d-buildings-extrusion', 'fill-extrusion-opacity', 0.2);
      }
    }
  };
  // end of helper ------------------------------------------------------------------

  const handleResetCamera = () => {
    setIsOrbiting(false);
    mapRef.current?.flyTo({
      center: [106.8232, -6.1965],
      zoom: 15.2,
      pitch: is3DMode ? 56 : 0,
      bearing: is3DMode ? -17 : 0,
      speed: 1.0
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* tombol kontrol kamera peta 3d ala oyenza */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        <button
          id="b-3d"
          onClick={handleToggle3D}
          aria-pressed={is3DMode}
          className={`px-3.5 py-2.5 rounded-2xl shadow-floating font-black text-xs transition-all border flex items-center justify-center space-x-1 active:scale-95 ${
            is3DMode
              ? 'bg-amber-500 text-white border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/20'
              : 'bg-white/95 text-slate-700 border-slate-200/80 hover:text-amber-600 shadow-md'
          }`}
          title="Toggle Perspektif 3D / 2D (Oyenza Style)"
        >
          <span>{is3DMode ? '3D' : '2D'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          className="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-floating text-slate-700 hover:text-amber-600 transition-colors border border-slate-100 flex items-center justify-center group active:scale-95"
          title="Reset Sudut Pandang"
        >
          <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
        </button>
      </div>

      {/* HUD Inspeksi Lapangan 3D di Peta (Street Level View) */}
      {isStreetInspectActive && selectedReport && (
        <div className="absolute top-4 left-4 z-20 max-w-sm w-[90%] md:w-auto bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl border border-amber-500/60 shadow-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Inspeksi Lapangan 3D
              </span>
            </div>
            <button
              onClick={() => onToggleStreetInspect?.(false)}
              className="text-slate-300 hover:text-white text-xs font-bold px-2 py-0.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              ✕ Tutup
            </button>
          </div>

          <div>
            <h4 className="font-bold text-sm leading-tight text-white line-clamp-1">
              {selectedReport.title}
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
              {selectedReport.address}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <div className="px-2.5 py-1 bg-white/10 rounded-xl font-medium">
              Kedalaman: <span className="font-bold text-red-400">{selectedReport.depthCm} cm</span>
            </div>
            <div className="px-2.5 py-1 bg-white/10 rounded-xl font-medium">
              Lebar: <span className="font-bold text-amber-300">{selectedReport.widthCm} cm</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <button
              onClick={() => setIsOrbiting(!isOrbiting)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
                isOrbiting
                  ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isOrbiting ? 'animate-spin' : ''}`} />
              <span>{isOrbiting ? 'Berhenti Orbit' : 'Putar Orbit 360°'}</span>
            </button>

            <button
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;
                setIsOrbiting(false);
                map.easeTo({ pitch: 74, zoom: 19.2, duration: 600 });
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
              title="Sudut Permukaan Jalan"
            >
              Jalanan
            </button>

            <button
              onClick={() => {
                const map = mapRef.current;
                if (!map) return;
                setIsOrbiting(false);
                map.easeTo({ pitch: 0, zoom: 17.5, duration: 600 });
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
              title="Sudut Pandang Atas (2D)"
            >
              Atas
            </button>
          </div>
        </div>
      )}

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

      {/* render portal cctv popover ke dalam popup maplibre */}
      {cctvPopupNode && selectedCctv && createPortal(
        <CctvPopover
          cctv={selectedCctv}
          onClose={() => {
            if (cctvPopupInstanceRef.current) {
              cctvPopupInstanceRef.current.remove();
              cctvPopupInstanceRef.current = null;
            }
            setCctvPopupNode(null);
            onCloseCctv?.();
          }}
        />,
        cctvPopupNode
      )}
    </div>
  );
};
