const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Launching Chromium for Option 4 testing...");
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 }
  });

  try {
    // 1. Login page
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'login_page.png') });
    console.log("Captured login_page.png");

    // 2. Signup page
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'signup_page.png') });
    console.log("Captured signup_page.png");

    // 3. Reset page
    await page.goto('http://localhost:3000/reset', { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(outDir, 'reset_page.png') });
    console.log("Captured reset_page.png");

    // 4. Perform Login
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'salman@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // 5. Dashboard page
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, 'dashboard_page.png') });
    console.log("Captured dashboard_page.png");

    // 6. Analytics page
    await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle' }).catch(() => {});
    await page.screenshot({ path: path.join(outDir, 'analytics_page.png') });
    console.log("Captured analytics_page.png");

  } catch (err) {
    console.error("Error during capture:", err);
  } finally {
    await browser.close();
  }
}

capture();
