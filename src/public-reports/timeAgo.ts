/* Todo:
-> short relative time for the report list (owner, 11 Nov: fewer words): "baru", "12 mnt", "3 jam", "2 hr", then the date
*/
export function timeAgo(value: string, now = Date.now()) {
  const minutes = Math.round((now - Date.parse(value)) / 60_000);
  if (!Number.isFinite(minutes)) return '';
  if (minutes < 1) return 'baru';
  if (minutes < 60) return `${minutes} mnt`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} jam`;
  if (minutes < 7 * 24 * 60) return `${Math.round(minutes / 1440)} hr`;
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value));
}
