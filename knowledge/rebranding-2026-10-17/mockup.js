/* Local design flows: browse public points, inspect empty media, and preview unsent forms. */
const source = window.LAPORJALAN_DESIGN_SOURCE;
const reports = source.reports;
const panel = document.querySelector('#panel-body');
const workspace = document.querySelector('#workspace');
const iconPaths = {
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
  pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  plus: '<path d="M12 4v16M4 12h16"/>', minus: '<path d="M4 12h16"/>',
  up: '<path d="m6 15 6-6 6 6"/>', back: '<path d="m10 5-7 7 7 7M3 12h18"/>',
  expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8l10-5ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  road: '<path d="M4 3v18M20 3v18M12 3v5l-3 3 6 2-3 3v5"/>',
  construction: '<rect x="3" y="7" width="18" height="8" rx="1"/><path d="m7 7-4 5m10-5-6 8m12-8-6 8M6 15v6M18 15v6"/>',
  drain: '<path d="M3 5h18M7 5v5m5-5v5m5-5v5M3 15c3-3 3 3 6 0s3 3 6 0 3 3 6 0M3 20c3-3 3 3 6 0s3 3 6 0 3 3 6 0"/>',
  fire: '<path d="M12 3c1 5 5 5 3 9 2-1 3-3 3-3 4 7 1 12-6 12S2 16 6 10c0 4 2 3 3 1 1-2 0-5 3-8Z"/>',
  photo: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.5"/><path d="m3 17 6-5 4 3 4-5 4 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${iconPaths[name] || iconPaths.info}</svg>`;
const escapeText = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const date = value => new Intl.DateTimeFormat('id-ID', {dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Jakarta'}).format(new Date(value)) + ' WIB';
document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
document.querySelectorAll('[data-legend]').forEach(el => el.insertAdjacentHTML('afterbegin', icon(el.dataset.legend)));

let view = 'list', selectedId = null, detailTab = 'evidence', filter = 'all', query = '', area = null;
let formStep = 1, formError = '', returnView = null, cameraBeforeForm = null, listScroll = 0;
let draft = freshDraft(), attachments = [], pickMarker = null, map = null, markers = [], mapReady = false;
const comments = new Map();
let toastTimer;
function freshDraft() { return {lat:'', lng:'', category:'', title:'', description:''}; }
function notify(message) {
  const el = document.querySelector('#toast');
  clearTimeout(toastTimer); el.textContent = message; el.hidden = false;
  toastTimer = setTimeout(() => el.hidden = true, 5000);
}
function focusTitle() { panel.querySelector('#panel-title')?.focus({preventScroll:true}); }
function setExpanded(expanded) {
  workspace.classList.toggle('expanded', expanded);
  document.querySelector('#sheet-toggle').setAttribute('aria-expanded', String(expanded));
  document.querySelector('#sheet-label').textContent = expanded ? 'Lihat peta' : 'Lihat daftar';
  requestAnimationFrame(() => map?.resize());
}
function visibleReports() {
  return reports.filter(report => (filter === 'all' || filter === 'road')
    && (!query || `${report.code} ${report.category} ${report.sourceStatus}`.toLowerCase().includes(query.toLowerCase()))
    && (!area || area.contains([report.lng, report.lat])));
}
function updateMarkers() {
  if (!mapReady) return;
  markers.forEach(item => item.marker.remove()); markers = [];
  const groups = [];
  for (const report of visibleReports()) {
    const point = map.project([report.lng,report.lat]);
    const group = report.id !== selectedId && groups.find(item => item.reports[0].id !== selectedId && Math.hypot(item.point.x-point.x,item.point.y-point.y) < 48);
    if (group) group.reports.push(report); else groups.push({point,reports:[report]});
  }
  for (const group of groups) {
    const report = group.reports[0], clustered = group.reports.length > 1;
    const element = document.createElement('button');
    element.className = `marker${clustered ? ' cluster' : ''}${report.id === selectedId ? ' selected' : ''}`;
    element.innerHTML = clustered ? String(group.reports.length) : icon('road');
    element.dataset.reportCount = String(group.reports.length);
    element.setAttribute('aria-label',clustered ? `Perbesar ${group.reports.length} laporan berdekatan` : `Buka laporan ${report.code}`);
    if (!clustered) element.dataset.markerId=report.id;
    element.setAttribute('aria-pressed',String(!clustered && report.id===selectedId));
    element.addEventListener('click',event=>{event.stopPropagation();if(clustered)map.easeTo({center:[report.lng,report.lat],zoom:map.getZoom()+1.8,duration:300});else selectReport(report.id);});
    const marker = new maplibregl.Marker({element}).setLngLat([report.lng,report.lat]).addTo(map);
    markers.push({report,element,marker});
  }
}
function render() {
  workspace.classList.toggle('form-mode', view === 'form');
  workspace.classList.toggle('location-step', view === 'form' && formStep === 1);
  workspace.classList.toggle('map-pick', view === 'form' && formStep === 1);
  panel.innerHTML = view === 'list' ? listHtml() : view === 'detail' ? detailHtml() : formHtml();
  updateMarkers(); requestAnimationFrame(() => map?.resize());
}
function listHtml() {
  const list = visibleReports();
  const filters = [['all','Semua',null],['road','Jalan','road'],['construction','Pembangunan','construction'],['drain','Saluran','drain'],['fire','Pembakaran','fire']];
  return `<div class="panel-heading"><div class="eyebrow">Di sekitar jalan</div><div class="title-row"><h1 id="panel-title" tabindex="-1">Laporan warga</h1><span class="count-badge">${list.length} titik</span></div><p>Lokasi, kondisi, dan pembaruan dalam satu peta.</p></div>
  <div class="filters" aria-label="Kategori laporan">${filters.map(([key,label,symbol]) => `<button data-filter="${key}" aria-pressed="${filter === key}">${symbol ? icon(symbol) : ''}${label}</button>`).join('')}</div>
  <div class="list-meta"><span>${area ? 'Area peta yang dipilih' : 'Cuplikan publik Jakarta'}</span><span>Terbaru dahulu</span></div>
  ${list.length ? list.map(report => `<button class="report-row ${selectedId === report.id ? 'selected' : ''}" data-report="${escapeText(report.id)}" aria-label="Buka laporan ${escapeText(report.code)}">
    <span class="no-photo">${icon('photo')}<span>Tanpa foto</span></span><span class="row-content"><h3>Laporan jalan</h3><p class="report-code">${escapeText(report.code)}</p><span class="row-meta"><span>${escapeText(date(report.createdAt))}</span><span class="source-status">CRM · ${escapeText(report.sourceStatus)}</span></span></span><span class="row-chevron" aria-hidden="true">›</span></button>`).join('') : `<div class="empty-state">${icon('search')}<h2>Belum ada laporan pada pilihan ini</h2><p>${filter !== 'all' && filter !== 'road' ? 'Cuplikan sumber hanya memuat kategori “Jalan”. Kategori lain belum tersedia dalam pratinjau ini.' : 'Ubah pencarian atau perluas area peta. Keadaan ini tidak membuktikan bahwa wilayah bebas masalah.'}</p><button data-action="reset-filters">Tampilkan semua titik</button></div>`}
  <div class="list-note">Kategori “Jalan” mengikuti sumber CRM. Rincian kerusakan, foto, dan riwayat penanganan belum tersedia pada cuplikan ini.</div>`;
}
function detailHtml() {
  const report = reports.find(item => item.id === selectedId);
  if (!report) return listHtml();
  return `<div class="back-row"><button class="text-button" data-action="back-list">${icon('back')}Kembali ke laporan</button></div>
  <div class="detail-head"><div class="category-label">${icon('road')}Jalan · kategori sumber</div><h1 id="panel-title" tabindex="-1">Laporan jalan</h1><p>${escapeText(report.code)}</p><div class="detail-meta"><span>${escapeText(date(report.createdAt))}</span><span>· CRM Jakarta</span></div></div>
  <div class="detail-tabs" aria-label="Bagian detail"><button data-tab="evidence" aria-pressed="${detailTab === 'evidence'}">Ringkasan</button><button data-tab="updates" aria-pressed="${detailTab === 'updates'}">Pembaruan</button><button data-tab="comments" aria-pressed="${detailTab === 'comments'}">Komentar</button></div>
  <div class="detail-content">${detailTab === 'evidence' ? evidenceHtml(report) : detailTab === 'updates' ? updatesHtml(report) : commentsHtml(report)}</div>`;
}
function evidenceHtml(report) {
  return `<div class="media-empty">${icon('photo')}<strong>Foto belum tersedia</strong><p>Cuplikan sumber ini tidak menyertakan foto atau video.</p></div>
  <div class="info-block"><h2>Lokasi laporan</h2><p>Koordinat dari CRM Jakarta</p><dl class="detail-dl"><dt>Lintang</dt><dd>${report.lat.toFixed(6)}</dd><dt>Bujur</dt><dd>${report.lng.toFixed(6)}</dd></dl><button data-action="center-report" class="text-button">${icon('pin')}Lihat titik pada peta</button></div>
  <div class="info-block"><h2>Informasi dari sumber</h2><dl class="detail-dl"><dt>Kategori</dt><dd>${escapeText(report.category)}</dd><dt>Status CRM</dt><dd>${escapeText(report.sourceStatus)}</dd><dt>Diambil</dt><dd>${escapeText(date(source.retrievedAt))}</dd></dl></div>
  <div class="note">Nama kategori “Jalan” belum menjelaskan jenis kerusakan. Status di atas merupakan status sumber saat cuplikan diambil.</div>
  <a href="${escapeText(source.sourceUrl)}" target="_blank" rel="noopener noreferrer">Buka peta sumber ↗</a><button data-tab="comments" class="secondary detail-action">Tambah komentar atau bukti</button>`;
}
function updatesHtml(report) {
  return `<ol class="timeline"><li><strong>Laporan tercatat</strong><p>${escapeText(date(report.createdAt))}</p><p>Waktu pembuatan pada CRM Jakarta.</p></li><li><strong>Status saat cuplikan diambil</strong><p>${escapeText(report.sourceStatus)} · CRM Jakarta</p><p>Diambil ${escapeText(date(source.retrievedAt))}</p></li></ol>
  <div class="note">Tanggal perubahan status tidak tersedia. Cuplikan ini tidak memuat urutan penanganan atau persentase progres.</div><button data-tab="comments" class="secondary detail-action">Lihat komentar</button>`;
}
function commentsHtml(report) {
  const draftText = comments.get(report.id) || '';
  return `<div class="empty-comments"><h2>Belum ada percakapan terhubung</h2><p>Komentar LaporJalan belum tersedia pada mockup ini. Percakapan dari CRM tidak diimpor.</p></div>
  <form id="comment-form"><div class="field"><label for="comment">Tambah pengamatan</label><textarea id="comment" maxlength="1500" placeholder="Jelaskan kondisi terbaru yang terlihat.">${escapeText(draftText)}</textarea><small>Pratinjau lokal. Komentar tidak dikirim atau dipublikasikan.</small><p id="comment-error" class="field-error" hidden></p></div>
  <div class="field"><label for="comment-media">Foto atau video</label><input id="comment-media" class="file-input" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"><small>Lampiran hanya dibaca pada perangkat ini. Batas pratinjau 10 MB.</small></div>
  <button type="submit" class="primary">Pratinjau komentar</button></form><div id="comment-preview" hidden></div>`;
}
function stepHtml() {
  return `<div class="steps" aria-label="Langkah laporan">${['Lokasi','Kondisi','Tinjau'].map((label,index) => `${index ? '<span class="step-line"></span>' : ''}<span class="step ${formStep === index + 1 ? 'current' : ''}" ${formStep === index + 1 ? 'aria-current="step"' : ''}><i>${index + 1}</i>${label}</span>`).join('')}</div>`;
}
function field(name, label, type = 'text') {
  return `<div class="field"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" ${type === 'number' ? 'step="any"' : 'maxlength="100"'} value="${escapeText(draft[name])}"></div>`;
}
function formHtml() {
  return `<div class="back-row"><button data-action="close-form" class="text-button">${icon('back')}Kembali ke peta</button></div><div class="form-heading"><h1 id="panel-title" tabindex="-1">Laporkan kondisi</h1><p>Isian untuk ditinjau, belum dikirim.</p>${stepHtml()}</div><div class="form-body">
  ${formStep === 1 ? `<div class="pick-tip">${icon('pin')}<span>Pilih titik pada peta atau masukkan koordinat lokasi yang diketahui.</span></div><form id="location-form"><div class="coord-fields">${field('lat','Lintang','number')}${field('lng','Bujur','number')}</div><p class="location-readout">${draft.lat && draft.lng ? 'Titik dipilih. Periksa lokasinya sebelum melanjutkan.' : 'Belum ada titik dipilih.'}</p>${errorHtml()}<div class="form-actions"><button class="primary" type="submit">Lanjut ke kondisi</button></div></form>` : formStep === 2 ? conditionHtml() : reviewHtml()}</div>`;
}
function errorHtml() { return formError ? `<p class="field-error" role="alert">${escapeText(formError)}</p>` : ''; }
function conditionHtml() {
  const categories = ['Jalan rusak','Pembangunan','Saluran tersumbat','Pembakaran sampah'];
  return `<form id="condition-form"><div class="field"><label for="category">Jenis kejadian</label><select name="category" id="category"><option value="">Pilih kategori</option>${categories.map(category => `<option ${draft.category === category ? 'selected' : ''}>${category}</option>`).join('')}</select></div>${field('title','Judul laporan')}
  <div class="field"><label for="description">Kondisi yang terlihat</label><textarea name="description" id="description" maxlength="1500" placeholder="Jelaskan kondisi di lokasi dan waktu pengamatan.">${escapeText(draft.description)}</textarea><small>Hindari memasukkan nomor telepon atau identitas pribadi pada uraian publik.</small></div>
  <div class="field"><label for="report-media">Foto atau video</label><input id="report-media" class="file-input" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple><small>Batas pratinjau: 3 berkas, maksimal 10 MB per berkas. File tidak diunggah.</small><div class="attachment-list">${attachments.map((item,index) => attachmentHtml(item,index)).join('')}</div></div>${errorHtml()}<div class="form-actions"><button type="button" data-action="previous-step">Kembali</button><button type="submit" class="primary">Tinjau laporan</button></div></form>`;
}
function attachmentHtml(item, index) {
  const media = item.file.type.startsWith('video/') ? `<video src="${item.url}" controls preload="metadata"></video>` : `<img src="${item.url}" alt="Pratinjau lampiran yang dipilih">`;
  return `<div class="attachment">${media}<p>${escapeText(item.file.name)}</p>${index !== undefined ? `<button type="button" data-remove-file="${index}" aria-label="Hapus lampiran ${escapeText(item.file.name)}">${icon('close')}</button>` : ''}</div>`;
}
function reviewHtml() {
  return `<p class="note">Tinjau informasi sebelum dikirim. Pada mockup ini, laporan hanya berada di perangkat dan tidak dikirim ke pemerintah.</p><dl class="review-list"><dt>Judul</dt><dd>${escapeText(draft.title)}</dd><dt>Jenis kejadian</dt><dd>${escapeText(draft.category)}</dd><dt>Lokasi</dt><dd>${Number(draft.lat).toFixed(6)}, ${Number(draft.lng).toFixed(6)}</dd><dt>Kondisi</dt><dd>${escapeText(draft.description)}</dd><dt>Bukti</dt><dd>${attachments.length ? `${attachments.length} berkas lokal` : 'Tanpa lampiran'}</dd></dl>
  <div class="attachment-list">${attachments.map(item => attachmentHtml(item)).join('')}</div><div class="form-actions" style="margin-top:24px"><button data-action="previous-step">Ubah isian</button><button class="primary" data-action="finish-review">Selesai meninjau</button></div><div id="prototype-end" class="prototype-end" hidden><h2>Pratinjau selesai</h2><p>Tidak ada laporan yang dikirim atau disimpan ke server. Tahap berikutnya pada produk adalah konfirmasi penyimpanan.</p></div>`;
}
function showList() {
  view = 'list'; render(); panel.scrollTop = listScroll; setExpanded(false);
  requestAnimationFrame(() => panel.querySelector(`[data-report="${selectedId}"]`)?.focus({preventScroll:true}));
}
function selectReport(id) {
  if (view === 'form') { notify('Selesaikan atau tutup isian sebelum membuka laporan lain.'); return; }
  if (view === 'list') listScroll = panel.scrollTop;
  selectedId = id; detailTab = 'evidence'; view = 'detail'; render(); panel.scrollTop = 0; setExpanded(true);
  centerReport(); focusTitle();
}
function centerReport() {
  const report = reports.find(item => item.id === selectedId);
  if (!map || !report) return;
  requestAnimationFrame(() => { map.resize(); map.easeTo({center:[report.lng,report.lat],zoom:15,duration:matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 400}); });
}
function startReport() {
  if (view === 'form') { focusTitle(); return; }
  returnView = {view, selectedId, detailTab};
  if (map) cameraBeforeForm = {center:map.getCenter(),zoom:map.getZoom()};
  view = 'form'; formStep = 1; formError = ''; draft = freshDraft(); render(); panel.scrollTop = 0; focusTitle();
}
function releaseAttachments() { attachments.forEach(item => URL.revokeObjectURL(item.url)); attachments = []; }
function leaveForm() {
  releaseAttachments(); pickMarker?.remove(); pickMarker = null; draft = freshDraft();
  view = returnView?.view || 'list'; selectedId = returnView?.selectedId || null; detailTab = returnView?.detailTab || 'evidence';
  render(); setExpanded(view === 'detail'); panel.scrollTop = view === 'list' ? listScroll : 0;
  if (map && cameraBeforeForm) map.jumpTo(cameraBeforeForm);
  document.querySelector('#new-report').focus();
}
function updatePickMarker() {
  if (!map || !validCoordinates()) return;
  if (!pickMarker) { const el = document.createElement('div');el.className = 'marker pick';el.innerHTML = icon('pin');pickMarker = new maplibregl.Marker({element:el}).setLngLat([Number(draft.lng),Number(draft.lat)]).addTo(map); }
  else pickMarker.setLngLat([Number(draft.lng),Number(draft.lat)]);
}
function validCoordinates() {
  return draft.lat !== '' && draft.lng !== '' && Number.isFinite(Number(draft.lat)) && Number.isFinite(Number(draft.lng)) && Math.abs(Number(draft.lat)) <= 90 && Math.abs(Number(draft.lng)) <= 180;
}
function fileError(files) {
  if (files.length > 3) return 'Pilih maksimal 3 berkas untuk pratinjau.';
  if (files.some(file => !['image/jpeg','image/png','image/webp','video/mp4','video/webm'].includes(file.type))) return 'Gunakan JPG, PNG, WebP, MP4, atau WebM.';
  if (files.some(file => file.size > 10 * 1024 * 1024)) return 'Ukuran setiap berkas maksimal 10 MB untuk pratinjau.';
  return '';
}

panel.addEventListener('click', event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.dataset.report) return selectReport(button.dataset.report);
  if (button.dataset.filter) { filter = button.dataset.filter;render();return; }
  if (button.dataset.tab) { detailTab = button.dataset.tab;render();return; }
  if (button.dataset.removeFile !== undefined) { URL.revokeObjectURL(attachments[Number(button.dataset.removeFile)].url);attachments.splice(Number(button.dataset.removeFile),1);render();return; }
  switch (button.dataset.action) {
    case 'back-list': showList(); break;
    case 'center-report': setExpanded(false);centerReport();break;
    case 'reset-filters': resetFilters();break;
    case 'close-form': if (Object.values(draft).some(Boolean) || attachments.length) document.querySelector('#leave-dialog').showModal(); else leaveForm();break;
    case 'previous-step': formStep--;formError='';render();panel.scrollTop=0;focusTitle();break;
    case 'finish-review': document.querySelector('#prototype-end').hidden=false;document.querySelector('#prototype-end').scrollIntoView({block:'nearest'});notify('Pratinjau selesai. Tidak ada laporan dikirim.');break;
  }
});
panel.addEventListener('input', event => {
  if (view === 'form' && Object.hasOwn(draft,event.target.name)) draft[event.target.name] = event.target.value;
  if (event.target.id === 'comment') comments.set(selectedId,event.target.value);
});
panel.addEventListener('change', event => {
  if (event.target.id === 'category') draft.category = event.target.value;
  if (event.target.id === 'report-media') {
    const files = Array.from(event.target.files);formError = fileError(files);
    if (!formError) { releaseAttachments();attachments = files.map(file => ({file,url:URL.createObjectURL(file)})); }
    render();
  }
  if (['lat','lng'].includes(event.target.id)) updatePickMarker();
});
let commentPreviewUrl;
panel.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.id === 'location-form') {
    formError = validCoordinates() ? '' : 'Pilih titik atau masukkan lintang dan bujur yang valid.';
    if (!formError) { updatePickMarker();formStep=2; }
    render();panel.scrollTop=0;focusTitle();
  } else if (event.target.id === 'condition-form') {
    formError = !draft.category ? 'Pilih jenis kejadian.' : !draft.title.trim() ? 'Isi judul laporan.' : !draft.description.trim() ? 'Jelaskan kondisi yang terlihat.' : '';
    if (!formError) formStep=3;
    render();panel.scrollTop=0;focusTitle();
  } else if (event.target.id === 'comment-form') {
    const text = comments.get(selectedId)?.trim() || '';
    const files = Array.from(document.querySelector('#comment-media').files);
    const error = fileError(files) || (!text ? 'Isi pengamatan sebelum membuka pratinjau.' : '');
    const errorNode = document.querySelector('#comment-error');errorNode.textContent=error;errorNode.hidden=!error;
    if (error) { document.querySelector('#comment').focus();return; }
    if (commentPreviewUrl) URL.revokeObjectURL(commentPreviewUrl);
    const preview = document.querySelector('#comment-preview');
    const attachment = files[0] ? {file:files[0],url:URL.createObjectURL(files[0])} : null;commentPreviewUrl=attachment?.url;
    preview.className='draft-preview';preview.innerHTML=`<strong>Pratinjau lokal · belum dipublikasikan</strong><p>${escapeText(text)}</p>${attachment ? `<div class="attachment-list">${attachmentHtml(attachment)}</div>` : ''}`;preview.hidden=false;preview.scrollIntoView({block:'nearest'});
  }
});
function resetFilters() { filter='all';query='';area=null;document.querySelector('#search').value='';render();fitAll(); }
document.querySelector('#new-report').addEventListener('click',startReport);
document.querySelector('#search-form').addEventListener('submit',event => {event.preventDefault();if(view==='form'){notify('Tutup isian sebelum mencari laporan.');return;}query=document.querySelector('#search').value.trim();view='list';render();setExpanded(true);});
document.querySelector('#sheet-toggle').addEventListener('click',() => setExpanded(!workspace.classList.contains('expanded')));
document.querySelector('#legend-toggle').addEventListener('click',event => {const legend=document.querySelector('#legend');legend.hidden=!legend.hidden;event.currentTarget.setAttribute('aria-expanded',String(!legend.hidden));});
document.querySelector('#all-points').addEventListener('click',() => {if(view==='form'){fitAll();return;}area=null;view='list';render();setExpanded(false);fitAll();});
document.querySelector('#search-area').addEventListener('click',() => {if(!map || view==='form')return;area=map.getBounds();view='list';render();document.querySelector('#search-area').hidden=true;setExpanded(true);});
document.querySelector('#zoom-in').addEventListener('click',() => map?.zoomIn());
document.querySelector('#zoom-out').addEventListener('click',() => map?.zoomOut());
document.querySelector('#keep-editing').addEventListener('click',() => document.querySelector('#leave-dialog').close());
document.querySelector('#discard-draft').addEventListener('click',() => {document.querySelector('#leave-dialog').close();leaveForm();});
document.addEventListener('keydown',event => {if(event.key==='Escape' && !document.querySelector('#leave-dialog').open){if(!document.querySelector('#legend').hidden){document.querySelector('#legend').hidden=true;document.querySelector('#legend-toggle').setAttribute('aria-expanded','false');}else if(view==='detail')showList();}});
function fitAll() {
  if (!map) return;
  const bounds = reports.reduce((bounds,report) => bounds.extend([report.lng,report.lat]),new maplibregl.LngLatBounds());
  map.fitBounds(bounds,{padding:{top:90,bottom:80,left:45,right:60},duration:0,maxZoom:12});
}
function initialiseMap() {
  try {
    map = new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/positron',center:[106.8456,-6.2088],zoom:10.4,pitch:0,attributionControl:true});
    map.on('load',() => {
      mapReady=true;document.querySelector('#map-message').hidden=true;
      updateMarkers();fitAll();
    });
    map.on('moveend',event=>{updateMarkers();if(event.originalEvent && view!=='form')document.querySelector('#search-area').hidden=false;});
    map.on('click',event=>{if(view!=='form'||formStep!==1)return;draft.lat=event.lngLat.lat.toFixed(6);draft.lng=event.lngLat.lng.toFixed(6);formError='';updatePickMarker();render();});
    map.on('error',()=>{if(!mapReady){document.querySelector('#map-message').textContent='Peta belum dapat dimuat. Daftar laporan tetap tersedia.';document.querySelector('#map-message').hidden=false;}});
  } catch { document.querySelector('#map-message').textContent='Peta belum tersedia pada browser ini. Gunakan daftar laporan.'; }
}
window.addEventListener('pagehide',()=>{releaseAttachments();if(commentPreviewUrl)URL.revokeObjectURL(commentPreviewUrl);map?.remove();});
render();initialiseMap();
