/* Todo:
-> connect native scrolling to one interruptible scene timeline
-> own visibility, loading, pin timing and DOM anchor cleanup
*/
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { advanceSpring, clamp, stages, stageAt } from './three/journey';
import { createLiftClock } from './three/liftClock';
import { useReducedMotionPreference } from './useReducedMotionPreference';
import type { ReportSceneApi } from './three/scene';

type StoryStatus = 'waiting' | 'loading' | 'ready' | 'failed' | 'reduced';
export interface StoryView { step: number; kind: string; status: StoryStatus; flow: boolean; reduced: boolean; photo: string }
interface StoryElements {
  root: RefObject<HTMLDivElement>; stage: RefObject<HTMLDivElement>; canvas: RefObject<HTMLDivElement>;
  pin: RefObject<HTMLDivElement>; card: RefObject<HTMLElement>; line: RefObject<SVGLineElement>; flash: RefObject<HTMLDivElement>;
}
// --- one story controller ---
/** Purpose: Keep rendering, scrolling and the visible pin clock in one lifecycle.
 * Input: persistent story element refs. Output: readable state and chapter navigation.
 */
export function useReportingStory(elements: StoryElements) {
  const reduced = useReducedMotionPreference();
  const [view, setView] = useState<StoryView>(() => ({ step: 0, kind: 'intro', status: reduced ? 'reduced' : 'waiting', flow: reduced || innerHeight < 740, reduced, photo: '' }));
  const select = useRef<(index: number) => void>(() => {});
  const choose = useCallback((index: number) => select.current(index), []);
  useEffect(() => {
    const root = elements.root.current!, stage = elements.stage.current!, canvas = elements.canvas.current!;
    const events = new AbortController();
    let scene: ReportSceneApi | undefined, disposed = false, initializing = false, active = false, flow = reduced;
    let status: StoryStatus = reduced ? 'reduced' : 'waiting', photo = '', requested = 0, visual = 0, velocity = 0, target = 0;
    let raf = 0, last = 0, photoTaken = false, flashCount = 0, layoutAt = 0, lastFlash = -Infinity, flashAnimation: Animation | undefined, inspection = false;
    const gate = createLiftClock(invalidate);

    function updateView() {
      const index = stageAt(visual), ascending = visual > .8 && visual < .995;
      let kind: string = ascending ? 'lift' : stages[index].kind;
      if (kind === 'photo' && !photoTaken) kind = 'capture';
      if (kind === 'success' && status !== 'ready' && status !== 'reduced') kind = 'failed';
      root.dataset.progress = visual.toFixed(5); root.dataset.step = String(index); root.dataset.kind = kind;
      setView(previous => previous.step === index && previous.kind === kind && previous.status === status && previous.flow === flow && previous.reduced === reduced && previous.photo === photo ? previous : { step: index, kind, status, flow, reduced, photo });
    }
    function positionPin() {
      const pin = elements.pin.current!, line = elements.line.current!, point = scene?.anchor();
      const visible = visual >= .72 && status === 'ready' && Boolean(point?.visible);
      pin.hidden = !visible; line.style.visibility = visible ? 'visible' : 'hidden';
      if (!visible || !point) return;
      pin.style.transform = `translate(${point.x}px,${point.y}px)`;
      const label = pin.querySelector('span')!, imageBounds = canvas.getBoundingClientRect();
      const right = imageBounds.width - point.x - 26, left = point.x - 26, onRight = right >= left;
      const labelWidth = Math.min(142, Math.max(80, onRight ? right : left));
      label.style.width = `${labelWidth}px`; label.style.left = onRight ? '18px' : `${-18 - labelWidth}px`;
      label.style.top = `${Math.max(8, Math.min(point.y - 32, imageBounds.height - label.offsetHeight - 8)) - point.y}px`;
      const bounds = stage.getBoundingClientRect(), image = canvas.getBoundingClientRect(), card = elements.card.current!.getBoundingClientRect();
      const stacked = innerWidth < 1100 || flow;
      line.setAttribute('x1', String(image.left - bounds.left + point.x)); line.setAttribute('y1', String(image.top - bounds.top + point.y));
      line.setAttribute('x2', String(stacked ? card.left - bounds.left + card.width / 2 : card.left - bounds.left));
      line.setAttribute('y2', String(stacked ? card.top - bounds.top : card.top - bounds.top + card.height / 2));
    }
    function render() {
      if (disposed) return;
      if (visual < .36) photoTaken = false;
      if (status === 'ready' && visual >= .455 && !photoTaken) {
        photoTaken = true;
        if (!reduced && visual < .59 && performance.now() - lastFlash >= 1200) {
          lastFlash = performance.now(); flashCount++; flashAnimation?.cancel();
          flashAnimation = elements.flash.current!.animate([{ opacity: 0 }, { opacity: .28, offset: .15 }, { opacity: 0 }], { duration: 170, easing: 'linear' });
        }
      }
      if (status === 'ready') scene?.applyProgress(visual, innerWidth >= 1100 && !flow ? 'desktop' : 'stacked');
      updateView(); positionPin();
    }
    function tick(time: number) {
      raf = 0; if (disposed || !active) return;
      const dt = last ? (time - last) / 1000 : 1 / 60; last = time;
      target = inspection ? requested : status === 'ready' ? gate.sample(requested, visual) : status === 'waiting' || status === 'loading' ? Math.min(requested, .69) : requested;
      [visual, velocity] = advanceSpring(visual, target, velocity, dt);
      if (Math.abs(target - visual) + Math.abs(velocity) < .00004) { visual = target; velocity = 0; }
      render();
      if (Math.abs(target - visual) + Math.abs(velocity) > .00004 || gate.metrics().state === 'lifting') raf = requestAnimationFrame(tick);
      else last = 0;
    }
    function invalidate() { if (!disposed && active && !raf && !reduced) raf = requestAnimationFrame(tick); }
    function updateActive() {
      const bounds = stage.getBoundingClientRect(), next = !document.hidden && bounds.bottom > 0 && bounds.top < innerHeight;
      if (next === active) return; active = next;
      if (active) { gate.resume(); last = 0; invalidate(); }
      else { gate.pause(); cancelAnimationFrame(raf); raf = 0; last = 0; }
    }
    function readScroll() {
      if (disposed) return;
      if (!flow && !inspection) {
        const top = parseFloat(root.style.getPropertyValue('--lp-story-top')) || 104;
        const start = root.getBoundingClientRect().top + scrollY - top;
        requested = clamp((scrollY - start) / Math.max(1, root.offsetHeight - stage.offsetHeight));
      }
      updateActive(); invalidate();
    }
    function layout() {
      layoutAt = performance.now();
      const header = document.querySelector('.lp-header')?.getBoundingClientRect().height || 88;
      root.style.setProperty('--lp-story-top', `${Math.round(header + 16)}px`);
      flow = reduced || innerHeight < 740 || parseFloat(getComputedStyle(document.documentElement).fontSize) > 19;
      root.dataset.flow = String(flow); root.dataset.reduced = String(reduced);
      scene?.resize(); updateView(); readScroll();
      if (status === 'ready') { scene?.applyProgress(visual, innerWidth >= 1100 && !flow ? 'desktop' : 'stacked'); positionPin(); }
    }
    function sceneUnavailable() {
      if (disposed || status === 'failed') return;
      status = 'failed'; gate.reset(); scene?.dispose(); updateView(); invalidate();
    }
    async function initialize() {
      if (disposed || initializing || reduced) return; initializing = true; status = 'loading'; updateView();
      try {
        const module = await import('./three/scene'); if (disposed) return;
        scene = module.createReportScene(canvas);
        canvas.querySelector('canvas')?.addEventListener('webglcontextlost', sceneUnavailable, { signal: events.signal });
        await scene.ready; if (disposed || scene.metrics().disposed) return;
        status = 'ready'; photo = scene.photo; layout(); render(); invalidate();
      } catch { sceneUnavailable(); }
    }
    function navigate(index: number) {
      if (disposed) return; inspection = false; const next = stages[clamp(index, 0, 6)].at;
      if (flow) { requested = next; if (reduced) { visual = next; velocity = 0; render(); } else invalidate(); }
      else {
        const top = parseFloat(root.style.getPropertyValue('--lp-story-top')) || 104;
        window.scrollTo({ top: root.getBoundingClientRect().top + scrollY - top + next * (root.offsetHeight - stage.offsetHeight), behavior: 'instant' });
        requested = next; updateActive(); invalidate();
      }
    }
    const near = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) initialize(); updateActive(); }, { rootMargin: '200px' }); near.observe(root);
    const resize = new ResizeObserver(layout); resize.observe(canvas); resize.observe(elements.card.current!); const header = document.querySelector('.lp-header'); if (header) resize.observe(header);
    const font = new MutationObserver(layout); font.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('scroll', readScroll, { passive: true, signal: events.signal });
    window.addEventListener('resize', layout, { signal: events.signal });
    document.addEventListener('visibilitychange', updateActive, { signal: events.signal });
    select.current = navigate; layout(); updateView();

    // Development inspection does not ship in the production bundle.
    if (import.meta.env.DEV) {
      (root as HTMLDivElement & { story?: unknown }).story = {
        inspect(value: number) { inspection = true; gate.reset(); cancelAnimationFrame(raf); raf = 0; last = 0; requested = visual = target = clamp(value); velocity = 0; photoTaken = visual >= .455; render(); },
        choose: navigate,
        metrics: () => ({ status, flow, reduced, requested, visual, velocity, active, layoutAt, animating: Boolean(raf), flashCount, photoTaken, gate: gate.metrics(), engine: scene?.metrics() }),
      };
    }
    return () => {
      if (disposed) return; disposed = true; active = false; cancelAnimationFrame(raf); raf = 0; last = 0; gate.dispose(); flashAnimation?.cancel();
      events.abort(); near.disconnect(); resize.disconnect(); font.disconnect(); scene?.dispose(); select.current = () => {};
      delete (root as HTMLDivElement & { story?: unknown }).story;
    };
  }, [reduced]);
  return { view, choose };
}
// --- end of one story controller ---
