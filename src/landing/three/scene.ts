/* Todo:
-> load the approved rider and city into one owned landing canvas
-> apply sampled camera frames and release pending or loaded resources
*/
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createCityMap } from './city';
import { sampleJourney } from './journey';
import { sampleHero } from './heroJourney';
import { isMesh, isInstancedMesh } from './types';
import type { Placement, StoryFrame, StoryProfile } from './types';

// --- owned scene ---
/** Purpose: Own one Three.js scene without viewer DOM, routes or a render loop.
 * Input: canvas container. Output: readiness, frame/projection controls and cleanup.
 */
export function createReportScene(container: HTMLElement, mode: 'story' | 'hero' = 'story') {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.info.autoReset = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.append(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#f7f6f1');
  const camera = new THREE.PerspectiveCamera(48, 1, .2, 250);
  const pmrem = new THREE.PMREMGenerator(renderer), room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, .04); room.dispose();
  scene.environment = environment.texture; scene.environmentIntensity = .5;
  scene.add(new THREE.HemisphereLight('#edf2f5', '#b5bbb2', 1.3));
  const sun = new THREE.DirectionalLight('#fff4e5', 2.6);
  sun.position.set(-10, 32, 4); sun.target.position.set(0, 0, 17); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -25, right: 25, top: 28, bottom: -28, near: .1, far: 120 });
  sun.shadow.normalBias = .025; sun.shadow.bias = -.0004; scene.add(sun, sun.target);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.MeshStandardMaterial({ color: '#f7f6f1', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -.16; scene.add(ground);
  const city = new THREE.Group(); scene.add(city);
  const geometries = new Set<THREE.BufferGeometry>([ground.geometry]);
  const materials = new Set<THREE.Material>([ground.material]);
  const textures = new Set<THREE.Texture>(), skeletons = new Set<THREE.Skeleton>();
  const palette = new Map<string, THREE.Material>(), prototypes = new Map<string, THREE.Object3D>();
  const batches: THREE.InstancedMesh[] = [], placements: Placement[] = [];
  const pending = new AbortController(), loader = new GLTFLoader();
  let road: THREE.Object3D, rider: THREE.Object3D, mixer: THREE.AnimationMixer;
  let action: THREE.AnimationAction, duration = 4, cityLayout: ReturnType<typeof createCityMap> | undefined;
  let status: 'loading' | 'ready' | 'failed' | 'disposed' = 'loading', disposed = false;
  let width = 1, height = 1, progress = 0, profile: StoryProfile = 'desktop', draws = 0, photo = '';
  let currentFrame: StoryFrame | undefined;

  // --- asset resources ---
  // Purpose: Track raw GLB resources before material sharing or late-load cleanup.
  // Input: parsed asset root. Output: resources owned by this scene.
  function track(root: THREE.Object3D) {
    root.traverse(object => {
      if (!(isMesh(object))) return;
      geometries.add(object.geometry);
      if ((object as THREE.SkinnedMesh).isSkinnedMesh) skeletons.add((object as THREE.SkinnedMesh).skeleton);
      for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
        materials.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) textures.add(value as THREE.Texture);
      }
    });
  }
  function releaseAssets() {
    skeletons.forEach(value => value.dispose()); skeletons.clear();
    geometries.forEach(value => value.dispose()); geometries.clear();
    materials.forEach(value => value.dispose()); materials.clear();
    const images = new Set<ImageBitmap>();
    textures.forEach(texture => { texture.dispose(); if (texture.image?.close) images.add(texture.image); });
    textures.clear(); images.forEach(image => image.close());
  }
  // Purpose: Abort network loading and also free assets whose parsing finishes after disposal.
  // Input: local GLB name. Output: tracked parsed glTF.
  async function load(name: string) {
    const url = `/landing/${name}`, response = await fetch(url, { signal: pending.signal });
    if (!response.ok) throw new Error('Scene asset unavailable');
    const asset = await loader.parseAsync(await response.arrayBuffer(), '/landing/');
    track(asset.scene);
    if (disposed) { releaseAssets(); throw new DOMException('Scene disposed', 'AbortError'); }
    return asset;
  }
  function shareMaterials(root: THREE.Object3D) {
    root.traverse(object => {
      if (!(isMesh(object))) return;
      const share = (material: THREE.MeshStandardMaterial) => {
        const round = (value: number) => Number(value.toFixed(6));
        const key = JSON.stringify([material.color.toArray().map(round), round(material.roughness), round(material.metalness), material.opacity, material.side, material.emissive.toArray().map(round), material.map?.uuid || null]);
        if (!palette.has(key)) palette.set(key, material);
        return palette.get(key)!;
      };
      object.material = Array.isArray(object.material) ? object.material.map(m => share(m as THREE.MeshStandardMaterial)) : share(object.material as THREE.MeshStandardMaterial);
    });
  }
  // --- end of asset resources ---

  // --- instance and camera contracts ---
  function instanceModule(root: THREE.Object3D, items: Placement[], target = city) {
    root.updateMatrixWorld(true);
    const inverse = root.matrixWorld.clone().invert(), created: THREE.InstancedMesh[] = [];
    root.traverse(part => {
      if (!(isMesh(part))) return;
      const batch = new THREE.InstancedMesh(part.geometry, part.material, items.length);
      const local = new THREE.Matrix4().multiplyMatrices(inverse, part.matrixWorld);
      items.forEach((item, index) => { const matrix = new THREE.Matrix4().makeRotationY(item.rotation); matrix.setPosition(item.x, .14, item.z); batch.setMatrixAt(index, matrix.multiply(local)); });
      batch.instanceMatrix.needsUpdate = true; batch.computeBoundingBox(); batch.computeBoundingSphere();
      batch.castShadow = batch.receiveShadow = true; batch.name = `${root.name}_instances`; target.add(batch);
      if (target === city) batches.push(batch); created.push(batch);
    });
    return created;
  }
  function fitBounds(box: THREE.Box3, direction: THREE.Vector3, fov: number, aspect: number, focus: THREE.Vector3) {
    const look = focus.clone(), axis = direction.clone().normalize();
    const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(axis, new THREE.Vector3(), camera.up)).invert();
    const tangent = Math.tan(THREE.MathUtils.degToRad(fov / 2)); let distance = 0;
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
      const corner = new THREE.Vector3(x, y, z).sub(look).applyQuaternion(rotation);
      distance = Math.max(distance, corner.z + Math.abs(corner.x) * 1.13 / (tangent * aspect), corner.z + Math.abs(corner.y) * 1.13 / tangent);
    }
    return { look, camera: look.clone().addScaledVector(axis, distance) };
  }
  function applyFrame(frame: StoryFrame) {
    if (status !== 'ready' || disposed) return;
    currentFrame = frame;
    camera.position.fromArray(frame.camera); camera.lookAt(new THREE.Vector3().fromArray(frame.look));
    camera.fov = frame.fov; camera.near = frame.near ?? .2; camera.far = frame.far ?? 250; camera.updateProjectionMatrix();
    rider.position.fromArray(frame.rider); rider.rotation.y = frame.yaw; rider.visible = frame.riderVisible;
    action.paused = false; action.enabled = true; action.play(); mixer.setTime(Math.min(duration - 1e-6, Math.max(0, frame.pose) * duration));
    for (const name of ['wheel_front_pivot', 'wheel_rear_pivot']) rider.getObjectByName(name)!.rotation.x = frame.wheel;
    rider.updateMatrixWorld(true); renderer.info.reset(); renderer.render(scene, camera); draws++;
  }
  function resize() {
    const rect = container.getBoundingClientRect(); if (rect.width < 1 || rect.height < 1 || disposed) return;
    if (width === rect.width && height === rect.height) return;
    width = rect.width; height = rect.height; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  function applyProgress(value: number, layout: StoryProfile = profile) {
    progress = value; profile = layout; cityLayout?.setProgress(value);
    applyFrame(sampleJourney(value, layout, width / height, cityLayout));
  }
  function applyHero(value: number, layout: StoryProfile = profile) {
    progress = value; profile = layout; applyFrame(sampleHero(value, layout));
  }
  function anchor() {
    if (status !== 'ready' || disposed) return null;
    const point = road.getObjectByName('damage_anchor')!.getWorldPosition(new THREE.Vector3()).project(camera);
    return { x: (point.x * .5 + .5) * width, y: (-point.y * .5 + .5) * height, visible: point.z >= -1 && point.z <= 1 };
  }
  function triangleCount(root: THREE.Object3D) {
    let count = 0; root.traverseVisible(object => { if (isMesh(object)) count += (object.geometry.index?.count ?? object.geometry.attributes.position.count) / 3 * (isInstancedMesh(object) ? object.count : 1); }); return count;
  }
  // --- end of instance and camera contracts ---

  // --- loading and lifecycle ---
  const ready = Promise.all([load('rider-underbone.glb'), load('city-kit.glb'), load('road-kit.glb')]).then(([riderFile, cityFile, roadFile]) => {
    if (disposed) return;
    [riderFile.scene, cityFile.scene, roadFile.scene].forEach(shareMaterials);
    rider = riderFile.scene; road = roadFile.scene;
    for (const name of ['damage_anchor', 'road_surface']) if (!road.getObjectByName(name)) throw new Error('Road asset incomplete');
    for (const name of ['wheel_front_pivot', 'wheel_rear_pivot']) if (!rider.getObjectByName(name)) throw new Error('Rider asset incomplete');
    scene.add(rider, road);
    rider.traverse(object => { if (isMesh(object)) object.castShadow = true; });
    road.traverse(object => { if (isMesh(object)) { object.receiveShadow = true; object.castShadow = object.name.startsWith('curb_'); } });
    const clip = riderFile.animations[0]; if (!clip) throw new Error('Rider animation unavailable');
    mixer = new THREE.AnimationMixer(rider); duration = clip.duration; action = mixer.clipAction(clip); action.setLoop(THREE.LoopOnce, 1); action.clampWhenFinished = true; action.play();
    const modules: [string, number][] = [['building_corner_7f', 5], ['building_shop_2f', 4], ['building_home_3f', 5], ['building_block_5f', 6], ['building_shop_2f', 4], ['building_home_3f', 5], ['building_block_5f', 6]];
    for (const [name] of modules) { const module = cityFile.scene.getObjectByName(name); if (!module) throw new Error('City asset incomplete'); prototypes.set(name, module); }
    for (const side of [-1, 1]) { let cursor = -1; for (const [name, size] of modules) { placements.push({ module: name, x: side * 4.95, z: cursor + size / 2, rotation: side < 0 ? Math.PI / 2 : -Math.PI / 2 }); cursor += size + .45; } }
    for (const [name, root] of prototypes) instanceModule(root, placements.filter(item => item.module === name));
    if (mode === 'story') cityLayout = createCityMap({ scene, city, road, prototypes, placements, instanceModule, fitBounds });
    status = 'ready'; resize();
    if (mode === 'hero') applyHero(0);
    else {
      applyFrame({ ...sampleJourney(.47, 'desktop'), camera: [.1, 1.65, 11.7], look: [-1.1, -.02, 14], fov: 46 });
      photo = renderer.domElement.toDataURL('image/webp', .82); applyProgress(progress, profile);
    }
  }).catch(error => { if (!disposed) { status = 'failed'; dispose(); } throw error; });
  function metrics() { return { status, disposed, draws, progress, photoReady: Boolean(photo), frame: currentFrame, size: {width,height}, camera: {position: camera.position.toArray(), quaternion: camera.quaternion.toArray(), fov: camera.fov, near: camera.near, far: camera.far, aspect: camera.aspect}, drawCalls: renderer.info.render.calls, triangles: status === 'ready' ? triangleCount(city) + triangleCount(road) + triangleCount(rider) : 0, memory: { ...renderer.info.memory }, city: cityLayout?.metrics() }; }
  function dispose() {
    if (disposed) return; disposed = true; status = 'disposed'; pending.abort();
    cityLayout?.dispose(); batches.forEach(batch => batch.dispose());
    mixer?.stopAllAction(); if (mixer && rider) mixer.uncacheRoot(rider); releaseAssets();
    sun.shadow.dispose(); environment.dispose(); pmrem.dispose(); palette.clear();
    renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); scene.clear();
  }
  return { ready, applyProgress, applyHero, resize, anchor, metrics, dispose, get photo() { return photo; } };
  // --- end of loading and lifecycle ---
}
export type ReportSceneApi = ReturnType<typeof createReportScene>;
// --- end of owned scene ---
