/* Todo:
-> loading placeholders (owner, 11 Nov: no bare text while data loads)
    -> SkeletonRows: grey rows (thumbnail + two lines) for report lists and the admin queue
    -> SkeletonBlock: a picture block and text lines for a detail panel; PageSkeleton for a whole page
-> Miko flies beside the status text; with reduced motion the shapes stay still
*/
import './skeleton.css';

function Status({ label }: { label: string }) {
  return <p className="sk-status" role="status"><img src="/home/miko/fly-192.webp" width="28" height="28" alt="" />{label}</p>;
}
const widths = ['78%', '64%', '86%', '58%', '72%'];

export function SkeletonRows({ count = 5, label = 'Memuat laporan…', thumb = true }: { count?: number; label?: string; thumb?: boolean }) {
  return <div className="sk" aria-busy="true">
    <Status label={label} />
    {Array.from({ length: count }, (_, index) => <div className="sk-row" key={index} aria-hidden="true">
      {thumb && <span className="sk-box sk-thumb" />}
      <span className="sk-lines"><span className="sk-box sk-line" style={{ width: widths[index % widths.length] }} /><span className="sk-box sk-line is-short" /></span>
    </div>)}
  </div>;
}

export function SkeletonBlock({ lines = 5, label = 'Memuat…', media = true }: { lines?: number; label?: string; media?: boolean }) {
  return <div className="sk" aria-busy="true">
    <Status label={label} />
    <span className="sk-box sk-title" aria-hidden="true" />
    {media && <span className="sk-box sk-media" aria-hidden="true" />}
    {Array.from({ length: lines }, (_, index) => <span key={index} className="sk-box sk-line" style={{ width: widths[index % widths.length] }} aria-hidden="true" />)}
  </div>;
}

export function PageSkeleton({ label = 'Memuat halaman…' }: { label?: string }) {
  return <div className="sk-page"><SkeletonBlock label={label} lines={4} /></div>;
}
