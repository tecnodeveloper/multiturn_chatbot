const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const option1_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100" fill="none">
  <rect x="2" y="2" width="44" height="44" rx="12" stroke="#3B82F6" stroke-width="3.5"/>
  <g transform="translate(4.5 12.5) scale(0.62)" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 36V22a7 7 0 0 1 14 0v14"/>
    <path d="M22 22a7 7 0 0 1 14 0v14"/>
    <path d="M48 12v24"/>
    <path d="M42 30h12"/>
  </g>
</svg>`;

const option2_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100" fill="none">
  <defs>
    <linearGradient id="stroke-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#60A5FA"/>
      <stop offset="100%" stop-color="#A855F7"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="44" height="44" rx="12" stroke="url(#stroke-grad)" stroke-width="3.5"/>
  <g transform="translate(4.5 12.5) scale(0.62)" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 36V22a7 7 0 0 1 14 0v14"/>
    <path d="M22 22a7 7 0 0 1 14 0v14"/>
    <path d="M48 12v24"/>
    <path d="M42 30h12"/>
  </g>
</svg>`;

const option3_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="100" height="100" fill="none">
  <rect x="2" y="2" width="44" height="44" rx="12" stroke="#60A5FA" stroke-width="3"/>
  <g transform="translate(4.5 12.5) scale(0.62)" stroke="#60A5FA" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 36V22a7 7 0 0 1 14 0v14"/>
    <path d="M22 22a7 7 0 0 1 14 0v14"/>
    <path d="M48 12v24"/>
    <path d="M42 30h12"/>
  </g>
</svg>`;

const option4_svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 62 48" width="120" height="100" fill="none">
  <g transform="translate(0, 0)" stroke="#3B82F6" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 36V22a7 7 0 0 1 14 0v14"/>
    <path d="M22 22a7 7 0 0 1 14 0v14"/>
    <path d="M48 12v24"/>
    <path d="M42 30h12"/>
  </g>
</svg>`;

async function renderPreviews() {
  const artifactDir = '/home/rdev/.gemini/antigravity-ide/brain/961d54a7-179c-47c3-8863-f50dc79b2728/';
  
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1000, height: 420 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          background-color: #09090b;
          color: white;
          font-family: system-ui, sans-serif;
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          height: 100vh;
          margin: 0;
          padding: 10px;
        }
        .box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          border: 1px solid #27272a;
          border-radius: 16px;
          background: #141417;
          width: 200px;
          height: 260px;
          text-align: center;
        }
        .title {
          font-size: 13px;
          font-weight: 600;
          color: #9ca3af;
        }
        .highlight {
          color: #60a5fa;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 4px;
        }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="highlight">Option 1</div>
        <div class="title">Blue Tile Outline + White MT</div>
        ${option1_svg}
      </div>
      <div class="box">
        <div class="highlight">Option 2</div>
        <div class="title">Gradient Stroke + White MT</div>
        ${option2_svg}
      </div>
      <div class="box">
        <div class="highlight">Option 3</div>
        <div class="title">Monochrome Cyan Outline</div>
        ${option3_svg}
      </div>
      <div class="box">
        <div class="highlight">Option 4</div>
        <div class="title">Mark Only (No Outer Tile)</div>
        ${option4_svg}
      </div>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.screenshot({ path: path.join(artifactDir, 'logo_outline_options_preview.png') });
  console.log("Rendered updated logo_outline_options_preview.png");

  await browser.close();
}

renderPreviews();
