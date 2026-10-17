/*
file ini buat peta 3d maplibre di browser
lengkap sama gedung timbul, kerucut cctv segitiga, garis macet, marker lubang, dan bercakan aspal fisik 3d
Todo:
-> pasang maplibre peta dengan kemiringan pitch 52-74 derajat
-> render bercakan kerusakan jalan langsung di atas aspal (decals polygon)
-> keep navigation and inspection camera modes consistent
-> mode inspeksi lapangan 3d (street level view) putar orbit 360 derajat
-> gambar poligon kerucut pandang (frustum) cctv ke jalanan
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import { DamageReport, CctvCamera, TrafficSegment } from '../types';
import { Compass, RotateCw } from 'lucide-react';
import { CctvPopover } from './CctvPopover';
import { CctvModal } from './CctvModal';
import { DamageLayer } from '../map/DamageLayer';
import { normalizeDamageDimensions } from '../map/dimensions';
import { CameraMode, cameraPose, inspectionZoom } from '../map/camera';
import { isMapCoordinate } from '../map/coordinates';
import { manageCloseZoomLabels } from '../map/closeZoomLabels';

interface Map3DProps {
  reports: DamageReport[];
  cctvList: CctvCamera[];
  trafficSegments: TrafficSegment[];
  selectedReport: DamageReport | null;
  selectedCctv?: CctvCamera | null;
  onCloseCctv?: () => void;
  targetFlyLocation?: { lng: number; lat: number } | null;
  cameraMode: CameraMode;
  onCameraModeChange: (mode: CameraMode) => void;
  onCloseInspection: () => void;
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

// The footprint follows report width; markers remain separate navigation aids.
function generateRoadDamageDecalsGeoJSON(reports: DamageReport[]) {
  return {
    type: 'FeatureCollection' as const,
    features: reports.flatMap(report => {
      const { widthM } = normalizeDamageDimensions(report);
      if (widthM === null || !isMapCoordinate(report.lng, report.lat) || !['pothole', 'subsidence'].includes(report.type)) return [];
      const radius = widthM / 2;
      const latitudeScale = Math.cos(report.lat * Math.PI / 180);
      const coordinates = Array.from({ length: 49 }, (_, index) => {
        const angle = index / 48 * Math.PI * 2;
        return [report.lng + radius * Math.cos(angle) / (111319.49 * latitudeScale),
          report.lat + radius * Math.sin(angle) / 111319.49];
      });
      return [{ type: 'Feature' as const,
        properties: { id: report.id, color: '#36423e', opacity: 0.8, borderColor: '#46b882', borderWidth: 1 },
        geometry: { type: 'Polygon' as const, coordinates: [coordinates] } }];
    }),
  };
}

export const Map3D: React.FC<Map3DProps> = ({
  reports,
  cctvList,
  trafficSegments,
  selectedReport,
  selectedCctv,
  onCloseCctv,
  targetFlyLocation,
  cameraMode,
  onCameraModeChange,
  onCloseInspection,
  onSelectReport,
  onSelectCctv,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const isStreetInspectActive = cameraMode === 'inspect';
  const is3DMode = cameraMode !== '2d';
  const [isOrbiting, setIsOrbiting] = useState(false);
  const isOrbitingRef = useRef(false);
  const orbitAnimRef = useRef<number | null>(null);

  const cctvPopupInstanceRef = useRef<maplibregl.Popup | null>(null);
  const [cctvPopupNode, setCctvPopupNode] = useState<HTMLElement | null>(null);
  const [expandedCctv, setExpandedCctv] = useState(false);
  const [styleRevision, setStyleRevision] = useState(0);
  const [inspectionMessage, setInspectionMessage] = useState<string | null>(null);
  const latestRef = useRef({ reports, cctvList, trafficSegments, onSelectReport, onSelectCctv });
  latestRef.current = { reports, cctvList, trafficSegments, onSelectReport, onSelectCctv };
  const cameraInputsRef = useRef<{
    mode: CameraMode; report: DamageReport | null;
    cctv: CctvCamera | null | undefined; search: typeof targetFlyLocation;
  } | null>(null);
  const activeTargetRef = useRef<'report' | 'search' | 'cctv'>('report');

  const inspectionCameraZoom = (map: maplibregl.Map, report: DamageReport) => {
    const { widthM, depthM } = normalizeDamageDimensions(report);
    if (widthM === null || depthM === null) return 18;
    const padding = map.getPadding();
    const availableHeight = map.getContainer().clientHeight - padding.top - padding.bottom;
    const diameter = Math.min(map.getContainer().clientWidth * 0.6, availableHeight * 0.55, 360);
    return inspectionZoom(widthM, depthM, report.lat, diameter);
  };

  const stopMotion = useCallback(() => {
    isOrbitingRef.current = false;
    if (orbitAnimRef.current !== null) cancelAnimationFrame(orbitAnimRef.current);
    orbitAnimRef.current = null;
    setIsOrbiting(false);
    mapRef.current?.stop();
  }, []);

  const changeMode = (mode: CameraMode) => {
    stopMotion();
    onCameraModeChange(mode);
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // style peta vektor bersih bernuansa terang openfreemap (bebas watermark carto)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/positron',
      center: [106.8232, -6.1965], // Bundaran HI - Thamrin
      zoom: 15.2,
      pitch: 56,
      bearing: -17, // rotasi menghadap koridor thamrin
      maxPitch: 75,
      maxZoom: 25.5,
      antialias: false
    });

    mapRef.current = map;
    const resizeMap = () => {
      map.resize();
      map.setPadding({ top: 0, left: 0, right: 0,
        bottom: window.innerWidth < 900 ? map.getContainer().clientHeight * 0.45 : 0 });
    };
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(mapContainer.current);
    resizeMap();

    const initializeLayers = () => {
      if (map.getSource('cctv-cones')) return;
      const { reports, cctvList, trafficSegments } = latestRef.current;
      // 1. tambahkan layer kerucut pandang (frustum) cctv
      const cctvFeatures = cctvList.filter(cam => isMapCoordinate(cam.lng, cam.lat)).map((cam) => ({
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

      // Building footprints and attributes follow the actual OpenFreeMap schema.
      const hasVectorBuildings = !!map.getSource('openmaptiles');
      if (!hasVectorBuildings) {
        map.addSource('buildings-3d', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      }
      for (const layer of map.getStyle().layers) {
        if (layer.type === 'symbol' && /poi|shield|housenumber/.test(layer.id)) {
          map.setLayoutProperty(layer.id, 'visibility', 'none');
        }
        if (layer.type === 'background') map.setPaintProperty(layer.id, 'background-color', '#f2f2f3');
        if (layer.id === 'building') map.setPaintProperty(layer.id, 'fill-color', '#e9e9ec');
        // Extend cartographic street widths for close inspection, without claiming surveyed widths.
        if (layer.type === 'line' && /highway|road/.test(layer.id)) {
          const width = map.getPaintProperty(layer.id, 'line-width');
          if (Array.isArray(width) && width[0] === 'interpolate' && typeof width[width.length - 1] === 'number') {
            const lastZoom = width[width.length - 2] as number;
            const lastWidth = width[width.length - 1] as number;
            if (lastZoom >= 18 && lastZoom < 25) {
              const extended = [...width];
              for (let zoom = lastZoom + 1; zoom <= 25; zoom++) extended.push(zoom, lastWidth * 2 ** (zoom - lastZoom));
              map.setPaintProperty(layer.id, 'line-width', extended);
            }
          }
        }
      }
      const buildingHeight: maplibregl.ExpressionSpecification = ['max', 0, ['coalesce', ['get', 'render_height'], 5]];
      map.addLayer({
        id: '3d-buildings-extrusion',
        type: 'fill-extrusion',
        source: hasVectorBuildings ? 'openmaptiles' : 'buildings-3d',
        ...(hasVectorBuildings ? { 'source-layer': 'building', filter: ['!=', ['get', 'hide_3d'], true] as maplibregl.FilterSpecification } : {}),
        minzoom: 14.5,
        paint: {
          'fill-extrusion-color': '#e9e9ec',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14.5, 0, 15.5, buildingHeight],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.92,
          'fill-extrusion-vertical-gradient': true,
        },
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

      setStyleRevision(revision => revision + 1);
    };

    map.on('style.load', initializeLayers);
    const stopCloseZoomLabels = manageCloseZoomLabels(map);

      // interaksi klik pada bercakan aspal
      map.on('click', 'road-damage-decals-fill', (e) => {
        if (e.features && e.features[0]) {
          const rawId = e.features[0].properties?.id as string;
          const targetId = rawId ? rawId.replace('-core', '').replace('-halo', '') : '';
          const rep = latestRef.current.reports.find((r) => r.id === targetId);
          if (rep) {
            latestRef.current.onSelectReport(rep);
          }
        }
      });

      map.on('mouseenter', 'road-damage-decals-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'road-damage-decals-fill', () => {
        map.getCanvas().style.cursor = '';
      });

    return () => {
      isOrbitingRef.current = false;
      if (orbitAnimRef.current !== null) cancelAnimationFrame(orbitAnimRef.current);
      orbitAnimRef.current = null;
      markersRef.current.forEach(marker => marker.remove());
      cctvPopupInstanceRef.current?.remove();
      resizeObserver.disconnect();
      map.off('style.load', initializeLayers);
      stopCloseZoomLabels();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Smooth city edges while keeping close inspection at the device resolution.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateResolution = () => {
      const nativeRatio = window.devicePixelRatio;
      const ratio = cameraMode === 'inspect' ? nativeRatio : Math.max(nativeRatio, 1.5);
      if (map.getPixelRatio() !== ratio) map.setPixelRatio(ratio);
    };
    updateResolution();
    window.addEventListener('resize', updateResolution);
    return () => window.removeEventListener('resize', updateResolution);
  }, [cameraMode]);

  // update data bercakan jalan jika reports berubah
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const decalSource = map.getSource('road-damage-decals') as maplibregl.GeoJSONSource;
    if (decalSource) {
      decalSource.setData(generateRoadDamageDecalsGeoJSON(
        isStreetInspectActive ? reports.filter(report => report.id !== selectedReport?.id) : reports
      ));
    }
  }, [reports, styleRevision, isStreetInspectActive, selectedReport]);

  // popup tertambat langsung di atas marker cctv ala transit.oyenza.com/cctv
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedCctv && isMapCoordinate(selectedCctv.lng, selectedCctv.lat)) {
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

    } else {
      if (cctvPopupInstanceRef.current) {
        cctvPopupInstanceRef.current.remove();
        cctvPopupInstanceRef.current = null;
      }
      setCctvPopupNode(null);
    }
    return () => {
      cctvPopupInstanceRef.current?.remove();
      cctvPopupInstanceRef.current = null;
    };
  }, [selectedCctv]);

  useEffect(() => { setExpandedCctv(false); }, [selectedCctv]);

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

    if (map.getSource('cctv-sightline')) {
      const sightSource = map.getSource('cctv-sightline') as maplibregl.GeoJSONSource;
      if (matchedCam && selectedReport && isMapCoordinate(matchedCam.lng, matchedCam.lat) && isMapCoordinate(selectedReport.lng, selectedReport.lat)) {
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
            <span>Tautan contoh • ${distM}m</span>
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
      if (!isMapCoordinate(cam.lng, cam.lat)) return;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'map-camera-marker';
      el.textContent = `CCTV ${cam.id.replace('cctv-', '')}`;
      el.title = cam.name;
      el.setAttribute('aria-label', cam.name);
      el.addEventListener('click', () => latestRef.current.onSelectCctv(cam));

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([cam.lng, cam.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });

    // pasang marker kerusakan jalan 3d
    reports.forEach((rep) => {
      if (!isMapCoordinate(rep.lng, rep.lat)) return;
      const isSelected = selectedReport?.id === rep.id;
      if (isSelected && isStreetInspectActive) return;
      const el = document.createElement('button');
      el.type = 'button';
      el.className = `map-report-marker ${isSelected ? 'selected' : ''}`;
      const labels = { pothole: 'LUBANG', trench: 'GALIAN', crack: 'RETAK', subsidence: 'AMBLES' };
      el.textContent = labels[rep.type];
      el.title = rep.title;
      el.setAttribute('aria-label', rep.title);
      el.setAttribute('aria-pressed', String(isSelected));
      el.addEventListener('click', () => latestRef.current.onSelectReport(rep));

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([rep.lng, rep.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [reports, cctvList, selectedReport, isStreetInspectActive, styleRevision]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('3d-buildings-extrusion') || !isStreetInspectActive || !selectedReport) {
      setInspectionMessage(null);
      return;
    }
    const { widthM, depthM } = normalizeDamageDimensions(selectedReport);
    if (!isMapCoordinate(selectedReport.lng, selectedReport.lat)) {
      setInspectionMessage('Lokasi laporan belum valid.');
      return;
    }
    if (widthM === null || depthM === null || !['pothole', 'subsidence'].includes(selectedReport.type)) {
      setInspectionMessage('Bentuk belum tersedia - data dimensi belum lengkap.');
      return;
    }
    if (!map.getCanvas().getContext('webgl2')) {
      setInspectionMessage('Inspeksi 3D belum didukung pada perangkat ini.');
      return;
    }
    const layer = new DamageLayer({ anchor: [selectedReport.lng, selectedReport.lat], widthM, depthM });
    map.addLayer(layer, '3d-buildings-extrusion');
    setInspectionMessage(inspectionCameraZoom(map, selectedReport) > map.getMaxZoom()
      ? 'Detail dibatasi pembesaran peta; ukuran model tetap 1:1.' : null);
    return () => {
      if (map.getLayer(layer.id)) map.removeLayer(layer.id);
    };
  }, [isStreetInspectActive, selectedReport, styleRevision]);

  // helper move the camera using the active mode ------------------------------------------------
  // input param : target center, zoom, and optional transition settings
  // output : one map transition after cancelling older motion
  const moveCamera = useCallback((target: maplibregl.FlyToOptions) => {
    const map = mapRef.current;
    if (!map) return;
    stopMotion();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const options = {
      ...cameraPose(cameraMode, map.getBearing()),
      duration: reducedMotion ? 0 : 800,
      ...target,
    };
    // v4 flyTo drops offsets under reduced motion; a zero-duration ease preserves them.
    if (reducedMotion) map.easeTo(options);
    else map.flyTo(options);
  }, [cameraMode, stopMotion]);
  // end of helper ------------------------------------------------------------------

  // Only changed inputs choose a target; an older selection cannot override a newer search.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const previous = cameraInputsRef.current;
    cameraInputsRef.current = { mode: cameraMode, report: selectedReport, cctv: selectedCctv, search: targetFlyLocation };

    if (targetFlyLocation && isMapCoordinate(targetFlyLocation.lng, targetFlyLocation.lat) && previous?.search !== targetFlyLocation) {
      activeTargetRef.current = 'search';
      moveCamera({ center: [targetFlyLocation.lng, targetFlyLocation.lat], zoom: 16.5 });
    } else if (selectedCctv && isMapCoordinate(selectedCctv.lng, selectedCctv.lat) && previous?.cctv !== selectedCctv) {
      activeTargetRef.current = 'cctv';
      moveCamera({
        center: [selectedCctv.lng, selectedCctv.lat],
        zoom: Math.min(Math.max(map.getZoom(), 15.8), 18.5),
        offset: window.innerWidth < 900 ? [-30, 130] : [0, 90],
      });
    } else if (selectedReport && isMapCoordinate(selectedReport.lng, selectedReport.lat) && (previous?.report?.id !== selectedReport.id ||
        (activeTargetRef.current === 'report' && (previous?.report?.lng !== selectedReport.lng || previous?.report?.lat !== selectedReport.lat)) ||
        (cameraMode === 'inspect' && (previous?.report?.widthCm !== selectedReport.widthCm || previous?.report?.depthCm !== selectedReport.depthCm)) ||
        (cameraMode === 'inspect' && previous?.mode !== cameraMode))) {
      activeTargetRef.current = 'report';
      moveCamera({ center: [selectedReport.lng, selectedReport.lat], zoom: cameraMode === 'inspect' ? inspectionCameraZoom(map, selectedReport) : 16.5,
        offset: cameraMode === 'inspect' ? [0, 75] : [0, 0] });
    } else if (previous?.mode !== cameraMode) {
      moveCamera({ zoom: previous?.mode === 'inspect' ? 16.5
        : cameraMode === '2d' ? map.getZoom() : Math.max(map.getZoom(), 15.4) });
    } else if (previous?.report && !selectedReport) {
      stopMotion();
    }
  }, [cameraMode, selectedReport, selectedCctv, targetFlyLocation, moveCamera, stopMotion]);

  useEffect(() => {
    const map = mapRef.current;
    if (map?.getLayer('3d-buildings-extrusion')) {
      map.setLayoutProperty('3d-buildings-extrusion', 'visibility', is3DMode ? 'visible' : 'none');
    }
  }, [is3DMode, styleRevision]);

  // loop animasi orbit 360 derajat mengelilingi titik kerusakan
  useEffect(() => {
    isOrbitingRef.current = isOrbiting;
    if (!isOrbiting || !isStreetInspectActive) {
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
        orbitAnimRef.current = null;
      }
      return;
    }

    let previousTime: number | null = null;
    const animateOrbit = (time: number) => {
      const map = mapRef.current;
      if (map && isOrbitingRef.current && !document.hidden) {
        const elapsed = previousTime === null ? 0 : Math.min(time - previousTime, 100);
        previousTime = time;
        const nextBearing = (map.getBearing() + elapsed * 0.021) % 360;
        map.easeTo({ bearing: nextBearing, duration: 0,
          around: selectedReport && isMapCoordinate(selectedReport.lng, selectedReport.lat)
            ? [selectedReport.lng, selectedReport.lat] : undefined });
        orbitAnimRef.current = requestAnimationFrame(animateOrbit);
      }
    };

    const stopWhenHidden = () => { if (document.hidden) stopMotion(); };
    document.addEventListener('visibilitychange', stopWhenHidden);
    orbitAnimRef.current = requestAnimationFrame(animateOrbit);
    return () => {
      document.removeEventListener('visibilitychange', stopWhenHidden);
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
      }
    };
  }, [isOrbiting, isStreetInspectActive, stopMotion, selectedReport]);

  // helper toggle perspektif 3d / 2d ala oyenza --------------------------------------------------------------------------
  // input param : status 3d boolean
  // output : transisi kemiringan kamera 56 deg dan rotasi isometrik
  const handleToggle3D = () => {
    changeMode(is3DMode ? '2d' : '3d');
  };
  // end of helper ------------------------------------------------------------------

  const handleResetCamera = () => {
    if (isStreetInspectActive) onCloseInspection();
    moveCamera({
      center: [106.8232, -6.1965],
      zoom: 15.2,
      bearing: is3DMode ? -17 : 0,
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* tombol kontrol kamera peta 3d ala oyenza */}
      <div className="map-controls absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        <button
          id="b-3d"
          onClick={handleToggle3D}
          aria-pressed={is3DMode}
          className={`px-3.5 py-2.5 rounded-2xl shadow-floating font-black text-xs transition-all border flex items-center justify-center space-x-1 active:scale-95 ${
            is3DMode
              ? 'bg-white text-slate-900 border-slate-200'
              : 'bg-white/95 text-slate-700 border-slate-200/80 hover:text-amber-600 shadow-md'
          }`}
          title="Perspektif 3D / 2D"
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

      <div className="map-zoom absolute top-32 right-4 z-20 flex flex-col">
        <button aria-label="Perbesar peta" onClick={() => {
          if (mapRef.current) moveCamera({ zoom: Math.min(mapRef.current.getZoom() + 1, mapRef.current.getMaxZoom()) });
        }}>+</button>
        <button aria-label="Perkecil peta" onClick={() => {
          if (mapRef.current) moveCamera({ zoom: Math.max(mapRef.current.getZoom() - 1, mapRef.current.getMinZoom()) });
        }}>−</button>
      </div>

      {/* HUD Inspeksi Lapangan 3D di Peta (Street Level View) */}
      {isStreetInspectActive && selectedReport && (
        <div className="absolute top-4 left-4 z-20 max-w-sm w-[calc(100%-6rem)] md:w-auto bg-slate-900/95 backdrop-blur-md text-white p-3 md:p-4 rounded-3xl border border-amber-500/60 shadow-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                Inspeksi Lapangan 3D
              </span>
            </div>
            <button
              onClick={() => {
                stopMotion();
                onCloseInspection();
              }}
              className="text-slate-300 hover:text-white text-xs font-bold px-2 py-0.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              ✕ Tutup
            </button>
          </div>

          <div>
            <h4 className="hidden md:block font-bold text-sm leading-tight text-white line-clamp-1">
              {selectedReport.title}
            </h4>
            <p className="hidden md:block text-xs text-slate-300 mt-0.5 line-clamp-1">
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

          <p className="text-[10px] text-slate-300">Model estimasi 1:1 - bentuk ilustratif</p>
          {inspectionMessage && <p role="status" className="text-xs text-amber-200">{inspectionMessage}</p>}
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
                if (mapRef.current) moveCamera({ zoom: inspectionCameraZoom(mapRef.current, selectedReport), offset: [0, 75] });
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
              title="Sudut Permukaan Jalan"
            >
              Jalanan
            </button>

            <button
              onClick={() => {
                changeMode('2d');
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
      <div className="absolute bottom-12 right-5 z-20 hidden md:flex items-center space-x-3 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-soft text-xs text-slate-600">
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
          onFullscreen={() => setExpandedCctv(true)}
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
      {expandedCctv && selectedCctv && createPortal(
        <CctvModal cctv={selectedCctv} onClose={() => setExpandedCctv(false)} />, document.body
      )}
    </div>
  );
};
