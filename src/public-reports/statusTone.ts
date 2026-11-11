/* Todo:
-> give each report status its pastel role (DESIGN.md "Badge status"): waiting yellow, in progress blue, done green, refused pink
    -> status text comes from several sources (CRM import, admin handling, the reporter), so it is matched by words, never by exact labels
*/
export type StatusTone = 'yellow' | 'blue' | 'green' | 'pink' | 'neutral';

const RULES: [RegExp, StatusTone][] = [
  [/selesai|tuntas|diperbaiki/i, 'green'],
  [/ditolak|ditarik|batal|tidak (dapat|bisa)/i, 'pink'],
  [/proses|koordinasi|dikerjakan|pengerjaan|tindak ?lanjut|disposisi|penanganan/i, 'blue'],
  [/dilaporkan|menunggu|baru|verifikasi|diterima/i, 'yellow'],
];

// output : the tone class suffix, e.g. 'green' -> className `lj-status tone-green`
export function statusTone(status?: string | null): StatusTone {
  if (!status) return 'neutral';
  return RULES.find(([pattern]) => pattern.test(status))?.[1] ?? 'neutral';
}
export const statusClass = (status?: string | null) => `lj-status tone-${statusTone(status)}`;
