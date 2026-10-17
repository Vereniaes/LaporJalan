/*
file ini buat penampil potongan melintang 3d jalan berlubang persis video acuan
pake three.js dengan aspal terdeformasi ke bawah, wireframe neon hijau, dan cincin kontur kedalaman
Todo:
-> bentuk cekungan aspal fisik dengan fungsi radial falloff ke arah bawah
-> pasang jaring-jaring kawat wireframe neon hijau di atas lekukan lubang
-> render cincin garis kontur kedalaman 1cm, 3cm, 5cm di dalam kawah lubang
-> putar model 360 derajat interaktif dan bersihkan memori webgl saat modal ditutup
*/

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { DamageReport } from '../types';
import { X, RotateCcw, AlertTriangle, Layers, Ruler } from 'lucide-react';

interface DepthInspector3DProps {
  report: DamageReport;
  onClose: () => void;
}

export const DepthInspector3D: React.FC<DepthInspector3DProps> = ({ report, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [activeRingLevel, setActiveRingLevel] = useState<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // inisialisasi scene dan kamera three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // latar gelap studio ala video 3d

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 50);
    camera.position.set(2.8, 2.4, 3.2);
    camera.lookAt(0, -0.15, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // pencahayaan terarah studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(4, 6, 4);
    scene.add(dirLight);

    const greenAccentLight = new THREE.PointLight(0x22c55e, 2.5, 6);
    greenAccentLight.position.set(0, 0.5, 0);
    scene.add(greenAccentLight);

    // group utama yang bisa dirotasi
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // =========================================================================
    // 1. pembuatan geometri aspal terdeformasi ke bawah (deformed surface plane)
    // =========================================================================
    const slabWidth = 3.4;
    const slabLength = 2.6;
    const segmentsX = 64;
    const segmentsZ = 48;

    const roadGeo = new THREE.PlaneGeometry(slabWidth, slabLength, segmentsX, segmentsZ);
    roadGeo.rotateX(-Math.PI / 2); // orientasi horizontal menghadap atas

    const pos = roadGeo.attributes.position;
    const depthM = Math.max(0.04, (report.depthCm || 7.5) / 100);
    const radiusM = Math.max(0.18, ((report.widthCm || 52) / 200));
    const sigma = radiusM * 0.7;

    // manipulasi vertex aspal ke bawah membentuk kawah lubang
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      if (report.type === 'trench') {
        // depresi parit galian memanjang
        const dist = Math.abs(x);
        if (dist < radiusM * 1.4) {
          const depression = -depthM * Math.exp(-(dist * dist) / (2 * sigma * sigma));
          pos.setY(i, depression);
        }
      } else {
        // depresi kawah lubang radial dengan tekstur tak beraturan mikro
        const dist = Math.sqrt(x * x + z * z);
        if (dist < radiusM * 1.5) {
          const noise = 1.0 + 0.06 * Math.sin(x * 24) * Math.cos(z * 24);
          const depression = -depthM * Math.exp(-(dist * dist) / (2 * sigma * sigma)) * noise;
          pos.setY(i, depression);
        }
      }
    }
    roadGeo.computeVertexNormals();

    // material permukaan aspal
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.85,
      metalness: 0.1,
    });
    const asphaltMesh = new THREE.Mesh(roadGeo, asphaltMat);
    asphaltMesh.receiveShadow = true;
    roadGroup.add(asphaltMesh);

    // =========================================================================
    // 2. jaring-jaring kawat wireframe neon hijau (persis video acuan)
    // =========================================================================
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    const wireframeMesh = new THREE.Mesh(roadGeo, wireframeMat);
    wireframeMesh.position.y = 0.002; // sedikit di atas aspal agar tidak z-fighting
    roadGroup.add(wireframeMesh);

    // marka garis putih jalan di tepi
    const stripeGeo = new THREE.PlaneGeometry(0.1, 2.6);
    stripeGeo.rotateX(-Math.PI / 2);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(-1.1, 0.004, 0);
    roadGroup.add(stripeMesh);

    // =========================================================================
    // 3. cincin garis kontur elevasi kedalaman (1cm, 3cm, 5cm)
    // =========================================================================
    const ringLevels = [
      { depthCm: 1.0, color: 0x38bdf8 },
      { depthCm: 3.0, color: 0x4ade80 },
      { depthCm: Math.min(5.0, Math.round(report.depthCm * 0.75)), color: 0xfacc15 },
      { depthCm: report.depthCm, color: 0xef4444 },
    ].filter((lvl, idx, self) => idx === self.findIndex((t) => t.depthCm === lvl.depthCm && lvl.depthCm <= report.depthCm));

    ringLevels.forEach((lvl) => {
      const ringDepthM = lvl.depthCm / 100;
      if (ringDepthM >= depthM) return;

      // estimasi radius cincin pada elevasi tertentu
      const ratio = ringDepthM / depthM;
      const ringRadius = sigma * Math.sqrt(Math.max(0.01, -2 * Math.log(ratio)));

      const points: THREE.Vector3[] = [];
      const numPts = 32;
      for (let p = 0; p <= numPts; p++) {
        const theta = (p / numPts) * 2 * Math.PI;
        points.push(new THREE.Vector3(
          ringRadius * Math.cos(theta),
          -ringDepthM,
          ringRadius * Math.sin(theta)
        ));
      }

      const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color: lvl.color,
        linewidth: 2,
        transparent: true,
        opacity: 0.9,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      roadGroup.add(ringLine);
    });

    // =========================================================================
    // 4. interaksi rotasi kursor & sentuhan smartphone
    // =========================================================================
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      roadGroup.rotation.y += deltaX * 0.009;
      roadGroup.rotation.x = Math.max(-0.4, Math.min(0.8, roadGroup.rotation.x + deltaY * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      roadGroup.rotation.y += deltaX * 0.009;
      roadGroup.rotation.x = Math.max(-0.4, Math.min(0.8, roadGroup.rotation.x + deltaY * 0.005));
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        roadGroup.rotation.y += 0.0025; // rotasi halus saat idle
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // 5. pembersihan memori webgl tuntas (zero memory leak guardrail)
    // =========================================================================
    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', handleResize);

      // traversal dispose semua geometri dan material
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      if (rendererRef.current) {
        if (dom.parentNode) {
          dom.parentNode.removeChild(dom);
        }
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
      }
    };
  }, [report]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col text-white">
        {/* header modal minimalis modern */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-100 text-sm leading-tight">
                  Inspeksi Volumetrik 3D: {report.title}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Wireframe Mesh
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Profil Potongan Melintang Kerusakan Perkerasan Jalan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3d canvas container bertema gelap ala video referensi */}
        <div className="relative w-full h-72 md:h-80 bg-slate-950" ref={containerRef}>
          {/* overlay indikator cincin elevasi kedalaman */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10 pointer-events-none">
            <div className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-mono flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>Kontur 1 cm</span>
            </div>
            <div className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-mono flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Kontur 3 cm</span>
            </div>
            {report.depthCm >= 5 && (
              <div className="px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-xl border border-white/10 text-[10px] font-mono flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                <span>Kedalaman Maks: {report.depthCm} cm</span>
              </div>
            )}
          </div>

          {/* floating hint sentuh & putar */}
          <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-slate-300 flex items-center space-x-1.5 shadow-sm pointer-events-none">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Sentuh & putar orbit 360°</span>
          </div>

          {/* status keparahan bina marga */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-semibold text-slate-200 shadow-sm flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${report.severity === 'berat' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span>Tingkat: {report.severity.toUpperCase()}</span>
          </div>
        </div>

        {/* metrik telemetri & rekomendasi penanganan */}
        <div className="p-4 md:p-5 bg-slate-900 border-t border-slate-800 space-y-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
              <span className="block text-[11px] font-medium text-slate-400">Kedalaman Terukur</span>
              <span className="text-lg font-black text-red-400">
                {report.depthCm} <span className="text-xs font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
              <span className="block text-[11px] font-medium text-slate-400">Lebar Lubang</span>
              <span className="text-lg font-black text-slate-100">
                {report.widthCm} <span className="text-xs font-normal text-slate-400">cm</span>
              </span>
            </div>
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 text-center">
              <span className="block text-[11px] font-medium text-slate-400">Estimasi Volume</span>
              <span className="text-lg font-black text-emerald-400">
                {((Math.PI * Math.pow((report.widthCm || 50) / 200, 2) * (report.depthCm / 100)) / 2).toFixed(3)}{' '}
                <span className="text-xs font-normal text-slate-400">m³</span>
              </span>
            </div>
          </div>

          {/* catatan aksi rekomendasi bina marga */}
          <div className="p-3 bg-amber-950/30 rounded-2xl border border-amber-800/40 flex items-start space-x-2.5 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300">Rekomendasi Penanganan: </strong>
              {report.type === 'trench'
                ? 'Pemadatan ulang galian lapis fondasi perkerasan dan perataan aspal hotmix (Kode P5/U1).'
                : report.depthCm > 5
                ? 'Penambalan cepat darurat (<24 Jam) karena kedalaman kritis membahayakan velg dan roda dua.'
                : 'Pemeliharaan rutin penutupan celah retak (P3) sebelum air hujan merembes ke fondasi dasar.'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-white font-bold text-xs rounded-2xl transition-all shadow-sm"
          >
            Tutup Inspeksi 3D
          </button>
        </div>
      </div>
    </div>
  );
};
