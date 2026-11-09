/* Todo:
-> introduce road reporting for residents
-> explain the flow with a scroll-linked illustration
-> connect to the existing map and available reporting service
*/
import { useEffect, useState } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Camera, MapPin, Route } from 'lucide-react';
import { useCapabilities, useEmailSession } from '../public-reports/community';
import { Hero } from './Hero';
import { Brand, ReportAction, spring, feedback } from './controls';
import { ReportingStory } from './ReportingStory';
import './landing.css';

// --- shared controls ---
/** Purpose: Open one answer without replacing its container.
 * Input: question, answer, and ID. Output: an accessible expandable answer.
 */
function Question({ question, answer, id }: { question: string; answer: string; id: string }) {
  const [open, setOpen] = useState(false), reduced = useReducedMotion();
  return <div className="lp-faq-item"><motion.button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)} whileTap={{ y: 1 }}>{question}<motion.span animate={{ rotate: open ? 45 : 0 }} aria-hidden="true">+</motion.span></motion.button>
    <motion.div id={id} aria-hidden={!open} initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={reduced ? { duration: 0 } : { ...spring, opacity: { duration: .14 } }} style={{ overflow: 'hidden' }}><p>{answer}</p></motion.div>
  </div>;
}
// --- end of shared controls ---

// --- landing page ---
/** Purpose: Explain reporting and offer the actions the service currently supports.
 * Input: none. Output: the landing page with service-aware report controls.
 */
export default function LandingPage() {
  const { capabilities, loading } = useCapabilities();
  const session = useEmailSession();
  const available = Boolean(capabilities?.write && (session.user || capabilities.login));
  useEffect(() => { document.title = 'LaporJalan - Tandai jalan rusak, bagikan kondisinya'; }, []);
  return <MotionConfig transition={spring} reducedMotion="user"><div className="lp-page">
    <a className="lp-skip" href="#isi">Ke isi halaman</a>
    <header className="lp-header"><div className="lp-shell lp-nav"><Brand /><nav aria-label="Navigasi utama"><a href="#cara-kerja">Cara kerja</a><a href="#tentang">Tentang</a><a href="#pertanyaan">Pertanyaan</a></nav><motion.a href="/peta" className="lp-nav-map" {...feedback}>Buka peta <ArrowUpRight size={17} /></motion.a></div></header>
    <main id="isi">
      <Hero available={available} serviceLoading={loading || session.loading} />
      <div className="lp-principles"><div className="lp-shell"><span><MapPin size={20} /> Mulai dari lokasi</span><span><Camera size={20} /> Ceritakan dengan bukti</span><span><Route size={20} /> Ikuti perkembangannya</span></div></div>
      <div className="lp-shell"><ReportingStory available={available} serviceLoading={loading || session.loading} /></div>
      <section id="tentang" className="lp-about" aria-labelledby="about-title"><div className="lp-shell lp-about-grid">
        <div><p className="lp-eyebrow">SATU PETA, BANYAK PENGAMATAN</p><h2 id="about-title">Lebih jelas melihat<br />kondisi di sekitar.</h2><p>Jelajahi laporan berdasarkan lokasi dan kategori. Baca sumber, bukti yang tersedia, serta pembaruan pada setiap laporan.</p><motion.a href="/peta" className="lp-text-link" {...feedback}>Jelajahi peta laporan <ArrowUpRight size={19} /></motion.a></div>
        <a href="/peta" className="lp-map-preview" aria-label="Buka peta laporan"><svg viewBox="0 0 520 340" role="img" aria-label="Ilustrasi titik laporan pada peta, bukan data langsung"><rect width="520" height="340" rx="12" fill="#e7eee7" /><g fill="#f8faf5" stroke="#d0dbd1" strokeWidth="2"><path d="M24 20h105v81H24zM153 20h100v81H153zM277 20h100v81H277zM401 20h94v81h-94zM24 125h105v87H24zM153 125h100v87H153zM277 125h100v87H277zM401 125h94v87h-94zM24 236h105v81H24zM153 236h100v81H153zM277 236h100v81H277zM401 236h94v81h-94z" /></g><path d="M-10 305c93-24 129-134 232-134s155 11 309-91" fill="none" stroke="#b8cfca" strokeWidth="21" /><path d="M-10 305c93-24 129-134 232-134s155 11 309-91" fill="none" stroke="#0b5b70" strokeWidth="2" strokeDasharray="6 7" />{[[144,242],[280,169],[401,130]].map(([x,y])=><g key={x} transform={`translate(${x} ${y})`}><circle r="18" fill="#fff" /><circle r="13" fill="#0b5b70" /><path d="m-5-6-2 12m12-12 2 12M0-6v3m0 3v3m0 3v1" fill="none" stroke="#fff" strokeWidth="1.5" /></g>)}</svg><span className="lp-map-preview-label"><MapPin size={17} /> Laporan dalam satu peta <ArrowUpRight size={17} /></span><small>Ilustrasi peta</small></a>
      </div></section>
      <section id="pertanyaan" className="lp-shell lp-section lp-faq" aria-labelledby="faq-title"><div><p className="lp-eyebrow">SEBELUM MULAI</p><h2 id="faq-title">Hal yang perlu<br />diketahui.</h2></div><div className="lp-faq-list">
        {[['Apakah perlu masuk untuk melihat laporan?', 'Peta dan laporan publik dapat dilihat tanpa masuk. Akun melalui email digunakan untuk membuat dan mengelola laporan ketika layanan tersedia.'], ['Apa yang perlu disiapkan untuk melapor?', 'Titik kejadian, keterangan kondisi, dan foto atau video bila tersedia. Periksa lokasi dan bukti sebelum mengirim.'], ['Apakah laporan langsung dikirim ke pemerintah?', 'Laporan warga disimpan di LaporJalan. Pengiriman ke kanal pemerintah belum terhubung. Sebagian metadata laporan publik bersumber dari CRM Jakarta dan diberi keterangan sumber.'], ['Informasi apa yang terlihat oleh publik?', 'Lokasi, isi, dan lampiran yang disetujui untuk dipublikasikan. Nama tampilan bersifat pilihan; alamat email tetap privat.']].map(([question,answer], index)=><Question key={question} id={`jawaban-${index}`} question={question} answer={answer} />)}
      </div></section>
      <section className="lp-closing"><div className="lp-shell"><div><p className="lp-eyebrow">LANGKAH KECIL DARI JALAN SEHARI-HARI</p><h2>Mulai dari yang terlihat<br />di sekitar.</h2></div><div><ReportAction available={available} /><a href="/peta" className="lp-text-link">Lihat laporan yang tersedia <ArrowRight size={17} /></a></div></div></section>
    </main>
    <footer className="lp-shell lp-footer"><Brand /><p>Pengamatan warga. Lokasi, bukti, dan pembaruan.</p><a href="https://crm.jakarta.go.id/peta/" target="_blank" rel="noreferrer">Sumber CRM Jakarta <ArrowUpRight size={15} /></a></footer>
  </div></MotionConfig>;
}
// --- end of landing page ---
