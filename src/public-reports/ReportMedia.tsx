/* Preview selected media and show attachments already saved on the server.
Todo:
-> release object URLs and avoid autoplay
*/
import { useEffect, useState } from 'react';
import { Media, mediaUrl } from './community';

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
    <small>Maksimum 3 lampiran, masing-masing 10 MB. Hindari wajah, nomor telepon, dan data pribadi.</small>
    {error && <p className="lj-form-error" role="alert">{error}</p>}
    {files.map((file, index) => <figure key={`${index}-${file.name}`}>
      {file.type.startsWith('image/') ? <img src={previews[index]} alt={`Pratinjau ${file.name}`} /> : <video src={previews[index]} controls preload="metadata" />}
      <figcaption>{file.name}<button type="button" disabled={disabled} onClick={() => onChange(files.filter((_, i) => i !== index))}>Hapus lampiran {index + 1}</button></figcaption>
    </figure>)}
  </div>;
}
export function ReportMedia({ reportId, media }: { reportId: string; media: Media[] }) {
  const [failed, setFailed] = useState<string[]>([]);
  return <div className="lj-attachments">{media.map((file, index) => <figure key={file.id}>
    {failed.includes(file.id) ? <p>Lampiran belum dapat dimuat.</p> : file.mime.startsWith('image/')
      ? <img src={mediaUrl(reportId, file.id)} alt={`Bukti laporan ${index + 1}`} loading="lazy" onError={() => setFailed(rows => [...rows, file.id])} />
      : <video src={mediaUrl(reportId, file.id)} controls preload="metadata" onError={() => setFailed(rows => [...rows, file.id])} />}
  </figure>)}</div>;
}
