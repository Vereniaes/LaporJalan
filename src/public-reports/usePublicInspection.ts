/* Inspect one reported condition on the existing map camera.
Todo:
-> restore the complete view and release only owned graphics
*/
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import maplibregl, { type Map as LibreMap, type GeoJSONSource } from 'maplibre-gl';
import type { DamageLayer } from '../map/DamageLayer';
import { cameraPose, inspectionZoom, type CameraMode, type NavigationMode } from '../map/camera';
import { getInspectionRepresentation, type RoadCondition } from './condition';
import { conditionSymbols, emptyFeatures, geometryAnchor, geometryBounds } from './conditionFeatures';
import { bearing, lineLength, pointAlong, type LngLat } from '../map/geo';
import type { PublicReport } from './data';

export const PUBLIC_MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';

export function configurePublicCamera(map: LibreMap, mode: CameraMode) {
  map.setMaxPitch(mode === '2d' ? 0 : 60);
  map.setMaxZoom(mode === 'inspect' ? 25.5 : 19);
  if (mode === '2d') {
    map.dragRotate.disable(); map.touchZoomRotate.disableRotation(); map.touchPitch.disable(); map.keyboard.disableRotation();
  } else {
    map.dragRotate.enable(); map.touchZoomRotate.enableRotation(); map.touchPitch.enable(); map.keyboard.enableRotation();
  }
}
type Pose = { center: [number,number]; zoom: number; pitch: number; bearing: number; padding: maplibregl.PaddingOptions };
export const publicCameraSnapshot = (map: LibreMap): Pose => ({ center: map.getCenter().toArray() as [number,number], zoom:map.getZoom(),pitch:map.getPitch(),bearing:map.getBearing(),padding:map.getPadding() });

// Purpose : arrive at the start of a stretch, ride along it, then show all of it
// Input   : map, line coordinates, done (frames the whole line)
// Output  : stop function; a user drag or zoom also stops it
// Why/Note: linear, 12 ms per metre clamped to 2.6-6 s - the road is the timeline, so no easing
function travelAlong(map: LibreMap, line: LngLat[], done: () => void) {
  const total = lineLength(line), ms = Math.min(6000, Math.max(2600, total * 12));
  const pose = (metres: number) => {
    const from = Math.max(0, Math.min(metres, total - 10)); // look 10 m ahead; near the end keep the last heading
    return { center: pointAlong(line, metres), bearing: bearing(pointAlong(line, from), pointAlong(line, Math.min(total, from + 10))) };
  };
  let raf = 0, start = 0;
  const stop = () => { cancelAnimationFrame(raf); map.off('movestart', userMove); };
  const userMove = (event: { originalEvent?: unknown }) => { if (event.originalEvent) stop(); };
  const tick = (time: number) => {
    start ||= time;
    const t = Math.min(1, (time - start) / ms);
    map.jumpTo(pose(t * total));
    if (t < 1) raf = requestAnimationFrame(tick); else { stop(); done(); }
  };
  map.jumpTo({ ...pose(0), zoom: 19.5, pitch: 60 });
  map.on('movestart', userMove);
  raf = requestAnimationFrame(tick);
  return stop;
}

export function usePublicInspection(mapRef: MutableRefObject<LibreMap|undefined>, epoch: number, selected: PublicReport|null,
  requested: boolean, mode: CameraMode, setMode: (mode: CameraMode)=>void, onExit?: ()=>void) {
  const session = useRef<{id:string; pose:Pose; mode:NavigationMode}>();
  const layer = useRef<DamageLayer>();
  const exitMode = useRef<NavigationMode>();
  const travel = useRef<() => void>();
  const latest = useRef({ selected, onExit }); latest.current = {selected,onExit};
  const [error,setError] = useState(''), [orbiting,setOrbiting] = useState(false), [loading,setLoading] = useState(false);
  const condition = selected?.condition;
  const conditionKey = JSON.stringify(condition);
  const representation = getInspectionRepresentation(condition);
  const active = requested && !!condition && !!selected;

  function removeLayer(instance: LibreMap) {
    travel.current?.(); travel.current = undefined;
    if (layer.current) {
      try { if (instance.getLayer(layer.current.id)) instance.removeLayer(layer.current.id); }
      finally { if (!layer.current.getState().disposed) layer.current.onRemove(); layer.current=undefined; }
    }
    const source=instance.getSource('condition-symbols') as GeoJSONSource|undefined;
    source?.setData(emptyFeatures());
  }
  function frame(instance: LibreMap, data: RoadCondition, report: PublicReport, arrive = false) {
    travel.current?.(); travel.current = undefined;
    const geometry=data.geometry;
    if (geometry.type !== 'Point') {
      const fit=(duration:number)=>instance.fitBounds(geometryBounds(geometry),{padding:{top:70,bottom:145,left:32,right:64},maxZoom:21,pitch:60,bearing:instance.getBearing(),duration});
      // a stretch is ridden first (owner choice, 9 Nov); reduced motion and re-framing go straight to the end pose
      if (arrive && geometry.type==='LineString' && !matchMedia('(prefers-reduced-motion: reduce)').matches) travel.current=travelAlong(instance,geometry.coordinates,()=>fit(900));
      else fit(0);
    } else {
      const rep=getInspectionRepresentation(data)!;
      const width=rep.kind==='bowl'?rep.widthM!:2.4, depth=rep.kind==='bowl'?rep.depthM!:.7;
      const pixels=Math.max(60,Math.min(instance.getCanvas().clientWidth-110,instance.getCanvas().clientHeight-230)*.65);
      instance.jumpTo({center:geometry.coordinates,zoom:Math.min(25.5,inspectionZoom(width,depth,geometry.coordinates[1],pixels)),...cameraPose('inspect',instance.getBearing()),padding:{top:20,bottom:150,left:20,right:20}});
    }
  }
  useEffect(()=>{
    const instance=mapRef.current;
    if (!instance || !epoch) return;
    const stop=()=>setOrbiting(false);
    const lost=()=>{ stop(); setError('Grafis 3D terhenti. Menunggu pemulihan peta.'); };
    // MapLibre 4 retains tile buffers after context loss; reload native and owned resources together.
    const restored=()=>{ setError(''); instance.setStyle(PUBLIC_MAP_STYLE,{diff:false}); };
    const resize=()=>{ const row=latest.current.selected; if(session.current && row?.condition) frame(instance,row.condition,row); };
    const visibility=()=>{ if(document.hidden) stop(); };
    instance.on('webglcontextlost',lost); instance.on('webglcontextrestored',restored); instance.on('resize',resize); instance.on('dragstart',stop);
    document.addEventListener('visibilitychange',visibility);
    return ()=>{instance.off('webglcontextlost',lost);instance.off('webglcontextrestored',restored);instance.off('resize',resize);instance.off('dragstart',stop);document.removeEventListener('visibilitychange',visibility);};
  },[epoch]);
  useEffect(()=>{
    const instance=mapRef.current;
    if (!instance || !epoch) return;
    if (!active) {
      setOrbiting(false);setLoading(false);
      if (session.current) {
        const saved=session.current;session.current=undefined;
        removeLayer(instance);
        const restoreMode=exitMode.current??saved.mode;exitMode.current=undefined;
        configurePublicCamera(instance,restoreMode);
        instance.stop();instance.jumpTo({...saved.pose,...(restoreMode==='2d'?cameraPose('2d',0):{})});setMode(restoreMode);
      }
      return;
    }
    if (!session.current) session.current={id:selected!.id,pose:publicCameraSnapshot(instance),mode:mode==='2d'?'2d':'3d'};
    instance.stop();configurePublicCamera(instance,'inspect');
    if(instance.getLayer('public-buildings-3d'))instance.setLayoutProperty('public-buildings-3d','visibility','visible');
    setMode('inspect');setError('');
    removeLayer(instance);
    let cancelled=false;
    const install=async()=>{
      const rep=getInspectionRepresentation(condition)!;
      if (rep.kind==='bowl') {
        const gl=instance.getCanvas().getContext('webgl2');
        if (!gl || typeof WebGL2RenderingContext==='undefined' || !(gl instanceof WebGL2RenderingContext)) throw new Error('WebGL2 unavailable');
        setLoading(true);
        const {DamageLayer}=await import('../map/DamageLayer');
        if(cancelled || !instance.getSource('condition-symbols'))return;
        layer.current=new DamageLayer({anchor:geometryAnchor(condition!.geometry,[selected!.lng,selected!.lat]),widthM:rep.widthM!,depthM:rep.depthM!});
        instance.addLayer(layer.current,instance.getLayer('public-buildings-3d')?'public-buildings-3d':undefined);
      } else {
        const source=instance.getSource('condition-symbols') as GeoJSONSource|undefined;
        source?.setData(conditionSymbols(condition!,[selected!.lng,selected!.lat]));
      }
      setLoading(false);frame(instance,condition!,selected!,true);instance.triggerRepaint();
    };
    void install().catch(()=>{
      if(cancelled)return;
      removeLayer(instance);setLoading(false);setError('Representasi 3D belum tersedia pada perangkat ini. Informasi laporan tetap tersedia di peta 2D.');exitMode.current='2d';latest.current.onExit?.();
    });
    return ()=>{cancelled=true;try{removeLayer(instance);}catch{/* The map may already be removed during teardown. */}};
  },[active,selected?.id,conditionKey,epoch]);
  useEffect(()=>{
    if(!orbiting || !active)return;
    const instance=mapRef.current;if(!instance)return;
    let raf=0,previous=performance.now();
    const tick=(time:number)=>{const delta=Math.min(64,time-previous);previous=time;const center=instance.getCenter();instance.jumpTo({center,bearing:instance.getBearing()+delta*.012});raf=requestAnimationFrame(tick);};
    raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf);
  },[orbiting,active]);
  useEffect(()=>()=>{const instance=mapRef.current;if(instance){try{removeLayer(instance);}catch{/* Shared map teardown owns remaining native layers. */}}},[]);
  return {active,error,orbiting,loading,label:representation?.kind==='bowl'?`Profil ilustratif · ${representation.label}`:'Simbol 3D - ukuran objek ilustratif',
    exitTo2D:()=>{exitMode.current='2d';setOrbiting(false);latest.current.onExit?.();},
    stop:()=>{setOrbiting(false);latest.current.onExit?.();},
    rotate:()=>{const instance=mapRef.current;if(!instance)return;travel.current?.();travel.current=undefined;if(matchMedia('(prefers-reduced-motion: reduce)').matches)instance.jumpTo({bearing:instance.getBearing()+90});else setOrbiting(value=>!value);},
  };
}
