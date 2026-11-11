/* Todo:
-> the Opal CCTV player (owner, 11 Nov): one live camera at a time, in a card over the map
    -> HLS straight from the camera owner's server: Safari plays it natively, other browsers load hls.js only now
    -> muted and inline; stops while the card is closed or the tab is hidden; no recording, no frame capture
    -> the card names the source and says the map point is an estimate; nothing is drawn over the picture (the owner's watermark stays)
    -> no picture within 15 s, or a fatal stream error: say so, offer a retry and the source page
*/
import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Maximize2, RotateCw, X } from 'lucide-react';
import type Hls from 'hls.js';
import type { CctvLocation, CctvSource } from './cameras';

type State = 'loading' | 'playing' | 'error';
const clock = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' });

export function CctvPlayer({ location, source, onClose }: { location: CctvLocation; source: CctvSource; onClose: () => void }) {
  const [index, setIndex] = useState(0), [state, setState] = useState<State>('loading'), [attempt, setAttempt] = useState(0), [now, setNow] = useState(clock);
  const frame = useRef<HTMLDivElement>(null), video = useRef<HTMLVideoElement>(null), close = useRef<HTMLButtonElement>(null);
  const stream = location.streams[Math.min(index, location.streams.length - 1)];

  useEffect(() => { setIndex(0); }, [location.id]);
  useEffect(() => { close.current?.focus({ preventScroll: true }); }, [location.id]);

  // --- the stream: native HLS or hls.js, torn down on every change ---
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    let hls: Hls | undefined, live = true;
    setState('loading');
    const timer = window.setTimeout(() => { if (live && element.readyState < 2) setState('error'); }, 15_000);
    const playing = () => { if (live) { window.clearTimeout(timer); setState('playing'); } };
    const failed = () => { if (live) { window.clearTimeout(timer); setState('error'); } };
    element.addEventListener('playing', playing);
    element.addEventListener('error', failed);
    if (element.canPlayType('application/vnd.apple.mpegurl')) {
      element.src = stream.hls;
      void element.play().catch(() => undefined);
    } else {
      void import('hls.js').then(({ default: HlsJs }) => {
        if (!live) return;
        if (!HlsJs.isSupported()) { failed(); return; }
        hls = new HlsJs({ maxBufferLength: 8, backBufferLength: 0, enableWorker: true });
        hls.on(HlsJs.Events.ERROR, (_event, data) => { if (data.fatal) failed(); });
        hls.loadSource(stream.hls);
        hls.attachMedia(element);
        hls.on(HlsJs.Events.MANIFEST_PARSED, () => { void element.play().catch(() => undefined); });
      }).catch(failed);
    }
    // a hidden tab stops downloading; coming back resumes at the live edge
    const visibility = () => {
      if (document.hidden) { element.pause(); hls?.stopLoad(); }
      else { hls?.startLoad(-1); void element.play().catch(() => undefined); }
    };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      live = false; window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', visibility);
      element.removeEventListener('playing', playing); element.removeEventListener('error', failed);
      hls?.destroy(); element.pause(); element.removeAttribute('src'); element.load();
    };
  }, [stream.hls, attempt]);
  // --- end of stream ---

  useEffect(() => { const id = window.setInterval(() => setNow(clock()), 1000); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape' && !document.fullscreenElement) onClose(); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [onClose]);

  return <section className="lj-cctv" aria-label={`CCTV ${location.name}`}>
    <header className="lj-cctv-head">
      <span className={`lj-badge ${state === 'error' ? 'is-segera' : 'is-live'}`}><i aria-hidden="true" />{state === 'error' ? 'Terputus' : 'Live'}</span>
      <h2>{location.name}</h2>
      <button className="lj-cctv-icon" aria-label="Layar penuh" disabled={state !== 'playing'} onClick={() => {
        const element = frame.current, media = video.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
        if (element?.requestFullscreen) void element.requestFullscreen().catch(() => media?.webkitEnterFullscreen?.());
        else media?.webkitEnterFullscreen?.();
      }}><Maximize2 size={16} aria-hidden="true" /></button>
      <button ref={close} className="lj-cctv-icon" aria-label="Tutup CCTV" onClick={onClose}><X size={18} aria-hidden="true" /></button>
    </header>

    <div ref={frame} className="lj-cctv-frame">
      <video ref={video} muted playsInline autoPlay disablePictureInPicture aria-label={`Siaran langsung ${stream.label}`} />
      {state === 'loading' && <div className="lj-cctv-cover" role="status"><img src="/home/miko/look-192.webp" width="56" height="56" alt="" />Menyambung ke kamera…</div>}
      {state === 'error' && <div className="lj-cctv-cover is-error" role="alert">
        <strong>Kamera sedang tidak tersedia</strong>
        <span>Siaran dari pemilik kamera belum bisa diputar.</span>
        <span className="lj-cctv-actions">
          <button onClick={() => setAttempt(value => value + 1)}><RotateCw size={15} aria-hidden="true" /> Coba lagi</button>
          <a href={source.url} target="_blank" rel="noreferrer">Buka sumber <ExternalLink size={14} aria-hidden="true" /></a>
        </span>
      </div>}
    </div>

    {location.streams.length > 1 && <div className="lj-cctv-streams" role="group" aria-label="Pilih kamera">
      {location.streams.map((item, at) => <button key={item.id} aria-pressed={at === index} onClick={() => setIndex(at)}>Kamera {at + 1}</button>)}
    </div>}

    {/* the clock sits outside the picture: the owner's own timestamp and watermark stay uncovered */}
    <p className="lj-cctv-meta"><span>{stream.label} · {stream.operator}</span><time aria-label="Waktu sekarang, WIB">{now} WIB</time></p>
    <p className="lj-cctv-source">Sumber: <a href={source.url} target="_blank" rel="noreferrer">{source.name}</a>{location.approx ? ' · titik di peta perkiraan' : ''}</p>
  </section>;
}
