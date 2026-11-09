/* Todo:
-> extend the approved street with instanced blocks, sidewalks and parks
-> add crossings and parked cars outside the rider route
-> borrow model materials and own only the added city resources
*/
import * as THREE from 'three';
import { isMesh, isInstancedMesh } from './types';
import type { CityWorld, Placement, Shape, CityFrame } from './types';

// --- city layout and resource ownership ---

// Purpose: Open an illustrated city around the original road without a second scene.
// Input: loaded review scene API. Output: city layout, camera fit, progress and cleanup.
export function createCityMap(review: CityWorld){
 const group=new THREE.Group();group.name='illustrated_city';group.visible=false;review.city.add(group);
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),unit=new THREE.BoxGeometry(1,1,1),cone=new THREE.ConeGeometry(1,1,6),wheel=new THREE.CylinderGeometry(.32,.32,.18,10).rotateZ(Math.PI/2);for(const geometry of [unit,cone,wheel])geometries.add(geometry);
 const partMaterials: THREE.MeshStandardMaterial[]=[];review.prototypes.values().next().value!.traverse(o=>{if(isMesh(o))partMaterials.push(...(Array.isArray(o.material)?o.material:[o.material]) as THREE.MeshStandardMaterial[]);});
 const brightness=(m: THREE.MeshStandardMaterial)=>m.color.r+m.color.g+m.color.b;
 const wall=partMaterials.reduce((a,b)=>brightness(a)>brightness(b)?a:b),ink=partMaterials.reduce((a,b)=>brightness(a)<brightness(b)?a:b),asphalt=(review.road.getObjectByName('road_surface') as THREE.Mesh).material;
 const grass=new THREE.MeshStandardMaterial({color:'#84916f',roughness:1}),paint=new THREE.MeshStandardMaterial({color:'#f2f0e5',roughness:1,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});const paving=new THREE.MeshStandardMaterial({color:'#d7d4c6',roughness:1});for(const material of [grass,paint,paving])materials.add(material);
 const sun=review.scene.children.find((o): o is THREE.DirectionalLight=>(o as THREE.DirectionalLight).isDirectionalLight === true)!;
 const lightPosition=sun.position.clone(),shadowKeys=['left','right','top','bottom','near','far'] as const,limits={} as Record<typeof shadowKeys[number],number>;for(const key of shadowKeys)limits[key]=sun.shadow.camera[key];
 let disposed=false,shadowScale=1,fitAspect=0,fit: CityFrame;
 const blocks: Shape[]=[],roads: Shape[]=[],markings: Shape[]=[],walks: Shape[]=[],full: Placement[]=[],far: (Shape & {box: THREE.Box3})[]=[],boundsByType=new Map<string, THREE.Box3>();
 const cell=(x: number,z: number,width: number,depth: number,height=.14,y=.07): Shape=>({x,y,z,width,height,depth});

 // Purpose: Batch small city shapes while retaining one geometry/material per type.
 // Input: geometry, material and transforms. Output: one owned instanced mesh.
 function batch(name: string,geometry: THREE.BufferGeometry,material: THREE.Material | THREE.Material[],items: Shape[],shadow=true){
  const mesh=new THREE.InstancedMesh(geometry,material,items.length),matrix=new THREE.Matrix4();items.forEach((item,i)=>{matrix.makeRotationY(item.rotation||0);matrix.setPosition(item.x,item.y,item.z);matrix.scale(new THREE.Vector3(item.width,item.height,item.depth));mesh.setMatrixAt(i,matrix);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.castShadow=shadow;mesh.receiveShadow=true;mesh.name=name;group.add(mesh);return mesh;
 }
 function moduleBounds(item: Placement){
  if(!boundsByType.has(item.module)){const root=review.prototypes.get(item.module)!,box=new THREE.Box3();root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();root.traverse(part=>{if(!(isMesh(part)))return;part.geometry.computeBoundingBox();box.union(part.geometry.boundingBox!.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,part.matrixWorld)));});boundsByType.set(item.module,box);}
  const matrix=new THREE.Matrix4().makeRotationY(item.rotation);matrix.setPosition(item.x,.14,item.z);return boundsByType.get(item.module)!.clone().applyMatrix4(matrix).expandByScalar(.3);
 }

 // Purpose: Place a small part in an object's local horizontal frame.
 // Input: output list, object origin and part dimensions. Output: one world transform.
 function part(items: Shape[],origin: {x:number;z:number;rotation?:number},x:number,z:number,width:number,depth:number,height:number,y:number){
  const c=Math.cos(origin.rotation||0),s=Math.sin(origin.rotation||0);
  items.push({...cell(origin.x+x*c+z*s,origin.z-x*s+z*c,width,depth,height,y),rotation:origin.rotation||0});
 }

 // --- roads and blocks ---
 const xs=[[-60.5,-35.5],[-28.5,-3.5],[3.5,28.5],[35.5,60.5]],zs=[[-34.5,-13.5],[-6.5,42.5],[49.5,70.5]],vertical=[-64,-32,0,32,64];
 for(const z of [-38,-10,46,74]){
  roads.push(cell(0,z,135,7,.08,-.04));
  for(let x=-64;x<65;x+=7.5)if(vertical.every(v=>Math.abs(v-x)>4))markings.push(cell(x,z,2.2,.09,.008,.015));
 }
 for(const x of vertical)for(const [a,b] of zs){
  const segments=x===0&&a===-6.5?[[a,-2],[38,b]]:[[a,b]];
  for(const [start,end] of segments){roads.push(cell(x,(start+end)/2,7,end-start,.08,-.04));for(let z=start+2;z<end-1;z+=7.5)markings.push(cell(x,z,.09,Math.min(2.2,end-z),.008,.015));}
 }
 for(let xi=0;xi<xs.length;xi++)for(let zi=0;zi<zs.length;zi++){
  let [x0,x1]=xs[xi];const [z0,z1]=zs[zi];if(zi===1&&xi===1)x1=-4.8;if(zi===1&&xi===2)x0=4.8;
  const cx=(x0+x1)/2,cz=(z0+z1)/2,width=x1-x0-.15,depth=z1-z0-.15,edge=1.25;
  blocks.push(cell(cx,cz,width,depth));
  for(const side of [-1,1]){
   walks.push(cell(cx,cz+side*(depth-edge)/2,width,edge,.12,.2));
   if(zi===1&&((xi===1&&side===1)||(xi===2&&side===-1)))continue;
   walks.push(cell(cx+side*(width-edge)/2,cz,edge,depth-2*edge,.12,.2));
  }
 }
 for(const x of [-4.15,4.15])for(const z of [-4.25,40.25])walks.push(cell(x,z,1.3,4.5,.12,.2));
 const crossings=[...[-23,23].flatMap(x=>[-10,46].map(z=>({x,z,rotation:0}))),...[-4.25,40.25].map(z=>({x:0,z,rotation:Math.PI/2}))];
 for(let i=markings.length-1;i>=0;i--){
  const mark=markings[i];
  if(crossings.some(crossing=>Math.abs(mark.x-crossing.x)<(crossing.rotation?5.7:3.8)/2+mark.width/2&&Math.abs(mark.z-crossing.z)<(crossing.rotation?3.8:5.7)/2+mark.depth/2))markings.splice(i,1);
 }
 for(const crossing of crossings)for(let i=0;i<6;i++)part(markings,crossing,(i-2.5)*.65,0,.42,5.7,.008,.016);
 const parked=[{x:-48,z:-35.6,rotation:Math.PI/2},{x:17,z:-40.4,rotation:-Math.PI/2},{x:-17,z:71.6,rotation:Math.PI/2},{x:48,z:76.4,rotation:-Math.PI/2},{x:-61.6,z:8,rotation:0},{x:-66.4,z:28,rotation:Math.PI},{x:61.6,z:28,rotation:Math.PI},{x:66.4,z:8,rotation:0}];
 const pale=[...walks],dark: Shape[]=[],wheels: Shape[]=[];
 for(const car of parked){
  part(pale,car,0,0,1.7,3.6,.58,.64);part(pale,car,0,.08,1.46,1.87,.1,1.5);
  part(dark,car,0,.08,1.42,1.75,.58,1.16);
  for(const x of [-.82,.82])for(const z of [-1.08,1.08])part(wheels,car,x,z,1,1,1,.36);
  for(const x of [-.98,.98])part(markings,car,x,0,.055,4.4,.008,.016);
  for(const z of [-2.2,2.2])part(markings,car,0,z,2,.055,.008,.016);
 }
 batch('city_roads',unit,asphalt,roads,false);batch('city_markings',unit,paint,markings,false);batch('city_blocks',unit,paving,blocks,false);
 // --- end of roads and blocks ---

 // --- reused buildings and simple distant homes ---
 const types=[...review.prototypes.keys()];
 function place(x:number,z:number,rotation:number){full.push({module:types[full.length%types.length],x,z,rotation});}
 for(const side of [-1,1])for(const z of [0,18,36])place(side*26,z,side*Math.PI/2);
 for(const x of [-48,-17,17,48])place(x,-15.8,0);
 for(const x of [-17,17])place(x,51.8,Math.PI);
 for(const name of types)review.instanceModule(review.prototypes.get(name)!,full.filter(item=>item.module===name),group);
 const occupied=[...review.placements,...full].map(moduleBounds);
 for(let xi=0;xi<xs.length;xi++)for(let zi=0;zi<zs.length;zi++){
  if(zi===1&&(xi===1||xi===2))continue;
  const [x0,x1]=xs[xi],[z0,z1]=zs[zi],cx=(x0+x1)/2,cz=(z0+z1)/2;
  for(const dx of [-6,6])for(const dz of (zi===1?[-10,10]:[-5,5])){
   const x=cx+dx,z=cz+dz,height=3.8+(far.length%4)*1.6,width=4.8,depth=5.6,box=new THREE.Box3(new THREE.Vector3(x-width/2-.2,0,z-depth/2-.2),new THREE.Vector3(x+width/2+.2,height+.5,z+depth/2+.2));
   if(occupied.some(other=>other.intersectsBox(box)))continue;far.push({...cell(x,z,width,depth,height,.14+height/2),box});
  }
 }
 batch('city_distant_homes',unit,wall,far);batch('city_distant_roofs',unit,wall,far.map(h=>({...h,y:.14+h.height+.11,width:h.width+.3,height:.22,depth:h.depth+.3})));
 const windows=[];for(const h of far)for(const level of [.4,.72]){windows.push(cell(h.x,h.z-h.depth/2-.04,3.3,.06,.55,.14+h.height*level));windows.push(cell(h.x+h.width/2+.04,h.z,.06,3.8,.55,.14+h.height*level));}batch('city_distant_windows',unit,ink,windows,false);

 // --- end of reused buildings and simple distant homes ---

 // --- parks and shared street details ---
 const parks=[cell(-48,18,12,14,.04,.16),cell(48,18,12,14,.04,.16)],trunks: Shape[]=[],crowns: Shape[]=[],parkPaths: Shape[]=[],benches: {x:number;z:number;rotation:number}[]=[];
 for(const park of parks){
  parkPaths.push(cell(park.x,park.z,23,1.3,.025,.2225));
  for(const side of [-1,1])parkPaths.push(cell(park.x,park.z+side*3.8,1.3,6.3,.025,.2225));
  for(const dx of [-4,4])for(const dz of [-4.5,-1.8,4.5]){trunks.push(cell(park.x+dx,park.z+dz,.22,.22,2.2,1.24));crowns.push(cell(park.x+dx,park.z+dz,1.25,1.25,3.6,3.6));}
  for(const side of [-1,1]){
   const bench={x:park.x+side*2.8,z:park.z+2.2,rotation:0};benches.push(bench);
   part(pale,bench,0,0,2.1,.55,.16,.62);part(pale,bench,0,.24,2.1,.12,.52,.94);
   for(const x of [-.8,.8])part(dark,bench,x,0,.14,.42,.38,.35);
  }
 }
 pale.push(...parkPaths);
 batch('city_parks',unit,grass,parks,false);batch('city_tree_trunks',unit,ink,trunks);batch('city_tree_crowns',cone,grass,crowns);
 batch('city_street_pale',unit,wall,pale);batch('city_street_dark',unit,ink,dark);batch('city_parked_wheels',wheel,ink,wheels);
 // --- end of parks and shared street details ---
 review.city.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(review.city).union(new THREE.Box3().setFromObject(review.road)),focus=new THREE.Vector3(-1.1,0,14);
 const batches=group.children.filter((o): o is THREE.InstancedMesh=>isInstancedMesh(o));

 // --- progress, fit and cleanup ---
 return {
  group,bounds,full,far,roads,walks,crossings,parked,parks,parkPaths,benches,
  setProgress(value:number){
   if(disposed)return;group.visible=value>.800001;const t=THREE.MathUtils.smoothstep(value,.8,1),scale=1+3*t;
   if(Math.abs(scale-shadowScale)<.000001)return;shadowScale=scale;sun.position.copy(lightPosition).sub(sun.target.position).multiplyScalar(scale).add(sun.target.position);for(const key of shadowKeys)sun.shadow.camera[key]=limits[key]*scale;sun.shadow.camera.updateProjectionMatrix();sun.shadow.needsUpdate=true;
  },
  frameFor(aspect:number){if(aspect!==fitAspect){fitAspect=aspect;const result=review.fitBounds(bounds,new THREE.Vector3(1,1.25,-1),32,aspect,focus);fit={camera:result.camera.toArray(),look:result.look.toArray(),fov:32};}return fit;},
  metrics(){return {ready:!disposed,visible:group.visible,disposed,additionalBuildings:full.length+far.length,totalBuildings:review.placements.length+full.length+far.length,fullModules:full.length,distantBuildings:far.length,roadSegments:roads.length,sidewalkSections:walks.length,crossings:crossings.length,parkedVehicles:parked.length,parks:parks.length,parkPathSections:parkPaths.length,benches:benches.length,trees:crowns.length,batches:batches.length,ownedGeometries:geometries.size,ownedMaterials:materials.size,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()}};},
  dispose(){if(disposed)return;disposed=true;group.removeFromParent();batches.forEach(mesh=>mesh.dispose());geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());sun.position.copy(lightPosition);for(const key of shadowKeys)sun.shadow.camera[key]=limits[key];sun.shadow.camera.updateProjectionMatrix();sun.shadow.needsUpdate=true;group.clear();}
 };
}
// --- end of city layout and resource ownership ---
