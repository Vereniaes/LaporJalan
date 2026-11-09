/* Todo:
-> pick how heavy the map may be on this device (owner choice, 10 Nov: old laptops, e.g. a 2015 MacBook on an unsupported macOS)
    -> 'full'  : WebGL map with 3D
    -> 'lite'  : WebGL map in saver mode (1x pixels, no 3D, no camera animation); automatic on software rendering or a weak device
    -> 'none'  : no usable WebGL at all; a raster map (Leaflet) takes its place
-> the visitor can switch saver mode by hand; the choice is remembered in this browser
-> high-end devices (8+ cores, 8+ GB or unknown memory) get antialiased 3D; a map that renders below ~25 fps drops to saver mode on its own
-> ?peta=ringan | hemat | penuh forces a mode for this visit (to try the raster map, or to help someone on an old laptop)
*/
import { useSyncExternalStore } from 'react';

export type MapTier = 'full' | 'lite' | 'none';
const KEY = 'lj-map-mode';

// --- what the graphics stack can do (probed once) ---
let probed: { webgl: 'webgl2' | 'webgl' | null; software: boolean } | undefined;
const SOFTWARE = /swiftshader|llvmpipe|softpipe|software|basic render|microsoft basic/i;
function rendererOf(gl: WebGLRenderingContext) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  return String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
}
function release(gl: WebGLRenderingContext) { gl.getExtension('WEBGL_lose_context')?.loseContext(); }
// Why/Note: a context that exists only without failIfMajorPerformanceCaveat means the browser fell back to software or a blocklisted GPU
function probe() {
  if (probed) return probed;
  probed = { webgl: null, software: false };
  try {
    for (const type of ['webgl2', 'webgl'] as const) {
      const fast = document.createElement('canvas').getContext(type, { failIfMajorPerformanceCaveat: true }) as WebGLRenderingContext | null;
      if (fast) { probed = { webgl: type, software: SOFTWARE.test(rendererOf(fast)) }; release(fast); return probed; }
    }
    for (const type of ['webgl2', 'webgl'] as const) {
      const slow = document.createElement('canvas').getContext(type) as WebGLRenderingContext | null;
      if (slow) { probed = { webgl: type, software: true }; release(slow); return probed; }
    }
  } catch { /* no WebGL */ }
  return probed;
}
export const strongDevice = () => (navigator.hardwareConcurrency || 0) >= 8 && ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) >= 8;
const weakDevice = () => (navigator.hardwareConcurrency || 8) <= 2 || ((navigator as { deviceMemory?: number }).deviceMemory ?? 8) <= 2;
// --- end of graphics probe ---

// --- the shared choice ---
let preference: 'hemat' | 'penuh' | null = (() => { try { const value = localStorage.getItem(KEY); return value === 'hemat' || value === 'penuh' ? value : null; } catch { return null; } })();
const forced = (() => { try { return new URLSearchParams(location.search).get('peta'); } catch { return null; } })();
let broken = forced === 'ringan'; // a map that failed to start after the probe said yes, or the raster map asked for
// measured slowness lasts for this browser session; a hand-picked mode always wins
let slow = (() => { try { return sessionStorage.getItem('lj-map-slow') === '1'; } catch { return false; } })();
const listeners = new Set<() => void>();
let cached: { tier: MapTier; auto: boolean } | undefined;
function compute() {
  const graphics = probe();
  if (!graphics.webgl || broken) return { tier: 'none' as const, auto: true };
  if (forced === 'hemat' || forced === 'penuh') return { tier: forced === 'hemat' ? 'lite' as const : 'full' as const, auto: false };
  if (preference) return { tier: preference === 'hemat' ? 'lite' as const : 'full' as const, auto: false };
  return { tier: graphics.software || weakDevice() || slow ? 'lite' as const : 'full' as const, auto: true };
}
function snapshot() {
  const next = compute();
  if (!cached || cached.tier !== next.tier || cached.auto !== next.auto) cached = next;
  return cached;
}
const notify = () => { cached = undefined; listeners.forEach(listener => listener()); };

export function setSaverMode(on: boolean) {
  preference = on ? 'hemat' : 'penuh';
  try { localStorage.setItem(KEY, preference); } catch { /* the choice lasts for this visit */ }
  notify();
}
export function reportSlowMap() {
  if (slow || preference) return;
  slow = true;
  try { sessionStorage.setItem('lj-map-slow', '1'); } catch { /* this visit only */ }
  notify();
}
export function markWebglBroken() { if (!broken) { broken = true; notify(); } }
export const mapTier = () => snapshot().tier;
export function useMapMode() {
  return useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, snapshot, () => ({ tier: 'full' as MapTier, auto: true }));
}
// --- end of the shared choice ---
