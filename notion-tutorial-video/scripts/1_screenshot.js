// scripts/1_screenshot.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PAGES = [
  {
    id: 'founder_dashboard',
    label: '00_founder_dashboard',
    title: 'Founder Dashboard',
    url: 'https://www.notion.so/Founder-Dashboard-35160c58b29b81d3b3c7f2abb3d1ced1',
    waitFor: 3000,
    requiresLogin: true,
  },
  {
    id: 'production_calendar',
    label: '01_production_calendar',
    title: 'Production Calendar (T&A)',
    url: 'https://pine-credit-bc2.notion.site/93ed515704c24b8f862497f2d04852aa?v=6df4c86637fc4d43abfb124b9e817d29',
    waitFor: 2000,
  },
  {
    id: 'style_master',
    label: '02_style_master',
    title: 'Style Master',
    url: 'https://pine-credit-bc2.notion.site/2f0f39195eb0408ebf787527e66c746a?v=2761d212284445cbaebe79d6ce5dbee7',
    waitFor: 2000,
  },
  {
    id: 'bom',
    label: '03_bom',
    title: 'Bill of Materials (BOM)',
    url: 'https://pine-credit-bc2.notion.site/b5c6544f5f744816811da30dd1840d6d?v=07b57cf5bcde4064b268baac16a48570',
    waitFor: 2000,
  },
  {
    id: 'vendor_directory',
    label: '04_vendor_directory',
    title: 'Vendor Directory',
    url: 'https://pine-credit-bc2.notion.site/c1ae247492ba4c28b4f5aa9fbb534531?v=45703e6ba23f46f79ed4bd46d383531d',
    waitFor: 2000,
  },
  {
    id: 'landed_cost',
    label: '05_landed_cost',
    title: 'Landed Cost Sheet',
    url: 'https://pine-credit-bc2.notion.site/2fee0898494840c7bfb3b539ec3b3d69?v=0396b05d5c794377bcb22bf945443b5c',
    waitFor: 2000,
  },
  {
    id: 'sample_log',
    label: '06_sample_log',
    title: 'Sample Log',
    url: 'https://pine-credit-bc2.notion.site/d41564d934a54d0193355c4055649f13?v=573dc4e3608a48d5b59dd32510b31ddd',
    waitFor: 2000,
  },
  {
    id: 'drop_launch',
    label: '07_drop_launch',
    title: 'Drop / Launch Center',
    url: 'https://pine-credit-bc2.notion.site/5e20af549eb6443dbc6cef9d0a6a2dfd?v=a877b687943c45d699160d3d2b69a6ff',
    waitFor: 2000,
  },
  {
    id: 'drop_performance',
    label: '08_drop_performance',
    title: 'Drop Performance Tracker',
    url: 'https://pine-credit-bc2.notion.site/85933d58fbd54790b5360de14f33adae?v=b70d92dad63a4478b553f88d7d2249f2',
    waitFor: 2000,
  },
  {
    id: 'production_dashboard',
    label: '09_production_dashboard',
    title: 'Production Dashboard',
    url: 'https://pine-credit-bc2.notion.site/Production-Dashboard-35160c58b29b8174babaeaf50bf13be7',
    waitFor: 3000,
  },
];

async function loginToNotion(page) {
  const email = process.env.NOTION_EMAIL;
  const password = process.env.NOTION_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'NOTION_EMAIL and NOTION_PASSWORD must be set in .env to capture private pages'
    );
  }

  console.log('   🔐 Logging into Notion...');
  await page.goto('https://www.notion.so/login', { waitUntil: 'networkidle' });

  // Enter email
  await page.fill('input[type="email"]', email);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);

  // Enter password (shown after email step)
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to workspace
  await page.waitForURL('**/notion.so/**', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('   ✅ Logged in');
}

async function captureScreenshots() {
  const outputDir = path.join(__dirname, '../assets/screenshots');
  fs.mkdirSync(outputDir, { recursive: true });

  const hasPrivatePages = PAGES.some(p => p.requiresLogin);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  if (hasPrivatePages) {
    await loginToNotion(page);
  }

  console.log('🚀 Starting screenshot capture...\n');

  for (const screen of PAGES) {
    console.log(`📸 Capturing: ${screen.title}`);
    await page.goto(screen.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(screen.waitFor);

    // Hide Notion sidebar for cleaner screenshot
    await page.evaluate(() => {
      const sidebar = document.querySelector('.notion-sidebar-container');
      if (sidebar) sidebar.style.display = 'none';
    });

    const screenshotPath = path.join(outputDir, `${screen.label}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`   ✅ Saved: ${screen.label}.png`);
  }

  await browser.close();
  console.log('\n🎉 All screenshots captured!');
}

captureScreenshots().catch(console.error);
