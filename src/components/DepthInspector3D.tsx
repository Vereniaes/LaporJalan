// Show the same illustrative cavity profile in a separate, optional viewer.
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DamageReport } from '../types';
import { X } from 'lucide-react';
import { normalizeDamageDimensions } from '../map/dimensions';
import { createDamageGeometry, createDamageContour } from '../map/damageGeometry';
import { useModalDialog } from './useModalDialog';

export const DepthInspector3D: React.FC<{ report: DamageReport; onClose: () => void }> = ({ report, onClose }) => {
  const dialogRef = useModalDialog();
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateRef = useRef<(direction: number) => void>(() => {});
  const [error, setError] = useState('');
  const { widthM, depthM } = normalizeDamageDimensions(report);
  const supported = widthM !== null && depthM !== null && ['pothole', 'subsidence'].includes(report.type);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !supported || widthM === null || depthM === null) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { setError('Profil 3D belum didukung pada perangkat ini.'); return; }
    setError('');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#101722');
    const camera = new THREE.PerspectiveCamera(42, 1, 0.001, Math.max(widthM, depthM) * 30);
    const distance = Math.max(widthM, depthM * 2);
    camera.position.set(distance * 0.65, distance, distance * 1.3);
    camera.lookAt(0, -depthM / 2, 0);
    const group = new THREE.Group();
    const surface = new THREE.Group();
    surface.rotation.x = -Math.PI / 2;
    group.add(surface);
    scene.add(group, new THREE.AmbientLight(0xffffff, 1.6));
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(-2, 4, 3);
    scene.add(light);
    const geometry = createDamageGeometry(widthM, depthM);
    surface.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: '#36423e', roughness: 1 })));
    surface.add(new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#46d68b', wireframe: true, transparent: true, opacity: 0.5 })));
    surface.add(new THREE.Mesh(new THREE.RingGeometry(widthM / 2, widthM * 0.85, 64),
      new THREE.MeshStandardMaterial({ color: '#36423e', roughness: 1 })));
    if (depthM > 0) for (const fraction of [0.25, 0.5, 0.75]) {
      surface.add(new THREE.Line(createDamageContour(widthM, depthM, fraction),
        new THREE.LineBasicMaterial({ color: '#94f1ba' })));
    }
    const render = () => renderer.render(scene, camera);
    const resize = () => {
      const width = container.clientWidth, height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      render();
    };
    rotateRef.current = direction => {
      if (!direction) group.rotation.set(0, 0, 0);
      else group.rotation.y += direction * Math.PI / 12;
      render();
    };
    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';
    let previous: { x: number; y: number } | null = null;
    const down = (event: PointerEvent) => {
      previous = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!previous) return;
      group.rotation.y += (event.clientX - previous.x) * 0.009;
      group.rotation.x = Math.max(-0.4, Math.min(0.8, group.rotation.x + (event.clientY - previous.y) * 0.005));
      previous = { x: event.clientX, y: event.clientY };
      render();
    };
    const up = () => { previous = null; };
    canvas.addEventListener('pointerdown', down);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    return () => {
      rotateRef.current = () => {};
      observer.disconnect();
      canvas.removeEventListener('pointerdown', down);
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerup', up);
      canvas.removeEventListener('pointercancel', up);
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          geometries.add(object.geometry);
          for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
        }
      });
      geometries.forEach(item => item.dispose());
      materials.forEach(item => item.dispose());
      scene.clear();
      renderer.dispose();
      canvas.remove();
    };
  }, [supported, widthM, depthM]);

  return (
    <dialog ref={dialogRef} aria-labelledby="profile-title" onCancel={event => { event.preventDefault(); onClose(); }}
      className="m-auto w-[calc(100vw-24px)] max-w-xl max-h-[calc(100dvh-24px)] overflow-y-auto rounded-2xl border-0 bg-slate-900 p-0 text-white backdrop:bg-slate-950/70">
      <header className="flex items-start justify-between gap-3 border-b border-slate-800 p-4">
        <div><h2 id="profile-title" className="text-sm font-semibold">Profil ilustratif</h2><p className="mt-1 text-xs text-slate-400">{report.title}</p></div>
        <button onClick={onClose} title="Tutup profil" className="rounded-lg p-1 hover:bg-slate-800"><X className="h-5 w-5" /></button>
      </header>
      {supported ? <div ref={containerRef} className="h-72 w-full" aria-label="Model cekungan ilustratif" /> :
        <p role="status" className="p-8 text-sm text-slate-300">Bentuk belum tersedia - data dimensi belum lengkap.</p>}
      {error && <p role="status" className="p-4 text-sm text-amber-200">{error}</p>}
      <div className="space-y-3 p-4 text-xs">
        {supported && !error && <div className="flex gap-2">
          <button onClick={() => rotateRef.current(-1)} className="flex-1 rounded-lg bg-slate-800 p-2">Putar kiri</button>
          <button onClick={() => rotateRef.current(1)} className="flex-1 rounded-lg bg-slate-800 p-2">Putar kanan</button>
          <button onClick={() => rotateRef.current(0)} className="flex-1 rounded-lg bg-slate-800 p-2">Atur ulang</button>
        </div>}
        <p>Lebar: {widthM === null ? 'belum tersedia' : `${report.widthCm} cm`} · Kedalaman: {depthM === null ? 'belum tersedia' : `${report.depthCm} cm`}</p>
        <p className="leading-relaxed text-slate-400">Estimasi laporan, belum terverifikasi. Model memakai skala 1:1 dan bentuk radial ilustratif. Panjang, arah, volume lapangan, dan lebar jalan belum tersedia.</p>
        <button onClick={onClose} className="w-full rounded-xl bg-slate-800 py-2.5 font-semibold">Tutup profil</button>
      </div>
    </dialog>
  );
};
