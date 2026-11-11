/* Todo:
-> Miko comes alive (owner, 10 Nov): short loops generated in Google Flow from Miko's own felt poses, magenta keyed out (knowledge/miko-wave-2026-11-10)
    -> the still image stays the element: same class, size and position as before; the animation lies on top only while it plays
    -> plays once (~3 s, under the 5 s WCAG 2.2.2 limit) when Miko comes into view, again on a later visit, never with reduced motion or on a weak device
    -> each loop ends on the start pose, so swapping back to the still is seamless
*/
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useMapMode } from '../map/capability';

// where the animation sits relative to the still (percent of the still's width); measured when the frames were cropped
const ANIMS = {
  wave: { left: -0.06, top: -3.33, w: 100, h: 103.44 },
  phone: { left: -0.06, top: -0.06, w: 100.39, h: 100 },
  clipboard: { left: -0.06, top: -0.06, w: 100, h: 100 },
  pin: { left: -0.06, top: -10.57, w: 100, h: 110.55 },
  'peek-puddle': { left: -0.06, top: -6.65, w: 100.39, h: 106.64 },
  // the owl Flow clips (owner, 11 Nov): the still is the clip's own first frame, so it sits exactly on top
  look: { left: 0, top: 0, w: 100, h: 100, ms: 50 * 100 }, // 50 frames at 10 fps: blinks and looks left and right (5 s, the WCAG 2.2.2 limit)
} as const;
export type MikoAnim = keyof typeof ANIMS;
export const hasMikoAnim = (pose: string): pose is MikoAnim => pose in ANIMS;
const LOOP_MS = 36 * 83; // 36 frames at 12 fps (a pose without its own ms)
const loopMs = (anim: MikoAnim) => { const place = ANIMS[anim]; return 'ms' in place ? place.ms : LOOP_MS; };
const REST_MS = 8000;    // a Miko that comes back into view waits at least this long before playing again

export function MikoMotion({ anim, className, src, srcSet, sizes, loading }: {
  anim: MikoAnim; className: string; src: string; srcSet?: string; sizes?: string; loading?: 'lazy';
}) {
  const box = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion(), { tier } = useMapMode();
  const [run, setRun] = useState(0), [shown, setShown] = useState(false), [url, setUrl] = useState('');
  const blob = useRef<Promise<Blob> | null>(null);
  const allowed = !reduce && tier === 'full';

  useEffect(() => {
    if (!allowed || !box.current) return;
    let last = -Infinity, timer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || document.hidden || performance.now() - last < REST_MS) return;
      last = performance.now(); setRun(value => value + 1);
    }, { threshold: 0.6 });
    observer.observe(box.current);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [allowed]);
  // a fresh object URL per play restarts the animated WebP from frame one without downloading it again
  useEffect(() => {
    if (!run) return;
    let next = '', cancelled = false;
    blob.current ??= fetch(`/home/miko/anim/${anim}.webp`).then(response => response.blob());
    blob.current.then(data => { if (!cancelled) { next = URL.createObjectURL(data); setUrl(next); } }).catch(() => { blob.current = null; });
    return () => { cancelled = true; if (next) window.setTimeout(() => URL.revokeObjectURL(next), loopMs(anim)); };
  }, [run]);
  // hide the animation again after one loop
  useEffect(() => {
    if (!shown) return;
    const timer = window.setTimeout(() => setShown(false), loopMs(anim));
    return () => window.clearTimeout(timer);
  }, [shown, run]);

  const place = ANIMS[anim];
  return <span ref={box} className={`${className} miko-motion${shown ? ' is-playing' : ''}`} aria-hidden="true">
    <img className="miko-still" src={src} srcSet={srcSet} sizes={sizes} width="512" height="512" alt="" loading={loading} decoding="async" />
    {allowed && url && <img key={url} className="miko-anim" src={url} alt="" decoding="async"
      style={{ left: `${place.left}%`, top: `${place.top}%`, width: `${place.w}%` }}
      onLoad={() => setShown(true)} />}
  </span>;
}
