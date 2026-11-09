/* Todo:
-> where to go after masuk/daftar: a path on this site only (?lanjut=), else the account page
*/
export function nextPath(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/akun';
}
