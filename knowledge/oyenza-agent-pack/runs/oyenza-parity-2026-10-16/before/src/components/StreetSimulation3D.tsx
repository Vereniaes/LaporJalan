/*
file ini buat mode game simulasi fisik jalanan berlubang 3d (pothole drive simulator)
user bisa mengemudikan kendaraan survei jalan melewati lubang dan merasakan guncangan suspensi benturan
Todo:
-> render jalan aspal fisik dengan cekungan kawah 3d (deformed road mesh)
-> render kendaraan mobil survei pu lengkap dengan 4 roda dan suspensi per
-> kalkulasi elevasi jalan dinamis per roda (raycast suspension)
-> efek camera trauma shake saat ban menghantam lubang dalam
-> hud game: speedometer, g-force meter, status suspensi, tombol gas/rem/kemudi
-> kontrol ganda: keyboard wasd / panah di pc + virtual joystick di hp
*/

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Navigation, AlertTriangle, RefreshCw, Car, Gauge, Activity, Volume2, ShieldAlert } from 'lucide-react';
import { DamageReport } from '../types';

interface StreetSimulation3DProps {
  report: DamageReport;
  onClose: () => void;
}

export const StreetSimulation3D: React.FC<StreetSimulation3DProps> = ({ report, onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // status telemetry game
  const [speedKmh, setSpeedKmh] = useState(0);
  const [distanceToHole, setDistanceToHole] = useState(8.5);
  const [impactGForce, setImpactGForce] = useState(0.1);
  const [suspensionStress, setSuspensionStress] = useState(12);
  const [isImpacted, setIsImpacted] = useState(false);
  const [vehicleMode, setVehicleMode] = useState<'car' | 'bike'>('car');

  // input kendali keyboard & joystick
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const joystickDelta = useRef({ x: 0, y: 0 });

  // posisi dan dinamika kendaraan
  const carState = useRef({
    x: 0,
    z: 14,
    speed: 0,
    angle: 0,
    steering: 0,
    wheelFlY: 0,
    wheelFrY: 0,
    wheelRlY: 0,
    wheelRrY: 0,
    pitch: 0,
    roll: 0,
    trauma: 0 // camera shake factor
  });

  // helper kalkulasi kedalaman cekungan aspal fisik --------------------------------------------------------------------------
  // input param : koordinat x, z dan parameter lubang
  // output : elevasi y permukaan jalan
  const holeX = 1.2;
  const holeZ = 0;
  const holeDepth = Math.max(0.08, (report.depthCm / 100) * 1.5);
  const holeRadius = Math.max(0.7, (report.widthCm / 100) * 0.9);

  const getRoadElevation = (x: number, z: number): number => {
    const dist = Math.hypot(x - holeX, z - holeZ);
    if (dist < holeRadius) {
      // kurva smooth cosine kawah lubang
      return -holeDepth * Math.cos((dist / holeRadius) * (Math.PI / 2));
    }
    return 0;
  };
  // end of helper ------------------------------------------------------------------

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // scene, camera, renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbeafe);
    scene.fog = new THREE.FogExp2(0xdbeafe, 0.02);

    const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 150);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x475569, 0.9);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    dirLight.position.set(20, 30, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    // 1. bangun jalan raya dengan cekungan kawah 3d (deformed plane geometry)
    const roadWidth = 14;
    const roadLength = 90;
    const roadSegmentsX = 60;
    const roadSegmentsZ = 200;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, roadSegmentsX, roadSegmentsZ);

    // deformasi vertex aspal ke bawah pada koordinat lubang
    const posAttr = roadGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i); // koordinat panjang sebelum dirotasi
      const vz = -vy; // map ke world z

      const elev = getRoadElevation(vx, vz);
      posAttr.setZ(i, elev); // deformasi sumbu Z geometry lokal
    }
    roadGeo.computeVertexNormals();

    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = true;
    scene.add(road);

    // trotoar jalan
    const curbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, roadLength), curbMat);
    leftCurb.position.set(-8.5, 0.175, 0);
    leftCurb.receiveShadow = true;
    scene.add(leftCurb);

    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(3, 0.35, roadLength), curbMat);
    rightCurb.position.set(8.5, 0.175, 0);
    rightCurb.receiveShadow = true;
    scene.add(rightCurb);

    // marka garis putih putus-putus di tengah jalan
    for (let z = -40; z < 42; z += 5) {
      const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(0.25, 2.8),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.015, z);
      scene.add(stripe);
    }

    // agregat batu kasar di dasar lubang
    const gravelGroup = new THREE.Group();
    const rockGeo = new THREE.DodecahedronGeometry(0.08, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.95 });
    for (let i = 0; i < 18; i++) {
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const ang = Math.random() * Math.PI * 2;
      const rad = Math.random() * (holeRadius * 0.65);
      rock.position.set(
        holeX + Math.cos(ang) * rad,
        -holeDepth * 0.85 + Math.random() * 0.04,
        holeZ + Math.sin(ang) * rad
      );
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      gravelGroup.add(rock);
    }
    scene.add(gravelGroup);

    // kerucut pembatas jalan oranye (traffic cones)
    const createTrafficCone = (cx: number, cz: number) => {
      const cone = new THREE.Group();
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.04, 0.4),
        new THREE.MeshStandardMaterial({ color: 0xea580c })
      );
      base.position.y = 0.02;
      cone.add(base);

      const coneBody = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.55, 16),
        new THREE.MeshStandardMaterial({ color: 0xf97316 })
      );
      coneBody.position.y = 0.29;
      cone.add(coneBody);

      const stripe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.11, 0.12, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      stripe.position.y = 0.28;
      cone.add(stripe);

      cone.position.set(cx, 0, cz);
      scene.add(cone);
    };

    createTrafficCone(holeX - holeRadius - 0.3, holeZ - 0.6);
    createTrafficCone(holeX + holeRadius + 0.3, holeZ - 0.6);
    createTrafficCone(holeX + holeRadius + 0.3, holeZ + 0.6);
    createTrafficCone(holeX - holeRadius - 0.3, holeZ + 0.6);

    // 2. bangun model kendaraan mobil survei jalan pu
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    // badan mobil utama (chassis)
    const carBodyGeo = new THREE.BoxGeometry(1.6, 0.65, 3.2);
    const carBodyMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 }); // kuning dinas PU
    const carChassis = new THREE.Mesh(carBodyGeo, carBodyMat);
    carChassis.position.y = 0.65;
    carChassis.castShadow = true;
    vehicleGroup.add(carChassis);

    // kabin kaca mobil
    const cabinGeo = new THREE.BoxGeometry(1.4, 0.55, 1.6);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
    const carCabin = new THREE.Mesh(cabinGeo, cabinMat);
    carCabin.position.set(0, 1.2, -0.2);
    carCabin.castShadow = true;
    vehicleGroup.add(carCabin);

    // lampu rotator kuning darurat di atap
    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 12);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.8 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.52, -0.2);
    vehicleGroup.add(beacon);

    // maskot miko pengemudi di kabin
    const mikoHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf97316 })
    );
    mikoHead.position.set(-0.3, 1.15, -0.2);
    vehicleGroup.add(mikoHead);

    const mikoHelmet = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfacc15 })
    );
    mikoHelmet.position.set(-0.3, 1.22, -0.2);
    vehicleGroup.add(mikoHelmet);

    // 4 roda independen untuk suspensi
    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 20);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });

    const wheelFL = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelFR = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelRL = new THREE.Mesh(wheelGeo, wheelMat);
    const wheelRR = new THREE.Mesh(wheelGeo, wheelMat);

    wheelFL.castShadow = true;
    wheelFR.castShadow = true;
    wheelRL.castShadow = true;
    wheelRR.castShadow = true;

    scene.add(wheelFL);
    scene.add(wheelFR);
    scene.add(wheelRL);
    scene.add(wheelRR);

    // dimensi sasis kendaraan
    const wheelTrack = 0.95; // setengah lebar roda
    const wheelBase = 1.1; // setengah panjang sumbu roda

    // listener keyboard kendali mobil
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // loop animasi dan simulasi fisika game
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.05);

      const keys = keysPressed.current;
      const joy = joystickDelta.current;

      // 1. input gas dan rem/mundur
      const isGas = keys['KeyW'] || keys['ArrowUp'] || joy.y > 0.15;
      const isBrake = keys['KeyS'] || keys['ArrowDown'] || joy.y < -0.15;
      const isLeft = keys['KeyA'] || keys['ArrowLeft'] || joy.x < -0.15;
      const isRight = keys['KeyD'] || keys['ArrowRight'] || joy.x > 0.15;

      const maxSpeed = 16.0;
      const accel = 12.0 * delta;
      const brakePower = 18.0 * delta;
      const friction = 5.0 * delta;

      if (isGas) {
        carState.current.speed = Math.min(maxSpeed, carState.current.speed + accel);
      } else if (isBrake) {
        carState.current.speed = Math.max(-6.0, carState.current.speed - brakePower);
      } else {
        // deselerasi alami gesekan aspal
        if (carState.current.speed > 0) {
          carState.current.speed = Math.max(0, carState.current.speed - friction);
        } else if (carState.current.speed < 0) {
          carState.current.speed = Math.min(0, carState.current.speed + friction);
        }
      }

      // 2. input kemudi belok
      const steerSpeed = 2.4 * delta;
      if (isLeft) {
        carState.current.steering = Math.max(-0.6, carState.current.steering - steerSpeed);
      } else if (isRight) {
        carState.current.steering = Math.min(0.6, carState.current.steering + steerSpeed);
      } else {
        carState.current.steering *= 0.82; // kembali lurus
      }

      // update arah hadap kendaraan (angle)
      if (Math.abs(carState.current.speed) > 0.1) {
        const turnDir = carState.current.speed > 0 ? 1 : -1;
        carState.current.angle -= carState.current.steering * turnDir * delta * 1.8;
      }

      // update posisi kendaraan
      carState.current.x += Math.sin(carState.current.angle) * carState.current.speed * delta;
      carState.current.z -= Math.cos(carState.current.angle) * carState.current.speed * delta;

      // batasan trotoar jalan (-4.8 s/d 4.8)
      carState.current.x = Math.max(-4.8, Math.min(4.8, carState.current.x));
      carState.current.z = Math.max(-36, Math.min(36, carState.current.z));

      // 3. fisika suspensi per roda (raycast elevation sampling)
      const cosA = Math.cos(carState.current.angle);
      const sinA = Math.sin(carState.current.angle);

      // hitung koordinat dunia 4 roda
      const posFL = {
        x: carState.current.x + (-wheelTrack * cosA - wheelBase * sinA),
        z: carState.current.z + (wheelTrack * sinA - wheelBase * cosA)
      };
      const posFR = {
        x: carState.current.x + (wheelTrack * cosA - wheelBase * sinA),
        z: carState.current.z + (-wheelTrack * sinA - wheelBase * cosA)
      };
      const posRL = {
        x: carState.current.x + (-wheelTrack * cosA + wheelBase * sinA),
        z: carState.current.z + (wheelTrack * sinA + wheelBase * cosA)
      };
      const posRR = {
        x: carState.current.x + (wheelTrack * cosA + wheelBase * sinA),
        z: carState.current.z + (-wheelTrack * sinA + wheelBase * cosA)
      };

      // baca elevasi jalan tepat di bawah ban
      const targetFlY = getRoadElevation(posFL.x, posFL.z) + 0.32;
      const targetFrY = getRoadElevation(posFR.x, posFR.z) + 0.32;
      const targetRlY = getRoadElevation(posRL.x, posRL.z) + 0.32;
      const targetRrY = getRoadElevation(posRR.x, posRR.z) + 0.32;

      // kompresi pegas suspensi (spring-damper lerp)
      carState.current.wheelFlY += (targetFlY - carState.current.wheelFlY) * 0.45;
      carState.current.wheelFrY += (targetFrY - carState.current.wheelFrY) * 0.45;
      carState.current.wheelRlY += (targetRlY - carState.current.wheelRlY) * 0.45;
      carState.current.wheelRrY += (targetRrY - carState.current.wheelRrY) * 0.45;

      // posisikan mesh roda
      wheelFL.position.set(posFL.x, carState.current.wheelFlY, posFL.z);
      wheelFR.position.set(posFR.x, carState.current.wheelFrY, posFR.z);
      wheelRL.position.set(posRL.x, carState.current.wheelRlY, posRL.z);
      wheelRR.position.set(posRR.x, carState.current.wheelRrY, posRR.z);

      wheelFL.rotation.y = carState.current.angle + carState.current.steering;
      wheelFR.rotation.y = carState.current.angle + carState.current.steering;
      wheelRL.rotation.y = carState.current.angle;
      wheelRR.rotation.y = carState.current.angle;

      // 4. kalkulasi roll dan pitch sasis mobil berdasarkan perbedaan elevasi roda
      const frontAvgY = (carState.current.wheelFlY + carState.current.wheelFrY) / 2;
      const rearAvgY = (carState.current.wheelRlY + carState.current.wheelRrY) / 2;
      const leftAvgY = (carState.current.wheelFlY + carState.current.wheelRlY) / 2;
      const rightAvgY = (carState.current.wheelFrY + carState.current.wheelRrY) / 2;

      const chassisY = (frontAvgY + rearAvgY) / 2 + 0.35;
      const targetPitch = (frontAvgY - rearAvgY) / (wheelBase * 2);
      const targetRoll = (leftAvgY - rightAvgY) / (wheelTrack * 2);

      carState.current.pitch += (targetPitch - carState.current.pitch) * 0.3;
      carState.current.roll += (targetRoll - carState.current.roll) * 0.3;

      vehicleGroup.position.set(carState.current.x, chassisY, carState.current.z);
      vehicleGroup.rotation.y = carState.current.angle;
      vehicleGroup.rotation.x = -carState.current.pitch;
      vehicleGroup.rotation.z = carState.current.roll;

      // 5. deteksi benturan lubang keras & camera trauma shake
      const maxDrop = Math.min(
        targetFlY - 0.32,
        targetFrY - 0.32,
        targetRlY - 0.32,
        targetRrY - 0.32
      );

      if (maxDrop < -0.04 && Math.abs(carState.current.speed) > 2.0) {
        // ban menghantam lubang saat melaju
        const shock = Math.min(1.0, Math.abs(maxDrop) / holeDepth * (Math.abs(carState.current.speed) / 8.0));
        carState.current.trauma = Math.max(carState.current.trauma, shock);
        setIsImpacted(true);

        const gVal = Math.round((1.0 + shock * 3.8) * 10) / 10;
        setImpactGForce(gVal);
        setSuspensionStress(Math.min(100, Math.round(shock * 95)));
      } else {
        setIsImpacted(false);
      }

      // decay camera trauma
      carState.current.trauma = Math.max(0, carState.current.trauma - delta * 1.8);

      // guncangan kamera (screen shake)
      const shakeX = (Math.random() - 0.5) * carState.current.trauma * 0.35;
      const shakeY = (Math.random() - 0.5) * carState.current.trauma * 0.35;

      // 6. kamera mengikuti dari belakang kendaraan (third-person chase cam)
      const camDist = 5.2;
      const camHeight = 2.6;
      camera.position.x = carState.current.x - Math.sin(carState.current.angle) * camDist + shakeX;
      camera.position.y = chassisY + camHeight + shakeY;
      camera.position.z = carState.current.z + Math.cos(carState.current.angle) * camDist;
      camera.lookAt(
        carState.current.x,
        chassisY + 0.6,
        carState.current.z - Math.cos(carState.current.angle) * 3.0
      );

      // 7. update HUD data
      const speedKm = Math.round(Math.abs(carState.current.speed) * 3.6);
      setSpeedKmh(speedKm);

      const dist = Math.hypot(carState.current.x - holeX, carState.current.z - holeZ);
      setDistanceToHole(Math.round(dist * 10) / 10);

      // lampu beacon berputar
      beacon.rotation.y += delta * 15.0;

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [report, vehicleMode]);

  // helper reset posisi kendaraan ke titik awal --------------------------------------------------------------------------
  const handleResetCar = () => {
    carState.current.x = 0;
    carState.current.z = 14;
    carState.current.speed = 0;
    carState.current.angle = 0;
    carState.current.steering = 0;
    carState.current.trauma = 0;
    setIsImpacted(false);
    setImpactGForce(0.1);
    setSuspensionStress(10);
  };
  // end of helper ------------------------------------------------------------------

  // helper uji lindasi lubang otomatis --------------------------------------------------------------------------
  const handleAutoTestPothole = () => {
    carState.current.x = holeX;
    carState.current.z = 10;
    carState.current.speed = 10.5; // melaju 38 km/h
    carState.current.angle = 0;
  };
  // end of helper ------------------------------------------------------------------

  // handler sentuh joystick di ponsel --------------------------------------------------------------------------
  const handleTouchJoystick = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = (touch.clientX - centerX) / (rect.width / 2);
    const dy = (touch.clientY - centerY) / (rect.height / 2);

    joystickDelta.current = {
      x: Math.max(-1, Math.min(1, dx)),
      y: -Math.max(-1, Math.min(1, dy)) // gas ke atas
    };
  };

  const handleTouchEnd = () => {
    joystickDelta.current = { x: 0, y: 0 };
  };
  // end of handler ------------------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col select-none overflow-hidden font-sans">
      {/* header game simulator */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg border border-amber-400/30">
            <Car className="w-6 h-6" />
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/80 shadow-xl">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-extrabold text-sm text-white tracking-wide">
                Simulator Benturan Jalan 3D
              </h3>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40">
                Fisika Tiga Dimensi
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate max-w-[240px] md:max-w-md">
              {report.address}
            </p>
          </div>
        </div>

        {/* tombol tutup */}
        <button
          onClick={onClose}
          className="p-3 bg-slate-900/90 backdrop-blur-md text-slate-300 hover:text-white rounded-full shadow-lg border border-slate-700 pointer-events-auto transition-transform active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* banner peringatan benturan keras */}
      {isImpacted && (
        <div className="absolute top-20 left-4 right-4 z-30 flex justify-center pointer-events-none animate-bounce">
          <div className="bg-red-600/95 text-white px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-white flex items-center space-x-3">
            <ShieldAlert className="w-6 h-6 animate-pulse text-yellow-300" />
            <div>
              <span className="text-xs font-black tracking-wider uppercase block text-yellow-200">
                BENTURAN LUBANG JALAN TERDETEKSI!
              </span>
              <p className="text-xs font-bold">
                Guncangan {impactGForce} G • Suspensi tertekan {suspensionStress}% • Potensi velg bengkok / motor oleng!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* viewport render three.js penuh */}
      <div ref={mountRef} className="w-full h-full relative" />

      {/* telemetry game hud (kiri atas bawah) */}
      <div className="absolute top-24 left-4 z-20 flex flex-col space-y-2 pointer-events-none">
        {/* card speedometer */}
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 shadow-xl w-44">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center space-x-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              <span>Kecepatan</span>
            </span>
            <span className="text-slate-200">KM/H</span>
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">
            {speedKmh}
            <span className="text-xs font-normal text-slate-400 ml-1">km/jam</span>
          </div>
        </div>

        {/* card sensor g-force dan suspensi */}
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 shadow-xl w-44">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-red-400" />
              <span>G-Force Benturan</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className={`text-2xl font-black font-mono ${impactGForce > 2.0 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
              {impactGForce}
            </span>
            <span className="text-xs font-semibold text-slate-300">G</span>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-slate-300 font-medium mb-1">
              <span>Stres Suspensi</span>
              <span>{suspensionStress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-100 ${
                  suspensionStress > 70 ? 'bg-red-500' : suspensionStress > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${suspensionStress}%` }}
              />
            </div>
          </div>
        </div>

        {/* card jarak ke titik lubang */}
        <div className="bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 shadow-xl w-44">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Jarak ke Lubang {report.depthCm} cm
          </span>
          <span className="text-xl font-black font-mono text-amber-400">
            {distanceToHole} meter
          </span>
        </div>
      </div>

      {/* kontrol mobile joystick di kiri bawah */}
      <div className="absolute bottom-6 left-6 z-20 flex flex-col items-center">
        <div
          onTouchMove={handleTouchJoystick}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-md border-2 border-white/40 shadow-2xl flex items-center justify-center cursor-pointer touch-none relative active:bg-slate-900/80"
        >
          <div className="w-12 h-12 rounded-full bg-amber-500 shadow-lg border-2 border-white flex items-center justify-center text-white pointer-events-none">
            <Navigation className="w-5 h-5" />
          </div>
        </div>
        <span className="text-[11px] text-white font-bold mt-1.5 drop-shadow">
          Gas / Kemudi
        </span>
      </div>

      {/* tombol aksi cepat di kanan bawah */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col items-end space-y-2 pointer-events-auto">
        <button
          onClick={handleAutoTestPothole}
          className="flex items-center space-x-2 py-3 px-5 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white rounded-2xl font-black text-xs shadow-2xl border border-white/30 transition-transform active:scale-95"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-200 animate-pulse" />
          <span>Uji Tabrak Lubang ({report.depthCm} cm)</span>
        </button>

        <button
          onClick={handleResetCar}
          className="flex items-center space-x-2 py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-2xl font-bold text-xs shadow-lg border border-slate-700 transition-transform active:scale-95"
        >
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <span>Reset Posisi Mobil</span>
        </button>
      </div>

      {/* panduan tombol desktop di bawah tengah */}
      <div className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-700/80 shadow-xl items-center space-x-4 text-xs font-semibold text-slate-300">
        <span className="text-amber-400 font-bold">Kontrol Keyboard:</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">W</kbd> Gas Maju</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">S</kbd> Rem / Mundur</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">A</kbd> Belok Kiri</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-600 rounded text-white">D</kbd> Belok Kanan</span>
      </div>
    </div>
  );
};
