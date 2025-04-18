const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Base URL for your local server
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

// Create screenshots/ folder if it doesn't exist
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

// Get all .html files in the current directory
function getHtmlFilesInCurrentDir() {
  return fs.readdirSync(__dirname).filter(file => file.endsWith('.html'));
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Set viewport to Laptop-L
  await page.setViewport({
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
  });

  const htmlFiles = getHtmlFilesInCurrentDir();

  for (const file of htmlFiles) {
    const url = `${BASE_URL}/${file}`;
    const screenshotName = file.replace('.html', '') + '.png';
    const outputPath = path.join(SCREENSHOT_DIR, screenshotName);

    console.log(`Capturing: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, fullPage: true });
  }

  await browser.close();
})();
