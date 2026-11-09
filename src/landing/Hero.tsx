/* Todo:
-> open the landing with the approved rider in a full width 3D scene
-> keep report controls readable during native scroll and visual fallbacks
*/
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotionPreference } from './useReducedMotionPreference';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { ReportAction, feedback } from './controls';
import { advanceSpring, clamp } from './three/journey';
import type { ReportSceneApi } from './three/scene';
import './hero.css';

type HeroStatus = 'loading' | 'ready' | 'failed' | 'reduced';
// --- cinematic opening ---
/** Purpose: Introduce the same rider before the seven-step reporting story.
 * Input: current reporting availability. Output: scroll-driven hero and existing actions.
 */
export function Hero({ available, serviceLoading }: { available: boolean; serviceLoading: boolean }) {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null), title = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotionPreference();
  const [status, setStatus] = useState<HeroStatus>(reduced ? 'reduced' : 'loading');
  useEffect(() => {
    const element = root.current!, viewport = stage.current!, surface = canvas.current!, heading = title.current!;
    const listeners = new AbortController();
    let engine: ReportSceneApi | undefined, disposed = false, ready = false, failed = false, active = false, flow = reduced, starting = false;
    let requested = 0, value = 0, velocity = 0, raf = 0, last = 0, inspection = false;
    setStatus(reduced ? 'reduced' : 'loading');
    function render() {
      element.dataset.progress = value.toFixed(5);
      heading.style.opacity = String(flow ? 1 : 1 - clamp((value - .12) / .45));
      heading.style.transform = flow ? '' : `translateY(${-24 * value}px)`;
      if (ready) engine?.applyHero(value, innerWidth < 801 ? 'stacked' : 'desktop');
    }
    function tick(time: number) {
      raf = 0; if (disposed || !active) return;
      const dt = last ? (time - last) / 1000 : 1 / 60; last = time;
      [value, velocity] = advanceSpring(value, requested, velocity, dt);
      if (Math.abs(value - requested) + Math.abs(velocity) < .00004) { value = requested; velocity = 0; }
      render();
      if (Math.abs(value - requested) + Math.abs(velocity) > .00004) raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function invalidate() { if (active && !disposed && !raf && !reduced) raf = requestAnimationFrame(tick); }
    function readScroll() {
      const bounds = viewport.getBoundingClientRect();
      active = !document.hidden && bounds.bottom > 0 && bounds.top < innerHeight;
      if (!active) { cancelAnimationFrame(raf); raf = 0; last = 0; return; }
      if (!inspection) requested = flow ? 0 : clamp((scrollY - (element.getBoundingClientRect().top + scrollY - parseFloat(element.style.getPropertyValue('--lp-hero-top')))) / Math.max(1, element.offsetHeight - viewport.offsetHeight));
      invalidate();
    }
    function layout() {
      const header = document.querySelector('.lp-header')?.getBoundingClientRect().height || 88;
      element.style.setProperty('--lp-hero-top', `${Math.round(header)}px`);
      flow = reduced || failed || innerHeight < 740 || parseFloat(getComputedStyle(document.documentElement).fontSize) > 19;
      element.dataset.flow = String(flow); engine?.resize(); readScroll();
      if (ready && active) render();
    }
    function unavailable() {
      if (disposed || failed) return; failed = true; ready = false; engine?.dispose(); setStatus('failed'); layout();
    }
    async function initialize() {
      if (starting || disposed || reduced) return; starting = true;
      try {
        const module = await import('./three/scene'); if (disposed) return;
        engine = module.createReportScene(surface, 'hero');
        surface.querySelector('canvas')?.addEventListener('webglcontextlost', unavailable, { signal: listeners.signal });
        await engine.ready; if (disposed || engine.metrics().disposed) return;
        ready = true; setStatus('ready'); layout();
      } catch { unavailable(); }
    }
    const near = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) initialize(); readScroll(); }, { rootMargin: '100px' }); near.observe(element);
    const resize = new ResizeObserver(layout); resize.observe(viewport); resize.observe(surface);
    const header = document.querySelector('.lp-header'); if (header) resize.observe(header);
    const font = new MutationObserver(layout); font.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', readScroll, { passive: true, signal: listeners.signal });
    window.addEventListener('resize', layout, { signal: listeners.signal });
    document.addEventListener('visibilitychange', readScroll, { signal: listeners.signal });
    layout(); if (reduced) render();
    if (import.meta.env.DEV) (element as HTMLElement & { hero?: unknown }).hero = {
      inspect(progress: number) { inspection = true; cancelAnimationFrame(raf); raf = 0; last = 0; requested = value = clamp(progress); velocity = 0; render(); },
      metrics: () => ({ value, velocity, requested, active, flow, ready, animating: Boolean(raf), engine: engine?.metrics() }),
    };
    return () => { disposed = true; active = false; cancelAnimationFrame(raf); listeners.abort(); near.disconnect(); resize.disconnect(); font.disconnect(); engine?.dispose(); delete (element as HTMLElement & { hero?: unknown }).hero; };
  }, [reduced]);
  return <section ref={root} className="lp-cinematic" data-status={status} data-reduced={reduced} aria-labelledby="hero-title">
    <div ref={stage} className="lp-cinematic-stage">
      <div ref={canvas} className="lp-cinematic-canvas" role="img" aria-label="Ilustrasi 3D pengendara motor bebek di lingkungan kota"><picture><source media="(max-width: 800px)" srcSet="/landing/hero-mobile-still.webp" /><img src="/landing/hero-still.webp" alt="" loading="eager" /></picture></div>
      <h1 ref={title} id="hero-title">Temukan jalan rusak?<span>Bantu tandai lokasinya.</span></h1>
      <div className="lp-cinematic-copy"><p className="lp-hero-description">Catat kondisi jalan dengan foto dan lokasi. Lihat laporan serta pembaruan warga dalam satu peta.</p><div className="lp-actions"><ReportAction available={available} /><motion.a href="/peta" className="lp-button lp-button-secondary" {...feedback}>Lihat peta <ArrowRight size={18} /></motion.a></div><p className="lp-service-note" role="status">{serviceLoading ? 'Memeriksa layanan pelaporan…' : available ? 'Untuk warga yang ingin ikut mencatat kondisi jalan.' : 'Pelaporan belum tersedia. Peta laporan tetap dapat dibuka.'}</p></div>
      <a href="#cara-kerja" className="lp-cinematic-cue"><ArrowDown size={18} /> Kenali cara kerjanya</a><span className="lp-cinematic-caption">Ilustrasi 3D</span>
    </div>
  </section>;
}
// --- end of cinematic opening ---
