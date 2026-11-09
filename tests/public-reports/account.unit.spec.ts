/* Todo:
-> after masuk/daftar the visitor only ever lands on a path of this site
*/
import { test, expect } from '@playwright/test';
import { nextPath } from '../../src/account/nextPath';

test('lanjut accepts same-site paths and sends everything else to the account page', () => {
  expect(nextPath('/peta?buat=1')).toBe('/peta?buat=1');
  expect(nextPath('/akun')).toBe('/akun');
  for (const unsafe of [null, '', 'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)']) expect(nextPath(unsafe)).toBe('/akun');
});
