/* Todo:
-> Miko flies across the map (owner, 11 Nov): while reports load, after "Cari di area ini", and when a report is sent
    -> the clip flaps in place (cropped around the owl); the path across the map is CSS transform only
    -> one pass (~3 s, under the 5 s WCAG 2.2.2 limit) per trigger; never with reduced motion or on a weak device
    -> decorative: aria-hidden, no pointer events; what happens is said in text elsewhere (loading line, toast)
*/
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { useMapMode } from '../map/capability';

const FLIGHT_MS = 3000;
let clip: Promise<string> | null = null; // one download per page; the clip loops while it flies

// input param : run - a counter; each increase is one flight
export function MikoFlight({ run }: { run: number }) {
  const reduce = useReducedMotion(), { tier } = useMapMode();
  const allowed = !reduce && tier === 'full';
  const [flight, setFlight] = useState<{ id: number; src: string } | null>(null);
  const last = useRef(-Infinity); // not 0: a trigger in the page's first 3 s (performance.now() < 3000) must still fly

  useEffect(() => {
    if (!run || !allowed || document.hidden) return;
    // two triggers close together (load + area search) make one flight
    if (performance.now() - last.current < FLIGHT_MS) return;
    last.current = performance.now();
    let cancelled = false;
    clip ??= fetch('/home/miko/anim/fly.webp').then(response => response.blob()).then(blob => URL.createObjectURL(blob));
    clip.then(src => { if (!cancelled) setFlight({ id: run, src }); }).catch(() => { clip = null; });
    return () => { cancelled = true; };
  }, [run, allowed]);
  useEffect(() => {
    if (!flight) return;
    const timer = window.setTimeout(() => setFlight(null), FLIGHT_MS + 100);
    return () => window.clearTimeout(timer);
  }, [flight]);

  if (!flight) return null;
  return <div className="lj-flight" aria-hidden="true">
    <div key={flight.id} className="lj-flight-path"><img className="lj-flight-owl" src={flight.src} width="192" height="192" alt="" decoding="async" /></div>
  </div>;
}
