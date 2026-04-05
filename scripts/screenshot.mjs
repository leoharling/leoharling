import { chromium } from '/Users/lharling003/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs';
import { mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/screenshots');
mkdirSync(OUT_DIR, { recursive: true });

const BASE = 'https://leoharling.com';
const VIEWPORT = { width: 1440, height: 900 };

const shots = [
  {
    name: '1-homepage',
    url: BASE,
    wait: 4000,
    description: 'Hero globe on homepage',
  },
  {
    name: '2-space-satellites',
    url: `${BASE}/space`,
    wait: 5000,
    click: '[data-tab="satellites"], button:has-text("Satellites"), button:has-text("Constellations")',
    waitAfterClick: 4000,
    description: '3D satellite constellation visualiser',
  },
  {
    name: '3-space-launches',
    url: `${BASE}/space`,
    wait: 2500,
    click: 'button:has-text("Launch Tracker")',
    waitAfterClick: 3500,
    description: 'Launch tracker with countdowns',
  },
  {
    name: '4-geopolitics',
    url: `${BASE}/geopolitics`,
    wait: 5000,
    description: 'Conflict monitor with globe and territory overlays',
  },
  {
    name: '5-ai-infrastructure',
    url: `${BASE}/ai`,
    wait: 4000,
    click: 'button:has-text("Infrastructure")',
    waitAfterClick: 3000,
    description: 'AI data centre infrastructure map',
  },
  {
    name: '6-intel',
    url: `${BASE}/intel`,
    wait: 3000,
    description: 'Intel signal feed',
  },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  for (const shot of shots) {
    const page = await browser.newPage();
    await page.setViewportSize(VIEWPORT);

    console.log(`Capturing: ${shot.description}`);
    await page.goto(shot.url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(shot.wait);

    if (shot.click) {
      try {
        await page.locator(shot.click).first().click({ timeout: 5000 });
        await page.waitForTimeout(shot.waitAfterClick || 3000);
      } catch {
        console.log(`  Could not click tab for ${shot.name}, capturing as-is`);
      }
    }

    const path = join(OUT_DIR, `${shot.name}.png`);
    await page.screenshot({ path, fullPage: false });
    console.log(`  Saved: ${path}`);
    await page.close();
  }

  await browser.close();
  console.log(`\nDone. Screenshots in: ${OUT_DIR}`);
}

run().catch(console.error);
