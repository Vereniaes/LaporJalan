/*
Render one road cavity using the map camera and WebGL canvas.
Todo:
-> preserve the shared depth buffer and dispose owned resources
*/
import * as THREE from 'three';
import maplibregl from 'maplibre-gl';
import { createDamageContour, createDamageGeometry } from './damageGeometry';
import { createDamageMaterial } from './damageMaterial';

export interface DamageLayerOptions {
  anchor: [number, number];
  widthM: number;
  depthM: number;
  verifyDepth?: boolean;
}

export class DamageLayer implements maplibregl.CustomLayerInterface {
  readonly id = 'inspection-damage';
  readonly type = 'custom' as const;
  readonly renderingMode = '3d' as const;
  private map?: maplibregl.Map;
  private renderer?: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.Camera();
  private transform = new THREE.Matrix4();
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private renderCount = 0;
  private disposed = false;
  private depthRangeBefore: number[] | null = null;
  private depthRangeAfter: number[] | null = null;
  private projectedAnchorCss: number[] | null = null;
  private geometryStats: { vertexCount: number; minZ: number; maxZ: number; supportDiameterM: number } | null = null;

  constructor(readonly options: DamageLayerOptions) {}

  onAdd(map: maplibregl.Map, gl: WebGLRenderingContext | WebGL2RenderingContext) {
    if (!(gl instanceof WebGL2RenderingContext)) throw new Error('Inspection requires WebGL2');
    this.map = map;
    this.disposed = false;
    this.renderer = new THREE.WebGLRenderer({ canvas: map.getCanvas(), context: gl });
    this.renderer.autoClear = false;
    const { anchor, widthM, depthM } = this.options;
    const origin = maplibregl.MercatorCoordinate.fromLngLat(anchor, 0);
    const meter = origin.meterInMercatorCoordinateUnits();
    this.transform.makeTranslation(origin.x, origin.y, origin.z)
      .scale(new THREE.Vector3(meter, -meter, meter));

    // Only the local surface depth is replaced. Its existing map color is retained.
    // The opening lets the negative-height bowl appear while the near rim occludes it.
    const extent = Math.max(2, widthM * 2);
    const road = new THREE.Shape();
    road.moveTo(-extent, -extent);
    road.lineTo(extent, -extent);
    road.lineTo(extent, extent);
    road.lineTo(-extent, extent);
    road.closePath();
    const aperture = new THREE.Path();
    aperture.absarc(0, 0, widthM / 2, 0, Math.PI * 2, true);
    road.holes.push(aperture);
    const roadGeometry = new THREE.ShapeGeometry(road, 32);
    const roadMaterial = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: true, side: THREE.DoubleSide });
    this.addMesh(roadGeometry, roadMaterial, 0);

    const indexedBowl = createDamageGeometry(widthM, depthM);
    const bowl = indexedBowl.toNonIndexed();
    indexedBowl.dispose();
    bowl.computeBoundingBox();
    const bounds = bowl.boundingBox!;
    this.geometryStats = { vertexCount: bowl.getAttribute('position').count,
      minZ: bounds.min.z, maxZ: bounds.max.z, supportDiameterM: bounds.max.x - bounds.min.x };
    this.addMesh(bowl, createDamageMaterial(bowl), 1);
    for (const fraction of [0.25, 0.5, 0.75]) {
      const geometry = createDamageContour(widthM, depthM, fraction);
      const material = new THREE.LineBasicMaterial({ color: 0x94f1ba, transparent: true, opacity: 0.85, depthWrite: false });
      const line = new THREE.Line(geometry, material);
      line.renderOrder = 3;
      this.geometries.add(geometry);
      this.materials.add(material);
      this.scene.add(line);
    }
    this.scene.add(new THREE.AmbientLight(0xffffff, 1.7));
    const light = new THREE.DirectionalLight(0xffffff, 2.2);
    light.position.set(-3, -4, 6);
    this.scene.add(light);
  }

  private addMesh(geometry: THREE.BufferGeometry, material: THREE.Material, renderOrder: number) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = renderOrder;
    this.scene.add(mesh);
    this.geometries.add(geometry);
    this.materials.add(material);
  }

  render: maplibregl.CustomLayerInterface['render'] = (gl, matrix) => {
    if (!this.renderer || !this.map) return;
    this.camera.projectionMatrix.fromArray(matrix).multiply(this.transform);
    const projected = new THREE.Vector3().applyMatrix4(this.camera.projectionMatrix);
    const canvas = this.map.getCanvas();
    this.projectedAnchorCss = [(projected.x + 1) / 2 * canvas.clientWidth, (1 - projected.y) / 2 * canvas.clientHeight];
    if (this.options.verifyDepth) this.depthRangeBefore = Array.from(gl.getParameter(gl.DEPTH_RANGE) as Float32Array);
    this.renderer.resetState();
    this.renderer.render(this.scene, this.camera);
    if (this.options.verifyDepth) this.depthRangeAfter = Array.from(gl.getParameter(gl.DEPTH_RANGE) as Float32Array);
    this.renderCount++;
  };

  getState() {
    return { ...this.options, geometry: this.geometryStats, renderCount: this.renderCount,
      resources: { geometries: this.geometries.size, materials: this.materials.size,
        textures: this.renderer?.info.memory.textures ?? 0, programs: this.renderer?.info.programs?.length ?? 0 },
      depthRangeBefore: this.depthRangeBefore, depthRangeAfter: this.depthRangeAfter,
      projectedAnchorCss: this.projectedAnchorCss, disposed: this.disposed,
      canvasShared: !!this.renderer && this.renderer.domElement === this.map?.getCanvas(),
      webgl2: this.renderer?.getContext() instanceof WebGL2RenderingContext };
  }

  onRemove() {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.geometries.clear();
    this.materials.clear();
    this.scene.clear();
    this.renderer?.dispose();
    this.renderer = undefined;
    this.map = undefined;
    this.disposed = true;
  }
}
