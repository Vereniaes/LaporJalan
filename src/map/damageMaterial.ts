// Draw a smooth grid on the cavity surface without a second depth layer.
import * as THREE from 'three';

export function createDamageMaterial(geometry: THREE.BufferGeometry) {
  const count = geometry.getAttribute('position').count;
  const corners = new Float32Array(count * 3);
  for (let vertex = 0; vertex < count; vertex++) corners[vertex * 3 + vertex % 3] = 1;
  geometry.setAttribute('triangleCorner', new THREE.BufferAttribute(corners, 3));

  const material = new THREE.MeshStandardMaterial({ color: 0x36423e, roughness: 1, metalness: 0 });
  material.onBeforeCompile = shader => {
    shader.uniforms.inspectionGridColor = { value: new THREE.Color(0x46d68b) };
    shader.vertexShader = `attribute vec3 triangleCorner;
varying vec3 vTriangleCorner;
${shader.vertexShader}`.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvTriangleCorner = triangleCorner;');
    shader.fragmentShader = `uniform vec3 inspectionGridColor;
varying vec3 vTriangleCorner;
${shader.fragmentShader}`.replace('#include <opaque_fragment>', `
      vec3 pixelWidth = max(fwidth(vTriangleCorner), vec3(0.000001));
      vec3 interior = smoothstep(vec3(0.0), pixelWidth, vTriangleCorner);
      float coverage = 1.0 - min(min(interior.x, interior.y), interior.z);
      outgoingLight = mix(outgoingLight, inspectionGridColor, coverage * 0.48);
      #include <opaque_fragment>
    `);
  };
  return material;
}
