/* Todo:
-> define the approved rider, capture and illustrated-city journey
-> sample one reversible scene frame for scroll and automatic lift progress
*/
import type { StoryFrame, StoryProfile, CityLayout } from './types';

// --- story and camera data ---
export const stages=[
 {name:'Berangkat',start:0,at:0,title:'Jalan rusak di perjalanan?',description:'Catat lokasi dan kondisi jalan melalui LaporJalan.',card:'Laporan jalan dari warga',hint:'Lokasi, kondisi, dan bukti dalam satu alur.',kind:'intro'},
 {name:'Menemukan',start:.12,at:.20,title:'Ada kondisi yang perlu dicatat.',description:'Amati kondisi yang terlihat sebelum membuat laporan.',card:'Jalan berlubang',hint:'Contoh kondisi di perjalanan.',kind:'notice'},
 {name:'Berhenti',start:.27,at:.35,title:'Berhenti di tempat aman.',description:'Kamera mendekat setelah pengendara menepi.',card:'Ambil foto setelah berhenti',hint:'Telepon digunakan ketika motor sudah diam.',kind:'stop'},
 {name:'Foto',start:.40,at:.47,title:'Simpan bukti kondisi jalan.',description:'Hasil foto tampil di depan layar setelah satu flash singkat.',card:'Bukti kondisi jalan',hint:'Ilustrasi dari adegan yang sama.',kind:'photo'},
 {name:'Melanjutkan',start:.54,at:.64,title:'Perjalanan dilanjutkan.',description:'Motor berjalan lagi. Kamera tetap di titik kejadian.',card:'Kondisi tetap tercatat',hint:'Titik kerusakan tetap berada di lokasi yang sama.',kind:'depart'},
 {name:'Penanda',start:.72,at:.76,title:'Jalan berlubang ditandai.',description:'Pin tampil dua detik sebelum kamera naik.',card:'Jalan berlubang',hint:'Titik contoh terhubung ke kota ilustrasi 3D.',kind:'pin'},
 {name:'Peta kota 3D',start:.86,at:1,title:'Titik laporan terlihat di kota.',description:'Kota ilustrasi 3D dengan pin pada lokasi kerusakan.',card:'Laporan jalan rusak berhasil diterima',hint:'Contoh alur · tidak ada laporan yang dikirim.',kind:'success'}
];
const keys=[
 {p:0,rider:[-1.4,0,6.2],pose:0,desktop:{camera:[-.15,2.35,.4],look:[-1.75,1.05,9.2]},stacked:{camera:[-.15,2.2,.8],look:[-1.4,.95,7.4]}},
 {p:.12,rider:[-1.4,0,8],pose:0,desktop:{camera:[-.15,2.35,2.2],look:[-1.75,1.05,11]},stacked:{camera:[-.15,2.2,3],look:[-1.4,.95,9.2]}},
 {p:.27,rider:[-2.65,0,12.2],pose:.4,desktop:{camera:[1.6,2.65,8.2],look:[-3.7,1.05,13]},stacked:{camera:[1,2.2,9.4],look:[-1.9,.85,13]}},
 {p:.40,rider:[-2.65,0,12.2],pose:.8,desktop:{camera:[1,2.2,9.6],look:[-2.4,.9,13.1]},stacked:{camera:[.6,2.1,9.6],look:[-2.1,.85,13.1]}},
 {p:.54,rider:[-2.65,0,12.2],pose:.8,desktop:{camera:[1,2.2,9.6],look:[-2.4,.9,13.1]},stacked:{camera:[.6,2.1,9.6],look:[-2.1,.85,13.1]}},
 {p:.59,rider:[-2.65,0,12.2],pose:0,desktop:{camera:[1,2.2,9.6],look:[-2.4,.9,13.1]},stacked:{camera:[.6,2.1,9.6],look:[-2.1,.85,13.1]}},
 {p:.72,rider:[-2.65,0,36],pose:0,desktop:{camera:[1,2.2,9.6],look:[-2.4,.9,13.1]},stacked:{camera:[.6,2.1,9.6],look:[-2.1,.85,13.1]}},
 {p:.80,rider:[-2.65,0,36],pose:0,desktop:{camera:[1,2.2,9.6],look:[-2.4,.9,13.1]},stacked:{camera:[.6,2.1,9.6],look:[-2.1,.85,13.1]}},
 {p:.91,rider:[-2.65,0,36],pose:0,desktop:{camera:[9,45,-3],look:[-1.1,0,14]},stacked:{camera:[8,54,-3],look:[-1.1,0,14]}},
 {p:1,rider:[-2.65,0,36],pose:0,desktop:{camera:[9,65,-3],look:[-1.1,0,14]},stacked:{camera:[8,70,-3],look:[-1.1,0,14]}}
];
export const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));
export const smooth=(t:number)=>{const v=clamp(t);return v*v*(3-2*v);};
export function stageAt(p:number){let index=stages.length-1;while(index>0&&p<stages[index].start)index--;return index;}
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;

// Purpose: Sample the approved scene without moving its camera during departure.
// Input: story progress, layout and CSS canvas aspect. Output: one scene frame.
function sampleBaseJourney(value:number,profile:StoryProfile,aspect=1.45): StoryFrame{
 const p=clamp(value);let i=0;while(i<keys.length-2&&p>keys[i+1].p)i++;
 const a=keys[i],b=keys[i+1],t=smooth((p-a.p)/(b.p-a.p)),vec=(x:number[],y:number[])=>x.map((v,j)=>mix(v,y[j],t));
 const look=vec(a[profile].look,b[profile].look),camera=vec(a[profile].camera,b[profile].camera),rider=vec(a.rider,b.rider),scale=profile==='stacked'?Math.max(1,1.45/aspect):1;
 return {camera:camera.map((v,j)=>look[j]+(v-look[j])*scale),look,rider,pose:mix(a.pose,b.pose,t),riderVisible:p<.715,fov:profile==='desktop'?46:48,wheel:Math.hypot(rider[0]+1.4,rider[2]-6.2)/.29,yaw:0};
}
// --- end of story and camera data ---

// --- illustrated ending and progress spring ---
/** Purpose: Keep the approved road journey and fitted city in one camera.
 * Input: progress, layout, canvas aspect and optional loaded city. Output: scene frame.
 */
export function sampleJourney(value:number,profile:StoryProfile,aspect=1.45,city?:CityLayout): StoryFrame {
 const frame=sampleBaseJourney(value,profile,aspect);if(value<=.8||!city)return frame;
 const start=sampleBaseJourney(.8,profile,aspect),end=city.frameFor(aspect),t=smooth((value-.8)/.2),aim=smooth((value-.8)/.08);
 return {...frame,camera:start.camera.map((v,i)=>mix(v,end.camera[i],t)),look:start.look.map((v,i)=>mix(v,end.look[i],aim)),fov:mix(start.fov,end.fov,t),near:mix(.2,2,t),far:800};
}
/** Purpose: Retarget progress without discarding its current velocity.
 * Input: current value, target, velocity and elapsed seconds. Output: next spring state.
 */
export function advanceSpring(value:number,target:number,velocity:number,dt:number): [number,number] {
 const frequency=15.5,offset=value-target,impulse=velocity+frequency*offset,decay=Math.exp(-frequency*dt);
 return [target+(offset+impulse*dt)*decay,(velocity-frequency*impulse*dt)*decay];
}
// --- end of illustrated ending and progress spring ---
