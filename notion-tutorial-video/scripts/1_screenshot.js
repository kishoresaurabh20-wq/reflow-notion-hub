// scripts/1_screenshot.js
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PAGES = [
  {
    label: '00_founder_dashboard',
    title: 'Founder Dashboard',
    url: 'https://pine-credit-bc2.notion.site/Founder-Dashboard-35160c58b29b81d3b3c7f2abb3d1ced1',
    waitMs: 3000,
  },
  {
    label: '01_production_calendar',
    title: 'Production Calendar (T&A)',
    url: 'https://pine-credit-bc2.notion.site/93ed515704c24b8f862497f2d04852aa?v=6df4c86637fc4d43abfb124b9e817d29',
    waitMs: 2000,
  },
  {
    label: '02_style_master',
    title: 'Style Master',
    url: 'https://pine-credit-bc2.notion.site/2f0f39195eb0408ebf787527e66c746a?v=2761d212284445cbaebe79d6ce5dbee7',
    waitMs: 2000,
  },
  {
    label: '03_bom',
    title: 'Bill of Materials (BOM)',
    url: 'https://pine-credit-bc2.notion.site/b5c6544f5f744816811da30dd1840d6d?v=07b57cf5bcde4064b268baac16a48570',
    waitMs: 2000,
  },
  {
    label: '04_vendor_directory',
    title: 'Vendor Directory',
    url: 'https://pine-credit-bc2.notion.site/c1ae247492ba4c28b4f5aa9fbb534531?v=45703e6ba23f46f79ed4bd46d383531d',
    waitMs: 2000,
  },
  {
    label: '05_landed_cost',
    title: 'Landed Cost Sheet',
    url: 'https://pine-credit-bc2.notion.site/2fee0898494840c7bfb3b539ec3b3d69?v=0396b05d5c794377bcb22bf945443b5c',
    waitMs: 2000,
  },
  {
    label: '06_sample_log',
    title: 'Sample Log',
    url: 'https://pine-credit-bc2.notion.site/d41564d934a54d0193355c4055649f13?v=573dc4e3608a48d5b59dd32510b31ddd',
    waitMs: 2000,
  },
  {
    label: '07_drop_launch',
    title: 'Drop / Launch Center',
    url: 'https://pine-credit-bc2.notion.site/5e20af549eb6443dbc6cef9d0a6a2dfd?v=a877b687943c45d699160d3d2b69a6ff',
    waitMs: 2000,
  },
  {
    label: '08_drop_performance',
    title: 'Drop Performance Tracker',
    url: 'https://pine-credit-bc2.notion.site/85933d58fbd54790b5360de14f33adae?v=b70d92dad63a4478b553f88d7d2249f2',
    waitMs: 2000,
  },
  {
    label: '09_production_dashboard',
    title: 'Production Dashboard',
    url: 'https://pine-credit-bc2.notion.site/Production-Dashboard-35160c58b29b8174babaeaf50bf13be7',
    waitMs: 3000,
  },
];

async function captureScreenshots() {
  const outputDir = path.join(__dirname, '../assets/screenshots');
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('🚀 Starting screenshot capture...\n');

  for (const screen of PAGES) {
    console.log(`📸 Capturing: ${screen.title}`);
    await page.goto(screen.url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, screen.waitMs));

    // Hide Notion sidebar for cleaner screenshot
    await page.evaluate(() => {
      const sidebar = document.querySelector('.notion-sidebar-container');
      if (sidebar) sidebar.style.display = 'none';
    });

    const screenshotPath = path.join(outputDir, `${screen.label}.png`);
    await page.screenshot({ path: screenshotPath });
    console.log(`   ✅ Saved: ${screen.label}.png`);
  }

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
}

captureScreenshots().catch(console.error);
