/*
file ini nampilin visualisasi 3d potongan melintang lubang atau galian jalan
pake three.js biar user di hp atau desktop bisa muter-muter liat kedalaman aspal
Todo:
-> bikin balok jalan aspal 3 lapis (surface, base, tanah dasar)
-> ukir lubang atau parit galian sesuai kedalaman cm aktual
-> pasang garis ukur dimensi kedalaman sama lebar interaktif
-> support sentuhan jari hp buat rotate 360 derajat
*/

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DamageReport } from '../types';
import { X, RotateCcw, AlertTriangle, Layers } from 'lucide-react';

interface DepthInspector3DProps {
  report: DamageReport;
  onClose: () => void;
}

export const DepthInspector3D: React.FC<DepthInspector3DProps> = ({ report, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // init scene three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(4, 3.5, 4.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // tata pencahayaan lembut studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // group model jalan 3d
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // lapis 1: tanah dasar / subgrade (paling bawah, cokelat tanah)
    const subgradeGeo = new THREE.BoxGeometry(3.6, 0.5, 2.6);
    const subgradeMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.9 });
    const subgrade = new THREE.Mesh(subgradeGeo, subgradeMat);
    subgrade.position.y = -0.55;
    roadGroup.add(subgrade);

    // lapis 2: fondasi agregat / base course (tengah, abu-abu batu pecah)
    const baseGeo = new THREE.BoxGeometry(3.6, 0.4, 2.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -0.1;
    roadGroup.add(baseMesh);

    // lapis 3: aspal permukaan utama (wearing course, hitam aspal)
    // buat potongan aspal yang berlubang/bergalian di tengah
    const asphaltMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    
    // rasio kedalaman terhadap visual 3d (skala visual)
    const depthRatio = Math.min(0.35, Math.max(0.08, (report.depthCm / 15) * 0.35));
    const widthRatio = Math.min(1.2, Math.max(0.4, (report.widthCm / 100) * 0.8));

    if (report.type === 'trench') {
      // visualisasi galian utilitas melintang (dua balok aspal terpisah oleh parit)
      const leftBlock = new THREE.Mesh(new THREE.BoxGeometry((3.6 - widthRatio) / 2, 0.3, 2.6), asphaltMat);
      leftBlock.position.set(-1.8 + (3.6 - widthRatio) / 4, 0.25, 0);
      roadGroup.add(leftBlock);

      const rightBlock = new THREE.Mesh(new THREE.BoxGeometry((3.6 - widthRatio) / 2, 0.3, 2.6), asphaltMat);
      rightBlock.position.set(1.8 - (3.6 - widthRatio) / 4, 0.25, 0);
      roadGroup.add(rightBlock);

      // dasar galian utilitas yang ambles
      const trenchBottom = new THREE.Mesh(
        new THREE.BoxGeometry(widthRatio, 0.3 - depthRatio, 2.6),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 })
      );
      trenchBottom.position.set(0, 0.25 - depthRatio / 2, 0);
      roadGroup.add(trenchBottom);
    } else {
      // visualisasi lubang mangkok aspal
      const mainSlab = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 2.6), asphaltMat);
      mainSlab.position.y = 0.25;
      roadGroup.add(mainSlab);

      // silinder / depresi lubang hitam
      const holeDepth = depthRatio;
      const holeRadius = widthRatio / 2;
      const holeGeo = new THREE.CylinderGeometry(holeRadius, holeRadius * 0.7, holeDepth + 0.05, 24);
      const holeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
      const holeMesh = new THREE.Mesh(holeGeo, holeMat);
      holeMesh.position.set(0, 0.4 - holeDepth / 2, 0);
      roadGroup.add(holeMesh);

      // agregat dasar yang terbuka di dasar lubang
      const exposedBase = new THREE.Mesh(
        new THREE.CylinderGeometry(holeRadius * 0.68, holeRadius * 0.65, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
      );
      exposedBase.position.set(0, 0.4 - holeDepth, 0);
      roadGroup.add(exposedBase);
    }

    // marka garis putih jalan di permukaan
    const stripeGeo = new THREE.BoxGeometry(0.12, 0.01, 2.6);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const stripeMesh = new THREE.Mesh(stripeGeo, stripeMat);
    stripeMesh.position.set(-1.2, 0.405, 0);
    roadGroup.add(stripeMesh);

    // interaksi rotasi sentuh atau geser kursor
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
      roadGroup.rotation.y += deltaX * 0.01;
      roadGroup.rotation.x += deltaY * 0.005;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // touch gesture untuk smartphone
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
      roadGroup.rotation.y += deltaX * 0.01;
      roadGroup.rotation.x += deltaY * 0.005;
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
        // rotasi halus perlahan saat diam
        roadGroup.rotation.y += 0.003;
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

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && dom.parentNode) {
        dom.parentNode.removeChild(dom);
        rendererRef.current.dispose();
      }
    };
  }, [report]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-floating overflow-hidden border border-slate-100 flex flex-col">
        {/* header modal */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-100 bg-white">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm leading-tight">
                Inspeksi Dimensi 3D: {report.title}
              </h3>
              <p className="text-xs text-slate-500">
                Profil Potongan Melintang Kerusakan Perkerasan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3d canvas container */}
        <div className="relative w-full h-64 bg-slate-50" ref={containerRef}>
          {/* floating hint */}
          <div className="absolute bottom-3 left-3 bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/60 text-xs text-slate-600 flex items-center space-x-1.5 shadow-sm pointer-events-none">
            <RotateCcw className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Sentuh & putar model 360°</span>
          </div>

          {/* status badge */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-slate-200/60 text-xs font-semibold text-slate-700 shadow-sm flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${report.severity === 'berat' ? 'bg-red-500' : report.severity === 'sedang' ? 'bg-amber-500' : 'bg-yellow-500'}`}></span>
            <span>Tingkat: {report.severity.toUpperCase()}</span>
          </div>
        </div>

        {/* dimensi & informasi bina marga */}
        <div className="p-5 bg-white space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="block text-xs font-medium text-slate-400">Kedalaman</span>
              <span className="text-lg font-bold text-red-600">
                ~{report.depthCm} <span className="text-xs font-normal">cm</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="block text-xs font-medium text-slate-400">Lebar Lubang</span>
              <span className="text-lg font-bold text-slate-800">
                ~{report.widthCm} <span className="text-xs font-normal">cm</span>
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <span className="block text-xs font-medium text-slate-400">Skor Bina Marga</span>
              <span className="text-lg font-bold text-amber-600">
                UP {report.upScore}
              </span>
            </div>
          </div>

          {/* catatan bahaya */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/60 flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>Penanganan Rekomendasi: </strong>
              {report.type === 'trench'
                ? 'Pemadatan ulang galian lapis fondasi dan perataan aspal hotmix (Kode P5/U1).'
                : report.depthCm > 5
                ? 'Penambalan cepat darurat (<24 Jam) karena membahayakan pelek dan keseimbangan pemotor.'
                : 'Pemeliharaan rutin penutupan celah retak (P3) sebelum air hujan mengikis fondasi.'}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-2xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            Tutup Penampil 3D
          </button>
        </div>
      </div>
    </div>
  );
};
