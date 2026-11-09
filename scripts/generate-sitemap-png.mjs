// Todo:
// -> render sitemap HTML matching user's visual reference
// -> screenshot using Playwright to high-res PNG
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>LaporJalan - Site Map</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #FAF4EB;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111827;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 60px 40px;
    }
    .sitemap-container {
      width: 1400px;
      position: relative;
    }

    /* Header Section */
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 50px;
      position: relative;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .brand-icon {
      width: 84px;
      height: 84px;
    }
    .brand-text h1 {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: 1px;
      color: #111827;
      line-height: 1.1;
    }
    .brand-text p {
      font-size: 26px;
      font-weight: 600;
      color: #1F2937;
      margin-top: 4px;
    }

    /* Home Page Box */
    .home-box-wrapper {
      position: relative;
      width: 360px;
    }
    .home-box {
      background: #8EA1A6;
      color: #111827;
      font-size: 26px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-align: center;
      padding: 30px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.06);
    }

    /* Tree Lines from Home Page */
    .tree-connector {
      position: absolute;
      top: 100%;
      left: 50%;
      width: 2px;
      height: 50px;
      background: #111827;
    }

    /* Tree Spine Horizontal */
    .spine-bar {
      position: relative;
      width: 100%;
      height: 2px;
      background: #111827;
      margin-bottom: 50px;
    }

    /* Grid Columns */
    .columns-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 36px;
      position: relative;
    }

    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    /* Top Drop-line from horizontal spine */
    .col-drop-line {
      position: absolute;
      top: -50px;
      left: 50%;
      width: 2px;
      height: 50px;
      background: #111827;
    }

    /* Category Header Card */
    .category-card {
      width: 100%;
      background: #F6B880;
      border-radius: 14px;
      padding: 24px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      min-height: 140px;
    }
    .category-icon {
      width: 46px;
      height: 46px;
      color: #111827;
    }
    .category-title {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.8px;
      color: #111827;
      text-align: center;
    }

    /* Sub-items Stack */
    .sub-items-group {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 16px;
    }
    .sub-item-card {
      width: 100%;
      background: #F7A899;
      color: #111827;
      font-size: 17px;
      font-weight: 700;
      text-align: center;
      padding: 16px 14px;
      border-radius: 10px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.03);
    }
    .sub-line {
      width: 2px;
      height: 16px;
      background: #111827;
    }

    /* Footer Section */
    .footer-section {
      margin-top: 60px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .footer-box {
      background: #F6B880;
      color: #111827;
      font-size: 24px;
      font-weight: 800;
      padding: 26px 48px;
      border-radius: 14px;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      flex-shrink: 0;
    }
    .footer-spine {
      flex: 1;
      height: 2px;
      background: #111827;
      position: relative;
    }
    .footer-items {
      display: flex;
      justify-content: space-around;
      position: absolute;
      width: 100%;
      top: -28px;
      left: 0;
      padding-left: 40px;
    }
    .footer-item-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .footer-drop-line {
      width: 2px;
      height: 28px;
      background: #111827;
      position: absolute;
      top: 28px;
    }
    .footer-card {
      background: #CBD2BE;
      color: #111827;
      font-size: 17px;
      font-weight: 700;
      padding: 16px 32px;
      border-radius: 10px;
      box-shadow: 0 3px 8px rgba(0,0,0,0.03);
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="sitemap-container">
    
    <!-- Header Row -->
    <div class="header-row">
      <div class="brand-group">
        <!-- SVG Pin Road Icon -->
        <svg class="brand-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="6" width="56" height="52" rx="12" fill="#111827" />
          <path d="M20 16L24 48M40 16L44 48" stroke="#FAF4EB" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 6"/>
          <path d="M32 18C27.5 18 24 21.5 24 26C24 32 32 44 32 44C32 44 40 32 40 26C40 21.5 36.5 18 32 18Z" fill="#F6B880"/>
          <circle cx="32" cy="26" r="3.5" fill="#111827"/>
        </svg>
        <div class="brand-text">
          <h1>LAPORJALAN</h1>
          <p>Site Map</p>
        </div>
      </div>

      <div class="home-box-wrapper">
        <div class="home-box">HOME PAGE</div>
        <div class="tree-connector"></div>
      </div>
    </div>

    <!-- Horizontal Distribution Spine -->
    <div class="spine-bar"></div>

    <!-- 4 Columns Grid -->
    <div class="columns-grid">
      
      <!-- Col 1: ABOUT -->
      <div class="column">
        <div class="col-drop-line"></div>
        <div class="category-card">
          <!-- Info Icon -->
          <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <div class="category-title">ABOUT</div>
        </div>

        <div class="sub-items-group">
          <div class="sub-line"></div>
          <div class="sub-item-card">Alur Pelaporan</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Standar Bina Marga</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Integrasi CRM JAKI</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Statistik &amp; Metrik</div>
        </div>
      </div>

      <!-- Col 2: PETA 3D -->
      <div class="column">
        <div class="col-drop-line"></div>
        <div class="category-card">
          <!-- Map / Compass Icon -->
          <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
            <line x1="9" y1="3" x2="9" y2="18"></line>
            <line x1="15" y1="6" x2="15" y2="21"></line>
          </svg>
          <div class="category-title">PETA 3D</div>
        </div>

        <div class="sub-items-group">
          <div class="sub-line"></div>
          <div class="sub-item-card">Peta WebGL 3D (74°)</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Lapisan Kerusakan</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Arus Kemacetan</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Telemetri CCTV</div>
        </div>
      </div>

      <!-- Col 3: INSPEKSI -->
      <div class="column">
        <div class="col-drop-line"></div>
        <div class="category-card">
          <!-- Layers / Cube Box Icon -->
          <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <div class="category-title">INSPEKSI</div>
        </div>

        <div class="sub-items-group">
          <div class="sub-line"></div>
          <div class="sub-item-card">Kontur Lubang 360°</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Slider Before/After</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Skor Prioritas (UP)</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Detail Tiket CRM</div>
        </div>
      </div>

      <!-- Col 4: PELAPORAN -->
      <div class="column">
        <div class="col-drop-line"></div>
        <div class="category-card">
          <!-- Form / User Icon -->
          <svg class="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <div class="category-title">PELAPORAN</div>
        </div>

        <div class="sub-items-group">
          <div class="sub-line"></div>
          <div class="sub-item-card">Pin Lokasi GPS</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Unggah Foto/Video</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Deteksi Citra AI</div>
          <div class="sub-line"></div>
          <div class="sub-item-card">Riwayat Laporan</div>
        </div>
      </div>

    </div>

    <!-- Footer Row -->
    <div class="footer-section">
      <div class="footer-box">FOOTER</div>
      <div class="footer-spine">
        <div class="footer-items">
          <div class="footer-item-wrapper">
            <div class="footer-card">Syarat &amp; Ketentuan</div>
            <div class="footer-drop-line"></div>
          </div>
          <div class="footer-item-wrapper">
            <div class="footer-card">Kontak Dinas Bina Marga</div>
            <div class="footer-drop-line"></div>
          </div>
          <div class="footer-item-wrapper">
            <div class="footer-card">Kanal Media Sosial</div>
            <div class="footer-drop-line"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</body>
</html>`;

async function run() {
  const htmlPath = path.resolve('scripts/sitemap-preview.html');
  fs.writeFileSync(htmlPath, htmlContent);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1100 },
    deviceScaleFactor: 2
  });

  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
  
  const outputPath = path.resolve('../sitemap.png');
  await page.screenshot({ path: outputPath, fullPage: true });

  await browser.close();
  console.log('Saved PNG to:', outputPath);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
