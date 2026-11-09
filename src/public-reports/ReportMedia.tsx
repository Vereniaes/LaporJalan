/* Preview selected media and show attachments already saved on the server.
Todo:
-> release object URLs and avoid autoplay
*/
import { useEffect, useState } from 'react';
import { Media, mediaUrl, privateMedia } from './community';

export function MediaPicker({ files, onChange, disabled }: { files: File[]; onChange: (files: File[]) => void; disabled?: boolean }) {
  const [error, setError] = useState('');
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => { const urls = files.map(file => URL.createObjectURL(file)); setPreviews(urls); return () => urls.forEach(url => URL.revokeObjectURL(url)); }, [files]);
  return <div className="lj-media-picker">
    <label>Foto atau video <span>(opsional)</span><input type="file" multiple disabled={disabled} accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" onChange={event => {
      const picked = [...(event.target.files ?? [])];
      event.target.value = '';
      if (picked.length + files.length > 3 || picked.some(file => file.size > 10 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'].includes(file.type))) {
        setError('Maksimum 3 lampiran, masing-masing 10 MB. Gunakan JPEG, PNG, WebP, MP4, atau WebM.'); return;
      }
      setError(''); onChange([...files, ...picked]);
    }} /></label>
    <small>Maksimum 3 berkas, 10 MB per berkas. Video hingga 2 menit; resolusi dapat disesuaikan.</small>
    <small>Foto dan video diproses ulang sebelum ditampilkan. Periksa isi lampiran; wajah atau informasi yang terlihat tidak disamarkan otomatis.</small>
    <small>Video dapat diperkecil. Suara tetap disertakan dan perlu diperiksa sebelum publikasi.</small>
    {error && <p className="lj-form-error" role="alert">{error}</p>}
    {files.map((file, index) => <figure key={`${index}-${file.name}`}>
      {file.type.startsWith('image/') ? <img src={previews[index]} alt={`Pratinjau ${file.name}`} /> : <video src={previews[index]} controls preload="metadata" />}
      <figcaption>{file.name}<button type="button" disabled={disabled} onClick={() => onChange(files.filter((_, i) => i !== index))}>Hapus lampiran {index + 1}</button></figcaption>
    </figure>)}
  </div>;
}
function Attachment({ reportId, file, index, privateAccess }: { reportId: string; file: Media; index: number; privateAccess: boolean }) {
  const [url, setUrl] = useState(''), [failed, setFailed] = useState(false), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); let objectUrl = '';
    setFailed(false); setUrl('');
    if (privateAccess) privateMedia(reportId, file.id, controller.signal).then(blob => {
      if (!controller.signal.aborted) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }
    }).catch(() => { if (!controller.signal.aborted) setFailed(true); });
    else setUrl(mediaUrl(reportId, file.id));
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [reportId, file.id, privateAccess, retry]);
  return <figure>{failed ? <p>Lampiran belum dapat dimuat. <button className="lj-text-action" onClick={() => setRetry(value => value + 1)}>Coba lagi</button></p>
    : !url ? <p role="status">Memuat lampiran…</p> : file.mime.startsWith('image/')
      ? <img src={url} alt={`Bukti laporan ${index + 1}`} loading="lazy" onError={() => setFailed(true)} />
      : <video src={url} controls preload="metadata" onError={() => setFailed(true)} />}</figure>;
}
export function ReportMedia({ reportId, media, privateAccess = false }: { reportId: string; media: Media[]; privateAccess?: boolean }) {
  return <div className="lj-attachments">{media.map((file, index) => <Attachment key={file.id} reportId={reportId} file={file} index={index} privateAccess={privateAccess} />)}</div>;
}
