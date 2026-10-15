/*
file ini buat mode simulasi lapangan 3d jalanan ala screenshot 3 (Mengikuti Oyen)
user dan maskot miko helm proyek bisa jalan di jalanan 3d ngeliat lubang sama barikade galian
Todo:
-> bangun jalan raya 3d pake three.js lengkap sama trotoar dan marka aspal
-> render karakter maskot miko berhelm proyek di jalan
-> pasang kerucut lalu lintas (traffic cone) dan lubang di aspal
-> pasang joystick sentuh di kiri bawah buat kontrol jalan
-> pasang hud info langkah dan jarak ke titik lubang
*/

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Navigation, HardHat, Compass, AlertTriangle, Eye } from 'lucide-react';
import { DamageReport } from '../types';

interface StreetSimulation3DProps {
  report: DamageReport;
  onClose: () => void;
}

export const StreetSimulation3D: React.FC<StreetSimulation3DProps> = ({ report, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [distanceToHole, setDistanceToHole] = useState(5.8);
  const [isFollowing, setIsFollowing] = useState(true);

  // posisi dan arah karakter miko
  const mikoPos = useRef({ x: 0, z: 6 });
  const mikoRotation = useRef(0);
  const joystickDelta = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe); // langit cerah perkotaan
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.025);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    dirLight.position.set(15, 25, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // 1. bangun permukaan jalan aspal panjang
    const roadGeo = new THREE.PlaneGeometry(12, 60);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // trotoar kiri dan kanan (sidewalk)
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 60), curbMat);
    leftCurb.position.set(-7.5, 0.175, 0);
    leftCurb.receiveShadow = true;
    scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, 60), curbMat);
    rightCurb.position.set(7.5, 0.175, 0);
    rightCurb.receiveShadow = true;
    scene.add(rightCurb);

    // marka jalan putus-putus putih di tengah
    for (let z = -28; z < 30; z += 4) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.2, 2.2),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.01, z);
      scene.add(stripe);
    }

    // 2. lubang kerusakan jalan 3d di posisi (0, 0, 0)
    const holeRadius = Math.min(1.2, Math.max(0.4, (report.widthCm / 100) * 0.9));
    const holeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(holeRadius, holeRadius * 0.8, 0.25, 24),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.95 })
    );
    holeMesh.position.set(1.5, 0.05, 0);
    scene.add(holeMesh);

    // batu agregat kasar di dasar lubang
    const holeBase = new THREE.Mesh(
      new THREE.CylinderGeometry(holeRadius * 0.75, holeRadius * 0.7, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 })
    );
    holeBase.position.set(1.5, -0.05, 0);
    scene.add(holeBase);

    // 3. pasang traffic cone oranye di sekitar lubang
    const createCone = (x: number, z: number) => {
      const coneGroup = new THREE.Group();
      const baseMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.35),
        new THREE.MeshStandardMaterial({ color: 0xea580c })
      );
      baseMesh.position.y = 0.02;
      coneGroup.add(baseMesh);

      const coneBody = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
      );
      coneBody.position.y = 0.24;
      coneGroup.add(coneBody);

      // strip putih reflektor
      const band = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.09, 0.08, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      band.position.y = 0.22;
      coneGroup.add(band);

      coneGroup.position.set(x, 0, z);
      scene.add(coneGroup);
    };

    createCone(0.8, -0.8);
    createCone(2.2, -0.8);
    createCone(2.2, 0.8);
    createCone(0.8, 0.8);

    // 4. model karakter maskot miko berhelm proyek
    const mikoGroup = new THREE.Group();
    scene.add(mikoGroup);

    // badan miko
    const bodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.65, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf97316 }); // oranye oyen
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.45;
    body.castShadow = true;
    mikoGroup.add(body);

    // rompi keselamatan hijau stabilo
    const vest = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x84cc16 })
    );
    vest.position.y = 0.48;
    mikoGroup.add(vest);

    // kepala miko
    const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.95;
    head.castShadow = true;
    mikoGroup.add(head);

    // telinga kucing
    const earGeo = new THREE.ConeGeometry(0.08, 0.15, 8);
    const leftEar = new THREE.Mesh(earGeo, headMat);
    leftEar.position.set(-0.16, 1.2, 0);
    mikoGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, headMat);
    rightEar.position.set(0.16, 1.2, 0);
    mikoGroup.add(rightEar);

    // helm proyek kuning miko
    const helmetGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 });
    const helmet = new THREE.Mesh(helmetGeo, helmetMat);
    helmet.position.y = 1.05;
    mikoGroup.add(helmet);

    // pet helm depan
    const brimGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.04, 16);
    const brim = new THREE.Mesh(brimGeo, helmetMat);
    brim.position.set(0, 1.05, 0.05);
    mikoGroup.add(brim);

    // posisi awal miko
    mikoGroup.position.set(mikoPos.current.x, 0, mikoPos.current.z);

    // loop animasi pergerakan karakter dan kamera orang ketiga (3rd person)
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // proses pergerakan dari joystick
      const jx = joystickDelta.current.x;
      const jy = joystickDelta.current.y;

      if (Math.abs(jx) > 0.05 || Math.abs(jy) > 0.05) {
        const speed = 4.5 * delta;
        mikoPos.current.x += jx * speed;
        mikoPos.current.z -= jy * speed;

        // batas trotoar jalan (-5 s/d 5)
        mikoPos.current.x = Math.max(-4.5, Math.min(4.5, mikoPos.current.x));
        mikoPos.current.z = Math.max(-25, Math.min(25, mikoPos.current.z));

        // rotasi menghadap arah jalan
        mikoRotation.current = Math.atan2(jx, -jy);
        mikoGroup.rotation.y = mikoRotation.current;

        // goyangan jalan kaki
        body.position.y = 0.45 + Math.sin(clock.getElapsedTime() * 12) * 0.04;
      }

      mikoGroup.position.set(mikoPos.current.x, 0, mikoPos.current.z);

      // kamera mengikuti dari belakang miko (third-person view)
      if (isFollowing) {
        camera.position.x = mikoPos.current.x;
        camera.position.y = 2.4;
        camera.position.z = mikoPos.current.z + 4.2;
        camera.lookAt(mikoPos.current.x, 0.9, mikoPos.current.z - 2.5);
      }

      // kalkulasi jarak ke lubang di (1.5, 0, 0)
      const dx = mikoPos.current.x - 1.5;
      const dz = mikoPos.current.z - 0;
      const dist = Math.sqrt(dx * dx + dz * dz);
      setDistanceToHole(Math.round(dist * 10) / 10);

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
      window.removeEventListener('resize', handleResize);
      if (container && renderer.domElement.parentNode) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, [report, isFollowing]);

  // handler joystick sentuh
  const handleTouchJoystick = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (touch.clientX - centerX) / (rect.width / 2);
    const dy = (touch.clientY - centerY) / (rect.height / 2);

    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 1) {
      joystickDelta.current = { x: dx / len, y: dy / len };
    } else {
      joystickDelta.current = { x: dx, y: dy };
    }
  };

  const handleTouchEnd = () => {
    joystickDelta.current = { x: 0, y: 0 };
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900 animate-fade-in select-none">
      {/* HUD atas bergaya screenshot 3 */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* pil status waktu & inspeksi */}
        <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 shadow-md flex items-center space-x-2.5 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <div>
            <span className="text-xs font-extrabold text-slate-800 block leading-tight">
              Inspeksi Lapangan 3D
            </span>
            <span className="text-[10px] text-slate-500">
              Pukul 09.45 WIB • Sinar Terang
            </span>
          </div>
        </div>

        {/* tombol tutup */}
        <button
          onClick={onClose}
          className="p-3 bg-white/95 backdrop-blur-md text-slate-700 hover:text-slate-900 rounded-full shadow-md border border-slate-200/80 pointer-events-auto transition-transform active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* banner instruksi langkah inspeksi */}
      <div className="absolute top-18 left-4 right-4 z-20 flex justify-center pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-floating border border-slate-100 max-w-md w-full pointer-events-auto flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-600 tracking-wider uppercase block">
              LANGKAH 1 DARI 3 • MIKOMETER JALAN
            </span>
            <h4 className="text-xs font-bold text-slate-900 mt-0.5">
              Dekati titik {report.title}
            </h4>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-extrabold text-red-600 block">
              {distanceToHole} m
            </span>
            <span className="text-[10px] text-slate-400">Jarak Lubang</span>
          </div>
        </div>
      </div>

      {/* kanvas 3d viewport penuh */}
      <div ref={mountRef} className="w-full h-full relative" />

      {/* joystick kontrol sentuh di kiri bawah */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col items-center">
        <div
          onTouchMove={handleTouchJoystick}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/60 shadow-2xl flex items-center justify-center cursor-pointer touch-none relative active:bg-white/40"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 shadow-lg border-2 border-white flex items-center justify-center text-white text-xs font-bold pointer-events-none">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
        <span className="text-[10px] text-white/80 font-medium mt-1 drop-shadow">
          Geser untuk Jalan
        </span>
      </div>

      {/* tombol 'Mengikuti Miko' di kanan bawah */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center space-x-2">
        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className="flex items-center space-x-2 py-3 px-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold text-xs shadow-floating hover:from-amber-600 hover:to-amber-700 transition-all active:scale-95 border-2 border-white/40"
        >
          <span className="text-lg">🐱</span>
          <span>{isFollowing ? 'Mengikuti Miko' : 'Kamera Bebas'}</span>
        </button>
      </div>
    </div>
  );
};
