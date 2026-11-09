/* Todo:
-> landing (rebrand Miko): the live public map is the hero picture, Miko points at it
-> the flow in four alternating rows: Lihat peta -> Buka laporan -> Laporkan -> Pantau pembaruan; data sources, FAQ, closing action
    -> row badges and the report action follow the service capabilities, never hard-coded
    -> live numbers only from the public reports API; nothing shown when it fails
    -> row pictures are labelled samples built from the app's own classes (owner choice, 9 Nov)
-> signature move: in the Laporkan row a pin drops on the road, then the reported stretch is drawn (once)
*/
import { useEffect, type ReactNode } from 'react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChevronDown, Construction, Eye, Lock, Route, Search } from 'lucide-react';
import { PublicMap } from '../public-reports/PublicMap';
import { usePublicReports } from '../public-reports/usePublicReports';
import { OBSERVATIONS, useCapabilities, useEmailSession } from '../public-reports/community';
import { CONDITION_LABELS } from '../public-reports/condition';
import { swatchStyle } from '../public-reports/conditionFeatures';
import { reportDate, type PublicReport } from '../public-reports/data';
import '../public-reports/public-reports.css';
import '../public-reports/community.css';
import './home.css';

// --- small parts ---

const openReport = (report: PublicReport) => location.assign(`/peta?laporan=${encodeURIComponent(report.id)}`);
const Avail = ({ on }: { on: boolean }) => <span className={`avail ${on ? 'on' : 'off'}`}>{on ? 'Aktif' : 'Belum aktif'}</span>;
const EASE_OUT = [.23, 1, .32, 1] as const;

// one row of the flow: text on one side, a labelled sample of the app's own screen on the other
function Step({ n, title, on, text, href, go, miko, caption, children }: { n: number; title: string; on: boolean; text: string; href: string; go: string; miko: string; caption: string; children: ReactNode }) {
  return <motion.li className="step" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .7, ease: EASE_OUT }}>
    <div className="step-text">
      <p className="step-n mono" aria-hidden="true">{String(n).padStart(2, '0')} / 04</p>
      <div className="step-head"><h3>{title}</h3><Avail on={on} /></div>
      <p>{text}</p>
      <a className="text-link" href={href}>{go}<ArrowRight /></a>
    </div>
    <figure className="step-demo">
      <div className="screen demo" aria-hidden="true">
        {children}
        <img className="step-miko" src={`/home/miko/${miko}-512.webp`} width="512" height="512" alt="" loading="lazy" decoding="async" />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  </motion.li>;
}

// signature move: the report lands - the pin drops on the road, then the reported stretch is drawn end to end
// Why/Note: once per visit; reduced motion shows the final state (pin placed, stretch drawn)
function ReportDrop() {
  const still = useReducedMotion();
  // the map is watched once; both marks follow its variant (a clipped stretch is not seen by the observer itself)
  return <motion.div className="mini-map" initial={still ? false : 'before'} whileInView="after" viewport={{ once: true, amount: .6 }}>
    <span className="road road-h" /><span className="road road-v" />
    <motion.span className="ruas" style={swatchStyle('excavation')} variants={{
      before: { clipPath: 'inset(0% 100% 0% 0%)' }, after: { clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: .7, ease: 'linear', delay: .45 } } }} />
    <motion.span className="lj-marker is-selected" variants={{
      before: { y: -40, opacity: 0 }, after: { y: 0, opacity: 1, transition: { duration: .5, ease: EASE_OUT } } }}><span><Construction /></span></motion.span>
  </motion.div>;
}

const FAQ = [
  ['Apakah perlu masuk untuk melihat laporan?', 'Peta dan laporan publik dapat dilihat tanpa masuk. Akun melalui email digunakan untuk membuat dan mengelola laporan ketika layanan tersedia.'],
  ['Apa yang perlu disiapkan untuk melapor?', 'Lokasi berupa titik, ruas, atau area, keterangan kondisi, dan foto atau video bila tersedia. Periksa lokasi dan bukti sebelum mengirim.'],
  ['Apakah laporan langsung dikirim ke pemerintah?', 'Laporan warga disimpan di LaporJalan. Pengiriman ke kanal pemerintah belum terhubung. Sebagian metadata laporan publik bersumber dari CRM Jakarta dan diberi keterangan sumber.'],
  ['Informasi apa yang terlihat oleh publik?', 'Lokasi, isi, dan lampiran yang disetujui untuk dipublikasikan. Nama tampilan bersifat pilihan; alamat email tetap privat.'],
];

// --- end of small parts ---

// --- landing page ---

export default function HomePage() {
  const { snapshot } = usePublicReports();
  const { capabilities } = useCapabilities();
  const session = useEmailSession();
  // same rule as the map page: writing on, and either a session or email login
  const canReport = Boolean(capabilities?.write && (session.user || capabilities.login));
  const citizen = Boolean(capabilities?.reports);
  const reportHref = canReport ? '/peta?buat=1' : '/peta';
  const statusCounts = Object.entries((snapshot?.reports ?? []).reduce<Record<string, number>>((counts, row) => {
    const status = row.sourceStatus ?? 'Status belum tersedia';
    counts[status] = (counts[status] ?? 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  useEffect(() => { document.title = 'LaporJalan - Tandai jalan rusak, pengendara berikutnya ikut tahu'; }, []);

  return <MotionConfig reducedMotion="user"><div className="home">
    <a className="skip" href="#isi">Ke isi halaman</a>
    <header className="site-head wrap">
      <a className="brand" href="/" aria-label="LaporJalan, halaman utama"><img src="/brand/lockup-horizontal.svg" width="162" height="32" alt="" /></a>
      <nav className="site-nav" aria-label="Bagian halaman"><a href="#alur">Alur</a><a href="#data">Data</a><a href="#pertanyaan">Pertanyaan</a></nav>
      {/* one yellow action at a time: when reporting is on, the hero's report action keeps the accent */}
      <a className={`btn ${canReport ? 'btn-quiet' : 'btn-primary'} head-cta`} href="/peta">Buka peta</a>
    </header>

    <main id="isi">
      {/* hero: the product is the picture; Miko points at it */}
      <section className="hero wrap" aria-labelledby="t-hero">
        <div className="hero-title">
          <p className="kicker">Peta warga · Jakarta</p>
          <h1 className="display" id="t-hero"><span>Tandai jalan rusak.</span><span>Pengendara berikutnya ikut&nbsp;tahu.</span></h1>
        </div>
        <div className="hero-side">
          <p className="lead">Laporan jalan rusak di Jakarta dari CRM Jakarta dan warga, dalam satu peta. Peta dapat dibuka tanpa login.</p>
          <div className="actions">
            {canReport ? <>
              <a className="btn btn-primary" href="/peta?buat=1">Laporkan jalan<ArrowRight /></a>
              <a className="btn btn-quiet" href="/peta">Buka peta</a>
            </> : <>
              <a className="btn btn-primary" href="/peta">Buka peta<ArrowRight /></a>
              <a className="btn btn-quiet" href="#alur">Lihat alur</a>
            </>}
          </div>
          {snapshot && <p className="live"><span className="live-dot" aria-hidden="true" /><span>
            <strong>{snapshot.reports.length} laporan Jalan</strong> dari CRM Jakarta · {reportDate(snapshot.source.dateStart, false)} - {reportDate(snapshot.source.dateEnd, false)} · diambil {reportDate(snapshot.source.retrievedAt)} WIB
          </span></p>}
        </div>
        <div className="hero-app">
          <div className="app-frame">
            <PublicMap reports={snapshot?.reports ?? []} selected={null} onSelect={openReport} onArea={() => {}} cooperative minimal />
          </div>
          <img className="hero-miko" src="/home/miko/point-512.webp" srcSet="/home/miko/point-512.webp 512w, /home/miko/point-1024.webp 1024w" sizes="(min-width: 700px) 150px, 96px" width="512" height="512" alt="" decoding="async" />
        </div>
      </section>

      {/* the flow: what a visitor can do after seeing the map, reporting as the third step */}
      <section className="flow-sec wrap" id="alur" aria-labelledby="t-alur">
        <div className="sec-head">
          <p className="kicker">Alur</p>
          <h2 className="h2" id="t-alur">Dari peta sampai pembaruan.</h2>
          {!(canReport && citizen) && <p className="sec-note">Langkah bertanda <Avail on={false} /> sudah ada di aplikasi, tetapi laporan warga belum dinyalakan di layanan.</p>}
        </div>
        <ol className="flow">
          <Step n={1} title="Lihat peta" on href="/peta" go="Buka peta" miko="phone" caption="Contoh tampilan alat peta."
            text="Laporan dari CRM Jakarta dan warga LaporJalan tampil di satu peta, tanpa login. Titik yang berdekatan menjadi satu kumpulan. Cari kode atau status, saring kategori, atau nyalakan 3D untuk mengenali gedung.">
            <span className="mini-search"><Search /><span>Cari kode atau status</span></span>
            <span className="mini-row"><span className="mini-chip on"><Route />Jalan</span><span className="mini-chip">Area ini</span><span className="mini-chip">3D</span></span>
            <span className="mini-row">
              <span className="lj-marker is-cluster"><span>12</span></span>
              <span className="lj-marker"><span><Route /></span></span>
              <span className="lj-marker"><span><Construction /></span></span>
            </span>
          </Step>
          <Step n={2} title="Buka laporan" on href="/peta" go="Lihat laporan" miko="clipboard"
            caption={statusCounts.length ? 'Jumlah per status dari data CRM Jakarta saat ini.' : 'Contoh tampilan detail laporan.'}
            text="Setiap laporan memuat sumber, waktu, dan status persis seperti di sumbernya. Laporan warga berbentuk ruas dapat ditelusuri dengan Lihat ilustrasi 3D: kamera menyusuri ruas dari ujung ke ujung.">
            <span className="lj-eyebrow">LAPORAN · CRM JAKARTA</span>
            {/* the four biggest statuses; the rest as one count, so the sample stays a sample */}
            {statusCounts.length > 0 && <span className="mini-row">{statusCounts.slice(0, 4).map(([status, count]) => <span key={status} className="lj-status">{status} {count}</span>)}
              {statusCounts.length > 4 && <span className="mini-more">+{statusCounts.length - 4} status lain</span>}</span>}
            <span className="mini-row"><span className="mini-chip">Ringkasan</span><span className="mini-chip">Riwayat</span></span>
            <span className="mini-button">Lihat ilustrasi 3D</span>
          </Step>
          <Step n={3} title="Laporkan" on={canReport} href={reportHref} go={canReport ? 'Mulai lapor' : 'Buka peta'} miko="pin" caption="Contoh tampilan form laporan."
            text="Masuk lewat tautan email, lalu isi tiga langkah: Lokasi, Kondisi, Tinjau. Tandai titik, ruas, atau area, pilih jenis kondisi, dan lampirkan foto atau video bila ada. Tandai dari tempat aman, bukan dari tengah lajur.">
            <ol className="lj-steps">{['Lokasi', 'Kondisi', 'Tinjau'].map((label, index) => <li key={label} aria-current={index === 1 ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
            <ReportDrop />
            <span className="mini-row">{(['pothole', 'excavation', 'crack'] as const).map((kind, i) => <span key={kind} className={`mini-chip${i === 1 ? ' on' : ''}`}><span className="lj-swatch" style={swatchStyle(kind)} />{CONDITION_LABELS[kind]}</span>)}</span>
          </Step>
          <Step n={4} title="Pantau pembaruan" on={citizen} href="/peta" go="Buka peta" miko="peek-puddle" caption="Contoh riwayat. Isi laporan sungguhan ditulis pelapor."
            text="Pelapor mencatat perkembangan pada laporan yang sama: belum berubah, terlihat dikerjakan, atau terlihat selesai. Nama tampilan bersifat pilihan, email tetap privat, dan laporan dapat ditarik dari publik.">
            <ol className="lj-timeline">{[OBSERVATIONS.resolved_observed, OBSERVATIONS.work_observed, 'Laporan dibuat'].map(label => <li key={label}><strong>{label}</strong><p className="lj-entry-meta">Pelapor · warga LaporJalan</p></li>)}</ol>
            <span className="mini-row"><span className="mini-link">Ubah nama publik</span><span className="mini-link">Tarik laporan</span></span>
          </Step>
        </ol>
      </section>

      {/* data: where every dot comes from, and what stays private */}
      <section className="data wrap" id="data" aria-labelledby="t-data">
        <div className="sec-head"><p className="kicker">Data</p><h2 className="h2" id="t-data">Dari mana titiknya.</h2></div>
        <div className="sources">
          <article className="source">
            <h3><Avail on /> CRM Jakarta, lewat JAKI</h3>
            <ul>
              <li><Route /><span>Kategori Jalan, hari ini dan kemarin. Bukan seluruh laporan Jakarta.</span></li>
              <li><Eye /><span><strong>Tampil:</strong> kode, titik, waktu, dan status dari sumber.</span></li>
              <li><Lock /><span><strong>Tidak tampil:</strong> isi teks bebas dan identitas pelapor. Foto tidak disertakan sumber.</span></li>
            </ul>
            <a className="text-link" href="https://crm.jakarta.go.id/peta/" target="_blank" rel="noreferrer">Peta CRM Jakarta<ArrowUpRight /><span className="sr-only"> (tab baru)</span></a>
          </article>
          <article className="source">
            <h3><Avail on={citizen} /> Warga LaporJalan</h3>
            <ul>
              <li><Route /><span>{citizen ? 'Dikirim warga lewat LaporJalan.' : 'Laporan warga belum diaktifkan di layanan.'}</span></li>
              <li><Eye /><span><strong>Tampil:</strong> lokasi, isi, dan lampiran yang disetujui untuk dipublikasikan. Nama tampilan bersifat pilihan.</span></li>
              <li><Lock /><span><strong>Tetap privat:</strong> alamat email.</span></li>
            </ul>
            <p className="source-foot">Laporan disimpan di LaporJalan. Pengiriman ke kanal pemerintah belum terhubung.</p>
          </article>
        </div>
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

    <footer className="site-foot wrap">
      <img src="/brand/lockup-horizontal.svg" width="130" height="26" alt="LaporJalan" />
      <p>Bukan layanan resmi pemerintah. Data laporan: <a href="https://crm.jakarta.go.id/peta/" target="_blank" rel="noreferrer">CRM Jakarta<span className="sr-only"> (tab baru)</span></a>. Data peta © kontributor OpenStreetMap.</p>
    </footer>
  </div></MotionConfig>;
}

// --- end of landing page ---
