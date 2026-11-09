/* Todo:
-> define the contracts shared by the landing scene and story UI
*/
import type * as THREE from 'three';

// --- scene contracts ---
export type StoryProfile = 'desktop' | 'stacked';
export interface StoryFrame {
  camera: number[]; look: number[]; rider: number[]; pose: number; fov: number;
  riderVisible: boolean; wheel: number; yaw: number; near?: number; far?: number;
}
export interface Placement { module: string; x: number; z: number; rotation: number }
export interface Shape { x: number; y: number; z: number; width: number; height: number; depth: number; rotation?: number }
export interface CityWorld {
  scene: THREE.Scene; city: THREE.Group; road: THREE.Object3D;
  prototypes: Map<string, THREE.Object3D>; placements: Placement[];
  instanceModule(root: THREE.Object3D, items: Placement[], container?: THREE.Group): THREE.InstancedMesh[];
  fitBounds(box: THREE.Box3, direction: THREE.Vector3, fov: number, aspect: number, focus: THREE.Vector3): { camera: THREE.Vector3; look: THREE.Vector3 };
}
export interface CityFrame { camera: number[]; look: number[]; fov: number }
export interface CityLayout {
  frameFor(aspect: number): CityFrame;
  setProgress(value: number): void;
  dispose(): void;
}
// --- end of scene contracts ---

// --- loader-compatible type guards ---
export const isMesh = (object: THREE.Object3D): object is THREE.Mesh => (object as THREE.Mesh).isMesh === true;
export const isInstancedMesh = (object: THREE.Object3D): object is THREE.InstancedMesh => (object as THREE.InstancedMesh).isInstancedMesh === true;
// --- end of loader-compatible type guards ---
