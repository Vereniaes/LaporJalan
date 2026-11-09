/* Todo:
-> explain the approved seven-stage journey with one Three.js scene and HTML card
-> connect the example ending to the existing report action
*/
import { useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ShieldCheck } from 'lucide-react';
import { ReportAction, feedback } from './controls';
import { stages } from './three/journey';
import { useReportingStory } from './useReportingStory';
import './story.css';

// --- readable narrative ---
const descriptions = [
  'Catat lokasi dan kondisi jalan melalui LaporJalan.',
  'Amati kondisi yang terlihat sebelum membuat laporan.',
  'Gunakan telepon dan ambil foto setelah motor berhenti.',
  'Foto membantu menjelaskan kondisi yang terlihat.',
  'Lokasi dan bukti tetap tercatat pada titik kejadian.',
  'Titik kejadian membantu memperjelas lokasi yang dilaporkan.',
  'Lihat laporan dan pembaruan warga melalui peta LaporJalan.',
];
function cardCopy(index: number, kind: string) {
  if (kind === 'capture') return { title: 'Siapkan foto kondisi jalan', hint: 'Ambil foto setelah berhenti di tempat aman.' };
  if (kind === 'lift') return { title: 'Titik yang sama, dari atas', hint: 'Lokasi membantu menghubungkan pengamatan warga.' };
  if (kind === 'failed') return { title: 'Alur tetap dapat dibaca', hint: 'Ilustrasi 3D belum tersedia. Laporan tetap dapat dimulai melalui tombol di bawah.' };
  return { title: stages[index].card, hint: index === 2 ? 'Ambil bukti saat sudah berhenti di tempat aman.' : index === 3 ? 'Contoh foto dari ilustrasi jalan.' : stages[index].hint };
}
// --- end of readable narrative ---

// --- after-hero reporting story ---
/** Purpose: Explain the report journey after the hero without changing real report state.
 * Input: current reporting availability. Output: scroll story, readable fallback and CTA.
 */
export function ReportingStory({ available, serviceLoading }: { available: boolean; serviceLoading: boolean }) {
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), canvas = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null), card = useRef<HTMLElement>(null), line = useRef<SVGLineElement>(null), flash = useRef<HTMLDivElement>(null);
  const { view, choose } = useReportingStory({ root, stage, canvas, pin, card, line, flash });
  const copy = cardCopy(view.step, view.kind), moving = view.kind === 'lift', ending = view.kind === 'success' || (view.kind === 'failed' && view.step === 6);
  return <section id="cara-kerja" className="lp-section lp-how lp-three-how" aria-labelledby="how-title">
    <div className="lp-section-heading"><div><p className="lp-eyebrow">CARA KERJA</p><h2 id="how-title">Dari melihat,<br />menjadi melaporkan.</h2></div><p>Kondisi jalan lebih mudah dipahami<br className="lp-desktop-break" /> ketika ada bukti dan lokasi yang jelas.</p></div>
    <div ref={root} className="lp-three-story" data-flow={view.flow} data-reduced={view.reduced} data-status={view.status}>
      <div ref={stage} className="lp-three-stage">
        <div ref={canvas} className="lp-three-canvas" role="img" aria-label={view.step >= 6 ? 'Kota ilustrasi 3D dengan lokasi contoh jalan rusak' : 'Ilustrasi perjalanan pengendara dan jalan berlubang'}>
          <img className="lp-three-poster" src={view.reduced || view.step >= 6 ? '/landing/city-still.webp' : '/landing/street-still.webp'} alt="" loading="lazy" hidden={view.status === 'ready'} />
          <div ref={flash} className="lp-three-flash" aria-hidden="true" />
          <figure className="lp-three-capture" aria-hidden={view.kind !== 'photo'} data-visible={view.kind === 'photo' && Boolean(view.photo)}><img src={view.photo || '/landing/street-still.webp'} alt="Contoh foto jalan berlubang dari adegan ilustrasi" /><figcaption>Ilustrasi · contoh foto</figcaption></figure>
          <div ref={pin} className="lp-three-pin" hidden><svg viewBox="0 0 24 36" aria-hidden="true"><path d="M12 35C9 28 1 21 1 12a11 11 0 0 1 22 0c0 9-8 16-11 23Z" fill="#a33e2b" stroke="white" strokeWidth="1.5" /><path d="m7 6-1 11m11-11 1 11M12 6v3m0 3v3m0 3v2" fill="none" stroke="white" strokeWidth="1.5" /></svg><span><strong>Jalan berlubang</strong><small>Lokasi contoh</small></span></div>
        </div>
        <div className="lp-three-narrative"><p className="lp-three-kicker">{String(view.step + 1).padStart(2, '0')} / 07 · {moving ? 'Lokasi dalam peta' : stages[view.step].name}</p><h3>{stages[view.step].title}</h3><p>{descriptions[view.step]}</p></div>
        <svg className="lp-three-link" aria-hidden="true"><line ref={line} /></svg>
        <article ref={card} className="lp-three-card" data-kind={view.kind} aria-label="Contoh alur pelaporan" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}><motion.div key={`${view.step}:${view.kind}`} initial={view.reduced ? false : { opacity: 0, filter: 'blur(2px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(2px)', transition: { type: 'tween', duration: .07 } }} transition={{ type: 'tween', duration: view.reduced ? 0 : .14, ease: 'linear' }}>
            <div className="lp-three-card-top"><p className="lp-three-kicker">CONTOH ALUR</p>{view.kind === 'success' && <span className="lp-three-success"><Check size={20} strokeWidth={1.5} /></span>}</div><h4>{copy.title}</h4>
            <p className="lp-three-hint">{copy.hint}</p>
          </motion.div></AnimatePresence>
          <p className="lp-three-example-note">Ilustrasi · tidak ada laporan yang dikirim.</p>
        </article>
        <div className="lp-three-tools"><p hidden={ending}>{view.status === 'loading' ? 'Memuat ilustrasi…' : view.reduced ? 'Alur pelaporan dalam ilustrasi.' : view.flow ? 'Pilih langkah untuk melihat alurnya.' : 'Gulir untuk mengikuti perjalanan.'}</p><a href="#setelah-cerita" hidden={ending}>Lewati cerita</a><div className="lp-three-ending-action" hidden={!ending}><ReportAction available={available} /><a href="#setelah-cerita">Rincian pelaporan</a>{!available && <p>{serviceLoading ? 'Memeriksa layanan pelaporan…' : 'Pelaporan belum tersedia.'}</p>}</div></div>
        {!view.reduced && <div className="lp-three-chapters" role="group" aria-label="Langkah contoh pelaporan">{stages.map((item, index) => <motion.button type="button" key={item.name} aria-label={`${index + 1}. ${item.name}`} title={item.name} aria-current={index === view.step ? 'step' : undefined} onClick={() => choose(index)} {...feedback}>{String(index + 1).padStart(2, '0')}</motion.button>)}</div>}
      </div>
    </div>
    {view.reduced && <ol className="lp-three-readable">{stages.map((item, index) => <li key={item.name}><span>0{index + 1}</span><div><h3>{item.title}</h3><p>{descriptions[index]}</p></div></li>)}</ol>}
    <div id="setelah-cerita" className="lp-three-after"><div><h3>Mulai dari kondisi yang terlihat.</h3><p>{serviceLoading ? 'Memeriksa layanan pelaporan…' : available ? 'Periksa lokasi dan bukti sebelum mengirim laporan.' : 'Pelaporan belum tersedia. Peta tetap dapat dibuka.'}</p></div><ReportAction available={available} /></div>
    <p className="lp-story-note"><ShieldCheck size={17} /> Laporan disimpan di LaporJalan. Pengiriman ke kanal pemerintah belum terhubung.</p>
  </section>;
}
// --- end of after-hero reporting story ---
