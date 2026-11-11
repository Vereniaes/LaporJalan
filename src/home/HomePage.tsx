/* Todo:
-> landing (rebrand Miko): the live public map is the hero picture, Miko points at it
    -> hero entrance once on load: headline lines rise from a mask, then the side, then the map (stagger < 500 ms)
-> the flow in four alternating rows: Lihat peta -> Buka laporan -> Laporkan -> Pantau pembaruan; FAQ, closing action
    -> one road runs down the flow; its yellow marking is drawn by scrolling (scroll is the clock)
    -> each step is a junction on the road; it lights green when the step is in view and active
    -> row badges and the report action follow the service capabilities, never hard-coded
    -> live data only from the public reports API, never naming the source; nothing shown when it fails
    -> row pictures are samples built from the app's own classes (owner choice, 9 Nov)
-> signature move: at Laporkan the pin drops onto the road and the reported stretch is drawn (once)
-> weak devices (saver mode or no WebGL): the hero shows a still of the map first; the live map loads on request (owner choice, 10 Nov)
*/
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion, useScroll, useTransform, type Variants } from 'motion/react';
import { ArrowRight, ChevronDown, Construction, Route, Search } from 'lucide-react';
import { PublicMap } from '../public-reports/PublicMap';
import { usePublicReports } from '../public-reports/usePublicReports';
import { OBSERVATIONS, useCapabilities, useEmailSession } from '../public-reports/community';
import { CONDITION_LABELS } from '../public-reports/condition';
import { swatchStyle } from '../public-reports/conditionFeatures';
import { reportDate, type PublicReport } from '../public-reports/data';
import { statusClass } from '../public-reports/statusTone';
import { SiteFooter, SiteHeader } from './SiteChrome';
import { hasMikoAnim, MikoMotion } from './MikoMotion';
import { useMapMode } from '../map/capability';
import '../public-reports/public-reports.css';
import '../public-reports/community.css';
import './home.css';

// --- small parts ---

const openReport = (report: PublicReport) => location.assign(`/peta?laporan=${encodeURIComponent(report.id)}`);
const EASE_OUT = [.23, 1, .32, 1] as const;

// one moment per row: 'before' -> 'after' when the row is in view; children with the same labels follow it
const ROW: Variants = { before: { opacity: 0, y: 16 }, after: { opacity: 1, y: 0, transition: { duration: .7, ease: EASE_OUT } } };
const LIGHT: Variants = { before: { opacity: 0, scale: .95 }, after: { opacity: 1, scale: 1, transition: { duration: .3, ease: EASE_OUT, delay: .2 } } };
const DROP: Variants = { before: { opacity: 0, y: -48 }, after: { opacity: 1, y: 0, transition: { duration: .5, ease: EASE_OUT, delay: .15 } } };
const DRAW: Variants = { before: { clipPath: 'inset(0% 100% 0% 0%)' }, after: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: .7, ease: 'linear', delay: .6 } } };

// the junction on the road: a ring that fills green (stacked layer fading in); the report step is a pin that lands
function Node({ on, pin }: { on: boolean; pin: boolean }) {
  if (pin) return <motion.span className={`step-node is-pin lj-marker${on ? ' is-selected' : ''}`} variants={DROP} aria-hidden="true"><span><Construction /></span></motion.span>;
  return <span className="step-node" aria-hidden="true">{on && <motion.span className="step-node-fill" variants={LIGHT} />}</span>;
}

// one row of the flow: text on one side, a sample of the app's own screen on the other
function Step({ n, title, on, text, href, go, miko, children }: { n: number; title: string; on: boolean; text: string; href: string; go: string; miko: string; children: ReactNode }) {
  const still = useReducedMotion();
  return <motion.li className="step" variants={ROW} initial={still ? false : 'before'} whileInView="after" viewport={{ once: true, amount: .45 }}>
    <Node on={on} pin={n === 3} />
    <div className="step-text">
      <div className="step-head"><h3>{title}</h3></div>
      <p>{text}</p>
      <a className="text-link" href={href}>{go}<ArrowRight /></a>
    </div>
    <figure className="step-demo">
      <div className="screen demo" aria-hidden="true">
        {children}
        {hasMikoAnim(miko) ? <MikoMotion anim={miko} className="step-miko" src={`/home/miko/${miko}-512.webp`} loading="lazy" />
          : <img className="step-miko" src={`/home/miko/${miko}-512.webp`} width="512" height="512" alt="" loading="lazy" decoding="async" />}
      </div>
    </figure>
  </motion.li>;
}

// the road down the flow: asphalt always there, the yellow marking drawn as the visitor scrolls
// Why/Note: clip-path (not scaleY) so the dashes keep their length; reduced motion shows it fully drawn
function Road({ children }: { children: ReactNode }) {
  const flow = useRef<HTMLOListElement>(null);
  const still = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: flow, offset: ['start 75%', 'end 55%'] });
  const drawn = useTransform(scrollYProgress, value => `inset(0% 0% ${((1 - value) * 100).toFixed(2)}% 0%)`);
  return <div className="flow-road">
    <div className="road-rail" aria-hidden="true"><motion.span className="road-marking" style={still ? undefined : { clipPath: drawn }} /></div>
    <ol className="flow" ref={flow}>{children}</ol>
  </div>;
}

// the reported stretch in the form sample; drawn in the same moment the pin lands on the road
function MiniMap() {
  return <div className="mini-map">
    <span className="road road-h" /><span className="road road-v" />
    <motion.span className="ruas" style={swatchStyle('excavation')} variants={DRAW} />
    <span className="lj-marker is-selected"><span><Construction /></span></span>
  </div>;
}

// hero entrance: a line rises inside its own mask; reduced motion shows it in place
// Why/Note: the headline is the LCP element, so it is partly visible from the first frame (no opacity 0, no full hide);
//           hiding it fully moved Lighthouse LCP from 4.2 s to 6.6 s
function Rise({ children, delay }: { children: ReactNode; delay: number }) {
  return <span className="line"><motion.span initial={{ y: '0.6em' }} animate={{ y: 0 }} transition={{ duration: .7, ease: EASE_OUT, delay }}>{children}</motion.span></span>;
}

const FAQ = [
  ['Apakah perlu masuk untuk melihat laporan?', 'Peta dan laporan publik dapat dilihat tanpa masuk. Akun melalui email digunakan untuk membuat dan mengelola laporan ketika layanan tersedia.'],
  ['Apa yang perlu disiapkan untuk melapor?', 'Lokasi berupa titik, ruas, atau area, keterangan kondisi, dan foto atau video bila tersedia. Periksa lokasi dan bukti sebelum mengirim.'],
  ['Apakah laporan langsung dikirim ke pemerintah?', 'Laporan warga disimpan di LaporJalan. Pengiriman ke kanal pemerintah belum terhubung.'],
  ['Informasi apa yang terlihat oleh publik?', 'Lokasi, isi, dan lampiran yang disetujui untuk dipublikasikan. Nama tampilan bersifat pilihan; alamat email tetap privat.'],
];

// --- end of small parts ---

// --- landing page ---

export default function HomePage() {
  const { snapshot } = usePublicReports();
  const { capabilities } = useCapabilities();
  const session = useEmailSession();
  // same rule as the map page: writing on, and either a session or a way to sign in
  const canReport = Boolean(capabilities?.write && (session.user || capabilities.login));
  const citizen = Boolean(capabilities?.reports);
  const reportHref = canReport ? '/peta?buat=1' : '/peta';
  const reports = snapshot?.reports ?? [];
  const statusCounts = Object.entries(reports.reduce<Record<string, number>>((counts, row) => {
    const status = row.sourceStatus ?? 'Status belum tersedia';
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const latest = reports.slice(0, 2);
  const { tier } = useMapMode(), [liveMap, setLiveMap] = useState(false);
  const showMap = tier === 'full' || liveMap;
  useEffect(() => { document.title = 'LaporJalan - Tandai jalan rusak, pengendara berikutnya ikut tahu'; }, []);
  const enter = (delay: number, y = 12) => ({ initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: .7, ease: EASE_OUT, delay } });

  return <MotionConfig reducedMotion="user"><div className="home">
    <a className="skip" href="#isi">Ke isi halaman</a>
    <SiteHeader user={session.user} canLogin={Boolean(capabilities?.login)} sections />

    <main id="isi">
      {/* hero: the product is the picture; Miko points at it */}
      <section className="hero wrap" aria-labelledby="t-hero">
        <div className="hero-title">
          <motion.p className="kicker" {...enter(0, 0)}>Peta warga · Jakarta</motion.p>
          <h1 className="display" id="t-hero"><Rise delay={.05}>Tandai jalan rusak.</Rise><Rise delay={.13}>Pengendara berikutnya ikut&nbsp;tahu.</Rise></h1>
        </div>
        <motion.div className="hero-side" {...enter(.22)}>
          <p className="lead">Laporan jalan rusak di Jakarta, dalam satu peta. Peta dapat dibuka tanpa login.</p>
          <div className="actions">
            {canReport ? <>
              <a className="btn btn-primary" href="/peta?buat=1">Laporkan jalan<ArrowRight /></a>
              <a className="btn btn-quiet" href="/peta">Buka peta</a>
            </> : <>
              <a className="btn btn-primary" href="/peta">Buka peta<ArrowRight /></a>
              <a className="btn btn-quiet" href="#alur">Lihat alur</a>
            </>}
          </div>
        </motion.div>
        <motion.div className="hero-app" {...enter(.32, 24)}>
          <div className="app-frame">
            {showMap ? <PublicMap reports={reports} selected={null} onSelect={openReport} onArea={() => {}} cooperative minimal />
              : <div className="map-still">
                <img src="/home/peta-statis-1200.webp" srcSet="/home/peta-statis-640.webp 640w, /home/peta-statis-1200.webp 1200w" sizes="(min-width: 1248px) 1200px, 100vw"
                  width="1200" height="621" alt="Cuplikan peta laporan jalan di Jakarta" decoding="async" />
                <div className="map-still-bar"><span>Perangkat ini memakai mode hemat.</span><button className="btn btn-quiet" onClick={() => setLiveMap(true)}>Muat peta interaktif</button></div>
              </div>}
          </div>
          {/* Miko greets: the waving loop starts from the standing pose (owner, 10 Nov) */}
          <MikoMotion anim="wave" className="hero-miko" src="/home/miko/stand-512.webp" srcSet="/home/miko/stand-512.webp 512w, /home/miko/stand-1024.webp 1024w" sizes="(min-width: 700px) 150px, 96px" />
        </motion.div>
      </section>

      {/* the flow: what a visitor can do after seeing the map, reporting as the third step */}
      <section className="flow-sec wrap" id="alur" aria-labelledby="t-alur">
        <div className="sec-head">
          <h2 className="h2" id="t-alur">Dari peta sampai pembaruan.</h2>
        </div>
        <Road>
          <Step n={1} title="Lihat peta" on href="/peta" go="Buka peta" miko="phone"
            text="Laporan jalan rusak tampil di satu peta, tanpa login. Titik yang berdekatan menjadi satu kumpulan. Cari judul atau status, saring kategori, atau nyalakan 3D untuk mengenali gedung.">
            <span className="mini-search"><Search /><span>Cari judul atau status</span></span>
            <span className="mini-row"><span className="mini-chip on"><Route />Jalan</span><span className="mini-chip">Area ini</span><span className="mini-chip">3D</span></span>
            {latest.length > 0 && <span className="mini-list">{latest.map(row => <span key={row.id} className="mini-report">
              <span className="lj-marker"><span><Route /></span></span>
              <span>{row.title ? <strong>{row.title}</strong> : <strong className="mono">{row.code}</strong>}<span className={statusClass(row.sourceStatus)}>{row.sourceStatus ?? 'Status belum tersedia'}</span></span>
            </span>)}</span>}
            <span className="mini-row">
              <span className="lj-marker is-cluster"><span>12</span></span>
              <span className="lj-marker"><span><Route /></span></span>
              <span className="lj-marker"><span><Construction /></span></span>
            </span>
          </Step>
          <Step n={2} title="Buka laporan" on href="/peta" go="Lihat laporan" miko="clipboard"
            text="Setiap laporan memuat waktu dan statusnya. Laporan warga berbentuk ruas dapat ditelusuri dengan Lihat ilustrasi 3D: kamera menyusuri ruas dari ujung ke ujung.">
            <span className="lj-eyebrow">LAPORAN JALAN</span>
            {latest[0] && <span className="mini-title"><strong className="mono">{latest[0].code}</strong><span>Dibuat {reportDate(latest[0].createdAt)} WIB</span></span>}
            {/* the four biggest statuses; the rest as one count, so the sample stays a sample */}
            {statusCounts.length > 0 && <span className="mini-row">{statusCounts.slice(0, 4).map(([status, count]) => <span key={status} className={statusClass(status)}>{status} {count}</span>)}
              {statusCounts.length > 4 && <span className="mini-more">+{statusCounts.length - 4} status lain</span>}</span>}
            <span className="mini-row"><span className="mini-chip on">Ringkasan</span><span className="mini-chip">Riwayat</span></span>
            <span className="mini-button">Lihat ilustrasi 3D</span>
          </Step>
          <Step n={3} title="Laporkan" on={canReport} href={reportHref} go={canReport ? 'Mulai lapor' : 'Buka peta'} miko="pin"
            text="Masuk ke akun, lalu isi tiga langkah: Lokasi, Kondisi, Tinjau. Tandai titik, ruas, atau area, pilih jenis kondisi, dan lampirkan foto atau video bila ada. Tandai dari tempat aman, bukan dari tengah lajur.">
            <ol className="lj-steps">{['Lokasi', 'Kondisi', 'Tinjau'].map((label, index) => <li key={label} aria-current={index === 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
            <MiniMap />
            <span className="mini-row">{(['pothole', 'excavation', 'crack'] as const).map((kind, i) => <span key={kind} className={`mini-chip${i === 1 ? ' on' : ''}`}><span className="lj-swatch" style={swatchStyle(kind)} />{CONDITION_LABELS[kind]}</span>)}</span>
          </Step>
          <Step n={4} title="Pantau pembaruan" on={citizen} href="/peta" go="Buka peta" miko="peek-puddle"
            text="Pelapor mencatat perkembangan pada laporan yang sama: belum berubah, terlihat dikerjakan, atau terlihat selesai. Nama tampilan bersifat pilihan, email tetap privat, dan laporan dapat ditarik dari publik.">
            <ol className="lj-timeline">{[OBSERVATIONS.resolved_observed, OBSERVATIONS.work_observed, 'Laporan dibuat'].map(label => <li key={label}><strong>{label}</strong><p className="lj-entry-meta">Pelapor · warga LaporJalan</p></li>)}</ol>
            <span className="mini-row"><span className="mini-link">Ubah nama publik</span><span className="mini-link">Tarik laporan</span></span>
          </Step>
        </Road>
      </section>

      {/* FAQ: the same four answers as before */}
      <section className="faq-sec wrap" id="pertanyaan" aria-labelledby="t-faq">
        <h2 className="h2" id="t-faq">Sebelum mulai.</h2>
        <div className="faq">{FAQ.map(([question, answer]) => <details key={question} name="faq"><summary>{question}<ChevronDown /></summary><p>{answer}</p></details>)}</div>
      </section>

      {/* close: the same action as the hero */}
      <section className="close wrap" aria-labelledby="t-close">
        <div className="close-card">
          <div className="close-text">
            <h2 className="display close-title" id="t-close"><span>Melihat lubang</span><span>di jalan?</span></h2>
            <p className="lead">{canReport ? 'Tandai di peta supaya pengendara berikutnya ikut tahu.' : 'Cek dulu petanya. Tanpa login.'}</p>
            <a className="btn btn-primary" href={reportHref}>{canReport ? 'Tandai di peta' : 'Buka peta'}<ArrowRight /></a>
          </div>
          <img className="close-miko" src="/home/miko/stand-512.webp" srcSet="/home/miko/stand-512.webp 512w, /home/miko/stand-1024.webp 1024w" sizes="(min-width: 700px) 220px, 140px" width="512" height="512" alt="" loading="lazy" decoding="async" />
        </div>
      </section>
    </main>

    <SiteFooter user={session.user} canLogin={Boolean(capabilities?.login)} />
  </div></MotionConfig>;
}

// --- end of landing page ---
