/* Draw a confirmed road line or area on the existing map.
Todo:
-> keep sketch controls usable without double-click gestures
*/
import { useEffect, useState } from 'react';
import type { Map as LibreMap, GeoJSONSource } from 'maplibre-gl';
import type { ConditionGeometry } from './condition';
import { emptyFeatures, sketchFeatures } from './conditionFeatures';

export type DrawingRequest = { id: string; mode: 'line'|'area' };
export function MapSketch({ map, epoch, drawing, preview, onComplete, onCancel }: {
  map?: LibreMap; epoch: number; drawing?: DrawingRequest|null; preview?: ConditionGeometry|null;
  onComplete?: (geometry: ConditionGeometry) => void; onCancel?: () => void;
}) {
  const [points, setPoints] = useState<[number,number][]>([]);
  useEffect(() => { setPoints([]); }, [drawing?.id]);
  useEffect(() => {
    if (!map || !drawing) return;
    const click = (event: { lngLat: { lng:number;lat:number } }) => setPoints(rows => rows.length >= 64 ? rows : [...rows,[event.lngLat.lng,event.lngLat.lat]]);
    map.on('click',click);
    return () => { map.off('click',click); };
  }, [map,drawing?.id]);
  useEffect(() => {
    if (!map || !epoch) return;
    if (!map.getSource('condition-sketch')) {
      map.addSource('condition-sketch',{type:'geojson',data:emptyFeatures()});
      map.addLayer({id:'condition-sketch-area',type:'fill',source:'condition-sketch',filter:['==',['geometry-type'],'Polygon'],paint:{'fill-color':'#0b5b70','fill-opacity':.15}});
      map.addLayer({id:'condition-sketch-line',type:'line',source:'condition-sketch',filter:['!=',['geometry-type'],'Point'],paint:{'line-color':'#0b5b70','line-width':3,'line-dasharray':[2,1]}});
      map.addLayer({id:'condition-sketch-point',type:'circle',source:'condition-sketch',filter:['==',['geometry-type'],'Point'],paint:{'circle-radius':5,'circle-color':'#fff','circle-stroke-color':'#0b5b70','circle-stroke-width':2}});
    }
  }, [map,epoch]);
  useEffect(() => {
    if (!map || !epoch) return;
    const source = map.getSource('condition-sketch') as GeoJSONSource|undefined;
    if (!source) return;
    source.setData(drawing ? sketchFeatures(points,drawing.mode === 'area') : preview ? {type:'FeatureCollection',features:[{type:'Feature',properties:{},geometry:preview}]} : emptyFeatures());
  }, [map,epoch,drawing?.id,drawing?.mode,points,preview]);
  if (!drawing) return null;
  const minimum = drawing.mode === 'area' ? 3 : 2;
  return <div className="lj-map-drawing" role="region" aria-label="Gambar lokasi">
    <strong>{drawing.mode === 'area' ? 'Gambar area' : 'Gambar ruas'}</strong><p>Klik titik pada peta. {points.length}/64 titik.</p>
    <div><button disabled={points.length>=64} onClick={()=>{const center=map?.getCenter();if(center)setPoints(rows=>[...rows,[center.lng,center.lat]]);}}>Tambah titik di tengah peta</button><button disabled={!points.length} onClick={() => setPoints(rows=>rows.slice(0,-1))}>Urungkan titik</button>
      <button disabled={points.length<minimum} onClick={() => onComplete?.(drawing.mode === 'area' ? {type:'Polygon',coordinates:[[...points,points[0]]]} : {type:'LineString',coordinates:points})}>Selesai menggambar</button>
      <button onClick={onCancel}>Batal menggambar</button></div>
  </div>;
}
