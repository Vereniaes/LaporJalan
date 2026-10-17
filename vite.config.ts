/* Build the frontend with an explicit production API address.
Todo:
-> prevent deployments that still call localhost
*/
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const value = loadEnv(mode, process.cwd(), 'VITE_').VITE_API_URL;
    let url: URL;
    try { url = new URL(value); } catch { throw new Error('Set VITE_API_URL to the HTTPS backend origin before building.'); }
    if (url.protocol !== 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1' ||
      url.username || url.password || url.search || url.hash || url.pathname !== '/') {
      throw new Error('VITE_API_URL must be an HTTPS backend origin, without /api, credentials or query parameters.');
    }
  }
  return {
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  }
  };
});
