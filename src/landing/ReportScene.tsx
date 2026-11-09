/* Todo:
-> show a rider and one example report
-> connect the illustration to scroll without scaling text
*/
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react';
import { Camera, Check, MapPin } from 'lucide-react';

export const reportSteps = [
  { title: 'Berhenti di tempat aman.', short: 'Berhenti', text: 'Amati kondisi jalan setelah berhenti. Keselamatan tetap didahulukan.', card: 'Ada kondisi yang perlu dicatat.', detail: 'Mulai dari pengamatan di sekitar jalan.' },
  { title: 'Tambahkan foto kondisi.', short: 'Foto', text: 'Ambil foto yang memperlihatkan masalah. Tambahkan keterangan singkat agar mudah dipahami.', card: 'Bukti yang lebih jelas.', detail: 'Foto membantu menjelaskan kondisi jalan.' },
  { title: 'Pastikan titiknya tepat.', short: 'Lokasi', text: 'Pilih titik kejadian di peta. Periksa kembali lokasi dan tambahkan patokan bila diperlukan.', card: 'Lokasi ditandai.', detail: 'Titik kejadian diperiksa oleh pelapor.' },
  { title: 'Tinjau, lalu laporkan.', short: 'Tinjau', text: 'Periksa lokasi, isi, dan bukti sebelum mengirim. Laporan serta pembaruan dapat dilihat di peta.', card: 'Periksa sebelum mengirim.', detail: 'Lokasi dan bukti terkumpul dalam satu laporan.' },
] as const;

// --- report illustration ---
/** Purpose: Keep the same scene and report card while the story changes.
 * Input: scroll progress and the current step. Output: an illustrative reporting scene.
 */
export function ReportScene({ progress, step = 1, id }: { progress?: MotionValue<number>; step?: number; id: string }) {
  const still = useMotionValue(.28), reduced = useReducedMotion();
  const value = progress ?? still;
  const riderX = useTransform(value, [0, .2, 1], [-54, 0, 0]);
  const cardY = useTransform(value, [0, .35, .7, 1], [14, 0, -7, 0]);
  const cameraOpacity = useTransform(value, [.1, .25, .48, .6], [0, 1, 1, 0]);
  const pinOpacity = useTransform(value, [.44, .62], [0, 1]);
  const current = reportSteps[step];
  return <div className="lp-scene" data-step={step}>
    <svg className="lp-scene-art" viewBox="0 0 600 500" role="img" aria-labelledby={`${id}-title`}>
      <title id={`${id}-title`}>Ilustrasi pengendara berhenti di dekat jalan berlubang untuk mencatat kondisi.</title>
      <rect x="12" y="22" width="576" height="456" rx="24" fill="#eaf0eb" />
      <g fill="#f7f8f4" stroke="#d5dfd6" strokeWidth="1.5">
        <path d="M38 66h126v92H38zM184 45h119v77H184zM324 54h112v112H324zM462 64h100v92H462zM40 181h109v106H40zM169 153h126v107H169zM470 183h92v79h-92zM31 393l96 15-14 51H31zM427 398l133-47v107H427z" />
      </g>
      <path d="M-7 289c131 1 207 118 337 88s179-116 288-95" fill="none" stroke="#d2dcd4" strokeWidth="123" />
      <path d="M-7 289c131 1 207 118 337 88s179-116 288-95" fill="none" stroke="#aabbb2" strokeWidth="100" />
      <path d="M-7 289c131 1 207 118 337 88s179-116 288-95" fill="none" stroke="#f7f8f4" strokeWidth="3" strokeDasharray="20 18" />
      <g fill="#c4d3c6" stroke="#a9c0ae" strokeWidth="1.5">
        <circle cx="70" cy="117" r="21" /><circle cx="98" cy="95" r="25" /><circle cx="497" cy="421" r="23" />
      </g>
      <g stroke="#8aa894" strokeWidth="2"><path d="M70 109v36M98 85v43M497 410v40" /></g>
      <ellipse cx="365" cy="356" rx="40" ry="17" fill="#8d6e58" />
      <path d="m331 356 13-13 22 4 12-6 26 14-18 13-33 1z" fill="#5d5149" />
      <path d="m339 353 17-4 14 3 12-3 13 8" fill="none" stroke="#b79b7b" strokeWidth="2.5" />
      <motion.g style={{ x: reduced ? 0 : riderX }}>
        <ellipse cx="206" cy="414" rx="103" ry="11" fill="#142b3a" opacity=".08" />
        <g fill="#253d43" stroke="#253d43" strokeWidth="3">
          <circle cx="144" cy="381" r="31" /><circle cx="282" cy="381" r="31" />
        </g>
        <g fill="#dbe4dd" stroke="#f4f6f0" strokeWidth="3"><circle cx="144" cy="381" r="18" /><circle cx="282" cy="381" r="18" /></g>
        <path d="M143 357c9-32 31-47 55-45h35l20 40h30l-16-68 13-3 25 78c5 16-8 29-22 29h-96z" fill="#f9faf5" stroke="#547168" strokeWidth="3" strokeLinejoin="round" />
        <path d="M145 356h55l19 31h-46l-20-18z" fill="#0b5b70" />
        <path d="M180 313h64" stroke="#253d43" strokeWidth="12" strokeLinecap="round" />
        <path d="m267 286-12-26h-14m30 20 14-22" fill="none" stroke="#253d43" strokeWidth="5" strokeLinecap="round" />
        <path d="m199 281 33 36 6 49m-27-84-26 40-2 48" fill="none" stroke="#203e48" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M178 371h22m32-3h22" stroke="#172f3b" strokeWidth="9" strokeLinecap="round" />
        <path d="M202 226c-14 5-20 17-20 36l3 29h43l15-55-18-12z" fill="#0b5b70" />
        <path d="m228 240 29 23 35-24m-88 2-17 24 29 21" fill="none" stroke="#0b5b70" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m286 242 12-6m-83 49 10 4" stroke="#d7a57c" strokeWidth="9" strokeLinecap="round" />
        <path d="M211 221v13h14v-16" fill="#d7a57c" />
        <path d="M238 203c0 15-7 24-19 24s-19-10-19-24 10-24 21-24 17 12 17 24" fill="#e7bd93" />
        <path d="M195 205c-5-20 7-38 26-38 20 0 31 14 30 34h-29l-9 15h-12z" fill="#f8faf4" stroke="#345a5c" strokeWidth="3" strokeLinejoin="round" />
        <path d="M222 192h28v12h-28z" fill="#0b5b70" />
        <path d="m215 211 10 11" stroke="#345a5c" strokeWidth="3" />
        <rect x="292" y="209" width="19" height="31" rx="4" transform="rotate(12 302 225)" fill="#203e48" />
        <path d="m299 215 7 2-3 16-7-2z" fill="#dce9df" />
      </motion.g>
      <motion.g style={{ opacity: reduced ? 0 : cameraOpacity }} fill="none" stroke="#0b5b70" strokeWidth="3" strokeLinecap="round">
        <path d="M321 337v-12h15m56 0h15v12m0 35v12h-15m-56 0h-15v-12" />
      </motion.g>
      <motion.g style={{ opacity: reduced ? 1 : pinOpacity }}>
        <path d="M438 263c0 18-24 39-24 39s-24-21-24-39a24 24 0 1 1 48 0" fill="#0b5b70" stroke="#f8faf4" strokeWidth="4" />
        <circle cx="414" cy="262" r="7" fill="#f8faf4" />
      </motion.g>
      <g fill="#5b736b" fontFamily="system-ui, sans-serif" fontSize="10" letterSpacing="1.4"><text x="47" y="444">PENGAMATAN WARGA</text></g>
    </svg>
    <motion.div className="lp-demo-card" style={{ y: reduced ? 0 : cardY }}>
      <div className="lp-demo-top"><span><span className="lp-small-dot" /> LaporJalan</span><span>CONTOH</span></div>
      <div className="lp-demo-body">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} initial={reduced ? false : { opacity: 0, y: 3, filter: 'blur(2px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -3, filter: 'blur(2px)' }} transition={{ duration: reduced ? 0 : .14, ease: 'linear' }}>
            <span className="lp-demo-step">0{step + 1} / {current.short.toUpperCase()}</span>
            <div className="lp-demo-symbol">{step < 2 ? <Camera size={23} /> : step === 2 ? <MapPin size={23} /> : <Check size={23} />}</div>
            <strong>{current.card}</strong><p>{current.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="lp-demo-bottom">{reportSteps.map((_, index) => <span key={index} className={index <= step ? 'is-filled' : ''} />)}<span>0{step + 1} / 04</span></div>
    </motion.div>
    <span className="lp-scene-caption">Ilustrasi alur pelaporan</span>
  </div>;
}
// --- end of report illustration ---
