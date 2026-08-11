const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function testDashboard() {
  const outDir = '/home/rdev/UniversityData/multiturn_chatbot/temp-files-agent/screenshots';
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log("Launching Chromium to test Dashboard...");
  const browser = await chromium.launch({
    executablePath: '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    console.log("Navigating to Login and signing in...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'salman@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    console.log("Navigating to /dashboard...");
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const screenshotPath = path.join(outDir, 'dashboard_page.png');
    await page.screenshot({ path: screenshotPath });
    console.log("Captured dashboard_page.png");

    // Also copy to artifacts dir
    const artifactPath = '/home/rdev/.gemini/antigravity-ide/brain/961d54a7-179c-47c3-8863-f50dc79b2728/dashboard_page.png';
    fs.copyFileSync(screenshotPath, artifactPath);
    console.log("Copied to artifacts dir");

    console.log("Console Errors:", consoleErrors);
  } catch (err) {
    console.error("Test Error:", err);
  } finally {
    await browser.close();
  }
}

testDashboard();
