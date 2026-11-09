/* Todo:
-> the report as a short card on its pin (owner choice, 9 Nov: like the CRM map, no second page beside the map)
    -> hover or focus a pin = preview; click or tap = pinned (shareable ?laporan=ID), with its actions
    -> owners manage the report on /akun; the card only links there
    -> a pinned imported report has Laporan + Riwayat tabs, like the CRM detail (owner choice, 10 Nov), without photos
    -> handling by the LaporJalan team (admin) shows as 'Penanganan pengelola' and in Riwayat
*/
import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { api, CATEGORY_LABELS, mediaUrl, type CitizenReport, type User } from './community';
import { closureNeedsUpdate, conditionLabel, conditionSize, useConditionClock } from './condition';
import { fetchHandling, fetchReportDetail, reportDate, type PublicHandling, type PublicReport, type ReportDetail } from './data';

// --- report popup ---
// input param : report, pinned, the signed-in user (to learn whether the report is theirs)
// output      : a summary card; actions only when pinned
export function ReportPopup({ report, pinned, user, onClose, onInspect }: {
  report: PublicReport; pinned: boolean; user: User | null; onClose: () => void; onInspect?: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const now = useConditionClock();
  const citizen = report as CitizenReport;
  const community = report.origin === 'community';
  const [owned, setOwned] = useState(Boolean(citizen.canManage));
  const [detail, setDetail] = useState<ReportDetail | null>(null), [tab, setTab] = useState<'report' | 'history'>('report');
  const [communityHandling, setCommunityHandling] = useState<PublicHandling | null>(null);
  // warga reports: handling comes from its own endpoint (imported details already include it)
  useEffect(() => {
    setCommunityHandling(null);
    if (!pinned || !community) return;
    const controller = new AbortController();
    fetchHandling(report.id, controller.signal).then(value => { if (!controller.signal.aborted) setCommunityHandling(value); }).catch(() => {});
    return () => controller.abort();
  }, [report.id, pinned]);
  const handling = detail?.handling ?? communityHandling;
  // imported reports: the full record and its history, once the card is pinned
  useEffect(() => {
    setDetail(null); setTab('report');
    if (!pinned || community) return;
    const controller = new AbortController();
    fetchReportDetail(report.id, controller.signal).then(value => { if (!controller.signal.aborted) setDetail(value); }).catch(() => {});
    return () => controller.abort();
  }, [report.id, pinned]);
  // the public list does not say who owns a report; ask once the card is pinned by a signed-in visitor
  useEffect(() => {
    setOwned(Boolean(citizen.canManage));
    if (!pinned || !community || !user || citizen.canManage !== undefined) return;
    const controller = new AbortController();
    api<CitizenReport>(`/reports/${report.id}`, { signal: controller.signal }).then(detail => { if (!controller.signal.aborted) setOwned(Boolean(detail.canManage)); }).catch(() => {});
    return () => controller.abort();
  }, [report.id, pinned, user?.id]);
  // Why/Note: the card is rendered before the map attaches its popup, so focus waits one frame
  useEffect(() => {
    if (!pinned) return;
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [pinned, report.id]);
  const image = community && (!citizen.visibility || citizen.visibility === 'public') ? report.media?.find(file => file.mime.startsWith('image/')) : undefined;
  const size = report.condition && conditionSize(report.condition)?.short;
  return <article className={`lj-popup-card${pinned ? ' is-pinned' : ''}`} aria-labelledby={`popup-${report.id}`}>
    {pinned && <button className="lj-popup-close" aria-label="Tutup laporan" onClick={onClose}><X size={18} /></button>}
    <div className="lj-popup-head">
      {image && <img className="lj-popup-photo" src={mediaUrl(report.id, image.id)} alt="" loading="lazy" />}
      <div>
        <p className="lj-eyebrow">{community ? 'LAPORAN WARGA' : `LAPORAN ${CATEGORY_LABELS[report.category].toUpperCase()}`}</p>
        <h2 id={`popup-${report.id}`} ref={heading} tabIndex={-1}>{report.title ?? report.code}</h2>
        <p className="lj-popup-meta"><time dateTime={report.createdAt}>{reportDate(report.createdAt)} WIB</time>{community ? ` · ${citizen.reporterName || 'Pelapor'}` : report.title ? ` · ${report.code}` : ''}</p>
      </div>
    </div>
    {pinned && handling && <div className="lj-popup-handling">
      <span className="lj-eyebrow">PENANGANAN PENGELOLA</span>
      <strong>{handling.status ?? 'Ditugaskan'}{handling.unit ? ` · ${handling.unit}` : ''}</strong>
      {handling.history.find(entry => entry.note)?.note && <p>{handling.history.find(entry => entry.note)!.note}</p>}
    </div>}
    {detail ? <ReportTabs report={report} detail={detail} tab={tab} onTab={setTab} />
      : <span className="lj-status">{report.sourceStatus ?? 'Status belum tersedia'}</span>}
    {report.condition && <p className="lj-popup-condition">{[conditionLabel(report.condition), size, 'pengamatan pelapor'].filter(Boolean).join(' · ')}
      {closureNeedsUpdate(report.condition, now) && <strong className="lj-stale-condition">Perlu pembaruan</strong>}</p>}
    {citizen.visibility === 'withdrawn' && <p className="lj-popup-note">Ditarik dari publik. Hanya pemilik yang melihat laporan ini.</p>}
    {pinned && <div className="lj-popup-actions">
      {report.condition && onInspect && <button className="lj-secondary" onClick={onInspect}>Lihat ilustrasi 3D</button>}
      {owned && <a className="lj-secondary" href={`/akun?laporan=${encodeURIComponent(report.id)}`}>Kelola di akun</a>}
    </div>}
  </article>;
}
// --- end of report popup ---

// --- Laporan / Riwayat tabs ---
const ROLE: Record<string, string> = { lurah: 'Kelurahan', camat: 'Kecamatan', skpd: 'SKPD', ukpd: 'UKPD', 'petugas-skpd': 'Petugas SKPD', 'petugas-ukpd': 'Petugas UKPD', administrator: 'Admin' };
function ReportTabs({ report, detail, tab, onTab }: { report: PublicReport; detail: ReportDetail; tab: 'report' | 'history'; onTab: (tab: 'report' | 'history') => void }) {
  const id = `card-${report.id}`;
  const area = [detail.area?.village, detail.area?.district, detail.area?.city].filter(Boolean).join(', ');
  const place = [detail.address, detail.addressDetail].filter(Boolean).join(' · ');
  // the source history and the LaporJalan team's handling, newest first
  const entries = [
    ...detail.history.map(entry => ({ at: entry.at, team: false, note: entry.note,
      label: `${entry.status}${(entry.unit ?? (entry.role && ROLE[entry.role])) ? ` (${entry.unit ?? ROLE[entry.role!]})` : ''}` })),
    ...(detail.handling?.history ?? []).map(entry => ({ at: entry.at, team: true, note: entry.note,
      label: `${entry.status ?? (entry.unit ? `Ditugaskan ke ${entry.unit}` : entry.action)} (Pengelola LaporJalan)` })),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return <>
    <div className="lj-popup-tabs" role="tablist" aria-label="Isi laporan">
      <button role="tab" id={`${id}-report-tab`} aria-controls={`${id}-report`} aria-selected={tab === 'report'} onClick={() => onTab('report')}>Laporan</button>
      <button role="tab" id={`${id}-history-tab`} aria-controls={`${id}-history`} aria-selected={tab === 'history'} onClick={() => onTab('history')}>Riwayat ({detail.history.length})</button>
    </div>
    <div id={`${id}-report`} role="tabpanel" aria-labelledby={`${id}-report-tab`} hidden={tab !== 'report'} className="lj-popup-panel">
      <dl className="lj-popup-facts">
        <div><dt>Nomor laporan</dt><dd>{report.code}</dd></div>
        <div><dt>Status</dt><dd><span className="lj-status">{detail.status}</span></dd></div>
        <div><dt>Kategori</dt><dd>{CATEGORY_LABELS[report.category]}{detail.subcategory && detail.subcategory !== CATEGORY_LABELS[report.category] ? ` · ${detail.subcategory}` : ''}</dd></div>
        {detail.unit && <div><dt>SKPD/Wilayah</dt><dd>{detail.unit}</dd></div>}
        {area && <div><dt>Kelurahan</dt><dd>{area}</dd></div>}
        {place && <div><dt>Lokasi</dt><dd>{place}</dd></div>}
      </dl>
      {detail.description && <div className="lj-popup-description"><h3>Deskripsi</h3><p>{detail.description}</p></div>}
    </div>
    <div id={`${id}-history`} role="tabpanel" aria-labelledby={`${id}-history-tab`} hidden={tab !== 'history'} className="lj-popup-panel">
      {entries.length ? <ol className="lj-popup-history">{entries.map((entry, index) => <li key={index} className={entry.team ? 'is-team' : undefined}>
        <time dateTime={entry.at}>{reportDate(entry.at)} WIB</time>
        <strong>{entry.label}</strong>
        {entry.note && <p>{entry.note}</p>}
      </li>)}</ol> : <p className="lj-popup-note">Riwayat belum tersedia.</p>}
    </div>
  </>;
}
// --- end of Laporan / Riwayat tabs ---
